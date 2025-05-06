import { Curves } from "@/common/constants";
import { Transaction } from "@/common/types";
import {
  HttpClient,
  HttpClientImpl,
  HttpProvider,
} from "@/providers/http_provider";
import { describe, expect, it } from "vitest";

describe("HttpProviders", () => {
  describe("Http Client", () => {
    const chainId = 1;
    const account = "zltc_bXmfbHYXx5e2ri9nSrDcjGLzZ4A3EmbXK";
    let provider: HttpProvider;
    let client: HttpClient;

    beforeEach(async () => {
      provider = new HttpProvider("http://192.168.3.51:13000");
      client = new HttpClientImpl(provider);
    });

    it("should be able to send http request", async () => {
      try {
        const response = await client.getLatestBlock(chainId, account);
        console.log(response);
        expect(response).not.toBeNull();
      } catch (error) {
        expect(error).toBeNull();
      }
    });

    it("should be able to get receipt", async () => {
      try {
        const hash = "0x8940fae1bee579416556f7e2a12c079cf795d51129b9acf64d0bfe963cdf04a1";
        const receipt = await client.getReceipt(chainId, hash);
        console.log(receipt);
        expect(receipt).not.toBeNull();
      } catch (error) {
        expect(error).toBeNull();
      }
    });

    it("should be able to get latest dblock", async () => {
      try {
        const dblock = await client.getLatestDBlock(chainId);
        console.log(dblock);
        expect(dblock).not.toBeNull();
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe("test sign tx", () => {
    it("should be able to sign tx", async () => {
      const chainId = 1;
      const url = "http://192.168.3.51:13000";
      const curve = Curves.Sm2p256v1;
      const account = "zltc_bXmfbHYXx5e2ri9nSrDcjGLzZ4A3EmbXK";
      const linker = "zltc_Yvvg3Zw2y7Szb3dzaYJsGHwqB4wofLgJ1";
      const privateKey = "0xb2abf4282ac9be1b61afa64305e1b0eb4b7d0726384d1000486396ff73a66a5d";

      const provider = new HttpProvider(url);
      const client: HttpClient = new HttpClientImpl(provider);
      const block = await client.getLatestBlock(chainId, account);
      
      const tx = Transaction.default();
      tx.number = block.currentTBlockNumber+1;
      tx.parentHash = block.currentTBlockHash;
      tx.daemonHash = block.currentDBlockHash;
      tx.owner = account;
      tx.linker = linker;
      tx.amount = 0;
      tx.payload = "0x0102030405";

      tx.signTx(chainId, curve, privateKey);
      
      console.log(JSON.stringify(tx, (_, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ));

      const hash = await client.sendTransaction(chainId, tx);
      console.log(hash);
    });
  });
});
