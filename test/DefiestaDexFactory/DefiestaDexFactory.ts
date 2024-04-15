import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { unitFixtureDefiestaDexFactory } from "../fixtures";
import { shouldBehaveLikeConstructor } from "./deployment/constructor";
import { shouldBehaveLikeUniswapV2Factory } from "./specs/DefiestaDexFactory.spec";

export function unitTestDefiestaDexFactory(): void {
  describe("DefiestaDexFactory", function () {
    beforeEach(async function () {
      const { DefiestaDexToken, factory } = await loadFixture(unitFixtureDefiestaDexFactory);
      this.contracts.DefiestaDexToken = DefiestaDexToken;
      this.contracts.DefiestaDexFactory = factory;
    });

    describe("Effects Functions", function () {
      describe("Deployment", function () {
        shouldBehaveLikeConstructor();
      });
    });

    describe("UniswapV2Factory Spec", function () {
      shouldBehaveLikeUniswapV2Factory();
    });
  });
}
