import { Address as Addr } from "@/common/address";
import { type TransactionType, TransactionTypeCodeRecord, TransactionTypes } from "@/common/constants";
import { E, O } from "@/common/types/index";
import type { Address, Curve, Hash, UInt64 } from "@/common/types/type.alias";
import { newCrypto } from "@/crypto/crypto";
import { encode as rlpEncode } from "@ethersproject/rlp";
export class Transaction {
  number?: number;
  type: TransactionType;
  parentHash?: Hash;
  hub?: Address[];
  daemonHash?: Hash;
  codeHash?: Hash;
  owner?: Address;
  linker?: Address;
  amount?: UInt64;
  joule?: UInt64;
  difficulty?: UInt64;
  pow?: UInt64;
  proofOfWork?: UInt64;
  payload?: string;
  timestamp?: UInt64;
  code?: string;
  sign?: string;

  constructor(number: number, type: TransactionType, parentHash: Hash, hub: Address[], daemonHash: Hash, codeHash: Hash, owner: Address, linker: Address, amount: UInt64, joule: UInt64, difficulty: UInt64, pow: UInt64, proofOfWork: UInt64, payload: string, timestamp: UInt64, code: string, sign: string) {
    this.number = number;
    this.type = type;
    this.parentHash = parentHash;
    this.hub = hub;
    this.daemonHash = daemonHash;
    this.codeHash = codeHash;
    this.owner = owner;
    this.linker = linker;
    this.amount = amount;
    this.joule = joule;
    this.difficulty = difficulty;
    this.pow = pow;
    this.proofOfWork = proofOfWork;
    this.payload = payload;
    this.timestamp = timestamp;
    this.code = code;
    this.sign = sign;
  }

  getTypeCode(): number {
    return TransactionTypeCodeRecord[this.type];
  }

  static default(): Transaction {
    return new Transaction(
      0,
      TransactionTypes.Send,
      "",
      [],
      "",
      "",
      "",
      "",
      BigInt(0),
      BigInt(0),
      BigInt(0),
      BigInt(0),
      BigInt(0),
      "",
      BigInt(0),
      "",
      "",
    );
  }

  validate(): Error | null {
    if (this.number === undefined) {
      return new Error("number is undefined");
    }
    if (this.type === undefined) {
      return new Error("type is undefined");
    }
    return null;
  }

  /**
   * Sign the transaction
   * @param chainId - The chain id of the transaction
   * @param curve - The curve of the transaction
   * @param privateKey - The private key of the transaction
   * @returns The signed transaction
   */
  public signTx(chainId: number, curve: Curve, privateKey: string): O.Option<Error> {
      const hash = this.rlpEncodeHash(chainId, curve);
      return this.signHash(hash, curve, privateKey);
  }

  /**
   * Sign the hash of the transaction
   * @param hash - The hash of the transaction
   * @param curve - The curve of the transaction
   * @param privateKey - The private key of the transaction
   * @returns The signed transaction
   */
  public signHash(hash: Buffer, curve: Curve, privateKey: string): O.Option<Error> {
      const result = this.doSign(curve, hash, privateKey);
      if (E.isRight(result)) {
          return O.some(result.right);
      }
      this.sign = `0x${result.left.toString("hex")}`;
      return O.none;
  }

  doSign(curve: Curve, hash: Buffer, privateKey: string): E.Either<Buffer, Error> {
      try {
          const cryptoService = newCrypto(curve);
          const signature = cryptoService.sign(hash, privateKey);
          return E.left(Buffer.from(signature, "hex"));
      } catch (error) {
          return E.right(error as Error);
      }
  }

  public rlpEncodeHash(chainId: number, curve: Curve): Buffer {
    const cryptoService = newCrypto(curve);
    const encoded = cryptoService.encodeHash(() => {
      const encoded = rlpEncode(
         [
            this.number,
            this.getTypeCode(),
            this.parentHash,
            this.hub, 
            this.daemonHash,
            this.codeHash,
            new Addr(this.owner ?? "").toETH(),
            new Addr(this.linker ?? "").toETH(),
            this.amount,
            this.joule, 
            this.difficulty, 
            this.proofOfWork, 
            this.payload, 
            this.timestamp,
            chainId, 
            0,
            0
          ]
      );
      return Buffer.from(encoded, "hex");
    });

    return encoded;
  }
}