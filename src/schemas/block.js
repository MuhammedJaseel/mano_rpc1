import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blockSchema = new Schema(
  {
    bn: { type: Number, required: true, unique: true, index: true }, // block number
    bh: { type: String, required: true, unique: true, index: true }, // block hash
    ph: { type: String, required: true }, // parent hash
    n: { type: String, required: true }, // nonce
    m: { type: String, required: true }, // miner
    gu: { type: String, required: true }, // gas used
    txs: { type: Array, required: true }, // transactions
    ts: { type: Number, default: new Date().getTime() }, // timestamp
  },
  { versionKey: false }
);

export default model("Block", blockSchema);
