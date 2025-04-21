// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Pausable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTPremiumCollection is ERC721, ERC721URIStorage, ERC721Pausable, Ownable, ReentrancyGuard {

    uint256 private _nextTokenId;
    uint256 private _maxSupply = 5550;
    string private _metadataBaseURI = "https://ipfs.io/ipfs/bafybeiglrj662izfl6oniqvpekgrgdy3kthuh7w2vfeupmnjvp4pb2dyii/";
    uint256 public constant PREMIUM_PRICE = 0.22 ether;

    constructor(address initialOwner)
        ERC721("Reppo Premuim", "REPPOP")
        Ownable(initialOwner)
    {}

    function safeMintTo(address to) public payable whenNotPaused nonReentrant {
        require(_nextTokenId < _maxSupply, "Max supply reached");
        require(msg.value == PREMIUM_PRICE, "Incorrect Ether sent");
        uint256 tokenId = _nextTokenId++;
        string memory metadataURI = formatMetadataURI(tokenId);
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
    } 

    function formatMetadataURI(uint256 tokenId) private view returns (string memory) {
        return string(abi.encodePacked(_metadataBaseURI, tokenId, ".json"));
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _metadataBaseURI = newBaseURI;
    }

        function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}