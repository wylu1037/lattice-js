import { encodeBytes32Array } from "@/utils";
import { LatticeAbi } from "@/utils/abi";
import { hexlify } from "@ethersproject/bytes";
import { BuiltinContract, type writeTraceabilityRequest } from "./types";

interface Traceability {
  /**
   * Create a business
   * @returns The address of the business
   */
  createBusiness(): string;
  /**
   * Add a protocol to the business
   * @param protocolSuite The protocol suite
   * @param bytes The bytes of the protocol
   * @returns The address of the business
   */
  createProtocol(protocolSuite: number, bytes: Buffer): Promise<string>;
  /**
   * Read a protocol
   * @param protocolUri The protocol uri
   * @returns The bytes of the protocol
   */
  readProtocol(protocolUri: number): Promise<string>;
  /**
   * Update a protocol
   * @param protocolUri The protocol uri
   * @param bytes The bytes of the protocol
   * @returns The address of the business
   */
  updateProtocol(protocolUri: number, bytes: Buffer): Promise<string>;

  /**
   * Write a traceability
   * @param request The request
   * @returns The address of the business
   */
  writeTraceability(request: writeTraceabilityRequest): Promise<string>;
  /**
   * Read a traceability
   * @param dataId The data id
   * @param businessContractAddress The business contract address
   * @returns The traceability
   */
  readTraceability(
    dataId: string,
    businessContractAddress: string
  ): Promise<string>;
}

class TraceabilityContract implements Traceability {
  private readonly iface: LatticeAbi;
  private readonly builtinContract: BuiltinContract;
  /**
   * The address for creating business
   */
  public static readonly ADDRESS_FOR_CREATE_BUSINESS =
    "zltc_QLbz7JHiBTspS9WTWJUrbNsB5wbENMweQ";

  constructor() {
    this.builtinContract = traceability;
    this.iface = traceability.getLatticeInterface();
  }

  getIface() {
    return this.iface;
  }

  getBuiltinContract() {
    return this.builtinContract;
  }

  createBusiness(): string {
    return hexlify([49]);
  }

  async createProtocol(protocolSuite: number, bytes: Buffer): Promise<string> {
    return await this.iface.encodeFunctionData("addProtocol", [
      protocolSuite,
      encodeBytes32Array(bytes)
    ]);
  }

  async readProtocol(protocolUri: number): Promise<string> {
    return await this.iface.encodeFunctionData("getAddress", [protocolUri]);
  }

  async updateProtocol(protocolUri: number, bytes: Buffer): Promise<string> {
    return await this.iface.encodeFunctionData("updateProtocol", [
      protocolUri,
      encodeBytes32Array(bytes)
    ]);
  }

  async writeTraceability(request: writeTraceabilityRequest): Promise<string> {
    return await this.iface.encodeFunctionData("writeTraceability", [
      request.protocolUri,
      request.dataId,
      request.data,
      request.businessContractAddress
    ]);
  }

  async readTraceability(
    dataId: string,
    businessContractAddress: string
  ): Promise<string> {
    return await this.iface.encodeFunctionData("getTraceability", [
      dataId,
      businessContractAddress
    ]);
  }
}

