import mongoose from "mongoose";

const { Schema, model } = mongoose;

const walletsSchema = new Schema(
  {
    a: { type: String, required: true, unique: true, index: true }, // address
    b: { type: String, required: true, default: "0" }, // balance
    n: { type: Number, required: true, default: 0 }, // nounce
    ts: { type: Number, default: new Date().getTime() }, // timestamp
  },
  { versionKey: false }
);

export default model("Wallets", walletsSchema);
