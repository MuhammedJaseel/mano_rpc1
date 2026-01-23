import express from "express";
import bcRouter from "./bcRouter.js";
import cors from "cors";
import { connectDB } from "./modules/database.js";
import { MINER_2, MINER_3, PORT } from "./modules/static.js";
import miner from "./services/miner.js";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());

app.use(cors());

await connectDB();

app.get("", async (req, res) => {
  return res.json({
    app: "rpc1",
    status: "Working",
    version: "1.0.6",
    tech: "ExpressJS",
  });
});

app.post("", async (req, res) => {
  return res.json(await bcRouter(req.body));
});

app.get("/mine", async (req, res) => {
  return res.json(await miner(MINER_3));
});

const server = app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

const wss = new WebSocketServer({ server });

const connectedClients = new Set();

wss.on("connection", (ws) => {
  connectedClients.add(ws);
  ws.on("message", (msg) => {});
  ws.on("close", () => {
    connectedClients.delete(ws);
  });
});

export function sendToAllSocket(payload) {
  const msg = typeof payload === "string" ? payload : JSON.stringify(payload);
  for (const ws of connectedClients) {
    if (ws.readyState === 1) {
      // 1 === OPEN
      try {
        ws.send(msg);
      } catch (err) {
        console.error("Failed to send to a client:", err);
      }
    } else {
      connectedClients.delete(ws);
    }
  }
}

const mineByTimer = async () => {
  const mined = await miner(MINER_2);
  if (mined) console.log(mined);
  setTimeout(() => {
    mineByTimer();
  }, 3000);
};

mineByTimer();
