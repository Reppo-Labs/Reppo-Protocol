// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ModelContract} from "./ModelContract.sol";

contract ReppoRegistry {
    address public ritualRegistry;
    address public reppoToken;

    // owner to model contract
    mapping(address => address) public ownerToModel;

    constructor(address _ritualRegistry, address _reppoToken) {
        ritualRegistry = _ritualRegistry;
        reppoToken = _reppoToken;
    }

    function register(string memory modelName) public returns (address) {
        ModelContract modelContract = new ModelContract(ritualRegistry, address(this));
        modelContract.setModelName(modelName);

        ownerToModel[msg.sender] = address(modelContract);

        IERC20(reppoToken).transfer(msg.sender, 1 ether);

        return address(modelContract);
    }

    function requestInference(address _modelContract, bytes memory input) public {
        ModelContract modelContract = ModelContract(_modelContract);
        modelContract.requestInference(input);
    }

    function requestInferenceWithETH(address _modelContract, bytes memory input) public payable {
        ModelContract modelContract = ModelContract(_modelContract);
        modelContract.requestInferenceWithETH(input);
    }

    function setPaymentToken(address _modelContract, address _paymentToken) public {
        ModelContract modelContract = ModelContract(_modelContract);
        modelContract.setPaymentToken(_paymentToken);
    }

    function setPaymentAmount(address _modelContract, uint256 _paymentAmount) public {
        ModelContract modelContract = ModelContract(_modelContract);
        modelContract.setPaymentAmount(_paymentAmount);
    }
}
