import type { PaginatedResult } from './apiService';

interface CacheEntry<T> {
  data: PaginatedResult<T>;
  timestamp: number;
  search: string;
  pageSize: number;
}

interface PaginationCache<T> {
  [page: number]: CacheEntry<T>;
}

class PaginationService {
  private caches = new Map<string, PaginationCache<unknown>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(
    resource: string,
    search: string,
    pageSize: number
  ): string {
    return `${resource}-${search}-${pageSize}`;
  }

  private isValidCache<T>(
    entry: CacheEntry<T>,
    search: string,
    pageSize: number
  ): boolean {
    const isExpired = Date.now() - entry.timestamp > this.CACHE_TTL;
    const searchChanged = entry.search !== search;
    const pageSizeChanged = entry.pageSize !== pageSize;

    return !isExpired && !searchChanged && !pageSizeChanged;
  }

  private getCache<T>(
    resource: string,
    search: string,
    pageSize: number
  ): PaginationCache<T> {
    const cacheKey = this.getCacheKey(resource, search, pageSize);
    if (!this.caches.has(cacheKey)) {
      this.caches.set(cacheKey, {});
    }
    return this.caches.get(cacheKey)! as PaginationCache<T>;
  }

  private setCacheEntry<T>(
    resource: string,
    page: number,
    data: PaginatedResult<T>,
    search: string,
    pageSize: number
  ): void {
    const cache = this.getCache<T>(resource, search, pageSize);
    cache[page] = {
      data,
      timestamp: Date.now(),
      search,
      pageSize,
    };
  }

  getCachedPage<T>(
    resource: string,
    page: number,
    search: string,
    pageSize: number
  ): PaginatedResult<T> | null {
    const cache = this.getCache<T>(resource, search, pageSize);
    const entry = cache[page];

    if (entry && this.isValidCache(entry, search, pageSize)) {
      return entry.data;
    }

    return null;
  }

  setCachedPage<T>(
    resource: string,
    page: number,
    data: PaginatedResult<T>,
    search: string,
    pageSize: number
  ): void {
    this.setCacheEntry(resource, page, data, search, pageSize);
  }

  clearCache(resource?: string): void {
    if (resource) {
      const keysToDelete = Array.from(this.caches.keys()).filter(key =>
        key.startsWith(resource)
      );
      keysToDelete.forEach(key => this.caches.delete(key));
    } else {
      this.caches.clear();
    }
  }

  // Get pages that should be prefetched based on current page
  getPrefetchPages(currentPage: number, totalPages: number): number[] {
    const pagesToPrefetch: number[] = [];

    // Always prefetch next page if it exists
    if (currentPage < totalPages) {
      pagesToPrefetch.push(currentPage + 1);
    }

    // For first page, also prefetch page 2 if it exists
    if (currentPage === 1 && totalPages >= 2) {
      pagesToPrefetch.push(2);
    }

    return pagesToPrefetch.filter(page => page <= totalPages);
  }

  // Get all cached data for a resource (useful for components that need all data)
  getAllCachedData<T>(resource: string, search: string, pageSize: number): T[] {
    const cache = this.getCache<T>(resource, search, pageSize);
    const allData: T[] = [];

    // Get all valid cached pages and combine them
    Object.values(cache)
      .filter(entry => this.isValidCache(entry, search, pageSize))
      .sort((a, b) => a.data.page - b.data.page)
      .forEach(entry => {
        allData.push(...entry.data.data);
      });

    return allData;
  }
}

export const paginationService = new PaginationService();
