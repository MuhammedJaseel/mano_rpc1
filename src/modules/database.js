import mongoose from "mongoose";
import { MONGO_URI } from "./static.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
};
