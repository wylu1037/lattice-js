import { convertArguments } from "@/utils";
import { LatticeAbi } from "@/utils/abi";
import { Fragment, Interface, ParamType } from "@ethersproject/abi";
import { hexZeroPad, hexlify } from "@ethersproject/bytes";
import { parseUnits } from "@ethersproject/units";

describe("abi", () => {
  const erc20Abi = [
    "function setArrays(uint256[] dynamicArray, address[] addresses, bool isIndexed) returns (bool)",
    "function storeHash(hash hashStr) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address recipient, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ];

  it("should encode and decode function result", () => {
    const abi = [
      "function transfer(address to, uint256 value) public returns (bool)"
    ];
    const iface = new Interface(abi);
    const returnData =
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    const result = iface.decodeFunctionResult("transfer", returnData);
    expect(result).toEqual([true]);
  });

  it("should encode function call data", () => {
    const contractInterface = new Interface(erc20Abi);
    const userAddress = "0x1234567890abcdef1234567890abcdef12345678";
    const encodedBalanceOf = contractInterface.encodeFunctionData("balanceOf", [
      userAddress
    ]);

    expect(encodedBalanceOf).toMatch(/^0x[0-9a-f]+$/i);
    expect(encodedBalanceOf.startsWith("0x70a08231")).toBe(true);
  });

  it("should decode function return result", () => {
    const contractInterface = new Interface(erc20Abi);
    const balanceResult =
      "0x0000000000000000000000000000000000000000000000000000000000000064"; // 100 in hex
    const decodedBalance = contractInterface.decodeFunctionResult(
      "balanceOf",
      balanceResult
    );

    expect(decodedBalance.toString()).toBe("100");
  });

  it("should encode transfer function call", () => {
    const contractInterface = new Interface(erc20Abi);

    const recipient = "0xabcdef1234567890abcdef1234567890abcdef12";
    const amount = parseUnits("50", 18); // 50 tokens with 18 decimals
    const encodedTransfer = contractInterface.encodeFunctionData("transfer", [
      recipient,
      amount
    ]);

    expect(encodedTransfer).toMatch(/^0x[0-9a-f]+$/i);
    expect(encodedTransfer.startsWith("0xa9059cbb")).toBe(true);
  });

  it("should decode event logs", () => {
    const contractInterface = new Interface(erc20Abi);

    const transferEvent = {
      topics: [
        contractInterface.getEventTopic("Transfer"),
        hexZeroPad("0x1234567890abcdef1234567890abcdef12345678", 32),
        hexZeroPad("0xabcdef1234567890abcdef1234567890abcdef12", 32)
      ],
      data: hexZeroPad(hexlify(parseUnits("50", 18)), 32)
    };

    const decodedEvent = contractInterface.decodeEventLog(
      "Transfer",
      transferEvent.data,
      transferEvent.topics
    );

    expect(decodedEvent.from.toLowerCase()).toBe(
      "0x1234567890abcdef1234567890abcdef12345678".toLowerCase()
    );
    expect(decodedEvent.to.toLowerCase()).toBe(
      "0xabcdef1234567890abcdef1234567890abcdef12".toLowerCase()
    );
    expect(decodedEvent.value.toString()).toBe(parseUnits("50", 18).toString());
  });

  it("should parse ABI fragments", () => {
    const balanceOfFragment = Fragment.from(
      "function balanceOf(address account) view returns (uint256)"
    );
    const inputTypes = balanceOfFragment.inputs.map(
      (param: ParamType) => param.type
    );

    expect(inputTypes).toEqual(["address"]);
    expect(balanceOfFragment.name).toBe("balanceOf");
    expect(balanceOfFragment.type).toBe("function");
  });

  it("should work with JsonFragment format from eip20Abi", () => {
    const iface = new Interface(eip20Abi);

    // test encode transfer function call
    const toAddress = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
    const amount = parseUnits("100", 18);
    const encodedTransfer = iface.encodeFunctionData("transfer", [
      toAddress,
      amount
    ]);

    // verify function selector is correct (transfer function selector)
    expect(encodedTransfer.slice(0, 10)).toBe("0xa9059cbb");

    // test decode return value
    const successResult =
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    const decodedResult = iface.decodeFunctionResult("transfer", successResult);
    expect(decodedResult[0]).toBe(true);

    // test event encoding and parsing
    const transferTopic = iface.getEventTopic("Transfer");
    expect(transferTopic).toMatch(/^0x[0-9a-f]{64}$/i);

    // test get full function and event information
    const transferFunction = iface.getFunction("transfer");
    expect(transferFunction.name).toBe("transfer");
    expect(transferFunction.inputs.length).toBe(2);
    expect(transferFunction.outputs?.length).toBe(1);
    expect(transferFunction.inputs[0].type).toBe("address");
    expect(transferFunction.inputs[1].type).toBe("uint256");

    // test get event information
    const transferEvent = iface.getEvent("Transfer");
    expect(transferEvent.name).toBe("Transfer");
    expect(transferEvent.inputs.length).toBe(3);
    expect(transferEvent.inputs[0].indexed).toBe(true);
    expect(transferEvent.inputs[1].indexed).toBe(true);
    expect(transferEvent.inputs[2].indexed).toBe(false);
  });

  it("should encode with convert arguments", () => {
    const iface = new Interface(erc20Abi);
    const convertedArgs = convertArguments(
      iface.getFunction("setArrays").inputs,
      [
        ["1", 2, 3, 4, 5],
        [
          "zltc_kZnwhpaz8WDoME1jdjQ7vNGmXkgWRtfDT",
          "zltc_Rr6jJoQPMGP1KLu1LsvrNfmarNHyCoYCj",
          "zltc_kZnwhpaz8WDoME1jdjQ7vNGmXkgWRtfDT"
        ],
        true
      ]
    );
    console.log(convertedArgs);
    const encoded = iface.encodeFunctionData("setArrays", convertedArgs);
    const expected =
      "0x24ebe2980000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000003000000000000000000000000dde11226e1d2e74e091e3263fe7999692cab3e51000000000000000000000000108c2f020cdfda60a64c9592a03198990aba1f78000000000000000000000000dde11226e1d2e74e091e3263fe7999692cab3e51";
    expect(encoded).toBe(expected);
  });

  it("should encode tuple arguments", () => {
    const latticeAbi = new LatticeAbi(JSON.stringify(miscAbi));
    const encoded = latticeAbi.encodeFunctionData("setUser", [
      [1, "jack", true, ["handsome", "high"], [1]]
    ]);
    const expected =
      "0x66e334840000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000046a61636b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000868616e64736f6d650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004686967680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001";
    expect(encoded).toEqual(expected);
  });

  it("should encode bytes32 arguments", () => {
    const latticeAbi = new LatticeAbi(JSON.stringify(miscAbi));
    const encoded = latticeAbi.encodeFunctionData("setBytes32", [
      "0x1234567890abcdef1234567890abcdef123456781234567890abcdef12345678"
    ]);
    const expected =
      "0xc2b12a731234567890abcdef1234567890abcdef123456781234567890abcdef12345678";
    expect(encoded).toEqual(expected);
  });

  it("should encode bytes32 array arguments", () => {
    const latticeAbi = new LatticeAbi(JSON.stringify(miscAbi));
    const encoded = latticeAbi.encodeFunctionData("setBytes32Array", [
      [
        "0x1234567890abcdef1234567890abcdef123456781234567890abcdef12345678",
        "0x7890abcdef1234567890abcdef123456781234567890abcdef12345678345678"
      ]
    ]);
    const expected =
      "0x1229d719000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234567890abcdef1234567890abcdef123456781234567890abcdef123456787890abcdef1234567890abcdef123456781234567890abcdef12345678345678";
    expect(encoded).toEqual(expected);
  });
});

const eip20Abi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address"
      },
      {
        name: "_value",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_from",
        type: "address"
      },
      {
        name: "_to",
        type: "address"
      },
      {
        name: "_value",
        type: "uint256"
      }
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "balances",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      },
      {
        name: "",
        type: "address"
      }
    ],
    name: "allowed",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address"
      },
      {
        name: "_value",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address"
      },
      {
        name: "_spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        name: "remaining",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        name: "_initialAmount",
        type: "uint256"
      },
      {
        name: "_tokenName",
        type: "string"
      },
      {
        name: "_decimalUnits",
        type: "uint8"
      },
      {
        name: "_tokenSymbol",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_from",
        type: "address"
      },
      {
        indexed: true,
        name: "_to",
        type: "address"
      },
      {
        indexed: false,
        name: "_value",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_owner",
        type: "address"
      },
      {
        indexed: true,
        name: "_spender",
        type: "address"
      },
      {
        indexed: false,
        name: "_value",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  }
];

