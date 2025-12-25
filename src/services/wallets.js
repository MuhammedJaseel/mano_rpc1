import { Transaction, ethers } from "ethers";
import { GAS_LIMIT, GAS_PRICE, MINER_1 } from "../modules/static.js";
import Wallets from "../schemas/wallets.js";
import Signs from "../schemas/sign.js";
import Txn from "../schemas/txn.js";

import miner from "./miner.js";

async function initAppWallet() {
  // This will automatically create the 'wallets' collection if it doesn't
  const count = await Wallets.countDocuments();
  if (count !== 0) return;
  const wallet = new Wallets({
    a: ethers.getAddress("0x347D5C8Dc99Bd5F70d429F350FB9578fD78A2f35"),
    b: "100000000000000000000000000",
  });
  await wallet.save();
}
initAppWallet();

export const getBalance = async (params) => {
  const a = params?.[0];
  if (!a || typeof a !== "string") return { result: null };
  const wallet = await Wallets.findOne({ a: ethers.getAddress(a) });
  return { result: "0x" + (wallet?.b || "0").toString(16) };
};

export const getTransactionCount = async (params) => {
  const address = params?.[0];
  const type = params?.[1];
  if (!address || typeof address !== "string") return { result: null };
  const wallet = await Wallets.findOne({ a: ethers.getAddress(address) });
  if (!wallet) return { result: "0x0" };
  if (type === "latest") return { result: "0x" + wallet.n.toString(16) };
  return { result: "0x" + (wallet.n + 1).toString(16) };
};

export const sendRawTransaction = async (params) => {
  const sn = params[0];
  const signedTx = Transaction.from(sn);
  if (BigInt(signedTx.value) < 0n) return { result: null };
  if (
    BigInt(signedTx.gasLimit) < BigInt(GAS_LIMIT) ||
    BigInt(signedTx.gasPrice) < BigInt(GAS_PRICE)
  ) {
    return {
      success: false,
      code: -2,
      error: "INSUFFICIENT_FEE",
      message: "Transaction rejected due to insufficient transaction fee.",
      details:
        "The sender's account balance is too low to cover the required fee for this transaction. Please top up your account.",
    };
  }
  await Signs.create({ sn });
  miner(MINER_1);
  return { result: signedTx.hash };
};

export const getTransactionByHash = async (params) => {
  const txHash = params?.[0];
  if (!txHash || typeof txHash !== "string") return { result: null };
  const txn = await Txn.findOne({ th: txHash });

  if (!txn) return { result: null };

  const signedTx = Transaction.from(txn.s);
  const sig = JSON.parse(JSON.stringify(signedTx)).sig;

  return {
    result: {
      hash: txn.th,
      to: txn.t,
      from: txn.f,
      nonce: txn.n,
      value: "0x" + txn.v.toString(16),
      gasPrice: "0x" + txn.gp.toString(16),
      gas: "0x" + txn.gu.toString(16),
      input: "0x",
      v: "0x" + sig.v.toString(16),
      r: sig.r,
      s: sig.s,
      blockHash: txn.bh,
      blockNumber: txn.bn,
      transactionIndex: null,
      type: txn.st === "S" ? "0x1" : "0x0",
    },
  };
};

export const getTransactionReceipt = async (params) => {
  const txHash = params?.[0];

  if (!txHash || typeof txHash !== "string") return { result: null };
  const txn = await Txn.findOne({ th: txHash, st: "C" });
  if (!txn) return { result: null };

  return {
    result: {
      transactionHash: txn.th,
      transactionIndex: "0x0",
      blockHash: txn.bh,
      blockNumber: txn.bn,
      from: txn.f,
      to: txn.t,
      cumulativeGasUsed: "0x" + txn.gu.toString(16),
      gasUsed: "0x" + txn.gu.toString(16),
      contractAddress: null,
      logs: [],
      logsBloom:
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      type: txn.st === "S" ? "0x1" : "0x0",
    },
  };
};
