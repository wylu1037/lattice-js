// The prefix of zltc address
export const ADDRESS_TITLE = 'zltc';
// The version of zltc address
export const ADDRESS_VERSION: number = 1;
// The length of the address bytes
export const ADDRESS_BYTES_LENGTH = 20;
// The prefix of hex string
export const HEX_PREFIX: string = '0x';

export const ZERO_HASH: string = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const TransactionTypes = {
    Genesis: 'genesis', // 创世纪交易
    Create: 'create', // 创建交易
    Send: 'send', // 发送交易
    Receive: 'receive', // 接收交易
    DeployContract: 'contract', // 部署合约交易
    CallContract: 'execute', // 调用合约交易
    UpgradeContract: 'update', // 升级合约交易
} as const;

export type TransactionType = typeof TransactionTypes[keyof typeof TransactionTypes];

export const TransactionTypeCodeRecord: Record<TransactionType, number> = {
    [TransactionTypes.Genesis]: 0,
    [TransactionTypes.Create]: 1,
    [TransactionTypes.Send]: 2,
    [TransactionTypes.Receive]: 3,
    [TransactionTypes.DeployContract]: 4,
    [TransactionTypes.CallContract]: 5,
    [TransactionTypes.UpgradeContract]: 6,
} as const;