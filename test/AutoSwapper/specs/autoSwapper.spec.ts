import { expect } from "chai";
import { BigNumber, constants } from "ethers";
import { hexConcat, parseEther } from "ethers/lib/utils";
import {
  AutoSwapper,
  AutoSwapperL2,
  AutoSwapper__factory,
  ERC20Test,
  DefiestaDexPair__factory,
  DefiestaDexRouter,
} from "../../../typechain";
import { getSwapEncodedData } from "../../utils";

async function addLiquidity(
  token0Amount: BigNumber,
  token1Amount: BigNumber,
  token0: ERC20Test,
  token1: ERC20Test,
  router: DefiestaDexRouter,
  adminAddress: string,
) {
  await router.addLiquidity(
    token0.address,
    token1.address,
    token0Amount,
    token1Amount,
    1,
    1,
    adminAddress,
    constants.MaxUint256,
  );
}

async function swapBothTokens(
  router: DefiestaDexRouter,
  amountIn: BigNumber,
  token0: ERC20Test,
  token1: ERC20Test,
  adminAddress: string,
) {
  await router.swapExactTokensForTokens(
    amountIn,
    1,
    [token1.address, token0.address],
    adminAddress,
    constants.MaxUint256,
  );
  await router.swapTokensForExactTokens(
    amountIn,
    constants.MaxUint256,
    [token0.address, token1.address],
    adminAddress,
    constants.MaxUint256,
  );
}

