import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, Loader } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { cn } from '~/lib/utils';
import { Input } from './input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink
} from './pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export type DataTableProps<T> = {
  data: T[];
  className?: string;
  pagination?: {
    totalCount: number;
    page: number;
    take: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
  onTakeChange?: (take: number) => void;
  search?: string;
  onSearchChange?: (value: string) => void;

  isSearchDisabled?: boolean; // Optional prop to disable search
};

export function DataTable<T extends Record<string, any>>({ data, className, pagination, onPageChange, onTakeChange, search, onSearchChange, isSearchDisabled = false }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [showLoader, setShowLoader] = useState(false);
  const loaderTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPending) {
      if (loaderTimeout.current) clearTimeout(loaderTimeout.current);
      setShowLoader(true);
    } else if (showLoader) {
      loaderTimeout.current = setTimeout(() => {
        setShowLoader(false);
      }, 1000);
    }
    return () => {
      if (loaderTimeout.current) clearTimeout(loaderTimeout.current);
    };
  }, [isPending]);

  // Infer columns from data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Filter and sort logic (no search here, handled by server)
  const filteredData = useMemo(() => {
    let filtered = data;
    // Per-column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => String(row[key] ?? '').toLowerCase().includes(value.toLowerCase()));
      }
    });
    // Sorting
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue === bValue) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return sortDir === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return filtered;
  }, [data, filters, sortKey, sortDir, columns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Move pagination handlers inside
  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages && onPageChange) {
      startTransition(() => {
        onPageChange(page);
      });
    }
  };
  const handleTakeChange = (take: number) => {
    if (onTakeChange) {
      startTransition(() => {
        onTakeChange(take);
      });
    }
  };

  return (
    <div className={cn(className, 'flex flex-col overflow-auto w-full relative')}> {/* root is flex column, fills parent */}

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 flex-shrink-0">
        {
          !isSearchDisabled &&
          <Input
            placeholder="Search..."
            value={search || ''}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            className="max-w-xs"
            disabled={showLoader}
          />
        }
        {showLoader && (
          <div className=" top-0 z-20 flex items-center gap-2 p-2 transition-opacity duration-1000">
            <Loader className="animate-spin w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-auto rounded border border-border"> {/* scrollable area */}
        <table className="min-w-full divide-y divide-border h-full">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              {columns.map(key => (
                <th
                  key={key}
                  className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none bg-muted"
                  onClick={() => handleSort(key)}
                  style={{ position: 'sticky', top: 0, background: 'inherit' }}
                >
                  <div className="flex items-center gap-1">
                    {key}
                    {sortKey === key && (
                      sortDir === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No data found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-accent/30">
                  {columns.map(key => (
                    <td key={key} className="px-4 py-2 whitespace-nowrap text-sm">
                      {String(row[key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination className="mt-4 mb-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                isActive={false}
                onClick={e => { e.preventDefault(); if (pagination.hasPrevPage) handlePageChange(pagination.page - 1); }}
                aria-disabled={!pagination.hasPrevPage}
                tabIndex={!pagination.hasPrevPage ? -1 : 0}
                href="#"
                style={{ cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed', opacity: pagination.hasPrevPage ? 1 : 0.5 }}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </PaginationLink>
            </PaginationItem>
            {/* Page numbers with ellipsis */}
            {(() => {
              const pages = [];
              const { page, totalPages } = pagination;
              const maxPages = 7; // show up to 7 page buttons
              if (totalPages <= maxPages) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i}
                        onClick={e => { e.preventDefault(); handlePageChange(i); }}
                        href="#"
                        style={{ cursor: 'pointer' }}
                      >
                        {i}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
              } else {
                // Always show first, last, current, and neighbors
                const showLeftEllipsis = page > 4;
                const showRightEllipsis = page < totalPages - 3;
                const pageNumbers = [];
                pageNumbers.push(1);
                if (showLeftEllipsis) {
                  pageNumbers.push('left-ellipsis');
                }
                for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                  if (i !== 1 && i !== totalPages) pageNumbers.push(i);
                }
                if (showRightEllipsis) {
                  pageNumbers.push('right-ellipsis');
                }
                pageNumbers.push(totalPages);
                pageNumbers.forEach((p, idx) => {
                  if (p === 'left-ellipsis' || p === 'right-ellipsis') {
                    pages.push(
                      <PaginationItem key={p + idx}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  } else {
                    pages.push(
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={page === p}
                          onClick={e => { e.preventDefault(); handlePageChange(Number(p)); }}
                          href="#"
                          style={{ cursor: 'pointer' }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                });
              }
              return pages;
            })()}
            <PaginationItem>
              <PaginationLink
                isActive={false}
                onClick={e => { e.preventDefault(); if (pagination.hasNextPage) handlePageChange(pagination.page + 1); }}
                aria-disabled={!pagination.hasNextPage}
                tabIndex={!pagination.hasNextPage ? -1 : 0}
                href="#"
                style={{ cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed', opacity: pagination.hasNextPage ? 1 : 0.5 }}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <Select value={String(pagination.take)} onValueChange={val => handleTakeChange(Number(val))}>
                <SelectTrigger className="ml-4 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default DataTable; 