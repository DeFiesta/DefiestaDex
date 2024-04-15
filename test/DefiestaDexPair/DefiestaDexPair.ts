import { unitFixtureDefiestaDexPairTest, unitFixtureDefiestaDexRouterTest } from "../fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { shouldBehaveLikeDefiestaDexPairPriceAverage } from "./specs/pairPriceAverage.spec";
import { shouldBehaveLikeMint } from "./specs/mint.spec";
import { shouldBehaveLikeBurn } from "./specs/burn.spec";
import { constants } from "ethers";
import { shouldBehaveLikeSwap } from "./specs/swap.spec";
import { shouldBehaveLikeSwapWithValues } from "./specs/swapWithValues.spec";
import { shouldBehaveLikeInitialize } from "./specs/initialize.spec";
import { shouldSetFeesUnderLimits } from "./specs/setFees.spec";

export function unitTestsDefiestaDexPair(): void {
  describe("DefiestaDexPair", function () {
    describe("pair functions", function () {
      beforeEach(async function () {
        const { factory, DefiestaDexRouterTest, pair, token0, token1, DefiestaDexRouterCallbackTest } = await loadFixture(
          unitFixtureDefiestaDexRouterTest,
        );
        this.contracts.DefiestaDexFactory = factory;
        this.contracts.DefiestaDexRouterTest = DefiestaDexRouterTest;
        this.contracts.DefiestaDexPair = pair;
        this.contracts.token0 = token0;
        this.contracts.token1 = token1;
        this.contracts.DefiestaDexRouterCallbackTest = DefiestaDexRouterCallbackTest;

        await this.contracts.token0.approve(this.contracts.DefiestaDexRouterTest.address, constants.MaxUint256);
        await this.contracts.token1.approve(this.contracts.DefiestaDexRouterTest.address, constants.MaxUint256);
      });

      describe("Initialize", function () {
        shouldBehaveLikeInitialize();
      });

      describe("Mint", function () {
        shouldBehaveLikeMint();
      });

      describe("Burn", function () {
        shouldBehaveLikeBurn();
      });

      describe("Swap", function () {
        shouldBehaveLikeSwap();
      });

      describe("DefiestaDexPair Price Average", function () {
        shouldBehaveLikeDefiestaDexPairPriceAverage();
      });
    });
    describe("swap value tests", function () {
      beforeEach(async function () {
        const { factory, DefiestaDexPairTest, token0, token1, routerForPairTest } = await loadFixture(
          unitFixtureDefiestaDexPairTest,
        );
        this.contracts.DefiestaDexFactory = factory;
        this.contracts.DefiestaDexPairTest = DefiestaDexPairTest;
        this.contracts.token0 = token0;
        this.contracts.token1 = token1;
        this.contracts.routerForPairTest = routerForPairTest;

        await this.contracts.token0.approve(this.contracts.routerForPairTest.address, constants.MaxUint256);
        await this.contracts.token1.approve(this.contracts.routerForPairTest.address, constants.MaxUint256);
      });
      describe("", function () {
        shouldBehaveLikeSwapWithValues();
      });
    });

    describe("set fees tests", function () {
      beforeEach(async function () {
        const { factory, DefiestaDexPairTest, token0, token1, DefiestaDexRouterTest } = await loadFixture(
          unitFixtureDefiestaDexPairTest,
        );

        this.contracts.DefiestaDexFactory = factory;
        this.contracts.DefiestaDexPairTest = DefiestaDexPairTest;
        this.contracts.token0 = token0;
        this.contracts.token1 = token1;
        this.contracts.routerForPairTest = DefiestaDexRouterTest;
      });

      describe("change pair fees", function () {
        shouldSetFeesUnderLimits();
      });
    });
  });
}
