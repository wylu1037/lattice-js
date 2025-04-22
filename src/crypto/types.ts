export interface KeyPair {
    // 32 bytes
    privateKey: Buffer;
    // 65 bytes, uncompressed public key
    publicKey: Buffer;
}