// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
/// @title Marketplace — Slice 2 (Listings) + Slice 3 (Escrow / Trade)  [STUDENT TEMPLATE]
/// @notice Implement TODO(member2)/TODO(member3). Reputation/ratings are in Reputation.sol (member4).
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
    error EmptyTitle(); error BadPrice(); error NotAvailable(); error SelfPurchase(); error NotPending(); error NotBuyer(); error TimeoutNotReached();
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
    function purchaseItem(uint256 id) external nonReentrant whenNotPaused {
        // TODO(member3): checks; Pending; token.safeTransferFrom escrow; emit ItemPurchased.
        revert("TODO(member3): implement purchaseItem");
    }
    function purchaseWithPermit(uint256 id, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external nonReentrant whenNotPaused {
        // TODO(member3): IERC20Permit(address(token)).permit(...); then purchase logic.
        revert("TODO(member3): implement purchaseWithPermit");
    }
    function confirmDelivery(uint256 id) external nonReentrant {
        // TODO(member3): require Pending+buyer; Sold; token.safeTransfer(seller); emit DeliveryConfirmed.
        revert("TODO(member3): implement confirmDelivery");
    }
    function cancelPurchase(uint256 id) external nonReentrant {
        // TODO(member3): require Pending+buyer+timeout; reset; token.safeTransfer(buyer); emit PurchaseCancelled.
        revert("TODO(member3): implement cancelPurchase");
    }
}
