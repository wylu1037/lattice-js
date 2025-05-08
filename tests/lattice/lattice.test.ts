import { Curves } from "@/common/constants";
import { E } from "@/common/types/index";
import {
  ChainConfig,
  Credentials,
  LatticeClient,
  NodeConnectionConfig
} from "@/lattice/index";
import { LatticeAbi } from "@/utils/abi";

describe.skip("lattice client", () => {
  const chainId = 1;
  const chainConfig = new ChainConfig(Curves.Sm2p256v1, true);
  const nodeConnectionConfig = new NodeConnectionConfig("192.168.3.51", 13000);
  const credentials = Credentials.fromPrivateKey(
    "zltc_bXmfbHYXx5e2ri9nSrDcjGLzZ4A3EmbXK",
    "0xb2abf4282ac9be1b61afa64305e1b0eb4b7d0726384d1000486396ff73a66a5d"
  );
  const lattice = new LatticeClient(chainConfig, nodeConnectionConfig);

  it("should be able to transfer", async () => {
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

  it(
    "should handle concurrent transfers correctly",
    { timeout: 60_000 },
    async () => {
      const transferTask = async (index: number) => {
        const result = await lattice.transfer(
          credentials,
          chainId,
          "zltc_bXmfbHYXx5e2ri9nSrDcjGLzZ4A3EmbXK",
          "0x0102"
        );

        if (E.isLeft(result)) {
          console.log("transfer success, hash:", result.left);
          return { success: true, hash: result.left };
        }

        return { success: false, error: result.right };
      };

      const total = 385;
      const tasks = Array(total)
        .fill(0)
        .map((_, index) => transferTask(index));

      const results = await Promise.all(tasks);
      const successCount = results.filter((r) => r.success).length;

      expect(successCount).toBe(total);
    }
  );

  it("should be able to transfer and wait receipt", async () => {
    const result = await lattice.transferWaitReceipt(
      credentials,
      chainId,
      "zltc_bXmfbHYXx5e2ri9nSrDcjGLzZ4A3EmbXK",
      "0x0102"
    );
    if (E.isLeft(result)) {
      console.log("transfer success, receipt:", result.left);
    } else {
      console.error("transfer failed", result.right);
    }
  });

  it("should be able to wait receipt", { timeout: 20000 }, async () => {
    const result = await lattice.waitReceipt(
      chainId,
      "0x4f263c70eac15d06a2704b45f7e5c37b88d168ede45ffe15218e63df9058f68f"
    );
    if (E.isLeft(result)) {
      console.log("wait receipt success, receipt:", result.left);
    } else {
      console.error("wait receipt failed", result.right);
    }
  });

  it("should be able to deploy contract", async () => {
    const bytecode =
      "0x60806040526000805534801561001457600080fd5b50610278806100246000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80635b34b96614610046578063a87d942c14610050578063f5c5ad831461006e575b600080fd5b61004e610078565b005b610058610093565b60405161006591906100d0565b60405180910390f35b61007661009c565b005b600160008082825461008a919061011a565b92505081905550565b60008054905090565b60016000808282546100ae91906101ae565b92505081905550565b6000819050919050565b6100ca816100b7565b82525050565b60006020820190506100e560008301846100c1565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610125826100b7565b9150610130836100b7565b9250817f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0383136000831215161561016b5761016a6100eb565b5b817f80000000000000000000000000000000000000000000000000000000000000000383126000831216156101a3576101a26100eb565b5b828201905092915050565b60006101b9826100b7565b91506101c4836100b7565b9250827f8000000000000000000000000000000000000000000000000000000000000000018212600084121516156101ff576101fe6100eb565b5b827f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff018213600084121615610237576102366100eb565b5b82820390509291505056fea2646970667358221220d841351625356129f6266ada896818d690dbc4b0d176774a97d745dfbe2fe50164736f6c634300080b0033";
    const result = await lattice.deployContract(credentials, chainId, bytecode);
    if (E.isLeft(result)) {
      console.log("deploy contract success, hash:", result.left);
    } else {
      console.error("deploy contract failed", result.right);
    }
  });

  it("should be able to deploy contract and wait receipt", async () => {
    const bytecode =
      "0x60806040526000805534801561001457600080fd5b50610278806100246000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80635b34b96614610046578063a87d942c14610050578063f5c5ad831461006e575b600080fd5b61004e610078565b005b610058610093565b60405161006591906100d0565b60405180910390f35b61007661009c565b005b600160008082825461008a919061011a565b92505081905550565b60008054905090565b60016000808282546100ae91906101ae565b92505081905550565b6000819050919050565b6100ca816100b7565b82525050565b60006020820190506100e560008301846100c1565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610125826100b7565b9150610130836100b7565b9250817f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0383136000831215161561016b5761016a6100eb565b5b817f80000000000000000000000000000000000000000000000000000000000000000383126000831216156101a3576101a26100eb565b5b828201905092915050565b60006101b9826100b7565b91506101c4836100b7565b9250827f8000000000000000000000000000000000000000000000000000000000000000018212600084121516156101ff576101fe6100eb565b5b827f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff018213600084121615610237576102366100eb565b5b82820390509291505056fea2646970667358221220d841351625356129f6266ada896818d690dbc4b0d176774a97d745dfbe2fe50164736f6c634300080b0033";

    const result = await lattice.deployContractWaitReceipt(
      credentials,
      chainId,
      bytecode
    );
    if (E.isLeft(result)) {
      console.log("deploy contract success, receipt:", result.left);
    } else {
      console.error("deploy contract failed", result.right);
    }
  });

  it("should be able to call contract: increment counter", async () => {
    const abi = [
      "function incrementCounter()",
      "function decrementCounter()",
      "function getCount() returns (int256)"
    ];
    const latticeAbi = new LatticeAbi(abi);
    const code = latticeAbi.encodeFunctionData("incrementCounter");
    const result = await lattice.callContract(
      credentials,
      chainId,
      "zltc_csLtohCAMKpEkXUA6QBhsi2dw7FSHKQtA",
      code
    );
    if (E.isLeft(result)) {
      console.log("call contract success, hash:", result.left);
    } else {
      console.error("call contract failed", result.right);
    }
  });

  it("should be able to call contract and wait receipt", async () => {
    const abi = [
      "function incrementCounter()",
      "function decrementCounter()",
      "function getCount() returns (int256)"
    ];
    const latticeAbi = new LatticeAbi(abi);
    const code = latticeAbi.encodeFunctionData("getCount");
    const result = await lattice.callContractWaitReceipt(
      credentials,
      chainId,
      "zltc_csLtohCAMKpEkXUA6QBhsi2dw7FSHKQtA",
      code
    );
    if (E.isLeft(result)) {
      console.log("call contract success, receipt:", result.left);
    } else {
      console.error("call contract failed", result.right);
    }
  });
});
