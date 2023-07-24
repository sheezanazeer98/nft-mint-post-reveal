// Load required dependencies from Hardhat
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { Contract } = require("ethers");

describe("NftContract", () => {
  let nft1155;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await  ethers.getSigners();

    const NftContract = await ethers.getContractFactory("NftContract");
    nft1155 = await NftContract.deploy("TestURI");
    // await nft1155.deployed();
  });

  it("should deploy and mint multiple types of NFTs", async () => {
    await nft1155.mint(owner.address, 1, 100, "Type A");
    await nft1155.mint(owner.address, 2, 200, "Type B");

    const balanceA = await nft1155.balanceOf(owner.address, 1);
    const balanceB = await nft1155.balanceOf(owner.address, 2);

    expect(balanceA).to.equal(100);
    expect(balanceB).to.equal(200);
  });

  it("should allow admins to mint new NFTs", async () => {
    await nft1155.addAdmin(addr1.address);

    await nft1155.connect(addr1).mint(addr1.address, 3, 50, "Type C");
    const balanceC = await nft1155.balanceOf(addr1.address, 3);

    expect(balanceC).to.equal(50);
  });

  // it("should not allow non-admins to mint new NFTs", async () => {
  //   await expect(nft1155.connect(addr1).mint(owner.address, 3, 20, "Type D")).to.be.reverted;
  // });
});


