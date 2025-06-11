import { Curves } from "@/common/constants";
import {
  ChainConfig,
  Credentials,
  LatticeClient,
  NodeConnectionConfig,
  TraceabilityContract
} from "@/lattice/index";
import { LatticeAbi } from "@/utils/abi";

describe("lattice client", () => {
  const chainId = 1;
  const chainConfig = new ChainConfig(Curves.Sm2p256v1, true);
  const nodeConnectionConfig = new NodeConnectionConfig("192.168.3.51", 13000);
  const credentials = Credentials.fromPrivateKey(
    "zltc_dzsgyak2K6QRNX7sHrnoUg4VRK7L8MS9X",
    "0xca51dfee6b7337bd26c716931fa4a5c31eb7d91fa44bd254bad453d2bd0b815a"
  );
  const lattice = new LatticeClient(chainConfig, nodeConnectionConfig);

  it("should be able to transfer", async () => {
    await lattice
      .transfer(
        credentials,
        1,
        "zltc_bXmfbHYXx5e2ri9nSrDcjGLzZ4A3EmbXK",
        "0x0102"
      )
      .match(
        (hash) => {
          console.log("transfer success, hash:", hash);
        },
        (error) => {
          console.error("transfer failed", error);
        }
      );
  });

  it("should be able to cretae business", async () => {
    const traceability = new TraceabilityContract();
    const code = traceability.createBusiness();
    const result = await lattice.callContractWaitReceipt(
      credentials,
      chainId,
      TraceabilityContract.ADDRESS_FOR_CREATE_BUSINESS,
      code
    );

    result.match(
      (hash) => {
        console.log("create business success, hash:", hash);
      },
      (error) => {
        console.error("create business failed", error);
      }
    );
  });

  it(
    "should handle concurrent transfers correctly",
    { timeout: 60_000 },
    async () => {
      const transferTask = async (_: number) => {
        return await lattice
          .transfer(
            credentials,
            chainId,
            "zltc_bXmfbHYXx5e2ri9nSrDcjGLzZ4A3EmbXK",
            "0x0102"
          )
          .match(
            (hash) => {
              return { success: true, hash: hash };
            },
            (error) => {
              return { success: false, error: error };
            }
          );
      };

      const total = 100;
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
    result.match(
      (receipt) => {
        console.log("transfer success, receipt:", receipt);
      },
      (error) => {
        console.error("transfer failed", error);
      }
    );
  });

  it("should be able to wait receipt", { timeout: 60_000 }, async () => {
    await lattice
      .waitReceipt(
        chainId,
        "0xe29fe969a167771427cb104d6b722f5bbbc7618b8fb623efb21a1cc8a8e941ba"
      )
      .match(
        (receipt) => {
          console.log("wait receipt success, receipt:", receipt);
        },
        (error) => {
          console.error("wait receipt failed", error);
        }
      );
  });

  it("should be able to deploy contract", async () => {
    const bytecode =
      "0x60806040526000805534801561001457600080fd5b50610278806100246000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80635b34b96614610046578063a87d942c14610050578063f5c5ad831461006e575b600080fd5b61004e610078565b005b610058610093565b60405161006591906100d0565b60405180910390f35b61007661009c565b005b600160008082825461008a919061011a565b92505081905550565b60008054905090565b60016000808282546100ae91906101ae565b92505081905550565b6000819050919050565b6100ca816100b7565b82525050565b60006020820190506100e560008301846100c1565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610125826100b7565b9150610130836100b7565b9250817f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0383136000831215161561016b5761016a6100eb565b5b817f80000000000000000000000000000000000000000000000000000000000000000383126000831216156101a3576101a26100eb565b5b828201905092915050565b60006101b9826100b7565b91506101c4836100b7565b9250827f8000000000000000000000000000000000000000000000000000000000000000018212600084121516156101ff576101fe6100eb565b5b827f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff018213600084121615610237576102366100eb565b5b82820390509291505056fea2646970667358221220d841351625356129f6266ada896818d690dbc4b0d176774a97d745dfbe2fe50164736f6c634300080b0033";
    await lattice.deployContract(credentials, chainId, bytecode).match(
      (hash) => {
        console.log("deploy contract success, hash:", hash);
      },
      (error) => {
        console.error("deploy contract failed", error);
      }
    );
  });

  it("should be able to deploy contract and wait receipt", async () => {
    const bytecode =
      "0x60806040526000805534801561001457600080fd5b50610278806100246000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80635b34b96614610046578063a87d942c14610050578063f5c5ad831461006e575b600080fd5b61004e610078565b005b610058610093565b60405161006591906100d0565b60405180910390f35b61007661009c565b005b600160008082825461008a919061011a565b92505081905550565b60008054905090565b60016000808282546100ae91906101ae565b92505081905550565b6000819050919050565b6100ca816100b7565b82525050565b60006020820190506100e560008301846100c1565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610125826100b7565b9150610130836100b7565b9250817f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0383136000831215161561016b5761016a6100eb565b5b817f80000000000000000000000000000000000000000000000000000000000000000383126000831216156101a3576101a26100eb565b5b828201905092915050565b60006101b9826100b7565b91506101c4836100b7565b9250827f8000000000000000000000000000000000000000000000000000000000000000018212600084121516156101ff576101fe6100eb565b5b827f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff018213600084121615610237576102366100eb565b5b82820390509291505056fea2646970667358221220d841351625356129f6266ada896818d690dbc4b0d176774a97d745dfbe2fe50164736f6c634300080b0033";
    await lattice
      .deployContractWaitReceipt(credentials, chainId, bytecode)
      .match(
        (receipt) => {
          console.log("deploy contract success, receipt:", receipt);
        },
        (error) => {
          console.error("deploy contract failed", error);
        }
      );
  });

  it("should be able to call contract: increment counter", async () => {
    const abi = [
      "function incrementCounter()",
      "function decrementCounter()",
      "function getCount() returns (int256)"
    ];
    const latticeAbi = new LatticeAbi(abi);
    const code = latticeAbi.encodeFunctionData("incrementCounter");
    await lattice
      .callContract(
        credentials,
        chainId,
        "zltc_csLtohCAMKpEkXUA6QBhsi2dw7FSHKQtA",
        code
      )
      .match(
        (hash) => {
          console.log("call contract success, hash:", hash);
        },
        (error) => {
          console.error("call contract failed", error);
        }
      );
  });

  it("should be able to call contract and wait receipt", async () => {
    const abi = [
      "function incrementCounter()",
      "function decrementCounter()",
      "function getCount() returns (int256)"
    ];
    const latticeAbi = new LatticeAbi(abi);
    const code = latticeAbi.encodeFunctionData("getCount");
    await lattice
      .callContractWaitReceipt(
        credentials,
        chainId,
        "zltc_csLtohCAMKpEkXUA6QBhsi2dw7FSHKQtA",
        code
      )
      .match(
        (receipt) => {
          console.log("call contract success, receipt:", receipt);
        },
        (error) => {
          console.error("call contract failed", error);
        }
      );
  });
});
