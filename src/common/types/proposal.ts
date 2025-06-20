import {
  ContractLifecyclePeriod,
  ProposalState,
  ProposalType,
  VotingRule
} from "../constants";

interface Proposal<
  T =
    | ContractLifecycleProposal
    | ModifyChainConfigurationProposal
    | SubchainProposal
> {
  proposalType: ProposalType;
  proposalContent: T;
}

// 合约生命周期提案
interface ContractLifecycleProposal {
  proposalId: string;
  proposalState: ProposalState;
  nonce: number;
  contractAddress: string;
  isRevole: number;
  period: ContractLifecyclePeriod;
  createAt: number;
  modifiedAt: number;
  dbNumber: number;
}

// 修改链配置提案
interface ModifyChainConfigurationProposal {
  proposalId: string;
  proposalState: ProposalState;
  nonce: number;
  modifyType: number;
  period: number;
  isDictatorship: boolean;
  noEmptyAnchor: boolean;
  deployRule: VotingRule;
  latcSaint: string[];
  consensus: string;
}

// 以链建链的提案内容
interface SubchainProposal {
  proposalId?: string;
  proposalState?: ProposalState;
  chainConfig?: {
    newChain?: {
      chainId?: number;
      name?: string;
      period?: number;
      tokenless?: boolean;
      noEmptyAnchor?: boolean;
      emptyAnchorPeriodMul?: number;
      isContractVote?: boolean;
      isDictatorship?: boolean;
      deployRule?: VotingRule;
      contractPermission?: boolean;
    };
    consensus?: string;
    timestamp?: number;
    parentHash?: string;
    joinProposalId?: string; // the proposal id that apply for join subchain
  };
}

export type {
  Proposal,
  ContractLifecycleProposal,
  ModifyChainConfigurationProposal,
  SubchainProposal
};