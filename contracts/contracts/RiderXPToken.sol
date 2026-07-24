// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RiderXPToken
 * @dev ERC20 reward token for gamified delivery riders on Avalanche Fuji.
 * 1 token = 1 XP (decimals = 0). Only the RiderRewardHub (owner) can mint rewards.
 */
contract RiderXPToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("Rider XP Token", "RXP")
        Ownable(initialOwner)
    {}

    /// @notice Override decimals to 0 so 1 token = 1 XP (no fractional confusion in UI)
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    /// @notice Mint reward tokens to a rider. Only callable by owner (RewardHub).
    /// @param to Rider's wallet address
    /// @param amount XP amount to mint
    function mintReward(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero address");
        require(amount > 0, "zero amount");
        _mint(to, amount);
    }
}