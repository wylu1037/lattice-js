import { describe, it } from 'mocha';
import { expect } from 'chai';
import { ASN1Object } from '../../../src/crypto/sm2/asn1';

describe('ASN1', () => {
  describe('getLength', () => {
    it('should return the length of the value in short form', () => {
      const asn1 = new ASN1Object();
      asn1.value = '00';
      const actual = asn1.getLength();
      const expected = '1';
      expect(actual).to.equal(expected);
    });

    it('should return the length of the value in long form', () => {
      const asn1 = new ASN1Object();
      asn1.value =
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
      const actual = asn1.getLength();
      const expected = '1';
      console.log('actual: ' + actual);
      expect(actual).to.equal(expected);
    });
  });
});
