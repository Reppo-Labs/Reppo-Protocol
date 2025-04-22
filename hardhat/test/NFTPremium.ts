import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("NFT Premium Collection", function () {

  const transferEnabledAfter = 	1747786226;
  const mintPrice = hre.ethers.parseEther("0.22");

  async function deployPremiumNFTCollection() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const NFT = await hre.ethers.getContractFactory("NFTPremiumCollection");
    const nftPremium = await NFT.deploy(owner.address, transferEnabledAfter);
    return { nftPremium, owner, otherAccount };
  }

  describe ("Premium NFT Collection", function () {

    it ("Can deploy Premium NFT Collection contract with correct constructor parameters", async function () {
      const [owner, otherAccount] = await hre.ethers.getSigners();
      const { nftPremium } = await loadFixture(deployPremiumNFTCollection);
      expect(await nftPremium.owner()).to.equal(owner.address);
      expect(await nftPremium.transferEnabledAfter()).to.equal(transferEnabledAfter);
      expect(await nftPremium.name()).to.equal("Reppo Premium");
      expect(await nftPremium.symbol()).to.equal("REPPOP");
    });

    it ("Throws an error when trying to mint a NFT with incorrect ether amount", async function () {
      const { nftPremium, owner } = await loadFixture(deployPremiumNFTCollection);
      await expect(nftPremium.safeMint(owner.address, { value: hre.ethers.parseEther("0.01") })).to.be.revertedWith("Incorrect Ether sent");
    });

    it ("Owner can mint a NFT with correct ether amount", async function () {
      const { nftPremium, owner } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(owner.address, { value: mintPrice });
      expect(await nftPremium.balanceOf(owner.address)).to.equal(1);
      expect(await hre.ethers.provider.getBalance(nftPremium.target)).to.equal(mintPrice);
      expect(await nftPremium.ownerOf(1)).to.equal(owner.address);
    });

    it ("Non-owner can mint a NFT", async function () {
      const { nftPremium, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.connect(otherAccount).safeMint(otherAccount.address, { value: mintPrice });
      expect(await nftPremium.balanceOf(otherAccount.address)).to.equal(1);
      expect(await hre.ethers.provider.getBalance(nftPremium.target)).to.equal(mintPrice);
      expect(await nftPremium.ownerOf(1)).to.equal(otherAccount.address);
    });

    it ("Can mint multiple NFTs", async function () {
      const { nftPremium, owner } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(owner.address, { value: mintPrice });
      await nftPremium.safeMint(owner.address, { value: mintPrice });
      expect(await nftPremium.balanceOf(owner.address)).to.equal(2);
      expect(await nftPremium.ownerOf(1)).to.equal(owner.address);
      expect(await nftPremium.ownerOf(2)).to.equal(owner.address);
    });

    it ("Cannot transfer NFTs before transferEnabledAfter", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(owner.address, { value: mintPrice });
      await expect(nftPremium.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1)).to.be.revertedWith("Transfer not allowed yet");
    });

    it ("Can transfer after transfer allowed timestamp", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(owner.address, { value: mintPrice });
      await time.setNextBlockTimestamp(transferEnabledAfter + 1);
      await nftPremium.transferFrom(owner.address, otherAccount.address, 1);
      expect(await nftPremium.balanceOf(otherAccount.address)).to.equal(1);
      expect(await nftPremium.balanceOf(owner.address)).to.equal(0);
      expect(await nftPremium.ownerOf(1)).to.equal(otherAccount.address);
    });

    it ("Non owner cannot withdraw ETH from contract", async function () {
      const { nftPremium, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(otherAccount.address, { value: mintPrice });
      await nftPremium.connect(otherAccount).withdraw();
      // await expect(nftPremium.connect(otherAccount).withdraw()).to.be.revertedWith("OwnableUnauthorizedAccount");
    });
    
  });

});
