import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { premiumCollectionMetadataBaseURI } from "../../constants/nftCollection";
import hre from "hardhat";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const name = "Reppo Premium";
const symbol = "REPPOP";
const currentMintTokenId = 1;
const mintCapId = 10;
const currentClaimTokenId = 11;
const claimsCapId = 15;
const metadataBaseURI = premiumCollectionMetadataBaseURI;
const mintFee = hre.ethers.parseEther("0.00002");
const discountedMintFee = hre.ethers.parseEther("0.00001");
const transferEnabledAfter = 	1747786226;
const genesisCollection = "0x4a3bAB10eD2eD2Ec7f740A4a36dEC89D3a4bd63c";

const NFTPremiumCollectionModule = buildModule("NFTPremiumCollectionModule", (m) => {
  const nftPremiumCollection = m.contract("NFTPremiumCollection", [
    name,
    symbol,
    owner,
    genesisCollection,
    currentMintTokenId,
    mintCapId,
    currentClaimTokenId,
    claimsCapId,
    metadataBaseURI,
    mintFee,
    discountedMintFee,
    transferEnabledAfter
  ], {});
  return { nftPremiumCollection };
});

export default NFTPremiumCollectionModule;

// 0xccE71c3995d7b0631d305A5bc9aEC9697283F54d
// npx hardhat ignition deploy ignition/modules/NFTPremiumCollection.ts --network base-sepolia --deployment-id nft-premium-collection-base-sepolia-v5
// npx hardhat ignition verify nft-premium-collection-base-sepolia-v5
