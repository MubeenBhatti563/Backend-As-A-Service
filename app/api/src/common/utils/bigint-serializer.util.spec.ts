import {
  registerBigIntSerialization,
  safeBigIntReplacer,
  safeJsonStringify,
} from './bigint-serializer.util';

describe('BigIntSerializer', () => {
  describe('safeBigIntReplacer', () => {
    it('should convert BigInt values to strings', () => {
      expect(safeBigIntReplacer('count', 1234567890123456789n)).toBe(
        '1234567890123456789',
      );
      expect(safeBigIntReplacer('regular', 'hello')).toBe('hello');
      expect(safeBigIntReplacer('num', 42)).toBe(42);
    });
  });

  describe('safeJsonStringify', () => {
    it('should serialize nested objects containing BigInt without throwing', () => {
      const payload = {
        id: 'metric-1',
        bytes: 1073741824000n,
        nested: {
          requests: 9876543210n,
        },
      };

      const json = safeJsonStringify(payload);
      expect(json).toBe(
        '{"id":"metric-1","bytes":"1073741824000","nested":{"requests":"9876543210"}}',
      );
    });
  });

  describe('registerBigIntSerialization', () => {
    it('should enable standard JSON.stringify to serialize BigInts via toJSON', () => {
      registerBigIntSerialization();

      const obj = { value: 9007199254740993n };
      expect(() => JSON.stringify(obj)).not.toThrow();
      expect(JSON.stringify(obj)).toBe('{"value":"9007199254740993"}');
    });
  });
});
