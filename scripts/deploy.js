// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.


const { ethers, upgrades } = require("hardhat");

async function main() {
  const NFT1155Address = "ADDRESS_OF_NFT1155_CONTRACT"; // Replace with the actual deployed NFT1155 contract address

  const MintingContract = await ethers.getContractFactory("MintingContract");
  const mintingContract = await upgrades.deployProxy(MintingContract, [NFT1155Address]);

  await mintingContract.deployed();

  console.log("MintingContract deployed to:", mintingContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
