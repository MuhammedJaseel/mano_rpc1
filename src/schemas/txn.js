import mongoose from "mongoose";

const { Schema, model } = mongoose;

const txnSchema = new Schema(
  {
    th: { type: String, required: true, unique: true, index: true }, // transaction hash
    tn: { type: Number, required: true, unique: true }, // nounce
    s: { type: String, required: true }, // signature
    f: { type: String, required: true }, // from
    t: { type: String, required: true }, // to
    v: { type: String, required: true }, // value
    gp: { type: String, required: true }, // gas price
    gl: { type: String, required: true }, // gas limit
    gu: { type: String, required: true }, // gas user
    bn: { type: Number, required: true }, // block number
    bh: { type: String, required: true }, // block hash
    st: { type: String, required: true }, // status S, F ( Succes, Failed )
    ts: { type: Number, default: new Date().getTime() }, // timestamp
  },
  { versionKey: false }
);

export default model("Txn", txnSchema);

//     nonce: "0x96",
//     gasPrice: "0x2bc4f987a2000",
//     gas: "0x5208",
//     to: "0x6D093194B7453a89045E7300732535de8103E316",
//     value: "0xde0b6b3a7640000",
//     input: "0x",
//     v: "0x23b57",
//     r: "0xade074db580ef99e161d65abdc8b9c7b4d97ee62de46405c919a793eb405b272",
//     s: "0x1bb64e2d0e23850cd8f01141823b64b4238c72c0449a24e941ac032941d984d0",
//     hash: "0x42f5c0d28fc07b9d4c15e186b2f2c2ab4c3492e30a463e6c0c0a5afe2272e312",
//     from: "0x791a1C72CcbE377432a191d2b07432815a644A69",
//     blockHash: null,
//     blockNumber: null,
//     transactionIndex: null,
//     type: "0x0",
