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
    headers?: AxiosRequestHeaders
  ): Promise<JsonRpcResponse<T>> {
    try {
      const response = await this.rawPost(jsonRpcBody, headers);
      return response.data as JsonRpcResponse<T>;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Unknown error");
      }
    }
  }

  // send a post request to node and return axios response
  private async rawPost(
    jsonRpcBody: JsonRpcBody,
    headers?: AxiosRequestHeaders
  ): Promise<AxiosResponse> {
    try {
      return await axios.post(this.baseUrl, jsonRpcBody, {
        headers: headers || {},
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Unknown error");
      }
    }
  }
}

// http client interface
interface HttpClient {
  // http provider
  httpProvider: HttpProvider;

  // get latest block info from chain
  getLatestBlock(accountAddress: string): Promise<LatestBlock>;
}

// http client implementation
class HttpClientImpl implements HttpClient {
  httpProvider: HttpProvider;

  // construct a http client with http provider
  constructor(private provider: HttpProvider) {
    this.httpProvider = provider;
  }

  // handel json-rpc response. when the response is null, throw error
  // when the response internal error is not null, throw error
  private handleJsonRpcResponse<T>(response: JsonRpcResponse<T>): T {
    if (!response) {
      throw new Error("response is null");
    }
    if (response.error) {
      throw new Error(`${response.error.code}: ${response.error.message}`);
    }
    return response.result as T;
  }

  // according to the account address to query latest block info from chain.
  // Params accountAddress: string, example: zltc_cXV46yWanovM6ZppX91ZbUEtN6vAU7GiF
  // Returns LatestBlock
  async getLatestBlock(accountAddress: string): Promise<LatestBlock> {
    const response: JsonRpcResponse<LatestBlock> = await this.httpProvider.post(
      {
        id: JSON_RPC_ID,
        jsonrpc: JSON_RPC_VERSION,
        method: "latc_getCurrentTBDB",
        params: [accountAddress],
      }
    );
    return this.handleJsonRpcResponse<LatestBlock>(response);
  }
}

// latest block info
interface LatestBlock {
  // latest transaction height associated with account
  currentTBlockNumber: number;
  // latest transaction block hash associated with account
  currentTBlockHash: string;
  // latest daemon block hash associated with account
  currentDBlockHash: string;
}

export {
  JsonRpcBody,
  JsonRpcResponse,
  JsonRpcError,
  HttpProvider,
  LatestBlock,
  HttpClient,
  HttpClientImpl,
};
