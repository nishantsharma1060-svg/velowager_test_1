import React, { useState } from 'react';
import { ShieldAlert, Bomb, Sparkles, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface MinesGameProps {
  token: string | null;
  refreshWallet: () => void;
}

export const MinesGameComponent: React.FC<MinesGameProps> = ({ token, refreshWallet }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Game session states
  const [revealedPositions, setRevealedPositions] = useState<number[]>([]);
  const [explodedPosition, setExplodedPosition] = useState<number | null>(null);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const triggerClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {}
  };

  const triggerGemSound = (multiplier: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      // Pitch increases with multiplier
      osc.frequency.setValueAtTime(440 + multiplier * 80, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {}
  };

  const triggerExplodeSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {}
  };

  const triggerCashoutSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  const handleStartGame = async () => {
    if (!token) {
      setFeedback({ type: 'error', msg: 'Please log in to play.' });
      return;
    }
    if (betAmount <= 0 || isNaN(betAmount)) {
      setFeedback({ type: 'error', msg: 'Please enter a valid bet amount.' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    setRevealedPositions([]);
    setExplodedPosition(null);
    setMinePositions([]);
    setCurrentMultiplier(1.0);

    try {
      const r = await fetch('/api/game/mines/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ betAmount, minesCount })
      });
      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || 'Failed to start game');
      }

      setGameActive(true);
      triggerClickSound();
      refreshWallet();
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async (position: number) => {
    if (!gameActive || loading || revealedPositions.includes(position)) return;

    setLoading(true);
    setFeedback(null);

    try {
      const r = await fetch('/api/game/mines/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ position })
      });
      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || 'Action failed');
      }

      if (d.exploded) {
        setExplodedPosition(position);
        setMinePositions(d.minePositions || []);
        setRevealedPositions(d.revealedPositions || []);
        setGameActive(false);
        triggerExplodeSound();
        setFeedback({ type: 'error', msg: d.message || 'Boom! You hit a mine!' });
        refreshWallet();
      } else {
        setRevealedPositions(d.revealedPositions || []);
        setCurrentMultiplier(d.currentMultiplier || 1.0);
        triggerGemSound(d.currentMultiplier || 1.1);

        if (d.isCleared) {
          setMinePositions(d.minePositions || []);
          setGameActive(false);
          triggerCashoutSound();
          setFeedback({ type: 'success', msg: d.message || 'Perfect clear! You cleared all safe gems!' });
          refreshWallet();
        }
      }
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCashout = async () => {
    if (!gameActive || revealedPositions.length === 0) return;

    setLoading(true);
    setFeedback(null);

    try {
      const r = await fetch('/api/game/mines/cashout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || 'Cashout failed');
      }

      setGameActive(false);
      setMinePositions(d.minePositions || []);
      triggerCashoutSound();
      setFeedback({
        type: 'success',
        msg: `Successfully cashed out ₹${d.winAmount}! (Multiplier: ${d.multiplier}x)`
      });
      refreshWallet();
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if a tile is a known mine
  const isMineTile = (idx: number) => {
    return minePositions.includes(idx);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="mines_arcade_section">
      {/* Configuration Column */}
      <div className="bg-[#12161b] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Bomb className="w-5 h-5 text-rose-500" />
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Mines Arcade</h2>
            <span className="text-[10px] text-zinc-500 font-mono block">Avoid Mines & Cashout Safely</span>
          </div>
        </div>

        {/* Bet amount */}
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2 block">Bet Amount (₹)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="number"
              disabled={gameActive}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 pl-9 pr-4 text-sm font-bold font-mono text-white focus:outline-none focus:border-rose-500/50 transition"
              placeholder="Bet amount..."
            />
          </div>
          <div className="flex gap-1.5 mt-2">
            {[100, 500, 1000, 5000].map((val) => (
              <button
                key={val}
                type="button"
                disabled={gameActive}
                onClick={() => setBetAmount(val)}
                className="flex-1 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 py-1.5 rounded-lg text-xs font-bold transition font-mono"
              >
                ₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Mines count selection */}
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2 block">Mines Count (1 - 24)</label>
          <select
            disabled={gameActive}
            value={minesCount}
            onChange={(e) => setMinesCount(parseInt(e.target.value))}
            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2.5 px-4 text-sm font-bold text-white focus:outline-none focus:border-rose-500/50 transition font-mono"
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Mine' : 'Mines'}
              </option>
            ))}
          </select>
        </div>

        {/* Game Stats (Multiplier) */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black uppercase text-zinc-500 block">Current Multiplier</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              {currentMultiplier.toFixed(2)}x
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black uppercase text-zinc-500 block">Next Multiplier</span>
            <span className="text-xs font-bold text-zinc-400 font-mono mt-1 block">
              {/* Formula for next multiplier */}
              {gameActive ? (currentMultiplier * (25 - revealedPositions.length) / (25 - revealedPositions.length - minesCount) * 0.95).toFixed(2) : '1.00'}x
            </span>
          </div>
        </div>

        {/* Action Button */}
        {!gameActive ? (
          <button
            onClick={handleStartGame}
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-400 text-white font-black uppercase py-3 rounded-xl text-xs tracking-wider transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Bomb className="w-4 h-4" />
            Start Mines Game
          </button>
        ) : (
          <button
            onClick={handleCashout}
            disabled={loading || revealedPositions.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase py-3 rounded-xl text-xs tracking-wider transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Cash Out (₹{(betAmount * currentMultiplier).toFixed(2)})
          </button>
        )}

        {/* Notifications and Alerts */}
        {feedback && (
          <div className={`p-4 rounded-xl flex items-start gap-2.5 text-xs border ${
            feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* Grid Column */}
      <div className="lg:col-span-2 bg-[#12161b] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex items-center justify-center min-h-[400px]">
        <div className="grid grid-cols-5 gap-3 max-w-[360px] w-full aspect-square" id="mines_grid_arcade">
          {Array.from({ length: 25 }).map((_, idx) => {
            const isRevealed = revealedPositions.includes(idx);
            const isMine = isMineTile(idx);
            const isBlown = explodedPosition === idx;

            let tileStyle = "bg-zinc-900 border-zinc-800 text-zinc-600 hover:bg-zinc-850 hover:border-zinc-700 hover:-translate-y-0.5 shadow-md";
            let content = <span className="text-[10px] font-mono font-black text-zinc-700">{idx + 1}</span>;

            if (isRevealed) {
              tileStyle = "bg-amber-500 border-amber-400 text-zinc-950 scale-95 shadow-inner ring-4 ring-amber-500/10";
              content = <Sparkles className="w-6 h-6 text-zinc-950 animate-pulse" />;
            } else if (isBlown) {
              tileStyle = "bg-rose-600 border-rose-500 text-white scale-95 animate-bounce ring-4 ring-rose-500/20";
              content = <Bomb className="w-6 h-6 text-white animate-spin" />;
            } else if (isMine && !gameActive) {
              // Mine revealed after cashout/loss
              tileStyle = "bg-rose-950 border-rose-900 text-rose-500 scale-90";
              content = <Bomb className="w-5 h-5" />;
            } else if (!gameActive && revealedPositions.length > 0) {
              // Safe tile revealed after cashout
              tileStyle = "bg-emerald-950 border-emerald-900 text-emerald-500 scale-90";
              content = <Sparkles className="w-5 h-5" />;
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={!gameActive || isRevealed}
                onClick={() => handleReveal(idx)}
                className={`w-full aspect-square rounded-2xl border flex items-center justify-center font-bold text-lg transition duration-200 select-none ${tileStyle}`}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
