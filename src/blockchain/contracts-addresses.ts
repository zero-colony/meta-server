import { environment } from "../environment";
const NETWORK_DATA: Record<
  string,
  {
    CLNY: string;
    MC: string;
    GM: string;
    LANDSTATS: string;
    CLNY_WETH_POOL: string;
    shares: boolean;
    meta: string;
    excludeFromSupply: string[]; // addresses for excluding to make circulating supply
  }
> = {
  "zero-testnet": {
    CLNY: environment.CLNY_ADDRESS,
    MC: environment.MC_ADDRESS,
    GM: environment.GM_ADDRESS,
    LANDSTATS: environment.LANDSTATS_ADDRESS,
    CLNY_WETH_POOL: environment.CLNY_WETH_POOL_ADDRESS,
    shares: false,
    meta: "https://meta-zero-testnet.marscolony.io/",
    excludeFromSupply: [],
  },
  zero: {
    CLNY: environment.CLNY_ADDRESS,
    MC: environment.MC_ADDRESS,
    GM: environment.GM_ADDRESS,
    LANDSTATS: environment.LANDSTATS_ADDRESS,
    CLNY_WETH_POOL: environment.CLNY_WETH_POOL_ADDRESS,
    shares: false,
    meta: "https://meta.zerocolony.fun/",
    excludeFromSupply: [],
  },
};

export const CONTRACTS = NETWORK_DATA[environment.NETWORK];
