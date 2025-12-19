type Entry<T> = { value: T; expiresAt: number };

export class TTLCache {
  private store = new Map<string, Entry<any>>();
  get<T>(key: string): T | null {
    const e = this.store.get(key);
    if (!e) return null;
    if (Date.now() >= e.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return e.value as T;
  }
  set<T>(key: string, value: T, ttlMs: number) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
  async wrap(key: string, ttlMs: number, fn: () => Promise<any>): Promise<any> {
    const hit = this.get<any>(key);
    if (hit !== null) return hit;
    const v = await fn();
    this.set(key, v, ttlMs);
    return v;
  }
  clear(prefix?: string) {
    if (!prefix) {
      this.store.clear();
      return;
    }
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
  }
}

export const ttlCache = new TTLCache();
