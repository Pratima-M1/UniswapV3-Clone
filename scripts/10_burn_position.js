const { ethers } = require("hardhat");
require("dotenv").config();
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};
async function main() {
  // Replace with the address of the deployed NonfungiblePositionManager contract
  contractAddress = process.env.POSITION_MANAGER_ADDRESS;
  // Replace with the private key of the account you want to use for the transaction
  const signer2Privatekey = PRIVATE_KEY;
  // Replace with the token ID you want to remove liquidity and burn
  const tokenId = 3;

  // Connect to the Ethereum network
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(signer2Privatekey, provider);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
  // Load the contract interface
  const contract = new ethers.Contract(
    contractAddress,
    artifacts.NonfungiblePositionManager.abi,
    wallet
  );

  // Once liquidity is removed, you can call the burn function
  const burnTx = await contract.burn(tokenId, { gasLimit: 3000000 });
  console.log("Burn transaction hash:", burnTx.hash);
  await burnTx.wait(); // Wait for the transaction to be mined

  console.log("Token burned successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
