// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IFeeDistributor {
    function distribute(address token) external;
}
