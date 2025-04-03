import express from "express";
import { generateImage } from "./helpers/generate-image";
import { generateMetadata } from "./helpers/generate-metadata";
import cors from "cors";
import { allTokens, getMetrics, getSupply } from "./services/LandsService";
import { environment } from "./environment";
import { getMintedBurnedFromClnyContract } from "./services/ClnyServices/MintedBurnedService";
import { getClnyData } from "./services/ClnyService";
import {
  getHolderPlace,
  getTopHolders,
  updateAllClnyHolders,
} from "./services/holders/holders";
import { startMonitoringWinners } from "./services/holders/mc-supply-monitor";
import cron from "node-cron";
const app = express();
app.use(cors());
app.use((req: express.Request, res: express.Response, next: Function) => {
  if (!req.url.endsWith(".png") && req.url !== "/metrics") {
    console.log("ACCESS LOG", req.url);
  }
  next();
});

app.get("/tokens", (req: express.Request, res: express.Response) => {
  res.json(allTokens);
});

app.get("/metrics", (req: express.Request, res: express.Response) => {
  res.json(getMetrics());
});

app.get("/clny-stat", async (req: express.Request, res: express.Response) => {
  res.json(await getClnyData());
});

app.get(
  "/leaderboard/:address",
  async (req: express.Request, res: express.Response) => {
    const top100 = await getTopHolders(100);
    const place = await getHolderPlace(req.params.address);
    res.json({
      top100,
      place,
    });
  }
);

// image for a token
app.get("/:token.png", (req: express.Request, res: express.Response) => {
  const { token } = req.params;

  const tokenNumber = parseInt(token);
  if (Number.isNaN(tokenNumber) || tokenNumber < 1 || tokenNumber > 21000) {
    res.status(404).end();
    return;
  }
  const image = Buffer.from(generateImage(parseInt(token)), "base64");
  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": image.length,
  });
  res.end(image);
});

// metadata
app.get("/:token", (req: express.Request, res: express.Response) => {
  const { token } = req.params;
  const tokenNumber = parseInt(token);
  if (Number.isNaN(tokenNumber) || tokenNumber < 1 || tokenNumber > 21000) {
    res.status(404).end();
    return;
  }
  generateMetadata(tokenNumber).then((meta) => {
    if (meta === null) {
      res.sendStatus(404);
    } else {
      res.json(meta);
    }
  });
});

app.use((req: express.Request, res: express.Response, next: Function) => {
  res.status(404).end();
});

app.listen(environment.PORT, "127.0.0.1", () => {
  console.log("server started", environment.PORT);
});

cron.schedule("*/5 * * * *", async () => {
  console.log("Running scheduled holders update...");
  try {
    await updateAllClnyHolders();
    console.log("Holders update completed successfully");
  } catch (error) {
    console.error("Error in scheduled holders update:", error);
  }
});

// startMonitoringWinners();
