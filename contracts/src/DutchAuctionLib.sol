// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library DutchAuctionLib {
    struct Params {
        uint256 startPrice;
        uint256 reservePrice;
        uint256 duration;
        uint256 startedAt;
    }

    error InvalidParams();
    error AuctionNotActive();

    function validate(uint256 _startPrice, uint256 _reservePrice, uint256 _duration) internal pure {
        if (_startPrice <= _reservePrice || _duration == 0) revert InvalidParams();
    }

    function currentPrice(Params memory _auction) internal view returns (uint256) {
        if (_auction.startedAt == 0) return _auction.startPrice;
        uint256 elapsed = block.timestamp - _auction.startedAt;
        if (elapsed >= _auction.duration) return _auction.reservePrice;
        uint256 drop = ((_auction.startPrice - _auction.reservePrice) * elapsed) / _auction.duration;
        return _auction.startPrice - drop;
    }
}
