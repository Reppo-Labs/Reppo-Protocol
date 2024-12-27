// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Interface for the Ownership contract
interface IOwnership {
    function updateRecord(
        string memory modelId, 
        string memory description,
        address[] memory owners,
        uint256[] memory percentages
    ) external;
}

// user should implement the multisig logic while implementing the updateRecord function
contract Multisig { 

    address public ownershipContract;

    constructor(address _ownershipContract) {
        ownershipContract = _ownershipContract;
    }

    // this function should require multiple signatures to execute
    // up to the user to implement this
    function updateRecord(
        string memory modelId, 
        string memory description,
        address[] memory owners,
        uint256[] memory percentages
    ) public {
        IOwnership(ownershipContract).updateRecord(modelId, description, owners, percentages);
    }

}
