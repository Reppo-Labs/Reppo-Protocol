import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OwnershipModule = buildModule("OwnershipModule", (m) => {
  const ownership = m.contract("Ownership", [], {});
  return { lock: ownership };
});

export default OwnershipModule;

// 0xC16F620f9c5Ba85E2170783806f75C9b5530FadB
// npx hardhat ignition deploy ignition/modules/Ownership.ts --network base-sepolia --deployment-id ownership-base-sepolia
// npx hardhat ignition verify ownership-base-sepolia