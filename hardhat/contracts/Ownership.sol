// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "hardhat/console.sol";

// created by reppo labs at 2024-12-27 15:15:00

contract Ownership {

    struct Record {
        string modelId;
        uint256 createdAt;
        address creator;
        address multiSigContract;
        string description;
        address[] owners;
        uint256[] percentages;
    }

    event RecordCreated(string modelId, address creator);
    event RecordUpdated(string modelId);

    mapping(uint256 => Record) public records;

    function createRecord(
        string calldata modelId, 
        string calldata description, 
        address multiSigContract,
        address[] calldata owners,
        uint256[] calldata percentages
    ) public {
        validateCreateRecord(modelId, owners, percentages);
        records[uint256(keccak256(abi.encodePacked(modelId)))] = Record({
            modelId: modelId,
            createdAt: block.timestamp,
            creator: msg.sender,
            multiSigContract: multiSigContract,
            description: description,
            owners: owners,
            percentages: percentages
        });
        emit RecordCreated(modelId, msg.sender);
    }

    function updateRecord(
        string calldata modelId, 
        string calldata description,
        address[] calldata owners,
        uint256[] calldata percentages
    ) external {
        Record storage record = records[uint256(keccak256(abi.encodePacked(modelId)))];
        validateUpdateRecord(record.createdAt, record.multiSigContract, owners, percentages);
        record.description = description;
        record.owners = owners;
        record.percentages = percentages;
        emit RecordUpdated(modelId);
    }

    function getRecord(string calldata modelId) public view returns (Record memory) {
        return records[uint256(keccak256(abi.encodePacked(modelId)))];
    }

    function validateCreateRecord(string calldata modelId, address[] calldata owners, uint256[] calldata percentages) internal view {
        validateRecordParameters(owners, percentages);
        Record memory record = records[uint256(keccak256(abi.encodePacked(modelId)))];
        require(record.createdAt == 0, "Record already exists");
    }

    function validateUpdateRecord(uint256 createdAt, address multisig, address[] calldata owners, uint256[] calldata percentages) internal view {
        require(createdAt != 0, "Record does not exist");
        validateRecordParameters(owners, percentages);
        require(multisig == msg.sender, "Only multisig contract can update record");
    }

    function validateRecordParameters(address[] calldata owners, uint256[] calldata percentages) internal pure {
        require(owners.length == percentages.length, "Owners and percentages length should be equal");
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            totalPercentage += percentages[i];
        }
        require(totalPercentage == 100, "Total percentage should be 100");
    }

}
