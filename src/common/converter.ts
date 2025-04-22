const NEGATIVE_SYMBOL = '-';

// the highest bit of hex string is 1, it means the number is negative
// the highest bit of hex string is 0, it means the number is positive
function convertBigIntToHexString(value: bigint): string {
  let hex = value.toString(16);
  const symbol = hex[0];
  if (symbol !== NEGATIVE_SYMBOL) {
    // positive number
    if (hex.length % 2 === 1) {
      hex = `0${hex}`;
    } else if (!hex.match(/^[0-7]/)) {
      // 0-7 in binary is 0000-0111,
      // because the highest bit of hex string is 0, so the number is positive
      hex = `00${hex}`;
    }
  } else {
    // negative number
    hex = hex.slice(1); // remove the negative symbol `-`
    let len = hex.length;
    if (len % 2 === 1) {
      len += 1;
    } else if (!hex.match(/^[0-7]/)) {
      len += 2;
    }

    let mask = '';
    for (let i = 0; i < len; i++) {
      mask += 'f';
    }

    // 1. convert mask to BigInt
    // 2. xor with value
    // 3. add 1
    // 4. convert to hex string
    // 5. remove the negative symbol
    const maskBigInt = BigInt(`0x${mask}`);
    const result = (maskBigInt ^ value) + BigInt(1);
    hex = result.toString(16).replace(/^-/, '');
  }
  return hex;
}

export { convertBigIntToHexString };
