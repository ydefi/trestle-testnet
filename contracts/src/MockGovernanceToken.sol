// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockGovernanceToken is ERC20 {
    uint8 private _dec;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) ERC20(_name, _symbol) {
        _dec = _decimals;
        _mint(msg.sender, _initialSupply);
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) external {
        _burn(_from, _amount);
    }

    function decimals() public view override returns (uint8) {
        return _dec;
    }
}
