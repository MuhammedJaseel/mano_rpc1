import Decimal from "decimal.js";
import { Transaction, ethers } from "ethers";
import { GAS_LIMIT, GAS_PRICE } from "../modules/static.js";
import { mine } from "./chain.js";
import Wallets from "../schemas/wallets.js";
import Txn from "../schemas/txn.js";
import mongoose from "mongoose";

async function initAppWallet() {
  // This will automatically create the 'wallets' collection if it doesn't
  const count = await Wallets.countDocuments();
  if (count !== 0) return;
  const wallet = new Wallets({
    a: ethers.getAddress("0x347D5C8Dc99Bd5F70d429F350FB9578fD78A2f35"),
    b: "0x52b7d2dcc80cd2e4000000",
  });
  await wallet.save();
}
initAppWallet();

async function _findWallet(address) {
  if (!address || typeof address !== "string") return null;
  return Wallets.findOne({ a: ethers.getAddress(address) });
}

export const getBalance = async (params) => {
  const a = params?.[0];
  const wallet = await _findWallet(a);
  return wallet?.b || "0x0";
};

export const getTransactionCount = async (params) => {
  const address = params?.[0];
  const type = params?.[1];
  if (!address || typeof address !== "string") return null;
  const wallet = await Wallets.findOne({ a: ethers.getAddress(address) });
  if (!wallet) return null;
  if (type === "pending") return "0x" + (wallet.n + 1).toString(16);
  if (type === "latest") return "0x" + wallet.cn.toString(16);
  return null;
};

export const sendRawTransaction = async (params) => {
  const sign = params[0];
  const signedTx = Transaction.from(sign);

  const txValue = BigInt(signedTx.value);
  const txGas = BigInt(GAS_PRICE) * BigInt(GAS_LIMIT);

  const from = await _findWallet(signedTx.from);

  var fromBalance = BigInt(from?.b || "0x0");

  if (fromBalance < txValue + txGas) {
    return {
      error: { code: -32603, message: "insufficient funds for execution" },
    };
  }

  fromBalance -= txValue + txGas;
  const b = "0x" + fromBalance.toString(16);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updateResult = await Wallets.findOneAndUpdate(
      { a: ethers.getAddress(from.a), n: signedTx.nonce - 1 },
      { b, n: from.n + 1 },
      { session }
    );

    if (!updateResult) throw {};

    await Txn.create(
      [
        {
          th: signedTx.hash,
          s: sign,
          f: signedTx.from,
          t: signedTx.to,
          v: "0x" + signedTx.value.toString(16),
          n: signedTx.nonce,
          gp: GAS_PRICE,
          gl: GAS_LIMIT,
          gu: "0x" + txGas.toString(16),
          bn: null,
          bh: null,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    try {
      fetch(process.env.SCAN_API + "/rpcinfo?info=txn_added");
    } catch (e) {}
    mine();
    return { result: signedTx.hash };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return {
      error: {
        code: -32000,
        message: "nonce too low",
      },
    };
  }
};

export const getTransactionByHash = async (params) => {
  const txHash = params?.[0];
  if (!txHash || typeof txHash !== "string") return null;
  const txn = await Txn.findOne({ th: txHash });
  if (!txn) return null;

  const signedTx = Transaction.from(txn.s);

  const sig = JSON.parse(JSON.stringify(signedTx)).sig;

  return {
    hash: txn.th,
    to: txn.t,
    from: txn.f,
    nonce: txn.n,
    value: txn.v,
    gasPrice: txn.gp,
    gas: txn.gu,
    input: "0x",
    v: "0x" + sig.v.toString(16),
    r: sig.r,
    s: sig.s,
    blockHash: txn.bh,
    blockNumber: txn.bn,
    transactionIndex: null,
    type: "0x0",
  };
};

export const getTransactionReceipt = async (params) => {
  const txHash = params?.[0];
  if (!txHash || typeof txHash !== "string") return null;
  const txn = await Txn.findOne({ th: txHash, st: "C" });

  if (!txn) return null;
  return {
    transactionHash: txn.th,
    transactionIndex: "0x0",
    blockHash: txn.bh,
    blockNumber: txn.bn,
    from: txn.f,
    to: txn.t,
    cumulativeGasUsed: txn.gu,
    gasUsed: txn.gu,
    contractAddress: null,
    logs: [],
    logsBloom:
      "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    status: "0x1",
  };
};
