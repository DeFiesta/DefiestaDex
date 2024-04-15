// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "../DefiestaDexToken.sol";

contract DefiestaDexTokenTest is DefiestaDexToken {
    constructor(string memory _name, string memory _symbol, uint256 _supply) DefiestaDexToken(_name, _symbol, _supply) {}

    function mint(address to, uint256 value) external {
        _mint(to, value);
    }
}
