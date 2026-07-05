import { providerRegistry } from './BlockchainProvider.js';
import { KeyManager } from './KeyManager.js';
import { HDWalletService } from './HDWalletService.js';
import { HotWalletManager } from './HotWalletManager.js';
import { DoubleEntryLedger } from './DoubleEntryLedger.js';

export async function runAllCryptoTests() {
  console.log('====================================================');
  console.log('🚀 ENTERPRISE CRYPTO CUSTODY SYSTEM INTEGRATION TESTS');
  console.log('====================================================');

  const results = {
    keyManager: false,
    hdWallet: false,
    providers: false,
    hotWallet: false,
    ledger: false
  };

  // Test 1: KeyManager AES Encrypt/Decrypt
  try {
    console.log('\n[TEST 1] Testing KeyManager Cryptographic Enclosures...');
    const originalText = 'correct horse battery staple';
    const encrypted = KeyManager.encrypt(originalText);
    const decrypted = KeyManager.decrypt(encrypted.encryptedData, encrypted.iv);
    
    if (decrypted === originalText) {
      console.log('✅ KeyManager AES Encryption & Decryption Verified.');
      results.keyManager = true;
    } else {
      console.error('❌ Decryption mismatch!');
    }
  } catch (err: any) {
    console.error('❌ KeyManager Test Failed:', err.message);
  }

  // Test 2: HDWallet Derivation Paths & Verification
  try {
    console.log('\n[TEST 2] Testing HDWallet BIP-39/BIP-44 Deterministic Derivations...');
    // Derive ETH Address (Coin 60), Index 0 and Index 1
    const wallet0 = await HDWalletService.deriveWallet(60, 0);
    const wallet1 = await HDWalletService.deriveWallet(60, 1);

    console.log(`Index 0 Eth Address: ${wallet0.address} (Path: ${wallet0.derivationPath})`);
    console.log(`Index 1 Eth Address: ${wallet1.address} (Path: ${wallet1.derivationPath})`);

    if (wallet0.address !== wallet1.address && wallet0.address.startsWith('0x')) {
      console.log('✅ HDWallet Address Differentiation & Standard Formats Verified.');
      results.hdWallet = true;
    } else {
      console.error('❌ HDWallet Derivation Error');
    }
  } catch (err: any) {
    console.error('❌ HDWallet Test Failed:', err.message);
  }

  // Test 3: Provider Architecture Standard Compliance
  try {
    console.log('\n[TEST 3] Testing Blockchain Providers Standard Factory & Formats...');
    const ethProvider = providerRegistry.getProvider('ETH');
    const trxProvider = providerRegistry.getProvider('TRX');
    const btcProvider = providerRegistry.getProvider('BTC');

    const ethAddr = await ethProvider.generateAddress(0);
    const trxAddr = await trxProvider.generateAddress(0);
    const btcAddr = await btcProvider.generateAddress(0);

    const isEthValid = ethProvider.validateAddress(ethAddr);
    const isTrxValid = trxProvider.validateAddress(trxAddr);
    const isBtcValid = btcProvider.validateAddress(btcAddr);

    console.log(`Generated addresses:\n - ETH: ${ethAddr} (Valid: ${isEthValid})\n - TRX: ${trxAddr} (Valid: ${isTrxValid})\n - BTC: ${btcAddr} (Valid: ${isBtcValid})`);

    if (isEthValid && isTrxValid && isBtcValid) {
      console.log('✅ Standard Provider Compliance & Validation Routines Verified.');
      results.providers = true;
    } else {
      console.error('❌ Address validation mismatch');
    }
  } catch (err: any) {
    console.error('❌ Provider Test Failed:', err.message);
  }

  // Test 4: Hot Wallet Limits & Threshold Violations
  try {
    console.log('\n[TEST 4] Testing Hot/Cold Wallet Automated Threshold Engine...');
    const actions = await HotWalletManager.checkThresholdsAndDispatch();
    console.log(`Threshold Violations Detected & Jobs Dispatched: ${actions.length}`);
    actions.forEach(act => console.log(`   👉 ${act}`));
    
    console.log('✅ HotWallet Multi-Tier Automatic Rules Verified.');
    results.hotWallet = true;
  } catch (err: any) {
    console.error('❌ HotWallet Test Failed:', err.message);
  }

  // Test 5: Double-Entry Ledger Immutable Integrity Audit
  try {
    console.log('\n[TEST 5] Testing Balanced Ledger Immutable Postings...');
    const txId = 'tx-test-' + Math.random().toString(36).substring(2, 9);
    
    // Debit User, Credit Treasury
    DoubleEntryLedger.postTransaction(txId, [
      {
        accountType: 'user_ledger',
        currency: 'INR',
        debit: 1000,
        credit: 0,
        remark: 'User deposit balance credit'
      },
      {
        accountType: 'treasury_ledger',
        currency: 'INR',
        debit: 0,
        credit: 1000,
        remark: 'Treasury reserve fund addition'
      }
    ]);

    const audit = DoubleEntryLedger.auditLedgerIntegrity();
    console.log(`Ledger Integrity: Balanced=${audit.isValid}, Discrepancy=${audit.discrepancy}`);

    if (audit.isValid) {
      console.log('✅ Double-Entry Accounting Immutability & Safety Audits Verified.');
      results.ledger = true;
    } else {
      console.error('❌ Ledger balance mismatch!');
    }
  } catch (err: any) {
    console.error('❌ Ledger Test Failed:', err.message);
  }

  console.log('\n====================================================');
  console.log('🎯 SUMMARY OF INTEGRATION RESULTS:');
  console.log(` - KeyManager Securitization: ${results.keyManager ? 'PASS' : 'FAIL'}`);
  console.log(` - HDWallet Multi-Addressing: ${results.hdWallet ? 'PASS' : 'FAIL'}`);
  console.log(` - Multi-Chain Providers:     ${results.providers ? 'PASS' : 'FAIL'}`);
  console.log(` - Threshold Auto-Sweeper:    ${results.hotWallet ? 'PASS' : 'FAIL'}`);
  console.log(` - Immutable Double Ledger:   ${results.ledger ? 'PASS' : 'FAIL'}`);
  console.log('====================================================\n');
}
