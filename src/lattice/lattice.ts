import {
  Curve,
  HEX_PREFIX,
  TransactionTypes,
  ZERO_ADDRESS
} from "@/common/constants";
import { E, LatestBlock, O, Receipt, Transaction } from "@/common/types/index";
import { newCrypto } from "@/crypto/index";
import {
  AccountLock,
  BlockCache,
  BlockCacheImpl,
  newAccountLock
} from "@/lattice/index";
import {
  HttpClient,
  HttpClientImpl,
  HttpProvider
} from "@/providers/http_provider";
import {
  FixedDelayStrategy,
  RetryHandler,
  type RetryStrategy
} from "@/utils/index";
import { TransactionBuilder } from "./tx";

class Credentials {
  private readonly accountAddress: string;
  private readonly fileKey?: string;
  private readonly passphrase?: string;
  private readonly privateKey?: string;

  constructor(
    accountAddress: string,
    fileKey?: string,
    passphrase?: string,
    privateKey?: string
  ) {
    this.accountAddress = accountAddress;
    this.passphrase = passphrase;
    this.fileKey = fileKey;
    this.privateKey = privateKey;
  }

  static fromFileKey(
    accountAddress: string,
    fileKey: string,
    passphrase: string
  ) {
    return new Credentials(accountAddress, fileKey, passphrase);
  }

  static fromPrivateKey(accountAddress: string, privateKey: string) {
    return new Credentials(accountAddress, undefined, undefined, privateKey);
  }

  getAccountAddress(): string {
    return this.accountAddress;
  }

  getPrivateKey(): string {
    // TODO: check if private key is set, if not, throw an error
    if (!this.privateKey) {
      throw new Error("Private key is not set");
    }
    return this.privateKey;
  }
}

class ChainConfig {
  curve: Curve;
  tokenLess: boolean;

  constructor(curve: Curve, tokenLess: boolean) {
    this.curve = curve;
    this.tokenLess = tokenLess;
  }
}

class NodeConnectionConfig {
  insecure: boolean;
  ip: string;
  httpPort: number;
  wsPort?: number;
  ginHttpPort?: number;
  jwtSecret?: string;
  jwtTokenExpirationDuration: number; // seconds

  constructor(
    ip: string,
    httpPort: number,
    wsPort?: number,
    ginHttpPort?: number,
    jwtSecret?: string,
    jwtTokenExpirationDuration = 6 * 60 * 60, // 6 hours
    insecure = true
  ) {
    this.insecure = insecure;
    this.ip = ip;
    this.httpPort = httpPort;
    this.wsPort = wsPort;
    this.ginHttpPort = ginHttpPort;
    this.jwtSecret = jwtSecret;
    this.jwtTokenExpirationDuration = jwtTokenExpirationDuration;
  }
}

class Options {
  options: Record<string, any>;

  constructor(options: Record<string, any>) {
    this.options = options;
  }

  get(key: string) {
    return this.options[key];
  }
}

class LatticeClient {
  private readonly httpClient: HttpClient;
  private readonly chainConfig: ChainConfig;
  private readonly nodeConnectionConfig: NodeConnectionConfig;
  private readonly options: Options;
  private readonly accountLock: AccountLock;
  private readonly blockCache: BlockCache;

  constructor(
    chainConfig: ChainConfig,
    nodeConnectionConfig: NodeConnectionConfig,
    options?: Options,
    accountLock?: AccountLock,
    blockCache?: BlockCache
  ) {
    this.httpClient = new HttpClientImpl(
      new HttpProvider(
        `${nodeConnectionConfig.insecure ? "http" : "https"}://${nodeConnectionConfig.ip}:${nodeConnectionConfig.httpPort}`
      )
    );
    this.chainConfig = chainConfig;
    this.nodeConnectionConfig = nodeConnectionConfig;
    this.options = options ?? new Options({});
    this.accountLock = accountLock ?? newAccountLock();
    this.blockCache =
      blockCache ??
      new BlockCacheImpl(
        {
          backend: "memory"
        },
        10
      );
  }

  /**
   * Wait for receipt
   * @param chainId The chain id
   * @param hash The hash
   * @param retryStrategy The retry strategy, default is FixedDelayStrategy.default
   * @param retries The number of retries, default is 10
   * @returns E.Either<Receipt, Error>, left is the receipt, right is the error
   */
  async waitReceipt(
    chainId: number,
    hash: string,
    retryStrategy: RetryStrategy = FixedDelayStrategy.default,
    retries = 10
  ): Promise<E.Either<Receipt, Error>> {
    const retryHandler = new RetryHandler<Receipt>(retryStrategy, retries);
    const receipt = await retryHandler.execute(async () => {
      return await this.httpClient.getReceipt(chainId, hash);
    });
    return E.left(receipt);
  }

