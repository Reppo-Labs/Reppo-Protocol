import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { premiumCollectionMetadataBaseURI } from "../constants/nftCollection";

describe("Premium Solver Nodes", function () {

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

  async function deployClaimableNFTCollection() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const NFTClaimable = await hre.ethers.getContractFactory("NFT");
    const nftClaimable = await NFTClaimable.deploy(owner.address, "Reppo Genesis", "REPPG");
    return { nftClaimable, owner, otherAccount };
  }

  async function deployPremiumSolverNodes() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const NFT = await hre.ethers.getContractFactory("SolverNodes");
    const { nftClaimable } = await loadFixture(deployClaimableNFTCollection);
    const premiumSolverNodes = await NFT.deploy(
      name,
      symbol,
      owner,
      nftClaimable.target,
      currentMintTokenId,
      mintCapId,
      currentClaimTokenId,
      claimsCapId,
      metadataBaseURI,
      mintFee,
      discountedMintFee,
      transferEnabledAfter
    );
    return { premiumSolverNodes, owner, otherAccount, nftClaimable: nftClaimable.target, nftGenesisContract: nftClaimable };
  }

  describe ("Parameters", function () {

    it ("Has correct constructor parameters", async function () {
      const [owner] = await hre.ethers.getSigners();
      const { premiumSolverNodes, nftClaimable } = await loadFixture(deployPremiumSolverNodes);
      expect(await premiumSolverNodes.name()).to.equal(name);
      expect(await premiumSolverNodes.symbol()).to.equal(symbol);
      expect(await premiumSolverNodes.owner()).to.equal(owner.address);
      expect(await premiumSolverNodes.claimableCollection()).to.equal(nftClaimable);
      expect(await premiumSolverNodes.transferEnabledAfter()).to.equal(transferEnabledAfter);
      expect(await premiumSolverNodes.mintCapId()).to.equal(mintCapId);
      expect(await premiumSolverNodes.currentMintTokenId()).to.equal(currentMintTokenId);
      expect(await premiumSolverNodes.currentClaimTokenId()).to.equal(currentClaimTokenId);
      expect(await premiumSolverNodes.claimsCapId()).to.equal(claimsCapId);
      expect(await premiumSolverNodes.metadataBaseURI()).to.equal(metadataBaseURI);
      expect(await premiumSolverNodes.mintFee()).to.equal(mintFee);
      expect(await premiumSolverNodes.discountedMintFee()).to.equal(discountedMintFee);
    });

  });

  describe ("Minting", function () {

    it ("Throws an error when trying to mint a NFT with incorrect ether amount", async function () {
      const { premiumSolverNodes, owner } = await loadFixture(deployPremiumSolverNodes);
      await expect(premiumSolverNodes.safeMint(owner.address, { value: hre.ethers.parseEther("0.01") })).to.be.revertedWith("Incorrect Ether sent");
    });

    it ("Non whitelisted user can mint a NFT with standard minting fee", async function () {
      const { premiumSolverNodes, owner } = await loadFixture(deployPremiumSolverNodes);
      await premiumSolverNodes.safeMint(owner.address, { value: mintFee });
      expect(await premiumSolverNodes.balanceOf(owner.address)).to.equal(1);
      expect(await hre.ethers.provider.getBalance(premiumSolverNodes.target)).to.equal(mintFee);
      expect(await premiumSolverNodes.ownerOf(1)).to.equal(owner.address);
    });

    it ("Throws an error when a non whitelisted user trying to mint a NFT with discounted minting fee", async function () {
      const { premiumSolverNodes, owner } = await loadFixture(deployPremiumSolverNodes);
      await expect(premiumSolverNodes.safeMint(owner.address, { value: discountedMintFee })).to.be.revertedWith("Incorrect Ether sent");
    });

    // it ("Whitelisted user can mint a NFT with discounted minting fee", async function () {
    //   const { premiumSolverNodes, owner } = await loadFixture(deployPremiumNFTCollection);
    //   await premiumSolverNodes.addToWhitelist([owner.address]);
    //   await premiumSolverNodes.safeMint(owner.address, { value: discountedMintFee });
    //   expect(await premiumSolverNodes.balanceOf(owner.address)).to.equal(1);
    //   expect(await hre.ethers.provider.getBalance(premiumSolverNodes.target)).to.equal(discountedMintFee);
    //   expect(await premiumSolverNodes.ownerOf(1)).to.equal(owner.address);
    // });

    it ("Can mint up to max allowed NFT mints", async function () {
      const { premiumSolverNodes, owner } = await loadFixture(deployPremiumSolverNodes);
      for (let i = 0; i < mintCapId; i++) {
        await premiumSolverNodes.safeMint(owner.address, { value: mintFee });
      }
      expect(await premiumSolverNodes.balanceOf(owner.address)).to.equal(mintCapId);
      await expect(premiumSolverNodes.safeMint(owner.address, { value: mintFee })).to.be.revertedWith("Max supply reached");
    });

    it ("Emits Minted event when NFT is minted", async function () {
      const { premiumSolverNodes, owner } = await loadFixture(deployPremiumSolverNodes);
      await expect(premiumSolverNodes.safeMint(owner.address, { value: mintFee }))
        .to.emit(premiumSolverNodes, "Minted")
        .withArgs(owner.address, currentMintTokenId);
    });
    
  });

  describe ("Transfering", function () {

    it ("Cannot transfer NFTs before transferEnabledAfter", async function () {
      const { premiumSolverNodes, owner, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await premiumSolverNodes.safeMint(owner.address, { value: mintFee });
      await expect(premiumSolverNodes.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1)).to.be.revertedWith("Transfer not allowed yet");
    });

    it ("Can transfer after transfer allowed timestamp", async function () {
      const { premiumSolverNodes, owner, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await premiumSolverNodes.safeMint(owner.address, { value: mintFee });
      await time.setNextBlockTimestamp(transferEnabledAfter + 1);
      await premiumSolverNodes.transferFrom(owner.address, otherAccount.address, 1);
      expect(await premiumSolverNodes.balanceOf(otherAccount.address)).to.equal(1);
      expect(await premiumSolverNodes.balanceOf(owner.address)).to.equal(0);
      expect(await premiumSolverNodes.ownerOf(1)).to.equal(otherAccount.address);
    });
    
  });

  describe ("Withdrawals", function () {

    it ("Non owner cannot withdraw ETH from contract", async function () {
      const { premiumSolverNodes, owner, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await premiumSolverNodes.safeMint(otherAccount.address, { value: mintFee });
      await expect(premiumSolverNodes.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(premiumSolverNodes, "OwnableUnauthorizedAccount");
    });

    it ("Owner can withdraw ETH from contract", async function () {
      const { premiumSolverNodes, owner, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await premiumSolverNodes.safeMint(otherAccount.address, { value: mintFee });
      const initialBalance = await hre.ethers.provider.getBalance(owner.address);
      await premiumSolverNodes.withdraw();
      const finalBalance = await hre.ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });
    
  });

  describe ("Claims", function () {

    it ("User without a genesis token cannot claim NFT", async function () {
      const { premiumSolverNodes, owner, nftGenesisContract, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await nftGenesisContract.safeMint(otherAccount.address, 'uri');
      expect(await nftGenesisContract.balanceOf(otherAccount.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(otherAccount.address);
      await expect(premiumSolverNodes.safeClaim(owner.address, 1)).to.be.revertedWith("Not the owner of the token");
    });

    it ("User with a genesis token can claim NFT", async function () {
      const { premiumSolverNodes, owner, nftGenesisContract, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await nftGenesisContract.safeMint(owner.address, 'uri');
      expect(await nftGenesisContract.balanceOf(owner.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(owner.address);
      await premiumSolverNodes.safeClaim(owner.address, 1);
      expect(await premiumSolverNodes.balanceOf(owner.address)).to.equal(1);
      expect(await premiumSolverNodes.ownerOf(currentClaimTokenId)).to.equal(owner.address);
      expect(await premiumSolverNodes.tokenURI(currentClaimTokenId)).to.equal(`${metadataBaseURI}${currentClaimTokenId}.json`);
    });

    it ("Emits Claimed event when NFT is claimed", async function () {
      const { premiumSolverNodes, owner, nftGenesisContract } = await loadFixture(deployPremiumSolverNodes);
      await nftGenesisContract.safeMint(owner.address, 'uri');
      expect(await nftGenesisContract.balanceOf(owner.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(owner.address);
      await expect(premiumSolverNodes.safeClaim(owner.address, 1))
        .to.emit(premiumSolverNodes, "Claimed")
        .withArgs(owner.address, currentClaimTokenId, 1);
    });

    it ("Same genesis NFT can not be used to claim repeatedly", async function () {
      const { premiumSolverNodes, owner, nftGenesisContract } = await loadFixture(deployPremiumSolverNodes);
      await nftGenesisContract.safeMint(owner.address, 'uri');
      expect(await nftGenesisContract.balanceOf(owner.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(owner.address);
      await premiumSolverNodes.safeClaim(owner.address, 1);
      expect(await premiumSolverNodes.balanceOf(owner.address)).to.equal(1);
      expect(await premiumSolverNodes.ownerOf(currentClaimTokenId)).to.equal(owner.address);
      await expect(premiumSolverNodes.safeClaim(owner.address, 1)).to.be.revertedWith("Token already claimed");
    });

    it ("Can claim up to max allowed NFT claims", async function () {
      const { premiumSolverNodes, owner, nftGenesisContract } = await loadFixture(deployPremiumSolverNodes);
      for (let i = currentClaimTokenId; i <= claimsCapId; i++) {
        await nftGenesisContract.safeMint(owner.address, 'uri');
        await premiumSolverNodes.safeClaim(owner.address, i - currentClaimTokenId + 1);
        expect(await premiumSolverNodes.balanceOf(owner.address)).to.equal(i - currentClaimTokenId + 1);
        expect(await premiumSolverNodes.ownerOf(i)).to.equal(owner.address);
      }
      await expect(premiumSolverNodes.safeClaim(owner.address, claimsCapId)).to.be.revertedWith("Max supply reached");
    });

    it ("After claiming, transferring the genesis token to another address, does not allow to claim again", async function () {
      const { premiumSolverNodes, owner, nftGenesisContract, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await nftGenesisContract.safeMint(owner.address, 'uri');
      expect(await nftGenesisContract.balanceOf(owner.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(owner.address);
      await premiumSolverNodes.safeClaim(owner.address, 1);
      expect(await premiumSolverNodes.balanceOf(owner.address)).to.equal(1);
      expect(await premiumSolverNodes.ownerOf(currentClaimTokenId)).to.equal(owner.address);
      await nftGenesisContract.transferFrom(owner.address, otherAccount.address, 1);
      expect(await nftGenesisContract.balanceOf(otherAccount.address)).to.equal(1);
      expect(await nftGenesisContract.ownerOf(1)).to.equal(otherAccount.address);
      await expect(premiumSolverNodes.connect(otherAccount).safeClaim(otherAccount.address, 1)).to.be.revertedWith("Token already claimed");
    });
    
  });

  describe ("Whitelisting", function () {

    it ("Non owner cannot add to whitelist", async function () {
      const { premiumSolverNodes, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await expect(premiumSolverNodes.connect(otherAccount).addToWhitelist([otherAccount.address])).to.be.revertedWithCustomError(premiumSolverNodes, "OwnableUnauthorizedAccount");
    });

    it ("Owner can add to whitelist", async function () {
      const { premiumSolverNodes, owner, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await premiumSolverNodes.addToWhitelist([otherAccount.address]);
      expect(await premiumSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
    });

    it ("Owner can remove from whitelist", async function () {
      const { premiumSolverNodes, owner, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await premiumSolverNodes.addToWhitelist([otherAccount.address]);
      expect(await premiumSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      await premiumSolverNodes.removeFromWhitelist([otherAccount.address]);
      expect(await premiumSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(false);
    });

    it ("Can add multiple addresses to whitelist", async function () {
      const { premiumSolverNodes, owner, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await premiumSolverNodes.addToWhitelist([otherAccount.address, owner.address]);
      expect(await premiumSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      expect(await premiumSolverNodes.isAddressWhitelisted(owner.address)).to.equal(true);
    });

    it ("Can remove multiple addresses from whitelist", async function () {
      const { premiumSolverNodes, owner, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await premiumSolverNodes.addToWhitelist([otherAccount.address, owner.address]);
      expect(await premiumSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      expect(await premiumSolverNodes.isAddressWhitelisted(owner.address)).to.equal(true);
      await premiumSolverNodes.removeFromWhitelist([otherAccount.address, owner.address]);
      expect(await premiumSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(false);
      expect(await premiumSolverNodes.isAddressWhitelisted(owner.address)).to.equal(false);
    });

    it ("Can check if an address is whitelisted", async function () {
      const { premiumSolverNodes, owner, otherAccount } = await loadFixture(deployPremiumSolverNodes);
      await premiumSolverNodes.addToWhitelist([otherAccount.address]);
      expect(await premiumSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      expect(await premiumSolverNodes.isAddressWhitelisted(owner.address)).to.equal(false);
    });

  });

});
