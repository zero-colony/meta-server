import { getClnyPriceInWeth } from "./ClnyServices/CLNYPriceService";
import { getEthPriceFromBinance } from "./ClnyServices/ETHPriceService";
import { getMintedBurnedFromClnyContract } from "./ClnyServices/MintedBurnedService";

type ClnyData = {
  minted: number;
  burned: number;
  marketCap: number;
  priceInUsd: number;
} | null;

let cachedData: ClnyData = null;
let lastFetch = 0;
const TTL = 100 * 1000; // 100 seconds in milliseconds

export const getClnyData = async (): Promise<ClnyData> => {
  const now = Date.now();
  if (cachedData && now - lastFetch < TTL) {
    return cachedData;
  }

  const [mintedBurned, priceInWeth, ethPrice] = await Promise.all([
    getMintedBurnedFromClnyContract(),
    getClnyPriceInWeth(),
    getEthPriceFromBinance(),
  ]);

  console.log("mintedBurned", mintedBurned);
  console.log("priceInWeth", priceInWeth);
  console.log("ethPrice", ethPrice);

  if (!mintedBurned || !priceInWeth || !ethPrice) {
    return null;
  }

  const priceInUsd = priceInWeth * ethPrice;
  const marketCap = mintedBurned.minted * priceInUsd;

  cachedData = {
    minted: Math.round(mintedBurned.minted),
    burned: Math.round(mintedBurned.burned),
    marketCap: Math.round(marketCap),
    priceInUsd: Number(priceInUsd.toFixed(4)),
  };
  lastFetch = now;

  return cachedData;
};
