import { CryptoInterface, KeyPair } from './crypto';

export class GM implements CryptoInterface {
  generateKeyPair(): KeyPair {
    return { privateKey: Buffer.from(''), publicKey: Buffer.from('') };
  }

  compressPublicKey(publicKey: Buffer | string): Buffer {
    return Buffer.from('0x');
  }
}
