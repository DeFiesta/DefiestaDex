// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.17;

interface IDefiestaDexOwnableFactory {
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function owner() external view returns (address);
    function renounceOwnership() external;
    function transferOwnership(address _newOwner) external;

    function feeTo() external view returns (address);
}
