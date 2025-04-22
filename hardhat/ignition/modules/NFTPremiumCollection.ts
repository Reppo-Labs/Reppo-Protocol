import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const transferEnabledAfter = 	1747786226;

const NFTPremiumCollectionModule = buildModule("NFTPremiumCollectionModule", (m) => {
  const nftPremiumCollection = m.contract("NFTPremiumCollection", [owner, transferEnabledAfter], {});
  return { nftPremiumCollection };
});

export default NFTPremiumCollectionModule;

// 0xb854840CFcE348b79Aab37b506e1092b4F5D7d7F
// npx hardhat ignition deploy ignition/modules/NFTPremiumCollection.ts --network base-sepolia --deployment-id nft-premium-collection-base-sepolia-v3
// npx hardhat ignition verify nft-premium-collection-base-sepolia-v3
