import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, CalendarDays, ChevronRight, RefreshCw, ShieldCheck, Trophy, Users } from 'lucide-react';

type Sport = { key: string; group: string; title: string };
type Pick = { event: any; outcome: any; bookmaker: any };
const SPORT_ICONS: Record<string, string> = { Tennis: '🎾', Soccer: '⚽', Cricket: '🏏', Basketball: '🏀', Baseball: '⚾', 'American Football': '🏈', 'Ice Hockey': '🏒', Rugby: '🏉', Golf: '⛳', Boxing: '🥊', 'Mixed Martial Arts': '🥋', Esports: '🎮' };

async function readApiResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const preview = (await response.text()).slice(0, 80);
    const isHtml = preview.trimStart().startsWith('<');
    throw new Error(isHtml
      ? 'The sportsbook API route is not active on this server. Restart or redeploy the Node server, then try again.'
      : `The sportsbook server returned an unsupported response (${response.status}).`);
  }
  return response.json();
}

export const SportsbookComponent: React.FC<{ token: string | null; refreshWallet: () => void; refreshBets: () => void }> = ({ token, refreshWallet, refreshBets }) => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportKey, setSportKey] = useState('upcoming');
  const [events, setEvents] = useState<any[]>([]);
  const [pick, setPick] = useState<Pick | null>(null);
  const [stake, setStake] = useState(100);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [quota, setQuota] = useState<string | null>(null);
  const [openBets, setOpenBets] = useState<any[]>([]);
  const [cashingOut, setCashingOut] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    const response = await fetch('/api/sports/catalog');
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(data.error || 'Sports feed is unavailable.');
    setSports(data.sports || []);
  }, []);

  const loadOdds = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/sports/odds?sport=${encodeURIComponent(sportKey)}`);
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.error || 'Could not load live odds.');
      setEvents(data.events || []); setQuota(data.quota?.remaining || null); setPick(null);
    } catch (err: any) { setError(err.message); setEvents([]); }
    finally { setLoading(false); }
  }, [sportKey]);

  const loadOpenBets = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/user/bets', { headers: { Authorization: token } });
      const data = await readApiResponse(response);
      if (response.ok) setOpenBets((data.bets || []).filter((bet: any) => bet.gameId === 'sports' && bet.status === 'pending'));
    } catch {}
  }, [token]);

  useEffect(() => { loadCatalog().catch((err: any) => setError(err.message)); }, [loadCatalog]);
  useEffect(() => { loadOdds(); }, [loadOdds]);
  useEffect(() => { loadOpenBets(); }, [loadOpenBets]);
  useEffect(() => {
    if (!token) return;
    const timer = setInterval(async () => {
      await fetch('/api/sports/settle', { method: 'POST', headers: { Authorization: token } }).catch(() => null);
      refreshWallet(); refreshBets();
      loadOpenBets();
    }, 60000);
    return () => clearInterval(timer);
  }, [token, refreshWallet, refreshBets, loadOpenBets]);

  const groupedSports = useMemo(() => sports.reduce<Record<string, Sport[]>>((groups, sport) => {
    (groups[sport.group] ||= []).push(sport); return groups;
  }, {}), [sports]);

  const bestSelections = (event: any) => {
    const best = new Map<string, Pick>();
    for (const bookmaker of event.bookmakers || []) {
      const market = bookmaker.markets?.find((item: any) => item.key === 'h2h');
      for (const outcome of market?.outcomes || []) {
        const current = best.get(outcome.name);
        if (!current || Number(outcome.price) > Number(current.outcome.price)) best.set(outcome.name, { event, outcome, bookmaker });
      }
    }
    return [...best.values()];
  };

  const placeBet = async () => {
    if (!pick || !token) return;
    setPlacing(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/sports/bet', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token }, body: JSON.stringify({ sportKey: pick.event.sport_key, eventId: pick.event.id, bookmakerKey: pick.bookmaker.key, outcomeName: pick.outcome.name, amount: stake }) });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.error || 'Bet placement failed.');
      setMessage(data.message); setPick(null); refreshWallet(); refreshBets(); loadOpenBets();
    } catch (err: any) { setError(err.message); }
    finally { setPlacing(false); }
  };

  const cashOut = async (betId: string) => {
    if (!token) return;
    setCashingOut(betId); setError(''); setMessage('');
    try {
      const response = await fetch('/api/sports/cashout', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token }, body: JSON.stringify({ betId }) });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.error || 'Cash-out failed.');
      setMessage(data.message); refreshWallet(); refreshBets(); loadOpenBets();
    } catch (err: any) { setError(err.message); }
    finally { setCashingOut(null); }
  };

  return <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
    <section className="space-y-4 min-w-0">
      <div className="overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#171421] to-[#101820] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 px-5 py-4"><div><div className="text-[9px] font-black uppercase tracking-[.22em] text-purple-400">VeloWager Pro Sports</div><div className="mt-1 flex items-center gap-2 text-lg font-black text-white"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />Live & Upcoming</div></div><button onClick={loadOdds} disabled={loading} className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-[10px] font-black text-zinc-300 transition hover:border-purple-500/40 hover:text-white"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Refresh Odds</span></button></div>
        <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">{Object.entries(groupedSports).slice(0, 16).map(([group, items]) => { const active = items.some(item => item.key === sportKey); return <button key={group} onClick={() => setSportKey(items[0].key)} className={`relative flex min-w-0 flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition ${active ? 'border-purple-500/50 bg-purple-500/15 text-white shadow-lg shadow-purple-500/5' : 'border-transparent bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white'}`}><span className="text-2xl">{SPORT_ICONS[group] || '🏆'}</span><span className="absolute right-1.5 top-1.5 rounded-full bg-purple-500 px-1.5 text-[8px] font-black text-white">{items.length}</span><span className="w-full truncate text-[9px] font-black">{group}</span></button>})}</div>
      </div>
      {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400">{error}</div>}
      {loading ? <div className="rounded-2xl border border-zinc-800 bg-[#12161b] p-12 text-center text-xs text-zinc-500"><RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-purple-400" />Loading current markets…</div> : events.length === 0 && !error ? <div className="rounded-2xl border border-zinc-800 bg-[#12161b] p-12 text-center text-xs text-zinc-500">No markets are currently offered for this competition.</div> : events.map(event => {
        const live = new Date(event.commence_time).getTime() <= Date.now(); const selections = bestSelections(event);
        return <article key={event.id} className="rounded-2xl border border-zinc-800 bg-[#12161b] p-4 shadow-xl"><div className="mb-4 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-[9px] font-black uppercase text-purple-400">{live && <span className="rounded bg-rose-500 px-1.5 py-0.5 text-white">LIVE</span>}{event.sport_title}</div><div className="mt-1 text-sm font-black text-white">{event.home_team} <span className="mx-1 text-zinc-600">vs</span> {event.away_team}</div></div><div className="flex shrink-0 items-center gap-1 text-[9px] text-zinc-500"><CalendarDays className="w-3 h-3" />{new Date(event.commence_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div><div className={`grid gap-2 ${selections.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>{selections.map(selection => { const selected = pick?.event.id === event.id && pick?.outcome.name === selection.outcome.name; return <button key={selection.outcome.name} onClick={() => setPick(selection)} className={`rounded-xl border p-3 text-left transition ${selected ? 'border-purple-500 bg-purple-500/15' : 'border-zinc-850 bg-zinc-950 hover:border-zinc-700'}`}><span className="block truncate text-[10px] text-zinc-400">{selection.outcome.name}</span><span className="mt-1 block font-mono text-sm font-black text-white">{Number(selection.outcome.price).toFixed(2)}</span><span className="block truncate text-[8px] text-zinc-600">{selection.bookmaker.title}</span></button>})}</div></article>;
      })}
    </section>
    <aside className="h-fit rounded-2xl border border-zinc-800 bg-[#12161b] p-5 xl:sticky xl:top-20"><div className="flex items-center gap-2 border-b border-zinc-800 pb-4"><Activity className="w-4 h-4 text-purple-400"/><h3 className="text-sm font-black text-white">Bet Slip</h3></div>{!pick ? <div className="py-8 text-center"><Users className="mx-auto mb-3 h-7 w-7 text-zinc-700"/><p className="text-xs text-zinc-500">Select current odds to add a pick.</p></div> : <div className="space-y-4 py-4"><div className="rounded-xl border border-zinc-850 bg-zinc-950 p-3"><div className="text-[9px] text-zinc-500">{pick.event.home_team} vs {pick.event.away_team}</div><div className="mt-2 flex justify-between gap-3 text-xs font-bold text-white"><span>{pick.outcome.name}</span><span className="font-mono text-purple-400">{Number(pick.outcome.price).toFixed(2)}</span></div><div className="mt-1 text-[9px] text-zinc-600">Best price · {pick.bookmaker.title}</div></div><label className="block text-[9px] font-black uppercase text-zinc-500">Stake (₹)<input type="number" min="10" max="50000" value={stake} onChange={event => setStake(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-purple-500" /></label><div className="flex justify-between text-xs"><span className="text-zinc-500">Potential return</span><span className="font-black text-purple-400">₹{(stake * Number(pick.outcome.price)).toFixed(2)}</span></div><button onClick={placeBet} disabled={placing || stake < 10 || stake > 50000} className="flex w-full items-center justify-center gap-1 rounded-xl bg-purple-500 p-3 text-xs font-black text-white transition hover:bg-purple-400 disabled:opacity-50">{placing ? 'Checking live price…' : 'Place Bet'}<ChevronRight className="w-4 h-4" /></button></div>}{message && <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">{message}</div>}{openBets.length > 0 && <div className="mt-5 border-t border-zinc-800 pt-4"><div className="mb-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">Open Bets · Cash Out</div><div className="space-y-2">{openBets.map(bet => <div key={bet.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3"><div className="truncate text-[10px] font-bold text-white">{bet.betValue}</div><div className="mt-2 flex items-center justify-between"><span className="text-[10px] text-zinc-500">Stake ₹{Number(bet.amount).toFixed(2)}</span><button onClick={() => cashOut(bet.id)} disabled={cashingOut === bet.id} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-black text-[#09212b] disabled:opacity-50">{cashingOut === bet.id ? 'Checking live odds…' : 'Cash Out'}</button></div></div>)}</div></div>}<div className="mt-4 flex gap-2 border-t border-zinc-900 pt-4 text-[9px] leading-relaxed text-zinc-600"><ShieldCheck className="h-4 w-4 shrink-0 text-purple-400"/><span>Cash-out uses stake × original odds ÷ freshly requested current odds, then applies the payout rate.{quota && ` Provider credits remaining: ${quota}.`}</span></div></aside>
  </div>;
};