const traceability = new BuiltinContract(
  "溯源合约",
  "zltc_QLbz7JHiBTspUvTPzLHy5biDS9mu53mmv",
  `[
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "protocolSuite",
                "type": "uint64"
            },
            {
                "internalType": "bytes32[]",
                "name": "data",
                "type": "bytes32[]"
            }
        ],
        "name": "addProtocol",
        "outputs": [
            {
                "internalType": "uint64",
                "name": "protocolUri",
                "type": "uint64"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "ProtocolSuite",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    }
                ],
                "internalType": "struct ProtocolSuiteParam[]",
                "name": "protocols",
                "type": "tuple[]"
            }
        ],
        "name": "addProtocolBatch",
        "outputs": [
            {
                "internalType": "uint64[]",
                "name": "",
                "type": "uint64[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "protocolUri",
                "type": "uint64"
            }
        ],
        "name": "getAddress",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "updater",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    }
                ],
                "internalType": "struct credibilidity.Protocol[]",
                "name": "protocol",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "protocolUri",
                "type": "uint64"
            },
            {
                "internalType": "bytes32[]",
                "name": "data",
                "type": "bytes32[]"
            }
        ],
        "name": "updateProtocol",
        "outputs": [
            {
                "internalType": "uint64",
                "name": "protocolUri",
                "type": "uint64"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "ProtocolUri",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    }
                ],
                "internalType": "struct ProtocolParam[]",
                "name": "protocols",
                "type": "tuple[]"
            }
        ],
        "name": "updateProtocolBatch",
        "outputs": [
            {
                "internalType": "uint64[]",
                "name": "",
                "type": "uint64[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "hash",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "address",
                "type": "address"
            }
        ],
        "name": "getTraceability",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "number",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "protocol",
                        "type": "uint64"
                    },
                    {
                        "internalType": "address",
                        "name": "updater",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    }
                ],
                "internalType": "struct credibilidity.Evidence[]",
                "name": "evi",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "hash",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "address",
                "type": "address"
            }
        ],
        "name": "getTraceabilityUnsafe",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "number",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "protocol",
                        "type": "uint64"
                    },
                    {
                        "internalType": "address",
                        "name": "updater",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    }
                ],
                "internalType": "struct credibilidity.Evidence[]",
                "name": "evi",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "hash",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "address",
                "type": "address"
            }
        ],
        "name": "setDataSecret",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bool",
                "name": "IsSecret",
                "type": "bool"
            },
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "Hash",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "Address",
                        "type": "address"
                    }
                ],
                "internalType": "struct EvidenceSecret[]",
                "name": "Secrets",
                "type": "tuple[]"
            }
        ],
        "name": "setManyDataSecret",
        "outputs": [
            {
                "internalType": "uint64",
                "name": "",
                "type": "uint64"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "protocolUri",
                "type": "uint64"
            },
            {
                "internalType": "string",
                "name": "hash",
                "type": "string"
            },
            {
                "internalType": "bytes32[]",
                "name": "data",
                "type": "bytes32[]"
            },
            {
                "internalType": "address",
                "name": "address",
                "type": "address"
            }
        ],
        "name": "writeTraceability",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "protocolUri",
                "type": "uint64"
            },
            {
                "internalType": "string",
                "name": "hash",
                "type": "string"
            },
            {
                "internalType": "bytes32[]",
                "name": "data",
                "type": "bytes32[]"
            },
            {
                "internalType": "address",
                "name": "address",
                "type": "address"
            }
        ],
        "name": "writeTraceabilityUnsafe",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "protocolUri",
                "type": "uint64"
            },
            {
                "internalType": "string",
                "name": "hash",
                "type": "string"
            },
            {
                "internalType": "bytes32[]",
                "name": "data",
                "type": "bytes32[]"
            },
            {
                "internalType": "address",
                "name": "address",
                "type": "address"
            }
        ],
        "name": "writeTraceabilityWithStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "protocolUri",
                "type": "uint64"
            },
            {
                "internalType": "string",
                "name": "hash",
                "type": "string"
            },
            {
                "internalType": "bytes32[]",
                "name": "data",
                "type": "bytes32[]"
            },
            {
                "internalType": "address",
                "name": "address",
                "type": "address"
            }
        ],
        "name": "writeTraceabilityWithStatusUnsafe",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "protocolUri",
                        "type": "uint64"
                    },
                    {
                        "internalType": "string",
                        "name": "hash",
                        "type": "string"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    },
                    {
                        "internalType": "address",
                        "name": "address",
                        "type": "address"
                    }
                ],
                "internalType": "struct Business.batch[]",
                "name": "bt",
                "type": "tuple[]"
            }
        ],
        "name": "writeTraceabilityBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "protocolUri",
                        "type": "uint64"
                    },
                    {
                        "internalType": "string",
                        "name": "hash",
                        "type": "string"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    },
                    {
                        "internalType": "address",
                        "name": "address",
                        "type": "address"
                    }
                ],
                "internalType": "struct Business.batch[]",
                "name": "bt",
                "type": "tuple[]"
            }
        ],
        "name": "writeTraceabilityBatchUnsafe",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "protocolUri",
                        "type": "uint64"
                    },
                    {
                        "internalType": "string",
                        "name": "hash",
                        "type": "string"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    },
                    {
                        "internalType": "address",
                        "name": "address",
                        "type": "address"
                    }
                ],
                "internalType": "struct Business.batch[]",
                "name": "bt",
                "type": "tuple[]"
            }
        ],
        "name": "writeTraceabilityBatchWithStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "protocolUri",
                        "type": "uint64"
                    },
                    {
                        "internalType": "string",
                        "name": "hash",
                        "type": "string"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    },
                    {
                        "internalType": "address",
                        "name": "address",
                        "type": "address"
                    }
                ],
                "internalType": "struct Business.batch[]",
                "name": "bt",
                "type": "tuple[]"
            }
        ],
        "name": "writeTraceabilityBatchWithStatusUnsafe",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "hash",
                "type": "string"
            }
        ],
        "name": "quickWriteTraceability",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "hash",
                "type": "string"
            }
        ],
        "name": "getQuickTraceability",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "hash",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "address",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "unique",
                        "type": "string"
                    }
                ],
                "internalType": "struct Business.batch[]",
                "name": "bt",
                "type": "tuple[]"
            }
        ],
        "name": "getTraceabilityUnique",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "number",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "protocol",
                        "type": "uint64"
                    },
                    {
                        "internalType": "address",
                        "name": "updater",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    },
                    {
                        "internalType": "string",
                        "name": "unique",
                        "type": "string"
                    }
                ],
                "internalType": "struct credibilidity.Evidence[]",
                "name": "evi",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "protocolUri",
                        "type": "uint64"
                    },
                    {
                        "internalType": "string",
                        "name": "hash",
                        "type": "string"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "data",
                        "type": "bytes32[]"
                    },
                    {
                        "internalType": "address",
                        "name": "address",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "unique",
                        "type": "string"
                    }
                ],
                "internalType": "struct Business.batch[]",
                "name": "bt",
                "type": "tuple[]"
            }
        ],
        "name": "writeTraceabilityWithStatusUniqueBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]`
);

export { TraceabilityContract };