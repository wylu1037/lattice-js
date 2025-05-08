import { PeekabooContract } from "@/lattice/builtin/index";

describe("Peekaboo", () => {
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
});