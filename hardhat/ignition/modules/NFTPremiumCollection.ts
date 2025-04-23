import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { premiumCollectionMetadataBaseURI } from "../../constants/nftCollection";
import hre from "hardhat";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const name = "Reppo Premium";
const symbol = "REPPOP";
const currentMintTokenId = 1;
const mintCapId = 20;
const currentClaimTokenId = 21;
const claimsCapId = 35;
const metadataBaseURI = premiumCollectionMetadataBaseURI;
const mintFee = hre.ethers.parseEther("0.00002");
const discountedMintFee = hre.ethers.parseEther("0.00001");
const transferEnabledAfter = 	1747786226;
const genesisCollection = "0x1ee88697274DE93af153f15AD6d8d9948f7E9E98";

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

// 0x362abd6245097f7d6eCdf74563Cb92bb8a2C18A2
// npx hardhat ignition deploy ignition/modules/NFTPremiumCollection.ts --network base-sepolia --deployment-id nft-premium-collection-base-sepolia-v6
// npx hardhat ignition verify nft-premium-collection-base-sepolia-v6
