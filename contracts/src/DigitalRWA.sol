// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/AggregatorV3Interface.sol";

contract DigitalRWA is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct AssetInfo {
        string name;
        string description;
        uint256 lockupDuration;
        uint256 expectedReturnBps;
        string underlyingAsset;
        uint256 redemptionDate;
        uint256 redemptionPrice;
    }

    string public metadataURI;
    uint256 public immutable cap;
    AssetInfo public assetInfo;
    bool public assetInfoSet;

    IERC20 public govToken;
    uint256 public minGovBalance;
    AggregatorV3Interface public immutable priceFeed;
    uint256 public currentPrice;
    uint256 public lastPriceUpdate;
    uint256 public constant STALE_PRICE_THRESHOLD = 3600;

    mapping(address => bool) public manualWhitelist;

    event MetadataUpdated(string uri);
    event Whitelisted(address indexed account, bool indexed status);
    event AssetInfoUpdated(AssetInfo info);
    event PriceUpdated(uint256 price, uint256 timestamp);
    event ETHWithdrawn(address indexed to, uint256 amount);
    event WhitelistTokenUpdated(address indexed token, uint256 minBalance);

    error InvalidParams();
    error ZeroAddress();
    error StalePrice();
    error InvalidPrice();
    error CapExceeded();
    error NotWhitelisted();
    error AssetInfoAlreadySet();
    error InsufficientBalance();
    error TransferFailed();

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _metadataURI,
        uint256 _cap,
        address _owner,
        address _govToken,
        uint256 _minGovBalance,
        address _priceFeed
    ) ERC20(_name, _symbol) {
        if (_owner == address(0) || _cap == 0) revert InvalidParams();
        if (_priceFeed == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(MINTER_ROLE, _owner);
        _grantRole(PAUSER_ROLE, _owner);
        metadataURI = _metadataURI;
        cap = _cap;
        govToken = IERC20(_govToken);
        minGovBalance = _minGovBalance;
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function isWhitelisted(address _account) public view returns (bool) {
        if (manualWhitelist[_account]) return true;
        if (minGovBalance > 0 && address(govToken) != address(0)) {
            return govToken.balanceOf(_account) >= minGovBalance;
        }
        return false;
    }

    function syncPrice() external nonReentrant {
        (, int256 answer, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        if (block.timestamp - updatedAt >= STALE_PRICE_THRESHOLD) revert StalePrice();
        if (answer <= 0) revert InvalidPrice();
        currentPrice = uint256(answer);
        lastPriceUpdate = block.timestamp;
        emit PriceUpdated(uint256(answer), block.timestamp);
    }

    function mint(address _to, uint256 _amount) external onlyRole(MINTER_ROLE) nonReentrant {
        if (_to == address(0) || _amount == 0) revert InvalidParams();
        if (!isWhitelisted(_to)) revert NotWhitelisted();
        if (totalSupply() + _amount > cap) revert CapExceeded();
        _mint(_to, _amount);
    }

    function subscribe() external payable nonReentrant {
        if (msg.value == 0) revert InsufficientBalance();
        if (!isWhitelisted(msg.sender)) revert NotWhitelisted();
        if (totalSupply() + msg.value > cap) revert CapExceeded();
        _mint(msg.sender, msg.value);
    }

    function withdrawETH(address payable _to, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (_to == address(0)) revert ZeroAddress();
        if (_amount > address(this).balance) revert InsufficientBalance();
        (bool success, ) = _to.call{value: _amount}("");
        if (!success) revert TransferFailed();
        emit ETHWithdrawn(_to, _amount);
    }

    function sweepETH(address payable _to) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (_to == address(0)) revert ZeroAddress();
        uint256 bal = address(this).balance;
        if (bal == 0) revert InsufficientBalance();
        (bool success, ) = _to.call{value: bal}("");
        if (!success) revert TransferFailed();
        emit ETHWithdrawn(_to, bal);
    }

    function setManualWhitelist(address _account, bool _status) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_account == address(0)) revert ZeroAddress();
        manualWhitelist[_account] = _status;
        emit Whitelisted(_account, _status);
    }

    function setWhitelistToken(address _token, uint256 _minBalance) external onlyRole(DEFAULT_ADMIN_ROLE) {
        govToken = IERC20(_token);
        minGovBalance = _minBalance;
        emit WhitelistTokenUpdated(_token, _minBalance);
    }

    function setMetadataURI(string calldata _uri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        metadataURI = _uri;
        emit MetadataUpdated(_uri);
    }

    function setAssetInfo(
        string calldata _name,
        string calldata _description,
        uint256 _lockupDuration,
        uint256 _expectedReturnBps,
        string calldata _underlyingAsset,
        uint256 _redemptionDate,
        uint256 _redemptionPrice
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (assetInfoSet) revert AssetInfoAlreadySet();
        assetInfo = AssetInfo(
            _name, _description, _lockupDuration,
            _expectedReturnBps, _underlyingAsset,
            _redemptionDate, _redemptionPrice
        );
        assetInfoSet = true;
        emit AssetInfoUpdated(assetInfo);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    receive() external payable {}

    function _update(address _from, address _to, uint256 _value)
        internal
        override(ERC20, ERC20Pausable)
    {
        if (_from != address(0) && !isWhitelisted(_from)) revert NotWhitelisted();
        if (_to != address(0) && _from != address(0) && !isWhitelisted(_to)) revert NotWhitelisted();
        super._update(_from, _to, _value);
    }
}
