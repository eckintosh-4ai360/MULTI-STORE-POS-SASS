import { useState, useMemo } from "react";

export function usePagination<T>(items: T[], pageSize = 20) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePageSize = Math.max(1, pageSize);

  const currentItems = useMemo(
    () => items.slice((page - 1) * safePageSize, page * safePageSize),
    [items, page, safePageSize]
  );

  // Reset to page 1 when items change dramatically
  const reset = () => setPage(1);

  return {
    currentItems,
    page,
    setPage,
    totalPages,
    reset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
