import React from 'react';
import {
  ArrowRight, CheckCircle2, CircleHelp, Clock3, Coins, Gem, Headphones,
  BarChart3, CircleDot, Dices, Gamepad2, Heart, LifeBuoy, LockKeyhole,
  Rocket, ShieldCheck, Sparkles, Target, Users, WalletCards
} from 'lucide-react';

const games = [
  {
    name: 'Color Trading', eyebrow: 'Fast rounds', description: 'Choose a colour or number before the timer closes. The result settles automatically when the round ends.',
    odds: 'Up to 9×', rtp: 'Published per market', accent: 'lime', preview: 'color'
  },
  {
    name: 'Mines', eyebrow: 'Risk, revealed', description: 'Set the mine count, reveal safe tiles, and cash out before you uncover a mine.',
    odds: 'Dynamic multiplier', rtp: '97% target RTP', accent: 'cyan', preview: 'mines'
  },
  {
    name: 'Crash', eyebrow: 'Cash out in time', description: 'The multiplier rises from 1.00×. Cash out before the curve crashes to lock in your return.',
    odds: 'Live multiplier', rtp: '97% target RTP', accent: 'orange', preview: 'crash'
  },
  {
    name: 'Coin Flip', eyebrow: 'Simple 50/50', description: 'Pick heads or tails, confirm your stake, and see the server-verified result immediately.',
    odds: '1.94× payout', rtp: '97% target RTP', accent: 'violet', preview: 'coin'
  },
];

function GamePreview({ type }: { type: string }) {
  if (type === 'mines') return <div className="landing-preview-grid">{Array.from({length: 20}).map((_, i) => <span key={i} className={i === 6 || i === 13 ? 'is-gem' : ''}>{i === 6 || i === 13 ? <Gem /> : ''}</span>)}</div>;
  if (type === 'crash') return <div className="landing-crash"><div className="landing-crash-value">2.47×</div><svg viewBox="0 0 400 130" preserveAspectRatio="none"><path d="M0 125 C100 122 160 112 225 88 S330 42 400 6"/><path className="fill" d="M0 125 C100 122 160 112 225 88 S330 42 400 6 L400 130 L0 130Z"/></svg><Rocket /></div>;
  if (type === 'coin') return <div className="landing-coin"><div className="coin-disc">V</div><div><span>Your pick</span><strong>HEADS</strong><small>Potential return · ₹194.00</small></div></div>;
  return <div className="landing-colors"><div><span className="red">R</span><span className="green">G</span><span className="violet">V</span></div><div className="landing-timer"><small>Round closes in</small><strong>00:18</strong></div><div className="landing-numbers">{[0,1,2,3,4,5,6,7,8,9].map(n => <span key={n}>{n}</span>)}</div></div>;
}

