import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const name = "Reppo Premium";
const symbol = "REPPOP";
const currentMintTokenId = 1;
const mintCapId = 5000;
const currentClaimTokenId = 5001;
const claimsCapId = 5550;
const metadataBaseURI = "https://ipfs.io/ipfs/bafybeiabudzmdhxeftmhffi4osoinyl2xxdnffdeovvpnn4glvnlznedxy/";
const mintFee = hre.ethers.parseEther("0.00002");
const discountedMintFee = hre.ethers.parseEther("0.00001");
const transferEnabledAfter = 	1747786226;
const genesisCollection = "0x1ee88697274DE93af153f15AD6d8d9948f7E9E98";
const whitelistCollection: `0x${string}`[] = [];

const premiumSolverNodes = buildModule("PremiumSolverNodesModule", (m) => {
  const premiumSolverNodes = m.contract("SolverNodes", [
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
    transferEnabledAfter,
    whitelistCollection,
  ], {});
  return { premiumSolverNodes };
});

export default premiumSolverNodes;

// 0x391A6EF1FA51A13a4664CDC556d5EbAaE9C96EF4
// npx hardhat ignition deploy ignition/modules/PremiumSolverNodes.ts --network base-sepolia --deployment-id premium-solver-nodes-v1
// npx hardhat ignition verify premium-solver-nodes-v1
