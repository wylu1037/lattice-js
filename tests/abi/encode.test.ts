import { Interface } from "@ethersproject/abi";
import { expect } from "chai";

describe("abi encode", () => {
    it("should encode", () => {
        const abi = [
            "function transfer(address to, uint256 value) public returns (bool)"
          ];
          const iface = new Interface(abi);
          
          const data = iface.encodeFunctionData('transfer', [
            '0x1234567890123456789012345678901234567890',
            1000n
          ]);
          const expected = "0xa9059cbb00000000000000000000000012345678901234567890123456789012345678900000000000000000000000000000000000000000000000000000000000003e8";
          expect(data).to.equal(expected);
    });
});
