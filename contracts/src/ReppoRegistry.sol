// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ReppoRegistry {
    struct Model {
        uint256 modelCid;
        address modelContract;
        address accessToken;
        uint256 dataProof;
        address owner;
        uint256 executionCount;
    }

    address public reppoToken;

    // model cid to model index
    mapping(uint256 => uint256) public modelIds;

    // model owner to model index
    mapping(address => uint256) public modellers;

    // model index to model
    mapping(uint256 => Model) public models;

    // index of last registered model
    uint256 public lastModel;

    error NoValidToken();
    error NoValidModel();

    constructor(address _reppoToken) {
        reppoToken = _reppoToken;
    }

    function registerModel(uint256 cid, address modelContract, address accessToken, uint256 dataProof) public {
        models[lastModel] = Model(cid, modelContract, accessToken, dataProof, msg.sender, 0);
        modellers[msg.sender] = lastModel;
        modelIds[cid] = lastModel;
        lastModel++;

        IERC20(reppoToken).transfer(msg.sender, 1);
    }

    function increaseExecutionCount(uint256 cid) public {
        uint256 modelId = modelIds[cid];
        Model memory model = models[modelId];
        model.executionCount++;
        models[modelId] = model;
    }

    function getModelByCid(uint256 cid) public view returns (Model memory) {
        uint256 modelId = modelIds[cid];
        return models[modelId];
    }

    function getModelExecutionCountByCid(uint256 cid) public view returns (uint256) {
        uint256 modelId = modelIds[cid];
        return models[modelId].executionCount;
    }
}
