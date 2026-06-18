// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {EnigCredit} from "../contracts/EnigCredit.sol";

/// @notice Slice 1 — Token + Wallet.
contract EnigCreditTest is Test {
    EnigCredit token;
    address alice = address(0xA11CE);

    function setUp() public { token = new EnigCredit(); }

    function test_Metadata() public view {
        assertEq(token.name(), "EnigCredit");
        assertEq(token.symbol(), "ENGC");
        assertEq(token.decimals(), 18);
    }

    function test_InitialSupplyToDeployer() public view {
        assertEq(token.totalSupply(), 1_000_000 ether);
        assertEq(token.balanceOf(address(this)), 1_000_000 ether);
    }

    function test_OwnerCanMint() public {
        token.mint(alice, 500 ether);
        assertEq(token.balanceOf(alice), 500 ether);
    }

    function test_RevertWhen_NonOwnerMints() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(alice, 1 ether);
    }

    function test_Transfer() public {
        token.transfer(alice, 100 ether);
        assertEq(token.balanceOf(alice), 100 ether);
    }
}
