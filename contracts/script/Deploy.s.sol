// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ReppoRegistry} from "../src/ReppoRegistry.sol";
import {ReppoToken} from "../src/ReppoToken.sol";
import {ModelContract} from "../src/ModelContract.sol";

contract Deploy is Script {
    function run() public {
        vm.startBroadcast();

        address ritualRegistry = 0xa0113fC5967707bF44d33CF9611D66726c7449B5;

        ReppoToken token = new ReppoToken();
        console.log("Deployed ReppoToken: ", address(token));

        ReppoRegistry reppoRegistry = new ReppoRegistry(ritualRegistry, address(token), address(0));
        console.log("Deployed ReppoRegistry: ", address(reppoRegistry));

        token.mint(address(reppoRegistry), 1_000_000 ether);

        vm.stopBroadcast();
    }
}
