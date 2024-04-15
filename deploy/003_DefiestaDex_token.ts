import { parseEther } from "ethers/lib/utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { sendEtherTo, mainnets, DefiestaDexTokens } from "./utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { getContractFactory } = hre.ethers;
  const { deploy, save } = deployments;

  const { admin } = await getNamedAccounts();
  const chainId: string = await getChainId();

  // to prevent useless deployment
  if (!mainnets.includes(chainId)) {
    // send 1 ether to admin if we are on localhost project
    if (hre.network.name === "localhost" && admin !== "0x1A681d0E32f8a1d0a5ba94113ecBc1A5dF92e50F") {
      await sendEtherTo(parseEther("1"), admin, hre.ethers.provider);
    }

    await deploy("DefiestaDexToken", {
      from: admin,
      args: ["DefiestaDex Token", "DDEX", parseEther("10000000000")], // 10 billion
      log: true,
    });
  } else {
    const DefiestaDexToken = await getContractFactory(chainId === "1" ? "DefiestaDexToken" : "DefiestaDexTokenL2");

    await save("DefiestaDexToken", {
      address: DefiestaDexTokens[chainId],
      abi: JSON.parse(DefiestaDexToken.interface.format("json") as string),
    });
  }
};
export default func;
func.tags = ["DefiestaDexToken"];
