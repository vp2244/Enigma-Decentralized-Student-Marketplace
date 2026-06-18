// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {EnigCredit} from "../contracts/EnigCredit.sol";
import {Marketplace} from "../contracts/Marketplace.sol";

/// @notice Deploys EnigCredit + Marketplace and wires the token address.
contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        EnigCredit token = new EnigCredit();
        Marketplace market = new Marketplace(address(token));
        vm.stopBroadcast();
        console2.log("EnigCredit :", address(token));
        console2.log("Marketplace:", address(market));
    }
}
