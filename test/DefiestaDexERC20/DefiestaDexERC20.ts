import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { unitFixtureDefiestaDexFactory } from "../fixtures";
import { shouldBehaveLikeUniswapV2ERC20 } from "./specs/UniswapV2ERC20.spec";

export function unitTestsDefiestaDexERC20(): void {
  describe("DefiestaDex ERC20", function () {
    beforeEach(async function () {
      const { DefiestaDexToken, factory } = await loadFixture(unitFixtureDefiestaDexFactory);
      this.contracts.DefiestaDexToken = DefiestaDexToken;
      this.contracts.DefiestaDexFactory = factory;
    });
    describe("UniswapV2ERC20", function () {
      shouldBehaveLikeUniswapV2ERC20();
    });
  });
}
