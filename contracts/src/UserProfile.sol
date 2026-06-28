// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserProfile is Ownable {
    struct Profile {
        string name;
        string avatarURI;
        string bio;
    }

    struct Review {
        uint8 rating;
        string comment;
        uint256 timestamp;
    }

    mapping(address => Profile) public profiles;
    mapping(address => Review[]) public reviewsReceived;

    event ProfileUpdated(address indexed user, string name, string avatarURI, string bio);
    event ReviewSubmitted(address indexed reviewer, address indexed user, uint8 rating, string comment);

    error EmptyName();
    error InvalidRating();

    constructor() Ownable(msg.sender) {}

    function setProfile(string calldata _name, string calldata _avatarURI, string calldata _bio) external {
        if (bytes(_name).length == 0) revert EmptyName();
        profiles[msg.sender] = Profile(_name, _avatarURI, _bio);
        emit ProfileUpdated(msg.sender, _name, _avatarURI, _bio);
    }

    function submitReview(address _user, uint8 _rating, string calldata _comment) external {
        if (_rating == 0 || _rating > 5) revert InvalidRating();
        reviewsReceived[_user].push(Review(_rating, _comment, block.timestamp));
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
