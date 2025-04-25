// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Pausable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SolverNodes is ERC721, ERC721URIStorage, ERC721Pausable, Ownable, ReentrancyGuard {

    address public claimableCollection;
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
    address[] public whitelistCollection;

    event Minted(address indexed to, uint256 tokenId);
    event MintedWhitelist(address indexed to, uint256 tokenId);
    event Claimed(address indexed to, uint256 tokenId, uint256 genesisTokenId);
    event AddedToWhitelist(address indexed addr);
    event RemovedFromWhitelist(address indexed addr);
    event GenesisCollectionUpdated(address indexed newGenesisCollection);
    event MintFeeUpdated(uint256 newMintFee);
    event DiscountedMintFeeUpdated(uint256 newDiscountedMintFee);
    event TransferEnabledAfterUpdated(uint256 newTransferEnabledAfter);
    event MetadataBaseURIUpdated(string newMetadataBaseURI);
    event MintCapIdUpdated(uint256 newMintCapId);
    event ClaimsCapIdUpdated(uint256 newClaimsCapId);
    event CurrentMintTokenIdUpdated(uint256 newCurrentMintTokenId);
    event CurrentClaimTokenIdUpdated(uint256 newCurrentClaimTokenId);
    event Withdraw(address indexed owner, uint256 amount);
    event WhitelistCollectionUpdated(address[] newWhitelistCollection);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        address _claimableCollection,
        uint256 _currentMintTokenId,
        uint256 _mintCapId,
        uint256 _currentClaimTokenId,
        uint256 _claimsCapId,
        string memory _metadataBaseURI,
        uint256 _mintFee,
        uint256 _discountedMintFee,
        uint256 _transferEnabledAfter,
        address[] memory _whitelistCollection
    )
        ERC721(name, symbol)
        Ownable(initialOwner)
    {
        claimableCollection = _claimableCollection;
        currentMintTokenId = _currentMintTokenId;
        mintCapId = _mintCapId;
        currentClaimTokenId = _currentClaimTokenId;
        claimsCapId = _claimsCapId;
        metadataBaseURI = _metadataBaseURI;
        mintFee = _mintFee;
        discountedMintFee = _discountedMintFee;
        transferEnabledAfter = _transferEnabledAfter;
        whitelistCollection = _whitelistCollection;
    }

    function safeMint(address to) public payable whenNotPaused nonReentrant {
        require(currentMintTokenId <= mintCapId, "Max supply reached");
        require(msg.value == mintFee, "Incorrect Ether sent");
        string memory metadataURI = formatMetadataURI(currentMintTokenId);
        _safeMint(to, currentMintTokenId);
        _setTokenURI(currentMintTokenId, metadataURI);
        currentMintTokenId++;
        emit Minted(to, currentMintTokenId - 1);
    }

    function safeMintWhitelist() public payable whenNotPaused nonReentrant {
        require(currentMintTokenId <= mintCapId, "Max supply reached");
        require(isAddressWhitelisted(msg.sender), "Not whitelisted");
        require(msg.value == discountedMintFee, "Incorrect Ether sent");
        string memory metadataURI = formatMetadataURI(currentMintTokenId);
        _safeMint(msg.sender, currentMintTokenId);
        _setTokenURI(currentMintTokenId, metadataURI);
        currentMintTokenId++;
        emit MintedWhitelist(msg.sender, currentMintTokenId - 1);
    }

    function safeClaim(address to, uint256 claimableTokenId) public whenNotPaused nonReentrant{
        require(currentClaimTokenId <= claimsCapId, "Max supply reached");
        require(IERC721(claimableCollection).ownerOf(claimableTokenId) == msg.sender, "Not the owner of the token");
        require(!claims[claimableTokenId], "Token already claimed");
        string memory metadataURI = formatMetadataURI(currentClaimTokenId);
        _safeMint(to, currentClaimTokenId);
        _setTokenURI(currentClaimTokenId, metadataURI);
        claims[claimableTokenId] = true;
        currentClaimTokenId++;
        emit Claimed(to, currentClaimTokenId - 1, claimableTokenId);
    }

    function formatMetadataURI(uint256 tokenId) private view returns (string memory) {
        return string(abi.encodePacked(metadataBaseURI, Strings.toString(tokenId), ".json"));
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        metadataBaseURI = newBaseURI;
        emit MetadataBaseURIUpdated(newBaseURI);
    }

    function setCurrentMintTokenId(uint256 newCurrentMintTokenId) public onlyOwner {
        currentMintTokenId = newCurrentMintTokenId;
        emit CurrentMintTokenIdUpdated(newCurrentMintTokenId);
    }

    function setMintCapId(uint256 newMintCapId) public onlyOwner {
        mintCapId = newMintCapId;
        emit MintCapIdUpdated(newMintCapId);
    }

    function setCurrentClaimTokenId(uint256 newCurrentClaimTokenId) public onlyOwner {
        currentClaimTokenId = newCurrentClaimTokenId;
        emit CurrentClaimTokenIdUpdated(newCurrentClaimTokenId);
    }

    function setClaimsCapId(uint256 newClaimsCapId) public onlyOwner {
        claimsCapId = newClaimsCapId;
        emit ClaimsCapIdUpdated(newClaimsCapId);
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
        payable(owner()).transfer(address(this).balance);
        emit Withdraw(owner(), address(this).balance);
    }

    function setGenesisCollection(address _genesisCollection) public onlyOwner {
        claimableCollection = _genesisCollection;
        emit GenesisCollectionUpdated(_genesisCollection);
    }

    function setWhitelistCollection(address[] memory _whitelistCollection) public onlyOwner {
        whitelistCollection = _whitelistCollection;
        emit WhitelistCollectionUpdated(_whitelistCollection);
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
        bool isManuallyWhitelisted = whitelist[addr];
        if (isManuallyWhitelisted) {
            return true;
        }
        for (uint256 i = 0; i < whitelistCollection.length; i++) {
            if (IERC721(whitelistCollection[i]).balanceOf(addr) > 0) {
                return true;
            }
        }
        return false;
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