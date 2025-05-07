import { Curve, TransactionTypes } from "@/common/constants";
import { E, O, Receipt } from "@/common/types/index";
import {
  HttpClient,
  HttpClientImpl,
  HttpProvider
} from "@/providers/http_provider";
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
  wsPort: number;
  ginHttpPort: number;
  jwtSecret: string;
  jwtTokenExpirationDuration: number; // seconds

  constructor(
    insecure: boolean,
    ip: string,
    httpPort: number,
    wsPort: number,
    ginHttpPort: number,
    jwtSecret: string,
    jwtTokenExpirationDuration: number
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

  constructor(
    chainConfig: ChainConfig,
    nodeConnectionConfig: NodeConnectionConfig,
    options?: Options
  ) {
    this.httpClient = new HttpClientImpl(
      new HttpProvider(
        `${nodeConnectionConfig.insecure ? "http" : "https"}://${nodeConnectionConfig.ip}:${nodeConnectionConfig.httpPort}`
      )
    );
    this.chainConfig = chainConfig;
    this.nodeConnectionConfig = nodeConnectionConfig;
    this.options = options ?? new Options({});
  }

  async transfer(
    credentials: Credentials,
    chainId: number,
    linker: string,
    payload: string,
    amount?: number,
    joule?: number
  ): Promise<E.Either<string, Error>> {
    const block = await this.httpClient.getLatestBlock(
      chainId,
      credentials.getAccountAddress()
    );
    const tx = TransactionBuilder.builder(TransactionTypes.Send)
      .setBlock(block)
      .setOwner(credentials.getAccountAddress())
      .setLinker(linker)
      .setPayload(payload)
      .setAmount(amount ?? 0)
      .setJoule(joule ?? 0)
      .build();
    const option = tx.signTx(
      chainId,
      this.chainConfig.curve,
      credentials.getPrivateKey()
    );
    if (O.isSome(option)) {
      return E.right(option.value);
    }

    const hash = await this.httpClient.sendTransaction(chainId, tx);
    return E.left(hash);
  }

  transferWaitReceipt(
    credentials: Credentials,
    chainId: number,
    linker: string,
    payload: string,
    amount?: number,
    joule?: number
  ): E.Either<Receipt, Error> {
    return E.right(new Error("Not implemented"));
  }
}

export {
  LatticeClient,
  Credentials,
  ChainConfig,
  NodeConnectionConfig,
  Options
};