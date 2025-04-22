import { weierstrass } from '@noble/curves/abstract/weierstrass';
import { Field } from '@noble/curves/abstract/modular'; // finite field for mod arithmetics
import { ONE } from './bn';
import { randomBytes } from './rng';
import { sm3 } from './sm3';
import { hmac } from './hmac';
import { concatBytes } from '@noble/curves/abstract/utils';

export const sm2Fp = Field(BigInt('115792089210356248756420345214020892766250353991924191454421193933289684991999'))
export const sm2Curve = weierstrass({
  // sm2: short weierstrass.
  a: BigInt('115792089210356248756420345214020892766250353991924191454421193933289684991996'),
  b: BigInt('18505919022281880113072981827955639221458448578012075254857346196103069175443'),
  Fp: sm2Fp,
  h: ONE,
  n: BigInt('115792089210356248756420345214020892766061623724957744567843809356293439045923'),
  Gx: BigInt('22963146547237050559479531362550074578802567295341616970375194840604139615431'),
  Gy: BigInt('85132369209828568825618990617112496413088388631904505083283536607588877201568'),
  hash: sm3,
  hmac: (key: Uint8Array, ...msgs: Uint8Array[]) => hmac(sm3, key, concatBytes(...msgs)),
  randomBytes,
});

// 有限域运算
export const field = Field(BigInt(sm2Curve.CURVE.n))