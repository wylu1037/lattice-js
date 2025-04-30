import { z } from "zod";

export const HashSchema = z.string().regex(/^0x[0-9a-fA-F]{64}$/, "Invalid hash");
export type Hash = z.infer<typeof HashSchema>;

export const AddressSchema = z.union([
  z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid eth address"),
  z.string().regex(/^zltc_[0-9a-fA-F]{33}$/, "Invalid zltc address"),
]);
export type Address = z.infer<typeof AddressSchema>;

export const UInt64Schema = z.number()
  .refine(val => val >= 0, "Must be positive or zero")
  .refine(val => val <= Number.MAX_SAFE_INTEGER, "Value too large for uint64");
export type UInt64 = z.infer<typeof UInt64Schema>;