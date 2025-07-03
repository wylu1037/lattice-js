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

  getAbi() {
    return this.abiString;
  }
}

type writeTraceabilityRequest = {
  protocolUri: number;
  dataId: string;
  data: string[];
  businessContractAddress: string;
};

interface UploadKeyRequest {
  publicKey: string; // bytes类型，公钥数据
}

export {
  BuiltinContract,
  type writeTraceabilityRequest,
  type UploadKeyRequest
};
