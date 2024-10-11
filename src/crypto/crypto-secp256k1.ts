import {CryptoInterface, KeyPair} from "./crypto";
import {secp256k1} from "ethereum-cryptography/secp256k1";
import {getRandomBytes} from "ethereum-cryptography/random";

class NIST implements CryptoInterface {
    async generateKeyPair(): Promise<KeyPair> {
        // Generate a random private key
        let privateKey: Uint8Array;
        do {
            privateKey = await getRandomBytes(32);
        } while (!secp256k1.utils.isValidPrivateKey(privateKey));

        // Get the corresponding public key
        const isCompressed = false;
        const publicKey = secp256k1.getPublicKey(privateKey, isCompressed);

        return {privateKey: Buffer.from(privateKey), publicKey: Buffer.from(publicKey)};
    }
}

export {NIST}
