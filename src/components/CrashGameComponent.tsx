import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, AlertCircle, Rocket, Sparkles, Flame, TrendingUp } from 'lucide-react';

interface CrashGameProps {
  token: string | null;
  refreshWallet: () => void;
}

export const CrashGameComponent: React.FC<CrashGameProps> = ({ token, refreshWallet }) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Flight simulation states
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashed, setCrashed] = useState<boolean>(false);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [won, setWon] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const crashPointRef = useRef<number | null>(null);

  const triggerLaunchSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {}
  };

  const triggerCrashSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
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
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {}
  };

  // Rocket flight ticking loop using requestAnimationFrame
  const tick = () => {
    if (startTimeRef.current === null || crashPointRef.current === null) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    // exponential multiplier increase formula: e^(0.065 * t)
    const currentMult = Math.exp(0.065 * elapsed);

    if (currentMult >= crashPointRef.current) {
      // Rocket exploded!
      setMultiplier(crashPointRef.current);
      setGameActive(false);
      setCrashed(true);
      setCrashPoint(crashPointRef.current);
      requestRef.current = null;
      // Finalize the lost session server-side so the next launch is not blocked.
      void fetch('/api/game/crash/resolve', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => undefined);
      triggerCrashSound();
      setFeedback({
        type: 'error',
        msg: `💥 Boom! The rocket exploded at ${crashPointRef.current.toFixed(2)}x`
      });
      refreshWallet();
    } else {
      setMultiplier(currentMult);
      requestRef.current = requestAnimationFrame(tick);
    }
  };

  const handleLaunch = async () => {
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
    setCrashed(false);
    setWon(false);
    setMultiplier(1.0);
    setCrashPoint(null);

    try {
      const r = await fetch('/api/game/crash/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ betAmount })
      });
      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || 'Launch failed');
      }

      // Decode our crash point securely
      const decodedCrash = parseFloat(atob(d.token));
      crashPointRef.current = decodedCrash;
      startTimeRef.current = Date.now();
      setGameActive(true);
      triggerLaunchSound();
      refreshWallet();

      // Trigger the render tick
      requestRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCashout = async () => {
    if (!gameActive || loading) return;

    // Stop ticking on client immediately to lock the cashout rate
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    setLoading(true);
    setFeedback(null);

    try {
      const r = await fetch('/api/game/crash/cashout', {
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
      if (d.crashed) {
        setCrashed(true);
        setCrashPoint(d.crashPoint || 1.0);
        triggerCrashSound();
        setFeedback({ type: 'error', msg: d.message || 'Crashed before cashout!' });
      } else {
        setWon(true);
        setMultiplier(d.multiplier || 1.0);
        setWinAmount(d.winAmount);
        triggerCashoutSound();
        setFeedback({
          type: 'success',
          msg: `🎉 Cashed out! Won ₹${d.winAmount}! (Multiplier: ${d.multiplier}x)`
        });
      }
      refreshWallet();
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message });
      // Resume loop if server-side cashout call errors out
      requestRef.current = requestAnimationFrame(tick);
    } finally {
      setLoading(false);
    }
  };

  // Clean up animation frames
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="crash_multiplier_section">
      {/* Flight Control column */}
      <div className="bg-[#12161b] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Rocket className="w-5 h-5 text-rose-500 animate-pulse" />
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Crash Multiplier</h2>
            <span className="text-[10px] text-zinc-500 font-mono block">Eject Before the Rocket Crashes</span>
          </div>
        </div>

        {/* Bet Amount */}
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

        {/* Multiplier Stats Display */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black uppercase text-zinc-500 block">Live Multiplier</span>
            <span className={`text-2xl font-black font-mono mt-0.5 block flex items-center gap-1.5 transition ${
              crashed ? 'text-rose-500' : won ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              <TrendingUp className="w-5 h-5" />
              {multiplier.toFixed(2)}x
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black uppercase text-zinc-500 block">Current Winnings</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-1 block">
              ₹{(betAmount * multiplier).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Launch / Cashout button */}
        {!gameActive ? (
          <button
            onClick={handleLaunch}
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-400 text-white font-black uppercase py-3.5 rounded-xl text-xs tracking-wider transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Rocket className="w-4 h-4" />
            Launch Rocket
          </button>
        ) : (
          <button
            onClick={handleCashout}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase py-3.5 rounded-xl text-xs tracking-wider transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Eject & Cash Out
          </button>
        )}

        {/* Action Alerts */}
        {feedback && (
          <div className={`p-4 rounded-xl flex items-start gap-2.5 text-xs border ${
            feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* Graphical flight simulator canvas stage */}
      <div className="lg:col-span-2 bg-[#12161b] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[400px] relative overflow-hidden">
        {/* Dynamic background stars/flames */}
        <div className="absolute inset-0 bg-radial-at-t from-rose-500/5 via-transparent to-transparent pointer-events-none"></div>

        {/* Upper HUD */}
        <div className="flex justify-between items-center z-10">
          <span className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">Flight Radar Stream</span>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${gameActive ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide">
              {gameActive ? 'FLIGHT ACTIVE' : crashed ? 'CRASHED' : 'READY FOR LAUNCH'}
            </span>
          </div>
        </div>

        {/* Flight stage center rendering */}
        <div className="flex-1 flex items-center justify-center relative">
          {gameActive && (
            <div className="absolute bottom-10 left-10 text-[10px] font-mono text-zinc-600 animate-pulse flex flex-col gap-0.5">
              <span>Altitude Rate: {(multiplier * 300).toFixed(0)}m</span>
              <span>Velocity: {(multiplier * 850).toFixed(0)}km/h</span>
            </div>
          )}

          {/* Central Rocket Icon with rising exponential alignment */}
          <div 
            className="transition-all duration-75 flex flex-col items-center gap-2"
            style={gameActive ? {
              transform: `translate(${(multiplier - 1) * 15}px, -${(multiplier - 1) * 20}px) scale(${0.9 + multiplier * 0.05})`,
              maxHeight: '180px',
              maxWidth: '180px'
            } : {}}
          >
            {crashed ? (
              <div className="flex flex-col items-center gap-1.5 scale-110">
                <Flame className="w-16 h-16 text-rose-500 animate-bounce" />
                <span className="text-xs font-black text-rose-500 uppercase font-mono tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Exploded</span>
              </div>
            ) : won ? (
              <div className="flex flex-col items-center gap-1.5 scale-110">
                <Sparkles className="w-16 h-16 text-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-emerald-400 uppercase font-mono tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Ejected Safely</span>
              </div>
            ) : (
              <div className="relative">
                <Rocket className={`w-16 h-16 text-amber-400 transform rotate-45 ${gameActive ? 'animate-bounce' : ''}`} />
                {gameActive && (
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-rose-500 rounded-full blur-sm animate-ping"></div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Altitude Multiplier bar */}
        <div className="border-t border-zinc-850/60 pt-4 flex items-center justify-between z-10">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Atmosphere Scale</span>
          <span className="text-sm font-black text-zinc-400 font-mono tracking-wider">
            {multiplier.toFixed(2)}x
          </span>
        </div>
      </div>
    </div>
  );
};
