import { randomBytes as nodeRandomBytes } from "crypto";
import { BigNumber, ContractTransaction } from "ethers";
import { getAddress } from "ethers/lib/utils";

export type BigNumberish = string | BigNumber | number | boolean;

const SeededRNG = require("./seeded-rng");

const GAS_REPORT_MODE = process.env.REPORT_GAS;

let randomBytes: (n: number) => string;
if (GAS_REPORT_MODE) {
  const srng = SeededRNG.create("gas-report");
  randomBytes = srng.randomBytes;
} else {
  randomBytes = (n: number) => nodeRandomBytes(n).toString("hex");
}

// const randomBytes

export const randomHex = (bytes = 32) => `0x${randomBytes(bytes)}`;

export const random128 = () => toBN(randomHex(16));

const hexRegex = /[A-Fa-fx]/g;

export const toHex = (n: BigNumberish, numBytes: number = 0) => {
  const asHexString = BigNumber.isBigNumber(n)
    ? n.toHexString().slice(2)
    : typeof n === "string"
    ? hexRegex.test(n)
      ? n.replace(/0x/, "")
      : (+n).toString(16)
    : (+n).toString(16);
  return `0x${asHexString.padStart(numBytes * 2, "0")}`;
};

export const baseFee = async (tx: ContractTransaction) => {
  const data = tx.data;
  const { gasUsed } = await tx.wait();
  const bytes = toHex(data)
    .slice(2)
    .match(/.{1,2}/g) as string[];
  const numZero = bytes.filter((b) => b === "00").length;
  return (
    gasUsed.toNumber() - (21000 + (numZero * 4 + (bytes.length - numZero) * 16))
  );
};

export const randomBN = (bytes: number = 16) => toBN(randomHex(bytes));

export const toBN = (n: BigNumberish) => BigNumber.from(toHex(n));

export const toAddress = (n: BigNumberish) => getAddress(toHex(n, 20));

export const toKey = (n: BigNumberish) => toHex(n, 32);