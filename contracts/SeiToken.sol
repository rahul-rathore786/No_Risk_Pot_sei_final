// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SeiToken is ERC20, Ownable {
    // Decimals for SEI token (standard 18 decimals)
    uint8 private _decimals = 18;
    
    constructor() ERC20("SEI Token", "SEI") {
        // Mint 1000 SEI tokens to the deployer
        _mint(msg.sender, 1000 * 10**decimals());
    }
    
    // Override decimals function to return 18
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    // Function for admin to mint additional tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
} 