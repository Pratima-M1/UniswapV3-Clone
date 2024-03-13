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
const tokenId = 3; //process.env.tokenId;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer2 = new ethers.Wallet(ownerPrivateKey, provider);
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers");

async function removeLiquidity() {
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );
  const poolContract = new Contract(
    TETHER_GOLD_BAR_COIN_3000,
    artifacts.UniswapV3Pool.abi,
    provider
  );
  const positionData = await nonfungiblePositionManager.positions(tokenId);
  const liquidity = positionData[7]; // Index 7 represents liquidity in the returned array
  // const liquidity = 1000000000000000067;
  //const liquidity = BigInt("1672754998358197669159");
  const removeliquiditytx = await nonfungiblePositionManager
    .connect(signer2)
    .decreaseLiquidity(
      {
        tokenId: tokenId,
        liquidity: liquidity,
        amount0Min: 0,
        amount1Min: 0,
        deadline: deadline,
      },
      { gasLimit: "1000000" }
    );
  await removeliquiditytx.wait();
}

async function main() {
  await removeLiquidity();
}

/*
  npx hardhat run --network localhost scripts/04_decreaseLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
