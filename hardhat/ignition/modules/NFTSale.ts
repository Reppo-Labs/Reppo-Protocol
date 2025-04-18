import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';

const NFTSaleModule = buildModule("NFTSaleModule", (m) => {
  const nftSale = m.contract("NFTSale", [owner], {});
  return { nftSale };
});

export default NFTSaleModule;

// 0x2f6bC0Ea4ee74975fe3006E2C6D1665A04680042
// npx hardhat ignition deploy ignition/modules/NFTSale.ts --network base-sepolia --deployment-id nft-sale-base-sepolia-v2
// npx hardhat ignition verify nft-sale-base-sepolia-v2
