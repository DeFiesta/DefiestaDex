import type { Signer } from "@ethersproject/abstract-signer";

import { BigNumber, constants } from "ethers";
import {
  AutoSwapper,
  AutoSwapperL2,
  CallbackTest,
  CheckBlockTest,
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
  DefiestaDexPair,
  DefiestaDexPairTest,
  DefiestaDexRouter,
  DefiestaDexRouterTest,
  DefiestaDexTokenTest,
  Staking,
  TetherToken,
  WETH9,
} from "../typechain";
import {
  deployAutoSwapperL1,
  deployAutoSwapperL2,
  deployCallbackTestRouter,
  deployCheckBlockTest,
  deployERC20Test,
  deployFakeERC20reentrancy,
  deployFarmingRange,
  deployFarmingRangeL2Arbitrum,
  deployOrderedPairOfERC20,
  deployRewardManagerTest,
  deployRewardManagerTestL2,
  deployRewardManagerTestL2Arbitrum,
  deployRouterEventEmitter,
  deployRouterForPairTest,
  deployDefiestaDexFactory,
  deployDefiestaDexFactoryTest,
  deployDefiestaDexLibraryTest,
  deployDefiestaDexPair,
  deployDefiestaDexPairTest,
  deployDefiestaDexRouter,
  deployDefiestaDexRouterTest,
  deployDefiestaDexToken,
  deployStaking,
  deployTetherToken,
  deployWETH9,
} from "./deployers";
import { parseEther } from "ethers/lib/utils";
import { advanceBlockTo, latest, latestBlockNumber } from "./helpers/time";
import { ethers } from "hardhat";
import { latestBlockNumberL2Arbitrum } from "./utils";

type UnitFixtureDefiestaDexFactory = {
  DefiestaDexToken: ERC20Permit;
  factory: DefiestaDexFactory;
};

export async function unitFixtureDefiestaDexFactory(): Promise<UnitFixtureDefiestaDexFactory> {
  const DefiestaDexToken: ERC20Permit = await deployERC20Test(parseEther("10000"));
  const factory: DefiestaDexFactory = await deployDefiestaDexFactory();

  return {
    DefiestaDexToken,
    factory,
  };
}

type UnitFixtureDefiestaDexLibraryTest = {
  DefiestaDexLibraryTest: DefiestaDexLibraryTest;
  DefiestaDexRouter: DefiestaDexRouter;
  DefiestaDexPair: DefiestaDexPair;
  token0: ERC20Test;
  token1: ERC20Test;
};

export async function unitFixtureDefiestaDexLibraryTest(): Promise<UnitFixtureDefiestaDexLibraryTest> {
  const [admin] = await ethers.getSigners();
  const DefiestaDexLibraryTest: DefiestaDexLibraryTest = await deployDefiestaDexLibraryTest();
  const DefiestaDexWETH: WETH9 = await deployWETH9();
  const DefiestaDexFactory: DefiestaDexFactory = await deployDefiestaDexFactory();
  const DefiestaDexRouter: DefiestaDexRouter = await deployDefiestaDexRouter(DefiestaDexFactory, DefiestaDexWETH);
  const [token0, token1] = await deployOrderedPairOfERC20(constants.MaxUint256);
  const amount0 = parseEther("1500000");
  const amount1 = parseEther("10000");
  await token0.approve(DefiestaDexRouter.address, amount0);
  await token1.approve(DefiestaDexRouter.address, amount1);
  const now = await latest();
  const DefiestaDexPair = await deployDefiestaDexPair(DefiestaDexFactory, token0, token1);

  await DefiestaDexRouter.addLiquidity(
    token0.address,
    token1.address,
    amount0,
    amount1,
    0,
    0,
    admin.address,
    now.add(10000),
  );

  return {
    DefiestaDexLibraryTest,
    DefiestaDexRouter,
    DefiestaDexPair,
    token0,
    token1,
  };
}

type UnitFixtureRouterForPairTest = {
  factory: DefiestaDexFactoryTest;
  DefiestaDexPairTest: DefiestaDexPairTest;
  token0: ERC20Test;
  token1: ERC20Test;
  DefiestaDexRouterTest: DefiestaDexRouterTest;
  routerForPairTest: RouterForPairTest;
  WETH: WETH9;
};

