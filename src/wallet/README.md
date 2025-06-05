# Wallet Module

## Overview

本模块实现了基于BIP标准的分层确定性钱包功能，支持助记词生成、种子派生和多币种地址管理。

## BIP Standards Introduction

### BIP39 - Mnemonic Phrases (助记词)

BIP39定义了一种将随机熵转换为人类可读助记词的标准方法。

**主要特点：**

- 将128-256位的随机熵转换为12-24个助记词
- 支持多种语言的词汇表（英语、中文、日语等）
- 提供校验和机制确保助记词的有效性
- 通过PBKDF2函数将助记词转换为512位种子

**用途：**

- 便于用户备份和恢复钱包
- 提供人类友好的随机数表示方法
- 跨钱包兼容性

### BIP32 - Hierarchical Deterministic Wallets (分层确定性钱包)

BIP32定义了从单个种子生成一系列密钥对的标准，实现了分层确定性钱包。

**主要特点：**

- 从单个主种子派生无限数量的子密钥
- 支持公钥和私钥的独立派生
- 提供强化派生和非强化派生两种模式
- 使用链码(Chain Code)确保派生的安全性

**密钥派生路径：**

```
m / purpose' / coin_type' / account' / change / address_index
```

**用途：**

- 单一备份管理多个地址
- 支持确定性地址生成
- 提供账户隔离和隐私保护

### BIP44 - Multi-Account Hierarchy for Deterministic Wallets (多账户分层结构)

BIP44在BIP32基础上定义了标准的派生路径结构，为不同币种和账户提供统一的组织方式。

**标准路径结构：**

```
m / 44' / coin_type' / account' / change / address_index
```

**路径参数说明：**

- `44'`: BIP44标准标识符（强化派生）
- `coin_type'`: 币种类型（如Bitcoin=0, Ethereum=60）
- `account'`: 账户索引（从0开始）
- `change`: 找零地址标识（0=接收地址，1=找零地址）
- `address_index`: 地址索引（从0开始）

**用途：**

- 标准化多币种钱包结构
- 提供账户级别的资产隔离
- 确保不同钱包软件间的兼容性

## Standards Relationship Flowchart

### Process Flow Diagram

```mermaid
flowchart TD
    A[Random Entropy<br/>随机熵<br/>128-256 bits] --> B[BIP39<br/>Mnemonic Phrases<br/>助记词生成]

    B --> C[Mnemonic Words<br/>助记词<br/>12-24 words]

    C --> D[PBKDF2 Function<br/>密钥派生函数<br/>+ Optional Passphrase]

    D --> E[Master Seed<br/>主种子<br/>512 bits]

    E --> F[BIP32<br/>Hierarchical Deterministic<br/>分层确定性派生]

    F --> G[Master Private Key<br/>主私钥<br/>+ Chain Code]

    G --> H[BIP44<br/>Standard Derivation Path<br/>标准派生路径]

    H --> I[m/44'/coin_type'/account'/change/address_index]

    I --> J[Child Private Keys<br/>子私钥]
    I --> K[Child Public Keys<br/>子公钥]

    J --> L[Digital Signatures<br/>数字签名]
    K --> M[Wallet Addresses<br/>钱包地址]

    style A fill:#ffeeee
    style C fill:#eeffee
    style E fill:#eeeeff
    style I fill:#ffffee
    style M fill:#ffeeff
```

### Sequence Diagram - Wallet Creation and Usage

