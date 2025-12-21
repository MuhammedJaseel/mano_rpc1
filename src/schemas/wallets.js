import mongoose from "mongoose";

const { Schema, model } = mongoose;

const walletsSchema = new Schema({
  a: { type: String, required: true, unique: true, index: true },
  b: { type: String, required: true, default: "0" },
  n: { type: Number, required: true, default: 0 },
  ca: { type: Date, required: true, default: Date.now }, // createdAt
});

export default model("Wallets", walletsSchema);
