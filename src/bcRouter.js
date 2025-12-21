import { CHAIN_ID, GAS_LIMIT, GAS_PRICE } from "./modules/static.js";
import {
  blockNumber,
  getBlockByHash,
  getBlockByNumber,
} from "./services/chain.js";
import {
  getBalance,
  getTransactionByHash,
  getTransactionCount,
  getTransactionReceipt,
  sendRawTransaction,
} from "./services/wallets.js";

const routes = {
  eth_chainId: async () => {
    return { result: CHAIN_ID };
  },
  eth_getBalance: async (params) => {
    return { result: await getBalance(params) };
  },
  eth_blockNumber: async (params) => {
    return { result: await blockNumber(params) };
  },
  eth_getBlockByNumber: async (params) => {
    return { result: await getBlockByNumber(params) };
  },
  eth_getBlockByHash: async (params) => {
    return { result: await getBlockByHash(params) };
  },
  eth_gasPrice: async () => {
    return { result: GAS_PRICE };
  },
  eth_maxPriorityFeePerGas: async () => {
    return { result: "0x3b9aca00" };
  },
  eth_getTransactionCount: async (params) => {
    // TODO: Need to impliment quee to avoid duplication nonce
    return { result: await getTransactionCount(params) };
  },
  eth_estimateGas: async () => {
    return { result: GAS_LIMIT };
  },
  eth_sendRawTransaction: async (params) => {
    return sendRawTransaction(params);
  },
  eth_getTransactionByHash: async (params) => {
    return { result: await getTransactionByHash(params) };
  },
  eth_getTransactionReceipt: async (params) => {
    return { result: await getTransactionReceipt(params) };
  },
  eth_call: async () => {
    return { result: "0x" };
  },
  eth_getCode: async () => {
    return { result: "0x" };
  },
  eth_feeHistory: () => {
    return {
      result: {
        oldestBlock: "0x0",
        baseFeePerGas: ["0x3b9aca00"],
        gasUsedRatio: [0.5],
        reward: [["0x3b9aca00"]],
      },
    };
  },
};

export default async function bcRouter(body) {
  if (Array.isArray(body)) {
    const results = [];
    for (let it of body) {
      console.log(it.method);
      const result = await routes[it.method]?.(it.params);
      results.push({ id: it.id, jsonrpc: "2.0", ...result });
    }
    return results;
  } else {
    console.log(body.method);
    const result = await routes[body.method]?.(body.params);
    return { id: body.id, jsonrpc: "2.0", ...result };
  }
}
