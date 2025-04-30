import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("SolverNodesStandard", function () {

  const name = "Reppo Standard";
  const symbol = "REPPOS";
  const metadataBaseURI = "https://ipfs/io/";
  const mintFee = hre.ethers.parseEther("0.22");
  const discountedMintFee = hre.ethers.parseEther("0.20");
  const transferEnabledAfter = 1777786226;
  const mintCapId = 15000;
  const whitelistCollection: `0x${string}`[] = [];

  async function deployGhibiliCollection() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const GhibiliCollection = await hre.ethers.getContractFactory("NFT");
    const ghibiliCollection = await GhibiliCollection.deploy(owner.address, "Ghibili Collection Two", "GCT");
    return { ghibiliCollection, owner, otherAccount };
  }

  async function deployStandardSolverNodes() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const SolverNode = await hre.ethers.getContractFactory("SolverNodesStandard");
    const standardSolverNodes = await SolverNode.deploy(
      name,
      symbol,
      owner,
      metadataBaseURI,
      mintFee,
      discountedMintFee,
      transferEnabledAfter,
      owner.address,
      owner.address,
      owner.address,
      owner.address,
      whitelistCollection,
    );
    return { standardSolverNodes, owner, otherAccount };
  }

  describe ("Parameters", function () {

    it ("Has correct constructor parameters", async function () {
      const [owner] = await hre.ethers.getSigners();
      const { standardSolverNodes } = await loadFixture(deployStandardSolverNodes);
      expect(await standardSolverNodes.name()).to.equal(name);
      expect(await standardSolverNodes.symbol()).to.equal(symbol);
      expect(await standardSolverNodes.owner()).to.equal(owner.address);
      expect(await standardSolverNodes.transferEnabledAfter()).to.equal(transferEnabledAfter);
      expect(await standardSolverNodes.metadataBaseURI()).to.equal(metadataBaseURI);
      expect(await standardSolverNodes.mintFee()).to.equal(mintFee);
      expect(await standardSolverNodes.discountedMintFee()).to.equal(discountedMintFee);
    });

  });

  describe ("Minting", function () {

    it ("Throws an error when trying to mint a SolverNode with incorrect ether amount", async function () {
      const { standardSolverNodes, owner } = await loadFixture(deployStandardSolverNodes);
      await expect(standardSolverNodes.safeMint(owner.address, { value: hre.ethers.parseEther("0.01") })).to.be.revertedWith("Incorrect Ether sent");
    });

    it ("Non whitelisted user can mint a SolverNode with standard minting fee", async function () {
      const { standardSolverNodes, owner } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.safeMint(owner.address, { value: mintFee });
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(1);
      expect(await hre.ethers.provider.getBalance(standardSolverNodes.target)).to.equal(mintFee);
      expect(await standardSolverNodes.ownerOf(1)).to.equal(owner.address);
    });

    it ("Throws an error when a non whitelisted user trying to mint a SolverNode with discounted minting fee", async function () {
      const { standardSolverNodes, owner } = await loadFixture(deployStandardSolverNodes);
      await expect(standardSolverNodes.safeMint(owner.address, { value: discountedMintFee })).to.be.revertedWith("Incorrect Ether sent");
    });

    it ("Can mint up to max allowed SolverNode mints", async function () {
      const { standardSolverNodes, owner } = await loadFixture(deployStandardSolverNodes);
      for (let i = 0; i < mintCapId; i++) {
        await standardSolverNodes.safeMint(owner.address, { value: mintFee });
      }
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(mintCapId);
      await expect(standardSolverNodes.safeMint(owner.address, { value: mintFee })).to.be.revertedWith("Max supply reached");
    });

    it ("Emits Minted event when SolverNode is minted", async function () {
      const { standardSolverNodes, owner } = await loadFixture(deployStandardSolverNodes);
      await expect(standardSolverNodes.safeMint(owner.address, { value: mintFee }))
        .to.emit(standardSolverNodes, "Minted")
        .withArgs(owner.address, 1);
    });
    
  });

  describe ("Transfering", function () {

    it ("Cannot transfer NFTs before transferEnabledAfter", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.safeMint(owner.address, { value: mintFee });
      await expect(standardSolverNodes.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1)).to.be.revertedWith("Transfer not allowed yet");
    });

    it ("Can transfer after transfer allowed timestamp", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.safeMint(owner.address, { value: mintFee });
      await time.setNextBlockTimestamp(transferEnabledAfter + 1);
      await standardSolverNodes.transferFrom(owner.address, otherAccount.address, 1);
      expect(await standardSolverNodes.balanceOf(otherAccount.address)).to.equal(1);
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(0);
      expect(await standardSolverNodes.ownerOf(1)).to.equal(otherAccount.address);
    });

    it ("Can transfer NFTs to allowed whitelist addresses before transferEnabledAfter", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.safeMint(owner.address, { value: mintFee });
      await standardSolverNodes.setTransferAllowedWhitelist([otherAccount.address]);
      await standardSolverNodes.transferFrom(owner.address, otherAccount.address, 1);
      expect(await standardSolverNodes.balanceOf(otherAccount.address)).to.equal(1);
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(0);
      expect(await standardSolverNodes.ownerOf(1)).to.equal(otherAccount.address);
    });

    it ("Can not transfer NFTs to an address not in the whitelist addresses before transferEnabledAfter", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.safeMint(owner.address, { value: mintFee });
      await expect(standardSolverNodes.transferFrom(owner.address, otherAccount.address, 1)).to.be.revertedWith("Transfer not allowed yet");
    });
    
  });

  describe ("Withdrawals", function () {

    it ("Non owner cannot withdraw ETH from contract", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.safeMint(otherAccount.address, { value: mintFee });
      await expect(standardSolverNodes.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(standardSolverNodes, "OwnableUnauthorizedAccount");
    });

    it ("Owner can withdraw ETH from contract", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.safeMint(otherAccount.address, { value: mintFee });
      const initialBalance = await hre.ethers.provider.getBalance(owner.address);
      await standardSolverNodes.withdraw();
      const finalBalance = await hre.ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });
    
  });

  describe ("Claims", function () {

    it ("User without a claimable token cannot claim SolverNode", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      const { ghibiliCollection } = await loadFixture(deployGhibiliCollection);
      await standardSolverNodes.setGhibiliCollection(ghibiliCollection.target);
      await ghibiliCollection.safeMint(otherAccount.address, 'uri');
      await expect(standardSolverNodes.safeClaimGhibiliCollection(1)).to.be.revertedWith("Not the owner of claimable token");
    });

    it ("User with a claimable token can claim SolverNode", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      const { ghibiliCollection } = await loadFixture(deployGhibiliCollection);
      await standardSolverNodes.setGhibiliCollection(ghibiliCollection.target);
      await ghibiliCollection.safeMint(owner.address, 'uri');
      expect(await ghibiliCollection.balanceOf(owner.address)).to.equal(1);
      expect(await ghibiliCollection.ownerOf(1)).to.equal(owner.address);
      await standardSolverNodes.safeClaimGhibiliCollection(1);
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(1);
      expect(await standardSolverNodes.ownerOf(15001)).to.equal(owner.address);
    });

    it ("User with multiple claimable tokens from same collection can claim SolverNodes", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      const { ghibiliCollection } = await loadFixture(deployGhibiliCollection);
      await standardSolverNodes.setGhibiliCollection(ghibiliCollection.target);
      await ghibiliCollection.safeMint(owner.address, 'uri');
      await ghibiliCollection.safeMint(owner.address, 'uri');
      expect(await ghibiliCollection.balanceOf(owner.address)).to.equal(2);
      expect(await ghibiliCollection.ownerOf(1)).to.equal(owner.address);
      expect(await ghibiliCollection.ownerOf(2)).to.equal(owner.address);
      await standardSolverNodes.safeClaimGhibiliCollection(1);
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(1);
      expect(await standardSolverNodes.ownerOf(15001)).to.equal(owner.address);
      await standardSolverNodes.safeClaimGhibiliCollection(2);
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(2);
      expect(await standardSolverNodes.ownerOf(15002)).to.equal(owner.address);
    });

    it ("User can not use the same claimable token to claim multiple SolverNodes", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      const { ghibiliCollection } = await loadFixture(deployGhibiliCollection);
      await standardSolverNodes.setGhibiliCollection(ghibiliCollection.target);
      await ghibiliCollection.safeMint(owner.address, 'uri');
      expect(await ghibiliCollection.balanceOf(owner.address)).to.equal(1);
      expect(await ghibiliCollection.ownerOf(1)).to.equal(owner.address);
      await standardSolverNodes.safeClaimGhibiliCollection(1);
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(1);
      expect(await standardSolverNodes.ownerOf(15001)).to.equal(owner.address);
      await expect(standardSolverNodes.safeClaimGhibiliCollection(1)).to.be.revertedWith("Already claimed");
    });

    it ("User can not use the same claimable token to claim multiple SolverNodes after transferring", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      const { ghibiliCollection } = await loadFixture(deployGhibiliCollection);
      await standardSolverNodes.setGhibiliCollection(ghibiliCollection.target);
      await ghibiliCollection.safeMint(owner.address, 'uri');
      expect(await ghibiliCollection.balanceOf(owner.address)).to.equal(1);
      expect(await ghibiliCollection.ownerOf(1)).to.equal(owner.address);
      await standardSolverNodes.safeClaimGhibiliCollection(1);
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(1);
      expect(await standardSolverNodes.ownerOf(15001)).to.equal(owner.address);
      await ghibiliCollection.transferFrom(owner.address, otherAccount.address, 1);
      await expect(standardSolverNodes.connect(otherAccount).safeClaimGhibiliCollection(1)).to.be.revertedWith("Already claimed");
    });

    it ("Emits Claimed event when SolverNode is claimed", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      const { ghibiliCollection } = await loadFixture(deployGhibiliCollection);
      await standardSolverNodes.setGhibiliCollection(ghibiliCollection.target);
      await ghibiliCollection.safeMint(owner.address, 'uri');
      await expect(standardSolverNodes.safeClaimGhibiliCollection(1))
        .to.emit(standardSolverNodes, "Claimed")
        .withArgs(owner.address, 15001, 1, 'Ghibili');
    });
    
  });

  describe ("Whitelisting", function () {

    it ("Non owner cannot add to whitelist", async function () {
      const { standardSolverNodes, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await expect(standardSolverNodes.connect(otherAccount).addToWhitelist([otherAccount.address])).to.be.revertedWithCustomError(standardSolverNodes, "OwnableUnauthorizedAccount");
    });

    it ("Owner can add to whitelist", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.addToWhitelist([otherAccount.address]);
      expect(await standardSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
    });

    it ("Owner can remove from whitelist", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.addToWhitelist([otherAccount.address]);
      expect(await standardSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      await standardSolverNodes.removeFromWhitelist([otherAccount.address]);
      expect(await standardSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(false);
    });

    it ("Can add multiple addresses to whitelist", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.addToWhitelist([otherAccount.address, owner.address]);
      expect(await standardSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      expect(await standardSolverNodes.isAddressWhitelisted(owner.address)).to.equal(true);
    });

    it ("Can remove multiple addresses from whitelist", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.addToWhitelist([otherAccount.address, owner.address]);
      expect(await standardSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      expect(await standardSolverNodes.isAddressWhitelisted(owner.address)).to.equal(true);
      await standardSolverNodes.removeFromWhitelist([otherAccount.address, owner.address]);
      expect(await standardSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(false);
      expect(await standardSolverNodes.isAddressWhitelisted(owner.address)).to.equal(false);
    });

    it ("Can check if an address is whitelisted", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.addToWhitelist([otherAccount.address]);
      expect(await standardSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      expect(await standardSolverNodes.isAddressWhitelisted(owner.address)).to.equal(false);
    });

    it ("Can check if an address is whitelisted for whitelisted collection holder", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      const { ghibiliCollection } = await loadFixture(deployGhibiliCollection);
      await standardSolverNodes.setWhitelistCollection([ghibiliCollection.target]);
      await ghibiliCollection.safeMint(owner.address, 'uri');
      expect(await standardSolverNodes.isAddressWhitelisted(owner.address)).to.equal(true);
      expect(await standardSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(false);
    });

    it ("Whitelisted collection holder can buy SolverNode at discount", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      const { ghibiliCollection } = await loadFixture(deployGhibiliCollection);
      await standardSolverNodes.setWhitelistCollection([ghibiliCollection.target]);
      await ghibiliCollection.safeMint(owner.address, 'uri');
      await standardSolverNodes.safeMintWhitelist({ value: discountedMintFee });
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(1);
      expect(await hre.ethers.provider.getBalance(standardSolverNodes.target)).to.equal(discountedMintFee);
      expect(await standardSolverNodes.ownerOf(1)).to.equal(owner.address);
    });

    it ("Whitelisted collection holder can buy multiple SolverNodes at discount", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      const { ghibiliCollection } = await loadFixture(deployGhibiliCollection);
      await standardSolverNodes.setWhitelistCollection([ghibiliCollection.target]);
      await ghibiliCollection.safeMint(owner.address, 'uri');
      await standardSolverNodes.safeMintWhitelist({ value: discountedMintFee });
      await standardSolverNodes.safeMintWhitelist({ value: discountedMintFee });
      await standardSolverNodes.safeMintWhitelist({ value: discountedMintFee });
      expect(await standardSolverNodes.balanceOf(owner.address)).to.equal(3);
    });

    it ("Manualy whitelisted address can buy multiple SolverNodes at discount", async function () {
      const { standardSolverNodes, owner, otherAccount } = await loadFixture(deployStandardSolverNodes);
      await standardSolverNodes.addToWhitelist([otherAccount.address]);
      expect(await standardSolverNodes.isAddressWhitelisted(otherAccount.address)).to.equal(true);
      await standardSolverNodes.connect(otherAccount).safeMintWhitelist({ value: discountedMintFee });
      await standardSolverNodes.connect(otherAccount).safeMintWhitelist({ value: discountedMintFee });
      expect(await standardSolverNodes.balanceOf(otherAccount.address)).to.equal(2);
      expect(await standardSolverNodes.ownerOf(1)).to.equal(otherAccount.address);
      expect(await standardSolverNodes.ownerOf(2)).to.equal(otherAccount.address);
    });

  });

});
