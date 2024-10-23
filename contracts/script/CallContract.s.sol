// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {ReppoRegistry} from "../src/ReppoRegistry.sol";

import {ModelContract} from "../src/ModelContract.sol";

contract CallContract is Script {
    function run() public {
        // Setup wallet
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Log address
        address deployerAddress = vm.addr(deployerPrivateKey);
        console2.log("Loaded deployer: ", deployerAddress);

        ReppoRegistry reppo = ReppoRegistry(0x8cDbD76bB6Cf0293e07deEEEd460cf579873aF44);

        // // Execute inference request on model with id 1 and using nft token id 0
        // reppo.executeInference(1, 0);

        // Execute
        vm.stopBroadcast();
        vm.broadcast();
    }
}
