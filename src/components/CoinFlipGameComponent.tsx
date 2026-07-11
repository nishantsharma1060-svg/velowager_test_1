import React, { useState } from 'react';
import { DollarSign, AlertCircle, Coins, Sparkles, Trophy } from 'lucide-react';

interface CoinFlipGameProps {
  token: string | null;
  refreshWallet: () => void;
}

export const CoinFlipGameComponent: React.FC<CoinFlipGameProps> = ({ token, refreshWallet }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [prediction, setPrediction] = useState<'heads' | 'tails'>('heads');
  const [flipping, setFlipping] = useState<boolean>(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [payout, setPayout] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const triggerFlipSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {}
  };

  const triggerSettleSound = (isWin: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (isWin) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.3); // A2
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {}
  };

  const handleFlip = async () => {
    if (!token) {
      setFeedback({ type: 'error', msg: 'Please log in to play.' });
      return;
    }
    if (betAmount <= 0 || isNaN(betAmount)) {
      setFeedback({ type: 'error', msg: 'Please enter a valid bet amount.' });
      return;
    }

    setFlipping(true);
    setResult(null);
    setWon(null);
    setFeedback(null);
    triggerFlipSound();

    try {
      const r = await fetch('/api/game/flip/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ betAmount, prediction })
      });
      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || 'Failed to play coin flip');
      }

      // Simulate a 1.2 second flipping animation delay
      setTimeout(() => {
        setResult(d.result);
        setWon(d.won);
        setPayout(d.payout);
        setFlipping(false);
        triggerSettleSound(d.won);
        refreshWallet();

        if (d.won) {
          setFeedback({
            type: 'success',
            msg: `🎉 You won! Payout ₹${d.winAmount}! (Multiplier: 1.9x)`
          });
        } else {
          setFeedback({
            type: 'error',
            msg: `Better luck next time! The coin landed on ${d.result.toUpperCase()}.`
          });
        }
      }, 1200);

    } catch (e: any) {
      setFlipping(false);
      setFeedback({ type: 'error', msg: e.message });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="coin_flip_section">
      {/* Settings Panel */}
      <div className="bg-[#12161b] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Coins className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Lucky Coin Flip</h2>
            <span className="text-[10px] text-zinc-500 font-mono block">Choose Heads or Tails & Double Up!</span>
          </div>
        </div>

        {/* Prediction choosing */}
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2.5 block">Select Prediction</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={flipping}
              onClick={() => { setPrediction('heads'); triggerFlipSound(); }}
              className={`py-3.5 rounded-xl border font-extrabold uppercase text-xs transition flex flex-col items-center gap-1.5 ${
                prediction === 'heads'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5'
                  : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Coins className="w-5 h-5" />
              Heads
            </button>
            <button
              type="button"
              disabled={flipping}
              onClick={() => { setPrediction('tails'); triggerFlipSound(); }}
              className={`py-3.5 rounded-xl border font-extrabold uppercase text-xs transition flex flex-col items-center gap-1.5 ${
                prediction === 'tails'
                  ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-md shadow-rose-500/5'
                  : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Coins className="w-5 h-5 scale-x-[-1]" />
              Tails
            </button>
          </div>
        </div>

        {/* Bet Amount */}
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2 block">Bet Amount (₹)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="number"
              disabled={flipping}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 pl-9 pr-4 text-sm font-bold font-mono text-white focus:outline-none focus:border-amber-500/50 transition"
              placeholder="Bet amount..."
            />
          </div>
          <div className="flex gap-1.5 mt-2">
            {[100, 500, 1000, 5000].map((val) => (
              <button
                key={val}
                type="button"
                disabled={flipping}
                onClick={() => setBetAmount(val)}
                className="flex-1 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 py-1.5 rounded-lg text-xs font-bold transition font-mono"
              >
                ₹{val}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button disabled={flipping} onClick={() => setBetAmount(Math.max(10, betAmount / 2))} className="rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-xs font-black text-zinc-400 hover:text-white disabled:opacity-50">½ Bet</button>
          <button disabled={flipping} onClick={() => setBetAmount(betAmount * 2)} className="rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-xs font-black text-zinc-400 hover:text-white disabled:opacity-50">2× Bet</button>
        </div>

        {/* Potential Returns */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex justify-between items-center font-mono">
          <div>
            <span className="text-[9px] font-black uppercase text-zinc-500 block">Multiplier / Profit</span>
            <span className="text-base font-bold text-amber-400 block mt-0.5">1.90x</span>
            <span className="text-[9px] font-bold text-zinc-500">+90%</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black uppercase text-zinc-500 block">Potential Win</span>
            <span className="text-base font-bold text-emerald-400 block mt-0.5">₹{(betAmount * 1.9).toFixed(2)}</span>
          </div>
        </div>

        {/* Flip Button */}
        <button
          onClick={handleFlip}
          disabled={flipping}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase py-3 rounded-xl text-xs tracking-wider transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Coins className="w-4 h-4" />
          {flipping ? 'Coin Is Spinning...' : 'Flip Coin'}
        </button>

        {/* Message Panel */}
        {feedback && (
          <div className={`p-4 rounded-xl flex items-start gap-2.5 text-xs border ${
            feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* Animation Stage */}
      <div className="lg:col-span-2 bg-[#12161b] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer glow ring */}
          <div className={`absolute inset-0 rounded-full blur-3xl transition duration-500 opacity-20 ${
            flipping ? 'bg-amber-500 animate-pulse' : won === true ? 'bg-emerald-500' : won === false ? 'bg-rose-500' : 'bg-zinc-800'
          }`}></div>

          {/* 3D-styled Spinning Coin */}
          <div className={`w-36 h-36 rounded-full border-4 flex items-center justify-center select-none shadow-2xl transition-all duration-300 ${
            flipping
              ? 'animate-spin border-amber-400 bg-zinc-900 shadow-amber-500/30'
              : won === true
                ? 'border-emerald-400 bg-zinc-900 shadow-emerald-500/30 ring-8 ring-emerald-500/5 scale-105'
                : won === false
                  ? 'border-rose-500 bg-zinc-900 shadow-rose-500/30'
                  : 'border-zinc-700 bg-zinc-950 shadow-black/50'
          }`}>
            {flipping ? (
              <Coins className="w-16 h-16 text-amber-400 animate-bounce" />
            ) : result === 'heads' ? (
              <div className="flex flex-col items-center justify-center text-amber-400">
                <Coins className="w-16 h-16" />
                <span className="text-[10px] font-black tracking-widest uppercase mt-1 font-mono">Heads</span>
              </div>
            ) : result === 'tails' ? (
              <div className="flex flex-col items-center justify-center text-rose-400">
                <Coins className="w-16 h-16 scale-x-[-1]" />
                <span className="text-[10px] font-black tracking-widest uppercase mt-1 font-mono">Tails</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-500 animate-pulse">
                <Coins className="w-16 h-16" />
                <span className="text-[10px] font-black tracking-widest uppercase mt-1 font-mono">Toss</span>
              </div>
            )}
          </div>

          {/* Sparkle celebrations for a winner */}
          {won === true && (
            <>
              <Sparkles className="absolute top-2 left-2 w-6 h-6 text-emerald-400 animate-ping" />
              <Trophy className="absolute bottom-2 right-2 w-7 h-7 text-amber-400 animate-bounce" />
            </>
          )}
        </div>

        {/* Summary subtitle */}
        <div className="mt-8 text-center">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-widest block">Coin Toss Stage</span>
          <p className="text-xs text-zinc-400 mt-2 max-w-sm">
            {!flipping && result
              ? `The coin landed on ${result.toUpperCase()}. You predicted ${prediction.toUpperCase()} and ${won ? 'WON' : 'LOST'}!`
              : 'Select your prediction and press Flip Coin to trigger the spin.'}
          </p>
        </div>
      </div>
    </div>
  );
};
