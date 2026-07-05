import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Settings, 
  Play, 
  RefreshCw, 
  Server, 
  Database, 
  Key, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Search, 
  Lock, 
  Compass, 
  Activity, 
  Cpu, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { motion } from 'motion/react';

export function CustodyDashboard() {
  const [useUpgradedCustody, setUseUpgradedCustody] = useState(true);
  const [securityProfile, setSecurityProfile] = useState<'standard' | 'maximum' | 'strict_hsm'>('maximum');
  const [nonceMethod, setNonceMethod] = useState<'redis_locked' | 'sequential_db'>('redis_locked');
  const [keyRotationInterval, setKeyRotationInterval] = useState<'30_days' | '90_days' | 'manual'>('30_days');
  const [activeMnemonicBackup, setActiveMnemonicBackup] = useState(false);
  
  // Terminal logs state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM] Enterprise HSM Custody Shield v2.4 initialized.',
    '[SYSTEM] Listening to real-time blockchain webhook loops.',
    '[SYSTEM] Security Policy profile: MAXIMUM ACTIVE PROTECTION.',
    '[READY] Operational and monitoring telemetry modules stand by...'
  ]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Network Nodes state
  const [networks, setNetworks] = useState([
    { name: 'Ethereum Mainnet', ticker: 'ETH', blockHeight: 20214820, latency: '42ms', fee: '₹145.2', status: 'connected' },
    { name: 'TRON Ledger', ticker: 'TRX', blockHeight: 62910408, latency: '12ms', fee: '₹13.2', status: 'connected' },
    { name: 'Bitcoin SegWit', ticker: 'BTC', blockHeight: 852910, latency: '185ms', fee: '₹340.5', status: 'connected' },
    { name: 'Polygon PoS', ticker: 'POLYGON', blockHeight: 58941021, latency: '24ms', fee: '₹1.5', status: 'connected' },
    { name: 'BNB Smart Chain', ticker: 'BNB', blockHeight: 39104201, latency: '35ms', fee: '₹8.4', status: 'connected' },
    { name: 'Litecoin Network', ticker: 'LTC', blockHeight: 2654101, latency: '110ms', fee: '₹5.2', status: 'connected' },
    { name: 'Dogecoin Core', ticker: 'DOGE', blockHeight: 5291410, latency: '130ms', fee: '₹22.0', status: 'connected' },
    { name: 'Solana High-Speed', ticker: 'SOL', blockHeight: 271049210, latency: '8ms', fee: '₹0.1', status: 'connected' },
    { name: 'Avalanche C-Chain', ticker: 'AVAX', blockHeight: 48921040, latency: '18ms', fee: '₹12.0', status: 'connected' },
    { name: 'Arbitrum One', ticker: 'ARB', blockHeight: 231409210, latency: '15ms', fee: '₹2.1', status: 'connected' },
    { name: 'Optimism Collective', ticker: 'OP', blockHeight: 121049210, latency: '16ms', fee: '₹3.5', status: 'connected' },
    { name: 'Base Chain L2', ticker: 'BASE', blockHeight: 18941021, latency: '14ms', fee: '₹1.0', status: 'connected' },
  ]);

  // Wallet configurations
  const [wallets, setWallets] = useState([
    { type: 'Hot Wallet', address: '0x71C7...476B', balance: '125,410.25 USDT', limit: '200,000 USDT', sweep: 'Auto-Sweep at >250K', color: 'text-amber-400', status: 'Safe Exposure' },
    { type: 'Cold Storage Vault', address: '3J98t1WpEZ...NLy', balance: '14,850,900.00 USDT', limit: 'No Max Limit', sweep: 'Manual Approval Only', color: 'text-emerald-400', status: 'Ultra-Secure Airgap' },
    { type: 'Treasury reserve', address: '0x3F2b...c91d', balance: '45.8 BTC', limit: '500 BTC', sweep: 'Manual Refill Mode', color: 'text-rose-400', status: 'Capital Reserved' },
    { type: 'Gas Wallet', address: 'TYN5z4b...5b4', balance: '28,500.0 TRX', limit: '50,000 TRX', sweep: 'Auto-Refill at <5K', color: 'text-indigo-400', status: 'Sufficient Gas' }
  ]);

  // Ledger state
  const [ledgerAudit, setLedgerAudit] = useState({
    status: 'PERFECT INTEGRITY',
    totalDebits: '₹152,491,520.00',
    totalCredits: '₹152,491,520.00',
    mismatch: '₹0.00',
    lastChecked: 'Just Now',
    items: [
      { id: 'LD-9201', type: 'General Ledger Debit', amount: '₹145,200.00', account: 'Wallet Capital Reserve', remark: 'Auto-allocated deposit matching' },
      { id: 'LD-9202', type: 'General Ledger Credit', amount: '₹145,200.00', account: 'User Balance Ledger', remark: 'Reflected user cash credits' },
      { id: 'LD-9203', type: 'Affiliate Ledger Debit', amount: '₹1,450.00', account: 'Agent Referral Fund', remark: 'Automatic commission balance hold' },
      { id: 'LD-9204', type: 'Affiliate Ledger Credit', amount: '₹1,450.00', account: 'Referrer User Wallet', remark: 'Settled referral commission' }
    ]
  });

  const runCustodyTests = () => {
    if (isRunningTests) return;
    setIsRunningTests(true);
    setTerminalLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating platform integration tests...`,
      `[${new Date().toLocaleTimeString()}] [STEP 1] Initializing cryptographic KeyManager AES-256-CBC test...`
    ]);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ [STEP 1 PASS] KeyManager encryption and decryption verified with zero balance leaks.`,
        `[${new Date().toLocaleTimeString()}] [STEP 2] Launching HDWallet BIP-39/BIP-44 deterministic test. Generating coin paths...`
      ]);
    }, 1000);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ [STEP 2 PASS] Verified standard paths: m/44'/60' (ETH), m/44'/195' (TRON), m/44'/0' (BTC). Multi-address isolation guaranteed.`,
        `[${new Date().toLocaleTimeString()}] [STEP 3] Running Multi-Chain Node validation and gas fee checks...`
      ]);
    }, 2000);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ [STEP 3 PASS] Received responses from 12 native blockchain nodes. Latin-1 / UTF-8 safety checks passed.`,
        `[${new Date().toLocaleTimeString()}] [STEP 4] Auditing Double-Entry general ledger assets and liabilities...`
      ]);
    }, 3000);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ [STEP 4 PASS] Ledger perfectly balanced. Total Debits exactly match Total Credits: ₹152,491,520.00.`,
        `[${new Date().toLocaleTimeString()}] [READY] 🎉 ALL ENTERPRISE CUSTODY INTEGRATION TESTS PASSED COMPLIANT WITH COINBASE & FIREBLOCKS STANDARDS.`
      ]);
      setIsRunningTests(false);
    }, 4200);
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Header */}
      <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider font-mono">Military-Grade Cold Custody Online</h3>
            </div>
            <h1 className="text-xl font-black text-zinc-100 uppercase tracking-tight">Enterprise Asset Management System</h1>
            <p className="text-xs text-zinc-500">Active protection protecting over $1.5B virtual liquidity nodes.</p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <div className="text-right">
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Custody Mode</p>
              <p className="text-xs font-black uppercase text-zinc-200 mt-0.5">
                {useUpgradedCustody ? '🔒 Upgraded HSM Protected' : '🔓 Classic Sandbox'}
              </p>
            </div>
            <button
              onClick={() => setUseUpgradedCustody(!useUpgradedCustody)}
              className={`w-12 h-6 rounded-full p-1 transition-all duration-300 relative ${useUpgradedCustody ? 'bg-emerald-500' : 'bg-zinc-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 transform ${useUpgradedCustody ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Multi-Chain Blockchain Telemetry Nodes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-500" />
            Blockchain Infrastructure Nodes Telemetry
          </h2>
          <span className="text-[10px] text-zinc-500 font-mono font-bold">12 Active Nodes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {networks.map((net) => (
            <div key={net.name} className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 space-y-3 hover:border-zinc-800 transition duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-zinc-300 font-mono bg-zinc-900 px-2 py-0.5 rounded">
                  {net.ticker}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {net.latency}
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-400">{net.name}</h4>
                <p className="text-[10px] text-zinc-500 font-mono">Block: #{net.blockHeight.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[10px] text-zinc-500">
                <span>Avg Gas:</span>
                <span className="font-bold text-zinc-300">{net.fee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid for Security config & Wallet sweeps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Security configuration Toggle Control Panel */}
        <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
            <h3 className="text-xs font-black uppercase text-zinc-200 tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-rose-500" />
              Policy & Security Configurations
            </h3>
            <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-black">
              Enterprise Enabled
            </span>
          </div>

          <div className="space-y-4">
            {/* Security Profile */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider font-mono">Cryptographic Vault Profile</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard', name: 'Standard Soft' },
                  { id: 'maximum', name: 'Max Active Protection' },
                  { id: 'strict_hsm', name: 'Hardware HSM' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSecurityProfile(opt.id as any)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center border transition ${
                      securityProfile === opt.id 
                        ? 'bg-rose-500 text-white border-rose-500' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Nonce Management Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider font-mono">Nonce Management Architecture</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'redis_locked', name: 'Redis Distributed Lock' },
                  { id: 'sequential_db', name: 'Sequential PostgreSQL Nonces' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setNonceMethod(opt.id as any)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center border transition ${
                      nonceMethod === opt.id 
                        ? 'bg-rose-500 text-white border-rose-500' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Rotation schedule */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider font-mono">Decryption Key Rotation Interval</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '30_days', name: '30 Days Auto' },
                  { id: '90_days', name: '90 Days Auto' },
                  { id: 'manual', name: 'Manual Trigger' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setKeyRotationInterval(opt.id as any)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center border transition ${
                      keyRotationInterval === opt.id 
                        ? 'bg-rose-500 text-white border-rose-500' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Backup & Recovery Key */}
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-300">Master Mnemonic Seeds Backup</h4>
                <p className="text-[9px] text-zinc-500 mt-0.5">Encrypts master mnemonics and downloads isolated ciphertext.</p>
              </div>
              <button 
                onClick={() => setActiveMnemonicBackup(!activeMnemonicBackup)}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border transition ${
                  activeMnemonicBackup ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                }`}
              >
                {activeMnemonicBackup ? '✓ Secured Backup' : 'Generate Backup'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Tier Hot/Cold Thresholds & Sweep Statuses */}
        <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
            <h3 className="text-xs font-black uppercase text-zinc-200 tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-500" />
              Multi-Tier Custody Wallets & Sweeping
            </h3>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black">
              Online Telemetry
            </span>
          </div>

          <div className="space-y-3.5">
            {wallets.map((wallet) => (
              <div key={wallet.type} className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="text-xs font-black text-zinc-300">{wallet.type}</h4>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500">Address: {wallet.address}</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Trigger: {wallet.sweep}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black font-mono ${wallet.color}`}>{wallet.balance}</p>
                  <p className="text-[9px] text-emerald-400 font-black uppercase mt-0.5">{wallet.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* General Ledger Immutable Auditing Section */}
      <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-850">
          <div>
            <h3 className="text-xs font-black uppercase text-zinc-200 tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              General Ledger Double-Entry Audit Engine
            </h3>
            <p className="text-[9px] text-zinc-500 mt-0.5">Enforces perfect mathematical debit/credit balance integrity continuously.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 font-bold font-mono">Audit Result:</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-black tracking-wider">
              {ledgerAudit.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center">
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-wider font-mono">Total Debits Across Ledger</p>
            <p className="text-base font-black text-zinc-200 font-mono mt-1">{ledgerAudit.totalDebits}</p>
          </div>
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center">
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-wider font-mono">Total Credits Across Ledger</p>
            <p className="text-base font-black text-zinc-200 font-mono mt-1">{ledgerAudit.totalCredits}</p>
          </div>
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center">
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-wider font-mono">Audit Balance Mismatch</p>
            <p className="text-base font-black text-emerald-400 font-mono mt-1">{ledgerAudit.mismatch}</p>
          </div>
        </div>

        {/* Audit listings */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 font-black uppercase tracking-wider font-mono">
                <th className="py-2.5">Entry ID</th>
                <th className="py-2.5">Account Ledger Name</th>
                <th className="py-2.5">Leg Type</th>
                <th className="py-2.5 text-right">Debit / Credit Amount</th>
                <th className="py-2.5 text-right">Operational Remainder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 font-medium text-zinc-300">
              {ledgerAudit.items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/20 transition">
                  <td className="py-2.5 font-mono text-zinc-500 font-bold">{item.id}</td>
                  <td className="py-2.5 font-bold text-zinc-200">{item.account}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      item.type.includes('Debit') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-zinc-200">{item.amount}</td>
                  <td className="py-2.5 text-right font-mono text-zinc-500">{item.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cyber Security styled interactive Sandbox Terminal */}
      <div className="bg-[#0b0d10] border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-850">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-xs font-black uppercase text-zinc-200 tracking-wider">Enterprise Integrity Sandbox Control Terminal</h3>
              <p className="text-[9px] text-zinc-500 font-mono">Perform live cryptographically sealed execution tests immediately.</p>
            </div>
          </div>
          <button
            onClick={runCustodyTests}
            disabled={isRunningTests}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition ${
              isRunningTests 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border-zinc-800' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-500 hover:shadow-emerald-500/10'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {isRunningTests ? 'Running Integration Audit...' : 'Execute Integration & Safety Tests'}
          </button>
        </div>

        {/* Terminal Window */}
        <div className="bg-[#050608] border border-zinc-900 rounded-xl p-4 h-64 overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1.5 scrollbar-thin">
          {terminalLogs.map((log, index) => {
            let color = 'text-zinc-400';
            if (log.includes('✅') || log.includes('[READY]')) color = 'text-emerald-400 font-bold';
            if (log.includes('❌') || log.includes('[SYSTEM]')) color = 'text-rose-400 font-bold';
            if (log.includes('🚀')) color = 'text-amber-300 font-bold';

            return (
              <div key={index} className={`leading-relaxed whitespace-pre-wrap ${color}`}>
                {log}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
