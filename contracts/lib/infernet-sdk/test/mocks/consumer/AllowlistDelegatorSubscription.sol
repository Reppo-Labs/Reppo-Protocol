// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.4;

import {DeliveredOutput} from "./Base.sol";
import {Allowlist} from "../../../src/pattern/Allowlist.sol";
import {MockDelegatorSubscriptionConsumer} from "./DelegatorSubscription.sol";

/// @title MockAllowlistDelegatorSubscriptionConsumer
/// @notice Inherits `MocksDelegatorSubscriptionConsumer` with additional Allowlist
/// @dev Does not expose `_updateAllowlist` function since it is already tested via `MockAllowlistSubscriptionConsumer`
contract MockAllowlistDelegatorSubscriptionConsumer is MockDelegatorSubscriptionConsumer, Allowlist {
    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Create new MockAllowlistDelegatorSubscriptionConsumer
    /// @param registry registry address
    /// @param signer delegated signer address
    /// @param initialAllowed array of initially-allowed node addresses
    constructor(address registry, address signer, address[] memory initialAllowed)
        MockDelegatorSubscriptionConsumer(registry, signer)
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
}
