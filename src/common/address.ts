import {ADDRESS_TITLE, ADDRESS_VERSION, HEX_PREFIX} from "./constants";
import {Base58Impl, Base58Interface} from "./base58";

class Address {

    address: string;

    constructor(address: string) {
        this.address = address;
    }

    // convert eth address to zltc address
    toZLTC(): string {
        if (!this.address) {
            return HEX_PREFIX;
        }
        if (this.address.startsWith(ADDRESS_TITLE)) {
            return this.address;
        } else if (this.address.startsWith(HEX_PREFIX)) {
            const base58: Base58Interface = new Base58Impl();
            const converted = base58.checkEncode(Buffer.from(this.address.substring(2), 'hex'), ADDRESS_VERSION)
            return `${ADDRESS_TITLE}_${converted}`;
        }
        return this.address;
    }
}

export { Address };