export async function unitFixtureDefiestaDexPairTest(): Promise<UnitFixtureRouterForPairTest> {
  const factory = await deployDefiestaDexFactoryTest();
  const [token0, token1] = await deployOrderedPairOfERC20(constants.MaxUint256);
  const DefiestaDexPairTest = await deployDefiestaDexPairTest(factory, token0, token1);
  const WETH = await deployWETH9();
  const routerForPairTest = await deployRouterForPairTest(factory, WETH);
  const DefiestaDexRouterTest = await deployDefiestaDexRouterTest(factory, WETH);

  return {
    factory,
    DefiestaDexPairTest,
    token0,
    token1,
    routerForPairTest,
    DefiestaDexRouterTest,
    WETH,
  };
}

type UnitFixtureRouterTest = {
  token0: ERC20Test;
  token1: ERC20Test;
  factory: DefiestaDexFactory;
  pair: DefiestaDexPair;
  DefiestaDexRouterTest: DefiestaDexRouterTest;
  DefiestaDexRouterCallbackTest: CallbackTest;
  WETH: WETH9;
};

export async function unitFixtureDefiestaDexRouterTest(): Promise<UnitFixtureRouterTest> {
  const [token0, token1] = await deployOrderedPairOfERC20(constants.MaxUint256);
  const factory = await deployDefiestaDexFactory();
  const pair = await deployDefiestaDexPair(factory, token0, token1);
  const WETH = await deployWETH9();
  const DefiestaDexRouterTest = await deployDefiestaDexRouterTest(factory, WETH);
  const DefiestaDexRouterCallbackTest = await deployCallbackTestRouter(factory, WETH);

  return {
    token0,
    token1,
    factory,
    pair,
    DefiestaDexRouterTest,
    DefiestaDexRouterCallbackTest,
    WETH,
  };
}

type UnitFixtureDefiestaDexRouter = {
  token0: ERC20Test;
  token1: ERC20Test;
  WETH: WETH9;
  WETHPartner: ERC20Test;
  factory: DefiestaDexFactory;
  DefiestaDexRouter: DefiestaDexRouter;
  pair: DefiestaDexPair;
  WETHPair: DefiestaDexPair;
  routerEventEmitter: RouterEventEmitter;
  autoSwapper: AutoSwapper | AutoSwapperL2;
};

export async function unitFixtureDefiestaDexRouter(): Promise<UnitFixtureDefiestaDexRouter> {
  const [token0, token1] = await deployOrderedPairOfERC20(parseEther("10000000"));
  const WETH = await deployWETH9();
  const WETHPartner = await deployERC20Test(parseEther("10000000"));
  const factory = await deployDefiestaDexFactory();
  const DefiestaDexRouter = await deployDefiestaDexRouter(factory, WETH);
  const pair = await deployDefiestaDexPair(factory, token0, token1);
  const routerEventEmitter = await deployRouterEventEmitter();
  const WETHPair = await deployDefiestaDexPair(factory, WETH, WETHPartner);
  const DDEX = await deployDefiestaDexToken("DefiestaDex Token Test", "DDEX", parseEther("10000"));
  const farming = await deployDefiestaDexFactory();

  const staking = await deployStaking(DDEX.address, farming.address);
  const autoSwapper = await deployAutoSwapperL1(factory.address, DDEX.address, staking.address);

  return {
    token0,
    token1,
    WETH,
    WETHPartner,
    factory,
    DefiestaDexRouter,
    pair,
    WETHPair,
    routerEventEmitter,
    autoSwapper,
  };
}

type UnitFixtureCallbackTest = {
  token0: ERC20Test;
  token1: ERC20Test;
  WETH: WETH9;
  factory: DefiestaDexFactory;
  DefiestaDexRouter: DefiestaDexRouter;
  DefiestaDexRouterCallbackTest: CallbackTest;
  pair: DefiestaDexPair;
  fakeERC20reentrancy: FakeERC20reentrancy;
};

export async function unitFixtureCallbackTest(): Promise<UnitFixtureCallbackTest> {
  const [token0, token1] = await deployOrderedPairOfERC20(parseEther("10000000"));
  const WETH = await deployWETH9();
  await WETH.deposit({ value: parseEther("10") });
  const factory = await deployDefiestaDexFactory();
  const DefiestaDexRouter = await deployDefiestaDexRouter(factory, WETH);
  const DefiestaDexRouterCallbackTest = await deployCallbackTestRouter(factory, WETH);
  const fakeERC20reentrancy = await deployFakeERC20reentrancy(factory, WETH);
  const pair = await deployDefiestaDexPair(factory, token0, token1);

  return {
    token0,
    token1,
    factory,
    DefiestaDexRouter,
    DefiestaDexRouterCallbackTest,
    pair,
    fakeERC20reentrancy,
    WETH,
  };
}

