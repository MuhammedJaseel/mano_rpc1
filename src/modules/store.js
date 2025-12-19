import { ethers } from "ethers";
import Wallets from "../schemas/wallets.js";
import Block from "../schemas/block.js";

const wallets = [
  {
    a: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    b: "0xa18f07d736b90be550000000",
  },
  {
    a: "0x347D5C8Dc99Bd5F70d429F350FB9578fD78A2f35",
    b: "0xa18f07d736b90be550000000",
  },
];

export const hashes = [
  { h: "0x42f5c0d28fc07b9d4c15e186b2f2c2ab4c3492e30a463e6c0c0a5afe2272e312" },
];

export const blocks = [
  {
    n: 0,
    h: "0xaf989710fe1d7a9ac052803be39aa3dd5a7286bc01deef4f520d1a32d33d2bcc",
  },
];

// //////////////////////////////// Blocks /////////////////////////////////////

export function gatBlocks() {
  return Block.find().sort({ ca: -1 }).limit(100);
}

export function findCBlock() {
  return Block.findOne().sort({ ca: -1 });
}

createBlock();

export async function createBlock() {
  let cBlock = await findCBlock();
  if (!cBlock)
    cBlock = {
      h: "0x0000000000000000000000000000000000000000000000000000000000000000",
      n: -1,
    };

  const data = { hash: cBlock.h, number: cBlock.n + 1, timestamp: Date.now() };

  const dataBytes = ethers.toUtf8Bytes(JSON.stringify(data));
  const hash = ethers.keccak256(dataBytes);
  // console.log(hash);

  // return Block.create({});
}

// //////////////////////////////// Wallets /////////////////////////////////////

export async function gatAllWallets() {
  try {
    const count = await Wallets.countDocuments({});
    if (count === 0) {
      await Wallets.insertMany(wallets);
    }
  } catch (err) {
    console.error("gatAllWallets error:", err);
  }
  return Wallets.find();
}

export async function findWallet(address) {
  if (!address || typeof address !== "string") return null;
  return Wallets.findOne({ a: ethers.getAddress(address) });
}

export function createWallet(body) {
  return Wallets.create(body);
}

export function updateWallet(a, body = {}) {
  if (!a || typeof a !== "string") return null;
  return Wallets.findOneAndUpdate({ a: ethers.getAddress(a) }, body);
}

export function findHash(hash) {
  if (!hash || typeof hash !== "string") return null;
  const h = hash.toLowerCase();
  return hashes.find((x) => x.h && x.h.toLowerCase() === h) || null;
}

export function updateHash(hash, updates = {}) {
  if (!hash || typeof hash !== "string") return null;
  const h = hash.toLowerCase();
  const i = hashes.findIndex((x) => x.h && x.h.toLowerCase() === h);
  if (i === -1) return null;
  hashes[i] = { ...hashes[i], ...updates };
  return hashes[i];
}

export function findBlockByNumber(number) {
  if (typeof number !== "number") return null;
  return blocks.find((b) => b.n === number) || null;
}

export function findBlockByHash(hash) {
  if (!hash || typeof hash !== "string") return null;
  const h = hash.toLowerCase();
  return blocks.find((b) => b.h && b.h.toLowerCase() === h) || null;
}

export function updateBlockByNumber(number, updates = {}) {
  if (typeof number !== "number") return null;
  const i = blocks.findIndex((b) => b.n === number);
  if (i === -1) return null;
  blocks[i] = { ...blocks[i], ...updates };
  return blocks[i];
}

export function updateBlockByHash(hash, updates = {}) {
  if (!hash || typeof hash !== "string") return null;
  const h = hash.toLowerCase();
  const i = blocks.findIndex((b) => b.h && b.h.toLowerCase() === h);
  if (i === -1) return null;
  blocks[i] = { ...blocks[i], ...updates };
  return blocks[i];
}
