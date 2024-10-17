import { describe, it } from 'mocha';
import { expect } from 'chai';
import { BigInteger } from 'jsbn';
import { convertBigIntegerToHexString } from '../../src/common/converter';

describe('Converter', () => {
  describe('convertBigIntegerToHexString', () => {
    it('should convert BigInteger to hex string', () => {
      const bigInteger = new BigInteger('1234567890', 10);
      const hexString = convertBigIntegerToHexString(bigInteger);
      expect(hexString).to.equal('499602d2');
    });

    it('should convert -BigInteger to hex string', () => {
      const bigInteger = new BigInteger('-1234567890', 10);
      const hexString = convertBigIntegerToHexString(bigInteger);
      expect(hexString).to.equal('b669fd2e');
    });
  });
});
