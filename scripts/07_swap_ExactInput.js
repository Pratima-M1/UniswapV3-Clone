require("dotenv").config();

TETHER_ADDRESS = process.env.TETHER_ADDRESS;
GOLD_BAR_COIN_ADDRESS = process.env.GOLD_BAR_COIN_ADDRESS;
FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS;
NFT_DESCRIPTOR_ADDRESS = process.env.NFT_DESCRIPTOR_ADDRESS;
POSITION_DESCRIPTOR_ADDRESS = process.env.POSITION_DESCRIPTOR_ADDRESS;
POSITION_MANAGER_ADDRESS = process.env.POSITION_MANAGER_ADDRESS;
TETHER_GOLD_BAR_COIN_3000 = process.env.TETHER_GOLD_BAR_COIN_3000;
const ownerPrivateKey = PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer2 = new ethers.Wallet(ownerPrivateKey, provider);
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  GOLD_BAR_COIN: require("../artifacts/contracts/GoldBarCoin.sol/GoldBarCoin.json"),
  TETHER: require("../artifacts/contracts/Tether.sol/Tether.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
};

const { Contract } = require("ethers");
const { Token } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick } = require("@uniswap/v3-sdk");

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}
async function exactInputSingle() {
  const swapRouter = new Contract(
    SWAP_ROUTER_ADDRESS,
    artifacts.SwapRouter.abi,
    provider
  );
  const poolContract = new Contract(
    TETHER_GOLD_BAR_COIN_3000,
    artifacts.UniswapV3Pool.abi,
    provider
  );

  // Listen for the Swap event from the pool contract
  // Swap(msg.sender, recipient, amount0, amount1, state.sqrtPriceX96, state.liquidity, state.tick);
  poolContract.on(
    "Swap",
    (sender, receipient, amount0, amount1, sqrtPrice, liquidity, tick) => {
      console.log("Swap event detected  for ExactInputSingle:");
      console.log("Sender:", sender);
      console.log("Receipient:", receipient);
      console.log("Amount0:", amount0.toString());
      console.log("Amount1:", amount1.toString());
      console.log("SqrtPriceX96:", sqrtPrice);
      console.log("Liquidity:", liquidity);
      console.log("Tick:", tick);
    }
  );

  const tether = new Contract(TETHER_ADDRESS, artifacts.TETHER.abi, provider);
  const goldBarCoin = new Contract(
    GOLD_BAR_COIN_ADDRESS,
    artifacts.GOLD_BAR_COIN.abi,
    provider
  );

  await tether
    .connect(signer2)
    .approve(swapRouter.address, ethers.utils.parseEther("1000000"));

  const poolData = await getPoolData(poolContract);

  const inputAmount = 0.001;
  // .001 => 1 000 000 000 000 000
  const amountIn = ethers.utils.parseUnits(inputAmount.toString(), "18");
  const swapExactInputparams = {
    tokenIn: tether.address,
    tokenOut: goldBarCoin.address,
    fee: poolData.fee,
    recipient: signer2.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    amountIn: amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };
  const swapTx = await swapRouter
    .connect(signer2)
    .exactInputSingle(swapExactInputparams, {
      gasLimit: 1000000,
    });

  await swapTx.wait();
  await swapTx.wait();
}

async function main() {
  await exactInputSingle();
}

/*
  npx hardhat run --network localhost scripts/04_addLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
