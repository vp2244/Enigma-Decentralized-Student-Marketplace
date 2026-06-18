// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {EnigCredit} from "../contracts/EnigCredit.sol";
import {Marketplace} from "../contracts/Marketplace.sol";

/// @notice Slice 3 — Escrow & Ratings.
contract EscrowTest is Test {
    EnigCredit token;
    Marketplace market;
    address seller = address(0x5E11E1);
    address buyer  = address(0xB0B);
    uint256 price  = 50 ether;
    uint256 id;

    function setUp() public {
        token = new EnigCredit();
        market = new Marketplace(address(token));
        token.transfer(buyer, 1000 ether);           // fund buyer
        vm.prank(seller);
        id = market.createListing("Calculus Textbook", "Textbook", "Good", price, "");
        vm.prank(buyer);
        token.approve(address(market), price);        // approve escrow
    }

    function test_PurchaseEscrowsTokens() public {
        vm.prank(buyer);
        market.purchaseItem(id);
        assertEq(token.balanceOf(address(market)), price);
        assertEq(uint256(market.getListing(id).status), uint256(Marketplace.Status.Pending));
    }

    function test_RevertWhen_SellerBuysOwn() public {
        vm.prank(seller);
        vm.expectRevert(Marketplace.SelfPurchase.selector);
        market.purchaseItem(id);
    }

    function test_ConfirmDeliveryPaysSeller() public {
        vm.prank(buyer);
        market.purchaseItem(id);
        vm.prank(buyer);
        market.confirmDelivery(id);
        assertEq(token.balanceOf(seller), price);
        assertEq(uint256(market.getListing(id).status), uint256(Marketplace.Status.Sold));
    }

    function test_RevertWhen_CancelBeforeTimeout() public {
        vm.prank(buyer);
        market.purchaseItem(id);
        vm.prank(buyer);
        vm.expectRevert(Marketplace.TimeoutNotReached.selector);
        market.cancelPurchase(id);
    }

    function test_CancelAfterTimeoutRefundsBuyer() public {
        vm.prank(buyer);
        market.purchaseItem(id);
        vm.warp(block.timestamp + 5 minutes + 1);
        vm.prank(buyer);
        market.cancelPurchase(id);
        assertEq(token.balanceOf(buyer), 1000 ether);
        assertEq(uint256(market.getListing(id).status), uint256(Marketplace.Status.Available));
    }

    function test_RateUserAndAverage() public {
        vm.prank(buyer); market.purchaseItem(id);
        vm.prank(buyer); market.confirmDelivery(id);
        vm.prank(buyer); market.rateUser(id, 5);
        (uint256 total, uint256 count) = market.getAverageRating(seller);
        assertEq(total, 5); assertEq(count, 1);
    }

    function test_RevertWhen_RateTwice() public {
        vm.prank(buyer); market.purchaseItem(id);
        vm.prank(buyer); market.confirmDelivery(id);
        vm.prank(buyer); market.rateUser(id, 4);
        vm.prank(buyer);
        vm.expectRevert(Marketplace.AlreadyRated.selector);
        market.rateUser(id, 4);
    }

    function test_RevertWhen_RateUnsold() public {
        vm.prank(buyer);
        vm.expectRevert(Marketplace.NotSold.selector);
        market.rateUser(id, 5);
    }
}
