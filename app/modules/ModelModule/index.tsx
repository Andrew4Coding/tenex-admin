import { useLoaderData, useParams, useNavigate, useSearchParams } from 'react-router';
import { useState, useCallback, useEffect } from 'react';
import DataTable from '~/components/ui/data-table';
import { AddItemDialog } from './AddItemDialog';
import { ModelLoader } from './loader';
import { useDebounce } from '~/hooks/use-debounce';

export const ModelModule = () => {
  const { modelFindMany, modelFields, pagination } = useLoaderData();
  const param = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  
  // Debounce the search value to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    navigate({ search: params.toString() });
  };

  const handleTakeChange = (e: React.ChangeEvent<HTMLSelectElement> | number) => {
    const params = new URLSearchParams(searchParams);
    const take = typeof e === 'number' ? e : Number(e.target.value);
    params.set('take', String(take));
    params.set('page', '1'); // reset to first page
    navigate({ search: params.toString() });
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  // Effect to update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
      params.set('page', '1');
    } else {
      params.delete('search');
      params.set('page', '1');
    }
    navigate({ search: params.toString() });
  }, [debouncedSearch, navigate, searchParams]);

  return (
    <div className="flex flex-col h-full">
      <div className='flex items-center justify-between'>
        <h1 className="text-2xl font-bold mb-4 flex-shrink-0">{param.model}</h1>
        <AddItemDialog
          modelName={param.model || ''}
          modelFields={modelFields}
        />
      </div>
      <DataTable
        data={modelFindMany}
        className="flex-1 max-h-[calc(100vh-6rem)]"
        modelName={param.model}
        modelFields={modelFields}
        pagination={pagination}
        onPageChange={handlePageChange}
        onTakeChange={n => handleTakeChange({ target: { value: String(n) } } as any)}
        search={search}
        onSearchChange={handleSearchChange}
      />
    </div>
  )
}
