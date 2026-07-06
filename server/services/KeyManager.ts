import crypto from 'crypto';

export class KeyManager {
  private static readonly ALGORITHM = 'aes-256-cbc';
  
  private static getEncryptionKey(): Buffer {
    const keyStr = process.env.CRYPTO_KEY_MANAGER_SECRET || 'a3f9b2d8c7e1f5a4b3d2c1e0f9a8b7c6';
    // Ensure 32 bytes key length
    return Buffer.concat([Buffer.from(keyStr)], 32);
  }

  /**
   * Encrypt plaintext string using AES-256-CBC
   */
  public static encrypt(text: string): { iv: string; encryptedData: string } {
    const iv = crypto.randomBytes(16);
    const key = this.getEncryptionKey();
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted
    };
  }

  /**
   * Decrypt ciphertext using AES-256-CBC
   */
  public static decrypt(encryptedData: string, ivHex: string): string {
    const key = this.getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Mock Secret Manager Connectors for Google Secret Manager, AWS Secrets Manager, Azure Key Vault, Hashicorp Vault
   */
  public static async fetchSecretFromManager(managerName: 'gcp' | 'aws' | 'azure' | 'hashicorp', secretName: string): Promise<string> {
    // Real API integrations would go here.
    // Sandbox fallback returns local environment configurations
    const envValue = process.env[secretName];
    if (envValue) return envValue;
    throw new Error(`${secretName} is not configured in the environment`);
  }

  /**
   * Key Rotation Helper
   */
  public static rotateKey(oldData: string, oldIv: string): { iv: string; encryptedData: string } {
    const decrypted = this.decrypt(oldData, oldIv);
    return this.encrypt(decrypted);
  }
}
