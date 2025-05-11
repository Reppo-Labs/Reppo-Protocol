import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

const owner = '0x3650752d4DDe21C6Ed7Df6d4840E15dE48e25481';
const name = "Standard Solver Nodes";
const symbol = "REPPO";
const metadataBaseURI = "https://ipfs.io/ipfs/bafybeihohc3bnqlrk3cr637tylmfeeb4rxfc3fmul3o2way57targ62rri/";
// const mintFee = hre.ethers.parseEther("0.08");
// const discountedMintFee = hre.ethers.parseEther("0.07");
const mintFee = hre.ethers.parseEther("0.000002");
const discountedMintFee = hre.ethers.parseEther("0.000001");
const transferEnabledAfter = 1759881600;
const ghibiliCollection = '0x39f5d8675c137119930e6b590c712f99e0216ef5';
const anomadantCollection = '0xc2d0582fbac5c27fe87010963c88f3c96dcbaefc';
const johnnyTrainerCrewCollection = '0x3568b6b255f44ed242370e5b3e88bc0181aa54f7';
const johnnyCollection = '0xeb9d09170d33305a9de5a325a3dc889dfc22d50a';
const whitelist:`0x${string}`[] = [];
const transferAllowedToWhitelist:`0x${string}`[] = [];

const standardSolverNodes = buildModule("StandardSolverNodesModule", (m) => {
  const standardSolverNodes = m.contract("StandardSolverNodes", [
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
    whitelist,
    transferAllowedToWhitelist,
  ], {});
  return { standardSolverNodes };
});

export default standardSolverNodes;

/**  
base
0x8A1BCBd935c9c7350013786D5d1118832F10e149
npx hardhat ignition deploy ignition/modules/StandardSolverNodes.ts --network base --deployment-id standard-solver-nodes-v1
npx hardhat ignition verify standard-solver-nodes-v1
*/

/**  
base-sepolia
0x510119f9F26D3CA812F3ed630cab9B739003a6c1
npx hardhat ignition deploy ignition/modules/StandardSolverNodes.ts --network base-sepolia --deployment-id standard-solver-nodes-v1
npx hardhat ignition verify standard-solver-nodes-v1
*/
