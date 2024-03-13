const { ethers } = require("hardhat");
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};
async function main() {
  // Replace with the address of the deployed NonfungiblePositionManager contract
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const contractAddress = process.env.POSITION_MANAGER_ADDRESS;
  const ownerPrivateKey = process.env.PRIVATE_KEY;
  const signer2 = new ethers.Wallet(ownerPrivateKey, provider);
  // Replace with the token ID for which you want to get the liquidity
  const tokenId = 3;

  // Load the contract interface
  const contract = new ethers.Contract(
    contractAddress,
    artifacts.NonfungiblePositionManager.abi,
    signer2
  );

  try {
    // Call the positions function to get liquidity
    const positionData = await contract.positions(tokenId);

    console.log(
      "Liquidity for token ID",
      tokenId,
      ":",
      positionData[7].toString()
    );
    console.log("token0Owed:", positionData[10].toString());
    console.log("token1Owed:", positionData[11].toString());
  } catch (error) {
    console.error("Error retrieving liquidity:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
