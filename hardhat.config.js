require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// Handle private key correctly by removing 0x prefix if it exists
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0000000000000000000000000000000000000000000000000000000000000000";
const FORMATTED_PRIVATE_KEY = PRIVATE_KEY.startsWith("0x")
  ? PRIVATE_KEY.substring(2)
  : PRIVATE_KEY;
const SEI_TESTNET_RPC_URL =
  process.env.SEI_TESTNET_RPC_URL || "https://evm-rpc-testnet.sei-apis.com";

module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sei_testnet: {
      url: SEI_TESTNET_RPC_URL,
      accounts: [FORMATTED_PRIVATE_KEY],
      chainId: 1328,
    },
  },
  paths: {
    artifacts: "./frontend/src/artifacts",
  },
};
