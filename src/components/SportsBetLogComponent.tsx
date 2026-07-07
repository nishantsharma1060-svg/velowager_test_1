import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, Trophy } from 'lucide-react';

export const SportsBetLogComponent: React.FC<{ token: string | null }> = ({ token }) => {
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/user/sports-bets', { headers: { Authorization: token } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load sports bets.');
      setBets(data.bets || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);
  const visible = useMemo(() => bets.filter(bet => {
    const matchesFilter = filter === 'all' || bet.status === filter;
    const query = search.toLowerCase();
    return matchesFilter && (!query || `${bet.id} ${bet.matchup} ${bet.selection} ${bet.bookmaker}`.toLowerCase().includes(query));
  }), [bets, filter, search]);

  const statusStyle = (status: string) => status === 'won' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : status === 'lost' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : status === 'cashed_out' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-[#12161b] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-purple-500/15 p-2.5 text-purple-400"><Trophy className="h-5 w-5" /></div><div><h2 className="text-sm font-black uppercase tracking-wider text-white">My Sports Bet Log</h2><p className="mt-1 text-[10px] text-zinc-500">Audit placed odds, cash-outs, results and payouts</p></div></div><div className="flex flex-wrap items-center gap-2"><div className="relative"><Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600"/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search sports bets…" className="w-48 rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-purple-500" /></div><button onClick={load} className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-zinc-400 hover:text-white"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div></div>
    <div className="flex gap-2 overflow-x-auto">{['all', 'won', 'lost', 'pending', 'cashed_out'].map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase ${filter === item ? 'bg-purple-500 text-white' : 'border border-zinc-800 bg-zinc-900 text-zinc-400'}`}>{item.replace('_', ' ')}</button>)}</div>
    {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">{error}</div>}
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#12161b]"><table className="w-full min-w-[1050px] text-left text-[11px]"><thead className="border-b border-zinc-800 bg-zinc-950/50 text-[9px] uppercase tracking-wider text-zinc-500"><tr><th className="p-4">Bet ID / Event</th><th className="p-4">Selection</th><th className="p-4">Bookmaker</th><th className="p-4 text-right">Stake</th><th className="p-4 text-center">Placed Odds</th><th className="p-4 text-center">Cash-out Odds</th><th className="p-4 text-center">Status</th><th className="p-4 text-right">Payout</th><th className="p-4">Placed / Settled</th></tr></thead><tbody>{loading ? <tr><td colSpan={9} className="p-12 text-center text-zinc-500">Loading sports bets…</td></tr> : visible.length === 0 ? <tr><td colSpan={9} className="p-12 text-center text-zinc-500">No sports bets found.</td></tr> : visible.map(bet => <tr key={bet.id} className="border-b border-zinc-900 text-zinc-300"><td className="p-4"><div className="font-mono font-bold text-purple-300">{bet.id}</div><div className="mt-1 max-w-[190px] truncate text-[9px] text-zinc-500">{bet.matchup}</div></td><td className="p-4"><div className="font-bold text-white">{bet.selection}</div><div className="mt-1 text-[9px] uppercase text-zinc-600">{bet.sportKey.replaceAll('_', ' ')}</div></td><td className="p-4 text-zinc-400">{bet.bookmaker}</td><td className="p-4 text-right font-mono font-bold">₹{Number(bet.wager).toFixed(2)}</td><td className="p-4 text-center font-mono font-black text-purple-400">{bet.originalOdds?.toFixed(2) || '—'}</td><td className="p-4 text-center font-mono font-black text-cyan-400">{bet.cashoutOdds?.toFixed(2) || '—'}</td><td className="p-4 text-center"><span className={`rounded-lg border px-2 py-1 text-[9px] font-black uppercase ${statusStyle(bet.status)}`}>{bet.status.replace('_', ' ')}</span></td><td className="p-4 text-right font-mono font-black text-emerald-400">₹{Number(bet.payout).toFixed(2)}</td><td className="p-4 text-[9px] text-zinc-500"><div>{new Date(bet.placedAt).toLocaleString()}</div><div className="mt-1">{bet.settledAt ? new Date(bet.settledAt).toLocaleString() : 'Awaiting result'}</div></td></tr>)}</tbody></table></div>
  </div>;
};
