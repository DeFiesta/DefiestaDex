import { expect } from "chai";
import { constants } from "ethers/lib/ethers";

import { FEES_LP, FEES_POOL, MAX_FEES, MAX_UINT128 } from "../../constants";
export function shouldSetFeesUnderLimits(): void {
  it("should have default values", async function () {
    const [feesLP, feesPool] = await this.contracts.DefiestaDexPairTest.getPairFees();
    expect(feesLP).to.be.equal(FEES_LP) && expect(feesPool).to.be.equal(FEES_POOL);
  });

  it("should not set fees as user", async function () {
    const owner = await this.contracts.DefiestaDexFactory.owner();
    expect(owner).to.not.be.equal(this.signers.user.address) &&
      (await expect(
        this.contracts.DefiestaDexPairTest.connect(this.signers.user).setFees(FEES_LP, FEES_POOL),
      ).to.be.revertedWith("DefiestaDex: NOT_OWNER"));
  });

  it("should set fees as owner", async function () {
    const owner = await this.contracts.DefiestaDexFactory.owner();
    expect(owner).to.be.equal(this.signers.admin.address) &&
      (await expect(this.contracts.DefiestaDexPairTest.setFees(FEES_LP, FEES_POOL)).to.not.be.reverted);
  });

  it("should set fees as owner", async function () {
    const owner = await this.contracts.DefiestaDexFactory.owner();
    expect(owner).to.be.equal(this.signers.admin.address) &&
      (await expect(this.contracts.DefiestaDexPairTest.setFees(FEES_LP, FEES_POOL)).to.not.be.reverted);
  });

  it("should not set limited values", async function () {
    await expect(this.contracts.DefiestaDexPairTest.setFees(0, FEES_POOL)).to.be.revertedWith("DefiestaDex: ZERO_FEES_LP");
    await expect(this.contracts.DefiestaDexPairTest.setFees(1, MAX_FEES)).to.be.revertedWith("DefiestaDex: FEES_MAX");
    await expect(this.contracts.DefiestaDexPairTest.setFees(1, MAX_UINT128)).to.be.revertedWithPanic;
    await expect(this.contracts.DefiestaDexPairTest.setFees(1, MAX_FEES)).to.be.revertedWith("DefiestaDex: FEES_MAX");
    await expect(this.contracts.DefiestaDexPairTest.setFees(MAX_UINT128, 0)).to.be.revertedWith("DefiestaDex: FEES_MAX");

    await expect(this.contracts.DefiestaDexPairTest.setFees(1, constants.MaxUint256)).to.be.revertedWithPanic;
  });
}
