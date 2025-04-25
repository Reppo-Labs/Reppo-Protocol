import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const name = "Standard Solver Nodes";
const symbol = "SOLVERSTD";
const currentMintTokenId = 1;
const mintCapId = 15000;
const currentClaimTokenId = 15001;
const claimsCapId = 15650;
const metadataBaseURI = "https://ipfs.io/ipfs/bafybeihohc3bnqlrk3cr637tylmfeeb4rxfc3fmul3o2way57targ62rri/";
const mintFee = hre.ethers.parseEther("0.000002");
const discountedMintFee = hre.ethers.parseEther("0.000001");
const transferEnabledAfter = 	1747786226;
const genesisCollection = "0x1ee88697274DE93af153f15AD6d8d9948f7E9E98";
const whitelistCollection: `0x${string}`[] = [];

const standardSolverNodes = buildModule("StandardSolverNodesModule", (m) => {
  const standardSolverNodes = m.contract("SolverNodes", [
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
  return { standardSolverNodes };
});

export default standardSolverNodes;

// 0xCbA6e4F38A5a06b03dD4aD29Ab6B43CFe05250e0
// npx hardhat ignition deploy ignition/modules/StandardSolverNodes.ts --network base-sepolia --deployment-id standard-solver-nodes-v1
// npx hardhat ignition verify standard-solver-nodes-v1
