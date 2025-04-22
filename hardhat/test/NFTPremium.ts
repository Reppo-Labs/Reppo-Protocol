import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { premiumCollectionMetadataBaseURI } from "../constants/nftCollection";

describe("NFT Premium Collection", function () {

  const name = "Reppo Premium";
  const symbol = "REPPOP";
  const currentMintTokenId = 1;
  const mintCapId = 10;
  const currentClaimTokenId = 11;
  const claimsCapId = 15;
  const metadataBaseURI = premiumCollectionMetadataBaseURI;
  const mintFee = hre.ethers.parseEther("0.22");
  const discountedMintFee = hre.ethers.parseEther("0.20");
  const transferEnabledAfter = 	1747786226;

  async function deployGenesisNFTCollection() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const NFTGenesis = await hre.ethers.getContractFactory("NFT");
    const nftGenesis = await NFTGenesis.deploy(owner.address, "Reppo Genesis", "REPPG");
    return { nftGenesis, owner, otherAccount };
  }

  async function deployPremiumNFTCollection() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const NFT = await hre.ethers.getContractFactory("NFTPremiumCollection");
    const { nftGenesis } = await loadFixture(deployGenesisNFTCollection);
    const nftPremium = await NFT.deploy(
      name,
      symbol,
      owner,
      nftGenesis.target,
      currentMintTokenId,
      mintCapId,
      currentClaimTokenId,
      claimsCapId,
      metadataBaseURI,
      mintFee,
      discountedMintFee,
      transferEnabledAfter
    );
    return { nftPremium, owner, otherAccount, nftGenesis: nftGenesis.target };
  }

  describe ("Premium NFT Collection", function () {

    it ("Can deploy Premium NFT Collection contract with correct constructor parameters", async function () {
      const [owner, otherAccount] = await hre.ethers.getSigners();
      const { nftPremium, nftGenesis } = await loadFixture(deployPremiumNFTCollection);
      expect(await nftPremium.name()).to.equal(name);
      expect(await nftPremium.symbol()).to.equal(symbol);
      expect(await nftPremium.owner()).to.equal(owner.address);
      expect(await nftPremium.genesisCollection()).to.equal(nftGenesis);
      expect(await nftPremium.transferEnabledAfter()).to.equal(transferEnabledAfter);
      expect(await nftPremium.mintCapId()).to.equal(mintCapId);
      expect(await nftPremium.currentMintTokenId()).to.equal(currentMintTokenId);
      expect(await nftPremium.currentClaimTokenId()).to.equal(currentClaimTokenId);
      expect(await nftPremium.claimsCapId()).to.equal(claimsCapId);
      expect(await nftPremium.metadataBaseURI()).to.equal(metadataBaseURI);
      expect(await nftPremium.mintFee()).to.equal(mintFee);
      expect(await nftPremium.discountedMintFee()).to.equal(discountedMintFee);
    });

    it ("Throws an error when trying to mint a NFT with incorrect ether amount", async function () {
      const { nftPremium, owner } = await loadFixture(deployPremiumNFTCollection);
      await expect(nftPremium.safeMint(owner.address, { value: hre.ethers.parseEther("0.01") })).to.be.revertedWith("Incorrect Ether sent");
    });

    it ("Non whitelisted user can mint a NFT with standard minting fee", async function () {
      const { nftPremium, owner } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(owner.address, { value: mintFee });
      expect(await nftPremium.balanceOf(owner.address)).to.equal(1);
      expect(await hre.ethers.provider.getBalance(nftPremium.target)).to.equal(mintFee);
      expect(await nftPremium.ownerOf(1)).to.equal(owner.address);
    });

    it ("Throws an error when a non whitelisted user trying to mint a NFT with discounted minting fee", async function () {
      const { nftPremium, owner } = await loadFixture(deployPremiumNFTCollection);
      await expect(nftPremium.safeMint(owner.address, { value: discountedMintFee })).to.be.revertedWith("Incorrect Ether sent");
    });

    it ("Whitelisted user can mint a NFT with discounted minting fee", async function () {
      const { nftPremium, owner } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.addToWhitelist([owner.address]);
      await nftPremium.safeMint(owner.address, { value: discountedMintFee });
      expect(await nftPremium.balanceOf(owner.address)).to.equal(1);
      expect(await hre.ethers.provider.getBalance(nftPremium.target)).to.equal(discountedMintFee);
      expect(await nftPremium.ownerOf(1)).to.equal(owner.address);
    });

    it ("Cannot transfer NFTs before transferEnabledAfter", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(owner.address, { value: mintFee });
      await expect(nftPremium.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1)).to.be.revertedWith("Transfer not allowed yet");
    });

    it ("Can transfer after transfer allowed timestamp", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(owner.address, { value: mintFee });
      await time.setNextBlockTimestamp(transferEnabledAfter + 1);
      await nftPremium.transferFrom(owner.address, otherAccount.address, 1);
      expect(await nftPremium.balanceOf(otherAccount.address)).to.equal(1);
      expect(await nftPremium.balanceOf(owner.address)).to.equal(0);
      expect(await nftPremium.ownerOf(1)).to.equal(otherAccount.address);
    });

    it ("Non owner cannot withdraw ETH from contract", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(otherAccount.address, { value: mintFee });
      await expect(nftPremium.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(nftPremium, "OwnableUnauthorizedAccount");
    });
    
  });

});
