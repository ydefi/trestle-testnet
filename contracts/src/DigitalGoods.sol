// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./DutchAuctionLib.sol";

contract DigitalGoods is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using DutchAuctionLib for DutchAuctionLib.Params;

    enum PricingMode { Fixed, DutchAuction }
    enum ListingStatus { Active, Sold, Cancelled, Disputed, Refunded }

    struct Listing {
        uint256 id;
        address seller;
        string metadataURI;
        PricingMode pricing;
        uint256 price;
        DutchAuctionLib.Params auction;
        ListingStatus status;
        address buyer;
        uint256 escrowedAmount;
        uint256 createdAt;
        uint256 disputeDeadline;
        bool deliveryConfirmed;
        address paymentToken;
        string category;
        string deliveryURI;
    }

    uint256 public listingCount;
    uint256 public constant DISPUTE_TIMEOUT = 7 days;
    uint256 public constant PLATFORM_FEE_BPS = 250;
    uint256 public constant BPS = 10000;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => string) public deliveryHashes;

    event Listed(uint256 indexed id, address indexed seller, PricingMode pricing, uint256 price, string metadataURI, string category);
    event Purchased(uint256 indexed id, address indexed buyer, uint256 paid);
    event DeliverySubmitted(uint256 indexed id, string deliveryHash);
    event DeliveryConfirmed(uint256 indexed id);
    event Disputed(uint256 indexed id);
    event Resolved(uint256 indexed id, bool toBuyer);
    event Cancelled(uint256 indexed id);

    error NotSeller();
    error NotBuyer();
    error WrongStatus();
    error AlreadyConfirmed();
    error PriceTooLow();
    error NoRefundNeeded();

    constructor() Ownable(msg.sender) {}

    function listFixed(
        string calldata _metadataURI,
        uint256 _price,
        string calldata _category,
        string calldata _deliveryURI
    ) external returns (uint256) {
        if (_price == 0) revert PriceTooLow();
        return _list(_metadataURI, PricingMode.Fixed, _price, 0, 0, 0, _category, _deliveryURI);
    }

    function listDutch(
        string calldata _metadataURI,
        uint256 _startPrice,
        uint256 _reservePrice,
        uint256 _duration,
        string calldata _category,
        string calldata _deliveryURI
    ) external returns (uint256) {
        DutchAuctionLib.validate(_startPrice, _reservePrice, _duration);
        return _list(_metadataURI, PricingMode.DutchAuction, _startPrice, _reservePrice, _duration, block.timestamp, _category, _deliveryURI);
    }

    function _list(
        string calldata _metadataURI,
        PricingMode _pricing,
        uint256 _price,
        uint256 _reservePrice,
        uint256 _duration,
        uint256 _startedAt,
        string calldata _category,
        string calldata _deliveryURI
    ) private returns (uint256) {
        listingCount++;
        uint256 id = listingCount;
        listings[id] = Listing({
            id: id,
            seller: msg.sender,
            metadataURI: _metadataURI,
            pricing: _pricing,
            price: _price,
            auction: DutchAuctionLib.Params(_price, _reservePrice, _duration, _startedAt),
            status: ListingStatus.Active,
            buyer: address(0),
            escrowedAmount: 0,
            createdAt: block.timestamp,
            disputeDeadline: 0,
            deliveryConfirmed: false,
            paymentToken: address(0),
            category: _category,
            deliveryURI: _deliveryURI
        });
        emit Listed(id, msg.sender, _pricing, _price, _metadataURI, _category);
        return id;
    }

    function currentPrice(uint256 _id) public view returns (uint256) {
        Listing storage l = listings[_id];
        if (l.pricing == PricingMode.Fixed) return l.price;
        return l.auction.currentPrice();
    }

    function buy(uint256 _id) external payable nonReentrant {
        Listing storage l = listings[_id];
        if (l.status != ListingStatus.Active) revert WrongStatus();
        if (msg.sender == l.seller) revert WrongStatus();

        uint256 price = currentPrice(_id);
        if (msg.value < price) revert PriceTooLow();

        uint256 fee = (price * PLATFORM_FEE_BPS) / BPS;
        uint256 sellerAmount = price - fee;

        l.status = ListingStatus.Sold;
        l.buyer = msg.sender;
        l.paymentToken = address(0);
        l.escrowedAmount = sellerAmount;
        l.disputeDeadline = block.timestamp + DISPUTE_TIMEOUT;

        (bool feeSent,) = owner().call{value: fee}("");
        require(feeSent, "Fee transfer failed");

        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool refund,) = msg.sender.call{value: excess}("");
            require(refund, "Refund failed");
        }

        _autoDeliverIfSet(_id);
        emit Purchased(_id, msg.sender, price);
    }

    function buyWithToken(uint256 _id, address _token, uint256 _amount) external nonReentrant {
        Listing storage l = listings[_id];
        if (l.status != ListingStatus.Active) revert WrongStatus();
        if (msg.sender == l.seller) revert WrongStatus();

        uint256 price = currentPrice(_id);
        if (_amount < price) revert PriceTooLow();

        uint256 fee = (price * PLATFORM_FEE_BPS) / BPS;
        uint256 sellerAmount = price - fee;

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        if (fee > 0) IERC20(_token).safeTransfer(owner(), fee);
        l.status = ListingStatus.Sold;
        l.buyer = msg.sender;
        l.paymentToken = _token;
        l.escrowedAmount = sellerAmount;
        l.disputeDeadline = block.timestamp + DISPUTE_TIMEOUT;

        if (_amount > price) {
            IERC20(_token).safeTransfer(msg.sender, _amount - price);
        }

        _autoDeliverIfSet(_id);
        emit Purchased(_id, msg.sender, price);
    }

    function _autoDeliverIfSet(uint256 _id) private {
        Listing storage l = listings[_id];
        if (bytes(l.deliveryURI).length > 0) {
            l.deliveryConfirmed = true;
            _releaseToSeller(_id);
            emit DeliveryConfirmed(_id);
        }
    }

    function submitDelivery(uint256 _id, string calldata _deliveryHash) external {
        Listing storage l = listings[_id];
        if (msg.sender != l.seller) revert NotSeller();
        if (l.status != ListingStatus.Sold || l.deliveryConfirmed) revert WrongStatus();
        deliveryHashes[_id] = _deliveryHash;
        emit DeliverySubmitted(_id, _deliveryHash);
    }

    function confirmDelivery(uint256 _id) external nonReentrant {
        Listing storage l = listings[_id];
        if (msg.sender != l.buyer) revert NotBuyer();
        if (l.status != ListingStatus.Sold || l.deliveryConfirmed) revert WrongStatus();

        l.deliveryConfirmed = true;
        _releaseToSeller(_id);
        emit DeliveryConfirmed(_id);
    }

    function dispute(uint256 _id) external {
        Listing storage l = listings[_id];
        if (msg.sender != l.buyer && msg.sender != l.seller) revert WrongStatus();
        if (l.status != ListingStatus.Sold || l.deliveryConfirmed) revert WrongStatus();

        l.status = ListingStatus.Disputed;
        emit Disputed(_id);
    }

    function resolveAfterTimeout(uint256 _id) external nonReentrant {
        Listing storage l = listings[_id];
        if (l.status != ListingStatus.Disputed && l.status != ListingStatus.Sold) revert WrongStatus();
        if (l.deliveryConfirmed) revert AlreadyConfirmed();
        if (block.timestamp < l.disputeDeadline) revert WrongStatus();

        if (l.status == ListingStatus.Sold) {
            l.deliveryConfirmed = true;
            _releaseToSeller(_id);
        } else {
            l.status = ListingStatus.Refunded;
            _releaseToBuyer(_id);
        }
        emit Resolved(_id, l.status == ListingStatus.Sold);
    }

    function cancelListing(uint256 _id) external nonReentrant {
        Listing storage l = listings[_id];
        if (msg.sender != l.seller) revert NotSeller();
        if (l.status != ListingStatus.Active) revert WrongStatus();

        l.status = ListingStatus.Cancelled;
        emit Cancelled(_id);
    }

    function _releaseToSeller(uint256 _id) private {
        Listing storage l = listings[_id];
        if (l.escrowedAmount == 0) revert NoRefundNeeded();
        uint256 amount = l.escrowedAmount;
        l.escrowedAmount = 0;
        if (l.paymentToken == address(0)) {
            (bool sent,) = l.seller.call{value: amount}("");
            require(sent, "Payment failed");
        } else {
            IERC20(l.paymentToken).safeTransfer(l.seller, amount);
        }
    }

    function _releaseToBuyer(uint256 _id) private {
        Listing storage l = listings[_id];
        if (l.escrowedAmount == 0) revert NoRefundNeeded();
        uint256 amount = l.escrowedAmount;
        l.escrowedAmount = 0;
        if (l.paymentToken == address(0)) {
            (bool sent,) = l.buyer.call{value: amount}("");
            require(sent, "Refund failed");
        } else {
            IERC20(l.paymentToken).safeTransfer(l.buyer, amount);
        }
    }
}