export async function unitFixtureTokensAndPairWithFactory(factory: DefiestaDexFactory) {
  const [token0, token1] = await deployOrderedPairOfERC20(parseEther("10000000"));
  const pair = await deployDefiestaDexPair(factory, token0, token1);

  return {
    token0,
    token1,
    pair,
  };
}

export type UnitFixtureFarmingRangeTokens = {
  stakingTokenAsDeployer: ERC20Test;
  stakingTokenAsAlice: ERC20Test;
  stakingTokenAsBob: ERC20Test;
  stakingTokenAsCat: ERC20Test;
  rewardTokenAsDeployer: DefiestaDexTokenTest;
  rewardToken2AsDeployer: DefiestaDexTokenTest;
  stakingToken: ERC20Test;
  rewardToken: DefiestaDexTokenTest;
  rewardToken2: DefiestaDexTokenTest;
  deployer: Signer;
  alice: Signer;
  bob: Signer;
  cat: Signer;
};

export type UnitFixtureFarmingRangeSigners = {
  farmingRangeAsDeployer: FarmingRange;
  farmingRangeAsAlice: FarmingRange;
  farmingRangeAsBob: FarmingRange;
  farmingRangeAsCat: FarmingRange;
  mockedBlock: BigNumber;
};

export type UnitFixtureFarmingRange = UnitFixtureFarmingRangeTokens &
  UnitFixtureFarmingRangeSigners & {
    farmingRange: FarmingRange;
  };

async function setupFarmingRangeTokens(): Promise<UnitFixtureFarmingRangeTokens> {
  const signers = await ethers.getSigners();
  const [deployer, alice, bob, cat] = signers;
  const stakingToken = await deployERC20Test(constants.Zero);
  const rewardToken2 = await deployDefiestaDexToken("ERC20reward2", "RWD2", constants.Zero);
  const rewardToken = await deployDefiestaDexToken("ERC20reward", "RWD", constants.Zero);
  const rewardTokenAsDeployer = rewardToken.connect(deployer);
  const rewardToken2AsDeployer = rewardToken2.connect(deployer);
  const stakingTokenAsDeployer = stakingToken.connect(deployer);
  const stakingTokenAsAlice = stakingToken.connect(alice);
  const stakingTokenAsBob = stakingToken.connect(bob);
  const stakingTokenAsCat = stakingToken.connect(cat);

  return {
    stakingTokenAsDeployer,
    stakingTokenAsAlice,
    stakingTokenAsBob,
    stakingTokenAsCat,
    rewardTokenAsDeployer,
    rewardToken2AsDeployer,
    stakingToken,
    rewardToken,
    rewardToken2,
    deployer,
    alice,
    bob,
    cat,
  };
}

export async function unitFixtureFarmingRange(): Promise<UnitFixtureFarmingRange> {
  const tokens: UnitFixtureFarmingRangeTokens = await setupFarmingRangeTokens();
  const farmingRange: FarmingRange = await deployFarmingRange(tokens.deployer);
  const signers: UnitFixtureFarmingRangeSigners = await setupFarmingRangeSigners(tokens, farmingRange);

  return {
    ...tokens,
    farmingRange,
    ...signers,
  };
}

export async function unitFixtureFarmingRangeL2Arbitrum(): Promise<UnitFixtureFarmingRange> {
  const tokens: UnitFixtureFarmingRangeTokens = await setupFarmingRangeTokens();
  const farmingRangeL2Arbitrum: FarmingRangeL2Arbitrum = await deployFarmingRangeL2Arbitrum(tokens.deployer);
  const signers: UnitFixtureFarmingRangeSigners = await setupFarmingRangeSigners(tokens, farmingRangeL2Arbitrum);

  return {
    ...tokens,
    farmingRange: farmingRangeL2Arbitrum,
    ...signers,
  };
}

