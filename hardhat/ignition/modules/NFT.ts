import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const name = 'Reppo Premium';
const symbol = 'REPP';

const NFTModule = buildModule("NFTModule", (m) => {
  const nft = m.contract("NFT", [owner, name, symbol], {});
  return { nft };
});

export default NFTModule;

// 0xc6c06a48Ae03819e71bf4bfDA7bd24141BCce31B
// npx hardhat ignition deploy ignition/modules/NFT.ts --network base-sepolia --deployment-id nft-base-sepolia-v1
// npx hardhat ignition verify nft-base-sepolia-v1
