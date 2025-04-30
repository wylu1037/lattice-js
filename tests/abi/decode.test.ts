import { Interface } from "@ethersproject/abi";
import { describe, expect, it } from "vitest";

describe("abi decode", () => {
    it("should decode", () => {
        const abi = [
            "function transfer(address to, uint256 value) public returns (bool)"
        ];
        const iface = new Interface(abi);
        const returnData = '0x0000000000000000000000000000000000000000000000000000000000000001';
        const result = iface.decodeFunctionResult('transfer', returnData);
        expect(result).toEqual([true]);
    });
});