  private async handleTransaction(
    chainId: number,
    credentials: Credentials,
    transaction: Transaction,
    block: LatestBlock
  ) {
    const option = transaction.signTx(
      chainId,
      this.chainConfig.curve,
      credentials.getPrivateKey()
    );
    if (O.isSome(option)) {
      return E.right(option.value);
    }

    const hash = await this.httpClient.sendTransaction(chainId, transaction);

    block.currentTBlockNumber = block.currentTBlockNumber + 1;
    block.currentTBlockHash = hash;
    this.blockCache.putBlock(chainId, credentials.getAccountAddress(), block);

    return E.left(hash);
  }

  /**
   * Transfer
   * @param credentials Your credentials
   * @param chainId The chain id
   * @param linker The linker address
   * @param payload The payload, should be a hex string
   * @param amount The amount, default is 0
   * @param joule The joule, default is 0
   * @returns E.Either<string, Error>, left is the hash, right is the error
   */
  async transfer(
    credentials: Credentials,
    chainId: number,
    linker: string,
    payload: string,
    amount = 0,
    joule = 0
  ): Promise<E.Either<string, Error>> {
    const result = await this.accountLock.withLock<E.Either<string, Error>>(
      chainId,
      credentials.getAccountAddress(),
      async () => {
        const cachedResult = await this.blockCache.getBlock(
          chainId,
          credentials.getAccountAddress(),
          async (chainId, address) => {
            return await this.httpClient.getLatestBlock(chainId, address);
          }
        );
        if (E.isRight(cachedResult)) {
          return E.right(cachedResult.right);
        }

        const block = cachedResult.left;
        const tx = TransactionBuilder.builder(TransactionTypes.Send)
          .setBlock(block)
          .setOwner(credentials.getAccountAddress())
          .setLinker(linker)
          .setPayload(payload)
          .setAmount(amount)
          .setJoule(joule)
          .build();
        return await this.handleTransaction(chainId, credentials, tx, block);
      }
    );

    return result;
  }

  /**
   * Transfer and wait for receipt
   * @param credentials Your credentials
   * @param chainId The chain id
   * @param linker The linker address
   * @param payload The payload, should be a hex string
   * @param amount The amount, default is 0
   * @param joule The joule, default is 0
   * @param retryStrategy The retry strategy, default is FixedDelayStrategy.default
   * @param retries The number of retries, default is 10
   * @returns E.Either<Receipt, Error>, left is the receipt, right is the error
   */
  async transferWaitReceipt(
    credentials: Credentials,
    chainId: number,
    linker: string,
    payload: string,
    amount = 0,
    joule = 0,
    retryStrategy: RetryStrategy = FixedDelayStrategy.default,
    retries = 10
  ): Promise<E.Either<Receipt, Error>> {
    const result = await this.transfer(
      credentials,
      chainId,
      linker,
      payload,
      amount,
      joule
    );
    if (E.isRight(result)) {
      return E.right(result.right);
    }
    const hash = result.left;
    return await this.waitReceipt(chainId, hash, retryStrategy, retries);
  }

  /**
   * Deploy contract
   * @param credentials Your credentials
   * @param chainId The chain id
   * @param code The code, should be a hex string
   * @param payload The payload, should be a hex string, default is 0x
   * @param amount The amount, default is 0
   * @param joule The joule, default is 0
   * @returns E.Either<string, Error>, left is the hash, right is the error
   */
  async deployContract(
    credentials: Credentials,
    chainId: number,
    code: string,
    payload = HEX_PREFIX,
    amount = 0,
    joule = 0
  ): Promise<E.Either<string, Error>> {
    const result = await this.accountLock.withLock<E.Either<string, Error>>(
      chainId,
      credentials.getAccountAddress(),
      async () => {
        const cachedResult = await this.blockCache.getBlock(
          chainId,
          credentials.getAccountAddress(),
          async (chainId, address) => {
            return await this.httpClient.getLatestBlock(chainId, address);
          }
        );
        if (E.isRight(cachedResult)) {
          return E.right(cachedResult.right);
        }

        const block = cachedResult.left;
        const tx = TransactionBuilder.builder(TransactionTypes.DeployContract)
          .setBlock(block)
          .setOwner(credentials.getAccountAddress())
          .setLinker(ZERO_ADDRESS)
          .setCode(code)
          .setPayload(payload)
          .setAmount(amount)
          .setJoule(joule)
          .build();

        const codeHash = newCrypto(this.chainConfig.curve).hash(
          Buffer.from(code.startsWith(HEX_PREFIX) ? code.slice(2) : code, "hex")
        );
        tx.codeHash = `0x${codeHash.toString("hex")}`;
        return await this.handleTransaction(chainId, credentials, tx, block);
      }
    );
    return result;
  }

