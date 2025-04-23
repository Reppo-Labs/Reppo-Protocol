import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const name = 'Reppo Genesis';
const symbol = 'REPPOG';

const NFTModule = buildModule("NFTModule", (m) => {
  const nft = m.contract("NFT", [owner, name, symbol], {});
  return { nft };
});

export default NFTModule;

// 0x1ee88697274DE93af153f15AD6d8d9948f7E9E98
// npx hardhat ignition deploy ignition/modules/NFT.ts --network base-sepolia --deployment-id nft-base-sepolia-v3
// npx hardhat ignition verify nft-base-sepolia-v3
