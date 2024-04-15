import { expect } from "chai";

export function shouldBehaveLikeInitialize(): void {
  it("initialize should revert when not called by factory", async function () {
    await expect(
      this.contracts.DefiestaDexPair.initialize(this.contracts.token0.address, this.contracts.token1.address, 700, 500),
    ).to.be.revertedWith("DefiestaDex: FORBIDDEN");
  });
}
