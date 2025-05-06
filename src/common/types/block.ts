import { ZERO_HASH } from "../constants";
import { Receipt } from "./types";

export class LatestBlock {
  currentTBlockNumber: number;
  currentTBlockHash: string;
  currentDBlockHash: string;

  constructor(
    currentTBlockNumber: number,
    currentTBlockHash: string,
    currentDBlockHash: string
  ) {
    this.currentTBlockNumber = currentTBlockNumber;
    this.currentTBlockHash = currentTBlockHash;
    this.currentDBlockHash = currentDBlockHash;
  }

  /**
   * Create an empty latest block
   *
   * @returns The empty latest block
   */
  public static emptyBlock(): LatestBlock {
    return new LatestBlock(0, ZERO_HASH, ZERO_HASH);
  }
}

export class Anchor {
  number: number;
  hash: string;
  owner: string;

  constructor(number: number, hash: string, owner: string) {
    this.number = number;
    this.hash = hash;
    this.owner = owner;
  }
}

export class DBlock {
  hash: string;
  parentHash: string;
  ledgerHash: string;
  receiptsHash: string;
  coinbase: string;
  signer: string;
  contracts: string[];
  difficulty: number;
  number: number;
  lastedDBNumber: number;
  extra: string;
  reward: number;
  pow: number;
  timestamp: number;
  size: number;
  td: number;
  ttd: number;
  version: number;
  txHashList: string[] = [];
  receipts: Receipt[];
  anchors: Anchor[];

  constructor(
    hash: string,
    parentHash: string,
    ledgerHash: string,
    receiptsHash: string,
    coinbase: string,
    signer: string,
    contracts: string[],
    difficulty: number,
    number: number,
    lastedDBNumber: number,
    extra: string,
    reward: number,
    pow: number,
    timestamp: number,
    size: number,
    td: number,
    ttd: number,
    version: number,
    txHashList: string[],
    receipts: Receipt[],
    anchors: Anchor[]
  ) {
    this.hash = hash;
    this.parentHash = parentHash;
    this.ledgerHash = ledgerHash;
    this.receiptsHash = receiptsHash;
    this.coinbase = coinbase;
    this.signer = signer;
    this.contracts = contracts;
    this.difficulty = difficulty;
    this.number = number;
    this.lastedDBNumber = lastedDBNumber;
    this.extra = extra;
    this.reward = reward;
    this.pow = pow;
    this.timestamp = timestamp;
    this.size = size;
    this.td = td;
    this.ttd = ttd;
    this.version = version;
    this.txHashList = txHashList;
    this.receipts = receipts;
    this.anchors = anchors;
  }
}