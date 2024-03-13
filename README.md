# UniswapV3 Deployment Scripts

This repository contains scripts for deploying UniswapV3 contracts using Hardhat. The deployment scripts cover various functionalities including deploying tokens, deploying pools, adding liquidity, increasing liquidity, decreasing liquidity, swapping tokens, and burning tokens.

## Deployment Scripts

1. **Deploy Contracts**: This script deploys the core UniswapV3 contracts including the UniswapV3Factory, SwapRouter, NFTDescriptor, NonfungibleTokenPositionDescriptor, and NonfungiblePositionManager.

2. **Deploy Token**: This script deploys ERC20 tokens to be used in liquidity provision and swapping.

3. **Deploy Pool**: This script creates liquidity pools for token pairs on UniswapV3.

4. **Add Liquidity**: This script adds liquidity to existing pools.

5. **Increase Liquidity**: This script increases liquidity in existing pools.

6. **Decrease Liquidity**: This script decreases liquidity in existing pools.

7. **Swap Tokens**: This script enables swapping of tokens on UniswapV3(ExactInput and ExactOutput).
8. **collect**: This script collects the amount0 and amount1 owned for the given position(tokenId).

9. **Burn Tokens**: This script allows burning of tokens from liquidity pools.

10. **Get Positions**: This script fetches details of the given tokenId (position).
