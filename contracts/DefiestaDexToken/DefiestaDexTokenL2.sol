// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title DefiestaDexToken L2 (DDEX), ERC-20 token
 * @notice ERC20 representation of DDEX on L2s
 */
contract DefiestaDexTokenL2 is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {}
}
