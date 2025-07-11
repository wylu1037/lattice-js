import { Address } from "@/common/types/address";

describe("Address", () => {
  describe("convert eth to zltc", () => {
    it("should return zltc_dhdfbm9JEoyDvYoCDVsABiZj52TAo9Ei6", () => {
      const address = new Address("0x9293c604c644BfAc34F498998cC3402F203d4D6B");
      const actual = address.toZLTC();
      const expected = "zltc_dhdfbm9JEoyDvYoCDVsABiZj52TAo9Ei6";
      expect(actual).toBe(expected);
    });

    it("should convert zltc to eth", () => {
      const address = new Address("zltc_dhdfbm9JEoyDvYoCDVsABiZj52TAo9Ei6");
      const actual = address.toETH();
      const expected = "0x9293c604c644BfAc34F498998cC3402F203d4D6B";
      expect(actual).toBe(expected.toLowerCase());
    });
  });
});
