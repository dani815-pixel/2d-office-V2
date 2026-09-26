export interface MarketCoin {
  price: number;
  chg: number;
  high: number;
  low: number;
  vol: number;
}

export interface MarketSnapshot {
  source: 'DEMO' | 'LIVE';
  ts: number;
  coins: Record<string, MarketCoin>;
  demoNote?: string;
}

interface MarketDeps {
  CONFIG: {
    COINS: readonly string[];
  };
  U: {
    toast: (msg: string, type?: string) => void;
  };
  getMeetingRunning: () => boolean;
  flashSignal: (sym: string, chg: number) => void;
}

const DEMO: Record<string, MarketCoin> = {
  BTC: { price: 83799.99, chg: -2.41, high: 86210.00, low: 82100.50, vol: 18452.3 },
  ETH: { price: 2661.52, chg: -3.10, high: 2762.11, low: 2588.40, vol: 112033.8 },
  BNB: { price: 588.42, chg: +1.24, high: 595.02, low: 575.31, vol: 39120.4 },
  XRP: { price: 1.4791, chg: -9.20, high: 1.6310, low: 1.4052, vol: 88402113 },
  SOL: { price: 113.00, chg: -4.02, high: 118.44, low: 109.85, vol: 1042201 },
};

export function createMarketService(deps: MarketDeps) {
  const snap: MarketSnapshot = {
    source: 'DEMO',
    ts: Date.now(),
    coins: JSON.parse(JSON.stringify(DEMO)),
  };

  let ws: WebSocket | null = null;
  let wsRetry = 0;
  let listeners: Array<(snapshot: MarketSnapshot) => void> = [];
  let liveOk = false;
  let signalTimer: number | undefined;
  const cool: Record<string, number> = {};

  const notify = () => {
    snap.ts = Date.now();
    listeners.forEach(fn => {
      try { fn(snap); } catch {}
    });
  };

  function connectWS() {
    try {
      const streams = deps.CONFIG.COINS
        .map(c => c.toLowerCase() + 'usdt@miniTicker')
        .join('/');
      ws = new WebSocket(
        'wss://stream.binance.com:9443/stream?streams=' + streams,
      );

      ws.onmessage = event => {
        try {
          const d = JSON.parse(event.data).data;
          if (!d?.s) return;
          const sym = d.s.replace('USDT', '');
          if (!deps.CONFIG.COINS.includes(sym)) return;

          const c = snap.coins[sym];
          const close = +d.c;
          const open = +d.o;
          c.price = close;
          c.chg = (close - open) / open * 100;
          c.high = +d.h;
          c.low = +d.l;
          c.vol = +d.v;

          if (!liveOk) {
            liveOk = true;
            snap.source = 'LIVE';
            deps.U.toast('Binance 실시간 스트림 연결됨 (LIVE)', 'ok');
          }
          notify();
        } catch {}
      };

      ws.onerror = ws.onclose = () => {
        if (liveOk) return;
        wsRetry++;
        if (wsRetry <= 2) {
          window.setTimeout(connectWS, 2500 * wsRetry);
        } else {
          snap.source = 'DEMO';
          snap.demoNote = 'WS unavailable';
          notify();
        }
      };
    } catch {
      snap.source = 'DEMO';
      notify();
    }
  }

  function tickSignals() {
    if (!deps.getMeetingRunning()) return;

    const now = Date.now();
    for (const sym of deps.CONFIG.COINS) {
      const c = snap.coins[sym];
      const cd = cool[sym] || 0;

      if (Math.abs(c.chg) >= 5.5 && now > cd) {
        cool[sym] = now + 90000;
        deps.flashSignal(sym, c.chg);
      }
    }
  }

  return {
    init() {
      connectWS();
      signalTimer = window.setInterval(tickSignals, 5000);
    },

    snapshot: () => snap,

    onTick(fn: (snapshot: MarketSnapshot) => void) {
      listeners.push(fn);
      return () => {
        listeners = listeners.filter(listener => listener !== fn);
      };
    },

    isLive: () => snap.source === 'LIVE',
    badge: () => snap.source === 'LIVE' ? 'LIVE · BINANCE' : 'DEMO DATA',

    destroy() {
      if (signalTimer !== undefined) window.clearInterval(signalTimer);
      ws?.close();
      listeners = [];
    },
  };
}
