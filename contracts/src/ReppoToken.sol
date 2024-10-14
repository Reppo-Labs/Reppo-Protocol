// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ReppoToken is ERC20 {
    constructor() ERC20("ReppoToken", "ReppoToken") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
