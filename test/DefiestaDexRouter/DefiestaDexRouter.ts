import { constants } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  unitFixtureCallbackTest,
  unitFixtureDefiestaDexPairTest,
  unitFixtureDefiestaDexRouter,
  unitFixtureDefiestaDexRouterTest,
} from "../fixtures";
import { shouldBehaveLikeDefiestaDexRouterQuote } from "./specs/quote.spec";
import { testExploit, testHack, testHack4, testNewDefiestaDex } from "./specs/BestTrade.spec";
import { shouldBehaveLikeDefiestaDexRouterPairFor } from "./specs/pairFor.spec";
import { shouldBehaveLikeRouterScenarios } from "./specs/RouterScenarios.spec";
import { shouldBehaveLikeMintCallback } from "./specs/mintCallback.spec";
import { shouldBehaveLikeAddLiquidity } from "./specs/addLiquidity.spec";
import { shouldBehaveLikeAddLiquidityETH } from "./specs/addLiquidityETH.spec";
import { shouldBehaveLikeRemoveLiquidity } from "./specs/removeLiquidity.spec";
import { shouldBehaveLikeRemoveLiquidityETH } from "./specs/removeLiquidityETH.spec";
import { shouldBehaveLikeRemoveLiquidityWithPermit } from "./specs/removeLiquidityWithPermit.spec";
import { shouldBehaveLikeRemoveLiquidityETHWithPermit } from "./specs/removeLiquidityETHWithPermit.spec";
import { shouldBehaveLikeSwapExactTokensForTokens } from "./specs/swapExactTokensForTokens.spec";
import { shouldBehaveLikeSwapTokensForExactTokens } from "./specs/swapTokensForExactTokens.spec";
import { shouldBehaveLikeSwapExactETHForTokens } from "./specs/swapExactETHForTokens.spec";
import { shouldBehaveLikeSwapTokensForExactETH } from "./specs/swapTokensForExactETH.spec";
import { shouldBehaveLikeSwapExactTokensForETH } from "./specs/swapExactTokensForETH.spec";
import { shouldBehaveLikeSwapETHForExactTokens } from "./specs/swapETHForExactTokens.spec";
import { shouldBehaveLikeSwapCallback } from "./specs/swapCallback.spec";
import { shouldBehaveLikeUnwrapWETH } from "./specs/unwrapWETH.spec";
import { shouldBehaveLikeCheckFailedTest } from "./specs/testnetCheckFailedTest";
import { shouldRefundUnusedETH } from "./specs/refundEth.spec";
import { shouldBehaveLikeDefiestaDexRouterGetAmountFromPair } from "./specs/getAmountFromPair.spec";

