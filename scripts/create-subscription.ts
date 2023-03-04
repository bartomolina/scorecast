const hre = require("hardhat");
const { networkConfig } = require("../network-config.ts");

const LINK_FUNDING_AMOUNT = "1";

async function main() {
  const linkTokenAddress = networkConfig[hre.network.name]["linkToken"];
  const functionsBillingRegistryProxy = networkConfig[hre.network.name]["functionsBillingRegistryProxy"];

  // Instantiate Registry
  const RegistryFactory = await hre.ethers.getContractFactory(
    "contracts/dev/functions/FunctionsBillingRegistry.sol:FunctionsBillingRegistry"
  );
  const registry = await RegistryFactory.attach(functionsBillingRegistryProxy);

  // Create the subscription
  const createSubscriptionTx = await registry.createSubscription();
  const createSubscriptionReceipt = await createSubscriptionTx.wait(1);
  const subscriptionId = createSubscriptionReceipt.events[0].args["subscriptionId"].toNumber();
  console.log(`Subscription created with ID: ${subscriptionId}`);

  // Fund the subscription
  const juelsAmount = hre.ethers.utils.parseUnits(LINK_FUNDING_AMOUNT);
  const LinkTokenFactory = await hre.ethers.getContractFactory("LinkToken");
  const linkToken = await LinkTokenFactory.attach(linkTokenAddress);
  console.log(`Funding with ` + juelsAmount + ` Juels (1 LINK = 10^18 Juels)`);
  const fundTx = await linkToken.transferAndCall(
    functionsBillingRegistryProxy,
    juelsAmount,
    hre.ethers.utils.defaultAbiCoder.encode(["uint64"], [subscriptionId])
  );
  await fundTx.wait(1);
  console.log(`Subscription ${subscriptionId} funded with ${juelsAmount} Juels (1 LINK = 10^18 Juels)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export {};
