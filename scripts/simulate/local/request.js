const hre = require("hardhat");
const deployMockOracle = require("./mock-oracle");
const evaluate = require("./sandbox")
const EthCrypto = require('eth-crypto');

const CONSUMER_CONTRACT_NAME = "FunctionsConsumer";
const GAS_LIMIT = 100000;

async function main() {
  // Deploy a mock oracle & registry contract to simulate a fulfillment
  const { oracle, registry, linkToken } = await deployMockOracle();

  // Deploy the client contract
  const clientFactory = await hre.ethers.getContractFactory(CONSUMER_CONTRACT_NAME);
  const client = await clientFactory.deploy(oracle.address);
  await client.deployTransaction.wait(1);

  // Create & fund a subscription
  const createSubscriptionTx = await registry.createSubscription();
  const createSubscriptionReceipt = await createSubscriptionTx.wait(1);
  const subscriptionId = createSubscriptionReceipt.events[0].args["subscriptionId"].toNumber();
  const juelsAmount = hre.ethers.utils.parseUnits("10");
  await linkToken.transferAndCall(
    registry.address,
    juelsAmount,
    hre.ethers.utils.defaultAbiCoder.encode(["uint64"], [subscriptionId])
  );
  // Authorize the client contract to use the subscription
  await registry.addConsumer(subscriptionId, client.address);

  console.log("Created subscription ID: ", subscriptionId);

  // Build the parameters to make a request from the client contract
  const requestConfig = require("./request-config.js");




  // Fetch the mock DON public key
  const DONPublicKey = await oracle.getDONPublicKey();
  // Remove the preceding 0x from the DON public key
  requestConfig.DONPublicKey = DONPublicKey.slice(2);

  // Build secrets
  const signature = EthCrypto.default.sign(requestConfig.walletPrivateKey, EthCrypto.default.hash.keccak256(JSON.stringify(requestConfig.secrets)))
  const payload = {
    message: JSON.stringify(config.secrets),
    signature,
  };
  const encrypted = await EthCrypto.default.encryptWithPublicKey(requestConfig.DONPublicKey, JSON.stringify(payload));
  const encryptedSecrets = "0x" + EthCrypto.default.cipher.stringify(encrypted);

  // Make a request to the Oracle & simulate a fulfillment
  await new Promise(async (resolve) => {
    // Initiate the request from the client contract
    // REMOVE: needed? we have client already
    const clientContract = await clientFactory.attach(client.address);
    const requestTx = await clientContract.executeRequest(
      requestConfig.source,
      encryptedSecrets ?? [],
      requestConfig.secretsLocation,
      requestConfig.args ?? [],
      subscriptionId,
      GAS_LIMIT
    );
    const requestTxReceipt = await requestTx.wait(1);
    const requestId = requestTxReceipt.events[2].args.id;
    const requestGasUsed = requestTxReceipt.gasUsed.toString();

    // Simulating the JavaScript code locally
    console.log("\nExecuting JavaScript request source code locally...");
    const output = await evaluate(requestConfig.source, requestConfig.args, requestConfig.secrets)
    console.log(`\n${output}`)
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
