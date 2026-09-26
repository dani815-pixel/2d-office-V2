export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const uuid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const today = () => new Date().toISOString().slice(0, 10);

export function fmtPrice(p: number | null | undefined): string {
  if (p == null || Number.isNaN(p)) return '—';
  const d = p >= 1000 ? 2 : p >= 10 ? 2 : 4;
  return p.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtChg(c: number | null | undefined): string {
  if (c == null || Number.isNaN(c)) return '—';
  return (c >= 0 ? '+' : '') + c.toFixed(2) + '%';
}

export function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"]/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }[m]!));
}

export function query<T extends Element = Element>(selector: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(selector);
}

export function queryAll<T extends Element = Element>(selector: string, root: ParentNode = document): T[] {
  return [...root.querySelectorAll<T>(selector)];
}

export function toast(msg: string, type = 'info', ms = 3600): void {
  const root = query<HTMLElement>('#toast-root');
  if (!root) return;
  const t = document.createElement('div');
  t.className = 'toast ' + (type === 'info' ? '' : type);
  t.textContent = msg;
  root.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = '.4s';
    setTimeout(() => t.remove(), 420);
  }, ms);
}

export function icons(): void {
  const lucide = (window as Window & { lucide?: { createIcons?: () => void } }).lucide;
  lucide?.createIcons?.();
}
