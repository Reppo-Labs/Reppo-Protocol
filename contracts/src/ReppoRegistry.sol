// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ModelContract} from "./ModelContract.sol";

contract ReppoRegistry {
    address public ritualRegistry;
    address public reppoToken;

    // owner to model contract
    mapping(address => address) public ownerToModel;

    // owner to list of models
    mapping(address => address[]) public ownerToModels;

    // owner to mapping of model
    mapping(address => mapping(address => bool)) private belongsToOwner;

    constructor(address _ritualRegistry, address _reppoToken) {
        ritualRegistry = _ritualRegistry;
        reppoToken = _reppoToken;
    }

    function getModels(address owner) external view returns (address[] memory) {
        return ownerToModels[owner];
    }

    function register(string memory modelName) public returns (address) {
        ModelContract modelContract = new ModelContract(ritualRegistry, address(this));
        modelContract.setModelName(modelName);

        ownerToModel[msg.sender] = address(modelContract);

        ownerToModels[msg.sender].push(address(modelContract));
        belongsToOwner[msg.sender][address(modelContract)] = true;

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
