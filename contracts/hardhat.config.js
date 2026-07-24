require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const FUJI_RPC_URL = process.env.AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
const SNOWTRACE_API_KEY = process.env.SNOWTRACE_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true
    },
    fuji: {
      url: FUJI_RPC_URL,
      chainId: 43113,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gasPrice: "auto",
      timeout: 120000
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: {
      fuji: SNOWTRACE_API_KEY
    },
    customChains: [
      {
        network: "fuji",
        chainId: 43113,
        urls: {
          apiURL: "https://api-testnet.snowtrace.io/api",
          browserURL: "https://testnet.snowtrace.io"
        }
      }
    ]
  },
  sourcify: {
    enabled: true
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  typechain: {
    outDir: "./typechain",
    target: "ethers-v6"
  }
};