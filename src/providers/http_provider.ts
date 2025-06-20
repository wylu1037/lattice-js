import { ProposalState, ProposalType, ProposalTypes } from "@/common/constants";
import {
  ContractLifecycleProposal,
  DBlock,
  LatestBlock,
  ModifyChainConfigurationProposal,
  Proposal,
  Receipt,
  SubchainProposal,
  Transaction
} from "@/common/types/index";
import { log } from "@/logger";
import { formatDateToYYYYMMDD } from "@/utils/index";
import axios, { AxiosRequestHeaders, AxiosResponse } from "axios";

// json-rpc id
const JSON_RPC_ID: number = 1;
// json-rpc version
const JSON_RPC_VERSION: string = "2.0";

// json-rpc error struct
interface JsonRpcError {
  code?: number;
  message?: string;
}

// json-rpc response struct.
// and the generic type T is the type of the result
interface JsonRpcResponse<T> {
  id: number;
  jsonrpc: string;
  result?: T;
  error?: JsonRpcError;
}

// json-rpc request struct
interface JsonRpcBody {
  id: number;
  jsonrpc: string;
  method: string;
  params?: any[];
}

// http provider
class HttpProvider {
  // base url that used to access node
  baseUrl: string;

  // construct a http provider with base url
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // send a post request to node and return json-rpc response
  async post<T>(
    jsonRpcBody: JsonRpcBody,
    headers?: AxiosRequestHeaders | Record<string, string | string[]>
  ): Promise<JsonRpcResponse<T>> {
    try {
      const response = await this.rawPost(jsonRpcBody, headers);
      return response.data as JsonRpcResponse<T>;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error");
    }
  }

  // send a post-request to node and return axios response
  private async rawPost(
    jsonRpcBody: JsonRpcBody,
    headers?: AxiosRequestHeaders | Record<string, string | string[]>
  ): Promise<AxiosResponse> {
    log.debug(
      "发起HTTP请求，请求地址：%s，请求体：%o",
      this.baseUrl,
      jsonRpcBody
    );
    try {
      const response = await axios.post(this.baseUrl, jsonRpcBody, {
        headers: headers || {}
      });
      log.debug(
        "HTTP请求成功，响应状态码：%d，响应体：%o",
        response.status,
        response.data
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      log.error("HTTP请求失败，错误信息：%o", error);
      throw new Error("Unknown error");
    }
  }
}

// http client interface
interface HttpClient {
  // http provider
  httpProvider: HttpProvider;

  /**
   * Get the latest block info from chain
   *
   * @param chainId - The chain id
   * @param accountAddress - The account address
   * @returns The latest block info
   */
  getLatestBlock(chainId: number, accountAddress: string): Promise<LatestBlock>;

  /**
   * Send a transaction to chain
   *
   * @param chainId - The chain id
   * @param transaction - The transaction
   * @returns The transaction hash
   */
  sendTransaction(chainId: number, transaction: Transaction): Promise<string>;

  /**
   * Batch sends transactions to chain
   *
   * @param chainId - The chain id
   * @param transactions - The transactions
   * @returns The transaction hashes
   */
  batchSendTransactions(
    chainId: number,
    transactions: Transaction[]
  ): Promise<string[]>;

  /**
   * Get the transaction receipt from chain
   *
   * @param chainId - The chain id
   * @param hash - The transaction hash
   * @returns The transaction receipt
   */
  getReceipt(chainId: number, hash: string): Promise<Receipt>;

  /**
   * Get the latest dblock from chain
   *
   * @param chainId - The chain id
   * @returns The latest dblock
   */
  getLatestDBlock(chainId: number): Promise<DBlock>;

  /**
   * Pre-call contract
   *
   * @param chainId - The chain id
   * @param transaction - The unsigned transaction
   * @returns The receipt
   */
  preCallContract(chainId: number, transaction: Transaction): Promise<Receipt>;

