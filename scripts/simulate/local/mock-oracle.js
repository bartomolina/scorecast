const { networkConfig } = require("../../../config.ts");

const deployMockOracle = async () => {
  // Deploy a mock LINK token contract
  const linkTokenFactory = await hre.ethers.getContractFactory("LinkToken");
  const linkToken = await linkTokenFactory.deploy();
  const linkEthFeedAddress = "0x12162c3E810393dEC01362aBf156D7ecf6159528";
  
  // Deploy proxy admin
  await hre.upgrades.deployProxyAdmin();
  // Deploy the oracle contract
  const oracleFactory = await hre.ethers.getContractFactory("contracts/dev/functions/FunctionsOracle.sol:FunctionsOracle");
  const oracleProxy = await hre.upgrades.deployProxy(oracleFactory, [], {
    kind: "transparent",
  });
  await oracleProxy.deployTransaction.wait(1);
  // Set the secrets encryption public DON key in the mock oracle contract
  await oracleProxy.setDONPublicKey("0x" + networkConfig["hardhat"]["functionsPublicKey"]);

  // Deploy the mock registry billing contract
  const registryFactory = await hre.ethers.getContractFactory(
    "contracts/dev/functions/FunctionsBillingRegistry.sol:FunctionsBillingRegistry"
  );
  const registryProxy = await hre.upgrades.deployProxy(
    registryFactory,
    [linkToken.address, linkEthFeedAddress, oracleProxy.address],
    {
      kind: "transparent",
    }
  );
  await registryProxy.deployTransaction.wait(1);
  // Set registry configuration
  const config = {
    maxGasLimit: 300_000,
    stalenessSeconds: 86_400,
    gasAfterPaymentCalculation: 39_173,
    weiPerUnitLink: hre.ethers.BigNumber.from("5000000000000000"),
    gasOverhead: 519_719,
    requestTimeoutSeconds: 300,
  };
  await registryProxy.setConfig(
    config.maxGasLimit,
    config.stalenessSeconds,
    config.gasAfterPaymentCalculation,
    config.weiPerUnitLink,
    config.gasOverhead,
    config.requestTimeoutSeconds
  );

  // Set the current account as an authorized sender in the mock registry to allow for simulated local fulfillments
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  await registryProxy.setAuthorizedSenders([oracleProxy.address, deployer.address]);
  await oracleProxy.setRegistry(registryProxy.address);
  await oracleProxy.addAuthorizedSenders([deployer.address]);
  return { oracle: oracleProxy, registry: registryProxy, linkToken };
};

module.exports = deployMockOracle;
