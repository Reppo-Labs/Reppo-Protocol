// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.4;

import {DeliveredOutput} from "./Base.sol";
import {MockSubscriptionConsumer} from "./Subscription.sol";
import {Allowlist} from "../../../src/pattern/Allowlist.sol";

/// @title MockAllowlistSubscriptionConsumer
/// @notice Inherits `MockSubscriptionConsumer` with additional Allowlist
contract MockAllowlistSubscriptionConsumer is MockSubscriptionConsumer, Allowlist {
    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Create new MockAllowlistSubscriptionConsumer
    /// @param registry registry address
    /// @param initialAllowed array of initially-allowed node addresses
    constructor(address registry, address[] memory initialAllowed)
        MockSubscriptionConsumer(registry)
        Allowlist(initialAllowed)
    {}

    /*//////////////////////////////////////////////////////////////
                           INHERITED FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Overrides function in `./Base.sol` to enforce `onlyAllowedNode` modifier
    function _receiveCompute(
        uint32 subscriptionId,
        uint32 interval,
        uint16 redundancy,
        address node,
        bytes calldata input,
        bytes calldata output,
        bytes calldata proof,
        bytes32 containerId,
        uint256 index
    ) internal override onlyAllowedNode(node) {
        // Log delivered output
        outputs[subscriptionId][interval][redundancy] = DeliveredOutput({
            subscriptionId: subscriptionId,
            interval: interval,
            redundancy: redundancy,
            node: node,
            input: input,
            output: output,
            proof: proof,
            containerId: containerId,
            index: index
        });
    }

    /// @notice Update Allowlist
    /// @param nodes array of node addresses to update
    /// @param statuses array of status(es) to update where index corresponds to index in nodes array
    function updateMockAllowlist(address[] memory nodes, bool[] memory statuses) external {
        _updateAllowlist(nodes, statuses);
    }
}
