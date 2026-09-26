const PREFIX = 'cao2.';

export const STORE = {
  key(name: string): string {
    return PREFIX + name;
  },

  get<T>(name: string, fallback: T | null = null): T | null {
    try {
      const value = localStorage.getItem(this.key(name));
      return value == null ? fallback : JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(name: string, value: T): void {
    try {
      localStorage.setItem(this.key(name), JSON.stringify(value));
    } catch {
      // Prototype behavior: storage failures are intentionally non-fatal.
    }
  },

  del(name: string): void {
    try {
      localStorage.removeItem(this.key(name));
    } catch {
      // Prototype behavior: storage failures are intentionally non-fatal.
    }
  },

  resetAll(): void {
    const keys = [
      'brief', 'aiSettings', 'ui', 'meeting', 'report', 'archive',
      'memoryTrader', 'memoryMeeting', 'balance', 'positions', 'reviews',
      'scenarios', 'requests', 'usage', 'tgSent', 'customDirectives',
    ];
    keys.forEach(key => this.del(key));
  },
} as const;