  /**
   * Get the contract lifecycle proposals
   *
   * @param chainId - The chain id
   * @param contractAddress - The contract address
   * @param state - The proposal state
   * @param startDate - The start date
   * @param endDate - The end date
   * @returns The contract lifecycle proposals
   */
  getContractLifecycleProposals(
    chainId: number,
    contractAddress: string,
    state: ProposalState,
    startDate: Date,
    endDate: Date
  ): Promise<Proposal<ContractLifecycleProposal>[]>;

  /**
   * Get the modify chain configuration proposals
   *
   * @param chainId - The chain id
   * @param state - The proposal state
   * @param startDate - The start date
   * @param endDate - The end date
   * @returns The modify chain configuration proposals
   */
  getModifyChainConfigurationProposals(
    chainId: number,
    state: ProposalState,
    startDate: Date,
    endDate: Date
  ): Promise<Proposal<ModifyChainConfigurationProposal>[]>;

  /**
   * Get the subchain proposals
   *
   * @param chainId - The chain id
   * @param state - The proposal state
   * @param startDate - The start date
   * @param endDate - The end date
   * @returns The subchain proposals
   */
  getSubchainProposals(
    chainId: number,
    state: ProposalState,
    startDate: Date,
    endDate: Date
  ): Promise<Proposal<SubchainProposal>[]>;
}

// http client implementation
class HttpClientImpl implements HttpClient {
  httpProvider: HttpProvider;

  // construct an http client with http provider
  constructor(private provider: HttpProvider) {
    this.httpProvider = provider;
  }

  /**
   * Handle json-rpc response. when the response is null, throw error
   * when the response internal error is not null, throw error
   *
   * @param response - The json-rpc response
   * @returns The result
   */
  private handleJsonRpcResponse<T>(response: JsonRpcResponse<T>): T {
    if (!response) {
      throw new Error("response is null");
    }
    if (response.error) {
      throw new Error(`${response.error.code}: ${response.error.message}`);
    }
    //return JSON.parse(JSON.stringify(response.result)) as T;
    return response.result as T;
  }

  async getLatestBlock(
    chainId: number,
    accountAddress: string
  ): Promise<LatestBlock> {
    const response: JsonRpcResponse<LatestBlock> = await this.httpProvider.post(
      {
        id: JSON_RPC_ID,
        jsonrpc: JSON_RPC_VERSION,
        method: "latc_getCurrentTBDB",
        params: [accountAddress]
      },
      {
        ChainId: chainId.toString()
      }
    );
    return this.handleJsonRpcResponse<LatestBlock>(response);
  }

  /**
   * Send signed transaction to blockchain.
   *
   * @param transaction signed transaction
   * @return transaction hash
   */
  async sendTransaction(
    chainId: number,
    transaction: Transaction
  ): Promise<string> {
    const response: JsonRpcResponse<string> = await this.httpProvider.post(
      {
        id: JSON_RPC_ID,
        jsonrpc: JSON_RPC_VERSION,
        method: "wallet_sendRawTBlock",
        params: [transaction]
      },
      {
        ChainId: chainId.toString()
      }
    );
    return this.handleJsonRpcResponse<string>(response);
  }

  // batch send transactions to chain
  async batchSendTransactions(
    chainId: number,
    transactions: Transaction[]
  ): Promise<string[]> {
    const response: JsonRpcResponse<string[]> = await this.httpProvider.post(
      {
        id: JSON_RPC_ID,
        jsonrpc: JSON_RPC_VERSION,
        method: "wallet_sendRawBatchTBlock",
        params: [transactions]
      },
      {
        ChainId: chainId.toString()
      }
    );
    return this.handleJsonRpcResponse<string[]>(response);
  }

  async getReceipt(chainId: number, hash: string): Promise<Receipt> {
    const response: JsonRpcResponse<Receipt> = await this.httpProvider.post(
      {
        id: JSON_RPC_ID,
        jsonrpc: JSON_RPC_VERSION,
        method: "latc_getReceipt",
        params: [hash]
      },
      {
        ChainId: chainId.toString()
      }
    );
    return this.handleJsonRpcResponse<Receipt>(response);
  }

