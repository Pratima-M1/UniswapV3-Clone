require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

RPC_URL = process.env.RPC_URL;
PRIVATE_KEY = process.env.PRIVATE_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
        details: { yul: false },
      },
    },
  },
  networks: {
    MUMBAI: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY],
      gas: 2100000, // You can adjust gas limit as needed
      gasPrice: 8000000000, // You can adjust gas price as needed
    },
  },
};
