// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// created by reppo labs at 2025-02-28 01:04

contract Ownership {

    struct Pod {
        string podId;
        uint256 createdAt;
        address creator;
        address updateAdmin;
        string podName;
        address[] owners;
        uint256[] ownershipPercentages;
        string ip;
    }

    event PodCreated(string podId, address creator);
    event PodUpdated(string podId);

    mapping(uint256 => Pod) public pods;

    function createPod(
        string calldata podId, 
        string calldata podName, 
        address updateAdmin,
        address[] calldata owners,
        uint256[] calldata ownershipPercentages,
        string calldata ip
    ) public {
        validateCreatepod(podId, owners, ownershipPercentages);
        pods[uint256(keccak256(abi.encodePacked(podId)))] = Pod({
            podId: podId,
            createdAt: block.timestamp,
            creator: msg.sender,
            updateAdmin: updateAdmin,
            podName: podName,
            owners: owners,
            ownershipPercentages: ownershipPercentages,
            ip: ip
        });
        emit PodCreated(podId, msg.sender);
    }

    function updatePod(
        string calldata podId, 
        string calldata podName,
        address updateAdmin,
        address[] calldata owners,
        uint256[] calldata ownershipPercentages,
        string calldata ip
    ) external {
        Pod storage pod = pods[uint256(keccak256(abi.encodePacked(podId)))];
        validateUpdatepod(pod.createdAt, pod.updateAdmin, owners, ownershipPercentages);
        pod.podName = podName;
        pod.updateAdmin = updateAdmin;
        pod.owners = owners;
        pod.ownershipPercentages = ownershipPercentages;
        pod.ip = ip;
        emit PodUpdated(podId);
    }

    function getPod(string calldata podId) public view returns (Pod memory) {
        return pods[uint256(keccak256(abi.encodePacked(podId)))];
    }

    function validateCreatepod(string calldata podId, address[] calldata owners, uint256[] calldata ownershipPercentages) internal view {
        validatepodParameters(owners, ownershipPercentages);
        Pod memory pod = pods[uint256(keccak256(abi.encodePacked(podId)))];
        require(pod.createdAt == 0, "Pod already exists");
    }

    function validateUpdatepod(uint256 createdAt, address updateAdmin, address[] calldata owners, uint256[] calldata ownershipPercentages) internal view {
        require(createdAt != 0, "Pod does not exist");
        validatepodParameters(owners, ownershipPercentages);
        require(updateAdmin == msg.sender, "Only updateAdmin contract can update pod");
    }

    function validatepodParameters(address[] calldata owners, uint256[] calldata ownershipPercentages) internal pure {
        require(owners.length == ownershipPercentages.length, "Owners and percentages length should be equal");
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            totalPercentage += ownershipPercentages[i];
        }
        require(totalPercentage == 10000, "Total percentage should be 100");
    }

}
