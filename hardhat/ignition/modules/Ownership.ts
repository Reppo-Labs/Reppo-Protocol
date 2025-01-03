import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OwnershipModule = buildModule("OwnershipModule", (m) => {
  const ownership = m.contract("Ownership", [], {});
  return { lock: ownership };
});

export default OwnershipModule;

// 0xAA62B53c5717Ab6BBD496D5F9dA89f3dE453B0df
// npx hardhat ignition deploy ignition/modules/Ownership.ts --network base-sepolia --deployment-id ownership-base-sepolia
// npx hardhat ignition verify ownership-base-sepolia