// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ReppoRegistry} from "../src/ReppoRegistry.sol";
import {ReppoToken} from "../src/ReppoToken.sol";
import {ModelContract} from "../src/ModelContract.sol";

contract Deploy is Script {
    function run() public {
        vm.startBroadcast();

        // ModelContract modelContract = new ModelContract(0x3B1554f346DFe5c482Bb4BA31b880c1C18412170, "reppo_hello_world");
        // console.log(address(modelContract));

        // ReppoToken token = new ReppoToken();
        // ReppoRegistry registry = new ReppoRegistry(address(token));
        //
        // token.mint(address(registry), 1_000_000);

        vm.stopBroadcast();
    }
}
