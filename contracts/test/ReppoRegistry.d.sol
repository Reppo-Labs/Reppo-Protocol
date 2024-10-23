// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {ReppoRegistry} from "../src/ReppoRegistry.sol";
import {ReppoToken} from "../src/ReppoToken.sol";
import {ReppoNFT} from "../src/ReppoNFT.sol";
import {ModelContract} from "../src/ModelContract.sol";
import {Test, console} from "forge-std/Test.sol";

contract ReppoRegistryTest is Test {
    ReppoRegistry public registry;
    ReppoToken public reppoToken;

    address owner = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address alice = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address bob = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;

    function setUp() public {
        vm.startPrank(owner);
        reppoToken = new ReppoToken();
        registry = new ReppoRegistry(0x663F3ad617193148711d28f5334eE4Ed07016602, address(reppoToken));

        reppoToken.mint(address(registry), 10000 ** 18);
        vm.stopPrank();
    }

    function test_register() public {
        assertEq(reppoToken.balanceOf(alice), 0);

        vm.prank(alice);
        ModelContract modelContract = ModelContract(registry.register("testModel"));

        assertEq(reppoToken.balanceOf(alice), 1);

        assertEq(modelContract.modelName(), "testModel");

        assertEq(registry.ownerToModel(alice), address(modelContract));

        assertEq(address(modelContract.paymentToken()), address(0x0));
        assertEq(modelContract.paymentAmount(), 0);
    }
}
