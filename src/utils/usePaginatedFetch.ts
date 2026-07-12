import {useCallback, useEffect, useRef, useState} from 'react';

type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
};

type Fetcher<T> = (params: {
  page: number;
  pageSize: number;
  query?: string;
}) => Promise<PaginatedResponse<T>>;

type UsePaginatedFetchOptions = {
  pageSize?: number;
  initialPage?: number;
  debounceMs?: number;
};

type UsePaginatedFetchResult<T> = {
  data: T[];
  loading: boolean;
  error: string | null;
  isLoadMore: boolean;
  hasMore: boolean;
  searchText: string;
  setSearchText: (text: string) => void;
  loadMore: () => void;
  refresh: () => void;
};

/**
 * Reusable paginated data hook with search + load-more.
 * Eliminates duplicated pagination logic across 4 screens.
 */
export function usePaginatedFetch<T>(
  fetcher: Fetcher<T>,
  options: UsePaginatedFetchOptions = {},
): UsePaginatedFetchResult<T> {
  const {pageSize = 20, initialPage = 1, debounceMs = 500} = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadMore, setLoadMore] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [searchText, setSearchTextRaw] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track pending query to avoid race conditions
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    async (pageNum: number, query?: string, append = false) => {
      const fetchId = ++fetchIdRef.current;

      try {
        const response = await fetcher({
          page: pageNum,
          pageSize,
          query: query?.trim() || undefined,
        });

        // Ignore stale responses
        if (fetchId !== fetchIdRef.current) return;

        if (append) {
          setData(prev => [...prev, ...response.data]);
        } else {
          setData(response.data);
        }

        const loadedCount = pageNum * pageSize;
        setHasMore(loadedCount < response.totalCount);
        setError(null);
      } catch (apiError) {
        if (fetchId !== fetchIdRef.current) return;

        setError(
          apiError instanceof Error ? apiError.message : 'Could not load data.',
        );
      }
    },
    [fetcher, pageSize],
  );

  // Initial load + reload when fetcher/pageSize changes
  useEffect(() => {
    setLoading(true);
    setPage(initialPage);
    fetchData(initialPage).finally(() => setLoading(false));
  }, [fetcher, pageSize]);

  // Set search text with debounce
  const setSearchText = useCallback(
    (text: string) => {
      setSearchTextRaw(text);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setLoading(true);
        setPage(initialPage);
        setData([]);
        fetchData(initialPage, text).finally(() => setLoading(false));
      }, debounceMs);
    },
    [fetchData, initialPage, debounceMs],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Load more
  const loadMore = useCallback(() => {
    if (isLoadMore || !hasMore || loading) return;

    const nextPage = page + 1;
    setLoadMore(true);
    setPage(nextPage);
    fetchData(nextPage, searchText, true).finally(() => setLoadMore(false));
  }, [page, isLoadMore, hasMore, loading, searchText, fetchData]);

  // Refresh from page 1
  const refresh = useCallback(() => {
    setLoading(true);
    setPage(initialPage);
    setData([]);
    fetchData(initialPage, searchText).finally(() => setLoading(false));
  }, [fetchData, initialPage, searchText]);

  return {
    data,
    loading,
    error,
    isLoadMore,
    hasMore,
    searchText,
    setSearchText,
    loadMore,
    refresh,
  };
}

export default usePaginatedFetch;
