import { ethers } from 'ethers';
import { KeyManager } from './KeyManager.js';

export interface GeneratedAddressInfo {
  address: string;
  derivationPath: string;
  encryptedPrivateKey: string;
  iv: string;
}

export class HDWalletService {
  private static getMasterMnemonic(): string {
    if (!process.env.CRYPTO_MASTER_MNEMONIC) throw new Error('CRYPTO_MASTER_MNEMONIC is required');
    return process.env.CRYPTO_MASTER_MNEMONIC;
  }

  /**
   * Derive a key pair and address for any coin according to standard coin types (e.g., ETH = 60, TRX = 195, BTC = 0)
   */
  public static async deriveWallet(coinType: number, index: number): Promise<GeneratedAddressInfo> {
    const mnemonicPhrase = this.getMasterMnemonic();
    const derivationPath = `m/44'/${coinType}'/0'/0/${index}`;
    
    const mnemonic = ethers.Mnemonic.fromPhrase(mnemonicPhrase);
    const node = ethers.HDNodeWallet.fromMnemonic(mnemonic, derivationPath);

    // Encrypt the private key securely before storing in DB/RAM
    const encryptedKeyInfo = KeyManager.encrypt(node.privateKey);

    return {
      address: node.address,
      derivationPath,
      encryptedPrivateKey: encryptedKeyInfo.encryptedData,
      iv: encryptedKeyInfo.iv
    };
  }

  /**
   * Helper to backup current Master Mnemonic encrypted
   */
  public static getEncryptedMnemonicBackup(): { iv: string; encryptedData: string } {
    return KeyManager.encrypt(this.getMasterMnemonic());
  }

  /**
   * Validate mnemonic phrase soundness
   */
  public static isValidMnemonic(phrase: string): boolean {
    return ethers.Mnemonic.isValidMnemonic(phrase);
  }
}
