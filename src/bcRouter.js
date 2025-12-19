import { blockNumber, chainId, getBlockByNumber } from "./services/chain.js";
import {
  getBalance,
  getTransactionByHash,
  getTransactionReceipt,
  sendRawTransaction,
} from "./services/wallets.js";

const routes = {
  eth_chainId: async (params) => {
    return { result: await chainId(params) };
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
  eth_gasPrice: async (params) => {
    return { result: "0x2e8e3416ed6f8" };
  },
  eth_maxPriorityFeePerGas: async (params) => {
    return { result: "0x3b9aca00" };
  },
  eth_getTransactionCount: async (params) => {
    return { result: "0x96" };
  },
  eth_estimateGas: async (params) => {
    return { result: "0x5208" };
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
