import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database.js";
import bcRouter from "./bcRouter.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

await connectDB();

app.get("", async (req, res) => {
  return res.json({ status: "Working", version: "1.0.2" });
});

app.post("", async (req, res) => {
  return res.json(await bcRouter(req.body));
});

const PORT = process.env.PORT || 4501;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

