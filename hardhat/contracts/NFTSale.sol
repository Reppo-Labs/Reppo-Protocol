// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTSale is Ownable, Pausable, ReentrancyGuard, IERC721Receiver {

    IERC721 public premiumCollection;
    IERC721 public standardCollection;
    uint256 public premiumNFTId;
    uint256 public standardNFTId;
    uint256 public constant PREMIUM_PRICE = 0.02 ether;
    uint256 public constant STANDARD_PRICE = 0.01 ether;

    constructor(address initialOwner) 
        Ownable(initialOwner)
    {}


    function setPremiumCollection(address _premiumCollection, uint256 tokenId) external onlyOwner {
        premiumCollection = IERC721(_premiumCollection);
        premiumNFTId = tokenId;
    }

    function setStandardCollection(address _standardCollection, uint256 tokenId) external onlyOwner {
        standardCollection = IERC721(_standardCollection);
        standardNFTId = tokenId;
    }

    function buyPremiumNFT() external payable whenNotPaused nonReentrant {
        require(msg.value == PREMIUM_PRICE, "Incorrect Ether sent");
        require(address(premiumCollection) != address(0), "Premium collection not set");
        require(premiumCollection.ownerOf(premiumNFTId) == address(this), "NFT not available for sale");
        premiumCollection.safeTransferFrom(address(this), msg.sender, premiumNFTId);
        premiumNFTId = premiumNFTId + 1;
    }

    function buyStandardNFT() external payable whenNotPaused nonReentrant {
        require(msg.value == STANDARD_PRICE, "Incorrect Ether sent");
        require(address(standardCollection) != address(0), "Standard collection not set");
        require(standardCollection.ownerOf(standardNFTId) == address(this), "NFT not available for sale");
        standardCollection.safeTransferFrom(address(this), msg.sender, standardNFTId);
        standardNFTId = standardNFTId + 1;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setPremiumNFTId(uint256 tokenId) external onlyOwner {
        premiumNFTId = tokenId;
    }

    function setStandardNFTId(uint256 tokenId) external onlyOwner {
        standardNFTId = tokenId;
    }

    function withdrawNFT(address collection, uint256 tokenId) external onlyOwner {
        IERC721(collection).safeTransferFrom(address(this), owner(), tokenId);
    }

    function withdrawAllNFTs(address collection, uint256 collectionSize) external onlyOwner {
        for (uint256 i = 0; i < collectionSize; i++) {
            address ownerOfNft = IERC721(collection).ownerOf(i);
            if (ownerOfNft == address(this)) {
                IERC721(collection).safeTransferFrom(address(this), owner(), i);
            }
        }
    }

    function pauseSale() public onlyOwner {
        _pause();
    }

    function resumeSale() public onlyOwner {
        _unpause();
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

}