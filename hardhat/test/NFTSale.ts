import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("NFTSale", function () {

  const premiumNFTCollectionName = "Reppo Premium";
  const premiumNFTCollectionSymbol = "REPPOP";
  const premiumNFTCollectionSize = 1000;
  const standardNFTCollectionName = "Reppo Standard";
  const standardNFTCollectionSymbol = "REPPOS";
  const standardNFTCollectionSize = 2000;

  async function deployPremiumNFT() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const NFT = await hre.ethers.getContractFactory("NFT");
    const nftPremium = await NFT.deploy(owner.address, premiumNFTCollectionName, premiumNFTCollectionSymbol);
    return { nftPremium, owner, otherAccount };
  }

  async function deployStandardNFT() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const NFT = await hre.ethers.getContractFactory("NFT");
    const nftStandard = await NFT.deploy(owner.address, standardNFTCollectionName, standardNFTCollectionSymbol);
    return { nftStandard, owner, otherAccount };
  }

  async function deployNFTSale() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const NFTSale = await hre.ethers.getContractFactory("NFTSale");
    const nftSale = await NFTSale.deploy(owner.address);
    const { nftPremium } = await loadFixture(deployPremiumNFT);
    await nftSale.setPremiumCollection(nftPremium.target, premiumNFTCollectionSize);
    const { nftStandard } = await loadFixture(deployStandardNFT);
    await nftSale.setStandardCollection(nftStandard.target, standardNFTCollectionSize);
    return { nftSale, nftPremium: nftPremium.target, nftStandard: nftStandard.target, owner, otherAccount }; 
  }

  describe ("Deploy NFTSale", function () {

    it ("Can deploy NFT Sale contract with correct constructor parameters", async function () {
      const [owner, otherAccount] = await hre.ethers.getSigners();
      const { nftSale, nftPremium, nftStandard } = await loadFixture(deployNFTSale);
      expect(await nftSale.owner()).to.equal(owner.address);
      expect(await nftSale.premiumNFTCollection()).to.equal(nftPremium);
      expect(await nftSale.standardNFTCollection()).to.equal(nftStandard);
      expect(await nftSale.premiumNFTCollectionSize()).to.equal(premiumNFTCollectionSize);
      expect(await nftSale.standardNFTCollectionSize()).to.equal(standardNFTCollectionSize);
    });

  });

});
