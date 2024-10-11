import {CryptoInterface, KeyPair} from "./crypto";

class GM implements CryptoInterface {
    async generateKeyPair(): Promise<KeyPair> {
        return {privateKey: Buffer.from(""), publicKey: Buffer.from("")};
    }

}