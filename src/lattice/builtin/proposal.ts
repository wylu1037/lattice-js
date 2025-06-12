import { BuiltinContract, LatticeAbi } from "@/index";

interface Proposal {
  approve(proposalId: string): Promise<string>;
  reject(proposalId: string): Promise<string>;
  refresh(proposalId: string): Promise<string>;
  refreshBatch(proposalIds: string[]): Promise<string>;
  cancel(proposalId: string): Promise<string>;
}

class ProposalContract implements Proposal {
  private readonly iface: LatticeAbi;

  constructor() {
    this.iface = proposal.getLatticeInterface();
  }

  async approve(proposalId: string): Promise<string> {
    return await this.iface.encodeFunctionData("vote", [proposalId, 1]);
  }

  async reject(proposalId: string): Promise<string> {
    return await this.iface.encodeFunctionData("vote", [proposalId, 0]);
  }

  async refresh(proposalId: string): Promise<string> {
    return await this.iface.encodeFunctionData("refresh", [proposalId]);
  }

  async refreshBatch(proposalIds: string[]): Promise<string> {
    return await this.iface.encodeFunctionData("batchRefresh", [proposalIds]);
  }

  async cancel(proposalId: string): Promise<string> {
    return await this.iface.encodeFunctionData("cancel", [proposalId]);
  }
}

const proposal = new BuiltinContract(
  "提案合约",
  "zltc_amgWuhifLRUoZc3GSbv9wUUz6YUfTuWy5",
  `[
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ProposalId",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "VoteSuggestion",
                "type": "uint8"
            }
        ],
        "name": "vote",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ProposalId",
                "type": "string"
            }
        ],
        "name": "refresh",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string[]",
                "name": "proposalIds",
                "type": "string[]"
            }
        ],
        "name": "batchRefresh",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "proposalId",
                "type": "string"
            }
        ],
        "name": "cancel",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    }
]`
);

export { ProposalContract };