import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { createRecordType1, createRecordType2, createRecordType3 } from "./commons";

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
      const {
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses,
      } = await createRecordType1(ownership, owner.address);
      const record = await ownership.getRecord(podId);
      expect(record.podId).to.equal(podId);
      expect(record.podDescription).to.equal(podDescription);
      expect(record.updateAdmin).to.equal(updateAdmin);
      expect(record.owners).to.eql(owners);
      expect(record.ownershipPercentages).to.eql(percentages);
      expect(record.ipAccountAddresses).to.eql(ipAccountAddresses);
    });

    it("Can create a record with multiple owners", async function () {
      const { ownership, owner, otherAccount } = await deployOwnership();
      const {
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses,
      } = await createRecordType2(ownership, owner.address, otherAccount.address);
      const record = await ownership.getRecord(podId);
      expect(record.podId).to.equal(podId);
      expect(record.podDescription).to.equal(podDescription);
      expect(record.updateAdmin).to.equal(updateAdmin);
      expect(record.owners).to.eql(owners);
      expect(record.ownershipPercentages).to.eql(percentages);
      expect(record.ipAccountAddresses).to.eql(ipAccountAddresses);
    });

    it ("Throws an error when creating record with invalid percentages", async function () {
      const { ownership, owner, otherAccount } = await deployOwnership();
      const podId = "model01";
      const description = "model 01 description";
      const multiSigContract = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners = [owner.address, otherAccount.address];
      const percentages = [6000n, 5000n];
      const ipAccountAddresses = ["0x498B805b14cA0318aB6C7FfFb1fAd80db172780E"];
      await expect(ownership.createRecord(
        podId,
        description,
        multiSigContract,
        owners,
        percentages,
        ipAccountAddresses
      )).to.be.revertedWith("Total percentage should be 100");
    });

    it ("Throws an error when creating record with mismatching owners & percentages", async function () {
      const { ownership, owner, otherAccount } = await deployOwnership();
      const modelId = "model01";
      const description = "model 01 description";
      const multiSigContract = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners = [owner.address];
      const percentages = [6000n, 4000n];
      const ipAccountAddresses = ["0x498B805b14cA0318aB6C7FfFb1fAd80db172780E"];
      await expect(ownership.createRecord(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages,
        ipAccountAddresses
      )).to.be.revertedWith("Owners and percentages length should be equal");
    });

    it ("Throws an error when creating record with duplicate modelId", async function () {
      const { ownership, owner } = await deployOwnership();
      const {
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses,
      } = await createRecordType1(ownership, owner.address);
      await expect(ownership.createRecord(
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses
      )).to.be.revertedWith("Record already exists");
    });

    it ("Emits RecordCreated event when record is created", async function () {
      const { ownership, owner } = await deployOwnership();
      const podId = "model01";
      const description = "model 01 description";
      const updateAdmin = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners = [owner.address];
      const percentages = [10000n];
      const ipAccountAddresses = ["0x498B805b14cA0318aB6C7FfFb1fAd80db172780E"];
      await expect(ownership.createRecord(
        podId,
        description,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses
      )).to.emit(ownership, "RecordCreated").withArgs(
        podId,
        owner.address,
      );
    });

  });

  describe("Update record", function () {

    it ("Throws an error when update is called with invalid modelId", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const owners = [owner.address];
      const percentages = [10000n];
      const description = "new description";
      const updateAdmin = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const ipAccountAddresses = ["0x498B805b14cA0318aB6C7FfFb1fAd80db172780E"];
      await expect(ownership.updateRecord(
        "model01",
        description,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses
      )).to.be.revertedWith("Record does not exist");
    });

    it("Throws an error when update is called by non-multisig", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const {
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses,
      } = await createRecordType1(ownership, owner.address);
      const newDescription: string = "new description";
      await expect(ownership.connect(owner).updateRecord(
        podId,
        newDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses
      )).to.be.revertedWith("Only multisig contract can update record");
    });

    it("Mulitsig can update a record", async function () {
      const { ownership, owner, otherAccount } = await loadFixture(deployOwnership);
      const { multisig } = await loadFixture(deployMultisig);
      const {
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses,
      } = await createRecordType3(ownership, owner.address, multisig.target);
      const newDescription = "new description";
      const newOwners = [owner.address, otherAccount.address];
      const newPercentages = [4000n, 6000n];
      await multisig.updateRecord(
        podId,
        newDescription,
        updateAdmin,
        newOwners,
        newPercentages,
        ipAccountAddresses
      );
      const record = await ownership.getRecord(podId);
      expect(record.podId).to.equal(podId);
      expect(record.podDescription).to.equal(newDescription);
      expect(record.updateAdmin).to.equal(updateAdmin);
      expect(record.owners).to.eql(newOwners);
      expect(record.ownershipPercentages).to.eql(newPercentages);
    });

    it ("Emits RecordUpdated event when record is updated", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const { multisig } = await loadFixture(deployMultisig);
      const {
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses,
      } = await createRecordType3(ownership, owner.address, multisig.target);
      const newDescription: string = "new description";
      await expect(multisig.updateRecord(
        podId,
        newDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses
      )).to.emit(ownership, "RecordUpdated").withArgs(
        podId,
      );
    });

  });

});
