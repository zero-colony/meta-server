import { clny, ls } from "../../blockchain/contracts";

type MintedBurned = {
  burned: number;
  minted: number;
};

export const getMintedBurnedFromClnyContract =
  async (): Promise<MintedBurned | null> => {
    try {
      const data = await ls.methods.getClnyStat().call();

      const clnyTotalSupply = await clny.methods.totalSupply().call();
      console.log("clnyTotalSupply", clnyTotalSupply / 10 ** 18);

      const burned = await clny.methods.burnedStats(1).call();
      console.log("burned", burned / 10 ** 18);

      const minted = clnyTotalSupply / 10 ** 18;

      return {
        minted,
        burned: Math.round(burned / 10 ** 18),
      };
    } catch (error: any) {
      console.log("getStatFromContract error", error);
      return null;
    }
  };
