import mongoose from "mongoose";

const { Schema, model } = mongoose;

const signsSchema = new Schema(
  {
    sn: { type: String }, // sign
    st: { type: String, default: "I" }, // I C F Initated Complated Failed
    ts: { type: Number, default: new Date().getTime() }, // timestamp
  },
  { versionKey: false }
);

export default model("Signs", signsSchema);
