import { Curves } from "@/common/constants";
import { E } from "@/common/types/index";
import {
  ChainConfig,
  Credentials,
  LatticeClient,
  NodeConnectionConfig
} from "@/lattice/index";

describe.skip("lattice client", () => {
  it("should be able to transfer", async () => {
    const chainConfig = new ChainConfig(Curves.Sm2p256v1, true);
    const nodeConnectionConfig = new NodeConnectionConfig(
      true,
      "192.168.3.51",
      13000,
      13001,
      13002,
      "jwt_secret",
      3600
    );
    const lattice = new LatticeClient(chainConfig, nodeConnectionConfig);
    const credentials = Credentials.fromPrivateKey(
      "zltc_bXmfbHYXx5e2ri9nSrDcjGLzZ4A3EmbXK",
      "0xb2abf4282ac9be1b61afa64305e1b0eb4b7d0726384d1000486396ff73a66a5d"
    );
    const result = await lattice.transfer(
      credentials,
      1,
      "zltc_bXmfbHYXx5e2ri9nSrDcjGLzZ4A3EmbXK",
      "0x0102"
    );
    if (E.isLeft(result)) {
      console.log("transfer success, hash:", result.left);
    } else {
      console.error("transfer failed", result.right);
    }
  });
});

