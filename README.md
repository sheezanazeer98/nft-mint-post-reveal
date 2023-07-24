# nft-mint-post-reveal
Solidity smart contracts for selling NFTs with a post-mint reveal mechanic.




This workspace contains 4 directories:

1. 'contracts': Holds two contract NFT contract and Minting Contract.
2. 'scripts': Contains two js files to deploy a contract.
3. 'tests': Contains one Solidity test file for 'NFT and Minting' contract.
4. 'server': Contains one index.html and index.js files for basic frontend and metamask integration'.

# Setup Instructions
To set up and run the project, follow these steps:

## Prerequisites
Before proceeding, ensure you have the following software installed on your system:

Node.js: Download [Node.js](https://nodejs.org/en)
Hardhat: Hardhat [Documentation](https://hardhat.org/)
ethers.js v5: [ethers.js Documentation](https://docs.ethers.org/v5/)

### Step 1: Clone the Repository
First, clone the repository to your local machine using Git:

```shell
git clone <repository_url>

```
### Step 2: Install Dependencies
Change your current directory to the project folder and install the required Node.js dependencies:


```shell
cd <project_folder>
npm install

```

### Step 3: Configure Hardhat
Before running the project, you need to configure the Hardhat network. You can do this by modifying the hardhat.config.js file to specify the network settings and other configurations.

### Step 4: Compile Contracts
Compile the smart contracts to generate the artifacts required for the deployment:

```shell
npx hardhat compile
```

### Step 5: Run Tests (Optional)
If the project includes unit tests for the contracts, you can run them to ensure everything is functioning correctly:

```shell
npx hardhat compile
npx hardhat test
```



# Contracts
This documentation provides an overview of the two Solidity contracts - **NftContract** and **MintingContract**, which together facilitate the minting and trading of NFTs (Non-Fungible Tokens). The contracts are designed to be deployed on the Ethereum blockchain and follow the **ERC-1155** standard.

## NftContract
## Overview
The NftContract is an ERC-1155 compliant contract that enables the minting and management of NFTs. It extends the **ERC1155Pausable** contract from OpenZeppelin, which provides pausable functionality for the tokens. Additionally, it is owned by an administrator who can manage the contract.

## Functionality

1. Minting Tokens

- The **mint** function allows the contract owner (administrator) to mint new NFTs with specified token ID, amount, and token type. Only the owner can mint new tokens.
  
2. Pausing and Unpausing the Contract

- The **pause** and **unpause** functions allow the contract owner to pause and unpause the contract, respectively. When paused, no new tokens can be minted.

3. Setting Base URI

- The **setBaseURI** function enables the contract owner to set the base URI for token metadata. The base URI is used as a prefix for token URIs.

4. Managing Admins

- The contract owner can add and remove other addresses as admins using the **addAdmin** and **removeAdmin** functions.

5. Querying Token Information

- The **totalSupply** function returns the total supply of a specific token type.
- The **tokenType** function returns the type of a token based on its ID.
- The **uri** function returns the URI of a token based on its ID. If the token's reveal time has not passed, the function returns an empty string.

6. Setting Reveal Time

- The **setRevealTime** function allows the contract owner to set the reveal time for a specific NFT type. After the reveal time has passed, the token URI becomes accessible.


## MintingContract
## Overview
The **MintingContract** is a contract that handles the minting and selling of NFTs using the **NftContract** as its base contract. It allows users to purchase NFTs by paying with MATIC tokens. The contract owner can set the prices for different NFT types and manage admin roles.

## Functionality
1. Linking NftContract

 - The contract constructor allows the owner to link the MintingContract with the NftContract.

2. Granting and Revoking Admin Role

 - The contract owner can grant or revoke admin roles using the **grantAdmin** and **revokeAdmin** functions, respectively.
3. Setting NFT Prices

 - The **setNFTPrice** function allows the contract owner to set the price for a specific NFT type in MATIC tokens.
4. Purchasing NFTs

 - The **buyNFT** function enables users to purchase NFTs by sending MATIC tokens to the contract. Users can only buy one NFT per address.
5. Withdrawing Funds

 - The contract owner can withdraw the contract's balance using the **withdrawFunds** function.
6. Setting Reveal Time (Delegated to NftContract)

 - The **setRevealTime** function allows the contract owner to set the reveal time for a specific NFT type. It delegates the call to the linked NftContract.
7. Overriding Token URI

 - The **uri** function overrides the default URI function of the linked NftContract. If the token's reveal time has not passed, it returns a black NFT URI.



# Scripts

The 'scripts' folder has two 

npx hardhat run scripts/deploy.js --network NETWORK_NAME
npx hardhat run scripts/deploy1.js --network NETWORK_NAME

# Test

In the 'tests' folder there is a script containing Mocha-Chai unit tests for 'NFTContract and Minting' contracts.


```shell
npx hardhat compile
npx hardhat test
```

# Server

To run frontend use the following command 

```shell
npm start
```

In order for users to buy NFTs, the admin must set the price for each NFT type before users can make a purchase.


### Usage Considerations
 - Deploy the NftContract contract first before deploying the MintingContract.
 - Ensure that you have sufficient MATIC tokens to set NFT prices and purchase NFTs.
 - Grant admin roles carefully as they have the authority to set prices and withdraw funds.




