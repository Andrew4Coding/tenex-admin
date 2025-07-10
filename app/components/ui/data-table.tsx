import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '~/lib/utils';
import { Input } from './input';

export type DataTableProps<T> = {
  data: T[];
  className?: string;
};

export function DataTable<T extends Record<string, any>>({ data, className }: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Infer columns from data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Search and filter logic
  const filteredData = useMemo(() => {
    let filtered = data;
    // Global search
    if (search) {
      filtered = filtered.filter(row =>
        columns.some(key => String(row[key] ?? '').toLowerCase().includes(search.toLowerCase()))
      );
    }
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
  }, [data, search, filters, sortKey, sortDir, columns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className={cn(className, 'flex flex-col overflow-auto w-full')}> {/* root is flex column, fills parent */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 flex-shrink-0">
        <Input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
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
    </div>
  );
}

export default DataTable; 