import express from "express";
import dotenv from "dotenv";

import bcRouter from "./bcRouter.js";
import cors from "cors";
import { mineTransactins } from "./services/chain.js";
import { connectDB } from "./modules/database.js";
import {
  connectLocalServer,
  IS_LOCAL_SERVER,
  LOCAL_SERVER,
} from "./modules/localServer.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

await connectDB();
await connectLocalServer();

app.get("", async (req, res) => {
  if (
    IS_LOCAL_SERVER &&
    (req.hostname === "rpc1-be.vercel" || req.hostname === "localhost")
  ) {
    try {
      const targetUrl = `${LOCAL_SERVER}${req.url}`;

      const axiosConfig = {
        method: req.method,
        url: targetUrl,
        headers: { ...req.headers, host: new URL(LOCAL_SERVER).host },
        data: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
        validateStatus: () => true,
      };
      const response = await axios(axiosConfig);
      console.log("Responded from local");
      return res.status(response.status).send(response.data);
    } catch (err) {
      // res.status(500).send("Server Error");
    }
  }
  return res.json({ app: "rpc1", status: "Working", version: "1.0.4" });
});

app.post("", async (req, res) => {
  return res.json(await bcRouter(req.body));
});

app.get("/mine", async (req, res) => {
  return res.json(await mineTransactins());
});

const PORT = process.env.PORT || 4501;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
