import { LatticeAbi } from "@/utils/abi";
import { BuiltinContract, type UploadKeyRequest } from "./types";

interface ModifyChainConfiguration {
  changePeriod(period: number): Promise<string>;
  addLatcSaint(latcSaint: string[]): Promise<string>;
  addLatcSaintNew(nodes: UploadKeyRequest[]): Promise<string>;
  delLatcSaint(latcSaint: string[]): Promise<string>;
  replaceLatcSaint(oldSaint: string, newSaint: string): Promise<string>;
  replaceLatcSaintNew(oldSaint: string, publicKey: string): Promise<string>;
  replacePreacher(oldSaint: string, newSaint: string): Promise<string>;
  isDictatorship(isDictatorship: boolean): Promise<string>;
  switchIsContractVote(isContractVote: boolean): Promise<string>;
  switchContractPermission(contractPermission: boolean): Promise<string>;
  switchConsensus(consensus: string): Promise<string>;
  switchDeployRule(deployRule: number): Promise<string>;
  switchNoEmptyAnchor(noEmptyAnchor: boolean): Promise<string>;
  changeEmptyAnchorPeriodMul(emptyAnchorPeriodMul: number): Promise<string>;
  changeProposalExpireTime(proposalExpireTime: number): Promise<string>;
  changeChainByChainVote(chainByChainVote: number): Promise<string>;
}

class ModifyChainConfigurationContract implements ModifyChainConfiguration {
  private readonly iface: LatticeAbi;

  constructor() {
    this.iface = modifyChainConfiguration.getLatticeInterface();
  }

  async changePeriod(period: number): Promise<string> {
    return await this.iface.encodeFunctionData("changePeriod", [period]);
  }

  async addLatcSaint(latcSaint: string[]): Promise<string> {
    return await this.iface.encodeFunctionData("addLatcSaint", [latcSaint]);
  }

  async addLatcSaintNew(nodes: UploadKeyRequest[]): Promise<string> {
    return await this.iface.encodeFunctionData("addLatcSaintNew", [nodes]);
  }

  async delLatcSaint(latcSaint: string[]): Promise<string> {
    return await this.iface.encodeFunctionData("delLatcSaint", [latcSaint]);
  }

  async replaceLatcSaint(oldSaint: string, newSaint: string): Promise<string> {
    return await this.iface.encodeFunctionData("replaceLatcSaint", [
      oldSaint,
      newSaint
    ]);
  }

  async replaceLatcSaintNew(
    oldSaint: string,
    publicKey: string
  ): Promise<string> {
    return await this.iface.encodeFunctionData("replaceLatcSaintNew", [
      oldSaint,
      publicKey
    ]);
  }

  async replacePreacher(oldSaint: string, newSaint: string): Promise<string> {
    return await this.iface.encodeFunctionData("replacePreacher", [
      oldSaint,
      newSaint
    ]);
  }

  async isDictatorship(isDictatorship: boolean): Promise<string> {
    return await this.iface.encodeFunctionData("isDictatorship", [
      isDictatorship
    ]);
  }

  async switchIsContractVote(isContractVote: boolean): Promise<string> {
    return await this.iface.encodeFunctionData("switchIsContractVote", [
      isContractVote
    ]);
  }

  async switchContractPermission(contractPermission: boolean): Promise<string> {
    return await this.iface.encodeFunctionData("switchContractPermission", [
      contractPermission
    ]);
  }

  async switchConsensus(consensus: string): Promise<string> {
    return await this.iface.encodeFunctionData("switchConsensus", [consensus]);
  }

  async switchDeployRule(deployRule: number): Promise<string> {
    return await this.iface.encodeFunctionData("switchDeployRule", [
      deployRule
    ]);
  }

  async switchNoEmptyAnchor(noEmptyAnchor: boolean): Promise<string> {
    return await this.iface.encodeFunctionData("switchNoEmptyAnchor", [
      noEmptyAnchor
    ]);
  }

  async changeEmptyAnchorPeriodMul(
    emptyAnchorPeriodMul: number
  ): Promise<string> {
    return await this.iface.encodeFunctionData("changeEmptyAnchorPeriodMul", [
      emptyAnchorPeriodMul
    ]);
  }

  async changeProposalExpireTime(proposalExpireTime: number): Promise<string> {
    return await this.iface.encodeFunctionData("changeProposalExpireTime", [
      proposalExpireTime
    ]);
  }

  async changeChainByChainVote(chainByChainVote: number): Promise<string> {
    return await this.iface.encodeFunctionData("changeChainByChainVote", [
      chainByChainVote
    ]);
  }
}

const modifyChainConfiguration = new BuiltinContract(
  "修改链配置",
  "zltc_ZwuhH4dudz2Md2h6NFgHc8yrFUhKy2UUZ",
  `[
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "Period",
                "type": "uint256"
            }
        ],
        "name": "changePeriod",
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
                "internalType": "address[]",
                "name": "LatcSaint",
                "type": "address[]"
            }
        ],
        "name": "addLatcSaint",
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
                "components": [
                    {
                        "internalType": "bytes",
                        "name": "publicKey",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct UploadKeyParam[]",
                "name": "nodes",
                "type": "tuple[]"
            }
        ],
        "name": "addLatcSaintNew",
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
                "internalType": "address[]",
                "name": "LatcSaint",
                "type": "address[]"
            }
        ],
        "name": "delLatcSaint",
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
                "internalType": "address",
                "name": "oldSaint",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "newSaint",
                "type": "address"
            }
        ],
        "name": "replaceLatcSaint",
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
                "internalType": "address",
                "name": "oldSaint",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "newSaint",
                "type": "address"
            }
        ],
        "name": "replacePreacher",
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
                "internalType": "address",
                "name": "oldSaint",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "publicKey",
                "type": "bytes"
            }
        ],
        "name": "replaceLatcSaintNew",
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
                "internalType": "bool",
                "name": "IsDictatorship",
                "type": "bool"
            }
        ],
        "name": "isDictatorship",
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
                "internalType": "bool",
                "name": "isContractVote",
                "type": "bool"
            }
        ],
        "name": "switchIsContractVote",
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
                "internalType": "bool",
                "name": "contractPermission",
                "type": "bool"
            }
        ],
        "name": "switchContractPermission",
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
                "name": "Consensus",
                "type": "string"
            }
        ],
        "name": "switchConsensus",
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
                "internalType": "uint8",
                "name": "deployRule",
                "type": "uint8"
            }
        ],
        "name": "switchDeployRule",
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
                "internalType": "bool",
                "name": "noEmptyAnchor",
                "type": "bool"
            }
        ],
        "name": "switchNoEmptyAnchor",
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
                "internalType": "uint64",
                "name": "emptyAnchorPeriodMul",
                "type": "uint64"
            }
        ],
        "name": "changeEmptyAnchorPeriodMul",
        "outputs": [],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "proposalExpireTime",
                "type": "uint64"
            }
        ],
        "name": "changeProposalExpireTime",
        "outputs": [],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint8",
                "name": "chainByChainVote",
                "type": "uint8"
            }
        ],
        "name": "changeChainByChainVote",
        "outputs": [],
        "stateMutability": "pure",
        "type": "function"
    }
]`
);

export {
  type ModifyChainConfiguration,
  ModifyChainConfigurationContract,
  modifyChainConfiguration
};
