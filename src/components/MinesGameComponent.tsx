import React, { useState } from 'react';
import { AlertCircle, Bomb, Sparkles } from 'lucide-react';

interface Props { token: string | null; refreshWallet: () => void }

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

  const tone = (frequency: number, duration = .1) => { try { const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); const oscillator = ctx.createOscillator(); const gain = ctx.createGain(); oscillator.connect(gain); gain.connect(ctx.destination); oscillator.frequency.value = frequency; gain.gain.value = .06; oscillator.start(); oscillator.stop(ctx.currentTime + duration); } catch {} };

  const start = async () => {
    if (!token || betAmount < 10) { setFeedback({ type: 'error', msg: token ? 'Minimum bet is ₹10.' : 'Please log in to play.' }); return; }
    setLoading(true); setFeedback(null); setRevealed([]); setExploded(null); setMinePositions([]); setMultiplier(1);
    try {
      const response = await fetch('/api/game/mines/start', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ betAmount, minesCount }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Failed to start game');
      setGameActive(true); tone(600); refreshWallet();
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
      if (data.exploded) { setExploded(position); setMinePositions(data.minePositions || []); setGameActive(false); tone(90, .35); setFeedback({ type: 'error', msg: data.message || 'Boom! You hit a mine.' }); refreshWallet(); }
      else { setMultiplier(data.currentMultiplier || 1); tone(520 + (data.currentMultiplier || 1) * 60); if (data.isCleared) { setMinePositions(data.minePositions || []); setGameActive(false); setFeedback({ type: 'success', msg: data.message || 'Board cleared!' }); refreshWallet(); } }
    } catch (error: any) { setFeedback({ type: 'error', msg: error.message }); }
    finally { setLoading(false); }
  };

  const cashout = async () => {
    if (!gameActive || !revealed.length) return;
    setLoading(true); setFeedback(null);
    try {
      const response = await fetch('/api/game/mines/cashout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Cashout failed');
      setGameActive(false); setMinePositions(data.minePositions || []); tone(780, .25); setFeedback({ type: 'success', msg: `Cashed out ₹${data.winAmount} at ${data.multiplier}×` }); refreshWallet();
    } catch (error: any) { setFeedback({ type: 'error', msg: error.message }); }
    finally { setLoading(false); }
  };

  const randomPick = () => { const choices = Array.from({ length: 25 }, (_, index) => index).filter(index => !revealed.includes(index)); if (choices.length) reveal(choices[Math.floor(Math.random() * choices.length)]); };
  const profit = gameActive ? betAmount * multiplier - betAmount : 0;

  return <div className="overflow-hidden rounded-2xl border border-[#294959] bg-[#0d2430] shadow-2xl lg:grid lg:grid-cols-[375px_minmax(0,1fr)]" id="mines_arcade_section">
    <div className="flex flex-col gap-5 border-b border-[#294959] bg-[#1d3b48] p-4 sm:p-5 lg:min-h-[650px] lg:border-b-0 lg:border-r">
      <div className="grid grid-cols-2 rounded-full bg-[#102934] p-2 text-sm font-black text-white"><button className="rounded-full bg-[#42677b] py-3">Manual</button><button className="py-3 text-zinc-300">Auto</button></div>
      <div><div className="mb-2 flex justify-between text-xs font-bold text-[#8fd0f5]"><label>Bet Amount</label><span>₹{betAmount.toFixed(2)}</span></div><div className="flex overflow-hidden rounded-xl border border-[#386071] bg-[#102934]"><div className="flex min-w-0 flex-1 items-center gap-2 px-4"><span className="text-[#8fd0f5]">₹</span><input type="number" disabled={gameActive} value={betAmount} onChange={event => setBetAmount(Math.max(10, Number(event.target.value) || 0))} className="min-w-0 flex-1 bg-transparent py-3 text-base font-bold text-white outline-none" /></div><button disabled={gameActive} onClick={() => setBetAmount(Math.max(10, betAmount / 2))} className="border-l border-[#507488] bg-[#42677b] px-4 font-black text-white">½</button><button disabled={gameActive} onClick={() => setBetAmount(betAmount * 2)} className="border-l border-[#507488] bg-[#42677b] px-4 font-black text-white">2×</button></div></div>
      <div><label className="mb-2 block text-xs font-bold text-[#8fd0f5]">Mines</label><select disabled={gameActive} value={minesCount} onChange={event => setMinesCount(Number(event.target.value))} className="w-full rounded-xl border border-[#386071] bg-[#102934] px-3 py-3 text-base font-bold text-white outline-none">{Array.from({ length: 24 }, (_, index) => index + 1).map(number => <option key={number}>{number}</option>)}</select></div>
      <div><label className="mb-2 block text-xs font-bold text-[#8fd0f5]">Gems</label><div className="rounded-xl border border-[#386071] bg-[#214451] px-3 py-3 text-base font-bold text-white">{25 - minesCount}</div></div>
      {!gameActive ? <button onClick={start} disabled={loading} className="rounded-xl bg-[#1f7de2] py-4 text-sm font-black text-white transition hover:bg-blue-500 disabled:opacity-50">{loading ? 'Starting…' : 'Bet'}</button> : <button onClick={cashout} disabled={loading || !revealed.length} className="rounded-xl bg-emerald-500 py-4 text-sm font-black text-[#09212b] hover:bg-emerald-400 disabled:opacity-50">Cash Out ₹{(betAmount * multiplier).toFixed(2)}</button>}
      <button disabled={!gameActive || loading} onClick={randomPick} className="rounded-xl bg-[#2e5365] py-4 text-sm font-black text-[#91a8b4] enabled:hover:bg-[#3a6578] enabled:hover:text-white disabled:opacity-60">Random Pick</button>
      <div><div className="mb-2 flex justify-between text-xs font-bold text-[#8fd0f5]"><span>Total Profit ({multiplier.toFixed(2)}×)</span><span>₹{profit.toFixed(2)}</span></div><div className="rounded-xl border border-[#386071] bg-[#214451] px-4 py-3 text-base font-bold text-white">₹ {profit.toFixed(2)}</div></div>
      {feedback && <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${feedback.type === 'success' ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-400/30 bg-rose-500/10 text-rose-300'}`}><AlertCircle className="h-4 w-4 shrink-0" />{feedback.msg}</div>}
    </div>
    <div className="flex min-h-[500px] items-center justify-center bg-[#0c2230] p-5 sm:p-8"><div className="grid w-full max-w-[790px] grid-cols-5 gap-2.5 sm:gap-3" id="mines_grid_arcade">{Array.from({ length: 25 }, (_, index) => {
      const isRevealed = revealed.includes(index); const isMine = minePositions.includes(index); const isBlown = exploded === index;
      let style = 'bg-[#304d5d] border-[#365767] hover:bg-[#3b6072] hover:-translate-y-1 shadow-[0_7px_0_#1b3542]'; let content: React.ReactNode = null;
      if (isRevealed) { style = 'bg-cyan-400 border-cyan-300 text-[#09212b] translate-y-1 shadow-[0_3px_0_#08799a]'; content = <Sparkles className="h-7 w-7" />; }
      else if (isBlown) { style = 'bg-rose-600 border-rose-400 text-white translate-y-1 shadow-[0_3px_0_#7f1d1d]'; content = <Bomb className="h-7 w-7" />; }
      else if (isMine && !gameActive) { style = 'bg-rose-950 border-rose-700 text-rose-400 opacity-80'; content = <Bomb className="h-6 w-6" />; }
      else if (!gameActive && revealed.length) { style = 'bg-emerald-950 border-emerald-700 text-emerald-400 opacity-80'; content = <Sparkles className="h-6 w-6" />; }
      return <button key={index} disabled={!gameActive || isRevealed} onClick={() => reveal(index)} className={`flex aspect-[.95] w-full select-none items-center justify-center rounded-xl border transition duration-200 ${style}`}>{content}</button>;
    })}</div></div>
  </div>;
};
