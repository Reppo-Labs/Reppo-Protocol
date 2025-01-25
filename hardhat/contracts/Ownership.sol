// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// created by reppo labs at 2025-01-25 19:12

contract Ownership {

    struct Record {
        string podId;
        uint256 createdAt;
        address creator;
        address updateAdmin;
        string podDescription;
        address[] owners;
        uint256[] ownershipPercentages;
        address[] ipAccountAddresses;
    }

    event RecordCreated(string podId, address creator);
    event RecordUpdated(string podId);

    mapping(uint256 => Record) public records;

    function createRecord(
        string calldata podId, 
        string calldata podDescription, 
        address updateAdmin,
        address[] calldata owners,
        uint256[] calldata ownershipPercentages,
        address[] calldata ipAccountAddresses
    ) public {
        validateCreateRecord(podId, owners, ownershipPercentages);
        records[uint256(keccak256(abi.encodePacked(podId)))] = Record({
            podId: podId,
            createdAt: block.timestamp,
            creator: msg.sender,
            updateAdmin: updateAdmin,
            podDescription: podDescription,
            owners: owners,
            ownershipPercentages: ownershipPercentages,
            ipAccountAddresses: ipAccountAddresses
        });
        emit RecordCreated(podId, msg.sender);
    }

    function updateRecord(
        string calldata podId, 
        string calldata podDescription,
        address updateAdmin,
        address[] calldata owners,
        uint256[] calldata ownershipPercentages,
        address[] calldata ipAccountAddresses
    ) external {
        Record storage record = records[uint256(keccak256(abi.encodePacked(podId)))];
        validateUpdateRecord(record.createdAt, record.updateAdmin, owners, ownershipPercentages);
        record.podDescription = podDescription;
        record.updateAdmin = updateAdmin;
        record.owners = owners;
        record.ownershipPercentages = ownershipPercentages;
        record.ipAccountAddresses = ipAccountAddresses;
        emit RecordUpdated(podId);
    }

    function getRecord(string calldata podId) public view returns (Record memory) {
        return records[uint256(keccak256(abi.encodePacked(podId)))];
    }

    function validateCreateRecord(string calldata podId, address[] calldata owners, uint256[] calldata ownershipPercentages) internal view {
        validateRecordParameters(owners, ownershipPercentages);
        Record memory record = records[uint256(keccak256(abi.encodePacked(podId)))];
        require(record.createdAt == 0, "Record already exists");
    }

    function validateUpdateRecord(uint256 createdAt, address multisig, address[] calldata owners, uint256[] calldata ownershipPercentages) internal view {
        require(createdAt != 0, "Record does not exist");
        validateRecordParameters(owners, ownershipPercentages);
        require(multisig == msg.sender, "Only multisig contract can update record");
    }

    function validateRecordParameters(address[] calldata owners, uint256[] calldata ownershipPercentages) internal pure {
        require(owners.length == ownershipPercentages.length, "Owners and percentages length should be equal");
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            totalPercentage += ownershipPercentages[i];
        }
        require(totalPercentage == 10000, "Total percentage should be 100");
    }

}
