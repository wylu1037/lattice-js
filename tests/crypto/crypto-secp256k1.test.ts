import {NIST} from "../../src/crypto/crypto-secp256k1";
import {Curve} from "../../src/common/enums";
import {expect} from "chai";

describe('secp256k1', () => {
    it('should', async () => {
        let crypto = new NIST();
        let {privateKey, publicKey} = await crypto.generateKeyPair(Curve.SECP256K1);
        const expectedPrivateKeySize = 32;
        const expectedPublicKeySize = 65;
        console.log(privateKey.toString("hex"));
        console.log(publicKey.toString("hex"));
        expect(privateKey.length).to.equal(expectedPrivateKeySize);
        expect(publicKey.length).to.equal(expectedPublicKeySize);
    });
})