export function shouldBehaveLikeAutoSwapper() {
  describe("Auto Swapper ", function () {
    const DDEXAmount = parseEther("10");
    const TOKEN1Amount = parseEther("10");
    const TenTokens = parseEther("10");
    const amountIn = parseEther("1");

    // create a pair & add liquidity : DDEX/Token1
    beforeEach(async function () {
      await this.contracts.DefiestaDexToken.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);
      await this.contracts.token1.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);
      await addLiquidity(
        TenTokens,
        TenTokens,
        this.contracts.token0,
        this.contracts.token1,
        this.contracts.DefiestaDexRouter,
        this.signers.admin.address,
      );
      await this.contracts.DefiestaDexFactory.setFeeTo(this.contracts.autoSwapper.address);
    });

    context("When autoSwapper contract is feeTo destination in DefiestaDex Factory", function () {
      context("when user tries to execute manually", function () {
        it("Check addresses ", async function () {
          expect(await this.contracts.DefiestaDexFactory.feeTo()).to.eq(this.contracts.autoSwapper.address);
          // staking address is factory contract as we did not deploy a staking contract for unit tests
          try {
            const stakingAddress = await (<AutoSwapper>this.contracts.autoSwapper).stakingAddress();
            expect(stakingAddress).to.eq(this.misc.targetAddress);
          } catch (e) { }
          expect(await this.contracts.autoSwapper.DefiestaDexToken()).to.eq(this.contracts.DefiestaDexToken.address);
          expect(this.contracts.DefiestaDexToken.address).to.eq(this.contracts.token0.address);
        });
        it("should not fail with manual transferred tokens to contract", async function () {
          await this.contracts.token1.transfer(this.contracts.autoSwapper.address, parseEther("1"));
          await this.contracts.token0.transfer(this.contracts.autoSwapper.address, parseEther("1"));
          const balance = await this.contracts.token0.balanceOf(this.contracts.autoSwapper.address);
          expect(balance).to.eq(parseEther("1"));
          await expect(
            this.contracts.autoSwapper.executeWork(this.contracts.token0.address, this.contracts.token1.address),
          ).to.not.be.reverted;
          expect(await this.contracts.token0.balanceOf(this.misc.targetAddress)).to.eq(parseEther("1"));
          expect(await this.contracts.token1.balanceOf(this.contracts.autoSwapper.address)).to.eq(parseEther("1"));
          expect(await this.contracts.token0.balanceOf(this.contracts.autoSwapper.address)).to.eq(0);
        });
        it("should fail when calling DefiestaDexSwapCallback without param ", async function () {
          await expect(this.contracts.autoSwapper.DefiestaDexSwapCallback(0, 0, constants.HashZero)).to.revertedWith(
            "DefiestaDexRouter: Callback Invalid amount",
          );
        });
        it("should fail when calling DefiestaDexSwapCallback from an account instead of pair ", async function () {
          await expect(
            this.contracts.autoSwapper.DefiestaDexSwapCallback(
              1000,
              1000,
              getSwapEncodedData(
                this.signers.admin.address,
                hexConcat([this.contracts.token0.address, this.contracts.token1.address]),
              ),
            ),
          ).to.revertedWith("DefiestaDexRouter: INVALID_PAIR");
        });
      });
      context("with DDEX in pair's Tokens", function () {
        it("should executeWork on autoSwapper and swap all tokens on his own pair", async function () {
          const balanceBefore = await this.contracts.DefiestaDexToken.balanceOf(this.misc.targetAddress);
          await swapBothTokens(
            this.contracts.DefiestaDexRouter,
            amountIn,
            this.contracts.token0,
            this.contracts.token1,
            this.signers.admin.address,
          );
          const [fee0, fee1] = await this.contracts.DefiestaDexPair.getFeeToAmounts();
          expect(fee0).to.not.eq(0);
          expect(fee1).to.not.eq(0);

          const lp = await this.contracts.DefiestaDexPair.balanceOf(this.signers.admin.address);
          await this.contracts.DefiestaDexPair.approve(this.contracts.DefiestaDexRouter.address, lp);
          // burn for _mintFee but only half lp or we wont be able to swap in the pool to get DDEX
          await this.contracts.DefiestaDexRouter.removeLiquidity(
            this.contracts.token0.address,
            this.contracts.token1.address,
            lp.div(2),
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          // We can not check for feeToAmount after burn or mint because we swapped in pair so feeToAmount increased again
          const [fee0After, fee1After] = await this.contracts.DefiestaDexPair.getFeeToAmounts();
          expect(fee0After).to.eq(0);
          expect(fee1After).to.not.eq(0);

          const lpAfter = await this.contracts.DefiestaDexPair.balanceOf(this.signers.admin.address);
          expect(lp.sub(lpAfter)).to.eq(lp.div(2));
          // if autoSwapper balance is != 0 then swap failed
          expect(await this.contracts.token1.balanceOf(this.contracts.autoSwapper.address)).to.eq(0);
          const balanceAfter = await this.contracts.DefiestaDexToken.balanceOf(this.misc.targetAddress);

          expect(balanceAfter).to.not.eq(balanceBefore);
        });

        it("multiple add/remove liquidity with already created pair", async function () {
          for (let i = 0; i < 3; i++) {
            await expect(
              swapBothTokens(
                this.contracts.DefiestaDexRouter,
                amountIn,
                this.contracts.token0,
                this.contracts.token1,
                this.signers.admin.address,
              ),
            ).to.not.be.reverted;

            const lp = await this.contracts.DefiestaDexPair.balanceOf(this.signers.admin.address);
            await this.contracts.DefiestaDexPair.approve(this.contracts.DefiestaDexRouter.address, lp);
            await this.contracts.DefiestaDexRouter.removeLiquidity(
              this.contracts.token0.address,
              this.contracts.token1.address,
              lp.div(5),
              1,
              1,
              this.signers.admin.address,
              constants.MaxUint256,
            );

            await swapBothTokens(
              this.contracts.DefiestaDexRouter,
              amountIn,
              this.contracts.token0,
              this.contracts.token1,
              this.signers.admin.address,
            );

            await expect(
              this.contracts.DefiestaDexRouter.addLiquidity(
                this.contracts.token0.address,
                this.contracts.token1.address,
                DDEXAmount.div(10),
                TOKEN1Amount.div(10),
                1,
                1,
                this.signers.admin.address,
                constants.MaxUint256,
              ),
            ).to.not.be.reverted;
          }
          const [fee0, fee1] = await this.contracts.DefiestaDexPair.getFeeToAmounts();
          expect(fee0).to.eq(0);
          expect(fee1).to.not.eq(0);
        });
      });
      context("with NO DDEX in pair's Tokens", function () {
        it("should fail (but not revert) because there are no pair corresponding with DDEX", async function () {
          await this.contracts.WETHPartner.approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          await this.contracts.DefiestaDexRouter.addLiquidity(
            this.contracts.WETHPartner.address,
            this.contracts.token1.address,
            TenTokens,
            TenTokens,
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          const addressT1WETHP = await this.contracts.DefiestaDexFactory.getPair(
            this.contracts.token1.address,
            this.contracts.WETHPartner.address,
          );
          const pairT1WETHP = DefiestaDexPair__factory.connect(addressT1WETHP, this.signers.admin);
          await pairT1WETHP.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);

          const balanceBefore = await this.contracts.DefiestaDexToken.balanceOf(this.misc.targetAddress);

          await this.contracts.DefiestaDexRouter.swapExactTokensForTokens(
            amountIn.div(2),
            0,
            [this.contracts.WETHPartner.address, this.contracts.token1.address],
            this.signers.admin.address,
            constants.MaxUint256,
          );
          const t0isWethP = (await pairT1WETHP.token0()) === this.contracts.WETHPartner.address;
          let [fee0, fee1] = await pairT1WETHP.getFeeToAmounts();
          let fees = t0isWethP ? fee0 : fee1;
          // We swapped one way only so we should have only fee0
          expect(fees).to.not.eq(0);

          const lp = await pairT1WETHP.balanceOf(this.signers.admin.address);
          await pairT1WETHP.approve(this.contracts.DefiestaDexRouter.address, lp);
          // burn for _mintFee but only half lp or we wont be able to swap in the pool to get DDEX
          await this.contracts.DefiestaDexRouter.removeLiquidity(
            this.contracts.token1.address,
            this.contracts.WETHPartner.address,
            lp.div(2),
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          [fee0, fee1] = await pairT1WETHP.getFeeToAmounts();
          fees = t0isWethP ? fee0 : fee1;
          expect(fees).to.eq(0);

          const addressWethpDDEX = await this.contracts.DefiestaDexFactory.getPair(
            this.contracts.WETHPartner.address,
            this.contracts.DefiestaDexToken.address,
          );
          expect(addressWethpDDEX).to.eq(constants.AddressZero);

          const lpAfter = await pairT1WETHP.balanceOf(this.signers.admin.address);
          expect(lp.sub(lpAfter)).to.eq(lp.div(2));
          // if autoSwapper balance is != 0 then swap failed, and it should have because we dont have a pair corresponding
          expect(await this.contracts.WETHPartner.balanceOf(this.contracts.autoSwapper.address)).to.not.eq(0);
          const balanceAfter = await this.contracts.DefiestaDexToken.balanceOf(this.misc.targetAddress);

          expect(balanceAfter).to.eq(balanceBefore);
        });
        it("should executeWork on autoSwapper and swap all tokens on another pair", async function () {
          await this.contracts.WETHPartner.approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          await this.contracts.token1.approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          await this.contracts.DefiestaDexToken.approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          // we already have a pair & liquidity : DDEX/Token1

          // We now need to complementary pairs : TokenX / Token1 & TokenX / DDEX,
          // and mint or burn after a swap on  TokenX / Token1 to use other DDEX pairs to swap fees
          await this.contracts.DefiestaDexRouter.addLiquidity(
            this.contracts.WETHPartner.address,
            this.contracts.token1.address,
            TenTokens,
            TenTokens,
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          await this.contracts.DefiestaDexRouter.addLiquidity(
            this.contracts.WETHPartner.address,
            this.contracts.DefiestaDexToken.address,
            TenTokens,
            TenTokens,
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          const balanceBefore = await this.contracts.DefiestaDexToken.balanceOf(this.misc.targetAddress);

          await this.contracts.DefiestaDexRouter.swapExactTokensForTokens(
            amountIn,
            0,
            [this.contracts.token1.address, this.contracts.WETHPartner.address],
            this.signers.admin.address,
            constants.MaxUint256,
          );
          await this.contracts.DefiestaDexRouter.swapExactTokensForTokens(
            amountIn,
            0,
            [this.contracts.WETHPartner.address, this.contracts.token1.address],
            this.signers.admin.address,
            constants.MaxUint256,
          );

          const addressT1WETHP = await this.contracts.DefiestaDexFactory.getPair(
            this.contracts.token1.address,
            this.contracts.WETHPartner.address,
          );
          const pairT1WETHP = DefiestaDexPair__factory.connect(addressT1WETHP, this.signers.admin);
          await pairT1WETHP.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);

          const addressDDEXWethp = await this.contracts.DefiestaDexFactory.getPair(
            this.contracts.WETHPartner.address,
            this.contracts.DefiestaDexToken.address,
          );
          const pairDDEXWethp = DefiestaDexPair__factory.connect(addressDDEXWethp, this.signers.admin);
          await pairDDEXWethp.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);

          const lp = await pairT1WETHP.balanceOf(this.signers.admin.address);
          // burn for _mintFee, all lp as we dont need this pair get DDEX
          // We should get all tokens swapped (token1, WETHPartner) to DDEX
          await this.contracts.DefiestaDexRouter.removeLiquidity(
            this.contracts.WETHPartner.address,
            this.contracts.token1.address,
            lp,
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          const lpAfter = await pairT1WETHP.balanceOf(this.signers.admin.address);
          expect(lpAfter).to.eq(0);
          // if autoSwapper balance is != 0 then swap failed
          expect(await this.contracts.WETHPartner.balanceOf(this.contracts.autoSwapper.address)).to.eq(0);
          expect(await this.contracts.token1.balanceOf(this.contracts.autoSwapper.address)).to.eq(0);
          const balanceAfter = await this.contracts.DefiestaDexToken.balanceOf(this.misc.targetAddress);
          expect(balanceAfter).to.not.eq(balanceBefore);
        });
        it("should executeWork on autoSwapper and swap all tokens on another pair with price < 0", async function () {
          await this.contracts.WETHPartner.approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          await this.contracts.token1.approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          await this.contracts.DefiestaDexToken.approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          // we already have a pair & liquidity : DDEX/Token1

          // We now need to complementary pairs : TokenX / Token1 & TokenX / DDEX,
          // and mint or burn after a swap on  TokenX / Token1 to use other DDEX pairs to swap fees
          await this.contracts.DefiestaDexRouter.addLiquidity(
            this.contracts.WETHPartner.address,
            this.contracts.token1.address,
            TenTokens,
            TenTokens,
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          await this.contracts.DefiestaDexRouter.addLiquidity(
            this.contracts.WETHPartner.address,
            this.contracts.DefiestaDexToken.address,
            parseEther("1"),
            TenTokens,
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          const balanceBefore = await this.contracts.DefiestaDexToken.balanceOf(this.misc.targetAddress);

          await this.contracts.DefiestaDexRouter.swapExactTokensForTokens(
            amountIn,
            0,
            [this.contracts.token1.address, this.contracts.WETHPartner.address],
            this.signers.admin.address,
            constants.MaxUint256,
          );
          await this.contracts.DefiestaDexRouter.swapExactTokensForTokens(
            amountIn,
            0,
            [this.contracts.WETHPartner.address, this.contracts.token1.address],
            this.signers.admin.address,
            constants.MaxUint256,
          );

          const addressT1WETHP = await this.contracts.DefiestaDexFactory.getPair(
            this.contracts.token1.address,
            this.contracts.WETHPartner.address,
          );
          const pairT1WETHP = DefiestaDexPair__factory.connect(addressT1WETHP, this.signers.admin);
          await pairT1WETHP.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);

          const addressDDEXWethp = await this.contracts.DefiestaDexFactory.getPair(
            this.contracts.WETHPartner.address,
            this.contracts.DefiestaDexToken.address,
          );
          const pairDDEXWethp = DefiestaDexPair__factory.connect(addressDDEXWethp, this.signers.admin);
          await pairDDEXWethp.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);

          const lp = await pairT1WETHP.balanceOf(this.signers.admin.address);
          // burn for _mintFee, all lp as we dont need this pair get DDEX
          // We should get all tokens swapped (token1, WETHPartner) to DDEX
          await this.contracts.DefiestaDexRouter.removeLiquidity(
            this.contracts.WETHPartner.address,
            this.contracts.token1.address,
            lp,
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          const lpAfter = await pairT1WETHP.balanceOf(this.signers.admin.address);
          expect(lpAfter).to.eq(0);
          // if autoSwapper balance is != 0 then swap failed
          expect(await this.contracts.WETHPartner.balanceOf(this.contracts.autoSwapper.address)).to.eq(0);
          expect(await this.contracts.token1.balanceOf(this.contracts.autoSwapper.address)).to.eq(0);
          const balanceAfter = await this.contracts.DefiestaDexToken.balanceOf(this.misc.targetAddress);
          expect(balanceAfter).to.not.eq(balanceBefore);
        });
        it("should fail because attacker tried to manipulate price", async function () {
          await this.contracts.WETHPartner.approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          await this.contracts.token1.approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          await this.contracts.DefiestaDexToken.approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          await this.contracts.WETHPartner.transfer(this.signers.user.address, parseEther("10000"));
          await this.contracts.token1.transfer(this.signers.user.address, parseEther("10000"));
          await this.contracts.DefiestaDexToken.transfer(this.signers.user.address, parseEther("10000"));
          await this.contracts.WETHPartner.connect(this.signers.user).approve(
            this.contracts.DefiestaDexRouter.address,
            parseEther("10000"),
          );
          await this.contracts.token1
            .connect(this.signers.user)
            .approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          await this.contracts.DefiestaDexToken
            .connect(this.signers.user)
            .approve(this.contracts.DefiestaDexRouter.address, parseEther("10000"));
          // we already have a pair & liquidity : DDEX/Token1

          // We now need to complementary pairs : TokenX / Token1 & TokenX / DDEX,
          // and mint or burn after a swap on  TokenX / Token1 to use other DDEX pairs to swap fees
          await this.contracts.DefiestaDexRouter.addLiquidity(
            this.contracts.WETHPartner.address,
            this.contracts.token1.address,
            TenTokens,
            TenTokens,
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          await this.contracts.DefiestaDexRouter.addLiquidity(
            this.contracts.WETHPartner.address,
            this.contracts.DefiestaDexToken.address,
            TenTokens,
            TenTokens,
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          await this.contracts.DefiestaDexRouter.swapExactTokensForTokens(
            amountIn,
            0,
            [this.contracts.token1.address, this.contracts.WETHPartner.address],
            this.signers.admin.address,
            constants.MaxUint256,
          );
          await this.contracts.DefiestaDexRouter.swapExactTokensForTokens(
            amountIn,
            0,
            [this.contracts.WETHPartner.address, this.contracts.token1.address],
            this.signers.admin.address,
            constants.MaxUint256,
          );

          /**
           * ATTACK swap token1 for DDEX and WETHPartner for DDEX
           */
          await this.contracts.DefiestaDexRouter
            .connect(this.signers.user)
            .swapExactTokensForTokens(
              amountIn.mul(100),
              0,
              [this.contracts.token1.address, this.contracts.DefiestaDexToken.address],
              this.signers.admin.address,
              constants.MaxUint256,
            );

          await this.contracts.DefiestaDexRouter
            .connect(this.signers.user)
            .swapExactTokensForTokens(
              amountIn.mul(100),
              0,
              [this.contracts.WETHPartner.address, this.contracts.DefiestaDexToken.address],
              this.signers.admin.address,
              constants.MaxUint256,
            );

          const addressT1WETHP = await this.contracts.DefiestaDexFactory.getPair(
            this.contracts.token1.address,
            this.contracts.WETHPartner.address,
          );
          const pairT1WETHP = DefiestaDexPair__factory.connect(addressT1WETHP, this.signers.admin);
          await pairT1WETHP.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);

          const addressDDEXWethp = await this.contracts.DefiestaDexFactory.getPair(
            this.contracts.WETHPartner.address,
            this.contracts.DefiestaDexToken.address,
          );
          const pairDDEXWethp = DefiestaDexPair__factory.connect(addressDDEXWethp, this.signers.admin);
          await pairDDEXWethp.approve(this.contracts.DefiestaDexRouter.address, constants.MaxUint256);

          const lp = await pairT1WETHP.balanceOf(this.signers.admin.address);
          const balanceBefore = await this.contracts.DefiestaDexToken.balanceOf(this.misc.targetAddress);

          // burn for _mintFee, all lp as we dont need this pair get DDEX
          // We should get NO token swapped (token1, WETHPartner) to DDEX because of induced slippage from attack
          await this.contracts.DefiestaDexRouter.removeLiquidity(
            this.contracts.WETHPartner.address,
            this.contracts.token1.address,
            lp,
            1,
            1,
            this.signers.admin.address,
            constants.MaxUint256,
          );

          const lpAfter = await pairT1WETHP.balanceOf(this.signers.admin.address);
          expect(lpAfter).to.eq(0);
          // if autoSwapper balance is != 0 then swap failed, and we want it to because of attack
          expect(await this.contracts.WETHPartner.balanceOf(this.contracts.autoSwapper.address)).to.not.eq(0);
          expect(await this.contracts.token1.balanceOf(this.contracts.autoSwapper.address)).to.not.eq(0);
          const balanceAfter = await this.contracts.DefiestaDexToken.balanceOf(this.misc.targetAddress);

          expect(balanceAfter).to.eq(balanceBefore);
        });
      });
    });
  });
}
