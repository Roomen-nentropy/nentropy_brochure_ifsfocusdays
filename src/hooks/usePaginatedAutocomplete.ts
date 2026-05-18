import { useState, useEffect, useCallback, useRef } from 'react';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsePaginatedAutocompleteOptions<T> {
  fetchFunction: (params: {
    page: number;
    limit: number;
    search: string;
    additionalParams?: Record<string, unknown>;
  }) => Promise<PaginatedResponse<T>>;
  pageSize?: number;
  additionalParams?: Record<string, unknown>; // Extra params like productIds, supplierId, etc.
  debounceMs?: number;
}

export interface UsePaginatedAutocompleteResult<T> {
  options: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  onScrollToBottom: () => void;
  reset: () => void;
}

export function usePaginatedAutocomplete<T>({
  fetchFunction,
  pageSize = 25,
  additionalParams,
  debounceMs = 300,
}: UsePaginatedAutocompleteOptions<T>): UsePaginatedAutocompleteResult<T> {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isFetchingRef = useRef(false);
  const prefetchingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef('');

  const fetchData = useCallback(
    async (page: number, search: string, append: boolean = false) => {
      if (isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;
        if (!append) setLoading(true);
        setError(null);

        const result = await fetchFunction({
          page,
          limit: pageSize,
          search,
          additionalParams,
        });

        if (append) {
          setOptions(prev => [...prev, ...result.data]);
        } else {
          setOptions(result.data);
        }

        setTotalPages(result.totalPages);
        setHasMore(result.page < result.totalPages);
        setCurrentPage(result.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [fetchFunction, pageSize, additionalParams]
  );

  const prefetchNextPage = useCallback(async () => {
    if (
      prefetchingRef.current ||
      currentPage >= totalPages ||
      !hasMore ||
      isFetchingRef.current
    ) {
      return;
    }

    try {
      prefetchingRef.current = true;
      const nextPage = currentPage + 1;

      const result = await fetchFunction({
        page: nextPage,
        limit: pageSize,
        search: lastSearchRef.current,
        additionalParams,
      });

      setOptions(prev => [...prev, ...result.data]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < result.totalPages);
    } catch (err) {
      console.error('Prefetch error:', err);
    } finally {
      prefetchingRef.current = false;
    }
  }, [
    currentPage,
    totalPages,
    hasMore,
    fetchFunction,
    pageSize,
    additionalParams,
  ]);

  // Handle search input changes with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (inputValue !== lastSearchRef.current) {
        lastSearchRef.current = inputValue;
        setCurrentPage(1);
        fetchData(1, inputValue, false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, fetchData, debounceMs]);

  // Reset when additional params change
  useEffect(() => {
    setCurrentPage(1);
    setOptions([]);
    lastSearchRef.current = inputValue;
    fetchData(1, inputValue, false);
  }, [JSON.stringify(additionalParams)]); // eslint-disable-line react-hooks/exhaustive-deps

  const onScrollToBottom = useCallback(() => {
    if (hasMore && !loading && !isFetchingRef.current) {
      prefetchNextPage();
    }
  }, [hasMore, loading, prefetchNextPage]);

  const reset = useCallback(() => {
    setOptions([]);
    setCurrentPage(1);
    setInputValue('');
    lastSearchRef.current = '';
    setError(null);
    fetchData(1, '', false);
  }, [fetchData]);

  return {
    options,
    loading,
    error,
    hasMore,
    inputValue,
    setInputValue,
    onScrollToBottom,
    reset,
  };
}
