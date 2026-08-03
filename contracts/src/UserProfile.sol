// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UserProfile is Ownable {
    struct Profile {
        string name;
        string avatarURI;
        string bio;
    }

    struct Review {
        address reviewer;
        uint8 rating;
        string comment;
        uint256 timestamp;
    }

    uint256 public constant REVIEW_COOLDOWN = 1 days;
    uint256 public constant MIN_TOKEN_BALANCE = 1e18;

    address public reviewToken;
    mapping(address => Profile) public profiles;
    mapping(address => Review[]) public reviewsReceived;
    mapping(address => mapping(address => uint256)) public lastReviewTime;

    event ProfileUpdated(address indexed user, string name, string avatarURI, string bio);
    event ReviewSubmitted(address indexed reviewer, address indexed user, uint8 rating, string comment);

    error EmptyName();
    error InvalidRating();
    error SelfReview();
    error ReviewTooSoon();
    error InsufficientBalance();
    error ZeroAddress();

    constructor(address _reviewToken) Ownable(msg.sender) {
        if (_reviewToken == address(0)) revert ZeroAddress();
        reviewToken = _reviewToken;
    }

    function setProfile(string calldata _name, string calldata _avatarURI, string calldata _bio) external {
        if (bytes(_name).length == 0) revert EmptyName();
        profiles[msg.sender] = Profile(_name, _avatarURI, _bio);
        emit ProfileUpdated(msg.sender, _name, _avatarURI, _bio);
    }

    function submitReview(address _user, uint8 _rating, string calldata _comment) external {
        if (_rating == 0 || _rating > 5) revert InvalidRating();
        if (msg.sender == _user) revert SelfReview();
        if (block.timestamp < lastReviewTime[msg.sender][_user] + REVIEW_COOLDOWN) revert ReviewTooSoon();
        if (IERC20(reviewToken).balanceOf(msg.sender) < MIN_TOKEN_BALANCE) revert InsufficientBalance();

        lastReviewTime[msg.sender][_user] = block.timestamp;
        reviewsReceived[_user].push(Review(msg.sender, _rating, _comment, block.timestamp));
        emit ReviewSubmitted(msg.sender, _user, _rating, _comment);
    }

    function getProfile(address _user) external view returns (Profile memory) {
        return profiles[_user];
    }

    function getReviewCount(address _user) external view returns (uint256) {
        return reviewsReceived[_user].length;
    }

    function getReviews(address _user, uint256 _offset, uint256 _limit) external view returns (Review[] memory) {
        Review[] storage all = reviewsReceived[_user];
        uint256 len = all.length;
        if (_offset >= len) return new Review[](0);
        uint256 end = _offset + _limit;
        if (end > len) end = len;
        uint256 count = end - _offset;
        Review[] memory result = new Review[](count);
        for (uint256 i; i < count; i++) {
            result[i] = all[_offset + i];
        }
        return result;
    }
}
