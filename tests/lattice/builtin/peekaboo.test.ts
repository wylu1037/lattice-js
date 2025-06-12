import { PeekabooContract } from "@/lattice/builtin/index";

describe("Peekaboo", () => {
  describe("toggle payload visibility", () => {
    it("should toggle payload visibility", async () => {
      const peekaboo = new PeekabooContract();
      const code = await peekaboo.togglePayloadVisibility(
        "0x85d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd",
        true
      );
      const expected =
        "0x28eadcc885d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd";
      expect(code).toBe(expected);
    });

    it("should close payload visibility ", async () => {
      const peekaboo = new PeekabooContract();
      const code = await peekaboo.togglePayloadVisibility(
        "0x85d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd",
        false
      );
      const expected =
        "0x0961e3da85d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd";
      expect(code).toBe(expected);
    });
  });

  describe("toggle code visibility", () => {
    it("should open code visibility ", async () => {
      const peekaboo = new PeekabooContract();
      const code = await peekaboo.toggleCodeVisibility(
        "0x85d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd",
        true
      );
      const expected =
        "0xfdb2787485d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd";
      expect(code).toBe(expected);
    });

    it("should close code visibility ", async () => {
      const peekaboo = new PeekabooContract();
      const code = await peekaboo.toggleCodeVisibility(
        "0x85d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd",
        false
      );
      const expected =
        "0xbd63758085d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd";
      expect(code).toBe(expected);
    });
  });

  describe("toggle hash visibility", () => {
    it("should toggle hash visibility", async () => {
      const peekaboo = new PeekabooContract();
      const hash = await peekaboo.toggleHashVisibility(
        "0x85d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd",
        true
      );
      const expected =
        "0xbf5d762585d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd";
      expect(hash).toBe(expected);
    });

    it("should close hash visibility ", async () => {
      const peekaboo = new PeekabooContract();
      const hash = await peekaboo.toggleHashVisibility(
        "0x85d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd",
        false
      );
      const expected =
        "0x43e08ad185d6713b14264b030b7c4f71224691d866c0058e9cdba5e0cc417b47d6003ecd";
      expect(hash).toBe(expected);
    });
  });
});