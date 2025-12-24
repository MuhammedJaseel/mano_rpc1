import { GAS_LIMIT, MINER_1 } from "../modules/static.js";
import Block from "../schemas/block.js";
import mine from "./mine.js";

const HD16 = "0x0000000000000000";
const HD40 = "0x0000000000000000000000000000000000000000";
const HD64 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const HD512 =
  "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

var IS_MINING = false;

export async function mineTransactins() {
  if (IS_MINING) {
    // setTimeout(() => mineTransactins(), 5000);
    return { loading: true, succes: false };
  }
  IS_MINING = true;
  const mined = await mine(MINER_1);
  IS_MINING = false;
  return { ...mined };
}

export const blockNumber = async () => {
  let block = await Block.findOne().sort({ bn: -1 });
  if (block === null) return { result: "0x00" };
  return { result: "0x" + block.bn.toString(16) };
};

export function gatBlocks() {
  return Block.find().sort({ ca: -1 }).limit(100);
}

export const getBlockByNumber = async (params) => {
  // TODO: Need to add the filter full or
  const e1 = {
    code: -32602,
    message: "invalid argument 0: hex number, expected string",
  };

  const bn = params?.[0];
  if (!bn || typeof bn !== "string") return { error: e1 };

  var block = null;

  if (bn === "latest") {
    let _block = await Block.findOne().sort({ bn: -1 });
    if (_block !== null) block = _block;
    else
      block = {
        ph: HD64,
        h: HD64,
        n: HD16,
        m: HD40,
        txs: [],
        gu: "0x00",
        ts: 0,
        bn: 0,
      };
  } else {
    let _block = await Block.findOne({ bn });
    if (_block === null) return { error: e1 };
    block = _block;
  }

  return {
    result: {
      parentHash: block?.ph,
      sha3Uncles: HD64,
      miner: block?.m,
      stateRoot: HD64,
      transactionsRoot: HD64,
      receiptsRoot: HD64,
      logsBloom: HD512,
      difficulty: "0xa0e335",
      totalDifficulty: "0xa0e335",
      size: "0x4aa",
      number: "0x" + block?.bn.toString(16),
      gasLimit: GAS_LIMIT,
      gasUsed: block?.gu,
      timestamp: block?.ts,
      extraData: "0x",
      mixHash: HD64,
      nonce: block?.n,
      hash: block?.h,
      transactions: block?.txs,
      uncles: [],
    },
  };
};

export const getBlockByHash = async (params) => {
  const e1 = {
    code: -32602,
    message: "invalid argument 0: hex number, expected string",
  };

  const blockHash = params?.[0];
  if (!blockHash || typeof blockHash !== "string") return { error: e1 };

  const block = await Block.findOne({ bh: blockHash });
  if (!block) return { error: e1 };

  return {
    result: {
      parentHash: block?.ph,
      sha3Uncles: HD64,
      miner: block?.m,
      stateRoot: HD64,
      transactionsRoot: HD64,
      receiptsRoot: HD64,
      logsBloom: HD512,
      difficulty: "0xa0e335",
      totalDifficulty: "0xa0e335",
      size: "0x4aa",
      number: "0x" + block?.bn.toString(16),
      gasLimit: GAS_LIMIT,
      gasUsed: block?.gu,
      timestamp: block?.ts,
      extraData: "0x",
      mixHash: HD64,
      nonce: block?.n,
      hash: block?.h,
      transactions: block?.txs,
      uncles: [],
    },
  };
};
