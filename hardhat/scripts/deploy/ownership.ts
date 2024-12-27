import { ethers } from 'hardhat';

async function main() {
    const ownership = await ethers.deployContract('Ownership');
    await ownership.waitForDeployment();
    console.log('Ownership contract deployed at ' + ownership.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});