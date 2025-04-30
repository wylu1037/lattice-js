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
    it("should be able to send http request", async () => {
      const provider = new HttpProvider("http://192.168.3.51:13000");
      const client: HttpClient = new HttpClientImpl(provider);
      try {
        const response = await client.getLatestBlock(
            1,
          "zltc_Yvvg3Zw2y7Szb3dzaYJsGHwqB4wofLgJ1"
        );
        console.log(response);
        expect(response).not.toBeNull();
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
      tx.payload = "0x0102";

      tx.signTx(chainId, curve, privateKey);
      
      console.log(JSON.stringify(tx, (_, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ));

      const hash = await client.sendTransaction(chainId, tx);
      console.log(hash);
    });
  });
});
