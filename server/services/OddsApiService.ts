const API_HOST = 'https://api.the-odds-api.com/v4';

type CacheEntry = { expiresAt: number; value: any; quota: Record<string, string | null> };

export class OddsApiService {
  private cache = new Map<string, CacheEntry>();

  get configured() { return Boolean(process.env.THE_ODDS_API_KEY?.trim()); }
  get region() { return process.env.THE_ODDS_API_REGION?.trim() || 'eu'; }

  private async request(path: string, params: Record<string, string>, ttlMs: number, bypassCache = false) {
    const apiKey = process.env.THE_ODDS_API_KEY?.trim();
    if (!apiKey) throw new Error('The Odds API is not configured. Add THE_ODDS_API_KEY to the server environment.');
    const cacheKey = `${path}?${new URLSearchParams(params)}`;
    const cached = this.cache.get(cacheKey);
    if (!bypassCache && cached && cached.expiresAt > Date.now()) return cached;

    const url = new URL(`${API_HOST}${path}`);
    url.searchParams.set('apiKey', apiKey);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Odds provider returned ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ''}`);
    }
    const entry = {
      value: await response.json(), expiresAt: Date.now() + ttlMs,
      quota: {
        remaining: response.headers.get('x-requests-remaining'),
        used: response.headers.get('x-requests-used'),
        last: response.headers.get('x-requests-last')
      }
    };
    this.cache.set(cacheKey, entry);
    return entry;
  }

  async getSports() {
    return this.request('/sports/', {}, 15 * 60 * 1000);
  }

  async getOdds(sport: string, eventIds?: string, forceRefresh = false) {
    const params: Record<string, string> = { regions: this.region, markets: 'h2h', oddsFormat: 'decimal', dateFormat: 'iso' };
    if (eventIds) params.eventIds = eventIds;
    return this.request(`/sports/${encodeURIComponent(sport)}/odds/`, params, 45 * 1000, forceRefresh);
  }

  async getScores(sport: string, eventIds?: string) {
    const params: Record<string, string> = { daysFrom: '3', dateFormat: 'iso' };
    if (eventIds) params.eventIds = eventIds;
    return this.request(`/sports/${encodeURIComponent(sport)}/scores/`, params, 30 * 1000);
  }
}

export const oddsApiService = new OddsApiService();
