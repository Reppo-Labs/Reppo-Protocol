import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const name = "Premium Solver Nodes";
const symbol = "REPPO";
const metadataBaseURI = "https://ipfs.io/ipfs/bafybeiabudzmdhxeftmhffi4osoinyl2xxdnffdeovvpnn4glvnlznedxy/";
// const mintFee = hre.ethers.parseEther("0.17");
// const discountedMintFee = hre.ethers.parseEther("0.15");
const mintFee = hre.ethers.parseEther("0.00002");
const discountedMintFee = hre.ethers.parseEther("0.00001");
const transferEnabledAfter = 	1759881600;
const claimableCollection = "0xc152f9ef7ee4d9998dd8fef48de819641ad12f03";
const whitelist:`0x${string}`[] = [];
const transferAllowedToWhitelist:`0x${string}`[] = [];

const premiumSolverNodes = buildModule("PremiumSolverNodesModule", (m) => {
  const premiumSolverNodes = m.contract("PremiumSolverNodes", [
    name,
    symbol,
    owner,
    claimableCollection,
    metadataBaseURI,
    mintFee,
    discountedMintFee,
    transferEnabledAfter,
    whitelist,
    transferAllowedToWhitelist,
  ], {});
  return { premiumSolverNodes };
});

export default premiumSolverNodes;

// 0x1a245cfA2515089017792D92E9d68B8F8b3691eE
// npx hardhat ignition deploy ignition/modules/PremiumSolverNodes.ts --network base --deployment-id premium-solver-nodes-v1
// npx hardhat ignition verify premium-solver-nodes-v1

// 0xC262f1670CEdaD668A057D17b3aA5a360efd5c2C
// npx hardhat ignition deploy ignition/modules/PremiumSolverNodes.ts --network base-sepolia --deployment-id premium-solver-nodes-v1
// npx hardhat ignition verify premium-solver-nodes-v1
