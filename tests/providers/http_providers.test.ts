import {
  HttpClient,
  HttpClientImpl,
  HttpProvider,
} from "@/providers/http_provider";
import { expect } from "chai";

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
        expect(response).not.to.be.null;
      } catch (error) {
        expect(error).to.be.null;
      }
    });
  });
});
