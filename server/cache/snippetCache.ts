import { Snippet } from '../../src/types';

type CacheEntry = { snippets: Snippet[]; cachedAt: number };

export class SnippetCache {
  private entry: CacheEntry | null = null;
  private readonly ttlMs: number;

  constructor(ttlMs = 10 * 60_000) {
    this.ttlMs = ttlMs;
  }

  get(): Snippet[] | null {
    if (!this.entry) return null;
    if (Date.now() > this.entry.cachedAt + this.ttlMs) {
      this.entry = null;
      return null;
    }
    return this.entry.snippets;
  }

  set(snippets: Snippet[]): void {
    this.entry = { snippets, cachedAt: Date.now() };
  }

  invalidate(): void {
    this.entry = null;
  }

  get count(): number {
    return this.get()?.length ?? 0;
  }
}