export function unitTestsDefiestaDexRouter(): void {
  describe("DefiestaDexRouter", function () {
    describe("Router Test", function () {
      beforeEach(async function () {
        const { token0, token1, factory, pair, DefiestaDexRouterTest, WETH } = await loadFixture(
          unitFixtureDefiestaDexRouterTest,
        );

        this.contracts.token0 = token0;
        this.contracts.token1 = token1;
        this.contracts.DefiestaDexFactory = factory;
        this.contracts.DefiestaDexPair = pair;
        this.contracts.DefiestaDexRouterTest = DefiestaDexRouterTest;
        this.contracts.WETH = WETH;
      });

      describe("DefiestaDex Router pairFor", function () {
        shouldBehaveLikeDefiestaDexRouterPairFor();
      });
      describe("DefiestaDex Router unwrapWETHTest", function () {
        shouldBehaveLikeUnwrapWETH();
      });
    });

    describe("getAmountFromPair Test", function () {
      beforeEach(async function () {
        const { token0, token1, DefiestaDexPairTest, factory, DefiestaDexRouterTest } = await loadFixture(
          unitFixtureDefiestaDexPairTest,
        );

        this.contracts.token0 = token0;
        this.contracts.token1 = token1;
        this.contracts.DefiestaDexFactory = factory;
        this.contracts.DefiestaDexPairTest = DefiestaDexPairTest;
        this.contracts.DefiestaDexRouterTest = DefiestaDexRouterTest;
      });

      describe("DefiestaDex Router getAmountFromPair", function () {
        shouldBehaveLikeDefiestaDexRouterGetAmountFromPair();
      });
    });

    describe("DefiestaDexRouter user functions", function () {
      beforeEach(async function () {
        const {
          token0,
          token1,
          WETH,
          WETHPartner,
          factory,
          autoSwapper,
          DefiestaDexRouter,
          pair,
          WETHPair,
          routerEventEmitter,
        } = await loadFixture(unitFixtureDefiestaDexRouter);
        this.contracts.token0 = token0;
        this.contracts.token1 = token1;
        this.contracts.WETH = WETH;
        this.contracts.WETHPartner = WETHPartner;
        this.contracts.DefiestaDexFactory = factory;
        this.contracts.autoSwapper = autoSwapper;
        this.contracts.DefiestaDexRouter = DefiestaDexRouter;
        this.contracts.DefiestaDexPair = pair;
        this.contracts.WETHPair = WETHPair;
        this.contracts.routerEventEmitter = routerEventEmitter;
        await this.contracts.token0.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);
        await this.contracts.token1.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);
        await this.contracts.WETHPartner.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);
        await this.contracts.WETH.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);
      });
      shouldBehaveLikeRouterScenarios();

      describe("Add Liquidity", function () {
        shouldBehaveLikeAddLiquidity();
      });
      describe("Add Liquidity ETH", function () {
        shouldBehaveLikeAddLiquidityETH();
      });
      describe("Remove Liquidity", function () {
        shouldBehaveLikeRemoveLiquidity();
      });
      describe("Remove Liquidity ETH", function () {
        shouldBehaveLikeRemoveLiquidityETH();
      });
      describe("Remove Liquidity With Permit", function () {
        shouldBehaveLikeRemoveLiquidityWithPermit();
      });
      describe("Remove Liquidity ETH With Permit", function () {
        shouldBehaveLikeRemoveLiquidityETHWithPermit();
      });
      describe("Refund unused ETH", function () {
        shouldRefundUnusedETH();
      });
      describe("swapExactTokensForTokens", () => {
        shouldBehaveLikeSwapExactTokensForTokens();
      });
      describe("swapTokensForExactTokens", () => {
        shouldBehaveLikeSwapTokensForExactTokens();
      });
      describe("swapExactETHForTokens", () => {
        shouldBehaveLikeSwapExactETHForTokens();
      });
      describe("swapTokensForExactETH", () => {
        shouldBehaveLikeSwapTokensForExactETH();
      });
      describe("swapExactTokensForETH", () => {
        shouldBehaveLikeSwapExactTokensForETH();
      });
      describe("swapETHForExactTokens", () => {
        shouldBehaveLikeSwapETHForExactTokens();
      });
      describe("Router Quote", function () {
        shouldBehaveLikeDefiestaDexRouterQuote();
      });
    });

    describe("check callback", function () {
      beforeEach(async function () {
        const { token0, token1, factory, DefiestaDexRouterCallbackTest, fakeERC20reentrancy, DefiestaDexRouter, pair, WETH } =
          await loadFixture(unitFixtureCallbackTest);
        this.contracts.token0 = token0;
        this.contracts.token1 = token1;
        this.contracts.WETH = WETH;

        this.contracts.DefiestaDexFactory = factory;
        this.contracts.DefiestaDexRouterCallbackTest = DefiestaDexRouterCallbackTest;
        this.contracts.fakeERC20reentrancy = fakeERC20reentrancy;
        this.contracts.DefiestaDexRouter = DefiestaDexRouter;
        this.contracts.DefiestaDexPair = pair;
        //set feeto
        await this.contracts.DefiestaDexFactory.setFeeTo(this.signers.feeTo.address);
        await this.contracts.token0.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);
        await this.contracts.token1.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);
        await this.contracts.token0.approve(this.contracts.DefiestaDexRouterCallbackTest.address, constants.MaxUint256);
        await this.contracts.token1.approve(this.contracts.DefiestaDexRouterCallbackTest.address, constants.MaxUint256);
      });
      describe("Mint callback", function () {
        shouldBehaveLikeMintCallback();
      });
      describe("Swap callback", function () {
        shouldBehaveLikeSwapCallback();
      });
    });

    describe("Failed Test", function () {
      beforeEach(async function () {
        const { factory, DefiestaDexPairTest, token0, token1, routerForPairTest, WETH } = await loadFixture(
          unitFixtureDefiestaDexPairTest,
        );

        this.contracts.DefiestaDexFactoryTest = factory;
        this.contracts.DefiestaDexPairTest = DefiestaDexPairTest;
        this.contracts.token0 = token0;
        this.contracts.token1 = token1;
        this.contracts.routerForPairTest = routerForPairTest;
        this.contracts.WETH = WETH;

        await this.contracts.token0.approve(this.contracts.routerForPairTest.address, constants.MaxUint256);
        await this.contracts.token1.approve(this.contracts.routerForPairTest.address, constants.MaxUint256);
      });

      describe("check", function () {
        shouldBehaveLikeCheckFailedTest();
      });
    });

    describe("Checking scenario", function () {
      // As swap loops will be quite long we need to increase test timeout
      // 120s should be enough for now
      this.timeout(120000);
      describe("Exploit test case 1", function () {
        testExploit();
      });
      describe("Exploit test case 2", function () {
        testNewDefiestaDex();
      });
      describe("Exploit test case 3", function () {
        testHack();
      });
      describe("Exploit test case 4", function () {
        testHack4();
      });
    });
  });
}
