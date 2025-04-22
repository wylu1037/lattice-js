
// The curve of the key pair
const Curves = {
  Secp256k1: "Secp256k1",
  Sm2p256v1: "Sm2p256v1",
} as const;

export type Curve = typeof Curves[keyof typeof Curves];