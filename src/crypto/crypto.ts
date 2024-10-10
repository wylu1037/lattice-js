import {Curve} from "../common/enums";

export interface KeyPair {
    // 32 bytes
    privateKey: Buffer;
    // 65 bytes
    publicKey: Buffer;
}

export interface CryptoInterface {
    // generate key pair
    // return private key and public key
    generateKeyPair(curve: Curve): Promise<KeyPair>;
}