  async getLatestDBlock(chainId: number): Promise<DBlock> {
    const response: JsonRpcResponse<DBlock> = await this.httpProvider.post(
      {
        id: JSON_RPC_ID,
        jsonrpc: JSON_RPC_VERSION,
        method: "latc_getCurrentDBlock",
        params: []
      },
      {
        ChainId: chainId.toString()
      }
    );
    return this.handleJsonRpcResponse<DBlock>(response);
  }

  async preCallContract(
    chainId: number,
    transaction: Transaction
  ): Promise<Receipt> {
    const response: JsonRpcResponse<Receipt> = await this.httpProvider.post(
      {
        id: JSON_RPC_ID,
        jsonrpc: JSON_RPC_VERSION,
        method: "wallet_preExecuteContract",
        params: [transaction]
      },
      {
        ChainId: chainId.toString()
      }
    );
    return this.handleJsonRpcResponse<Receipt>(response);
  }

  async getContractLifecycleProposals(
    chainId: number,
    contractAddress: string,
    state: ProposalState,
    startDate: Date,
    endDate: Date
  ): Promise<Proposal<ContractLifecycleProposal>[]> {
    const response: JsonRpcResponse<Proposal<ContractLifecycleProposal>[]> =
      await this.httpProvider.post(
        {
          id: JSON_RPC_ID,
          jsonrpc: JSON_RPC_VERSION,
          method: "wallet_getProposal",
          params: [
            {
              proposalAddress: contractAddress,
              proposalState: state,
              proposalType: ProposalTypes.ContractLifecycle,
              dateStart: formatDateToYYYYMMDD(startDate),
              dateEnd: formatDateToYYYYMMDD(endDate)
            }
          ]
        },
        {
          ChainId: chainId.toString()
        }
      );
    return this.handleJsonRpcResponse<Proposal<ContractLifecycleProposal>[]>(
      response
    );
  }

  async getModifyChainConfigurationProposals(
    chainId: number,
    state: ProposalState,
    startDate: Date,
    endDate: Date
  ): Promise<Proposal<ModifyChainConfigurationProposal>[]> {
    const response: JsonRpcResponse<
      Proposal<ModifyChainConfigurationProposal>[]
    > = await this.httpProvider.post(
      {
        id: JSON_RPC_ID,
        jsonrpc: JSON_RPC_VERSION,
        method: "wallet_getProposal",
        params: [
          {
            proposalState: state,
            proposalType: ProposalTypes.ModifyChainConfiguration,
            dateStart: formatDateToYYYYMMDD(startDate),
            dateEnd: formatDateToYYYYMMDD(endDate)
          }
        ]
      },
      {
        ChainId: chainId.toString()
      }
    );
    return this.handleJsonRpcResponse<
      Proposal<ModifyChainConfigurationProposal>[]
    >(response);
  }

  async getSubchainProposals(
    chainId: number,
    state: ProposalState,
    startDate: Date,
    endDate: Date
  ): Promise<Proposal<SubchainProposal>[]> {
    const response: JsonRpcResponse<Proposal<SubchainProposal>[]> =
      await this.httpProvider.post(
        {
          id: JSON_RPC_ID,
          jsonrpc: JSON_RPC_VERSION,
          method: "wallet_getProposal",
          params: [
            {
              proposalState: state,
              proposalType: ProposalTypes.ChainByChain,
              dateStart: formatDateToYYYYMMDD(startDate),
              dateEnd: formatDateToYYYYMMDD(endDate)
            }
          ]
        },
        {
          ChainId: chainId.toString()
        }
      );
    return this.handleJsonRpcResponse<Proposal<SubchainProposal>[]>(response);
  }
}

export {
  type JsonRpcBody,
  type JsonRpcResponse,
  type JsonRpcError,
  HttpProvider,
  type HttpClient,
  HttpClientImpl
};
