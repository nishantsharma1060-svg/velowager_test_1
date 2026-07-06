import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, HelpCircle, Gift, RefreshCw, Clock, Volume2, VolumeX, AlertCircle } from 'lucide-react';

interface LuckyWheelComponentProps {
  token: string | null;
  refreshWallet: () => void;
}

interface Prize {
  amount: number;
  label: string;
  color: string;
}

const PRIZES: Prize[] = [
  { amount: 5, label: '₹5 Bonus', color: '#f43f5e' },      // Rose
  { amount: 10, label: '₹10 Bonus', color: '#10b981' },    // Emerald
  { amount: 20, label: '₹20 Bonus', color: '#3b82f6' },    // Blue
  { amount: 50, label: '₹50 Mega', color: '#eab308' },     // Yellow
  { amount: 100, label: '₹100 Epic', color: '#a855f7' },   // Purple
  { amount: 500, label: '💎 ₹500 JACKPOT', color: '#f97316' }, // Orange
];

export const LuckyWheelComponent: React.FC<LuckyWheelComponentProps> = ({ token, refreshWallet }) => {
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [cooldownMs, setCooldownMs] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rotation, setRotation] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Fetch status of lucky spin
  const fetchStatus = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/user/lucky-spin/status', {
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (res.ok) {
        setAvailable(data.available);
        if (data.cooldownMs) {
          setCooldownMs(data.cooldownMs);
        } else {
          setCooldownMs(null);
        }
      }
    } catch (err: any) {
      console.error('[Lucky Wheel] Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [token]);

  // Handle countdown
  useEffect(() => {
    if (cooldownMs === null || cooldownMs <= 0) return;
    const interval = setInterval(() => {
      setCooldownMs((prev) => {
        if (prev === null || prev <= 1000) {
          clearInterval(interval);
          setAvailable(true);
          return null;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownMs]);

  // Play synthetic audio sounds using Web Audio API
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  };

  const playWinSound = (isJackpot: boolean) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      const playTone = (freq: number, start: number, duration: number, volume: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(volume, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      if (isJackpot) {
        // Grand fanfare!
        playTone(523.25, 0, 0.2, 0.1);     // C5
        playTone(659.25, 0.15, 0.2, 0.1);  // E5
        playTone(783.99, 0.3, 0.2, 0.1);   // G5
        playTone(1046.50, 0.45, 0.5, 0.15); // C6
      } else {
        // Happy standard reward tone
        playTone(587.33, 0, 0.15, 0.08);   // D5
        playTone(880.00, 0.12, 0.3, 0.08);  // A5
      }
    } catch {}
  };

  const handleSpin = async () => {
    if (isSpinning || !available || !token) return;
    setErrorMsg(null);
    setMessage(null);
    setIsSpinning(true);

    try {
      const res = await fetch('/api/user/lucky-spin', {
        method: 'POST',
        headers: { Authorization: token },
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to complete lucky spin. Please try again.');
        setIsSpinning(false);
        return;
      }

      const targetIdx = data.index;
      // Calculate final rotation degrees:
      // The wheel is split into 6 segments (60 degrees each)
      // Index 0: 0 to 60 deg, centered at 30 deg.
      // Index 1: 60 to 120 deg, centered at 90 deg, and so on.
      // To align target slice to the top pointer (at 90 deg on a standard circle or 0/360 depending on offset),
      // we calculate segment rotation. Segment angle = 360 / 6 = 60 degrees.
      // We want to point to target index.
      // Offset so pointer at top (270 degrees on wheel) points to correct slice.
      const segmentAngle = 360 / 6;
      const targetAngle = 360 - (targetIdx * segmentAngle) - (segmentAngle / 2);
      const extraSpins = 5 * 360; // 5 full revolutions
      const finalRotation = rotation + extraSpins + (targetAngle - (rotation % 360));

      // Simulate ticker sounds during spinning using a timeout
      let soundTicks = 0;
      const tickInterval = setInterval(() => {
        if (soundTicks < 30) {
          playTickSound();
          soundTicks++;
        } else {
          clearInterval(tickInterval);
        }
      }, 100);

      setRotation(finalRotation);

      setTimeout(() => {
        clearInterval(tickInterval);
        setIsSpinning(false);
        setPrizeIndex(targetIdx);
        setMessage(data.message);
        setAvailable(false);
        if (data.prize.amount >= 100) {
          playWinSound(true);
        } else {
          playWinSound(false);
        }
        refreshWallet();
        fetchStatus();
      }, 5000);

    } catch (err: any) {
      console.error('[Lucky Wheel] Error spinning:', err);
      setErrorMsg('Network error. Check connection and retry.');
      setIsSpinning(false);
    }
  };

  // Convert cooldownMs to readable HH:MM:SS
  const formatCooldown = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#12161b] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="premium_lucky_wheel">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Column: Title & Description */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Premium Exclusive</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
            Daily Lucky Wheel
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto lg:mx-0">
            Spin the premium high-stakes wheel completely free once every 24 hours to claim real cash bonuses. Unlocked automatically for all loyalty tier members!
          </p>

          <div className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-2xl flex items-center gap-3 max-w-sm mx-auto lg:mx-0">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-zinc-500 uppercase">Jackpot Prize</div>
              <div className="text-sm font-black text-amber-400 flex items-center gap-1">
                <span>🏆 ₹500 Instant Cash</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-855 border border-zinc-800 text-zinc-400 hover:text-white transition"
              title={soundEnabled ? 'Disable spin sound' : 'Enable spin sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            <button
              onClick={fetchStatus}
              disabled={loading || isSpinning}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-855 border border-zinc-800 text-zinc-400 hover:text-white transition disabled:opacity-50"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right Column: Animated Wheel Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-xs sm:max-w-sm">
          {/* Top Pointer */}
          <div className="absolute top-[-8px] z-20 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[18px] border-t-rose-500 filter drop-shadow-[0_2px_4px_rgba(244,63,94,0.3)]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-rose-500 mt-[-4px]"></div>
          </div>

          {/* Main Rotating Wheel */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-zinc-800 bg-zinc-950 p-2 shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Soft inner glow ring */}
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800 pointer-events-none z-10"></div>
            
            <motion.div
              animate={{ rotate: rotation }}
              initial={false}
              transition={{ duration: 5, ease: [0.1, 0.8, 0.1, 1] }}
              className="w-full h-full rounded-full relative overflow-hidden"
            >
              {/* Pie Slices */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-[120deg]">
                {PRIZES.map((prize, i) => {
                  const angle = 360 / PRIZES.length;
                  const startAngle = i * angle;
                  const endAngle = startAngle + angle;
                  
                  // Convert polar to cartesian coordinates for SVG path
                  const rad1 = ((startAngle - 90) * Math.PI) / 180;
                  const rad2 = ((endAngle - 90) * Math.PI) / 180;
                  const x1 = 50 + 50 * Math.cos(rad1);
                  const y1 = 50 + 50 * Math.sin(rad1);
                  const x2 = 50 + 50 * Math.cos(rad2);
                  const y2 = 50 + 50 * Math.sin(rad2);

                  const dPath = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  // Calculate label angle
                  const labelAngle = startAngle + angle / 2;
                  const labelRad = ((labelAngle - 90) * Math.PI) / 180;
                  const lx = 50 + 32 * Math.cos(labelRad);
                  const ly = 50 + 32 * Math.sin(labelRad);

                  return (
                    <g key={i}>
                      <path
                        d={dPath}
                        fill={prize.color}
                        opacity={0.85}
                        className="transition duration-150 hover:opacity-95"
                      />
                      <g transform={`translate(${lx}, ${ly}) rotate(${labelAngle + 90})`}>
                        <text
                          x="0"
                          y="0"
                          fill="#ffffff"
                          fontSize="3.8"
                          fontWeight="900"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          fontFamily="sans-serif"
                          className="select-none tracking-wider text-shadow-sm"
                        >
                          {prize.label}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Decorative inner pins/dots */}
              <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none"></div>
            </motion.div>

            {/* Inner center gold medallion / spin trigger */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || !available || loading}
              className={`absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full z-10 flex flex-col items-center justify-center border-4 border-zinc-800 shadow-xl transition-all duration-300 ${
                available && !isSpinning && !loading
                  ? 'bg-gradient-to-br from-amber-400 to-rose-500 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20'
                  : 'bg-zinc-900 text-zinc-500 cursor-not-allowed border-zinc-850'
              }`}
            >
              {isSpinning ? (
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
              ) : available && !loading ? (
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider block">SPIN</span>
                  <span className="text-[7px] font-bold uppercase tracking-widest block opacity-90">FREE</span>
                </div>
              ) : (
                <Clock className="w-5 h-5 text-zinc-500" />
              )}
            </button>
          </div>

          {/* Feedback & Cooldown Section */}
          <div className="mt-6 text-center w-full min-h-[48px]">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-zinc-500 font-bold"
                >
                  Checking your daily spin eligibility...
                </motion.div>
              )}

              {!loading && available && !isSpinning && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-emerald-400 text-xs font-black uppercase tracking-widest animate-bounce flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Free Daily Spin is ready!</span>
                </motion.div>
              )}

              {!loading && !available && !isSpinning && cooldownMs !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-950/60 border border-zinc-900 rounded-xl px-4 py-2 inline-flex items-center gap-2 text-zinc-400 text-xs"
                >
                  <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Next spin available in:</span>
                  <span className="font-mono font-black text-rose-400 tracking-wider">
                    {formatCooldown(cooldownMs)}
                  </span>
                </motion.div>
              )}

              {isSpinning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-amber-400 font-extrabold tracking-widest uppercase animate-pulse"
                >
                  🎰 Spinning the wheel... Best of Luck! 🎰
                </motion.div>
              )}

              {message && !isSpinning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black rounded-xl py-2.5 px-4 inline-flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{message}</span>
                </motion.div>
              )}

              {errorMsg && !isSpinning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs font-bold rounded-xl py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
