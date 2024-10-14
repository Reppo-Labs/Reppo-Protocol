// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {ReppoRegistry} from "../src/ReppoRegistry.sol";
import {ReppoToken} from "../src/ReppoToken.sol";
import {ReppoNFT} from "../src/ReppoNFT.sol";
import {Test, console} from "forge-std/Test.sol";

contract ReppoRegistryTest is Test {
    ReppoRegistry public registry;
    ReppoToken public reppoToken;
    ReppoNFT public token;

    address public modelContract = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    uint256 modelCid = 1;
    uint256 dataProof = 2;

    function setUp() public {
        reppoToken = new ReppoToken();
        registry = new ReppoRegistry(address(reppoToken));
        token = new ReppoNFT("Reppo", "REPPO", address(registry));

        reppoToken.mint(address(registry), 10000 ** 18);
    }

    function test_registerModel() public {
        assertEq(registry.lastModel(), 0);

        registry.registerModel(modelCid, modelContract, address(token), dataProof);

        assert(registry.lastModel() == 1);
        assert(registry.getModelByCid(modelCid).executionCount == 0);
    }
}
