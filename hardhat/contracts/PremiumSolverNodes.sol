// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Pausable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PremiumSolverNodes is ERC721, ERC721URIStorage, ERC721Pausable, Ownable, ReentrancyGuard {

    address public claimableCollection;
    uint256 public currentMintTokenId = 1;
    uint256 public mintCapId = 5000;
    uint256 public currentClaimTokenId = 5001;
    uint256 public claimsCapId = 5550;
    string public metadataBaseURI;
    uint256 public mintFee;
    uint256 public discountedMintFee;
    uint256 public transferEnabledAfter;
    mapping(uint256 => bool) public claims;
    mapping(address => bool) public whitelist;
    mapping(address => bool) public transferAllowedToWhitelist;

    event Minted(address indexed to, uint256 tokenId);
    event MintedWhitelist(address indexed to, uint256 tokenId);
    event Claimed(address indexed to, uint256 tokenId, uint256 genesisTokenId);
    event AddedToWhitelist(address indexed addr);
    event RemovedFromWhitelist(address indexed addr);
    event MintFeeUpdated(uint256 newMintFee);
    event DiscountedMintFeeUpdated(uint256 newDiscountedMintFee);
    event TransferEnabledAfterUpdated(uint256 newTransferEnabledAfter);
    event MetadataBaseURIUpdated(string newMetadataBaseURI);
    event Withdraw(address indexed owner, uint256 amount);
    event AddedToTransferAllowedWhitelist(address indexed addr);
    event RemovedFromTransferAllowedWhitelist(address indexed addr);

    constructor(
        string memory name,
        string memory symbol,
        address owner,
        address _claimableCollection,
        string memory _metadataBaseURI,
        uint256 _mintFee,
        uint256 _discountedMintFee,
        uint256 _transferEnabledAfter,
        address[] memory _whitelist,
        address[] memory _transferAllowedToWhitelist
    )
        ERC721(name, symbol)
        Ownable(owner)
    {
        claimableCollection = _claimableCollection;
        metadataBaseURI = _metadataBaseURI;
        mintFee = _mintFee;
        discountedMintFee = _discountedMintFee;
        transferEnabledAfter = _transferEnabledAfter;
        addToWhitelist(_whitelist);
        addToTransferAllowedWhitelist(_transferAllowedToWhitelist);
    }

    function safeMint(address to) public payable nonReentrant {
        require(currentMintTokenId <= mintCapId, "Max supply reached");
        require(msg.value == mintFee, "Incorrect Ether sent");
        uint256 mintTokenId = currentMintTokenId++; 
        string memory metadataURI = formatMetadataURI(mintTokenId);
        _safeMint(to, mintTokenId);
        _setTokenURI(mintTokenId, metadataURI);
        emit Minted(to, mintTokenId);
    }

    function safeMintWhitelist() public payable nonReentrant {
        require(currentMintTokenId <= mintCapId, "Max supply reached");
        require(isAddressWhitelisted(msg.sender), "Not whitelisted");
        require(msg.value == discountedMintFee, "Incorrect Ether sent");
        uint256 mintTokenId = currentMintTokenId++; 
        string memory metadataURI = formatMetadataURI(mintTokenId);
        _safeMint(msg.sender, mintTokenId);
        _setTokenURI(mintTokenId, metadataURI);
        emit MintedWhitelist(msg.sender, mintTokenId);
    }

    function safeClaim(uint256 claimableTokenId) public nonReentrant{
        require(currentClaimTokenId <= claimsCapId, "Max supply reached");
        require(IERC721(claimableCollection).ownerOf(claimableTokenId) == msg.sender, "Not the owner of the token");
        require(!claims[claimableTokenId], "Token already claimed");
        claims[claimableTokenId] = true;
        uint256 claimTokenId = currentClaimTokenId++;
        string memory metadataURI = formatMetadataURI(claimTokenId);
        _safeMint(msg.sender, claimTokenId);
        _setTokenURI(claimTokenId, metadataURI);
        emit Claimed(msg.sender, claimTokenId, claimableTokenId);
    }

    function formatMetadataURI(uint256 tokenId) private view returns (string memory) {
        return string(abi.encodePacked(metadataBaseURI, Strings.toString(tokenId), ".json"));
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        metadataBaseURI = newBaseURI;
        emit MetadataBaseURIUpdated(newBaseURI);
    }

    function setMintFee(uint256 newMintFee) public onlyOwner {
        mintFee = newMintFee;
        emit MintFeeUpdated(newMintFee);
    }

    function setDiscountedMintFee(uint256 newDiscountedMintFee) public onlyOwner {
        discountedMintFee = newDiscountedMintFee;
        emit DiscountedMintFeeUpdated(newDiscountedMintFee);
    }

    function setTransferEnabledAfter(uint256 _transferEnabledAfter) public onlyOwner {
        transferEnabledAfter = _transferEnabledAfter;
        emit TransferEnabledAfterUpdated(_transferEnabledAfter);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        emit Withdraw(owner(), balance);
    }

    function addToWhitelist(address[] memory addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = true;
            emit AddedToWhitelist(addresses[i]);
        }
    }

    function removeFromWhitelist(address[] memory addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = false;
            emit RemovedFromWhitelist(addresses[i]);
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

    function addToTransferAllowedWhitelist(address[] memory addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            transferAllowedToWhitelist[addresses[i]] = true;
            emit AddedToTransferAllowedWhitelist(addresses[i]);
        }
    }

    function removeFromTransferAllowedWhitelist(address[] memory addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            transferAllowedToWhitelist[addresses[i]] = false;
            emit RemovedFromTransferAllowedWhitelist(addresses[i]);
        }
    }

    function isTransferToAddressWhitelisted(address to) public view returns (bool) {
        return transferAllowedToWhitelist[to];
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        bool isMint = from == address(0);
        if (!isMint && block.timestamp < transferEnabledAfter) {
            bool isTransferToAddressAllowed = isTransferToAddressWhitelisted(to);
            if (!isTransferToAddressAllowed) {
                require(block.timestamp > transferEnabledAfter, "Transfer not allowed yet");
            }
        }
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        _requireOwned(tokenId);
        return string(abi.encodePacked(metadataBaseURI, Strings.toString(tokenId), ".json"));
    }

    function transferOwnership(address newOwner) public override(Ownable) onlyOwner {
        require(paused() == false, "Contract is paused");
        super.transferOwnership(newOwner);
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