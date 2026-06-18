// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Marketplace — Slice 2 (Listings · member2) + Slice 3 (Escrow & Ratings · member3)  [STUDENT TEMPLATE]
/// @notice Implement every TODO(memberN). Spec: docs/{listings,escrow}-module.md + test/{Listings,Escrow}.t.sol.
contract Marketplace is ReentrancyGuard {
    enum Status { Available, Pending, Sold, Cancelled }
    struct Listing {
        uint256 id; address seller; address buyer;
        string title; string category; string condition;
        uint256 priceInTokens; string imageUrl;
        Status status; uint256 purchaseTimestamp;
    }
    IERC20  public immutable token;
    uint256 public nextListingId;
    uint256 public constant CANCELLATION_TIMEOUT = 5 minutes;
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256) private ratingTotal;
    mapping(address => uint256) private ratingCount;
    mapping(uint256 => bool)    public  listingRated;

    event ListingCreated(uint256 indexed id, address indexed seller, string title, uint256 priceInTokens);
    event ItemPurchased(uint256 indexed id, address indexed buyer);
    event DeliveryConfirmed(uint256 indexed id, address indexed seller, uint256 amount);
    event PurchaseCancelled(uint256 indexed id, address indexed buyer);
    event RatingSubmitted(address indexed rater, address indexed rated, uint8 rating, uint256 indexed listingId);

    error EmptyTitle(); error BadPrice(); error NotAvailable(); error SelfPurchase();
    error NotPending(); error NotBuyer(); error TimeoutNotReached(); error NotSold();
    error AlreadyRated(); error BadRating();

    constructor(address token_) { token = IERC20(token_); }

    // Slice 2 · Listings (member2)
    function createListing(string calldata title, string calldata category, string calldata condition, uint256 priceInTokens, string calldata imageUrl) external returns (uint256 id) {
        // TODO(member2): validate; id = nextListingId++; store Available Listing; emit ListingCreated.
        revert("TODO(member2): implement createListing");
    }
    function getListing(uint256 id) external view returns (Listing memory) { return listings[id]; }
    function totalListings() external view returns (uint256) { return nextListingId; }

    // Slice 3 · Escrow & Ratings (member3)
    function purchaseItem(uint256 id) external nonReentrant {
        // TODO(member3): require Available + not self; set Pending; token.transferFrom into escrow; emit ItemPurchased.
        revert("TODO(member3): implement purchaseItem");
    }
    function confirmDelivery(uint256 id) external nonReentrant {
        // TODO(member3): require Pending + buyer; Sold; token.transfer to seller; emit DeliveryConfirmed.
        revert("TODO(member3): implement confirmDelivery");
    }
    function cancelPurchase(uint256 id) external nonReentrant {
        // TODO(member3): require Pending + buyer + timeout; reset; refund; emit PurchaseCancelled.
        revert("TODO(member3): implement cancelPurchase");
    }
    function rateUser(uint256 id, uint8 rating) external nonReentrant {
        // TODO(member3): require Sold + buyer + 1..5 + not rated; record; emit RatingSubmitted.
        revert("TODO(member3): implement rateUser");
    }
    function getAverageRating(address user) external view returns (uint256 total, uint256 count) {
        return (ratingTotal[user], ratingCount[user]);
    }
}
