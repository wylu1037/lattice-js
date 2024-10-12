import {CryptoInterface, KeyPair} from "./crypto";
import {secp256k1} from "ethereum-cryptography/secp256k1";
import {randomBytes} from '@noble/hashes/utils';
import {BigInteger} from "jsbn"

export class NIST implements CryptoInterface {
    generateKeyPair(): KeyPair {
        // Generate a random private key
        let privateKey: Uint8Array
        do {
            privateKey = randomBytes(32);
        } while (!secp256k1.utils.isValidPrivateKey(privateKey));

        // Get the corresponding public key
        const isCompressed = false;
        const uncompressedPublicKey = secp256k1.getPublicKey(privateKey, isCompressed);

        return {privateKey: Buffer.from(privateKey), publicKey: Buffer.from(uncompressedPublicKey)};
    }

    compressPublicKey(publicKey: Buffer | string): Buffer {
        let publicKeyBuffer: Buffer;
        if (typeof publicKey === "string") {
            publicKeyBuffer = Buffer.from(publicKey, "hex");
        } else {
            publicKeyBuffer = publicKey;
        }
        if (publicKeyBuffer.length != 65) {
            throw new Error(`Invalid public key length, expected size is 65, but actual size is ${publicKeyBuffer.length}`);
        }

        // calculate x coordinate and y coordinate
        const x = publicKeyBuffer.subarray(1, 33);
        const y = new BigInteger(publicKeyBuffer.subarray(33, 65).toString("hex"), 16);

        // judge whether the y coordinate is even
        // `02` represents even, `03` represents odd.
        let prefix = "02"
        if (y.mod(new BigInteger("2")).equals(BigInteger.ONE)) {
            prefix = "03"
        }

        return Buffer.from(`${prefix}${x.toString("hex")}`, "hex");
    }
}
