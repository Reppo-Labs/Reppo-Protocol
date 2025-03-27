import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { createPodType1, createPodType2, createPodType3 } from "./commons";

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

  describe("Create pod", function () {

    it("Can create a pod with single owner", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const {
        podId,
        podName,
        updateAdmin,
        owners,
        percentages,
        ip,
      } = await createPodType1(ownership, owner.address);
      const pod = await ownership.getPod(podId);
      expect(pod.podId).to.equal(podId);
      expect(pod.podName).to.equal(podName);
      expect(pod.updateAdmin).to.equal(updateAdmin);
      expect(pod.owners).to.eql(owners);
      expect(pod.ownershipPercentages).to.eql(percentages);
      expect(pod.ip).to.eql(ip);
    });

    it("Can create a pod with multiple owners", async function () {
      const { ownership, owner, otherAccount } = await deployOwnership();
      const {
        podId,
        podName,
        updateAdmin,
        owners,
        percentages,
        ip,
      } = await createPodType2(ownership, owner.address, otherAccount.address);
      const pod = await ownership.getPod(podId);
      expect(pod.podId).to.equal(podId);
      expect(pod.podName).to.equal(podName);
      expect(pod.updateAdmin).to.equal(updateAdmin);
      expect(pod.owners).to.eql(owners);
      expect(pod.ownershipPercentages).to.eql(percentages);
      expect(pod.ip).to.eql(ip);
    });

    it ("Throws an error when creating pod with invalid percentages", async function () {
      const { ownership, owner, otherAccount } = await deployOwnership();
      const podId = "model01";
      const description = "model 01 description";
      const multiSigContract = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners = [owner.address, otherAccount.address];
      const percentages = [6000n, 5000n];
      const ip = "ip url";
      await expect(ownership.createPod(
        podId,
        description,
        multiSigContract,
        owners,
        percentages,
        ip
      )).to.be.revertedWith("Total percentage should be 100");
    });

    it ("Throws an error when creating pod with mismatching owners & percentages", async function () {
      const { ownership, owner, otherAccount } = await deployOwnership();
      const modelId = "model01";
      const description = "model 01 description";
      const multiSigContract = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners = [owner.address];
      const percentages = [6000n, 4000n];
      const ip = " ip url";
      await expect(ownership.createPod(
        modelId,
        description,
        multiSigContract,
        owners,
        percentages,
        ip
      )).to.be.revertedWith("Owners and percentages length should be equal");
    });

    it ("Throws an error when creating pod with duplicate modelId", async function () {
      const { ownership, owner } = await deployOwnership();
      const {
        podId,
        podName,
        updateAdmin,
        owners,
        percentages,
        ip,
      } = await createPodType1(ownership, owner.address);
      await expect(ownership.createPod(
        podId,
        podName,
        updateAdmin,
        owners,
        percentages,
        ip
      )).to.be.revertedWith("Pod already exists");
    });

    it ("Emits PodCreated event when pod is created", async function () {
      const { ownership, owner } = await deployOwnership();
      const podId = "model01";
      const description = "model 01 description";
      const updateAdmin = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const owners = [owner.address];
      const percentages = [10000n];
      const ip = " ip url";
      await expect(ownership.createPod(
        podId,
        description,
        updateAdmin,
        owners,
        percentages,
        ip
      )).to.emit(ownership, "PodCreated").withArgs(
        podId,
        owner.address,
      );
    });

  });

  describe("Update pod", function () {

    it ("Throws an error when update is called with invalid modelId", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const owners = [owner.address];
      const percentages = [10000n];
      const description = "new description";
      const updateAdmin = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
      const ip = " ip url";
      await expect(ownership.updatePod(
        "model01",
        description,
        updateAdmin,
        owners,
        percentages,
        ip,
      )).to.be.revertedWith("Pod does not exist");
    });

    it("Throws an error when update is called by non-multisig", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const {
        podId,
        podName,
        updateAdmin,
        owners,
        percentages,
        ip,
      } = await createPodType1(ownership, owner.address);
      const newDescription: string = "new description";
      await expect(ownership.connect(owner).updatePod(
        podId,
        newDescription,
        updateAdmin,
        owners,
        percentages,
        ip
      )).to.be.revertedWith("Only updateAdmin contract can update pod");
    });

    it("Mulitsig can update a pod", async function () {
      const { ownership, owner, otherAccount } = await loadFixture(deployOwnership);
      const { multisig } = await loadFixture(deployMultisig);
      const {
        podId,
        podName,
        updateAdmin,
        owners,
        percentages,
        ip,
      } = await createPodType3(ownership, owner.address, multisig.target);
      const newDescription = "new description";
      const newOwners = [owner.address, otherAccount.address];
      const newPercentages = [4000n, 6000n];
      await multisig.updatePod(
        podId,
        newDescription,
        updateAdmin,
        newOwners,
        newPercentages,
        ip
      );
      const pod = await ownership.getPod(podId);
      expect(pod.podId).to.equal(podId);
      expect(pod.podName).to.equal(newDescription);
      expect(pod.updateAdmin).to.equal(updateAdmin);
      expect(pod.owners).to.eql(newOwners);
      expect(pod.ownershipPercentages).to.eql(newPercentages);
    });

    it ("Emits PodUpdated event when pod is updated", async function () {
      const { ownership, owner } = await loadFixture(deployOwnership);
      const { multisig } = await loadFixture(deployMultisig);
      const {
        podId,
        podName,
        updateAdmin,
        owners,
        percentages,
        ip,
      } = await createPodType3(ownership, owner.address, multisig.target);
      const newDescription: string = "new description";
      await expect(multisig.updatePod(
        podId,
        newDescription,
        updateAdmin,
        owners,
        percentages,
        ip
      )).to.emit(ownership, "PodUpdated").withArgs(
        podId,
      );
    });

  });

});
