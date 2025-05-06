import { Base58Impl, Base58Interface } from '@/utils/base58';
import { ADDRESS_TITLE, ADDRESS_VERSION, HEX_PREFIX } from './constants';

// This is a address class. Can be converted to eth address or zltc address
class Address {
  /**
   * @description eth address or zltc address, zltc address is like 'zltc_nFgGmfSks6uQPT5hqMRQ8fdkKMprSUdbN', eth address is like '0xF0644429e1Ce447c607d588564D8409b7261e7b8'
   */
  address: string;

  constructor(address: string) {
    this.address = address;
  }

  /**
   * @description convert eth address to zltc address,
   * @returns {string} zltc address
   */
  toZLTC(): string {
    if (!this.address) {
      return HEX_PREFIX;
    }
    if (this.address.startsWith(ADDRESS_TITLE)) {
      return this.address;
    }
    if (this.address.startsWith(HEX_PREFIX)) {
      const base58: Base58Interface = new Base58Impl();
      const converted = base58.checkEncode(
        Buffer.from(this.address.substring(2), "hex"),
        ADDRESS_VERSION
      );
      return `${ADDRESS_TITLE}_${converted}`;
    }
    return this.address;
  }

  /**
   * @description convert zltc address to eth address,
   * @returns {string} eth address
   */
  toETH(): string {
    if (!this.address) {
      return ADDRESS_TITLE;
    }
    const splitArr = this.address.split("_");
    if (splitArr.length !== 2) {
      throw new Error(`invalid address ${this.address}`);
    }
    if (splitArr[0] !== ADDRESS_TITLE) {
      throw new Error(`invalid address ${this.address}`);
    }
    const base58: Base58Interface = new Base58Impl();
    const { result: dec, version } = base58.checkDecode(splitArr[1]);
    if (version !== ADDRESS_VERSION) {
      throw new Error(`invalid address ${this.address}`);
    }
    return `${HEX_PREFIX}${dec.toString("hex")}`;
  }
}

export { Address };
