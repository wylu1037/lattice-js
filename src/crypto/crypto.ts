export interface KeyPair {
    // 32 bytes
    privateKey: Buffer;
    // 65 bytes, uncompressed public key
    publicKey: Buffer;
}

export interface CryptoInterface {
    // generate key pair
    // return private key and public key
    generateKeyPair(): KeyPair;

    // compress public key
    compressPublicKey(publicKey: Buffer | string): Buffer;
}