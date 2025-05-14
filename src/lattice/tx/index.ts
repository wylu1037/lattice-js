import { TransactionType } from "@/common/constants";
import { Addr, LatestBlock, Transaction, UInt64 } from "@/common/types/index";

/**
 * Builder is a builder for the Transaction class.
 * It is used to build a Transaction object.
 *
 * @param type - The type of the transaction.
 * @returns A Builder object.
 */
interface Builder {
  setBlock(block: LatestBlock): Builder;
  setOwner(owner: Addr): Builder;
  setLinker(linker: Addr): Builder;
  setAmount(amount: UInt64): Builder;
  setJoule(joule: UInt64): Builder;
  setPayload(payload: string): Builder;
  setCode(code: string): Builder;
  build(): Transaction;
}

class TransactionBuilder implements Builder {
  private tx: Transaction;

  constructor(type: TransactionType) {
    this.tx = Transaction.default();
    this.tx.type = type;
  }

  static builder(type: TransactionType): TransactionBuilder {
    return new TransactionBuilder(type);
  }

  setBlock(block: LatestBlock): Builder {
    this.tx.number = block.currentTBlockNumber + 1;
    this.tx.parentHash = block.currentTBlockHash;
    this.tx.daemonHash = block.currentDBlockHash;
    return this;
  }

  setOwner(owner: Addr): Builder {
    this.tx.owner = owner;
    return this;
  }

  setLinker(linker: Addr): Builder {
    this.tx.linker = linker;
    return this;
  }

  setAmount(amount: UInt64): Builder {
    this.tx.amount = amount;
    return this;
  }

  setJoule(joule: UInt64): Builder {
    this.tx.joule = joule;
    return this;
  }

  setPayload(payload: string): Builder {
    this.tx.payload = payload;
    return this;
  }

  setCode(code: string): Builder {
    this.tx.code = code;
    return this;
  }

  build(): Transaction {
    return this.tx;
  }
}

export { TransactionBuilder };