  /**
   * Deploy contract and wait for receipt
   * @param credentials Your credentials
   * @param chainId The chain id
   * @param code The code, should be a hex string
   * @param payload The payload, should be a hex string, default is 0x
   * @param amount The amount, default is 0
   * @param joule The joule, default is 0
   * @param retryStrategy The retry strategy, default is FixedDelayStrategy.default
   * @param retries The number of retries, default is 10
   * @returns E.Either<Receipt, Error>, left is the receipt, right is the error
   */
  async deployContractWaitReceipt(
    credentials: Credentials,
    chainId: number,
    code: string,
    payload = HEX_PREFIX,
    amount = 0,
    joule = 0,
    retryStrategy: RetryStrategy = FixedDelayStrategy.default,
    retries = 10
  ): Promise<E.Either<Receipt, Error>> {
    const result = await this.deployContract(
      credentials,
      chainId,
      code,
      payload,
      amount,
      joule
    );
    if (E.isRight(result)) {
      return E.right(result.right);
    }
    const hash = result.left;
    return await this.waitReceipt(chainId, hash, retryStrategy, retries);
  }

  /**
   * Call contract
   * @param credentials Your credentials
   * @param chainId The chain id
   * @param contractAddress The contract address
   * @param code The code, should be a hex string
   * @param payload The payload, should be a hex string, default is 0x
   * @param amount The amount, default is 0
   * @param joule The joule, default is 0
   * @returns E.Either<string, Error>, left is the hash, right is the error
   */
  async callContract(
    credentials: Credentials,
    chainId: number,
    contractAddress: string,
    code: string,
    payload = HEX_PREFIX,
    amount = 0,
    joule = 0
  ): Promise<E.Either<string, Error>> {
    const result = await this.accountLock.withLock<E.Either<string, Error>>(
      chainId,
      credentials.getAccountAddress(),
      async () => {
        const cachedResult = await this.blockCache.getBlock(
          chainId,
          credentials.getAccountAddress(),
          async (chainId, address) => {
            return await this.httpClient.getLatestBlock(chainId, address);
          }
        );
        if (E.isRight(cachedResult)) {
          return E.right(cachedResult.right);
        }

        const block = cachedResult.left;
        const tx = TransactionBuilder.builder(TransactionTypes.DeployContract)
          .setBlock(block)
          .setOwner(credentials.getAccountAddress())
          .setLinker(contractAddress)
          .setCode(code)
          .setPayload(payload)
          .setAmount(amount)
          .setJoule(joule)
          .build();
        const codeHash = newCrypto(this.chainConfig.curve).hash(
          Buffer.from(code.startsWith(HEX_PREFIX) ? code.slice(2) : code, "hex")
        );
        tx.codeHash = `0x${codeHash.toString("hex")}`;
        return await this.handleTransaction(chainId, credentials, tx, block);
      }
    );
    return result;
  }

  /**
   * Call contract and wait for receipt
   * @param credentials Your credentials
   * @param chainId The chain id
   * @param contractAddress The contract address
   * @param code The code, should be a hex string
   * @param payload The payload, should be a hex string, default is 0x
   * @param amount The amount, default is 0
   * @param joule The joule, default is 0
   * @returns E.Either<Receipt, Error>, left is the receipt, right is the error
   */
  async callContractWaitReceipt(
    credentials: Credentials,
    chainId: number,
    contractAddress: string,
    code: string,
    payload = HEX_PREFIX,
    amount = 0,
    joule = 0,
    retryStrategy: RetryStrategy = FixedDelayStrategy.default,
    retries = 10
  ): Promise<E.Either<Receipt, Error>> {
    const result = await this.callContract(
      credentials,
      chainId,
      contractAddress,
      code,
      payload,
      amount,
      joule
    );
    if (E.isRight(result)) {
      return E.right(result.right);
    }

    const hash = result.left;
    return await this.waitReceipt(chainId, hash, retryStrategy, retries);
  }
}

export {
  LatticeClient,
  Credentials,
  ChainConfig,
  NodeConnectionConfig,
  Options
};