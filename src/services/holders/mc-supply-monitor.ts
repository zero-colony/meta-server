import fs from "fs";
import path from "path";
import Web3 from "web3";
import { environment } from "../../environment";
import { CONTRACTS } from "../../blockchain/contracts-addresses";
import MC from "../../abi/MC.json";
import { AbiItem } from "web3-utils";
import { getTopHolders, updateAllClnyHolders } from "./holders";

// Set up web3 connection
const nodeMap = {
  "zero-testnet": ["https://rpc.zerion.io/v1/zero-sepolia"],
  zero: ["https://rpc.zerion.io/v1/zero"],
};

const nodes = nodeMap[environment.NETWORK as keyof typeof nodeMap];
const web3 = new Web3(nodeMap[environment.NETWORK as keyof typeof nodeMap][0]);

// Initialize MC contract
const mc = new web3.eth.Contract(MC.abi as AbiItem[], CONTRACTS.MC);

// Target supply threshold
const TARGET_SUPPLY = 3000;

// Path for winners file
const WINNERS_FILE_PATH = path.join(__dirname, "../../../winners.txt");

// Polling interval in milliseconds (15 seconds)
const POLLING_INTERVAL = 15000;

// Variable to track the last checked block number
let lastCheckedBlock = 0;

// Function to check total supply and save top holders if threshold is reached
async function checkTotalSupplyAndSaveTopHolders() {
  try {
    // Get current total supply
    const totalSupply = await mc.methods.totalSupply().call();
    console.log(`Current MC totalSupply: ${totalSupply}`);

    // Check if total supply has reached or exceeded the target
    if (Number(totalSupply) >= TARGET_SUPPLY) {
      console.log(
        `Total supply has reached ${TARGET_SUPPLY}! Getting top holders...`
      );

      await updateAllClnyHolders();

      // Get top 100 holders
      const topHolders = await getTopHolders(100);

      // Format data for winners.txt
      const winnersData = topHolders
        .map((holder, index) => {
          return `${index + 1},${holder.address},${holder.amount}`;
        })
        .join("\n");

      // Write to winners.txt
      fs.writeFileSync(WINNERS_FILE_PATH, winnersData);

      console.log(`Top 100 holders saved to winners.txt`);

      // Stop the monitoring process after saving the winners
      console.log("Goal achieved. Stopping the monitoring process.");
      process.exit(0);
    }
  } catch (error) {
    console.error("Error checking total supply:", error);
  }
}

// Function to check for new blocks and run the supply check
async function checkForNewBlocks() {
  try {
    const currentBlock = await web3.eth.getBlockNumber();

    if (currentBlock > lastCheckedBlock) {
      console.log(
        `New block detected: ${currentBlock} (previous: ${lastCheckedBlock})`
      );
      lastCheckedBlock = currentBlock;
      await checkTotalSupplyAndSaveTopHolders();
    } else {
      console.log(`No new block. Current block: ${currentBlock}`);
    }
  } catch (error) {
    console.error("Error checking for new blocks:", error);
  }
}

// Function to start monitoring blocks using polling
export async function startMonitoringWinners() {
  console.log("Starting to monitor MC contract totalSupply using polling...");

  // Get the current block number to start from
  try {
    lastCheckedBlock = await web3.eth.getBlockNumber();
    console.log(`Starting from block: ${lastCheckedBlock}`);

    // Run the initial check
    await checkTotalSupplyAndSaveTopHolders();

    // Set up polling interval
    const intervalId = setInterval(checkForNewBlocks, POLLING_INTERVAL);

    // Handle process termination
    process.on("SIGINT", () => {
      console.log("Stopping block monitoring...");
      clearInterval(intervalId);
      process.exit(0);
    });
  } catch (error) {
    console.error("Error starting monitoring:", error);
  }
}
