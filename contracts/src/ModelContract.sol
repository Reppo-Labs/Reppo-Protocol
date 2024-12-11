// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.13;

import {console} from "forge-std/console.sol";
import {CallbackConsumer} from "infernet-sdk/consumer/Callback.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ModelContract is CallbackConsumer {
    string public modelName;

    bytes[] public outputs;

    uint256 public paymentAmountInETH;
    uint256 public paymentAmount;
    IERC20 public paymentToken;

    address public reppoRegistry;

    constructor(address registry, address _reppoRegistry) CallbackConsumer(registry) {
        reppoRegistry = _reppoRegistry;
    }

    function setModelName(string memory _modelName) public {
        modelName = _modelName;
    }

    function setPaymentToken(address _paymentToken) public {
        paymentToken = IERC20(_paymentToken);
    }

    function setPaymentAmount(uint256 _paymentAmount) public {
        paymentAmount = _paymentAmount;
    }

    function setPaymentAmountInETH(uint256 _paymentAmountInETH) public {
        paymentAmountInETH = _paymentAmountInETH;
    }

    function requestInference(bytes memory input) public {
        if (address(paymentToken) != address(0x0)) {
            paymentToken.transferFrom(msg.sender, address(this), paymentAmount * 9 / 10);
            paymentToken.transferFrom(msg.sender, reppoRegistry, paymentAmount * 1 / 10);
        }

        _requestCompute(
            modelName,
            input,
            1, // redundancy
            address(0), // paymentToken
            0, // paymentAmount
            address(0), // wallet
            address(0) // prover
        );
    }

    function requestInferenceWithETH(bytes memory input) public payable {
        if (paymentAmountInETH != 0) {
            require(msg.value >= paymentAmountInETH, "not enough payment in ETH");
        }

        _requestCompute(
            modelName,
            input,
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
