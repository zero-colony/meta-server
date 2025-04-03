import { createCanvas } from "canvas";
// @ts-ignore
import { renderIcon } from "@download/blockies";
import { environment } from "../environment";

const canvas = createCanvas(50, 50);

const cache: string[] = new Array(21000);

type Network = "zero-testnet" | "zero";

const CHAIN_DATA: Record<Network, any[]> = {
  "zero-testnet": ["#803bd4", "#b176ea", "#413f67", "^&", 10],
  zero: ["#b243a6", "#fe5161", "#3f4057", "^&", 10],
};

export const generateImage = (token: number): string => {
  if (cache[token - 1]) {
    return cache[token - 1];
  }
  const [color, bgcolor, spotcolor, seedSalt, size] =
    CHAIN_DATA[environment.NETWORK as Network];

  const icon = renderIcon(
    {
      seed: token.toString() + seedSalt,
      color,
      bgcolor,
      size,
      scale: 100,
      spotcolor,
    },
    canvas
  );
  const str = icon.toDataURL().split(",")[1]; // ltrim "data:image/png;base64,"
  cache[token - 1] = str;
  return str;
};
