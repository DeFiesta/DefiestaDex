import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import {
  AutoSwapper,
  AutoSwapperL2,
  CallbackTest,
  ERC20Permit,
  ERC20Test,
  FakeERC20reentrancy,
  FarmingRange,
  FarmingRangeL2Arbitrum,
  RewardManagerTest,
  RewardManagerTestL2,
  RewardManagerTestL2Arbitrum,
  RouterEventEmitter,
  RouterForPairTest,
  DefiestaDexFactory,
  DefiestaDexFactoryTest,
  DefiestaDexLibraryTest,
  DefiestaDexLibrary,
  DefiestaDexPair,
  DefiestaDexPairTest,
  DefiestaDexRouter,
  DefiestaDexRouterTest,
  DefiestaDexTokenTest,
  Staking,
  TetherToken,
  WETH9,
} from "../typechain";
import { BigNumber } from "ethers";
import { UnitFixtureFarmingRange } from "./fixtures";

declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    signers: Signers;
    farming: UnitFixtureFarmingRange;
  }
}

export interface Contracts {
  DefiestaDexFactory: DefiestaDexFactory;
  DefiestaDexFactoryTest: DefiestaDexFactoryTest;
  DefiestaDexLibraryTest: DefiestaDexLibraryTest;
  DefiestaDexLibrary: DefiestaDexLibrary;
  DefiestaDexToken: ERC20Permit;
  DefiestaDexTokenTest: DefiestaDexTokenTest;
  token0: ERC20Test;
  token1: ERC20Test;
  DefiestaDexPair: DefiestaDexPair;
  DefiestaDexPair2?: DefiestaDexPair;
  DefiestaDexPairTest: DefiestaDexPairTest;
  DefiestaDexRouter: DefiestaDexRouter;
  DefiestaDexRouterTest: DefiestaDexRouterTest;
  staking: Staking;
  WETH: WETH9;
  WETHPartner: ERC20Test;
  WETHPair: DefiestaDexPair;
  routerEventEmitter: RouterEventEmitter;
  deflatingPair: DefiestaDexPair;
  farming: FarmingRange | FarmingRangeL2Arbitrum;
  autoSwapper: AutoSwapper | AutoSwapperL2;
  rewardManagerTest: RewardManagerTest | RewardManagerTestL2 | RewardManagerTestL2Arbitrum;
  DefiestaDexRouterCallbackTest: CallbackTest;
  routerForPairTest: RouterForPairTest;
  fakeERC20reentrancy: FakeERC20reentrancy;
  stakingToken: ERC20Test;
  dummyStakingToken: ERC20Test;
  tether: TetherToken;
}

export interface Misc {
  startBlock: BigNumber;
  targetAddress: string;
}

export interface Signers {
  admin: SignerWithAddress;
  feeTo: SignerWithAddress;
  user: SignerWithAddress;
  user2: SignerWithAddress;
}
