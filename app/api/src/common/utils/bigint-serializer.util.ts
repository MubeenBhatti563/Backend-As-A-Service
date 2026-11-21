/**
 * Global utility to safely serialize BigInt instances when converting objects to JSON.
 */

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

/**
 * Extends BigInt.prototype with a toJSON method so standard JSON.stringify
 * will serialize BigInt values as strings instead of throwing TypeError.
 */
export function registerBigIntSerialization(): void {
  if (typeof BigInt !== 'undefined' && !('toJSON' in BigInt.prototype)) {
    Object.defineProperty(BigInt.prototype, 'toJSON', {
      value: function (this: bigint): string {
        return this.toString();
      },
      writable: true,
      configurable: true,
    });
  }
}

/**
 * Replacer function for JSON.stringify to convert BigInts to numeric strings.
 */
export function safeBigIntReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

/**
 * Safe JSON.stringify wrapper that handles BigInts without throwing.
 */
export function safeJsonStringify(
  value: unknown,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
): string {
  const combinedReplacer = (key: string, val: unknown) => {
    const afterBigInt = safeBigIntReplacer(key, val);
    return replacer ? replacer(key, afterBigInt) : afterBigInt;
  };
  return JSON.stringify(value, combinedReplacer, space);
}
