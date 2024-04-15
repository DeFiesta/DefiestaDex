import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { sendEtherTo } from "./utils";
import { parseEther } from "ethers/lib/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, save } = deployments;

  const { admin } = await getNamedAccounts();
  console.log("deployment address:", admin);
  const network: string = hre.network.name;

  // check if block start properly set
  if (network !== "hardhat") {
    if (network === "localhost" && admin !== "0x1A681d0E32f8a1d0a5ba94113ecBc1A5dF92e50F") {
      await sendEtherTo(parseEther("1"), admin, hre.ethers.provider);
    }

    // comment this line when done in 004_reward_manager.ts
    throw "do not forget to specify the staking farming blockStart !";
  }

  await deploy("DefiestaDexFactory", {
    from: admin,
    args: [],
    log: true,
  });

  const DefiestaDexPairFactory = await hre.ethers.getContractFactory("DefiestaDexPair");

  await save("DefiestaDexPair", {
    address: hre.ethers.constants.AddressZero,
    abi: JSON.parse(DefiestaDexPairFactory.interface.format("json") as string),
  });
};

export default func;
func.tags = ["DefiestaDexFactory"];
