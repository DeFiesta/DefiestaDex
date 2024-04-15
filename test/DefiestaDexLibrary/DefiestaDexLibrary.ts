import { unitFixtureDefiestaDexLibraryTest } from "../fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { shouldBehaveLikeComputeFictiveReserves } from "./specs/computeFictiveReserves.spec";
import { shouldBehaveLikeApplyKConstRuleOut } from "./specs/applyKConstRuleOut.spec";
import { shouldBehaveLikeApplyKConstRuleIn } from "./specs/applyKConstRuleIn.spec";
import { shouldBehaveLikeComputeFirstTradeQtyIn } from "./specs/computeFirstTradeQtyIn.spec";
import { shouldBehaveLikeComputeFirstTradeQtyOut } from "./specs/computeFirstTradeQtyOut.spec";
import { shouldBehaveLikeGetAmountIn } from "./specs/getAmountIn.spec";
import { shouldBehaveLikeGetAmountOut } from "./specs/getAmountOut.spec";
import { shouldBehaveLikeGetUpdatedPriceAverage } from "./specs/getUpdatedPriceAverage.spec";

export function unitTestsDefiestaDexLibrary(): void {
  describe("DefiestaDexLibraryTest", function () {
    beforeEach(async function () {
      const { DefiestaDexLibraryTest, DefiestaDexRouter, DefiestaDexPair, token0, token1 } = await loadFixture(
        unitFixtureDefiestaDexLibraryTest,
      );

      this.contracts.DefiestaDexLibraryTest = DefiestaDexLibraryTest;
      this.contracts.DefiestaDexRouter = DefiestaDexRouter;
      this.contracts.DefiestaDexPair = DefiestaDexPair;
      this.token0 = token0;
      this.token1 = token1;
    });

    describe("Get Updated Price Average", function () {
      shouldBehaveLikeGetUpdatedPriceAverage();
    });

    describe("Compute Reserve Fic", function () {
      shouldBehaveLikeComputeFictiveReserves();
    });

    describe("Apply K Const Rule Out", function () {
      shouldBehaveLikeApplyKConstRuleOut();
    });

    describe("Apply K Const Rule In", function () {
      shouldBehaveLikeApplyKConstRuleIn();
    });

    describe("Compute First Trade Qty In", function () {
      shouldBehaveLikeComputeFirstTradeQtyIn();
    });

    describe("Compute First Trade Qty Out", function () {
      shouldBehaveLikeComputeFirstTradeQtyOut();
    });

    describe("Get Amount In", function () {
      shouldBehaveLikeGetAmountIn();
    });

    describe("Get Amount Out", function () {
      shouldBehaveLikeGetAmountOut();
    });
  });
}
