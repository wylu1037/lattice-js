import { Interface } from "@ethersproject/abi";

describe("abi encode", () => {
  it("should encode", () => {
    const abi = [
      "function transfer(address to, uint256 value) public returns (bool)"
    ];
    const iface = new Interface(abi);

    const data = iface.encodeFunctionData("transfer", [
      "0x1234567890123456789012345678901234567890",
      1000n
    ]);
    const expected =
      "0xa9059cbb000000000000000000000000123456789012345678901234567890123456789000000000000000000000000000000000000000000000000000000000000003e8";
    expect(data).toBe(expected);
  });

  it("should find all function selectors in bytecode - using Set comparison", () => {
    const abi = [
      {
        inputs: [],
        name: "decrementCounter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "getCount",
        outputs: [
          {
            internalType: "int256",
            name: "",
            type: "int256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "incrementCounter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      }
    ];
    const bytecode =
      "0x60806040526000805534801561001457600080fd5b50610278806100246000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80635b34b96614610046578063a87d942c14610050578063f5c5ad831461006e575b600080fd5b61004e610078565b005b610058610093565b60405161006591906100d0565b60405180910390f35b61007661009c565b005b600160008082825461008a919061011a565b92505081905550565b60008054905090565b60016000808282546100ae91906101ae565b92505081905550565b6000819050919050565b6100ca816100b7565b82525050565b60006020820190506100e560008301846100c1565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610125826100b7565b9150610130836100b7565b9250817f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0383136000831215161561016b5761016a6100eb565b5b817f80000000000000000000000000000000000000000000000000000000000000000383126000831216156101a3576101a26100eb565b5b828201905092915050565b60006101b9826100b7565b91506101c4836100b7565b9250827f8000000000000000000000000000000000000000000000000000000000000000018212600084121516156101ff576101fe6100eb565b5b827f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff018213600084121615610237576102366100eb565b5b82820390509291505056fea2646970667358221220d841351625356129f6266ada896818d690dbc4b0d176774a97d745dfbe2fe50164736f6c634300080b0033";

    const iface = new Interface(abi);
    const expectedSelectors = Object.keys(iface.functions).map((func) => {
      return iface.getSighash(func);
    });

    const selectorRegex = /63([0-9a-f]{8})1461([0-9a-f]{4})57/gi;
    const matches = [...bytecode.matchAll(selectorRegex)];
    const foundSelectors = matches.map((match) => `0x${match[1]}`);

    const expectedSet = new Set(expectedSelectors);
    const foundSet = new Set(foundSelectors);

    expect(foundSet).toEqual(expectedSet);
  });
});