describe("MintingContract", () => {
  let nftContract;
  let mintingContract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy NftContract contract
    const NftContract = await ethers.getContractFactory("NftContract");
    nftContract = await NftContract.deploy("TestURI");

    // Deploy MintingContract and link it to NftContract contract
    const MintingContract = await ethers.getContractFactory("MintingContract");
    mintingContract = await MintingContract.deploy(nftContract.getAddress(), "BlackNFT");
  });

  it("should set the price of NFTs in MATIC and allow users to buy NFTs", async () => {
    // Set NFT prices
    await mintingContract.connect(owner).setNFTPrice("Type A", ethers.parseEther("0.1"));
    await mintingContract.connect(owner).setNFTPrice("Type B", ethers.parseEther("0.2"));

    // Buy NFTs
    await mintingContract.connect(addr1).buyNFT("Type A", { value: ethers.parseEther("0.1") });
    await mintingContract.connect(addr2).buyNFT("Type B", { value: ethers.parseEther("0.2") });

    // Check balances
    const balanceA = await nftContract.balanceOf(addr1.address, 0);
    const balanceB = await nftContract.balanceOf(addr2.address, 1);

    expect(balanceA).to.equal(1);
    expect(balanceB).to.equal(1);
  });

  it("should allow only admin to set prices and mint NFTs", async () => {
    // Grant admin role to addr1
    await mintingContract.connect(owner).grantAdmin(addr1.address);

    // Set NFT price and buy NFT as an admin
    await mintingContract.connect(addr1).setNFTPrice("Type C", ethers.parseEther("0.3"));
    await mintingContract.connect(addr1).buyNFT("Type C", { value: ethers.parseEther("0.3") });

    // Check balance
    const balanceC = await nftContract.balanceOf(addr1.address, 0);
    expect(balanceC).to.equal(1);

    // Revoke admin role as an admin (should revert)
    await expect(mintingContract.connect(addr1).revokeAdmin(owner.address)).to.be.reverted;
  });

  it("should not allow non-admins to set prices ", async () => {
    // Trying to set NFT price and buy NFT as a non-admin (should revert)
    await expect(mintingContract.connect(addr1).setNFTPrice("Type D", ethers.parseEther("0.4"))).to.be.reverted;
     });

  it("should allow any user to buy NFTs", async () => {
    // Set NFT price and buy NFT as addr2
    await mintingContract.connect(owner).setNFTPrice("Type E", ethers.parseEther("0.5"));
    await mintingContract.connect(addr2).buyNFT("Type E", { value: ethers.parseEther("0.5") });

    // Check balance
    const balanceE = await nftContract.balanceOf(addr2.address, 0);
    expect(balanceE).to.equal(1);
  });

  it("should not allow a user to buy more than one NFT", async () => {
    // Set NFT price and buy NFT
    await mintingContract.connect(owner).setNFTPrice("Type F", ethers.parseEther("0.6"));
    await mintingContract.connect(addr1).buyNFT("Type F", { value: ethers.parseEther("0.6") });

    // Trying to buy another NFT (should revert)
    await expect(mintingContract.connect(addr1).buyNFT("Type F", { value: ethers.parseEther("0.6") })).to.be.reverted;
  });

  it("should not allow a user to buy NFT if the price is not set", async () => {
    // Trying to buy NFT with unset price (should revert)
    await expect(mintingContract.connect(addr1).buyNFT("Type G", { value: ethers.parseEther("0.7") })).to.be.reverted;
  });

  it("should not allow a user to buy NFT if the type does not exist", async () => {
    // Trying to buy NFT with non-existent type (should revert)
    await expect(mintingContract.connect(addr1).buyNFT("Type H", { value: ethers.parseEther("0.8") })).to.be.reverted;
  });

  it("should not allow a user to buy NFT in less price", async () => {
    // Set NFT price and buy NFT with less price (should revert)
    await mintingContract.connect(owner).setNFTPrice("Type I", ethers.parseEther("0.9"));
    await expect(mintingContract.connect(addr1).buyNFT("Type I", { value: ethers.parseEther("0.8") })).to.be.reverted;
  });

  it("should allow admin to withdraw funds", async () => {
    // Set NFT price and buy NFT
    await mintingContract.connect(owner).setNFTPrice("Type J", ethers.parseEther("1.0"));
    await mintingContract.connect(addr1).buyNFT("Type J", { value: ethers.parseEther("1.0") });

    // Check contract balance before withdrawal
    const contractBalanceBefore = await ethers.provider.getBalance(mintingContract.getAddress());

    // Withdraw funds
    await mintingContract.connect(owner).withdrawFunds(owner.address);

    // Check contract balance after withdrawal
    const contractBalanceAfter = await ethers.provider.getBalance(mintingContract.getAddress());

    // Check owner's balance after withdrawal
    const ownerBalance = await ethers.provider.getBalance(owner.address);

    expect(contractBalanceBefore).to.equal(ethers.parseEther("1.0"));
    expect(contractBalanceAfter).to.equal(0);
    expect(ownerBalance).to.be.gt(0);
  });

  it("should not allow non-admins to withdraw funds", async () => {
    // Set NFT price and buy NFT
    await mintingContract.connect(owner).setNFTPrice("Type K", ethers.parseEther("1.0"));
    await mintingContract.connect(addr1).buyNFT("Type K", { value: ethers.parseEther("1.0") });

    // Trying to withdraw funds as a non-admin (should revert)
    await expect(mintingContract.connect(addr1).withdrawFunds(owner.address)).to.be.reverted;
  });

  it("should return the blankNFT URI if the reveal time is not set", async () => {
    const tokenId = 0;
   // Set NFT price and buy NFT
   await mintingContract.connect(owner).setNFTPrice("Type J", ethers.parseEther("1.0"));
   await mintingContract.connect(addr1).buyNFT("Type J", { value: ethers.parseEther("1.0") });

    // Check metadata
    const metadata = await mintingContract.uri(tokenId);
    expect(metadata).to.equal("BlackNFT");
  });

  it("should return the blankNFT URI if the block timestamp is less than the reveal time", async () => {
    const tokenId = 0;

   // Set NFT price and buy NFT
   await mintingContract.connect(owner).setNFTPrice("Type J", ethers.parseEther("1.0"));
   await mintingContract.connect(addr1).buyNFT("Type J", { value: ethers.parseEther("1.0") });


    // Set reveal time 1 hour from now
    const revealTime = Math.floor(Date.now() / 1000) + 3600;
    await nftContract.connect(owner).setRevealTime("Type J", revealTime);

    // Check metadata
    const metadata = await mintingContract.uri(tokenId);
    expect(metadata).to.equal("BlackNFT");
  });

  it("should return the actual URI if the metadata is revealed", async () => {
    const tokenId = 0;
    // Set NFT price and buy NFT
   await mintingContract.connect(owner).setNFTPrice("Type J", ethers.parseEther("1.0"));
   await mintingContract.connect(addr1).buyNFT("Type J", { value: ethers.parseEther("1.0") });


    // Set reveal time 1 hour from now
    // const revealTime = Math.floor(Date.now() / 1000) + 3600;
    const revealTime = nftContract.blockTimestamp();
    await nftContract.connect(owner).setRevealTime("Type J", revealTime);

    // Increase time to pass the reveal time
    // await ethers.provider.send("evm_increaseTime", [3601]);

    // Check metadata
    const metadata = await mintingContract.uri(tokenId);
    expect(metadata).to.equal("https://ipfs.io/ipfs/QmT4L3fzAeNcmp54EQQQ1UnRYz94kSBHSpGCACmzQw4qoS?filename=1.jpeg");
  });
});
