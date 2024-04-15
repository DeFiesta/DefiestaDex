// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.8.17;

// contracts
import "./DefiestaDexPair.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DefiestaDexFactory
 * @notice facilitates creation of DefiestaDexPair to swap tokens.
 */
contract DefiestaDexFactory is Ownable {
    address public feeTo;
    uint128 internal feesLP = 700; // MIN 1
    uint128 internal feesPool = 300;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 totalPair);
    event FeesChanged(uint256 indexed feesLP, uint256 indexed feesPool);
    event FeeToUpdated(address indexed previousFeeTo, address indexed newFeeTo);

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    function getPairs(address _tokenA, address _tokenB) external view returns (address) {
        return getPair[_tokenA][_tokenB];
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function getDefaultFees() external view returns (uint128 feesLP_, uint128 feesPool_) {
        feesLP_ = feesLP;
        feesPool_ = feesPool;
    }

    function createPair(address _tokenA, address _tokenB) external returns (address pair_) {
        require(_tokenA != _tokenB, "DefiestaDex: IDENTICAL_ADDRESSES");
        (address _token0, address _token1) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
        require(_token0 != address(0), "DefiestaDex: ZERO_ADDRESS");
        require(getPair[_token0][_token1] == address(0), "DefiestaDex: PAIR_EXISTS"); // single check is sufficient
        bytes32 _salt = keccak256(abi.encodePacked(_token0, _token1));
        DefiestaDexPair _pair = new DefiestaDexPair{ salt: _salt }();
        _pair.initialize(_token0, _token1, feesLP, feesPool);
        pair_ = address(_pair);
        getPair[_token0][_token1] = pair_;
        getPair[_token1][_token0] = pair_; // populate mapping in the reverse direction
        allPairs.push(pair_);

        emit PairCreated(_token0, _token1, pair_, allPairs.length);
    }

    function setFeeTo(address _feeTo) external onlyOwner {
        address _previousFeeTo = feeTo;
        feeTo = _feeTo;

        emit FeeToUpdated(_previousFeeTo, _feeTo);
    }
}
