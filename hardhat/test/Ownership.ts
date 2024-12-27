import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Ownership", function () {

  async function deployOwnership() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const Ownership = await hre.ethers.getContractFactory("Ownership");
    const ownership = await Ownership.deploy();
    return { ownership, owner, otherAccount };
  }

  async function deployMultisig() {
    const MultiSig = await hre.ethers.getContractFactory("Multisig");
    const { ownership } = await loadFixture(deployOwnership);
    const ownershipContractAddress = ownership.target;
    const multisig = await MultiSig.deploy(ownershipContractAddress);
    return { multisig, ownershipContractAddress }; 
  }

  describe ("Deploy multisig", function () {

    it ("Can deploy multisig contract with correct constructor parameters", async function () {
      const { multisig, ownershipContractAddress } = await loadFixture(deployMultisig);
      expect(await multisig.ownershipContract()).to.equal(ownershipContractAddress);
    });

  });

  describe("Create record", function () {

    it("Can create a record with single owner", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const modelId: string = "model01";
      const description: string = "model 01 description";
      const multiSigContract: string = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners: string[] = [owner.address];
      const percentages: bigint[] = [100n];
      await ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages
      );
      const record = await ownership.getRecord(modelId);
      expect(record.modelId).to.equal(modelId);
      expect(record.description).to.equal(description);
      expect(record.multiSigContract).to.equal(multiSigContract);
      expect(record.owners).to.eql(owners);
      expect(record.percentages).to.eql(percentages);
    });

    it("Can create a record with multiple owners", async function () {
      const { ownership, owner, otherAccount } = await deployOwnership();
      const modelId: string = "model01";
      const description: string = "model 01 description";
      const multiSigContract: string = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners: string[] = [owner.address, otherAccount.address];
      const percentages: bigint[] = [60n, 40n];
      await ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages
      );
      const record = await ownership.getRecord(modelId);
      expect(record.modelId).to.equal(modelId);
      expect(record.description).to.equal(description);
      expect(record.multiSigContract).to.equal(multiSigContract);
      expect(record.owners).to.eql(owners);
      expect(record.percentages).to.eql(percentages);
    });

    it ("Throws an error when creating record with invalid percentages", async function () {
      const { ownership, owner, otherAccount } = await deployOwnership();
      const modelId: string = "model01";
      const description: string = "model 01 description";
      const multiSigContract: string = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners: string[] = [owner.address, otherAccount.address];
      const percentages: bigint[] = [60n, 50n];
      await expect(ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages
      )).to.be.revertedWith("Total percentage should be 100");
    });

    it ("Throws an error when creating record with mismatching owners & percentages", async function () {
      const { ownership, owner, otherAccount } = await deployOwnership();
      const modelId: string = "model01";
      const description: string = "model 01 description";
      const multiSigContract: string = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners: string[] = [owner.address];
      const percentages: bigint[] = [60n, 40n];
      await expect(ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages
      )).to.be.revertedWith("Owners and percentages length should be equal");
    });

    it ("Throws an error when creating record with duplicate modelId", async function () {
      const { ownership, owner } = await deployOwnership();
      const modelId: string = "model01";
      const description: string = "model 01 description";
      const multiSigContract: string = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners: string[] = [owner.address];
      const percentages: bigint[] = [100n];
      await ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages
      );
      await expect(ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages
      )).to.be.revertedWith("Record already exists");
    });

    it ("Emits RecordCreated event when record is created", async function () {
      const { ownership, owner } = await deployOwnership();
      const modelId: string = "model01";
      const description: string = "model 01 description";
      const multiSigContract: string = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners: string[] = [owner.address];
      const percentages: bigint[] = [100n];
      await expect(ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages
      )).to.emit(ownership, "RecordCreated").withArgs(
        modelId,
        owner.address,
      );
    });

  });

  describe("Update record", function () {

    it ("Throws an error when update is called with invalid modelId", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const owners = [owner.address];
      const percentages = [100n];
      const description = "new description";
      await expect(ownership.updateRecord(
        "model01",
        description,
        owners,
        percentages,
      )).to.be.revertedWith("Record does not exist");
    });

    it("Throws an error when update is called by non-multisig", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const { multisig } = await loadFixture(deployMultisig);
      const modelId = "model01";
      const description = "model 01 description";
      const multiSigContract = multisig.target;
      const owners = [owner.address];
      const percentages = [100n];
      await ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages
      );
      const newDescription: string = "new description";
      await expect(ownership.connect(owner).updateRecord(
        modelId,
        newDescription,
        owners,
        percentages,
      )).to.be.revertedWith("Only multisig contract can update record");
    });

    it("Mulitsig can update a record", async function () {
      const { ownership, owner, otherAccount } = await loadFixture(deployOwnership);
      const { multisig } = await loadFixture(deployMultisig);
      const modelId = "model01";
      const description = "model 01 description";
      const multiSigContract = multisig.target;
      const owners = [owner.address, otherAccount.address];
      const percentages = [10n, 90n];
      await ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages
      );
      const newDescription: string = "new description";
      const newPercentages = [40n, 60n];
      await multisig.updateRecord(
        modelId,
        newDescription,
        owners,
        newPercentages,
      );
      const record = await ownership.getRecord(modelId);
      expect(record.modelId).to.equal(modelId);
      expect(record.description).to.equal(newDescription);
      expect(record.multiSigContract).to.equal(multiSigContract);
      expect(record.owners).to.eql(owners);
      expect(record.percentages).to.eql(newPercentages);
    });

    it ("Emits RecordUpdated event when record is updated", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const { multisig } = await loadFixture(deployMultisig);
      const modelId = "model01";
      const description = "model 01 description";
      const multiSigContract = multisig.target;
      const owners = [owner.address];
      const percentages = [100n];
      await ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages
      );
      const newDescription: string = "new description";
      await expect(multisig.updateRecord(
        modelId,
        newDescription,
        owners,
        percentages,
      )).to.emit(ownership, "RecordUpdated").withArgs(
        modelId,
      );
    });

  });

});
