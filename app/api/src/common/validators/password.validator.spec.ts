import {
  calculatePasswordStrength,
  strongPasswordSchema,
} from './password.validator';

describe('PasswordValidator', () => {
  describe('calculatePasswordStrength', () => {
    it('should give score 0 for empty or short passwords', () => {
      expect(calculatePasswordStrength('')).toBe(0);
      expect(calculatePasswordStrength('Short1!')).toBe(0);
    });

    it('should give score 0 for common dictionary passwords', () => {
      expect(calculatePasswordStrength('password123')).toBe(0);
      expect(calculatePasswordStrength('Password123!')).toBeGreaterThanOrEqual(
        3,
      );
      expect(calculatePasswordStrength('12345678')).toBe(0);
      expect(calculatePasswordStrength('qwertyuiop')).toBe(0);
    });

    it('should give low score for repetitive patterns', () => {
      expect(calculatePasswordStrength('aaaaAAAA1111!!!!')).toBe(1);
    });

    it('should give score >= 3 for strong complex passwords', () => {
      expect(calculatePasswordStrength('StrongP@ssw0rd!')).toBeGreaterThanOrEqual(
        3,
      );
      expect(calculatePasswordStrength('Kx9#mZ2$vL8@qW5!')).toBe(4);
    });
  });

  describe('strongPasswordSchema', () => {
    it('should validate strong passwords successfully', () => {
      const valid = strongPasswordSchema.safeParse('SecureP@ssw0rd2026');
      expect(valid.success).toBe(true);
    });

    it('should reject passwords lacking uppercase or symbols', () => {
      const noUpper = strongPasswordSchema.safeParse('securep@ssw0rd2026');
      expect(noUpper.success).toBe(false);

      const noSymbol = strongPasswordSchema.safeParse('SecurePassw0rd2026');
      expect(noSymbol.success).toBe(false);

      const noDigit = strongPasswordSchema.safeParse('SecureP@ssword');
      expect(noDigit.success).toBe(false);
    });

    it('should reject weak dictionary passwords even if they contain required classes', () => {
      const weak = strongPasswordSchema.safeParse('password');
      expect(weak.success).toBe(false);
    });
  });
});
