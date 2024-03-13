require("dotenv").config();

TETHER_ADDRESS = process.env.TETHER_ADDRESS;
GOLD_BAR_COIN_ADDRESS = process.env.GOLD_BAR_COIN_ADDRESS;
WETH_ADDRESS = process.env.WETH_ADDRESS;
FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS;
NFT_DESCRIPTOR_ADDRESS = process.env.NFT_DESCRIPTOR_ADDRESS;
POSITION_DESCRIPTOR_ADDRESS = process.env.POSITION_DESCRIPTOR_ADDRESS;
POSITION_MANAGER_ADDRESS = process.env.POSITION_MANAGER_ADDRESS;
PRIVATE_KEY = process.env.PRIVATE_KEY;
RPC_URL = process.env.RPC_URL;
const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const { Contract, BigNumber } = require("ethers");
const bn = require("bignumber.js");
const { promisify } = require("util");
const fs = require("fs");
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

//const provider = ethers.provider;
const ownerPrivateKey = PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const owner = new ethers.Wallet(ownerPrivateKey, provider);

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}

const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  provider
);

const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  provider
);

async function deployPool(token0, token1, fee, price) {
  // const [owner] = await ethers.getSigners();

  await nonfungiblePositionManager
    .connect(owner)
    .createAndInitializePoolIfNecessary(token0, token1, fee, price, {
      gasLimit: 5000000,
    });

  const poolAddress = await factory.connect(owner).getPool(token0, token1, fee);
  return poolAddress;
}

async function main() {
  const tethergoldbarcoin3000 = await deployPool(
    TETHER_ADDRESS,
    GOLD_BAR_COIN_ADDRESS,
    3000,
    encodePriceSqrt(1, 1)
  );

  let addresses = [`TETHER_GOLD_BAR_COIN_3000=${tethergoldbarcoin3000}`];
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
  npx hardhat run --network localhost scripts/03_deployPools.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
