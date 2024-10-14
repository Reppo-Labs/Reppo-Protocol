// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract ReppoNFT is ERC721, ERC721Burnable {
    uint256 lastTokenId;
    address reppoRegistry;

    constructor(string memory name_, string memory symbol_, address reppoRegistry_) ERC721(name_, symbol_) {
        reppoRegistry = reppoRegistry_;
        mint();
    }

    function mint() public {
        setApprovalForAll(reppoRegistry, true);
        _mint(msg.sender, lastTokenId);
        lastTokenId++;
    }
}
