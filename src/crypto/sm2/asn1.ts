import { BigInteger } from 'jsbn';
import { convertBigIntegerToHexString } from '../../common/converter';

// ASN1 Object, ASN1 is Abstract Syntax Notation One
abstract class ASN1Object {
  // tlv represent "Tag-Length-Value"
  tlv: string | null;
  // tag is a 2-digit hexadecimal number, represent the type of the ASN1 object
  tag: string;
  // length is a 2-digit hexadecimal number, represent the length of the value
  length: string;
  // value is a hexadecimal string, represent the value of the ASN1 object
  value: string;

  constructor() {
    this.tlv = null;
    this.tag = '00';
    this.length = '00';
    this.value = '';
  }

  // get the length of the value in hex string
  getLength(): string {
    const n = this.value.length / 2; // byte length of the value
    let nHex = n.toString(16);
    if (nHex.length % 2 === 0) nHex = `0${nHex}`; // padding to even length

    if (n < 128) {
      // short form, start with 0
      return nHex;
    }

    // long form, start with 1
    // 128 equals to 10000000 in binary, which is 1(1bit) + 7(7bit)
    // 1 represent the long form, 7 represent the length of the length
    const head = 128 + nHex.length / 2;
    return head.toString(16) + nHex;
  }

  abstract getValue(): string;

  // get the DER encoded hex string of the ASN1 object
  getEncodedHexString(): string {
    if (!this.tlv) {
      this.value = this.getValue();
      this.length = this.getLength();
      this.tlv = this.tag + this.length + this.value;
    }

    return this.tlv;
  }
}

// DERInteger is a ASN1 object that represent an integer
class DERInteger extends ASN1Object {
  constructor(value: BigInteger) {
    super();
    this.tag = '02'; // tag for integer
    if (value) {
      this.value = convertBigIntegerToHexString(value);
    }
  }

  getValue(): string {
    return this.value;
  }
}

// DERSequence is a ASN1 object that represent a sequence.
// A sequence is a collection of ASN1 objects.
class DERSequence extends ASN1Object {
  asn1Array: Array<ASN1Object>;

  constructor(asn1Array: Array<ASN1Object>) {
    super();
    this.tag = '30'; // tag for sequence
    this.asn1Array = asn1Array;
  }

  getValue(): string {
    this.value = this.asn1Array.map((asn1) => asn1.getEncodedHexString()).join('');
    return this.value;
  }
}

export { ASN1Object };
