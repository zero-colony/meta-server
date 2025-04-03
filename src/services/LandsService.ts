import { anyGm, clny, gm, mc, uniswapV3Pool } from "../blockchain/contracts";
import { CONTRACTS } from "../blockchain/contracts-addresses";
import { Attribute } from "../types";
import { getEthPriceFromBinance } from "./ClnyServices/ETHPriceService";

type TokenData = {
  earned: number;
  speed: number;
  baseStation: boolean;
  transport: number;
  robotAssembly: number;
  powerProduction: number;
  lastUpdated: Date;
};

let cachedMetrics: Metrics | null = null;

/**
 * This fills allTokens
 */
export const allTokens: Array<number> = [];
(async () => {
  let start = 0;
  while (true) {
    try {
      const data = await mc.methods
        .allTokensPaginate(start, start + 999)
        .call();
      allTokens.push(...data.map((id: string) => parseInt(id)));
      start += data.length;
      if (start >= 21000) {
        break;
      }
    } catch (error: any) {
      console.log("paginate", error.message);
    }
    await new Promise((rs) => setTimeout(rs, 1000));
  }
})();

const tokenData: Map<number, TokenData> = new Map();
(async () => {
  const BUNCH_SIZE = 500;
  while (true) {
    await new Promise((rs) => setTimeout(rs, 5000));
    if (allTokens.length === 0) {
      continue;
    }
    let i = 0;
    while (i < allTokens.length) {
      await new Promise((rs) => setTimeout(rs, 2000));
      const bunch: Array<number> = [];
      let k = i;
      while (k < Math.min(i + BUNCH_SIZE, allTokens.length)) {
        bunch.push(allTokens[k]);
        k++;
      }
      try {
        const data = await anyGm().methods.getAttributesMany(bunch).call();
        k = i;
        for (const item of data) {
          const tokenNumber = allTokens[k];
          tokenData.set(tokenNumber, {
            earned: item.earned * 1e-18,
            speed: parseInt(item.speed),
            baseStation: parseInt(item.baseStation) ? true : false,
            transport: parseInt(item.transport),
            robotAssembly: parseInt(item.robotAssembly),
            powerProduction: parseInt(item.powerProduction),
            lastUpdated: new Date(),
          });
          k++;
        }
        i = i + BUNCH_SIZE;
      } catch (error: any) {
        console.log("data", error.message);
      }
    }
  }
})();

export const attribute = (trait_type: string, value: string): Attribute => {
  return {
    trait_type,
    value,
  };
};

export const getData = async (token: number): Promise<Attribute[] | null> => {
  if (!allTokens.includes(token) || !tokenData.has(token)) {
    try {
      const data = await gm.methods.getAttributesMany([token]).call();
      console.log("WITHOUT CACHE", token);
      const item = data[0];
      tokenData.set(token, {
        earned: item.earned * 1e-18,
        speed: parseInt(item.speed),
        baseStation: parseInt(item.baseStation) ? true : false,
        transport: parseInt(item.transport),
        robotAssembly: parseInt(item.robotAssembly),
        powerProduction: parseInt(item.powerProduction),
        lastUpdated: new Date(),
      });
    } catch (error: any) {
      console.log(error.message);
      return null;
    }
  }

  const tokenAttrs = tokenData.get(token)!;

  const data: Attribute[] = [
    attribute("Data updated", tokenAttrs.lastUpdated.toUTCString()),
    attribute("Earned CLNY", tokenAttrs.earned.toFixed(3)),
    attribute(
      CONTRACTS.shares ? "Shares" : "Earning speed, CLNY/day",
      tokenAttrs.speed.toFixed(CONTRACTS.shares ? 0 : 1)
    ),
    attribute("Electricity", tokenAttrs.baseStation ? "yes" : "no"),
    attribute("Blockchain Node", tokenAttrs.transport.toFixed(0)),
    attribute("Data Centre", tokenAttrs.robotAssembly.toFixed(0)),
    attribute("AI Lab", tokenAttrs.powerProduction.toFixed(0)),
  ];
  return data;
};

let cachedSupply = "Error";
export const getSupply = async (): Promise<string> => {
  try {
    const supply = await clny.methods.totalSupply().call();
    cachedSupply = (supply * 10 ** -18).toFixed(3);
  } catch {}
  return cachedSupply;
};

type Metrics = {
  available: number;
  claimed: number;
  prizeEth: number;
  prizeUsd: number;
};

(async () => {
  while (true) {
    try {
      const metrics = await gm.methods.saleData().call();
      const ethPrice = await getEthPriceFromBinance();
      const claimed = parseInt(metrics.minted);

      const bought = claimed - Number(process.env.MINTED) - 100; // 100 is our mint, 1000 is paid prize

      const prizeEth = (bought * 0.009) / 4;
      const prizeUsd = Math.round(prizeEth * ethPrice);

      cachedMetrics = {
        available: metrics.limit - metrics.minted,
        claimed,
        prizeEth,
        prizeUsd,
      };
    } catch (error: any) {
      console.log("saleData error", error.message);
    }

    await new Promise((rs) => setTimeout(rs, 10_000));
  }
})();

export const getMetrics = (): Metrics => {
  return (
    cachedMetrics ?? {
      available: 0,
      claimed: 0,
      prizeEth: 0,
      prizeUsd: 0,
    }
  );
};
