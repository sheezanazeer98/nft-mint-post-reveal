const { ethers, upgrades } = require("hardhat");

async function main() {
  const NFT1155 = await ethers.getContractFactory("NftContract");
  const nft1155 = await upgrades.deployProxy(NFT1155);

  await nft1155.deployed();

  console.log("NFT1155 contract deployed to:", nft1155.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
