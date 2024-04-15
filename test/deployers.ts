import { BigNumber, Signer } from "ethers";
import { ethers, network } from "hardhat";
import {
  ArbSysCoreTest,
  AutoSwapper,
  AutoSwapperL2,
  CallbackTest,
  CheckBlockTest,
  DoubleSwapRouter,
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
import { parseEther } from "ethers/lib/utils";

import { ADDRESS_100, FEES_LP, FEES_POOL } from "./constants";

export async function deployOrderedPairOfERC20(totalSupply: BigNumber): Promise<[ERC20Test, ERC20Test]> {
  const token0 = await deployERC20Test(totalSupply);
  const token1 = await deployERC20Test(totalSupply);

  if (BigNumber.from(token0.address).gt(BigNumber.from(token1.address))) {
    return [token1, token0];
  } else {
    return [token0, token1];
  }
}

export async function deployERC20Test(total_supply: BigNumber): Promise<ERC20Test> {
  const contractErc20 = await ethers.getContractFactory("ERC20Test", {});
  const erc20 = await contractErc20.deploy(total_supply);
  await erc20.deployed();

  return erc20;
}

export async function deployDefiestaDexFactory(): Promise<DefiestaDexFactory> {
  const contractFactory = await ethers.getContractFactory("DefiestaDexFactory");
  const DefiestaDexFactory = await contractFactory.deploy();
  await DefiestaDexFactory.deployed();
  await DefiestaDexFactory.setFees(FEES_LP, FEES_POOL);

  return DefiestaDexFactory;
}

export async function deployDefiestaDexFactoryTest(): Promise<DefiestaDexFactoryTest> {
  const contractFactoryTest = await ethers.getContractFactory("DefiestaDexFactoryTest", {});
  const DefiestaDexFactoryTest = await contractFactoryTest.deploy();
  await DefiestaDexFactoryTest.deployed();
  await DefiestaDexFactoryTest.setFees(FEES_LP, FEES_POOL);

  return DefiestaDexFactoryTest;
}

export async function deployDefiestaDexLibraryTest(): Promise<DefiestaDexLibraryTest> {
  const contractDefiestaDexLibrary = await ethers.getContractFactory("DefiestaDexLibraryTest", {});
  const DefiestaDexLibraryTest = await contractDefiestaDexLibrary.deploy();
  await DefiestaDexLibraryTest.deployed();

  return DefiestaDexLibraryTest;
}

export async function deployDefiestaDexPair(
  DefiestaDexFactory: DefiestaDexFactory,
  token0: ERC20Test | WETH9,
  token1: ERC20Test | WETH9,
): Promise<DefiestaDexPair> {
  await DefiestaDexFactory.createPair(token0.address, token1.address);
  const DefiestaDexPairAddress = await DefiestaDexFactory.getPair(token0.address, token1.address);
  const contractPair = await ethers.getContractFactory("DefiestaDexPair", {});
  return contractPair.attach(DefiestaDexPairAddress);
}

export async function deployDefiestaDexPairTest(
  DefiestaDexFactoryTest: DefiestaDexFactoryTest,
  token0: ERC20Test | WETH9,
  token1: ERC20Test | WETH9,
): Promise<DefiestaDexPairTest> {
  await DefiestaDexFactoryTest.createPairTest(token0.address, token1.address);
  const DefiestaDexPairTestAddress = await DefiestaDexFactoryTest.getPair(token0.address, token1.address);
  const contractPairTest = await ethers.getContractFactory("DefiestaDexPairTest", {});

  return contractPairTest.attach(DefiestaDexPairTestAddress);
}

export async function deployWETH9(): Promise<WETH9> {
  const contractWETH9 = await ethers.getContractFactory("WETH9", {});
  const weth = await contractWETH9.deploy();
  await weth.deployed();

  return weth;
}

export async function deployDefiestaDexRouterTest(DefiestaDexFactory: DefiestaDexFactory, weth: WETH9): Promise<DefiestaDexRouterTest> {
  const contractRouterTest = await ethers.getContractFactory("DefiestaDexRouterTest", {});
  const routerTest = await contractRouterTest.deploy(DefiestaDexFactory.address, weth.address);
  await routerTest.deployed();

  return routerTest;
}

export async function deployDefiestaDexRouter(DefiestaDexFactory: DefiestaDexFactory, weth: WETH9): Promise<DefiestaDexRouter> {
  const contractDefiestaDexRouter = await ethers.getContractFactory("DefiestaDexRouter", {});
  const DefiestaDexRouter = await contractDefiestaDexRouter.deploy(DefiestaDexFactory.address, weth.address);
  await DefiestaDexRouter.deployed();

  return DefiestaDexRouter;
}

export async function deployRouterEventEmitter(): Promise<RouterEventEmitter> {
  const contractRouterEventEmitter = await ethers.getContractFactory("RouterEventEmitter", {});
  const routerEventEmitter = await contractRouterEventEmitter.deploy();
  await routerEventEmitter.deployed();

  return routerEventEmitter;
}

export async function deployDefiestaDexToken(name: string, symbol: string, supply: BigNumber): Promise<DefiestaDexTokenTest> {
  const contractDefiestaDexToken = await ethers.getContractFactory("DefiestaDexTokenTest", {});
  const DefiestaDexToken = await contractDefiestaDexToken.deploy(name, symbol, supply);
  await DefiestaDexToken.deployed();

  return DefiestaDexToken;
}

export async function deployFarmingRange(deployer: Signer): Promise<FarmingRange> {
  const factory = await ethers.getContractFactory("FarmingRange");
  const farmingRange = await factory.deploy(await deployer.getAddress());
  await farmingRange.deployed();

  return farmingRange;
}

async function deployArbSysCore(): Promise<ArbSysCoreTest> {
  const factory = await ethers.getContractFactory("ArbSysCoreTest");
  const currentCode = await network.provider.send("eth_getCode", [ADDRESS_100]);

  if (currentCode.length <= 2) {
    const arbSysCoreTest = await factory.deploy();
    await arbSysCoreTest.deployed();
    const arbSysCoreCode = await network.provider.send("eth_getCode", [arbSysCoreTest.address]);

    await network.provider.send("hardhat_setCode", [ADDRESS_100, arbSysCoreCode]);
  }

  return factory.attach(ADDRESS_100);
}

export async function deployFarmingRangeL2Arbitrum(deployer: Signer): Promise<FarmingRangeL2Arbitrum> {
  await deployArbSysCore();
  const factory = await ethers.getContractFactory("FarmingRangeL2Arbitrum");
  const farmingRangeArbitrum = await factory.deploy(await deployer.getAddress());
  await farmingRangeArbitrum.deployed();

  return farmingRangeArbitrum;
}

export async function deployAutoSwapperL1(
  factoryAddress: string,
  DDEXTokenAddress: string,
  stakingContractAddress: string,
): Promise<AutoSwapper> {
  const factory = await ethers.getContractFactory("AutoSwapper");
  const autoSwapper = await factory.deploy(factoryAddress, DDEXTokenAddress, stakingContractAddress);
  await autoSwapper.deployed();

  return autoSwapper;
}

export async function deployAutoSwapperL2(factoryAddress: string, DDEXTokenAddress: string): Promise<AutoSwapperL2> {
  const factory = await ethers.getContractFactory("AutoSwapperL2");
  const autoSwapper = await factory.deploy(factoryAddress, DDEXTokenAddress);
  await autoSwapper.deployed();

  return autoSwapper;
}

export async function deployRewardManagerTest(
  farmingOwner: Signer,
  DefiestaDexTokenAddress: string,
  campaignBlock: number,
): Promise<RewardManagerTest> {
  const factory = await ethers.getContractFactory("RewardManagerTest");

  const rewardManager = await factory.deploy(await farmingOwner.getAddress(), DefiestaDexTokenAddress, campaignBlock);

  await rewardManager.deployed();

  return rewardManager;
}

export async function deployRewardManagerTestL2(farmingOwner: Signer): Promise<RewardManagerTestL2> {
  const factory = await ethers.getContractFactory("RewardManagerTestL2");
  const rewardManager = await factory.deploy(await farmingOwner.getAddress());
  await rewardManager.deployed();

  return rewardManager;
}

export async function deployRewardManagerTestL2Arbitrum(farmingOwner: Signer): Promise<RewardManagerTestL2Arbitrum> {
  await deployArbSysCore();
  const factory = await ethers.getContractFactory("RewardManagerTestL2Arbitrum");
  const rewardManager = await factory.deploy(await farmingOwner.getAddress());
  await rewardManager.deployed();

  return rewardManager;
}

export async function deployDoubleSwapRouter(): Promise<DoubleSwapRouter> {
  const factory = await ethers.getContractFactory("DoubleSwapRouter");
  const doubleSwapRouter = await factory.deploy();
  await doubleSwapRouter.deployed();

  return doubleSwapRouter;
}

export async function deployCallbackTestRouter(DefiestaDexFactory: DefiestaDexFactory, WETH: WETH9): Promise<CallbackTest> {
  const factory = await ethers.getContractFactory("CallbackTest");
  const mintCallbackTestRouter = await factory.deploy(DefiestaDexFactory.address, WETH.address);
  await mintCallbackTestRouter.deployed();

  return mintCallbackTestRouter;
}

export async function deployRouterForPairTest(DefiestaDexFactory: DefiestaDexFactory, WETH: WETH9): Promise<RouterForPairTest> {
  const factory = await ethers.getContractFactory("RouterForPairTest");
  const routerForPairTest = await factory.deploy(DefiestaDexFactory.address, WETH.address);
  await routerForPairTest.deployed();

  return routerForPairTest;
}

export async function deployFakeERC20reentrancy(
  DefiestaDexFactory: DefiestaDexFactory,
  WETH: WETH9,
): Promise<FakeERC20reentrancy> {
  const factory = await ethers.getContractFactory("FakeERC20reentrancy");
  const fakeERC20contract = await factory.deploy(DefiestaDexFactory.address, WETH.address);
  await fakeERC20contract.deployed();

  return fakeERC20contract;
}

export async function deployTetherToken(): Promise<TetherToken> {
  const factory = await ethers.getContractFactory("TetherToken");
  const tetherToken = await factory.deploy(parseEther("1000"), "Tether USD", "USDT", 6);
  await tetherToken.deployed();

  return tetherToken;
}

export async function deployCheckBlockTest(
  stakingAddress: string,
  DefiestaDexTokenAddress: string,
): Promise<CheckBlockTest> {
  const factory = await ethers.getContractFactory("CheckBlockTest", {});
  const checkBlockTest = await factory.deploy(stakingAddress, DefiestaDexTokenAddress);
  await checkBlockTest.deployed();

  return checkBlockTest;
}

export async function deployStaking(DefiestaDexTokenAddress: string, farmingAddress: string): Promise<Staking> {
  const contractStaking = await ethers.getContractFactory("Staking", {});
  const Staking = await contractStaking.deploy(DefiestaDexTokenAddress, farmingAddress);
  await Staking.deployed();

  return Staking;
}
