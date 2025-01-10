import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OwnershipModule = buildModule("OwnershipModule", (m) => {
  const ownership = m.contract("Ownership", [], {});
  return { lock: ownership };
});

export default OwnershipModule;

// 0x5301A02241764D4b24949c7Ffc48A3Ecc30d71C1
// npx hardhat ignition deploy ignition/modules/Ownership.ts --network base-sepolia --deployment-id ownership-base-sepolia
// npx hardhat ignition verify ownership-base-sepolia