// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity =0.8.17;

// contracts
import "../DefiestaDexPairV1.sol";

contract DefiestaDexPairTestV1 is DefiestaDexPairV1 {
    function setFictivePoolValues(uint128 _fictiveReserve0, uint128 _fictiveReserve1) public {
        (fictiveReserve0, fictiveReserve1) = (_fictiveReserve0, _fictiveReserve1);
    }

    function setPriceAverage(uint128 _priceAverage0, uint128 _priceAverage1, uint40 _priceAverageLastTimestamp) public {
        (priceAverage0, priceAverage1, priceAverageLastTimestamp) = (
            _priceAverage0,
            _priceAverage1,
            _priceAverageLastTimestamp
        );
    }
}
