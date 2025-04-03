import axios from "axios";

const BINANCE_API_URL =
  "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT";

let cachedPrice: number | null = null;
let lastFetch = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds in milliseconds

/**
 * Gets the current ETH price in USD from Binance
 * @returns ETH price in USD as a number
 */
export const getEthPriceFromBinance = async (): Promise<number> => {
  const now = Date.now();
  if (cachedPrice && now - lastFetch < CACHE_TTL) {
    return cachedPrice;
  }

  try {
    const response = await axios.get(BINANCE_API_URL);
    cachedPrice = Number(response.data.price);
    lastFetch = now;
    return cachedPrice;
  } catch (error: any) {
    console.log("Error getting ETH price:", error.message);
    return cachedPrice ?? 0;
  }
};
