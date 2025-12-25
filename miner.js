import { MINER_2, MONGO_URI } from "./src/modules/static.js";
import mine from "./src/services/mine.js";
import mongoose from "mongoose";
import miner from "./src/services/miner.js";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected (Miner)");
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
};

const mineByTimer = async () => {
  const mined = await miner(MINER_2);
  console.log(mined);
  setTimeout(() => {
    mineByTimer();
  }, 3000);
};

await connectDB();
// mineByTimer();
const mined = await miner(MINER_2);
console.log(mined);
