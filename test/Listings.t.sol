// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {EnigCredit} from "../contracts/EnigCredit.sol";
import {Marketplace} from "../contracts/Marketplace.sol";

/// @notice Slice 2 — Listings.
contract ListingsTest is Test {
    EnigCredit token;
    Marketplace market;
    address seller = address(0x5E11E1);
    address attacker = address(0xDEAD);

    function setUp() public {
        token = new EnigCredit();
        market = new Marketplace(address(token));
    }

    function test_CreateListing() public {
        vm.prank(seller);
        uint256 id = market.createListing("Calculus Textbook", "Textbook", "Good", 50 ether, "");
        assertEq(id, 0);
        assertEq(market.totalListings(), 1);
        Marketplace.Listing memory l = market.getListing(id);
        assertEq(l.seller, seller);
        assertEq(l.priceInTokens, 50 ether);
        assertEq(uint256(l.status), uint256(Marketplace.Status.Available));
    }

    function test_RevertWhen_EmptyTitle() public {
        vm.expectRevert(Marketplace.EmptyTitle.selector);
        market.createListing("", "Textbook", "Good", 50 ether, "");
    }

    function test_RevertWhen_ZeroPrice() public {
        vm.expectRevert(Marketplace.BadPrice.selector);
        market.createListing("Notes", "Notes", "New", 0, "");
    }

    function test_IdsIncrement() public {
        market.createListing("A", "Other", "New", 1 ether, "");
        market.createListing("B", "Other", "New", 2 ether, "");
        assertEq(market.totalListings(), 2);
    }

    function test_SellerCanCancelAvailable() public {
        vm.prank(seller);
        uint256 id = market.createListing("Calc", "Textbook", "Good", 10 ether, "");

        vm.prank(seller);
        market.cancelListing(id);

        Marketplace.Listing memory l = market.getListing(id);
        assertEq(uint256(l.status), uint256(Marketplace.Status.Cancelled));
    }

    function test_RevertWhen_NotSeller() public {
        vm.prank(seller);
        uint256 id = market.createListing("Calc", "Textbook", "Good", 10 ether, "");

        vm.prank(attacker);
        vm.expectRevert(Marketplace.NotSeller.selector);
        market.cancelListing(id);
    }

    function test_RevertWhen_NotAvailable() public {
        vm.prank(seller);
        uint256 id = market.createListing("Calc", "Textbook", "Good", 10 ether, "");

        // cancel once
        vm.prank(seller);
        market.cancelListing(id);

        // second cancel should revert with NotAvailable
        vm.prank(seller);
        vm.expectRevert(Marketplace.NotAvailable.selector);
        market.cancelListing(id);
    }
}
