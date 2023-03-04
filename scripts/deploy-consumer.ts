const hre = require("hardhat");
const { networkConfig } = require("../network-config.ts");

const CONSUMER_CONTRACT_NAME = "FunctionsConsumer";

async function main() {
  const consumerContract = await hre.ethers.getContractFactory(CONSUMER_CONTRACT_NAME);
  const deployedContract = await consumerContract.deploy(networkConfig[hre.network.name]["functionsOracleProxy"]);
  console.log("Deployed Functions Consumer address:", deployedContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export {};
