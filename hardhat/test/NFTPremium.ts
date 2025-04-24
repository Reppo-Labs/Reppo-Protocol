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
    return { nftPremium, owner, otherAccount, nftGenesis: nftGenesis.target, nftGenesisContract: nftGenesis };
  }

  describe ("Parameters", function () {

    it ("Has correct constructor parameters", async function () {
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

  });

  describe ("Minting", function () {

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

    it ("Can mint up to max allowed NFT mints", async function () {
      const { nftPremium, owner } = await loadFixture(deployPremiumNFTCollection);
      for (let i = 0; i < mintCapId; i++) {
        await nftPremium.safeMint(owner.address, { value: mintFee });
      }
      expect(await nftPremium.balanceOf(owner.address)).to.equal(mintCapId);
      await expect(nftPremium.safeMint(owner.address, { value: mintFee })).to.be.revertedWith("Max supply reached");
    });

    it ("Emits Minted event when NFT is minted", async function () {
      const { nftPremium, owner } = await loadFixture(deployPremiumNFTCollection);
      await expect(nftPremium.safeMint(owner.address, { value: mintFee }))
        .to.emit(nftPremium, "Minted")
        .withArgs(owner.address, currentMintTokenId, false);
    });
    
  });

  describe ("Transfering", function () {

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
    
  });

  describe ("Withdrawals", function () {

    it ("Non owner cannot withdraw ETH from contract", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(otherAccount.address, { value: mintFee });
      await expect(nftPremium.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(nftPremium, "OwnableUnauthorizedAccount");
    });

    it ("Owner can withdraw ETH from contract", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.safeMint(otherAccount.address, { value: mintFee });
      const initialBalance = await hre.ethers.provider.getBalance(owner.address);
      await nftPremium.withdraw();
      const finalBalance = await hre.ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });
    
  });

  describe ("Claims", function () {

    it ("User without a genesis token cannot claim NFT", async function () {
      const { nftPremium, owner, nftGenesisContract, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftGenesisContract.safeMint(otherAccount.address, 'uri');
      expect(await nftGenesisContract.balanceOf(otherAccount.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(otherAccount.address);
      await expect(nftPremium.safeClaim(owner.address, 1)).to.be.revertedWith("Not the owner of the genesis token");
    });

    it ("User with a genesis token can claim NFT", async function () {
      const { nftPremium, owner, nftGenesisContract, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftGenesisContract.safeMint(owner.address, 'uri');
      expect(await nftGenesisContract.balanceOf(owner.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(owner.address);
      await nftPremium.safeClaim(owner.address, 1);
      expect(await nftPremium.balanceOf(owner.address)).to.equal(1);
      expect(await nftPremium.ownerOf(currentClaimTokenId)).to.equal(owner.address);
      expect(await nftPremium.tokenURI(currentClaimTokenId)).to.equal(`${metadataBaseURI}${currentClaimTokenId}.json`);
    });

    it ("Emits Claimed event when NFT is claimed", async function () {
      const { nftPremium, owner, nftGenesisContract } = await loadFixture(deployPremiumNFTCollection);
      await nftGenesisContract.safeMint(owner.address, 'uri');
      expect(await nftGenesisContract.balanceOf(owner.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(owner.address);
      await expect(nftPremium.safeClaim(owner.address, 1))
        .to.emit(nftPremium, "Claimed")
        .withArgs(owner.address, currentClaimTokenId, 1);
    });

    it ("Same genesis NFT can not be used to claim repeatedly", async function () {
      const { nftPremium, owner, nftGenesisContract } = await loadFixture(deployPremiumNFTCollection);
      await nftGenesisContract.safeMint(owner.address, 'uri');
      expect(await nftGenesisContract.balanceOf(owner.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(owner.address);
      await nftPremium.safeClaim(owner.address, 1);
      expect(await nftPremium.balanceOf(owner.address)).to.equal(1);
      expect(await nftPremium.ownerOf(currentClaimTokenId)).to.equal(owner.address);
      await expect(nftPremium.safeClaim(owner.address, 1)).to.be.revertedWith("Token already claimed");
    });

    it ("Can claim up to max allowed NFT claims", async function () {
      const { nftPremium, owner, nftGenesisContract } = await loadFixture(deployPremiumNFTCollection);
      for (let i = currentClaimTokenId; i <= claimsCapId; i++) {
        await nftGenesisContract.safeMint(owner.address, 'uri');
        await nftPremium.safeClaim(owner.address, i - currentClaimTokenId + 1);
        expect(await nftPremium.balanceOf(owner.address)).to.equal(i - currentClaimTokenId + 1);
        expect(await nftPremium.ownerOf(i)).to.equal(owner.address);
      }
      await expect(nftPremium.safeClaim(owner.address, claimsCapId)).to.be.revertedWith("Max supply reached");
    });

    it ("After claiming, transferring the genesis token to another address, does not allow to claim again", async function () {
      const { nftPremium, owner, nftGenesisContract, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftGenesisContract.safeMint(owner.address, 'uri');
      expect(await nftGenesisContract.balanceOf(owner.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(owner.address);
      await nftPremium.safeClaim(owner.address, 1);
      expect(await nftPremium.balanceOf(owner.address)).to.equal(1);
      expect(await nftPremium.ownerOf(currentClaimTokenId)).to.equal(owner.address);
      await nftGenesisContract.transferFrom(owner.address, otherAccount.address, 1);
      expect(await nftGenesisContract.balanceOf(otherAccount.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(otherAccount.address);
      await expect(nftPremium.connect(otherAccount).safeClaim(otherAccount.address, 1)).to.be.revertedWith("Token already claimed");
    });
    
  });

  describe ("Whitelisting", function () {

    it ("Non owner cannot add to whitelist", async function () {
      const { nftPremium, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await expect(nftPremium.connect(otherAccount).addToWhitelist([otherAccount.address])).to.be.revertedWithCustomError(nftPremium, "OwnableUnauthorizedAccount");
    });

    it ("Owner can add to whitelist", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.addToWhitelist([otherAccount.address]);
      expect(await nftPremium.isAddressWhitelisted(otherAccount.address)).to.equal(true);
    });

    it ("Owner can remove from whitelist", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.addToWhitelist([otherAccount.address]);
      expect(await nftPremium.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      await nftPremium.removeFromWhitelist([otherAccount.address]);
      expect(await nftPremium.isAddressWhitelisted(otherAccount.address)).to.equal(false);
    });

    it ("Can add multiple addresses to whitelist", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.addToWhitelist([otherAccount.address, owner.address]);
      expect(await nftPremium.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      expect(await nftPremium.isAddressWhitelisted(owner.address)).to.equal(true);
    });

    it ("Can remove multiple addresses from whitelist", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.addToWhitelist([otherAccount.address, owner.address]);
      expect(await nftPremium.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      expect(await nftPremium.isAddressWhitelisted(owner.address)).to.equal(true);
      await nftPremium.removeFromWhitelist([otherAccount.address, owner.address]);
      expect(await nftPremium.isAddressWhitelisted(otherAccount.address)).to.equal(false);
      expect(await nftPremium.isAddressWhitelisted(owner.address)).to.equal(false);
    });

    it ("Can check if an address is whitelisted", async function () {
      const { nftPremium, owner, otherAccount } = await loadFixture(deployPremiumNFTCollection);
      await nftPremium.addToWhitelist([otherAccount.address]);
      expect(await nftPremium.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      expect(await nftPremium.isAddressWhitelisted(owner.address)).to.equal(false);
    });

  });

});
