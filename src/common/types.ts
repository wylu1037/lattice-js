// latest block info
export interface LatestBlock {
  // latest transaction height associated with account
  currentTBlockNumber: number;
  // latest transaction block hash associated with account
  currentTBlockHash: string;
  // latest daemon block hash associated with account
  currentDBlockHash: string;
}

export interface Transaction {
  number: number;
  type: string;
  parentHash: string;
  hub: string[];
  daemonHash: string;
  owner: string;
  linker: string;
  amount: string;
  joule: string;
  difficulty: string;
  pow: string;
  proofOfWork: string;
  payload: string;
  timestamp: number;
  code: string;
  codeHash: string;
  sign: string;
  hash: string;
}
