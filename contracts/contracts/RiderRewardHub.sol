// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./RiderXPToken.sol";

/**
 * @title RiderRewardHub
 * @dev Thin distribution layer that mints RXP tokens to riders on milestone events.
 * Business logic (which milestone = how much) stays in backend; this contract
 * only enforces operator authorization and emits events for indexing.
 */
contract RiderRewardHub {
    RiderXPToken public immutable token;
    address public operator;

    /// @notice Emitted when a reward is distributed to a rider
    event RewardDistributed(address indexed rider, uint256 amount, string reason);

    modifier onlyOperator() {
        require(msg.sender == operator, "RiderRewardHub: not authorized");
        _;
    }

    constructor(address tokenAddress, address operatorAddress) {
        require(tokenAddress != address(0), "zero token address");
        require(operatorAddress != address(0), "zero operator");
        token = RiderXPToken(tokenAddress);
        operator = operatorAddress;
    }

    /// @notice Distribute XP reward to a rider for a milestone achievement
    /// @param rider Rider's wallet address
    /// @param amount XP amount (1 token = 1 XP)
    /// @param reason Human-readable reason (e.g., "level_up_5", "mission_daily_5")
    function distributeReward(
        address rider,
        uint256 amount,
        string calldata reason
    ) external onlyOperator {
        require(rider != address(0), "zero address");
        require(amount > 0, "zero amount");
        require(bytes(reason).length > 0, "empty reason");

        token.mintReward(rider, amount);
        emit RewardDistributed(rider, amount, reason);
    }

    /// @notice Update operator address (emergency rotation)
    function setOperator(address newOperator) external onlyOperator {
        require(newOperator != address(0), "zero address");
        operator = newOperator;
    }
}