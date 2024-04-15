import { expect } from "chai";
import { keccak256 } from "ethers/lib/utils";
import { DefiestaDexPair__factory } from "../../../typechain";

export function shouldBehaveLikeDefiestaDexRouterPairFor(): void {
  it("should return same pair address than the factory", async function () {
    const pair = this.contracts.DefiestaDexPair.address;
    const pair_factory = await this.contracts.DefiestaDexFactory.getPair(
      this.contracts.token0.address,
      this.contracts.token1.address,
    );
    const pair_pure = await this.contracts.DefiestaDexRouterTest.pairFor_pure(
      this.contracts.DefiestaDexFactory.address,
      this.contracts.token0.address,
      this.contracts.token1.address,
    );

    const init_hash = ' hex"' + keccak256(DefiestaDexPair__factory.bytecode).slice(2) + '"';

    expect(pair).to.be.eq(pair_factory);
    expect(pair).to.be.eq(
      pair_pure,
      "The init permit hash of the periphery in DefiestaDexLibrary.sol is probably wrong. Try using this one:" +
      init_hash +
      "\n\n",
    );
  });
}
