// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title EnigCredit (ENGC) — Slice 1 (Token + Wallet)  [STUDENT TEMPLATE]
/// @notice Implement every TODO(member1). Spec: docs/token-module.md + test/EnigCredit.t.sol.
contract EnigCredit is ERC20, Ownable {
    constructor() ERC20("EnigCredit", "ENGC") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
    function mint(address to, uint256 amount) external onlyOwner {
        // TODO(member1): _mint(to, amount);
        revert("TODO(member1): implement mint");
    }
}
