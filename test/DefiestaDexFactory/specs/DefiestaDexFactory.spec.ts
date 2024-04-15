import { expect } from "chai";
import { getCreate2Address } from "../utils";
import { constants } from "ethers/lib/ethers";
import { DefiestaDexFactory, DefiestaDexPair, DefiestaDexPair__factory } from "../../../typechain";
import { ethers } from "hardhat";
import { FEES_LP, FEES_POOL, FEES_BASE, MAX_UINT128 } from "../../constants";

const TEST_ADDRESSES: [string, string] = [
  "0x1000000000000000000000000000000000000000",
  "0x2000000000000000000000000000000000000000",
];

export function shouldBehaveLikeUniswapV2Factory(): void {
  it("feeTo, owner, allPairsLength", async function () {
    expect(await this.contracts.DefiestaDexFactory.feeTo()).to.eq(constants.Zero);
    expect(await this.contracts.DefiestaDexFactory.owner()).to.eq(this.signers.admin.address);
    expect(await this.contracts.DefiestaDexFactory.allPairsLength()).to.eq(0);
  });

  async function createPair(tokens: [string, string], DefiestaDexFactory: DefiestaDexFactory) {
    const create2Address = getCreate2Address(DefiestaDexFactory.address, tokens, DefiestaDexPair__factory.bytecode);
    await expect(DefiestaDexFactory.createPair(...tokens))
      .to.emit(DefiestaDexFactory, "PairCreated")
      .withArgs(TEST_ADDRESSES[0], TEST_ADDRESSES[1], create2Address, constants.One);

    await expect(DefiestaDexFactory.createPair(tokens[0], tokens[1])).to.be.revertedWith("DefiestaDex: PAIR_EXISTS");
    await expect(DefiestaDexFactory.createPair(tokens[1], tokens[0])).to.be.revertedWith("DefiestaDex: PAIR_EXISTS");
    await expect(DefiestaDexFactory.createPair(tokens[0], tokens[0])).to.be.revertedWith("DefiestaDex: IDENTICAL_ADDRESSES");
    await expect(DefiestaDexFactory.createPair(tokens[0], constants.AddressZero)).to.be.revertedWith(
      "DefiestaDex: ZERO_ADDRESS",
    );
    expect(await DefiestaDexFactory.getPair(tokens[0], tokens[1])).to.eq(create2Address);
    expect(await DefiestaDexFactory.getPair(tokens[1], tokens[0])).to.eq(create2Address);
    expect(await DefiestaDexFactory.allPairs(0)).to.eq(create2Address);
    expect(await DefiestaDexFactory.allPairsLength()).to.eq(1);

    const poolContractFactory = await ethers.getContractFactory("DefiestaDexPair");
    const pair: DefiestaDexPair = poolContractFactory.attach(create2Address);
    expect(await pair.factory()).to.eq(DefiestaDexFactory.address);
    expect(await pair.token0()).to.eq(TEST_ADDRESSES[0]);
    expect(await pair.token1()).to.eq(TEST_ADDRESSES[1]);
  }

  it("createPair", async function () {
    await createPair(TEST_ADDRESSES, this.contracts.DefiestaDexFactory);
  });

  it("createPair:reverse", async function () {
    await createPair(TEST_ADDRESSES.slice().reverse() as [string, string], this.contracts.DefiestaDexFactory);
  });

  it("setFeeTo", async function () {
    await expect(
      this.contracts.DefiestaDexFactory.connect(this.signers.user).setFeeTo(this.signers.user.address),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await this.contracts.DefiestaDexFactory.setFeeTo(this.signers.admin.address);
    expect(await this.contracts.DefiestaDexFactory.feeTo()).to.eq(this.signers.admin.address);
  });

  it("transferOwnership", async function () {
    await expect(
      this.contracts.DefiestaDexFactory.connect(this.signers.user).transferOwnership(this.signers.user.address),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await this.contracts.DefiestaDexFactory.transferOwnership(this.signers.user.address);
    expect(await this.contracts.DefiestaDexFactory.owner()).to.eq(this.signers.user.address);
    await expect(this.contracts.DefiestaDexFactory.transferOwnership(this.signers.admin.address)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
  });

  it("setFees", async function () {
    await expect(
      this.contracts.DefiestaDexFactory.connect(this.signers.user).setFees(FEES_LP, FEES_POOL),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await this.contracts.DefiestaDexFactory.transferOwnership(this.signers.user.address);
    expect(await this.contracts.DefiestaDexFactory.owner()).to.eq(this.signers.user.address);
    await expect(this.contracts.DefiestaDexFactory.transferOwnership(this.signers.admin.address)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
    await this.contracts.DefiestaDexFactory.connect(this.signers.user).transferOwnership(this.signers.admin.address);
    await expect(this.contracts.DefiestaDexFactory.setFees(0, FEES_POOL)).to.be.revertedWith("DefiestaDex: ZERO_FEES_LP");

    const limit = FEES_BASE.div(10);

    await expect(this.contracts.DefiestaDexFactory.setFees(limit, 0)).to.not.be.revertedWith("DefiestaDex: FEES_MAX");

    await expect(this.contracts.DefiestaDexFactory.setFees(limit, 1)).to.be.revertedWith("DefiestaDex: FEES_MAX");
    await expect(this.contracts.DefiestaDexFactory.setFees(MAX_UINT128, 0)).to.be.revertedWith("DefiestaDex: FEES_MAX");
    await expect(this.contracts.DefiestaDexFactory.setFees(constants.MaxUint256, 0)).to.be.revertedWithPanic;
  });
}
