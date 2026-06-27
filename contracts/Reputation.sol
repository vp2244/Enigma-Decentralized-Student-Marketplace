// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import {Marketplace} from "./Marketplace.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Reputation — Slice 4 (Reputation / Ratings)
/// @notice Reputation contract for the Decentralized Student Marketplace. Implemented by member4.
contract Reputation is ReentrancyGuard {
    Marketplace public immutable market;
    mapping(address => uint256) private ratingTotal;
    mapping(address => uint256) private ratingCount;
    mapping(uint256 => bool) public listingRated;

    event RatingSubmitted(address indexed rater, address indexed rated, uint8 rating, uint256 indexed listingId);
    error NotSold(); error NotBuyer(); error BadRating(); error AlreadyRated();

    constructor(address marketplace) { market = Marketplace(marketplace); }

    function rateUser(uint256 listingId, uint8 rating) external nonReentrant {
        Marketplace.Listing memory listing = market.getListing(listingId);

        if (listing.status != Marketplace.Status.Sold) revert NotSold();
        if (msg.sender != listing.buyer) revert NotBuyer();
        if (rating < 1 || rating > 5) revert BadRating();
        if (listingRated[listingId]) revert AlreadyRated();

        listingRated[listingId] = true;
        ratingTotal[listing.seller] += rating;
        ratingCount[listing.seller] += 1;

        emit RatingSubmitted(msg.sender, listing.seller, rating, listingId);
    }

    function getAverageRating(address user) external view returns (uint256 total, uint256 count) {
        return (ratingTotal[user], ratingCount[user]);
    }
}