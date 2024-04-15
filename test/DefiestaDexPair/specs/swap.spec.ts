import { expect } from "chai";
import { hexConcat, parseEther } from "ethers/lib/utils";
import { constants } from "ethers";
import { sendTokensToPair } from "../utils";
import { getSwapEncodedData } from "../../utils";

export function shouldBehaveLikeSwap(): void {
  let PATH_ZERO_TO_ONE: string;
  let PATH_ONE_TO_ZERO: string;

  beforeEach(async function () {
    await this.contracts.DefiestaDexRouterTest.mint(
      this.contracts.DefiestaDexPair.address,
      this.signers.admin.address,
      parseEther("10"),
      parseEther("10"),
      this.signers.admin.address,
    );

    PATH_ZERO_TO_ONE = hexConcat([this.contracts.token0.address, this.contracts.token1.address]);
    PATH_ONE_TO_ZERO = hexConcat([this.contracts.token1.address, this.contracts.token0.address]);
  });

  it("swap should revert when called directly without callback", async function () {
    await sendTokensToPair(this.contracts, parseEther("1"), constants.Zero);
    await expect(
      this.contracts.DefiestaDexPair.swap(
        this.signers.admin.address,
        true,
        parseEther("1"),
        getSwapEncodedData(this.signers.admin.address, PATH_ZERO_TO_ONE),
      ),
    ).to.be.reverted;
  });

  it("swap should revert when no _amountSpecified", async function () {
    await expect(
      this.contracts.DefiestaDexRouterTest.swap(
        this.contracts.DefiestaDexPair.address,
        this.signers.admin.address,
        true,
        0,
        getSwapEncodedData(this.signers.admin.address, PATH_ZERO_TO_ONE),
      ),
    ).to.be.revertedWith("DefiestaDex: ZERO_AMOUNT");
  });

  it("swap should revert when to is a token of the pair", async function () {
    await expect(
      this.contracts.DefiestaDexRouterTest.swap(
        this.contracts.DefiestaDexPair.address,
        this.contracts.token0.address,
        true,
        parseEther("1"),
        getSwapEncodedData(this.signers.admin.address, PATH_ZERO_TO_ONE),
      ),
    ).to.be.revertedWith("DefiestaDex: INVALID_TO");

    await expect(
      this.contracts.DefiestaDexRouterTest.swap(
        this.contracts.DefiestaDexPair.address,
        this.contracts.token1.address,
        true,
        parseEther("1"),
        getSwapEncodedData(this.signers.admin.address, PATH_ZERO_TO_ONE),
      ),
    ).to.be.revertedWith("DefiestaDex: INVALID_TO");
  });

  it("swap should revert with INSUFFICIENT_TOKEN0_INPUT_AMOUNT on a custom callback", async function () {
    await this.contracts.token0.approve(this.contracts.DefiestaDexRouterCallbackTest.address, constants.MaxUint256);
    await this.contracts.token1.approve(this.contracts.DefiestaDexRouterCallbackTest.address, constants.MaxUint256);

    await expect(
      this.contracts.DefiestaDexRouterCallbackTest.swap(
        this.contracts.DefiestaDexPair.address,
        this.signers.admin.address,
        true,
        parseEther("1"),
        getSwapEncodedData(this.signers.admin.address, PATH_ZERO_TO_ONE),
      ),
    ).to.be.revertedWith("DefiestaDex: INSUFFICIENT_TOKEN0_INPUT_AMOUNT");
  });

  it("swap should revert with INSUFFICIENT_TOKEN1_INPUT_AMOUNT on a custom callback", async function () {
    await this.contracts.token0.approve(this.contracts.DefiestaDexRouterCallbackTest.address, constants.MaxUint256);
    await this.contracts.token1.approve(this.contracts.DefiestaDexRouterCallbackTest.address, constants.MaxUint256);

    await expect(
      this.contracts.DefiestaDexRouterCallbackTest.swap(
        this.contracts.DefiestaDexPair.address,
        this.signers.admin.address,
        false,
        parseEther("1"),
        getSwapEncodedData(this.signers.admin.address, PATH_ZERO_TO_ONE),
      ),
    ).to.be.revertedWith("DefiestaDex: INSUFFICIENT_TOKEN1_INPUT_AMOUNT");
  });
}
