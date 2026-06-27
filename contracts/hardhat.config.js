require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  paths: {
    sources: "./src",
    tests: "./test",
    artifacts: "./artifacts",
    cache: "./cache",
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    amoy: {
      url: process.env.AMOY_RPC || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    polygon: {
      url: process.env.POLYGON_RPC || "https://polygon-rpc.com/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-v2.etherscan.io/v2/api/polygon-amoy",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
      {
        network: "polygon",
        chainId: 137,
        urls: {
          apiURL: "https://api-v2.etherscan.io/v2/api/polygon",
          browserURL: "https://polygonscan.com",
        },
      },
    ],
  },
};
