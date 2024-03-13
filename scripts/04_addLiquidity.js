require("dotenv").config();

TETHER_ADDRESS = process.env.TETHER_ADDRESS;
GOLD_BAR_COIN_ADDRESS = process.env.GOLD_BAR_COIN_ADDRESS;
FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS;
NFT_DESCRIPTOR_ADDRESS = process.env.NFT_DESCRIPTOR_ADDRESS;
POSITION_DESCRIPTOR_ADDRESS = process.env.POSITION_DESCRIPTOR_ADDRESS;
POSITION_MANAGER_ADDRESS = process.env.POSITION_MANAGER_ADDRESS;
TETHER_GOLD_BAR_COIN_3000 = process.env.TETHER_GOLD_BAR_COIN_3000;
const { promisify } = require("util");
const fs = require("fs");
const ownerPrivateKey = PRIVATE_KEY;
const signer2Privatekey = PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const owner = new ethers.Wallet(ownerPrivateKey, provider);
const signer2 = new ethers.Wallet(ownerPrivateKey, provider);
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  GOLD_BAR_COIN: require("../artifacts/contracts/GoldBarCoin.sol/GoldBarCoin.json"),
  TETHER: require("../artifacts/contracts/Tether.sol/Tether.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
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

async function main() {
  // const [_owner, signer2] = await ethers.getSigners();
  //const provider = ethers.provider;

  const tetherContract = new Contract(
    TETHER_ADDRESS,
    artifacts.TETHER.abi,
    provider
  );
  const goldBarCoinContract = new Contract(
    GOLD_BAR_COIN_ADDRESS,
    artifacts.GOLD_BAR_COIN.abi,
    provider
  );

  await tetherContract
    .connect(signer2)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("1000"));
  await goldBarCoinContract
    .connect(signer2)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("1000"));

  const poolContract = new Contract(
    TETHER_GOLD_BAR_COIN_3000,
    artifacts.UniswapV3Pool.abi,
    provider
  );

  const poolData = await getPoolData(poolContract);

  const tetherToken = new Token(80001, TETHER_ADDRESS, 18, "Tether", "Tether");
  const goldBarCoinToken = new Token(
    80001,
    GOLD_BAR_COIN_ADDRESS,
    18,
    "GoldBarCoin",
    "GBC"
  );

  const pool = new Pool(
    tetherToken,
    goldBarCoinToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  );

  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther("1"),
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
  });

  const { amount0: amount0Desired, amount1: amount1Desired } =
    position.mintAmounts;

  params = {
    token0: TETHER_ADDRESS,
    token1: GOLD_BAR_COIN_ADDRESS,
    fee: poolData.fee,
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer2.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );

  const tx = await nonfungiblePositionManager
    .connect(signer2)
    .mint(params, { gasLimit: "1000000" });
  const receipt = await tx.wait();

  const addLiquidityEvent = receipt.events.find(
    (event) => event.event === "IncreaseLiquidity"
  );
  const tokenId = addLiquidityEvent.args.tokenId;
  console.log("Minted position with tokenId:", tokenId);
  let addresses = [`tokenId${tokenId}=${tokenId}`];
  const data = "\n" + addresses.join("\n");
  const writeFile = promisify(fs.appendFile);
  const filePath = ".env";
  return writeFile(filePath, data)
    .then(() => {
      console.log("Addresses recorded.");
    })
    .catch((error) => {
      console.error("Error logging addresses:", error);
      throw error;
    });
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
