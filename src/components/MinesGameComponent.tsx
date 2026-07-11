import React, { useState } from 'react';
import { AlertCircle, Bomb, Dices, Gem, Sparkles } from 'lucide-react';

interface Props { token: string | null; refreshWallet: () => void }

const MAX_SAFE_GEMS: Record<number, number> = { 1:24, 2:21, 3:18, 4:15, 5:13, 6:11, 7:10, 8:8, 9:7, 10:7, 11:6, 12:5, 13:5, 14:4, 15:4, 16:3, 17:3, 18:3, 19:2, 20:2, 21:2, 22:1, 23:1, 24:1 };
const minesMultiplier = (mines: number, opened: number) => {
  let probability = 1;
  for (let i = 0; i < opened; i++) probability *= (25 - mines - i) / (25 - i);
  return opened ? Math.floor((0.97 / probability) * 100) / 100 : 1;
};

export const MinesGameComponent: React.FC<Props> = ({ token, refreshWallet }) => {
  const [betAmount, setBetAmount] = useState(100);
  const [minesCount, setMinesCount] = useState(3);
  const [gameActive, setGameActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [exploded, setExploded] = useState<number | null>(null);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [clientSeed, setClientSeed] = useState<string>(() => crypto.randomUUID());
  const [serverSeedHash, setServerSeedHash] = useState('');
  const [fairness, setFairness] = useState<any | null>(null);

  const tone = (frequency: number, duration = .1) => { try { const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); const oscillator = ctx.createOscillator(); const gain = ctx.createGain(); oscillator.connect(gain); gain.connect(ctx.destination); oscillator.frequency.value = frequency; gain.gain.value = .06; oscillator.start(); oscillator.stop(ctx.currentTime + duration); } catch {} };

  const start = async () => {
    if (!token || betAmount < 10) { setFeedback({ type: 'error', msg: token ? 'Minimum bet is ₹10.' : 'Please log in to play.' }); return; }
    setLoading(true); setFeedback(null); setRevealed([]); setExploded(null); setMinePositions([]); setMultiplier(1);
    try {
      const response = await fetch('/api/game/mines/start', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ betAmount, minesCount, clientSeed }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Failed to start game');
      setGameActive(true); setServerSeedHash(data.serverSeedHash || ''); setFairness(null); tone(600); refreshWallet();
    } catch (error: any) { setFeedback({ type: 'error', msg: error.message }); }
    finally { setLoading(false); }
  };

  const reveal = async (position: number) => {
    if (!gameActive || loading || revealed.includes(position)) return;
    setLoading(true); setFeedback(null);
    try {
      const response = await fetch('/api/game/mines/reveal', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ position }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Action failed');
      setRevealed(data.revealedPositions || []);
      if (data.exploded) { setExploded(position); setMinePositions(data.minePositions || []); setFairness(data.fairness || null); setGameActive(false); tone(90, .35); setFeedback({ type: 'error', msg: data.message || 'Boom! You hit a mine.' }); refreshWallet(); }
      else { setMultiplier(data.currentMultiplier || 1); tone(520 + (data.currentMultiplier || 1) * 60); if (data.isCleared) { setMinePositions(data.minePositions || []); setFairness(data.fairness || null); setGameActive(false); setFeedback({ type: 'success', msg: data.message || 'Automatic maximum payout reached.' }); refreshWallet(); } }
    } catch (error: any) { setFeedback({ type: 'error', msg: error.message }); }
    finally { setLoading(false); }
  };

  const cashout = async () => {
    if (!gameActive || !revealed.length) return;
    setLoading(true); setFeedback(null);
    try {
      const response = await fetch('/api/game/mines/cashout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Cashout failed');
      setGameActive(false); setMinePositions(data.minePositions || []); setFairness(data.fairness || null); tone(780, .25); setFeedback({ type: 'success', msg: `Cashed out ₹${data.winAmount} at ${data.multiplier}×` }); refreshWallet();
    } catch (error: any) { setFeedback({ type: 'error', msg: error.message }); }
    finally { setLoading(false); }
  };

  const randomPick = () => { const choices = Array.from({ length: 25 }, (_, index) => index).filter(index => !revealed.includes(index)); if (choices.length) reveal(choices[Math.floor(Math.random() * choices.length)]); };
  const profit = gameActive ? betAmount * multiplier - betAmount : 0;
  const maxSafeGems = MAX_SAFE_GEMS[minesCount];
  const maxMultiplier = minesMultiplier(minesCount, maxSafeGems);
  const maximumAllowedBet = Math.min(1000, Math.floor(100000 / maxMultiplier));

  return <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" id="mines_arcade_section">
    <div className="flex flex-col gap-5 rounded-3xl border border-zinc-800 bg-[#12161b] p-6 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3"><Bomb className="h-5 w-5 text-emerald-400" /><div><h2 className="text-sm font-black uppercase tracking-wider text-white">Mines Arcade</h2><span className="block font-mono text-[10px] text-zinc-500">Find gems and cash out before the mine</span></div></div>
      <div><div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400"><label>Bet Amount</label><span className="font-mono text-emerald-400">₹{betAmount.toFixed(2)}</span></div><div className="flex overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"><div className="flex min-w-0 flex-1 items-center gap-2 px-3"><span className="text-zinc-500">₹</span><input type="number" min={10} max={maximumAllowedBet} disabled={gameActive} value={betAmount} onChange={event => setBetAmount(Math.max(10, Math.min(maximumAllowedBet, Number(event.target.value) || 0)))} className="min-w-0 flex-1 bg-transparent py-3 font-mono text-sm font-bold text-white outline-none" /></div><button disabled={gameActive} onClick={() => setBetAmount(Math.max(10, betAmount / 2))} className="border-l border-zinc-800 bg-zinc-900 px-4 text-xs font-black text-zinc-400 hover:text-white disabled:opacity-50">½</button><button disabled={gameActive} onClick={() => setBetAmount(Math.min(maximumAllowedBet, betAmount * 2))} className="border-l border-zinc-800 bg-zinc-900 px-4 text-xs font-black text-zinc-400 hover:text-white disabled:opacity-50">2×</button></div></div>
      <div className="grid grid-cols-2 gap-3"><div><label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Mines</label><select disabled={gameActive} value={minesCount} onChange={event => setMinesCount(Number(event.target.value))} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 font-mono text-sm font-bold text-white outline-none focus:border-emerald-500/50">{Array.from({ length: 24 }, (_, index) => index + 1).map(number => <option key={number}>{number}</option>)}</select></div><div><label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Gems</label><div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 font-mono text-sm font-bold text-emerald-400"><Gem className="h-4 w-4" />{25 - minesCount}</div></div></div>
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-zinc-900 bg-zinc-950 p-4 font-mono"><div><span className="block text-[9px] font-black uppercase text-zinc-500">Multiplier</span><strong className="mt-1 block text-base text-amber-400">{multiplier.toFixed(2)}×</strong></div><div className="text-right"><span className="block text-[9px] font-black uppercase text-zinc-500">Total Profit</span><strong className="mt-1 block text-base text-emerald-400">₹{profit.toFixed(2)}</strong></div></div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-[9px]"><span className="text-zinc-500">Available safe tiles <b className="float-right text-white">{25 - minesCount}</b></span><span className="text-zinc-500">Maximum safe gems <b className="float-right text-white">{maxSafeGems}</b></span><span className="text-zinc-500">Maximum multiplier <b className="float-right text-amber-400">{maxMultiplier.toFixed(2)}×</b></span><span className="text-zinc-500">Maximum bet <b className="float-right text-white">₹{maximumAllowedBet}</b></span><span className="text-zinc-500">RTP <b className="float-right text-emerald-400">97%</b></span><span className="text-zinc-500">House edge <b className="float-right text-rose-400">3%</b></span><span className="col-span-2 text-zinc-500">Payout cap <b className="float-right text-white">₹100,000</b></span></div>
      <div><label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Client Seed</label><input disabled={gameActive} value={clientSeed} onChange={event => setClientSeed(event.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-[10px] text-zinc-300 outline-none" />{serverSeedHash && <p className="mt-2 break-all font-mono text-[8px] text-zinc-600">Server commitment: {serverSeedHash}</p>}</div>
      {!gameActive ? <button onClick={start} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black uppercase tracking-wider text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95 disabled:opacity-50"><Bomb className="h-4 w-4" />{loading ? 'Starting…' : 'Place Bet'}</button> : <button onClick={cashout} disabled={loading || !revealed.length} className="rounded-xl bg-emerald-500 py-3 text-xs font-black uppercase tracking-wider text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50">Cash Out ₹{(betAmount * multiplier).toFixed(2)}</button>}
      <button disabled={!gameActive || loading} onClick={randomPick} className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-xs font-black uppercase tracking-wider text-zinc-400 transition enabled:hover:border-emerald-500/40 enabled:hover:text-emerald-400 disabled:opacity-40"><Dices className="h-4 w-4" />Random Pick</button>
      {feedback && <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${feedback.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400'}`}><AlertCircle className="h-4 w-4 shrink-0" />{feedback.msg}</div>}
      {fairness && <details className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[9px] text-zinc-500"><summary className="cursor-pointer font-black uppercase text-emerald-400">Provably fair verification</summary><div className="mt-2 space-y-1 break-all"><p>Server seed: {fairness.serverSeed}</p><p>Hash: {fairness.serverSeedHash}</p><p>Client seed: {fairness.clientSeed}</p><p>Nonce: {fairness.nonce}</p></div></details>}
    </div>
    <div className="relative flex min-h-[500px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-zinc-800 bg-[#12161b] p-5 shadow-2xl sm:p-8 lg:col-span-2">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(16,185,129,0.08),transparent_55%)]" />
      <div className="relative mb-6 flex w-full max-w-[680px] items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-400">Live Board</p><p className="mt-1 text-xs text-zinc-500">{gameActive ? 'Choose a tile to reveal a gem' : 'Place a bet to unlock the board'}</p></div><span className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase ${gameActive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 bg-zinc-900 text-zinc-500'}`}>{gameActive ? 'Active' : 'Ready'}</span></div>
      <div className="relative grid w-full max-w-[680px] grid-cols-5 gap-2 sm:gap-3" id="mines_grid_arcade">{Array.from({ length: 25 }, (_, index) => {
        const isRevealed = revealed.includes(index); const isMine = minePositions.includes(index); const isBlown = exploded === index;
        let style = 'border-zinc-700 bg-zinc-800 shadow-[0_6px_0_#18181b] enabled:hover:-translate-y-1 enabled:hover:border-emerald-500/40 enabled:hover:bg-zinc-700'; let content: React.ReactNode = null;
        if (isRevealed) { style = 'translate-y-1 border-emerald-400 bg-emerald-500 text-zinc-950 shadow-[0_2px_0_#047857]'; content = <Gem className="h-6 w-6 sm:h-8 sm:w-8" />; }
        else if (isBlown) { style = 'translate-y-1 border-rose-400 bg-rose-600 text-white shadow-[0_2px_0_#881337]'; content = <Bomb className="h-6 w-6 sm:h-8 sm:w-8" />; }
        else if (isMine && !gameActive) { style = 'border-rose-800 bg-rose-950 text-rose-400 opacity-80'; content = <Bomb className="h-5 w-5 sm:h-7 sm:w-7" />; }
        else if (!gameActive && revealed.length) { style = 'border-emerald-900 bg-emerald-950 text-emerald-500 opacity-70'; content = <Sparkles className="h-5 w-5 sm:h-7 sm:w-7" />; }
        return <button key={index} disabled={!gameActive || isRevealed} onClick={() => reveal(index)} aria-label={`Tile ${index + 1}`} className={`flex aspect-square w-full select-none items-center justify-center rounded-xl border transition duration-200 disabled:cursor-default ${style}`}>{content}</button>;
      })}</div>
    </div>
  </div>;
};
