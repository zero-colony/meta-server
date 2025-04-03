import axios from "axios";
import { db } from "./db";
import { holders } from "./db/schema/schema";
import { eq, desc, asc, and, not } from "drizzle-orm";
import cron from "node-cron";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Address {
  ens_domain_name: string | null;
  hash: string;
  implementations: any[];
  is_contract: boolean;
  is_scam: boolean;
  is_verified: boolean;
  metadata: any | null;
  name: string | null;
  private_tags: any[];
  proxy_type: string | null;
  public_tags: any[];
  watchlist_names: any[];
}

interface Token {
  address: string;
  circulating_market_cap: number | null;
  decimals: string;
  exchange_rate: number | null;
  holders: string;
  icon_url: string | null;
  name: string;
  symbol: string;
  total_supply: string;
  type: string;
  volume_24h: number | null;
}

interface Holder {
  address: Address;
  token: Token;
  token_id: string | null;
  value: string;
}

interface NextPageParams {
  address_hash: string;
  items_count: number;
  value: number;
}

interface HoldersResponse {
  items: Holder[];
  next_page_params: NextPageParams | null;
}

// Helper function to convert token amount from string to float
function convertTokenAmount(amount: string): number {
  // Convert from wei to token amount (18 decimals)
  return parseFloat(amount) / Math.pow(10, 18);
}

export async function updateAllClnyHolders() {
  const baseUrl =
    "https://zero-network.calderaexplorer.xyz/api/v2/tokens/0x1a90dd3dd89e2d2095ed1b40ecc1fe2bbb7614a1/holders";
  let nextPageParams: NextPageParams | null = null;

  // Create an array to collect all holder data in memory
  const allHolders: { address: string; amount: number; updatedAt: Date }[] = [];
  const holderMap = new Map<string, number>();

  // Fetch all holder data first
  do {
    try {
      let url = baseUrl;
      if (nextPageParams) {
        const params = new URLSearchParams({
          address_hash: nextPageParams.address_hash,
          items_count: nextPageParams.items_count.toString(),
          value: nextPageParams.value.toString(),
        });
        url += `?${params.toString()}`;
      }

      const response = await axios.get<HoldersResponse>(url, {
        headers: {
          accept: "application/json",
        },
      });

      // Collect holder data in memory and aggregate amounts for duplicate addresses
      for (const holder of response.data.items) {
        const floatAmount = convertTokenAmount(holder.value);
        const currentAmount = holderMap.get(holder.address.hash) || 0;
        holderMap.set(holder.address.hash, currentAmount + floatAmount);

        console.log(
          `Collected holder: ${holder.address.hash}, Amount: ${floatAmount} CLNY`
        );
      }

      nextPageParams = response.data.next_page_params;
      await sleep(1000);
    } catch (error) {
      console.error("Error fetching holders:", error);
      break;
    }
  } while (nextPageParams !== null);

  // Convert the map to array of holders
  for (const [address, amount] of holderMap.entries()) {
    allHolders.push({
      address,
      amount,
      updatedAt: new Date(),
    });
  }

  // Now update the database in a single transaction
  try {
    // Delete all existing records
    await db.delete(holders);
    console.log("Deleted all existing holder records");

    // Insert all collected holders
    if (allHolders.length > 0) {
      await db.insert(holders).values(allHolders);
      console.log(`Inserted ${allHolders.length} holders into the database`);
    }
  } catch (error) {
    console.error("Error updating database:", error);
  }
}

// Helper function to get holder by address
export async function getHolderByAddress(address: string) {
  return await db.select().from(holders).where(eq(holders.address, address));
}

// Helper function to get all holders
export async function getAllHoldersFromDb(
  sortDirection: "asc" | "desc" = "desc"
) {
  return await db
    .select()
    .from(holders)
    .where(
      and(
        not(eq(holders.address, "0xa16D3Eb3ddFa4Ba33fDcda3eB4dDcF80bAfC0ab8")),
        not(eq(holders.address, "0x6911d086Ce4056f8811ACe85075927a085289698")),
        not(eq(holders.address, "0x0000000000000000000000000000000000000001"))
      )
    )
    .orderBy(
      sortDirection === "desc" ? desc(holders.amount) : asc(holders.amount)
    );
}

// Helper function to get top N holders
export async function getTopHolders(limit: number) {
  return await db
    .select()
    .from(holders)
    .where(
      and(
        not(eq(holders.address, "0xa16D3Eb3ddFa4Ba33fDcda3eB4dDcF80bAfC0ab8")),
        not(eq(holders.address, "0x6911d086Ce4056f8811ACe85075927a085289698")),
        not(eq(holders.address, "0x0000000000000000000000000000000000000001"))
      )
    )
    .orderBy(desc(holders.amount))
    .limit(limit);
}

export async function getHolderPlace(address: string) {
  const holders = await getAllHoldersFromDb();
  const holder = holders.find((h) => h.address === address);

  if (!holder) {
    return 0;
  }

  return holders.indexOf(holder) + 1;
}
