// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.13;

import {console} from "forge-std/console.sol";
import {CallbackConsumer} from "infernet-sdk/consumer/Callback.sol";

contract SaysGM is CallbackConsumer {
    bytes[] public outputs;

    constructor(address registry) CallbackConsumer(registry) {}

    function sayGM() public {
        _requestCompute(
            "reppo_hello_world",
            bytes("Good morning!"),
            1, // redundancy
            address(0), // paymentToken
            0, // paymentAmount
            address(0), // wallet
            address(0) // prover
        );
    }

    function getResult(uint256 idx) public view returns (string memory) {
        return string(outputs[idx]);
    }

    function _receiveCompute(
        uint32, // subscriptionId,
        uint32, // interval,
        uint16, // redundancy,
        address, // node,
        bytes calldata, // input,
        bytes calldata output,
        bytes calldata, // proof,
        bytes32, //_containerId,
        uint256 //_index
    ) internal override {
        outputs.push(output);
    }
}
