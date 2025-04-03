import { uniswapV3Pool } from "../../blockchain/contracts";
import { CONTRACTS } from "../../blockchain/contracts-addresses";

/**
 * Gets the price of CLNY in WETH from Uniswap V3 pool
 * Uses sqrtPriceX96 from the pool's slot0 function
 * Formula: price = (sqrtPriceX96 / 2^96)^2
 * If CLNY is token0, price = 1/price
 * @returns Price of CLNY in WETH as a string with 6 decimal places
 */
export const getClnyPriceInWeth = async (): Promise<number | null> => {
  try {
    // Get token addresses to determine token order
    const token0Address = await uniswapV3Pool.methods.token0().call();

    // Get sqrtPriceX96 from slot0
    const slot0Data = await uniswapV3Pool.methods.slot0().call();
    const sqrtPriceX96 = slot0Data.sqrtPriceX96;

    // Calculate price
    // Convert sqrtPriceX96 to a decimal
    const sqrtPrice = Number(sqrtPriceX96) / 2 ** 96;
    // Square the result to get the price
    let price = sqrtPrice * sqrtPrice;

    return price;
  } catch (error: any) {
    console.log("Error getting CLNY price:", error.message);
    return null;
  }
};
