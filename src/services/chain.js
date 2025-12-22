import { GAS_LIMIT, MINER_1 } from "../modules/static.js";
import Block from "../schemas/block.js";
import Txn from "../schemas/txn.js";
import crypto from "crypto";
import Wallets from "../schemas/wallets.js";
import { ethers } from "ethers";
import mongoose from "mongoose";

var BLOCK = null;

async function getCBlock() {
  if (BLOCK !== null) return BLOCK;
  let block = await Block.findOne().sort({ bn: -1 });
  if (block) {
    BLOCK = {
      number: block.bn + 1,
      nonce: "0x0000000000000000",
      timestamp: new Date().getTime(),
      prevHash: block.bh,
    };
    return BLOCK;
  }
  if (!block) {
    BLOCK = {
      number: 1,
      nonce: "0x0000000000000000",
      timestamp: new Date().getTime(),
      prevHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    };
    return BLOCK;
  }
}

var IS_MINING = false;

export async function mine() {
  if (IS_MINING) {
    setTimeout(() => mine(), 5000);
    return;
  }
  IS_MINING = true;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cBlock = await getCBlock();

    const txns = await Txn.find({ st: "P" });

    const txnHashes = [];
    var totalGasUsed = BigInt(0);

    const hashRow = JSON.stringify({
      number: cBlock.number,
      prevHash: cBlock.prevHash,
      data: "",
    });

    const blockHash =
      "0x" + crypto.createHash("sha256").update(hashRow).digest("hex");

    for (let tx of txns) {
      let toAddress = ethers.getAddress(tx.t);
      let to = await Wallets.findOne({ a: toAddress });
      if (!to) {
        let body = { a: toAddress, b: tx.v };
        await Wallets.create([body], { session });
      } else {
        let toBalance = BigInt(to.b) + BigInt(tx.v);
        let a = toAddress;
        let b = "0x" + toBalance.toString(16);
        await Wallets.findOneAndUpdate({ a }, { b }, { session });
      }

      let updateResult = await Txn.findOneAndUpdate(
        { th: tx.th, st: "P" },
        { st: "C", bn: cBlock.number, bh: blockHash },
        { session }
      );

      if (updateResult) {
        await Wallets.findOneAndUpdate(
          { a: tx.f },
          { $inc: { cn: 1 } },
          { session }
        );
        txnHashes.push(tx.th);
        totalGasUsed = totalGasUsed + BigInt(tx.gu);
      }
    }

    BLOCK = {
      number: cBlock.number + 1,
      nonce: "0x0000000000000000",
      timestamp: new Date().getTime(),
      prevHash: blockHash,
    };

    const MINER = ethers.getAddress(MINER_1);
    const totalGasUsedHex = "0x" + totalGasUsed.toString(16);

    await Block.create(
      [
        {
          bn: cBlock.number,
          bh: blockHash,
          ph: cBlock.prevHash,
          n: "0x0000000000000000",
          ts: cBlock.timestamp,
          txs: txnHashes,
          m: MINER,
          gu: totalGasUsedHex,
        },
      ],
      { session }
    );

    let miner = await Wallets.findOne({ a: MINER });

    if (!miner) {
      let body = { a: ethers.getAddress(MINER), b: totalGasUsedHex };
      await Wallets.create([body], { session });
    } else {
      let minerNewBalance = BigInt(miner.b) + totalGasUsed;
      let a = ethers.getAddress(MINER);
      let b = "0x" + minerNewBalance.toString(16);
      await Wallets.findOneAndUpdate({ a }, { b }, { session });
    }
    await session.commitTransaction();
    session.endSession();
    try {
      fetch(process.env.SCAN_API + "/rpcinfo?info=block_added");
    } catch (e) {}
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
  }

  IS_MINING = false;
}

export const blockNumber = async () => {
  let block = await Block.findOne().sort({ bn: -1 });
  if (block === null) return "0x00";
  return "0x" + block.bn.toString(16);
};

export function gatBlocks() {
  return Block.find().sort({ ca: -1 }).limit(100);
}

