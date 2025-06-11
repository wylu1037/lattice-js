import { type TransactionType, TransactionTypeCodeRecord, TransactionTypes, ZERO_ADDRESS, ZERO_HASH } from "@/common/constants";
import { type Curve } from "@/common/constants";
import { Address } from "@/common/types/address";
import type { Addr, Hash, UInt64 } from "@/common/types/type.alias";
import { createCrypto } from "@/crypto/crypto";
import { BigNumber } from "@ethersproject/bignumber";
import { arrayify, hexlify, stripZeros } from "@ethersproject/bytes";
import { encode as rlpEncode } from "@ethersproject/rlp";
import { Result, err, ok } from "neverthrow";

export class Transaction {
  number?: number;
  type: TransactionType;
  parentHash?: Hash;
  hub?: Addr[];
  daemonHash?: Hash;
  codeHash?: Hash;
  owner: Addr;
  linker: Addr;
  amount?: UInt64;
  joule?: UInt64;
  difficulty?: UInt64;
  pow?: UInt64;
  proofOfWork?: string;
  payload?: string;
  timestamp?: UInt64;
  code?: string;
  sign?: string;

  constructor(
    number: number,
    type: TransactionType,
    parentHash: Hash,
    hub: Addr[],
    daemonHash: Hash,
    codeHash: Hash,
    owner: Addr,
    linker: Addr,
    amount: UInt64,
    joule: UInt64,
    difficulty: UInt64,
    pow: UInt64,
    proofOfWork: string,
    payload: string,
    timestamp: UInt64,
    code: string,
    sign: string
  ) {
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
      ZERO_HASH, // codeHash
      ZERO_ADDRESS, // owner
      ZERO_ADDRESS, // linker
      0,
      0,
      0,
      0,
      "0x",
      "",
      Date.now(),
      "",
      ""
    );
  }

  /**
   * Validate the transaction
   * @returns The error or null
   */
  validate(): Result<null, Error> {
    if (this.number === undefined) {
      return err(new Error("number is undefined"));
    }
    if (this.type === undefined) {
      return err(new Error("type is undefined"));
    }
    return ok(null);
  }

  /**
   * Sign the transaction
   * @param chainId - The chain id of the transaction
   * @param curve - The curve of the transaction
   * @param privateKey - The private key of the transaction
   * @returns The transaction signature
   */
  public signTx(
    chainId: number,
    curve: Curve,
    privateKey: string
  ): Result<string, Error> {
    const hash = this.rlpEncodeHash(chainId, curve);
    return this.signHash(hash, curve, privateKey);
  }

  /**
   * Sign the hash of the transaction
   * @param hash - The hash of the transaction
   * @param curve - The curve of the transaction
   * @param privateKey - The private key of the transaction
   * @returns The transaction signature
   */
  public signHash(
    hash: Buffer,
    curve: Curve,
    privateKey: string
  ): Result<string, Error> {
    const result = this.doSign(curve, hash, privateKey);
    if (result.isOk()) {
      this.sign = `0x${result.value.toString("hex")}`;
      return ok(this.sign);
    }
    return err(result.error);
  }

  /**
   * Sign the hash of the transaction
   * @param curve - The curve of the transaction
   * @param hash - The hash of the transaction
   * @param privateKey - The private key of the transaction
   * @returns The transaction signature(buffer)
   */
  doSign(
    curve: Curve,
    hash: Buffer,
    privateKey: string
  ): Result<Buffer, Error> {
    try {
      const cryptoService = createCrypto(curve);
      let _privateKey = privateKey;
      if (_privateKey.startsWith("0x")) {
        _privateKey = _privateKey.slice(2);
      }
      const signature = cryptoService.sign(hash, _privateKey);
      return ok(Buffer.from(signature, "hex"));
    } catch (error) {
      return err(error as Error);
    }
  }

  handleNumber(value: number | Uint8Array): Uint8Array {
    return stripZeros(arrayify(BigNumber.from(value)));
  }

  public rlpEncodeHash(chainId: number, curve: Curve): Buffer {
    const cryptoService = createCrypto(curve);
    const encoded = cryptoService.encodeHash(() => {
      const encoded = rlpEncode([
        this.handleNumber(this.number ?? 0),
        hexlify(this.getTypeCode()),
        this.parentHash,
        this.hub,
        this.daemonHash,
        this.codeHash || ZERO_HASH,
        new Address(this.owner).toETH(),
        new Address(this.linker).toETH(),
        this.handleNumber(this.amount ?? 0),
        this.handleNumber(this.joule ?? 0),
        this.handleNumber(0), // difficulty
        this.handleNumber(0), // proofOfWork
        this.payload,
        this.handleNumber(this.timestamp ?? 0),
        arrayify(chainId),
        "0x",
        "0x"
      ]);
      return Buffer.from(encoded.substring(2), "hex");
    });

    return encoded;
  }
}