import { providerRegistry } from './BlockchainProvider.js';

export interface WalletNodeConfig {
  type: 'hot' | 'cold' | 'treasury' | 'gas' | 'bonus' | 'referral' | 'affiliate' | 'profit' | 'reserve' | 'emergency';
  currency: string;
  address: string;
  balance: number;
  minThreshold: number; // For triggering auto-refill
  maxThreshold: number; // For triggering auto-sweep
  status: 'active' | 'suspended' | 'locked';
  lastChecked: string;
}

export class HotWalletManager {
  private static walletsConfig: WalletNodeConfig[] = [
    {
      type: 'hot',
      currency: 'USDT',
      address: 'TYN5z4b6k1v7r9s5u3v8w6x2y1z8a5b4',
      balance: 15200.5,
      minThreshold: 2000,
      maxThreshold: 50000,
      status: 'active',
      lastChecked: new Date().toISOString()
    },
    {
      type: 'cold',
      currency: 'USDT',
      address: 'TGC8w4v7x1y8z9a5b4c3d2e1f9g8h7j6',
      balance: 450000.0,
      minThreshold: 0,
      maxThreshold: 10000000,
      status: 'active',
      lastChecked: new Date().toISOString()
    },
    {
      type: 'gas',
      currency: 'TRX',
      address: 'TPA8z5y4x1a2b3c4d5e6f7g8h9j1k2m3',
      balance: 8500.0,
      minThreshold: 1000,
      maxThreshold: 20000,
      status: 'active',
      lastChecked: new Date().toISOString()
    },
    {
      type: 'treasury',
      currency: 'BTC',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      balance: 45.8,
      minThreshold: 5,
      maxThreshold: 200,
      status: 'active',
      lastChecked: new Date().toISOString()
    }
  ];

  public static getWallets(): WalletNodeConfig[] {
    return this.walletsConfig;
  }

  /**
   * Periodically check threshold violations to execute automated sweep or refill jobs
   */
  public static async checkThresholdsAndDispatch(): Promise<string[]> {
    const actionsTaken: string[] = [];

    for (const wallet of this.walletsConfig) {
      try {
        const provider = providerRegistry.getProvider(wallet.currency);
        // Refresh live balance
        const liveBalance = await provider.getBalance(wallet.address);
        wallet.balance = liveBalance > 0 ? liveBalance : wallet.balance;
        wallet.lastChecked = new Date().toISOString();

        // 1. Check Max Threshold (Auto Sweep Violation)
        if (wallet.maxThreshold > 0 && wallet.balance > wallet.maxThreshold) {
          const excess = wallet.balance - wallet.maxThreshold;
          actionsTaken.push(`[AUTO-SWEEP] ${wallet.type.toUpperCase()} wallet ${wallet.address} holds ${wallet.balance} ${wallet.currency}, which exceeds maximum limit of ${wallet.maxThreshold}. Scheduled sweep of ${excess.toFixed(4)} ${wallet.currency} to cold storage.`);
        }

        // 2. Check Min Threshold (Auto Refill Violation)
        if (wallet.minThreshold > 0 && wallet.balance < wallet.minThreshold) {
          const shortage = wallet.minThreshold - wallet.balance;
          actionsTaken.push(`[AUTO-REFILL] ${wallet.type.toUpperCase()} wallet ${wallet.address} holds ${wallet.balance} ${wallet.currency}, which falls below safe threshold of ${wallet.minThreshold}. Scheduled refill of ${shortage.toFixed(4)} ${wallet.currency} from reserve treasury.`);
        }
      } catch (err: any) {
        console.error(`[HotWalletManager] Failed to check wallet ${wallet.address}:`, err.message);
      }
    }

    return actionsTaken;
  }

  /**
   * Log an external admin sweep or refill transaction
   */
  public static updateWalletBalanceDirectly(address: string, change: number): void {
    const target = this.walletsConfig.find(w => w.address.toLowerCase() === address.toLowerCase());
    if (target) {
      target.balance = Number((target.balance + change).toFixed(4));
      target.lastChecked = new Date().toISOString();
    }
  }
}