export const getBlockByNumber = async (params) => {
  // TODO: Need to add the filter full or not
  const bn = params?.[0];
  if (!bn || typeof bn !== "string")
    return {
      error: {
        code: -32602,
        message: "invalid argument 0: hex number, expected string",
      },
    };

  var block = null;

  if (bn === "latest") {
    let _block = await Block.findOne().sort({ bn: -1 });
    if (_block !== null) block = _block;
    else
      block = {
        ph: "0x0000000000000000000000000000000000000000000000000000000000000000",
        h: "0x0000000000000000000000000000000000000000000000000000000000000000",
        n: "0x0000000000000000",
        m: "0x0000000000000000000000000000000000000000",
        txs: [],
        gu: "0x00",
        ts: 0,
        bn: 0,
      };
  } else {
    let _block = await Block.findOne({ bn });
    if (_block === null)
      return {
        error: {
          code: -32602,
          message: "invalid argument 0: hex number, expected string",
        },
      };
    block = _block;
  }

  return {
    parentHash: block?.ph,
    sha3Uncles:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    miner: block?.m,
    stateRoot:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    transactionsRoot:
      "0x00000000000000000000000000000000000000000000000000000000000000000",
    receiptsRoot:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    logsBloom:
      "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    difficulty: "0xa0e335",
    totalDifficulty: "0xa0e335",
    size: "0x4aa",
    number: "0x" + block?.bn.toString(16),
    gasLimit: GAS_LIMIT,
    gasUsed: block?.gu,
    timestamp: block?.ts,
    extraData:
      "0x0000000000000000000000000000000000000000000000000000000000000000f90281f90168f84694f628ab7a38e0c190788e110e1bb91ceb356207c6b0afd0ac378c6332d8511ae87f094b7ac3c01ee942cd76cd66dd7fbe36dbb1d26c86cdf05968ae86f548d2cd2a0944a0d7f846942cc43fc90a9f695db73cc26e3737799da431ae88b08ba9b09714c9b8ce6b93fc20dc52e4dde4c440faef90adf3715a6c928b2ade6308094b1c52fb9332d1da6f85df1a4756f84694f59d2d81eb99777e8413ccf2eb6c46e831d37e45b0b35fdeb18dfec3e79ffd37dbdf4346084414e6b341b797774679d2ee1eda86fdc6ee8250bbb8804a2ee14123ab1c486ff8469494ca615b328707daa995bc3efe6aaadd10a1bdf9b08cad43045690cae18ee03457617d87c254110404b6421f5bd0a3b0f635f92f3465c4d1ffa4a126df7d4fee4156fbd985f846940c1d6d1e08d66948777b3ff3b5b4688e4733fdc7b0ac8d7f7a7bf6e03db4a08fe5557fd1835f591faa9639db758de774015eae4e91d4b39d0f1c1513fe534db47e679db0f2b841f04f89761cc3948fd006f92b7be3517f660838a913ff86269f4777b1b5df94d1407e2bda0a47d1f0cf45fdef268bafed4d2b5c3126a37ba43d2ee6d89b57a7f401f8631db860b94228ea334531657f9c1a5996e8cd340803314f5489466d0b4a2ff0707adb53981a5618e3371cadc6f59899f416441601b4816c5339f2067b8ff8979f8b9b23a8850dc0dcafda3c4c9682b450ab1b41b90397a6ac21627e348d7e643b74c823f8631db8608049916d0fc5a7f2ed46a2b0e32d6b9e8e7305613235766fcf47d21017ff32f5ff6b64098255ff2dd989ed75f35197cc0c74a00768be0532523f25bce276dd06ef48e2d2613d910abb55b84a3d9a538fba9940f4644d7f5ed827f5b40480057a880000000000000000",
    mixHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    nonce: block?.n,
    hash: block?.h,
    transactions: block?.txs,
    uncles: [],
  };
};

export const getBlockByHash = async (params) => {
  const blockHash = params?.[0];
  if (!blockHash || typeof blockHash !== "string")
    return {
      error: {
        code: -32602,
        message: "invalid argument 0: hex number, expected string",
      },
    };

  const block = await Block.findOne({ bh: blockHash });
  if (!block) {
    return {
      error: {
        code: -32602,
        message: "invalid argument 0: hex number, expected string",
      },
    };
  }

  return {
    parentHash: block?.ph,
    sha3Uncles:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    miner: block?.m,
    stateRoot:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    transactionsRoot:
      "0x00000000000000000000000000000000000000000000000000000000000000000",
    receiptsRoot:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    logsBloom:
      "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    difficulty: "0xa0e335",
    totalDifficulty: "0xa0e335",
    size: "0x4aa",
    number: "0x" + block?.bn.toString(16),
    gasLimit: GAS_LIMIT,
    gasUsed: block?.gu,
    timestamp: block?.ts,
    extraData:
      "0x0000000000000000000000000000000000000000000000000000000000000000f90281f90168f84694f628ab7a38e0c190788e110e1bb91ceb356207c6b0afd0ac378c6332d8511ae87f094b7ac3c01ee942cd76cd66dd7fbe36dbb1d26c86cdf05968ae86f548d2cd2a0944a0d7f846942cc43fc90a9f695db73cc26e3737799da431ae88b08ba9b09714c9b8ce6b93fc20dc52e4dde4c440faef90adf3715a6c928b2ade6308094b1c52fb9332d1da6f85df1a4756f84694f59d2d81eb99777e8413ccf2eb6c46e831d37e45b0b35fdeb18dfec3e79ffd37dbdf4346084414e6b341b797774679d2ee1eda86fdc6ee8250bbb8804a2ee14123ab1c486ff8469494ca615b328707daa995bc3efe6aaadd10a1bdf9b08cad43045690cae18ee03457617d87c254110404b6421f5bd0a3b0f635f92f3465c4d1ffa4a126df7d4fee4156fbd985f846940c1d6d1e08d66948777b3ff3b5b4688e4733fdc7b0ac8d7f7a7bf6e03db4a08fe5557fd1835f591faa9639db758de774015eae4e91d4b39d0f1c1513fe534db47e679db0f2b841f04f89761cc3948fd006f92b7be3517f660838a913ff86269f4777b1b5df94d1407e2bda0a47d1f0cf45fdef268bafed4d2b5c3126a37ba43d2ee6d89b57a7f401f8631db860b94228ea334531657f9c1a5996e8cd340803314f5489466d0b4a2ff0707adb53981a5618e3371cadc6f59899f416441601b4816c5339f2067b8ff8979f8b9b23a8850dc0dcafda3c4c9682b450ab1b41b90397a6ac21627e348d7e643b74c823f8631db8608049916d0fc5a7f2ed46a2b0e32d6b9e8e7305613235766fcf47d21017ff32f5ff6b64098255ff2dd989ed75f35197cc0c74a00768be0532523f25bce276dd06ef48e2d2613d910abb55b84a3d9a538fba9940f4644d7f5ed827f5b40480057a880000000000000000",
    mixHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    nonce: block?.n,
    hash: block?.h,
    transactions: block?.txs,
    uncles: [],
  };
};
