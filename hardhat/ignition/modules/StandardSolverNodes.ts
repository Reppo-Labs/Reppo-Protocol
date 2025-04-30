import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const name = "Standard Solver Nodes";
const symbol = "SOLVERSTD";
const metadataBaseURI = "https://ipfs.io/ipfs/bafybeihohc3bnqlrk3cr637tylmfeeb4rxfc3fmul3o2way57targ62rri/";
const mintFee = hre.ethers.parseEther("0.000002");
const discountedMintFee = hre.ethers.parseEther("0.000001");
const transferEnabledAfter = 	1747786226;
const ghibiliCollection = '0x391A6EF1FA51A13a4664CDC556d5EbAaE9C96EF4';
const anomadantCollection = '0x391A6EF1FA51A13a4664CDC556d5EbAaE9C96EF4';
const johnnyTrainerCrewCollection = '0x391A6EF1FA51A13a4664CDC556d5EbAaE9C96EF4';
const johnnyCollection = '0x391A6EF1FA51A13a4664CDC556d5EbAaE9C96EF4';
const whitelistCollection: `0x${string}`[] = [];

const standardSolverNodes = buildModule("StandardSolverNodesModule", (m) => {
  const standardSolverNodes = m.contract("SolverNodesStandard", [
    name,
    symbol,
    owner,
    metadataBaseURI,
    mintFee,
    discountedMintFee,
    transferEnabledAfter,
    ghibiliCollection,
    anomadantCollection,
    johnnyTrainerCrewCollection,
    johnnyCollection,
    whitelistCollection,
  ], {});
  return { standardSolverNodes };
});

export default standardSolverNodes;

// 0x2A6C9bB240CC4ae3ad543ab48ba48BD8dFBe7Eb3
// npx hardhat ignition deploy ignition/modules/StandardSolverNodes.ts --network base-sepolia --deployment-id standard-solver-nodes-v1
// npx hardhat ignition verify standard-solver-nodes-v1
