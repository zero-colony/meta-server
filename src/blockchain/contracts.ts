import Web3 from "web3";
import { CONTRACTS } from "./contracts-addresses";
import CLNY from "../abi/CLNY.json";
import MC from "../abi/MC.json";
import GM from "../abi/GameManager.json";
import LANDSTATS from "../abi/LandStats.json";
import UNISWAP_V3_POOL from "../abi/UniswapV3Pool.json";
import { AbiItem } from "web3-utils";
// import { ALCHEMY_KEY } from "../secrets";
import { environment } from "../environment";

const nodeMap = {
  "zero-testnet": ["https://rpc.zerion.io/v1/zero-sepolia"],
  zero: ["https://rpc.zerion.io/v1/zero"],
};

const nodes = nodeMap[environment.NETWORK as keyof typeof nodeMap];

const web3 = new Web3(nodeMap[environment.NETWORK as keyof typeof nodeMap][0]);

export const clny = new web3.eth.Contract(
  CLNY.abi as AbiItem[],
  CONTRACTS.CLNY
);
export const mc = new web3.eth.Contract(MC.abi as AbiItem[], CONTRACTS.MC);
export const gm = new web3.eth.Contract(GM as AbiItem[], CONTRACTS.GM);
export const gms = nodes.map(
  (node: string) =>
    new new Web3(node).eth.Contract(GM as AbiItem[], CONTRACTS.GM)
);
export const anyGm = () => gms[Math.floor(Math.random() * gms.length)];
export const ls = new web3.eth.Contract(
  LANDSTATS.abi as AbiItem[],
  CONTRACTS.LANDSTATS
);

export const uniswapV3Pool = new web3.eth.Contract(
  UNISWAP_V3_POOL.abi as AbiItem[],
  CONTRACTS.CLNY_WETH_POOL
);
