// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC4626 {
    function asset() external view returns (address);
    function deposit(uint256 assets, address receiver) external payable returns (uint256 shares);
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);
    function balanceOf(address owner) external view returns (uint256);
    function previewRedeem(uint256 shares) external view returns (uint256);
}