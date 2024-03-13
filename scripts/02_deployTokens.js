const fs = require("fs");
const { promisify } = require("util");
const { waffle, ethers } = require("hardhat");

async function main() {
  const ownerPrivateKey = process.env.PRIVATE_KEY;
  const signer2Privatekey = process.env.PRIVATE_KEY;
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const owner = new ethers.Wallet(ownerPrivateKey, provider);
  const signer2 = new ethers.Wallet(signer2Privatekey, provider);

  Tether = await ethers.getContractFactory("Tether", owner);
  tether = await Tether.deploy();

  GoldbarCoin = await ethers.getContractFactory("GoldBarCoin", owner);
  goldbarCoin = await GoldbarCoin.deploy();

  await tether
    .connect(owner)
    .mint(signer2.address, ethers.utils.parseEther("100000000000000000000000"));
  await goldbarCoin
    .connect(owner)
    .mint(signer2.address, ethers.utils.parseEther("100000000000000000000000"));

  let addresses = [
    `TETHER_ADDRESS=${tether.address}`,
    `GOLD_BAR_COIN_ADDRESS=${goldbarCoin.address}`,
  ];
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
  npx hardhat run --network localhost scripts/02_deployTokens.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
