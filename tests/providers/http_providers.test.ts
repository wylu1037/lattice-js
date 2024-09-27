import {HttpProvider, JsonRpcResponse, LatestBlock} from "../../src/providers/http_provider";
import {expect} from "chai";

describe('HttpProviders', () => {
    describe('Http Client', () => {
        it('should be able to send http request', async () => {
            const client = new HttpProvider();
            try {
                const response: JsonRpcResponse<LatestBlock> = await client.post("http://192.168.1.185:13000", {
                    id: 1,
                    jsonrpc: '2.0',
                    method: "latc_getCurrentTBDB",
                    params: ["zltc_cXV46yWanovM6ZppX91ZbUEtN6vAU7GiF"]
                });
                expect(response).not.to.be.null;
                expect(response.error).to.be.undefined;
                expect(response.result).not.to.be.null;
            } catch (error) {
                expect(error).to.be.null;
            }
        })
    })
})