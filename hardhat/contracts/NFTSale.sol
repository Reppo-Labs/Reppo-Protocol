// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTSale is Ownable, Pausable, ReentrancyGuard, IERC721Receiver {

    IERC721 public premiumNFTCollection;
    uint256 public premiumNFTCollectionSize;
    IERC721 public standardNFTCollection;
    uint256 public standardNFTCollectionSize;
    uint256 public constant PREMIUM_PRICE = 0.02 ether;
    uint256 public constant STANDARD_PRICE = 0.01 ether;

    event PremiumNFTPurchased(address indexed buyer, uint256 tokenId);
    event StandardNFTPurchased(address indexed buyer, uint256 tokenId);

    constructor(address initialOwner) 
        Ownable(initialOwner)
    {}

    function setPremiumCollection(address collection, uint256 collectionSize) external onlyOwner {
        premiumNFTCollection = IERC721(collection);
        premiumNFTCollectionSize = collectionSize;
    }

    function setStandardCollection(address collection, uint256 collectionSize) external onlyOwner {
        standardNFTCollection = IERC721(collection);
        standardNFTCollectionSize = collectionSize;
    }

    function getCurrentPremiumNFTId() public view returns (uint256) {
        for (uint256 i = 0; i < premiumNFTCollectionSize; i++) {
            if (premiumNFTCollection.ownerOf(i) == address(this)) {
                return i;
            }
        }
        revert("No available premium NFT");
    }

    function getCurrentStandardNFTId() public view returns (uint256) {
        for (uint256 i = 0; i < standardNFTCollectionSize; i++) {
            if (standardNFTCollection.ownerOf(i) == address(this)) {
                return i;
            }
        }
        revert("No available standard NFT");
    }

    function buyPremiumNFT() external payable whenNotPaused nonReentrant {
        require(msg.value == PREMIUM_PRICE, "Incorrect Ether sent");
        uint256 nftId = getCurrentPremiumNFTId();
        premiumNFTCollection.safeTransferFrom(address(this), msg.sender, nftId);
        emit PremiumNFTPurchased(msg.sender, nftId);
    }

    function buyStandardNFT() external payable whenNotPaused nonReentrant {
        require(msg.value == STANDARD_PRICE, "Incorrect Ether sent");
        uint256 nftId = getCurrentStandardNFTId();
        standardNFTCollection.safeTransferFrom(address(this), msg.sender, nftId);
        emit StandardNFTPurchased(msg.sender, nftId);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawNFT(address collection, uint256 tokenId) external onlyOwner {
        IERC721(collection).safeTransferFrom(address(this), owner(), tokenId);
    }

    function withdrawAllNFTs() external onlyOwner {
        for (uint256 i = 0; i < premiumNFTCollectionSize; i++) {
            if (premiumNFTCollection.ownerOf(i) == address(this)) {
                premiumNFTCollection.safeTransferFrom(address(this), owner(), i);
            }
        }
        for (uint256 i = 0; i < standardNFTCollectionSize; i++) {
            if (standardNFTCollection.ownerOf(i) == address(this)) {
                standardNFTCollection.safeTransferFrom(address(this), owner(), i);
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