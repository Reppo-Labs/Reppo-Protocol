// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SaysGM} from "../src/SaysGM.sol";

contract RequestInference is Script {
    function run() public {
        vm.startBroadcast();

        SaysGM saysGM = SaysGM(0x750A313E4e6725cF6Ba5aEEb932347Cbc5E06e5d);

        // saysGM.sayGM();

        bytes memory output = saysGM.outputs(0);
        console.log(string(output));

        vm.stopBroadcast();
    }
}
