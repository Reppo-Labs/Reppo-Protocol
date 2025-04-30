// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Pausable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SolverNodesStandard is ERC721, ERC721URIStorage, ERC721Pausable, Ownable, ReentrancyGuard {

    uint256 public currentMintTokenId = 1;
    uint256 public mintCapId = 15000;
    uint256 public currentClaimTokenId = 15001;
    uint256 public claimsCapId = 15650;

    address public claimableGhibiliCollection;
    address public claimableAnomadantCollection;
    address public claimableJohnnyTrainersCrewCollection;
    address public claimableJohnnyCollection;
    mapping(uint256 => bool) public claimsGhibiliCollection;
    mapping(uint256 => bool) public claimsAnomadantCollection;
    mapping(uint256 => bool) public claimsJohnnyTrainersCrewCollection;
    mapping(uint256 => bool) public claimsJohnnyCollection;

    string public metadataBaseURI;
    uint256 public mintFee;
    uint256 public discountedMintFee;
    uint256 public transferEnabledAfter;
    mapping(address => bool) public whitelist;
    address[] public whitelistCollection;
    address[] public transferAllowedWhitelist;

    event Minted(address indexed to, uint256 tokenId);
    event MintedWhitelist(address indexed to, uint256 tokenId);
    event Claimed(address indexed to, uint256 mintTokenId, uint256 claimTokenId, string collection);
    event AddedToWhitelist(address indexed addr);
    event RemovedFromWhitelist(address indexed addr);
    event TransferEnabledAfterUpdated(uint256 newTransferEnabledAfter);
    event MetadataBaseURIUpdated(string newMetadataBaseURI);
    event Withdraw(address indexed owner, uint256 amount);
    event WhitelistCollectionUpdated(address[] newWhitelistCollection);
    event TransferAllowedWhitelistUpdated(address[] newTransferAllowedWhitelist);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        string memory _metadataBaseURI,
        uint256 _mintFee,
        uint256 _discountedMintFee,
        uint256 _transferEnabledAfter,
        address _claimableGhibiliCollection,
        address _claimableAnomadantCollection,
        address _claimableJohnnyTrainersCrewCollection,
        address _claimableJohnnyCollection,
        address[] memory _whitelistCollection
    )
        ERC721(name, symbol)
        Ownable(initialOwner)
    {
        metadataBaseURI = _metadataBaseURI;
        mintFee = _mintFee;
        discountedMintFee = _discountedMintFee;
        transferEnabledAfter = _transferEnabledAfter;
        claimableGhibiliCollection = _claimableGhibiliCollection;
        claimableAnomadantCollection = _claimableAnomadantCollection;
        claimableJohnnyTrainersCrewCollection = _claimableJohnnyTrainersCrewCollection;
        claimableJohnnyCollection = _claimableJohnnyCollection;
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

    function safeClaimGhibiliCollection(uint256 claimableTokenId) public whenNotPaused nonReentrant{
        require(currentClaimTokenId <= claimsCapId, "Max supply reached");
        require(IERC721(claimableGhibiliCollection).ownerOf(claimableTokenId) == msg.sender, "Not the owner of claimable token");
        require(!claimsGhibiliCollection[claimableTokenId], "Already claimed");
        claimsGhibiliCollection[claimableTokenId] = true;
        string memory metadataURI = formatMetadataURI(currentClaimTokenId);
        _safeMint(msg.sender, currentClaimTokenId);
        _setTokenURI(currentClaimTokenId, metadataURI);
        currentClaimTokenId++;
        emit Claimed(msg.sender, currentClaimTokenId - 1, claimableTokenId, 'Ghibili');
    }

    function safeClaimAnomadantCollection(uint256 claimableTokenId) public whenNotPaused nonReentrant{
        require(currentClaimTokenId <= claimsCapId, "Max supply reached");
        require(IERC721(claimableAnomadantCollection).ownerOf(claimableTokenId) == msg.sender, "Not the owner of claimable token");
        require(!claimsAnomadantCollection[claimableTokenId], "Already claimed");
        claimsAnomadantCollection[claimableTokenId] = true;
        string memory metadataURI = formatMetadataURI(currentClaimTokenId);
        _safeMint(msg.sender, currentClaimTokenId);
        _setTokenURI(currentClaimTokenId, metadataURI);
        currentClaimTokenId++;
        emit Claimed(msg.sender, currentClaimTokenId - 1, claimableTokenId, 'Anomadant');
    }

    function safeClaimJohnnyTrainersCrewCollection(uint256 claimableTokenId) public whenNotPaused nonReentrant{
        require(currentClaimTokenId <= claimsCapId, "Max supply reached");
        require(IERC721(claimableJohnnyTrainersCrewCollection).ownerOf(claimableTokenId) == msg.sender, "Not the owner of claimable token");
        require(!claimsJohnnyTrainersCrewCollection[claimableTokenId], "Already claimed");
        claimsJohnnyTrainersCrewCollection[claimableTokenId] = true;
        string memory metadataURI = formatMetadataURI(currentClaimTokenId);
        _safeMint(msg.sender, currentClaimTokenId);
        _setTokenURI(currentClaimTokenId, metadataURI);
        currentClaimTokenId++;
        emit Claimed(msg.sender, currentClaimTokenId - 1, claimableTokenId, 'Johnny Trainers Crew');
    }

    function safeClaimJohnnyCollection(uint256 claimableTokenId) public whenNotPaused nonReentrant{
        require(currentClaimTokenId <= claimsCapId, "Max supply reached");
        require(IERC721(claimableJohnnyCollection).ownerOf(claimableTokenId) == msg.sender, "Not the owner of claimable token");
        require(!claimsJohnnyCollection[claimableTokenId], "Already claimed");
        claimsJohnnyCollection[claimableTokenId] = true;
        string memory metadataURI = formatMetadataURI(currentClaimTokenId);
        _safeMint(msg.sender, currentClaimTokenId);
        _setTokenURI(currentClaimTokenId, metadataURI);
        currentClaimTokenId++;
        emit Claimed(msg.sender, currentClaimTokenId - 1, claimableTokenId, 'Johnny');
    }

    function formatMetadataURI(uint256 tokenId) private view returns (string memory) {
        return string(abi.encodePacked(metadataBaseURI, Strings.toString(tokenId), ".json"));
    }

    function setTransferEnabledAfter(uint256 _transferEnabledAfter) public onlyOwner {
        transferEnabledAfter = _transferEnabledAfter;
        emit TransferEnabledAfterUpdated(_transferEnabledAfter);
    }

    function setTransferAllowedWhitelist(address[] memory _transferAllowedWhitelist) public onlyOwner {
        transferAllowedWhitelist = _transferAllowedWhitelist;
        emit TransferAllowedWhitelistUpdated(_transferAllowedWhitelist);
    }

    function setGhibiliCollection(address _claimableGhibiliCollection) public onlyOwner {
        claimableGhibiliCollection = _claimableGhibiliCollection;
    }

    function setAnomadantCollection(address _claimableAnomadantCollection) public onlyOwner {
        claimableAnomadantCollection = _claimableAnomadantCollection;
    }
    function setJohnnyTrainersCrewCollection(address _claimableJohnnyTrainersCrewCollection) public onlyOwner {
        claimableJohnnyTrainersCrewCollection = _claimableJohnnyTrainersCrewCollection;
    }

    function setJohnnyCollection(address _claimableJohnnyCollection) public onlyOwner {
        claimableJohnnyCollection = _claimableJohnnyCollection;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
        emit Withdraw(owner(), address(this).balance);
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

    function isTransferToAddressWhitelisted(address to) public view returns (bool) {
        for (uint256 i = 0; i < transferAllowedWhitelist.length; i++) {
            if (to == transferAllowedWhitelist[i]) {
                return true;
            }
        }
        return false;
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