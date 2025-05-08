import { LatticeAbi } from "@/utils/index";
import { BuiltinContract } from "./types";

interface Peekaboo {
  togglePayloadVisibility(hash: string, isVisible: boolean): Promise<string>;
}

class PeekabooContract implements Peekaboo {
  private readonly iface: LatticeAbi;

  constructor() {
    this.iface = peekaboo.getLatticeInterface();
  }

  async togglePayloadVisibility(
    hash: string,
    isVisible: boolean
  ): Promise<string> {
    const method = isVisible ? "delPayload" : "addPayload"; // delPayload 删除隐藏记录, addPayload 添加隐藏记录
    return await this.iface.encodeFunctionData(method, [hash]);
  }
}

/**
 * Peekaboo contract
 */
const peekaboo = new BuiltinContract(
  "区块隐藏合约",
  "zltc_a8Nx2gcs2XHye7MKVWykdanumqDkWXqRH",
  `[
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_hash",
                "type": "bytes32"
            }
        ],
        "name": "addCode",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_hash",
                "type": "bytes32"
            }
        ],
        "name": "addHash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_hash",
                "type": "bytes32"
            }
        ],
        "name": "addPayload",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32[]",
                "name": "_hash",
                "type": "bytes32[]"
            }
        ],
        "name": "batchAddPayload",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32[]",
                "name": "_hash",
                "type": "bytes32[]"
            }
        ],
        "name": "batchDelPayload",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_hash",
                "type": "bytes32"
            }
        ],
        "name": "delCode",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_hash",
                "type": "bytes32"
            }
        ],
        "name": "delHash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_hash",
                "type": "bytes32"
            }
        ],
        "name": "delPayload",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]`
);

export { PeekabooContract };