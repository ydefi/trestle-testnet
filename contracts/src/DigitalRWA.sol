// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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

    bytes32 public metadataURI;
    uint256 public immutable cap;
    AssetInfo public assetInfo;

    mapping(address => bool) public whitelisted;

    event MetadataUpdated(bytes32 indexed uri);
    event Whitelisted(address indexed account, bool indexed status);
    event AssetInfoUpdated(AssetInfo info);

    constructor(
        string memory _name,
        string memory _symbol,
        bytes32 _metadataURI,
        uint256 _cap,
        address _owner
    ) ERC20(_name, _symbol) {
        require(_owner != address(0) && _cap > 0, "Invalid params");
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(MINTER_ROLE, _owner);
        _grantRole(PAUSER_ROLE, _owner);
        metadataURI = _metadataURI;
        cap = _cap;
    }

    function mint(address _to, uint256 _amount) external onlyRole(MINTER_ROLE) nonReentrant {
        require(_to != address(0) && _amount > 0, "Invalid");
        require(whitelisted[_to], "Recipient not whitelisted");
        require(totalSupply() + _amount <= cap, "Cap exceeded");
        _mint(_to, _amount);
    }

    function subscribe() external payable nonReentrant {
        require(msg.value > 0, "Send MATIC");
        require(whitelisted[msg.sender], "Not whitelisted");
        require(totalSupply() + msg.value <= cap, "Cap exceeded");
        _mint(msg.sender, msg.value);
    }

    function setWhitelist(address _account, bool _status) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_account != address(0), "Zero address");
        whitelisted[_account] = _status;
        emit Whitelisted(_account, _status);
    }

    function setMetadataURI(bytes32 _uri) external onlyRole(DEFAULT_ADMIN_ROLE) {
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
        assetInfo = AssetInfo(
            _name, _description, _lockupDuration,
            _expectedReturnBps, _underlyingAsset,
            _redemptionDate, _redemptionPrice
        );
        emit AssetInfoUpdated(assetInfo);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _update(address _from, address _to, uint256 _value)
        internal
        override(ERC20, ERC20Pausable)
    {
        if (_from != address(0)) require(whitelisted[_from], "Sender not whitelisted");
        if (_to != address(0) && _from != address(0)) require(whitelisted[_to], "Recipient not whitelisted");
        super._update(_from, _to, _value);
    }
}
