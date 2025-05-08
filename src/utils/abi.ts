import { Address } from "@/common/address";
import { Interface, ParamType } from "@ethersproject/abi";
import { isHexString } from "@ethersproject/bytes";

/**
 * LatticeAbi is a wrapper around the ethers Interface class.
 * It provides a more user-friendly API for encoding and decoding function data and event logs.
 */
class LatticeAbi {
  private iface: Interface;

  constructor(abiJson: string | string[]) {
    this.iface = new Interface(abiJson);
  }

  getInterface() {
    return this.iface;
  }

  getFunction(name: string) {
    const func = this.iface.getFunction(name);
    if (!func) {
      throw new Error(`Function ${name} not found in ABI`);
    }
    return func;
  }

  getEvent(name: string) {
    const event = this.iface.getEvent(name);
    if (!event) {
      throw new Error(`Event ${name} not found in ABI`);
    }
    return event;
  }

  encodeFunctionData(name: string, args?: any[]) {
    const func = this.getFunction(name);
    const convertedArgs = convertArguments(func.inputs, args ?? []);
    return this.iface.encodeFunctionData(func, convertedArgs);
  }

  decodeFunctionData(name: string, data: string) {
    const func = this.getFunction(name);
    return this.iface.decodeFunctionData(func, data);
  }

  encodeEventLog(name: string, args?: any[]) {
    const event = this.getEvent(name);
    const convertedArgs = convertArguments(event.inputs, args ?? []);
    return this.iface.encodeEventLog(event, convertedArgs);
  }

  decodeEventLog(name: string, data: string) {
    const event = this.getEvent(name);
    return this.iface.decodeEventLog(event, data);
  }
}

function convertArguments(args: ParamType[], params: any[]): any[] {
  if (args.length !== params.length) {
    throw new Error(
      `Invalid number of arguments, expected ${args.length} but got ${params.length}`
    );
  }
  return args.map((arg, index) => convertArgument(arg, params[index]));
}

function convertArgument(pt: ParamType, param: any): any {
  const tp = typeof param;
  switch (pt.baseType) {
    case "string":
      if (tp !== "string") {
        throw new Error("Invalid string, expected string");
      }
      return param;
    case "address":
      if (tp !== "string") {
        throw new Error("Invalid address, expected string");
      }
      return new Address(param).toETH();
    case "bool": {
      switch (tp) {
        case "string":
          return param.toLowerCase() === "true";
        default:
          return param;
      }
    }
    // fixed-size array and dynamic array
    case "array": {
      if (pt.arrayLength === -1) {
        // dynamic array
        return param.map((p: any) => convertArgument(pt.arrayChildren, p));
      }
      // fixed array
      return param.map((p: any) => convertArgument(pt.arrayChildren, p));
    }
    case "tuple": {
      return convertArguments(pt.components, param);
    }
    // int8 - int256
    case "int8":
    case "int16":
    case "int24":
    case "int32":
    case "int40":
    case "int48":
    case "int56":
    case "int64":
    case "int72":
    case "int80":
    case "int88":
    case "int96":
    case "int104":
    case "int112":
    case "int120":
    case "int128":
    case "int136":
    case "int144":
    case "int152":
    case "int160":
    case "int168":
    case "int176":
    case "int184":
    case "int192":
    case "int200":
    case "int208":
    case "int216":
    case "int224":
    case "int232":
    case "int240":
    case "int248":
    case "int256":
    // uint8 - uint256
    case "uint8":
    case "uint16":
    case "uint24":
    case "uint32":
    case "uint40":
    case "uint48":
    case "uint56":
    case "uint64":
    case "uint72":
    case "uint80":
    case "uint88":
    case "uint96":
    case "uint104":
    case "uint112":
    case "uint120":
    case "uint128":
    case "uint136":
    case "uint144":
    case "uint152":
    case "uint160":
    case "uint168":
    case "uint176":
    case "uint184":
    case "uint192":
    case "uint200":
    case "uint208":
    case "uint216":
    case "uint224":
    case "uint232":
    case "uint240":
    case "uint248":
    case "uint256":
      if (tp === "string" || tp === "number") {
        return BigInt(param);
      }
      throw new Error("Invalid int, expected string or number");
    // bytes1 - bytes32
    case "bytes1":
    case "bytes2":
    case "bytes3":
    case "bytes4":
    case "bytes5":
    case "bytes6":
    case "bytes7":
    case "bytes8":
    case "bytes9":
    case "bytes10":
    case "bytes11":
    case "bytes12":
    case "bytes13":
    case "bytes14":
    case "bytes15":
    case "bytes16":
    case "bytes17":
    case "bytes18":
    case "bytes19":
    case "bytes20":
    case "bytes21":
    case "bytes22":
    case "bytes23":
    case "bytes24":
    case "bytes25":
    case "bytes26":
    case "bytes27":
    case "bytes28":
    case "bytes29":
    case "bytes30":
    case "bytes31":
    case "bytes32":
      if (!isHexString(param)) {
        throw new Error("Invalid bytes, expected hex string");
      }
      return param;
    default:
      return param;
  }
}

export { convertArguments, convertArgument, LatticeAbi };