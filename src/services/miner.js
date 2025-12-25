import Block from "../schemas/block.js";
import Txn from "../schemas/txn.js";
import crypto from "crypto";
import Wallets from "../schemas/wallets.js";
import { ethers, Transaction } from "ethers";
import mongoose from "mongoose";
import Signs from "../schemas/sign.js";

const D8 = "00000000";
const DH64 = "0x" + D8 + D8 + D8 + D8 + D8 + D8 + D8 + D8;

export default async function miner(minerAddress) {
  let result = null;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const signs = await Signs.find({ st: "I" }, null, { session });
    if (signs.length === 0) throw {};

    let newBl = await Block.findOne(null, null, { session }).sort({ bn: -1 });
    if (newBl) newBl = { bn: newBl.bn + 1, ph: newBl.bh };
    else newBl = { bn: 1, ph: DH64 };

    const n = "0x0000000000000000";
    const bn = newBl.bn;
    const ph = newBl.ph;
    const m = ethers.getAddress(minerAddress);
    const hashRow = JSON.stringify({ number: bn, prevHash: ph, data: "" });
    const bh = "0x" + crypto.createHash("sha256").update(hashRow).digest("hex");

    const txs = [];
    var totalGas = BigInt(0);

    for (let it of signs) {
      const sign = it.sn;
      const signedTx = Transaction.from(sign);
      const value = signedTx.value;
      const fa = ethers.getAddress(signedTx.from);
      const ta = ethers.getAddress(signedTx.to);
      const txGas = signedTx.gasPrice * signedTx.gasLimit;

      const from = await Wallets.findOne({ a: fa }, null, { session });
      var fromB = BigInt(from?.b || "-1");

      let failed = fromB < value + txGas;

      if (!failed) {
        let b = String(fromB - (value + txGas));
        await Wallets.findOneAndUpdate(
          { a: fa, n: signedTx.nonce - 1, b: fromB },
          { b, n: from.n + 1 },
          { session }
        );
        let to = await Wallets.findOne({ a: ta }, null, { session });
        if (to) {
          let b = String(BigInt(to.b) + value);
          await Wallets.findOneAndUpdate(
            { a: ta, b: to.b },
            { b },
            { session }
          );
        } else await Wallets.create([{ a: ta, b: value }], { session });

        txs.push(signedTx.hash);
        totalGas = totalGas + txGas;
      }

      let st = failed ? "F" : "S";
      const newTxn = [
        {
          th: signedTx.hash,
          f: fa,
          t: ta,
          v: String(value),
          tn: signedTx.nonce,
          gp: signedTx.gasPrice,
          gl: signedTx.gasLimit,
          gu: String(txGas),
          bn: bn,
          bh: bh,
          s: sign,
          st,
        },
      ];
      await Txn.create(newTxn, { session });
      await Signs.findByIdAndUpdate(it._id, { st }, { session });
    }

    const gu = String(totalGas);
    await Block.create([{ bn, bh, ph, n, txs, m, gu }], { session });

    let miner = await Wallets.findOne({ a: m }, null, { session });
    if (!miner) {
      await Wallets.create([{ a: m, b: String(totalGas) }], { session });
    } else {
      let b = String(BigInt(miner.b) + totalGas);
      await Wallets.findOneAndUpdate({ a: m }, { b }, { session });
    }
    await session.commitTransaction();
    session.endSession();
    result = { bn, bh, txs };
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
  }
  return result;
}