export default function LandingPage() {
  const goToAuth = (mode: 'login' | 'register') => {
    window.dispatchEvent(new CustomEvent('landing-auth-mode', { detail: mode }));
    requestAnimationFrame(() => document.getElementById('auth_portal')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  return <div className="landing-shell">
    <section className="landing-hero">
      <div className="landing-hero-copy">
        <div className="landing-kicker"><span /> Clear rules. Verifiable rounds. Your limits.</div>
        <h1>Play with the <em>whole picture.</em></h1>
        <p>Quick, transparent games with odds shown before every wager, independently checkable results, and withdrawal terms you can read before you deposit.</p>
        <div className="landing-actions">
          <button onClick={() => goToAuth('register')} className="landing-primary">Create account <ArrowRight /></button>
          <a href="#games" className="landing-secondary">See how games work</a>
        </div>
        <div className="landing-proof-row"><span><ShieldCheck /> Provably fair</span><span><Target /> Odds shown upfront</span><span><LifeBuoy /> Human support</span></div>
        <p className="landing-legal-note">18+ only. Gambling involves risk. Set a budget and never chase losses.</p>
      </div>
      <div className="landing-hero-visual">
        <div className="landing-live-card"><div className="live-top"><span><i /> LIVE ROUND</span><small>#VG-84291</small></div><div className="live-main"><small>MULTIPLIER</small><strong>3.26×</strong><div className="live-line"><span /></div></div><div className="live-bottom"><div><small>Your wager</small><b>₹100.00</b></div><button>Cash out · ₹326.00</button></div></div>
        <div className="landing-float-card fair"><ShieldCheck /><span><b>Seed committed</b><small>SHA-256 hash locked</small></span></div>
        <div className="landing-float-card limit"><Clock3 /><span><b>Session reminder</b><small>Playing for 28 minutes</small></span></div>
      </div>
    </section>

    <section className="landing-strip" aria-label="Platform highlights"><div><strong>7</strong><span>game experiences</span></div><div><strong>97%</strong><span>target RTP*</span></div><div><strong>₹100</strong><span>minimum withdrawal</span></div><div><strong>24/7</strong><span>ticket support</span></div></section>

    <section className="landing-games" id="games">
      <div className="landing-section-head"><div><span className="landing-label">THE GAME FLOOR</span><h2>Know the move before you make it.</h2></div><p>These are interface previews from the games you’ll play. Every wager screen shows the stake, potential payout, and rules before confirmation.</p></div>
      <div className="landing-game-grid">{games.map((game, i) => <article className={`landing-game-card ${game.accent}`} key={game.name}>
        <div className="landing-shot"><div className="shot-bar"><span><i /> LIVE INTERFACE</span><small>0{i+1}</small></div><GamePreview type={game.preview}/></div>
        <div className="game-copy"><span>{game.eyebrow}</span><h3>{game.name}</h3><p>{game.description}</p><div><small>Return model <b>{game.odds}</b></small><small>Transparency <b>{game.rtp}</b></small></div></div>
      </article>)}</div>
      <p className="landing-footnote">*RTP is a long-run statistical estimate, not a promise for any session. Exact rules and house edge are displayed in each game before play.</p>
    </section>

    <section className="landing-new-games" id="new-games">
      <div className="landing-section-head"><div><span className="landing-label">PLAY YOUR WAY</span><h2>Three new favourites to explore.</h2></div><p>Try each concept in free-play mode first. No balance, countdown, or deposit is required to learn how the game works.</p></div>
      <div className="new-game-grid">
        <article><div className="new-game-visual plinko-board">{Array.from({length:12}).map((_,i)=><i key={i}/>)}<span>8×</span><span>2×</span><span>0.5×</span><span>2×</span><span>8×</span></div><div className="new-game-copy"><span>FREE-PLAY PREVIEW</span><h3>Plinko</h3><p>Drop a ball through the peg board and choose low, medium, or high volatility before each round.</p><button onClick={() => goToAuth('register')}>Explore Plinko <ArrowRight/></button></div></article>
        <article><div className="new-game-visual dice-board"><Dices/><strong>63.42</strong><div><span>ROLL UNDER</span><b>65.00</b></div></div><div className="new-game-copy"><span>FREE-PLAY PREVIEW</span><h3>Dice</h3><p>Set your target and see the win probability and payout change together—simple, quick, and transparent.</p><button onClick={() => goToAuth('register')}>Explore Dice <ArrowRight/></button></div></article>
        <article><div className="new-game-visual limbo-board"><CircleDot/><small>TARGET</small><strong>5.00×</strong><div><span style={{width:'68%'}}/></div></div><div className="new-game-copy"><span>FREE-PLAY PREVIEW</span><h3>Limbo</h3><p>Choose a target multiplier. If the verified result reaches it, the round wins—no timing required.</p><button onClick={() => goToAuth('register')}>Explore Limbo <ArrowRight/></button></div></article>
      </div>
    </section>

    <section className="landing-trust" id="trust">
      <div className="landing-section-head"><div><span className="landing-label">TRUST CENTER</span><h2>The important details, when you need them.</h2></div><p>Open a topic for the full explanation. The essentials remain visible without turning the homepage into a manual.</p></div>
      <div className="trust-grid">
        <details><summary><ShieldCheck/><span><strong>Provably fair</strong><small>Verify every settled result</small></span><b>+</b></summary><p>The server seed is committed before play, then revealed after settlement. Combine it with your client seed and nonce to independently reproduce the outcome.</p></details>
        <details><summary><WalletCards/><span><strong>Withdrawals</strong><small>₹100 minimum · typically 12–24 hours</small></span><b>+</b></summary><p>Bonus funds use the wagering target shown in your wallet. Every withdrawal has visible status tracking and an escalation route through support.</p></details>
        <details><summary><CircleHelp/><span><strong>Support</strong><small>Telegram, live chat, and account tickets</small></span><b>+</b></summary><p>Get payment-reference help, withdrawal escalation, or account assistance through Telegram, live chat, and 24/7 in-account tickets.</p></details>
      </div>
    </section>

    <section className="landing-responsible"><div><Sparkles /><span><small>YOU’RE IN CONTROL</small><h2>Play should stay play.</h2></span></div><p>Set deposit, loss, and session limits. Take a cooling-off break or self-exclude at any time. Limits can be tightened immediately; increases apply only after a safety delay.</p><div><button type="button">Set limits after sign-in</button><a href="https://t.me/velowager_support" target="_blank" rel="noreferrer">Telegram support</a></div></section>

    <footer className="landing-footer"><div><strong>VeloWager Pro</strong><p>Operated by VeloWager Technologies Pvt. Ltd.<br/>Transparent games, clear rules, and player-first controls.</p></div><nav><a href="#games">Games</a><a href="#trust">Trust center</a><a href="https://t.me/velowager_support" target="_blank" rel="noreferrer">Telegram</a></nav><div className="landing-footer-warning"><b>18+</b><span>Play responsibly<br/>Terms · Privacy</span></div></footer>
  </div>;
}
