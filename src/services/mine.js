import Block from "../schemas/block.js";
import Txn from "../schemas/txn.js";
import crypto from "crypto";
import Wallets from "../schemas/wallets.js";
import { ethers } from "ethers";
import mongoose from "mongoose";

const dummyHash =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export default async function mine(minerAddress) {
  let responseTransactiCount = 0;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let newBl = await Block.findOne().sort({ bn: -1 });
    if (newBl) newBl = { bn: newBl.bn + 1, ph: newBl.bh };
    else newBl = { bn: 1, bh: dummyHash };

    const bn = newBl.bn;
    const ph = newBl.ph;
    const m = ethers.getAddress(minerAddress);
    const ts = new Date().getTime();

    const txns = await Txn.find({ st: "P" }, null, { session });

    console.log(txns);

    if (txns.length === 0) throw {};

    const txnHashes = [];
    var totalGasUsed = BigInt(0);

    const hashRow = JSON.stringify({ number: bn, prevHash: ph, data: "" });
    const bh = "0x" + crypto.createHash("sha256").update(hashRow).digest("hex");

    for (let tx of txns) {
      let toAddress = ethers.getAddress(tx.t);
      let to = await Wallets.findOne({ a: toAddress }, null, { session });

      if (!to) {
        let body = { a: toAddress, b: tx.v };
        await Wallets.create([body], { session });
      } else {
        let toBalance = BigInt(to.b) + BigInt(tx.v);
        let a = toAddress;
        let b = "0x" + toBalance.toString(16);

        await Wallets.findOneAndUpdate({ a }, { b }, { session });
      }

      let updated = await Txn.findOneAndUpdate(
        { th: tx.th, st: "P" },
        { st: "C", bn, bh },
        { session }
      );

      if (updated) {
        await Wallets.findOneAndUpdate(
          { a: tx.f },
          { $inc: { cn: 1 } },
          { session }
        );
        txnHashes.push(tx.th);
        totalGasUsed = totalGasUsed + BigInt(tx.gu);
      }
    }

    if (txnHashes.length === 0) throw {};

    const totalGasUsedHex = "0x" + totalGasUsed.toString(16);

    const n = "0x0000000000000000";
    const txs = txnHashes;
    const gu = totalGasUsedHex;
    await Block.create([{ bn, bh, ph, n, ts, txs, m, gu }], { session });

    let miner = await Wallets.findOne({ a: m }, null, { session });

    if (!miner) {
      let body = { a, b: totalGasUsedHex };
      await Wallets.create([body], { session });
    } else {
      let minerNewBalance = BigInt(miner.b) + totalGasUsed;
      let b = "0x" + minerNewBalance.toString(16);
      await Wallets.findOneAndUpdate({ a: m }, { b }, { session });
    }

    responseTransactiCount = txnHashes.length;

    await session.commitTransaction();
    session.endSession();

    try {
      fetch(process.env.SCAN_API + "/rpcinfo?info=block_added").catch(() => {});
    } catch (e) {}
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
  }

  return { txsCount: responseTransactiCount };
}
