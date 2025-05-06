// The prefix of zltc address
export const ADDRESS_TITLE = 'zltc';
// The version of zltc address
export const ADDRESS_VERSION: number = 1;
// The length of the address bytes
export const ADDRESS_BYTES_LENGTH = 20;
// The prefix of hex string
export const HEX_PREFIX: string = '0x';
// The remark of sm2p256v1 signature, hex string
export const SM2P256V1_SIGNATURE_REMARK: string = '01';
// The length of the sm2p256v1 signature
export const SM2P256V1_SIGNATURE_LENGTH: number = 97;
// The zero hash
export const ZERO_HASH: string = '0x0000000000000000000000000000000000000000000000000000000000000000';
// The zero address
export const ZERO_ADDRESS: string = 'zltc_QLbz7JHiBTspS962RLKV8GndWFwjA5K66';

// The types of the transaction
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

// The curve of the key pair
export const Curves = {
    Secp256k1: 'Secp256k1',
    Sm2p256v1: 'Sm2p256v1',
} as const;
export type Curve = typeof Curves[keyof typeof Curves];