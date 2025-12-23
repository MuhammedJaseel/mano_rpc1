import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database.js";
import bcRouter from "./bcRouter.js";
import cors from "cors";
import { mineTransactins } from "./services/chain.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

await connectDB();

app.get("", async (req, res) => {
  return res.json({ status: "Working", version: "1.0.3" });
});

app.post("", async (req, res) => {
  return res.json(await bcRouter(req.body));
});

app.get("/mine", (req, res) => {
  console.log("Mining mannualy");
  return mineTransactins();
});

const PORT = process.env.PORT || 4501;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
