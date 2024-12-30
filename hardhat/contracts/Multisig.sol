// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Interface for the Ownership contract
interface IOwnership {
    function updateRecord(
        string memory modelId, 
        string memory description,
        address updateAdmin,
        address[] memory owners,
        uint256[] memory percentages,
        address ipAccountAddress
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
        address updateAdmin,
        address[] memory owners,
        uint256[] memory percentages,
        address ipAccountAddress
    ) public {
        IOwnership(ownershipContract).updateRecord(
            modelId, 
            description,
            updateAdmin,
            owners, 
            percentages,
            ipAccountAddress
        );
    }

}
