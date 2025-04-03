import dotenv from "dotenv";
import { cleanEnv, str, num } from "envalid";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

export type Environment = {
  PORT: number;
  NETWORK: string;
  CLNY_ADDRESS: string;
  MC_ADDRESS: string;
  GM_ADDRESS: string;
  LANDSTATS_ADDRESS: string;
  CLNY_WETH_POOL_ADDRESS: string;
  MINTED: number;
};

export const environment = cleanEnv(process.env, {
  NETWORK: str({
    choices: ["zero-testnet", "zero"],
  }),
  PORT: num({ default: 8000 }),
  CLNY_ADDRESS: str(),
  MC_ADDRESS: str(),
  GM_ADDRESS: str(),
  LANDSTATS_ADDRESS: str(),
  CLNY_WETH_POOL_ADDRESS: str({ default: "" }),
  MINTED: num({ default: 7000 }),
});
