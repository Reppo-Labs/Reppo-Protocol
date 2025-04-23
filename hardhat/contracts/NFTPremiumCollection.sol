// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Pausable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

contract NFTPremiumCollection is ERC721, ERC721URIStorage, ERC721Pausable, Ownable, ReentrancyGuard {

    address public genesisCollection;
    uint256 public currentMintTokenId;
    uint256 public mintCapId;
    uint256 public currentClaimTokenId;
    uint256 public claimsCapId;
    string public metadataBaseURI;
    uint256 public mintFee;
    uint256 public discountedMintFee;
    uint256 public transferEnabledAfter;
    mapping(uint256 => bool) public claims;
    mapping(address => bool) public whitelist;

    event Minted(address indexed to, uint256 tokenId, bool whitelisted);
    event Claimed(address indexed to, uint256 tokenId, uint256 genesisTokenId);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        address _genesisCollection,
        uint256 _currentMintTokenId,
        uint256 _mintCapId,
        uint256 _currentClaimTokenId,
        uint256 _claimsCapId,
        string memory _metadataBaseURI,
        uint256 _mintFee,
        uint256 _discountedMintFee,
        uint256 _transferEnabledAfter
    )
        ERC721(name, symbol)
        Ownable(initialOwner)
    {
        genesisCollection = _genesisCollection;
        currentMintTokenId = _currentMintTokenId;
        mintCapId = _mintCapId;
        currentClaimTokenId = _currentClaimTokenId;
        claimsCapId = _claimsCapId;
        metadataBaseURI = _metadataBaseURI;
        mintFee = _mintFee;
        discountedMintFee = _discountedMintFee;
        transferEnabledAfter = _transferEnabledAfter;
    }

    function safeMint(address to) public payable whenNotPaused nonReentrant {
        require(currentMintTokenId <= mintCapId, "Max supply reached");
        bool isWhitelisted = whitelist[msg.sender];
        uint256 mintFeeToPay = isWhitelisted ? discountedMintFee : mintFee;
        require(msg.value == mintFeeToPay, "Incorrect Ether sent");
        string memory metadataURI = formatMetadataURI(currentMintTokenId);
        _safeMint(to, currentMintTokenId);
        _setTokenURI(currentMintTokenId, metadataURI);
        currentMintTokenId++;
        emit Minted(to, currentMintTokenId - 1, isWhitelisted);
    }

    function safeClaim(address to, uint256 genesisTokenId) public {
        require(currentClaimTokenId <= claimsCapId, "Max supply reached");
        require(IERC721(genesisCollection).ownerOf(genesisTokenId) == msg.sender, "Not the owner of the genesis token");
        require(!claims[genesisTokenId], "Token already claimed");
        string memory metadataURI = formatMetadataURI(currentClaimTokenId);
        _safeMint(to, currentClaimTokenId);
        _setTokenURI(currentClaimTokenId, metadataURI);
        claims[genesisTokenId] = true;
        currentClaimTokenId++;
        emit Claimed(to, currentClaimTokenId - 1, genesisTokenId);
    }

    function formatMetadataURI(uint256 tokenId) private view returns (string memory) {
        return string(abi.encodePacked(metadataBaseURI, Strings.toString(tokenId), ".json"));
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        metadataBaseURI = newBaseURI;
    }

    function setCurrentMintTokenId(uint256 newCurrentMintTokenId) public onlyOwner {
        currentMintTokenId = newCurrentMintTokenId;
    }

    function setMintCapId(uint256 newMintCapId) public onlyOwner {
        mintCapId = newMintCapId;
    }

    function setCurrentClaimTokenId(uint256 newCurrentClaimTokenId) public onlyOwner {
        currentClaimTokenId = newCurrentClaimTokenId;
    }

    function setClaimsCapId(uint256 newClaimsCapId) public onlyOwner {
        claimsCapId = newClaimsCapId;
    }

    function setMintFee(uint256 newMintFee) public onlyOwner {
        mintFee = newMintFee;
    }

    function setDiscountedMintFee(uint256 newDiscountedMintFee) public onlyOwner {
        discountedMintFee = newDiscountedMintFee;
    }

    function setTransferEnabledAfter(uint256 _transferEnabledAfter) public onlyOwner {
        transferEnabledAfter = _transferEnabledAfter;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setGenesisCollection(address _genesisCollection) public onlyOwner {
        genesisCollection = _genesisCollection;
    }

    function addToWhitelist(address[] memory addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = true;
        }
    }

    function removeFromWhitelist(address[] memory addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = false;
        }
    }

    function isAddressWhitelisted(address addr) public view returns (bool) {
        return whitelist[addr];
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