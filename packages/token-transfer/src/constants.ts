import { Connection } from "@solana/web3.js";

export const ENDPOINT_URL = "https://api.devnet.solana.com";
export const connection = new Connection(ENDPOINT_URL);
