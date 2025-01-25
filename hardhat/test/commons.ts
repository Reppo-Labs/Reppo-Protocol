import { Addressable, ContractTransactionResponse } from "ethers";
import { Ownership } from "../typechain-types";

export const createRecordType1 = async (
    ownershipContract: Ownership & { deploymentTransaction(): ContractTransactionResponse; }, 
    ownerAddress: string, 
) => {
    const podId = "model01";
    const podDescription = "model 01 description";
    const updateAdmin = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
    const owners = [ownerAddress];
    const percentages = [10000n];
    const ipAccountAddresses = ["0x498B805b14cA0318aB6C7FfFb1fAd80db172780E"];
    await ownershipContract.createRecord(
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses
    );
    return {
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses,
    }
}

export const createRecordType2 = async (
    ownershipContract: Ownership & { deploymentTransaction(): ContractTransactionResponse; }, 
    ownerAddress: string, 
    otherAddress: string,
) => {
    const podId = "model01";
    const podDescription = "model 01 description";
    const updateAdmin = "0x498B805b14cA0318aB6C7FfFb1fAd80db172780E";
    const owners = [ownerAddress, otherAddress];
    const percentages = [4000n, 6000n];
    const ipAccountAddresses = ["0x498B805b14cA0318aB6C7FfFb1fAd80db172780E"];
    await ownershipContract.createRecord(
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses
    );
    return {
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses,
    }
}

export const createRecordType3 = async (
    ownershipContract: Ownership & { deploymentTransaction(): ContractTransactionResponse; }, 
    ownerAddress: string, 
    updateAdmin: string | Addressable,
) => {
    const podId = "model01";
    const podDescription = "model 01 description";
    const owners = [ownerAddress];
    const percentages = [10000n];
    const ipAccountAddresses = ["0x498B805b14cA0318aB6C7FfFb1fAd80db172780E"];
    await ownershipContract.createRecord(
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses
    );
    return {
        podId,
        podDescription,
        updateAdmin,
        owners,
        percentages,
        ipAccountAddresses,
    }
}