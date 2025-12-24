import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 4501;

export const MONGO_URI = process.env.MONGO_URI;

export const MONGO_URI_DEV = process.env.MONGO_URI_DEV;

export const CHAIN_ID = process.env.CHAIN_ID;

export const GAS_PRICE = process.env.GAS_PRICE;

export const GAS_LIMIT = process.env.GAS_LIMIT;

export const MINER_1 = process.env.MINER_1;

export const MINER_2 = process.env.MINER_2;
