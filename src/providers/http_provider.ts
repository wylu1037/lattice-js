import axios, {AxiosRequestHeaders, AxiosResponse} from "axios";

interface JsonRpcError {
    code?: number;
    message?: string;
}

interface JsonRpcResponse<T> {
    id: number;
    jsonrpc: string;
    result?: T;
    error?: JsonRpcError;
}

interface JsonRpcBody {
    id: number;
    jsonrpc: string;
    method: string;
    params?: any[];
}

class HttpProvider {

    async post<T>(url: string, jsonRpcBody: JsonRpcBody, headers?: AxiosRequestHeaders): Promise<JsonRpcResponse<T>> {
        try {
            const response = await this.rawPost(url, jsonRpcBody, headers);
            return response.data as JsonRpcResponse<T>;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error("Unknown error");
            }
        }
    }

    private async rawPost(url: string, jsonRpcBody: JsonRpcBody, headers?: AxiosRequestHeaders): Promise<AxiosResponse> {
        try {
            return await axios.post(url, jsonRpcBody, {headers: headers || {}});
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error("Unknown error");
            }
        }
    }
}

interface LatestBlock {
    currentTBlockNumber: number;
    currentTBlockHash: string;
    currentDBlockHash: string;
}

export {JsonRpcBody, JsonRpcResponse, JsonRpcError, HttpProvider, LatestBlock};
