import { BigInteger } from "jsbn";
import { convertBigIntegerToHexString } from "../../common/converter";

// ASN1 Object, ASN1 is Abstract Syntax Notation One
class ASN1Object {
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
    this.tag = "00";
    this.length = "00";
    this.value = "";
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

  getValue(): string {
    // default implementation
    return this.value;
  }

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
    this.tag = "02"; // tag for integer
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
    this.tag = "30"; // tag for sequence
    this.asn1Array = asn1Array;
  }

  getValue(): string {
    this.value = this.asn1Array
      .map((asn1) => asn1.getEncodedHexString())
      .join("");
    return this.value;
  }
}

// get the occupied bytes of the length field
function getLenOfLengthField(value: string, start: number): number {
  // the + symbol is used to convert the string to number
  // the first 2 bits of the encoded value represent the tag field,
  // the next 2 bits represent the length field
  if (+value[start + 2] < 8) {
    // if value field is in short form, only 1 byte is used to represent the length
    return 1;
  }

  // if value field is in long form
  const lengthFiled = +value.substring(start + 2, start + 4);

  // 0x7f equals to 01111111 in binary, equals 127 in decimal,
  // 0x7f + 1 equals to 10000000 in binary, equals 128 in decimal.
  // Example: 0101 & 0011 = 0001
  return lengthFiled & (0x7f + 1);
}

// get the length field
function getLengthField(value: string, start: number): number {
  const len = getLenOfLengthField(value, start);
  const lengthField = value.substring(start + 2, start + 2 + len * 2);

  if (!lengthField) {
    return -1;
  }
  const bigInt =
    +lengthField[0] < 8
      ? new BigInteger(lengthField, 16)
      : new BigInteger(lengthField.substring(2, lengthField.length), 16);

  return bigInt.intValue();
}

// get the start of the value field
function getStartOfValueField(value: string, start: number): number {
  const len = getLenOfLengthField(value, start);
  // +1 because the tag field itself is also counted
  // *2 because each byte is represented by 2 hexadecimal digits
  return start + (len + 1) * 2;
}

// encode the signature to DER format,
// r and s are the components of the signature,
// r represents the x coordinate of the point R,
// s represents the signature value, contains the message hash, private key and r.
export function encodeDER(r: BigInteger, s: BigInteger): string {
  const derR = new DERInteger(r);
  const derS = new DERInteger(s);
  const derSequence = new DERSequence([derR, derS]);

  return derSequence.getEncodedHexString();
}

export interface DecodedSignature {
  r: BigInteger;
  s: BigInteger;
}

// decode the signature from DER format
export function decodeDER(value: string): DecodedSignature {
  if (value.length < 8 || value.substring(0, 2) !== "30") {
    throw new Error("Invalid DER encoded signature");
  }

  // value = | tSequence | lSequence | vSequence |
  // vSequence = | tR | lR | vR | tS | lS | vS |
  const start = getStartOfValueField(value, 0);
  if (start >= value.length) {
    throw new Error("Invalid DER length");
  }

  const vIndexR = getStartOfValueField(value, start);
  const lR = getLengthField(value, start);
  if (vIndexR + lR * 2 > value.length) {
    throw new Error("Invalid R value length");
  }
  const vR = value.substring(vIndexR, vIndexR + lR * 2);

  const nextStart = vIndexR + vR.length;
  const vIndexS = getStartOfValueField(value, nextStart);
  const lS = getLengthField(value, nextStart);
  if (vIndexS + lS * 2 > value.length) {
    throw new Error("Invalid S value length");
  }
  const vS = value.substring(vIndexS, vIndexS + lS * 2);

  return { r: new BigInteger(vR, 16), s: new BigInteger(vS, 16) };
}

export { ASN1Object };
