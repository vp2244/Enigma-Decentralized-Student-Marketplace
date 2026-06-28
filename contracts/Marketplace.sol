// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
/// @title Marketplace — Slice 2 (Listings) + Slice 3 (Escrow / Trade)  [STUDENT TEMPLATE]
contract Marketplace is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    enum Status { Available, Pending, Sold, Cancelled }
    struct Listing { uint256 id; address seller; address buyer; string title; string category; string condition; uint256 priceInTokens; string imageUrl; Status status; uint256 purchaseTimestamp; }
    IERC20 public immutable token;
    uint256 public nextListingId;
    uint256 public constant CANCELLATION_TIMEOUT = 5 minutes;
    mapping(uint256 => Listing) public listings;
    event ListingCreated(uint256 indexed id, address indexed seller, string title, uint256 priceInTokens);
    event ItemPurchased(uint256 indexed id, address indexed buyer);
    event DeliveryConfirmed(uint256 indexed id, address indexed seller, uint256 amount);
    event PurchaseCancelled(uint256 indexed id, address indexed buyer);
    event ListingCancelled(uint256 indexed id, address indexed seller);
    error EmptyTitle(); error BadPrice(); error NotAvailable(); error SelfPurchase(); error NotPending(); error NotBuyer(); error TimeoutNotReached();
    error NotSeller();
    constructor(address token_) Ownable(msg.sender) { token = IERC20(token_); }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    function createListing(string calldata title, string calldata category, string calldata condition, uint256 priceInTokens, string calldata imageUrl) external whenNotPaused returns (uint256 id) {
        if (bytes(title).length == 0) revert EmptyTitle();
        if (priceInTokens == 0) revert BadPrice();

        id = nextListingId++;
        listings[id] = Listing({
            id: id,
            seller: msg.sender,
            buyer: address(0),
            title: title,
            category: category,
            condition: condition,
            priceInTokens: priceInTokens,
            imageUrl: imageUrl,
            status: Status.Available,
            purchaseTimestamp: 0
        });

        emit ListingCreated(id, msg.sender, title, priceInTokens);
    }
    function getListing(uint256 id) external view returns (Listing memory) { return listings[id]; }
    function totalListings() external view returns (uint256) { return nextListingId; }

    // Slice 3 — Escrow / Trade

    function purchaseItem(uint256 id) external nonReentrant whenNotPaused {
        _escrowPurchase(id);
    }

    function purchaseWithPermit(uint256 id, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external nonReentrant whenNotPaused {
        Listing storage l = listings[id];
        IERC20Permit(address(token)).permit(msg.sender, address(this), l.priceInTokens, deadline, v, r, s);
        _escrowPurchase(id);
    }

    function confirmDelivery(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        if (l.status != Status.Pending) revert NotPending();
        if (msg.sender != l.buyer) revert NotBuyer();
        uint256 amount = l.priceInTokens;
        address seller = l.seller;
        l.status = Status.Sold;
        token.safeTransfer(seller, amount);
        emit DeliveryConfirmed(id, seller, amount);
    }

    function cancelPurchase(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        if (l.status != Status.Pending) revert NotPending();
        if (msg.sender != l.buyer) revert NotBuyer();
        if (block.timestamp < l.purchaseTimestamp + CANCELLATION_TIMEOUT) revert TimeoutNotReached();
        address refundTo = l.buyer;
        uint256 amount = l.priceInTokens;
        l.status = Status.Available;
        l.buyer = address(0);
        l.purchaseTimestamp = 0;
        token.safeTransfer(refundTo, amount);
        emit PurchaseCancelled(id, refundTo);
    }

    // shared by purchaseItem + purchaseWithPermit; effects before transfer (CEI)
    function _escrowPurchase(uint256 id) internal {
        Listing storage l = listings[id];
        if (l.status != Status.Available) revert NotAvailable();
        if (msg.sender == l.seller) revert SelfPurchase();
        l.buyer = msg.sender;
        l.status = Status.Pending;
        l.purchaseTimestamp = block.timestamp;
        token.safeTransferFrom(msg.sender, address(this), l.priceInTokens);
        emit ItemPurchased(id, msg.sender);
    }

    /// @notice Allow the seller to cancel a listing.
    /// - If Available: marks Cancelled, no token movement.
    /// - If Pending: refunds the buyer's escrowed tokens, then marks Cancelled.
    function cancelListing(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        if (l.seller != msg.sender) revert NotSeller();
        if (l.status != Status.Available && l.status != Status.Pending) revert NotAvailable();

        address refundTo = l.buyer;
        uint256 amount   = l.priceInTokens;
        Status  prev     = l.status;

        // Effects first (CEI)
        l.status = Status.Cancelled;
        l.buyer  = address(0);
        l.purchaseTimestamp = 0;

        // Interaction — only transfer if tokens are held in escrow
        if (prev == Status.Pending) {
            token.safeTransfer(refundTo, amount);
            emit PurchaseCancelled(id, refundTo);
        }

        emit ListingCancelled(id, msg.sender);
    }
}