async function setupFarmingRangeSigners(
  fixtures: UnitFixtureFarmingRangeTokens,
  farmingRange: FarmingRange,
): Promise<UnitFixtureFarmingRangeSigners> {
  await fixtures.rewardTokenAsDeployer.approve(farmingRange.address, constants.MaxUint256);
  await fixtures.rewardToken2AsDeployer.approve(farmingRange.address, constants.MaxUint256);
  const mockedBlock = await latestBlockNumber();
  await advanceBlockTo(mockedBlock.add(1).toNumber());

  const farmingRangeAsDeployer = farmingRange.connect(fixtures.deployer);
  const farmingRangeAsAlice = farmingRange.connect(fixtures.alice);
  const farmingRangeAsBob = farmingRange.connect(fixtures.bob);
  const farmingRangeAsCat = farmingRange.connect(fixtures.cat);

  return {
    farmingRangeAsDeployer,
    farmingRangeAsAlice,
    farmingRangeAsBob,
    farmingRangeAsCat,
    mockedBlock,
  };
}

export async function unitFixtureCampaignWith2rewards(
  farming: UnitFixtureFarmingRange,
  signer: Signer,
  initialBonusPerBlock: BigNumber,
  expect?: (val: any, message?: string | undefined) => Chai.Assertion,
): Promise<BigNumber> {
  const mintedRewardPhase1 = initialBonusPerBlock.mul(farming.mockedBlock.add(11).sub(farming.mockedBlock.add(8)));
  const mintedRewardPhase2 = initialBonusPerBlock
    .add(1)
    .mul(farming.mockedBlock.add(20).sub(farming.mockedBlock.add(11)));
  const mintedReward = mintedRewardPhase1.add(mintedRewardPhase2);
  await farming.rewardTokenAsDeployer.mint(await signer.getAddress(), mintedReward);

  await initializeFarmingCampaign(
    farming.mockedBlock,
    initialBonusPerBlock,
    initialBonusPerBlock.add(1),
    farming.farmingRange,
    farming.stakingToken.address,
    farming.rewardToken.address,
  );
  const length = await farming.farmingRangeAsDeployer.rewardInfoLen(0);
  expect?.(length).to.eq(2);

  return length;
}

type UnitFixtureStaking = {
  DefiestaDexTokenTest: DefiestaDexTokenTest;
  staking: Staking;
  farming: FarmingRange;
  startBlockFarming: BigNumber;
  checkBlockTest: CheckBlockTest;
};

export async function unitFixtureStaking(): Promise<UnitFixtureStaking> {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const DefiestaDexTokenTest: DefiestaDexTokenTest = await deployDefiestaDexToken(
    "DefiestaDex Token Test",
    "DDEX",
    parseEther("10000"),
  );
  const farming = await deployFarmingRange(deployer);
  const staking: Staking = await deployStaking(DefiestaDexTokenTest.address, farming.address);
  const checkBlockTest: CheckBlockTest = await deployCheckBlockTest(staking.address, DefiestaDexTokenTest.address);

  await DefiestaDexTokenTest.approve(staking.address, constants.MaxUint256);
  await DefiestaDexTokenTest.approve(farming.address, constants.MaxUint256);

  //total campaign cost : 21 DDEX
  //1st: block 8 - 10 : 1 DDEX * 3
  //2st: block 11 - 20 : 2 DDEX * 9
  const startBlockFarming = (await latestBlockNumber()).add(10);
  await initializeFarmingCampaign(
    startBlockFarming,
    parseEther("1"),
    parseEther("2"),
    farming,
    staking.address,
    DefiestaDexTokenTest.address,
  );

  return {
    DefiestaDexTokenTest,
    staking,
    farming,
    startBlockFarming,
    checkBlockTest,
  };
}

async function initializeFarmingCampaign(
  startBlock: BigNumber,
  initialBonusPerBlock: BigNumber,
  nextPeriodRewardPerBlock: BigNumber,
  farming: FarmingRange,
  stakingTokenAddress: string,
  rewardTokenAddress: string,
) {
  await farming.addCampaignInfo(stakingTokenAddress, rewardTokenAddress, startBlock.add(8));
  // add the first reward info
  await farming.addRewardInfo(0, startBlock.add(11), initialBonusPerBlock);

  await farming.addRewardInfo(0, startBlock.add(20), nextPeriodRewardPerBlock);
}

