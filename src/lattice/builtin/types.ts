import { LatticeAbi } from "@/utils/index";

/**
 * Builtin contract
 */
class BuiltinContract {
  private readonly description: string;
  private readonly address: string;
  private readonly abiString: string;

  /**
   * @param description - The description of the contract
   * @param address - The address of the contract
   * @param abiString - The abi string of the contract
   */
  constructor(description: string, address: string, abiString: string) {
    this.description = description;
    this.address = address;
    this.abiString = abiString;
  }

  getLatticeInterface() {
    return new LatticeAbi(this.abiString);
  }

  getAddress() {
    return this.address;
  }
}

export { BuiltinContract };
