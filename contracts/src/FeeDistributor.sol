// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FeeDistributor is Ownable {
    using SafeERC20 for IERC20;

    error Unauthorized();
    error NoFees();

    uint256 private constant BPS = 10000;
    uint256 public yieldBps = 4000;
    uint256 public treasuryBps = 4000;

    address public yieldVault;
    address public treasury;
    address public buybackBurn;

    event Distributed(address indexed token, uint256 total, uint256 yieldShare, uint256 treasuryShare, uint256 buybackShare);
    event ConfigUpdated(string indexed param);

    error ZeroAddress();

    constructor(address _treasury, address _buybackBurn) Ownable(msg.sender) {
        if (_treasury == address(0) || _buybackBurn == address(0)) revert ZeroAddress();
        treasury = _treasury;
        buybackBurn = _buybackBurn;
    }

    function setYieldVault(address _yieldVault) external onlyOwner {
        require(_yieldVault != address(0), "Zero address");
        yieldVault = _yieldVault;
        emit ConfigUpdated("yieldVault");
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Zero address");
        treasury = _treasury;
        emit ConfigUpdated("treasury");
    }

    function setBuybackBurn(address _buybackBurn) external onlyOwner {
        require(_buybackBurn != address(0), "Zero address");
        buybackBurn = _buybackBurn;
        emit ConfigUpdated("buybackBurn");
    }

    function setSplitBps(uint256 _yieldBps, uint256 _treasuryBps) external onlyOwner {
        require(_yieldBps + _treasuryBps <= BPS, "Split overflow");
        yieldBps = _yieldBps;
        treasuryBps = _treasuryBps;
        emit ConfigUpdated("split");
    }

    function distribute(address token) external {
        if (msg.sender != owner() && msg.sender != yieldVault) revert Unauthorized();

        uint256 balance;
        if (token == address(0)) {
            balance = address(this).balance;
        } else {
            balance = IERC20(token).balanceOf(address(this));
        }
        if (balance == 0) revert NoFees();

        uint256 ys = (balance * yieldBps) / BPS;
        uint256 ts = (balance * treasuryBps) / BPS;
        uint256 bs = balance - ys - ts;

        if (ys > 0) _transfer(token, yieldVault, ys);
        if (ts > 0) _transfer(token, treasury, ts);
        if (bs > 0) _transfer(token, buybackBurn, bs);

        emit Distributed(token, balance, ys, ts, bs);
    }

    function _transfer(address token, address to, uint256 amount) private {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) return;
        if (token == address(0)) {
            (bool s,) = payable(to).call{value: amount}("");
            require(s, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    receive() external payable {}
}
