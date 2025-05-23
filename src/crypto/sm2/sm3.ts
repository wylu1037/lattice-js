import {
  Hash,
  Input,
  createView,
  toBytes,
  wrapConstructor,
} from "@/crypto/sm3/utils";

const BoolA = (A: number, B: number, C: number) => (A & B) | (A & C) | (B & C);
const BoolB = (A: number, B: number, C: number) => A ^ B ^ C;
const BoolC = (A: number, B: number, C: number) => (A & B) | (~A & C);

// Polyfill for Safari 14
function setBigUint64(
  view: DataView,
  byteOffset: number,
  value: bigint,
  isLE: boolean
): void {
  if (typeof view.setBigUint64 === "function") view.setBigUint64(byteOffset, value, isLE);
  const _32n = BigInt(32);
  const _u32_max = BigInt(0xffffffff);
  const wh = Number((value >> _32n) & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE ? 4 : 0;
  const l = isLE ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE);
  view.setUint32(byteOffset + l, wl, isLE);
}

/**
 * 循环左移
 */
export function rotl(x: number, n: number) {
  const s = n & 31;
  return (x << s) | (x >>> (32 - s));
}

/**
 * 二进制异或运算
 */
function xor(x: Uint8Array, y: Uint8Array) {
  const result = new Uint8Array(x.length);
  for (let i = x.length - 1; i >= 0; i--) result[i] = (x[i] ^ y[i]) & 0xff;
  return result;
}

/**
 * 压缩函数中的置换函数 P0(X) = X xor (X <<< 9) xor (X <<< 17)
 */
function P0(X: number) {
  return X ^ rotl(X, 9) ^ rotl(X, 17);
}

/**
 * 消息扩展中的置换函数 P1(X) = X xor (X <<< 15) xor (X <<< 23)
 */
function P1(X: number) {
  return X ^ rotl(X, 15) ^ rotl(X, 23);
}

// Base SHA2 class (RFC 6234)
export abstract class SHA2<T extends SHA2<T>> extends Hash<T> {
  protected abstract process(buf: DataView, offset: number): void;
  protected abstract get(): number[];
  protected abstract set(...args: number[]): void;
  abstract destroy(): void;
  protected abstract roundClean(): void;
  // For partial updates less than block size
  protected buffer: Uint8Array;
  protected view: DataView;
  protected finished = false;
  protected length = 0;
  protected pos = 0;
  protected destroyed = false;

  constructor(
    readonly blockLen: number,
    public outputLen: number,
    readonly padOffset: number,
    readonly isLE: boolean
  ) {
    super();
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data: Input): this {
    const { view, buffer, blockLen } = this;
    data = toBytes(data);
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out: Uint8Array) {
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 0b10000000;
    this.buffer.subarray(pos).fill(0);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++) buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length) throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++) oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to?: T): T {
    to ||= new (this.constructor as any)() as T;
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.length = length;
    to.pos = pos;
    to.finished = finished;
    to.destroyed = destroyed;
    if (length % blockLen) to.buffer.set(buffer);
    return to;
  }
}

const IV = new Uint32Array([
  0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa,
  0xe38dee4d, 0xb0fb0e4e,
]);
const SM3_W = new Uint32Array(68);
const SM3_M = new Uint32Array(64);

const T1 = 0x79cc4519;
const T2 = 0x7a879d8a;

class SM3 extends SHA2<SM3> {
  A = IV[0] | 0;
  B = IV[1] | 0;
  C = IV[2] | 0;
  D = IV[3] | 0;
  E = IV[4] | 0;
  F = IV[5] | 0;
  G = IV[6] | 0;
  H = IV[7] | 0;

  constructor() {
    super(64, 32, 8, false);
  }
  protected get(): [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ] {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  protected set(
    A: number, B: number, C: number, D: number, E: number, F: number, G: number, H: number
  ) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  protected process(view: DataView, offset: number): void {
    for (let i = 0; i < 16; i++, offset += 4)
      SM3_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 68; i++) {
      SM3_W[i] =
        P1(SM3_W[i - 16] ^ SM3_W[i - 9] ^ rotl(SM3_W[i - 3], 15)) ^
        rotl(SM3_W[i - 13], 7) ^
        SM3_W[i - 6];
    }
    for (let i = 0; i < 64; i++) {
      SM3_M[i] = SM3_W[i] ^ SM3_W[i + 4];
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let j = 0; j < 64; j++) {
      const small = j >= 0 && j <= 15;
      const T = small ? T1 : T2;
      const SS1 = rotl(rotl(A, 12) + E + rotl(T, j), 7);
      const SS2 = SS1 ^ rotl(A, 12);
      const TT1 = ((small ? BoolB(A, B, C) : BoolA(A, B, C)) + D + SS2 + SM3_M[j]) | 0;
      const TT2 = ((small ? BoolB(E, F, G) : BoolC(E, F, G)) + H + SS1 + SM3_W[j]) | 0;
      D = C;
      C = rotl(B, 9);
      B = A;
      A = TT1;
      H = G;
      G = rotl(F, 19);
      F = E;
      E = P0(TT2);
    }
    A = (A ^ this.A) | 0;
    B = (B ^ this.B) | 0;
    C = (C ^ this.C) | 0;
    D = (D ^ this.D) | 0;
    E = (E ^ this.E) | 0;
    F = (F ^ this.F) | 0;
    G = (G ^ this.G) | 0;
    H = (H ^ this.H) | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  protected roundClean() {
    SM3_W.fill(0);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    this.buffer.fill(0);
  }
}

export const sm3 = wrapConstructor(() => new SM3());