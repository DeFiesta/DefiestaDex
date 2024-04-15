// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.17;

interface IDefiestaDexFactory {
    function allPairsLength() external view returns (uint256);
    function getDefaultFees() external view returns (uint128, uint128);
    function createPair(address _tokenA, address _tokenB) external returns (address);
    function setFeeTo(address _feeTo) external;
    function feeTo() external view returns (address);
    function getPairs(address _tokenA, address _tokenB) external view returns (address);
}
