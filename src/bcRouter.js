import { CHAIN_ID, ESTIMATE_GAS, GAS_PRICE } from "./modules/static.js";
import { blockNumber, getBlockByNumber } from "./services/chain.js";
import {
  getBalance,
  getTransactionByHash,
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
  eth_gasPrice: async () => {
    return { result: GAS_PRICE };
  },
  eth_maxPriorityFeePerGas: async () => {
    return { result: "0x3b9aca00" };
  },
  eth_getTransactionCount: async (params) => {
    return { result: "0x96" };
  },
  eth_estimateGas: async () => {
    return { result: ESTIMATE_GAS };
  },
  eth_sendRawTransaction: async (params) => sendRawTransaction(params),
  eth_getTransactionByHash: async (params) => {
    return { result: await getTransactionByHash(params) };
  },
  eth_getTransactionReceipt: async (params) => {
    return { result: await getTransactionReceipt() };
  },
};

export default async function bcRouter(body) {
  if (Array.isArray(body)) {
    const results = [];
    for (let it of body) {
      const result = await routes[it.method](it.params);
      if (!result) console.log(it.method);
      results.push({ id: it.id, jsonrpc: "2.0", ...result });
    }
    return results;
  } else {
    const result = await routes[body.method](body.params);
    if (!result) console.log(it.method);
    return { id: body.id, jsonrpc: "2.0", ...result };
  }
}

// console.log((25000000000000000000000000000).toString(16));
