require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, EDUCHAIN_RPC_URL, ETHERSCAN_API_KEY } = process.env;

if (!PRIVATE_KEY || !EDUCHAIN_RPC_URL) {
  throw new Error("❌ Missing PRIVATE_KEY or EDUCHAIN_RPC_URL in .env file!");
}

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    educhain: {
      url: EDUCHAIN_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 656476, // EduChain Testnet Chain ID
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || "", // Optional if EduChain supports verification
  },
};
