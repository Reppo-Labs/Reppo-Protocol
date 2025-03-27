// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Interface for the Ownership contract
interface IOwnership {
    function updatePod(
        string memory podId, 
        string memory podName,
        address updateAdmin,
        address[] memory owners,
        uint256[] memory percentages,
        string memory ip
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
    function updatePod(
        string memory modelId, 
        string memory description,
        address updateAdmin,
        address[] memory owners,
        uint256[] memory percentages,
        string memory ip
    ) public {
        IOwnership(ownershipContract).updatePod(
            modelId, 
            description,
            updateAdmin,
            owners, 
            percentages,
            ip
        );
    }

}
