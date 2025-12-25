import { GAS_LIMIT } from "../modules/static.js";
import Block from "../schemas/block.js";

const HD16 = "0x0000000000000000";
const HD40 = "0x0000000000000000000000000000000000000000";
const HD64 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const HD512 =
  "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

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
  const em = "invalid argument 0: hex number, expected string";
  const e1 = { code: -32602, message: em };

  const bn = params?.[0];
  if (!bn || typeof bn !== "string") return { error: e1 };

  var block = null;

  if (bn === "latest") {
    let _block = await Block.findOne().sort({ bn: -1 });
    if (_block !== null) block = _block;
    else block = {};
  } else {
    let _block = await Block.findOne({ bn });
    if (_block === null) return { error: e1 };
    block = _block;
  }

  return {
    result: {
      parentHash: block?.ph || HD64,
      sha3Uncles: HD64,
      miner: block?.m || HD40,
      stateRoot: HD64,
      transactionsRoot: HD64,
      receiptsRoot: HD64,
      logsBloom: HD512,
      difficulty: "0xa0e335",
      totalDifficulty: "0xa0e335",
      size: "0x4aa",
      number: "0x" + (block?.bn || 0).toString(16),
      gasLimit: GAS_LIMIT,
      gasUsed: "0x" + (block?.gu || 0).toString(16),
      timestamp: "0x" + (block?.ts || 0).toString(16),
      extraData: "0x",
      mixHash: HD64,
      nonce: block?.n || HD16,
      hash: block?.h,
      transactions: block?.txs || [],
      uncles: [],
    },
  };
};

export const getBlockByHash = async (params) => {
  const em = "invalid argument 0: hex number, expected string";
  const e1 = { code: -32602, message: em };

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
      gasUsed: "0x" + block?.gu.toString(16),
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
