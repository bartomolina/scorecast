require("dotenv").config()

const config = {
  script: "api-football.js",
  args: ["541", "2022", "2023-02-18"],
  secrets: { rapidapikey: process.env.RAPIDAPI_KEY },
  walletPrivateKey: process.env.PRIVATE_KEY,
  // script: "test-script.js",
  // args: ["ETH", "USD"],
}

const networkConfig = {
  hardhat: {
    functionsPublicKey:
      "971f006163a12ee3383a00d7743334480d6b1c83fdf60497e0c520b16d1a4ee421cc61375679b63466156fee6f2f1da5a7e630ba0b1cddb2704ef907ead223db",
  },
  mumbai: {
    linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    functionsOracleProxy: "0xeA6721aC65BCeD841B8ec3fc5fEdeA6141a0aDE4",
    functionsBillingRegistryProxy: "0xEe9Bf52E5Ea228404bB54BCFbbDa8c21131b9039",
  },
};

module.exports = {
  networkConfig,
  config,
};
