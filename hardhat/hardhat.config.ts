import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY as string;
const WALLET_KEY = process.env.WALLET_KEY as string;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    'base-mainnet': {
      url: 'https://mainnet.base.org',
      accounts: [WALLET_KEY],
      gasPrice: 1000000000,
    },
    'base-sepolia': {
      url: 'https://sepolia.base.org',
      // url: process.env.BASE_TESTNET_RPC_URL,
      accounts: [WALLET_KEY],
      gasPrice: 1000000000,
    },
    'base-local': {
      url: 'http://localhost:8545',
      accounts: [WALLET_KEY],
      gasPrice: 1000000000,
    },
    'story-testnet': {
      url: 'https://rpc.odyssey.storyrpc.io',
      accounts: [WALLET_KEY],
      gasPrice: 1000000000,
    },
  },
  defaultNetwork: 'hardhat',
  etherscan: {
    apiKey: {
      "base-sepolia": BASESCAN_API_KEY,
      "base": BASESCAN_API_KEY,
      "story-testnet": BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      },
      {
        network: "base",
        chainId: 1,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "story-testnet",
        chainId: 1516,
        urls: {
          apiURL: "https://odyssey.storyscan.xyz/api",
          browserURL: "https://odyssey.storyscan.xyz"
        }
      }
    ]
  },
  sourcify: {
    enabled: true
  },
};

export default config;
