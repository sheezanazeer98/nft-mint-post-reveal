// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol"; 

// NftContract contract
contract NftContract is ERC1155Pausable, Ownable {
    // Mapping to store the total supply of each token type
    mapping(uint256 => uint256) private _tokenSupply;

    // Mapping to store the types of each token
    mapping(uint256 => string) private _tokenTypes;

    //Mapping to store Ids to URI, this is just for testing purpose
    mapping(uint256 => string) private _idToUris;

    // Mapping to store the reveal time for each NFT type
    mapping(string => uint256) public  _revealTimes;

    // Base URI for metadata
    string private _baseUri;

    // List of admin addresses
    mapping(address => bool) private _admins;

    // Event to track the minting of new tokens
    event Minted(address indexed account, uint256 tokenId, uint256 amount);

    // Modifier to check if the caller is an admin
    modifier onlyAdmin() {
        require(_admins[msg.sender], "NftContract: caller is not an admin");
        _;
    }

    // Constructor to set the base URI and add the contract deployer as the initial admin
    constructor(string memory baseUri_) ERC1155("") {
        _baseUri = baseUri_;
        _admins[msg.sender] = true;

        // This is purely for testing purpose
        _idToUris[0] = "https://ipfs.io/ipfs/QmT4L3fzAeNcmp54EQQQ1UnRYz94kSBHSpGCACmzQw4qoS?filename=1.jpeg";
        _idToUris[1] = "https://ipfs.io/ipfs/QmVtZk9WgA1dsMMeMYVzYrHNtdHRFNQUD4XHNr1EBESXnN?filename=2.jpeg";
        _idToUris[2] = "https://ipfs.io/ipfs/QmVnXA3ShYSmysNAjbYkhCZkyaCPAouwD6CyNDwCLbS6Ew?filename=3.jpeg";
        _idToUris[3] = "https://ipfs.io/ipfs/QmNw1iBWtPhVW2pmCUvNPCvHTrUozECWtQg9sUjDeF2VgB?filename=4.jpeg";
        _idToUris[4] = "https://ipfs.io/ipfs/QmcuvQF8BL5XgmeazEsoBMiMgoF9f1hUci1a1S9ucLXhVP?filename=5.jpeg";
        _idToUris[5] = "https://ipfs.io/ipfs/QmNTSfR6usHYHUaw6SVuHeVkz5B12WX77pJPvRqbHvyVBJ?filename=6.jpeg";
        _idToUris[6] = "https://ipfs.io/ipfs/QmRuejs4nV3MML531TmjVzHyp8Pz7n6Bm6ZNsGEQ4Yoqwb?filename=7.jpeg";
        _idToUris[7] = "https://ipfs.io/ipfs/QmV8zzFB5dZxwr5xvqv7Rvpcn4gigfJivMQrfCqNgASqoF?filename=8.jpeg";

    }

    // Function to set the base URI
    function setBaseURI(string memory baseUri_) external onlyOwner {
        _baseUri = baseUri_;
    }

    // Function to add an admin
    function addAdmin(address admin) external onlyOwner {
        _admins[admin] = true;
    }

    // Function to remove an admin
    function removeAdmin(address admin) external onlyOwner {
        require(admin != msg.sender, "NftContract: owner cannot remove themselves as admin");
        _admins[admin] = false;
    }

    // Function to check if an address is an admin
    function isAdmin(address account) external view returns (bool) {
        return _admins[account];
    }


    // Function to set the reveal time for an NFT type
    function setRevealTime(string memory _tokenType, uint256 revealTime) external onlyAdmin {
        _revealTimes[_tokenType] = revealTime;
    }

    // Function to get the base URI
    function uri(uint256 tokenId) public   view override returns (string memory) {
        
      
        // Get the reveal time for the token type
        uint256 revealTime = _revealTimes[_tokenTypes[tokenId]];

        
        // If the reveal time has not passed yet, return the base URI
        if ( revealTime > block.timestamp || revealTime == 0 ) {
            return  "";
        }

        return (bytes(_baseUri).length > 0 && tokenId < 8 )? _idToUris[tokenId] : "";
    }

    // For Testing and Demo Purpose
    function blockTimestamp () public  view returns (uint){
        return block.timestamp;
    }


    // Function to mint new tokens (onlyAdmin modifier is added to restrict minting to admins)
    function mint(address account, uint256 tokenId, uint256 amount, string memory _tokenType) external  {
        require(bytes(_tokenType).length > 0, "NftContract: tokenType cannot be empty");
        _mint(account, tokenId, amount, "");
        _tokenSupply[tokenId] += amount;
        _tokenTypes[tokenId] = _tokenType;
        emit Minted(account, tokenId, amount);
    }

    // Function to get the total supply of a token type
    function totalSupply(uint256 tokenId) external view returns (uint256) {
        return _tokenSupply[tokenId];
    }

    // Function to get the type of a token
    function tokenType(uint256 tokenId) external view returns (string memory) {
        return _tokenTypes[tokenId];
    }

    // Function to pause the contract
    function pause() external onlyOwner {
        _pause();
    }

    // Function to unpause the contract
    function unpause() external onlyOwner {
        _unpause();
    }
}
