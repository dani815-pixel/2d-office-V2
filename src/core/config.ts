export const CONFIG = {
  W: 960,
  H: 540,
  COINS: ['BTC', 'ETH', 'BNB', 'XRP', 'SOL'] as const,
  WALK_SPEED: 110,
  STAGE_SCALE: 3,
  EFFECTIVE_MAX_REQ_DEFAULT: 10,
  SEAT_X: [298, 379, 460, 541, 622, 703] as const,
  SEAT_Y: 322,
  DOOR: { x: 30, y: 236 },
  TG_ENDPOINTS: [
    '/api/telegram/meeting-start',
    '/api/telegram/meeting-end',
    '/api/telegram/upload-video',
  ] as const,
} as const;

export type CoinSymbol = (typeof CONFIG.COINS)[number];
