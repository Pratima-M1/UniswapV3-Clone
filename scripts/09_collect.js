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
//const tokenId = process.env.tokenId;
const tokenId = 3;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer2 = new ethers.Wallet(ownerPrivateKey, provider);
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  GOLD_BAR_COIN: require("../artifacts/contracts/GoldBarCoin.sol/GoldBarCoin.json"),
  TETHER: require("../artifacts/contracts/Tether.sol/Tether.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers");

async function collectFees() {
  // const amount0 = ethers.utils.parseUnits("10", 18); // Amount of token0 desired (in Wei)
  // const amount1 = ethers.utils.parseUnits("10", 18);

  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );
  const positionData = await nonfungiblePositionManager.positions(tokenId);
  const amount0 = positionData[10];
  const amount1 = positionData[11];
  const collectParams = {
    tokenId: tokenId,
    recipient: signer2.address,
    amount0Max: amount0,
    amount1Max: amount1,
  };
  const collecttx = await nonfungiblePositionManager
    .connect(signer2)
    .collect(collectParams, { gasLimit: "1000000" });

  const receipt = await collecttx.wait();

  const collectEvent = receipt.events.find(
    (event) => event.event === "Collect"
  );
  //emit Collect(params.tokenId, recipient, amount0Collect, amount1Collect);
  console.log(collectEvent.args.tokenId);
  console.log(collectEvent.args.recipient);
  console.log(collectEvent.args.amount0Collect);
  console.log(collectEvent.args.amount1Collect);
  console.log(amount0);
  console.log(amount1);
}

async function main() {
  await collectFees();
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
