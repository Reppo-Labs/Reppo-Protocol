// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Pausable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTPremiumCollection is ERC721, ERC721URIStorage, ERC721Pausable, Ownable, ReentrancyGuard {

    uint256 private _currentTokenId = 1;
    uint256 private _maxSupply = 5550;
    string private _metadataBaseURI = "https://ipfs.io/ipfs/bafybeiglrj662izfl6oniqvpekgrgdy3kthuh7w2vfeupmnjvp4pb2dyii/";
    uint256 public constant MINT_FEE = 0.22 ether;
    uint256 public transferEnabledAfter;

    constructor(address initialOwner, uint256 _transferEnabledAfter)
        ERC721("Reppo Premium", "REPPOP")
        Ownable(initialOwner)
    {
        transferEnabledAfter = _transferEnabledAfter;
    }

    function safeMint(address to) public payable whenNotPaused nonReentrant {
        require(_currentTokenId <= _maxSupply, "Max supply reached");
        require(msg.value == MINT_FEE, "Incorrect Ether sent");
        string memory metadataURI = formatMetadataURI(_currentTokenId);
        _safeMint(to, _currentTokenId);
        _setTokenURI(_currentTokenId, metadataURI);
        _currentTokenId++;
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

    function setTransferEnabledAfter(uint256 _transferEnabledAfter) public onlyOwner {
        transferEnabledAfter = _transferEnabledAfter;
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        bool isMint = from == address(0);
        if (!isMint) {
            require(block.timestamp > transferEnabledAfter, "Transfer not allowed yet");
        }
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