const miscAbi = [
  {
    inputs: [],
    name: "getTags",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getUser",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "name",
            type: "string"
          },
          {
            internalType: "bool",
            name: "isMan",
            type: "bool"
          },
          {
            internalType: "string[]",
            name: "tags",
            type: "string[]"
          },
          {
            internalType: "uint32[]",
            name: "levels",
            type: "uint32[]"
          }
        ],
        internalType: "struct Test.User",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "bs32",
        type: "bytes32"
      }
    ],
    name: "setBytes32",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "bs32",
        type: "bytes32[]"
      }
    ],
    name: "setBytes32Array",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "setId",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "name",
            type: "string"
          },
          {
            internalType: "bool",
            name: "isMan",
            type: "bool"
          },
          {
            internalType: "string[]",
            name: "tags",
            type: "string[]"
          },
          {
            internalType: "uint32[]",
            name: "levels",
            type: "uint32[]"
          }
        ],
        internalType: "struct Test.User",
        name: "newUser",
        type: "tuple"
      }
    ],
    name: "setUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32[]",
        name: "newLevels",
        type: "uint32[]"
      }
    ],
    name: "updateLevels",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newName",
        type: "string"
      }
    ],
    name: "updateName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string[]",
        name: "newTags",
        type: "string[]"
      }
    ],
    name: "updateTags",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];