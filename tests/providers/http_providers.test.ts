import {HttpClient, HttpClientImpl, HttpProvider} from "../../src/providers/http_provider";
import {expect} from "chai";

describe('HttpProviders', () => {
    describe('Http Client', () => {
        it('should be able to send http request', async () => {
            const provider = new HttpProvider("http://192.168.1.185:13000");
            const client: HttpClient = new HttpClientImpl(provider);
            try {
                const response = await client.getLatestBlock("zltc_cXV46yWanovM6ZppX91ZbUEtN6vAU7GiF");
                expect(response).not.to.be.null;
            } catch (error) {
                expect(error).to.be.null;
            }
        })
    })
})