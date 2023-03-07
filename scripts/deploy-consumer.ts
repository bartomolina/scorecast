const hre = require("hardhat");
const { networkConfig } = require("../config.ts");
const fs = require("fs");

const CONSUMER_CONTRACT_NAME = "ScoreCast";

async function main() {
  const consumerContract = await hre.ethers.getContractFactory(CONSUMER_CONTRACT_NAME);
  const deployedContract = await consumerContract.deploy(networkConfig[hre.network.name]["functionsOracleProxy"]);
  console.log("Deployed Functions Consumer address:", deployedContract.address);

  const consumerContractData = {
    address: deployedContract.address,
    abi: deployedContract.interface.format("json"),
  };

  fs.writeFileSync("./app/lib/contracts/consumer-contract.json", JSON.stringify(consumerContractData));

  await deployedContract.deployTransaction.wait(4);
  await hre.run("verify:verify", {
    address: deployedContract.address,
    constructorArguments: [networkConfig[hre.network.name]["functionsOracleProxy"]],
  })
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export {};
