const hre = require("hardhat");
const { networkConfig } = require("../config.ts");

const SUBSCRIPTION_ID = "234";
const CONSUMER_CONTRACT = "0x20667FD20E929E4857d1AF84AC1626e61a74c1E9";

async function main() {
  const functionsBillingRegistryProxy = networkConfig[hre.network.name]["functionsBillingRegistryProxy"];

  // Instantiate Registry
  const RegistryFactory = await hre.ethers.getContractFactory(
    "contracts/dev/functions/FunctionsBillingRegistry.sol:FunctionsBillingRegistry"
  );
  const registry = await RegistryFactory.attach(functionsBillingRegistryProxy);

  // Autorize consumer contract to use new subscription
  console.log(`Adding consumer contract address ${CONSUMER_CONTRACT} to subscription ${SUBSCRIPTION_ID}`);
  const addTx = await registry.addConsumer(SUBSCRIPTION_ID, CONSUMER_CONTRACT);
  await addTx.wait(1);
  console.log(`Authorized consumer contract: ${CONSUMER_CONTRACT}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export {};
