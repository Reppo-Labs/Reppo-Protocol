// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {SaysGM} from "../src/SaysGM.sol";
import {ReppoRegistry} from "../src/ReppoRegistry.sol";
import {ReppoNFT} from "../src/ReppoNFT.sol";

contract DevDeploy is Script {
    function run() public {
        vm.startBroadcast();
        address registry = 0x663F3ad617193148711d28f5334eE4Ed07016602;
        // Create consumer
        SaysGM saysGm = new SaysGM(registry);
        console2.log("Deployed SaysHello: ", address(saysGm));

        // ReppoNFT nft = new ReppoNFT("Reppo", "REPPO");
        // console2.log("Deployed ReppoNFT: ", address(nft));
        //
        // ReppoRegistry reppoRegistry = new ReppoRegistry();
        // console2.log("Deployed ReppoRegistry: ", address(reppoRegistry));
        //
        // reppoRegistry.registerModel(1, address(saysGm), address(nft), 0);

        // Execute
        vm.stopBroadcast();
        vm.broadcast();
    }
}
