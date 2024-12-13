// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {ModelContract} from "../src/ModelContract.sol";
import {ReppoRegistry} from "../src/ReppoRegistry.sol";
import {ReppoToken} from "../src/ReppoToken.sol";

contract DevDeploy is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Log address
        address deployerAddress = vm.addr(deployerPrivateKey);
        console2.log("Loaded deployer: ", deployerAddress);

        address registry = 0x663F3ad617193148711d28f5334eE4Ed07016602;

        ReppoToken token = new ReppoToken();
        console2.log("Deployed ReppoToken: ", address(token));

        ReppoRegistry reppoRegistry = new ReppoRegistry(registry, address(token), address(0));
        console2.log("Deployed ReppoRegistry: ", address(reppoRegistry));

        // // Create consumer
        // ModelContract modelContract = new ModelContract(registry, "reppo_hello_world", address(reppoRegistry));
        // console2.log("Deployed ModelContract: ", address(modelContract));

        // Execute
        vm.stopBroadcast();
    }
}
