import crypto from 'crypto';

export class TwoFactorService {
  /**
   * Generates a random Base32 secret for Google Authenticator.
   * Standard Google Authenticator secrets are 16 characters long.
   */
  generateSecret(length = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    // Use crypto.randomBytes for high entropy
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      secret += chars[bytes[i] % chars.length];
    }
    return secret;
  }

  /**
   * Decodes a Base32 string into a Buffer.
   */
  private base32Decode(base32: string): Buffer {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const cleaned = base32.toUpperCase().replace(/=/g, '');
    let bits = '';
    for (let i = 0; i < cleaned.length; i++) {
      const val = chars.indexOf(cleaned[i]);
      if (val === -1) {
        throw new Error('Invalid base32 character');
      }
      bits += val.toString(2).padStart(5, '0');
    }
    const bytes: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
      const byteStr = bits.slice(i, i + 8);
      if (byteStr.length === 8) {
        bytes.push(parseInt(byteStr, 2));
      }
    }
    return Buffer.from(bytes);
  }

  /**
   * Generates a 6-digit TOTP code for a secret and a given counter (30s intervals).
   */
  generateTOTP(secret: string, counter: number): string {
    const key = this.base32Decode(secret);
    const buffer = Buffer.alloc(8);
    // Write 64-bit integer
    buffer.writeBigInt64BE(BigInt(counter));

    const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    
    const codeBin = ((hmac[offset] & 0x7f) << 24) |
                    ((hmac[offset + 1] & 0xff) << 16) |
                    ((hmac[offset + 2] & 0xff) << 8) |
                    (hmac[offset + 3] & 0xff);
                     
    const code = codeBin % 1000000;
    return code.toString().padStart(6, '0');
  }

  /**
   * Verifies a TOTP 6-digit code against a secret with a given clock skew window.
   */
  verifyTOTP(secret: string, code: string, window = 1): boolean {
    const counter = Math.floor(Date.now() / 1000 / 30);
    for (let i = -window; i <= window; i++) {
      if (this.generateTOTP(secret, counter + i) === code) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generates the provisioning otpauth URI for QR code generation.
   */
  getOtpauthUri(usernameOrMobile: string, secret: string, issuer = 'RoyalClub'): string {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(usernameOrMobile)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  }
}
