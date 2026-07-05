export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountType: 'user_ledger' | 'bonus_ledger' | 'treasury_ledger' | 'affiliate_ledger' | 'vip_ledger' | 'wallet_ledger';
  userId?: string;
  currency: string;
  debit: number;  // Increase in asset/expense or decrease in liability/equity
  credit: number; // Decrease in asset/expense or increase in liability/equity
  remark: string;
  timestamp: string;
}

export class DoubleEntryLedger {
  private static entries: LedgerEntry[] = [
    {
      id: 'ledg-1',
      transactionId: 'tx-seed-1',
      accountType: 'treasury_ledger',
      currency: 'INR',
      debit: 0,
      credit: 5000000,
      remark: 'Platform initial capital injection',
      timestamp: new Date().toISOString()
    },
    {
      id: 'ledg-2',
      transactionId: 'tx-seed-1',
      accountType: 'wallet_ledger',
      currency: 'INR',
      debit: 5000000,
      credit: 0,
      remark: 'Platform initial capital allocation to cash reserves',
      timestamp: new Date().toISOString()
    }
  ];

  /**
   * Post a balanced double-entry transaction.
   * Total Debits MUST exactly equal Total Credits!
   */
  public static postTransaction(
    txId: string,
    legs: Omit<LedgerEntry, 'id' | 'transactionId' | 'timestamp'>[]
  ): void {
    const totalDebits = legs.reduce((sum, leg) => sum + leg.debit, 0);
    const totalCredits = legs.reduce((sum, leg) => sum + leg.credit, 0);

    // Assert double entry balance matching principle
    if (Math.abs(totalDebits - totalCredits) > 0.000001) {
      throw new Error(`[DoubleEntryLedger] Transaction rejected: Unbalanced entries. Debits: ${totalDebits}, Credits: ${totalCredits}. Difference: ${totalDebits - totalCredits}`);
    }

    const timestamp = new Date().toISOString();
    legs.forEach((leg, index) => {
      const newEntry: LedgerEntry = {
        id: `ledg-post-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
        transactionId: txId,
        ...leg,
        timestamp
      };
      
      // Enforce immutability
      Object.freeze(newEntry);
      this.entries.push(newEntry);
    });

    console.log(`[DoubleEntryLedger] Successfully committed immutable balanced transaction block: ${txId}. legs: ${legs.length}`);
  }

  /**
   * Fetch all records
   */
  public static getAllEntries(): LedgerEntry[] {
    return [...this.entries];
  }

  /**
   * Fetch entries filtered by Account Type
   */
  public static getEntriesByAccount(accountType: LedgerEntry['accountType']): LedgerEntry[] {
    return this.entries.filter(e => e.accountType === accountType);
  }

  /**
   * Audit balance integrity of the general ledger
   * Sum of all debits must equal sum of all credits across the entire ledger
   */
  public static auditLedgerIntegrity(): { isValid: boolean; debitSum: number; creditSum: number; discrepancy: number } {
    const debitSum = this.entries.reduce((sum, e) => sum + e.debit, 0);
    const creditSum = this.entries.reduce((sum, e) => sum + e.credit, 0);
    const discrepancy = Math.abs(debitSum - creditSum);
    const isValid = discrepancy < 0.000001;

    return {
      isValid,
      debitSum,
      creditSum,
      discrepancy
    };
  }
}
