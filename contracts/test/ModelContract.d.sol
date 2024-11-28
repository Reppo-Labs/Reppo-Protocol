// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {ReppoToken} from "../src/ReppoToken.sol";
import {ReppoRegistry} from "../src/ReppoRegistry.sol";
import {ModelContract} from "../src/ModelContract.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {Test, console} from "forge-std/Test.sol";
import {LibDeploy} from "infernet-test/lib/LibDeploy.sol";
import {Registry} from "infernet-sdk/Registry.sol";

contract ModelContractTest is Test {
    ReppoToken reppoToken;
    ReppoRegistry reppoRegistry;

    ModelContract public modelContract;

    MockERC20 public paymentToken;
    // address registry = 0x663F3ad617193148711d28f5334eE4Ed07016602;

    Registry REGISTRY;

    function setUp() public {
        uint256 initialNonce = vm.getNonce(address(this));
        (Registry registry,,,,,) = LibDeploy.deployContracts(address(this), initialNonce, address(this), 0);

        REGISTRY = registry;

        reppoToken = new ReppoToken();
        reppoRegistry = new ReppoRegistry(address(REGISTRY), address(reppoToken));
        reppoToken.mint(address(reppoRegistry), 10000 ** 18);

        address modelContractAddress = reppoRegistry.register("testModel");
        modelContract = ModelContract(modelContractAddress);

        modelContract.setPaymentToken(address(0x00000000000000000000000000000000));

        paymentToken = new MockERC20();
        paymentToken.approve(address(modelContract), type(uint256).max);
        paymentToken.mint(address(this), 100 ether);
    }

    function test_ExecuteNoPayment() public {
        assertEq(paymentToken.balanceOf(address(modelContract)), 0 ether);
        assertEq(paymentToken.balanceOf(address(modelContract.reppoRegistry())), 0 ether);
        assertEq(address(modelContract.paymentToken()), address(0x0));

        modelContract.requestInference(bytes(""));

        assertEq(paymentToken.balanceOf(address(modelContract)), 0 ether);
        assertEq(paymentToken.balanceOf(address(modelContract.reppoRegistry())), 0 ether);
    }

    function test_ExecuteWithPayment() public {
        modelContract.setPaymentToken(address(paymentToken));
        modelContract.setPaymentAmount(10 ether);

        assertEq(address(modelContract.paymentToken()), address(paymentToken));
        assertEq(modelContract.paymentAmount(), 10 ether);
        assertEq(paymentToken.balanceOf(address(modelContract)), 0);

        modelContract.requestInference(bytes(""));

        assertEq(paymentToken.balanceOf(address(modelContract)), 9 ether);
        assertEq(paymentToken.balanceOf(address(modelContract.reppoRegistry())), 1 ether);
    }
}
