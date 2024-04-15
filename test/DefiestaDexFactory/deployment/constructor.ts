import { expect } from "chai";

export function shouldBehaveLikeConstructor(): void {
  it("parameters check", async function () {
    expect(await this.contracts.DefiestaDexFactory.owner()).to.be.equal(this.signers.admin.address);
  });
}
