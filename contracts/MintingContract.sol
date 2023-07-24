// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NftContract.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Minting contract
contract MintingContract is Ownable {
    using SafeMath for uint256;

    // Address of the linked NftContract contract
    NftContract private _nftContract;

    // Blank NFT Image URI
    string private _blackNft;  

    uint private _tokenCounter;

    // Mapping to store the price of each NFT type in MATIC
    mapping(string => uint256) private _nftPrices;

    // Mapping to track the users who have minted an NFT
    mapping(address => bool) private _mintedNFTs;

    // Admins who can set prices and withdraw funds
    mapping(address => bool) private _admins;

    // Mapping to store the token ids for each NFT type
    mapping(string => uint256) private _tokenIds;

    // Event to track the purchase of NFTs
    event NFTPurchased(address indexed account, string tokenType, uint256 tokenId);

    // Event to track admin role granted
    event AdminGranted(address indexed account);

    // Event to track admin role revoked
    event AdminRevoked(address indexed account);

    // Modifier to check if the caller is an admin
    modifier onlyAdmin() {
        require(_admins[msg.sender], "MintingContract: caller is not an admin");
        _;
    }

    // Constructor to set the linked NftContract contract
    constructor(address nftContract, string memory _blacknft) {
        _nftContract = NftContract(nftContract);
        _admins[msg.sender] = true;
        _blackNft = _blacknft;
    }

    // Function to link the NftContract contract
    function setNFTContract(address nftContract) external onlyOwner {
        _nftContract = NftContract(nftContract);
    }

    // Function to grant admin role
    function grantAdmin(address admin) external onlyOwner {
        _admins[admin] = true;
        emit AdminGranted(admin);
    }

    // Function to revoke admin role
    function revokeAdmin(address admin) external onlyOwner {
        require(admin != msg.sender, "MintingContract: owner cannot revoke their own admin role");
        _admins[admin] = false;
        emit AdminRevoked(admin);
    }

    // Function to check if an address is an admin
    function isAdmin(address account) external view returns (bool) {
        return _admins[account];
    }

    // Function to set the price of an NFT type in MATIC
    function setNFTPrice(string calldata tokenType, uint256 priceInMATIC) external onlyAdmin {
        if (_nftPrices[tokenType] == 0 ){
            _tokenIds[tokenType] =  _tokenCounter ++ ;
        }
        _nftPrices[tokenType] = priceInMATIC;
    }

    // Function to get the price of an NFT type in MATIC
    function getNFTPrice(string calldata tokenType) external view returns (uint256) {
        return _nftPrices[tokenType];
    }

    // Function to buy an NFT with MATIC
    function buyNFT(string calldata tokenType) external payable {
        require(_nftPrices[tokenType] > 0, "MintingContract: NFT type not found or price not set");
        require(!_mintedNFTs[msg.sender], "MintingContract: each user can mint at most 1 NFT");

        uint256 priceInMATIC = _nftPrices[tokenType];
        require(msg.value >= priceInMATIC, "MintingContract: insufficient MATIC sent");

        uint256 tokenId = _tokenIds[tokenType];

        _nftContract.mint(msg.sender, tokenId, 1, tokenType);
        _mintedNFTs[msg.sender] = true;

        if (msg.value > priceInMATIC) {
            payable(msg.sender).transfer(msg.value.sub(priceInMATIC));
        }

        emit NFTPurchased(msg.sender, tokenType, tokenId);
    }

    // Function to allow withdrawal of funds
    function withdrawFunds(address payable recipient) external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "MintingContract: no funds to withdraw");
        recipient.transfer(balance);
    }

    
    // Function to set the reveal time for an NFT type
    function setRevealTime(string calldata tokenType, uint256 revealTime) external onlyAdmin {
        _nftContract.setRevealTime(tokenType,revealTime);
    }

    // Function to override the default URI function of NFT1155 contract
    function uri(uint256 tokenId) public view returns (string memory) {

        require ( tokenId <= _tokenCounter  , "MintingContract: Invalid token id");

 
        string memory tokenURI = _nftContract.uri(tokenId);
        return bytes(tokenURI).length > 0 ? tokenURI : _blackNft;

    }

}