type UnitFixtureAutoSwapperData = {
  token0: ERC20Test;
  token1: ERC20Test;
  WETH: WETH9;
  WETHPartner: ERC20Test;
  factory: DefiestaDexFactory;
  DefiestaDexRouter: DefiestaDexRouter;
  pair: DefiestaDexPair;
  WETHPair: DefiestaDexPair;
  routerEventEmitter: RouterEventEmitter;
  DefiestaDexToken: ERC20Test;
};

async function unitFixtureAutoSwapperData(): Promise<UnitFixtureAutoSwapperData> {
  const fixtures = await unitFixtureDefiestaDexRouter();
  return {
    ...fixtures,
    DefiestaDexToken: fixtures.token0,
  };
}

export type UnitFixtureAutoSwapper = UnitFixtureAutoSwapperData & {
  autoSwapper: AutoSwapper | AutoSwapperL2;
};

export async function unitFixtureAutoSwapperL1(): Promise<UnitFixtureAutoSwapper> {
  const fixtures = await unitFixtureAutoSwapperData();
  const autoSwapper = await deployAutoSwapperL1(
    fixtures.factory.address,
    fixtures.token0.address,
    fixtures.factory.address,
  );
  return {
    ...fixtures,
    autoSwapper,
  };
}

export async function unitFixtureAutoSwapperL2(): Promise<UnitFixtureAutoSwapper> {
  const fixtures = await unitFixtureAutoSwapperData();
  const autoSwapper = await deployAutoSwapperL2(fixtures.factory.address, fixtures.token0.address);
  return {
    ...fixtures,
    autoSwapper,
  };
}

type UnitFixtureRewardManagerData = {
  stakingToken: ERC20Test;
  tether: TetherToken;
};

async function unitFixtureRewardManagerData(): Promise<UnitFixtureRewardManagerData> {
  const stakingToken = await deployERC20Test(parseEther("10000"));
  const tether = await deployTetherToken();

  return {
    stakingToken,
    tether,
  };
}

export type UnitFixtureRewardManagerTest = UnitFixtureRewardManagerData & {
  mockedBlock: BigNumber;
  rewardManagerTest: RewardManagerTest | RewardManagerTestL2 | RewardManagerTestL2Arbitrum;
};

export async function unitFixtureRewardManagerTestL1(): Promise<UnitFixtureRewardManagerTest> {
  const fixtures = await unitFixtureRewardManagerData();
  const mockedBlock = await latestBlockNumber();
  const rewardManagerTest: RewardManagerTest = await deployRewardManagerTest(
    (
      await ethers.getSigners()
    )[0],
    fixtures.stakingToken.address,
    mockedBlock.add(2).toNumber(),
  );

  return {
    ...fixtures,
    rewardManagerTest,
    mockedBlock,
  };
}

export async function unitFixtureRewardManagerTestL2(): Promise<UnitFixtureRewardManagerTest> {
  const fixtures = await unitFixtureRewardManagerData();
  const mockedBlock = await latestBlockNumber();
  const rewardManagerTest: RewardManagerTestL2 = await deployRewardManagerTestL2((await ethers.getSigners())[0]);
  const farmingAddress = await rewardManagerTest.farming();
  const farmingFactory = await ethers.getContractFactory("FarmingRange");
  const farming = farmingFactory.attach(farmingAddress);
  await farming.addCampaignInfo(fixtures.stakingToken.address, fixtures.stakingToken.address, mockedBlock.add(3));

  return {
    ...fixtures,
    rewardManagerTest,
    mockedBlock,
  };
}

export async function unitFixtureRewardManagerTestL2Arbitrum(): Promise<UnitFixtureRewardManagerTest> {
  const fixtures = await unitFixtureRewardManagerData();
  const rewardManagerTest: RewardManagerTestL2Arbitrum = await deployRewardManagerTestL2Arbitrum(
    (
      await ethers.getSigners()
    )[0],
  );
  const mockedBlock = await latestBlockNumberL2Arbitrum();
  const farmingAddress = await rewardManagerTest.farming();
  const farmingFactory = await ethers.getContractFactory("FarmingRangeL2Arbitrum");
  const farming = farmingFactory.attach(farmingAddress);
  await farming.addCampaignInfo(fixtures.stakingToken.address, fixtures.stakingToken.address, mockedBlock.add(3));

  return {
    ...fixtures,
    rewardManagerTest,
    mockedBlock,
  };
}
