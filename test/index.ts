import { baseContext } from "./contexts";
import { unitTestDefiestaDexFactory } from "./DefiestaDexFactory/DefiestaDexFactory";
import { unitTestsDefiestaDexPair } from "./DefiestaDexPair/DefiestaDexPair";
import { unitTestsDefiestaDexRouter } from "./DefiestaDexRouter/DefiestaDexRouter";
import { unitTestsDefiestaDexERC20 } from "./DefiestaDexERC20/DefiestaDexERC20";
import { unitTestsFarmingRange } from "./FarmingRange/FarmingRange";
import { unitTestsAutoSwapper } from "./AutoSwapper/AutoSwapper";
import { unitTestsRewardManager } from "./RewardManager/RewardManager";
import { unitTestsDefiestaDexLibrary } from "./DefiestaDexLibrary/DefiestaDexLibrary";
import { unitTestsStaking } from "./Staking/Staking";

baseContext("Unit Tests", function () {
  unitTestsDefiestaDexERC20();
  unitTestDefiestaDexFactory();
  unitTestsDefiestaDexPair();
  unitTestsDefiestaDexRouter();
  unitTestsFarmingRange();
  unitTestsAutoSwapper();
  unitTestsRewardManager();
  unitTestsStaking();
  unitTestsDefiestaDexLibrary();
});
