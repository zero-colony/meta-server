# metadata-app

MarsColony NFT token metadata backend

# Hi!

This is a simple Node express server, which responses to metadata requests and generates images for tokens

# MC Supply Monitor

This service monitors the MC contract's totalSupply and saves the top 100 holders when the supply reaches 3000 or more.

## How it works

1. The script connects to the blockchain and listens for new blocks.
2. On each new block, it checks the MC contract's totalSupply.
3. When the totalSupply reaches 3000 or more, it:
   - Gets the top 100 holders using the `getTopHolders` function
   - Saves them to `winners.txt` in the format: `place,address,tokens`
   - Exits the process

## Running the script

```bash
# Make sure you have the required environment variables set
# NETWORK, MC_ADDRESS, etc.

# Run the script
npm run build
node dist/scripts/monitor-mc-supply.js
```

## Output

The script will create a `winners.txt` file in the root directory with the following format:

```
1,0xAddress1,1000
2,0xAddress2,900
3,0xAddress3,800
...
100,0xAddress100,10
```

Where:

- The first column is the place (1-100)
- The second column is the holder's address
- The third column is the number of tokens held
