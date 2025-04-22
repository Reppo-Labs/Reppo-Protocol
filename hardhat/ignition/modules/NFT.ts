import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const name = 'Reppo Genesis';
const symbol = 'REPPOG';

const NFTModule = buildModule("NFTModule", (m) => {
  const nft = m.contract("NFT", [owner, name, symbol], {});
  return { nft };
});

export default NFTModule;

// 0x4a3bAB10eD2eD2Ec7f740A4a36dEC89D3a4bd63c
// npx hardhat ignition deploy ignition/modules/NFT.ts --network base-sepolia --deployment-id nft-base-sepolia-v2
// npx hardhat ignition verify nft-base-sepolia-v2