```mermaid
sequenceDiagram
    participant User as User<br/>用户
    participant App as Wallet App<br/>钱包应用
    participant BIP39 as BIP39 Module<br/>助记词模块
    participant BIP32 as BIP32 Module<br/>HD钱包模块
    participant BIP44 as BIP44 Module<br/>多账户模块
    participant Crypto as Crypto Engine<br/>密码学引擎

    Note over User, Crypto: Wallet Creation Process (钱包创建流程)

    User->>App: Create New Wallet<br/>创建新钱包
    App->>BIP39: Generate Random Entropy<br/>生成随机熵
    BIP39->>Crypto: Get 128-256 bits entropy<br/>获取随机熵
    Crypto-->>BIP39: Random bytes<br/>随机字节

    BIP39->>BIP39: Convert to Mnemonic<br/>转换为助记词
    BIP39-->>App: 12-24 word mnemonic<br/>助记词
    App-->>User: Display Mnemonic<br/>显示助记词

    Note over User, Crypto: Seed Generation (种子生成)

    User->>App: Confirm Mnemonic + Passphrase<br/>确认助记词+密码
    App->>BIP39: Generate Seed<br/>生成种子
    BIP39->>Crypto: PBKDF2(mnemonic, passphrase)<br/>密钥派生
    Crypto-->>BIP39: 512-bit Master Seed<br/>主种子
    BIP39-->>App: Master Seed<br/>主种子

    Note over User, Crypto: Master Key Generation (主密钥生成)

    App->>BIP32: Initialize HD Wallet<br/>初始化HD钱包
    BIP32->>Crypto: Generate Master Key<br/>生成主密钥
    Crypto-->>BIP32: Master Private Key + Chain Code<br/>主私钥+链码
    BIP32-->>App: HD Wallet Instance<br/>HD钱包实例

    Note over User, Crypto: Address Derivation (地址派生)

    User->>App: Request ETH Address<br/>请求以太坊地址
    App->>BIP44: Derive ETH Address<br/>派生以太坊地址
    BIP44->>BIP44: Build Path: m/44'/60'/0'/0/0<br/>构建路径
    BIP44->>BIP32: Derive Child Key<br/>派生子密钥
    BIP32->>Crypto: Key Derivation<br/>密钥派生
    Crypto-->>BIP32: Child Private Key<br/>子私钥
    BIP32-->>BIP44: Child Key Pair<br/>子密钥对
    BIP44->>Crypto: Generate Address<br/>生成地址
    Crypto-->>BIP44: ETH Address<br/>以太坊地址
    BIP44-->>App: Address + Private Key<br/>地址+私钥
    App-->>User: Display Address<br/>显示地址

    Note over User, Crypto: Transaction Signing (交易签名)

    User->>App: Sign Transaction<br/>签名交易
    App->>BIP44: Get Signing Key<br/>获取签名密钥
    BIP44->>BIP32: Derive Specific Key<br/>派生特定密钥
    BIP32-->>BIP44: Private Key<br/>私钥
    BIP44->>Crypto: Sign Transaction<br/>签名交易
    Crypto-->>BIP44: Digital Signature<br/>数字签名
    BIP44-->>App: Signed Transaction<br/>已签名交易
    App-->>User: Transaction Ready<br/>交易就绪

    Note over User, Crypto: Wallet Recovery (钱包恢复)

    User->>App: Recover Wallet<br/>恢复钱包
    App->>User: Enter Mnemonic<br/>输入助记词
    User-->>App: Mnemonic + Passphrase<br/>助记词+密码
    App->>BIP39: Validate & Generate Seed<br/>验证并生成种子
    BIP39->>BIP39: Validate Checksum<br/>验证校验和
    BIP39->>Crypto: PBKDF2 Derivation<br/>PBKDF2派生
    Crypto-->>BIP39: Master Seed<br/>主种子
    BIP39-->>App: Seed Valid<br/>种子有效
    App->>BIP32: Recreate HD Wallet<br/>重建HD钱包
    BIP32-->>App: Wallet Restored<br/>钱包已恢复
    App-->>User: Wallet Ready<br/>钱包就绪
```

## Implementation Features

### 支持的功能

1. **助记词管理**
   
   - 生成符合BIP39标准的助记词
   - 验证助记词有效性
   - 支持多语言词汇表

2. **分层密钥派生**
   
   - 实现BIP32标准的密钥派生
   - 支持强化和非强化派生
   - 公钥独立派生功能

3. **多币种支持**
   
   - 按照BIP44标准支持多种加密货币
   - 标准化的派生路径
   - 账户级别的资产隔离

4. **安全特性**
   
   - 安全的随机数生成
   - 内存敏感数据清理
   - 密码学安全的哈希函数

### 使用示例

```typescript
// 生成助记词
const mnemonic = generateMnemonic();

// 从助记词创建钱包
const wallet = createWalletFromMnemonic(mnemonic);

// 派生以太坊地址
const ethereumAddress = wallet.deriveAddress("m/44'/60'/0'/0/0");

// 派生比特币地址
const bitcoinAddress = wallet.deriveAddress("m/44'/0'/0'/0/0");
```

## Security Considerations

1. **助记词安全**
   
   - 妥善保管助记词，避免泄露
   - 考虑使用passphrase增强安全性
   - 定期备份验证

2. **密钥管理**
   
   - 避免重复使用地址
   - 使用强化派生保护上级密钥
   - 及时清理内存中的敏感数据

3. **实现安全**
   
   - 使用经过验证的密码学库
   - 实施适当的输入验证
   - 考虑硬件安全模块(HSM)集成
