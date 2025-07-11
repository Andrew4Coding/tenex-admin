import { Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
  useRevalidator,
  useSearchParams,
} from 'react-router';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import DataTable from '~/components/ui/data-table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useDebounce } from '~/hooks/use-debounce';
import { AddItemDialog } from './AddItemDialog';
import { EditItemDialog } from './EditItemDialog';

export const ModelModule = () => {
  const { modelFindMany, modelFields, pagination } = useLoaderData();
  const param = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  // State for delete confirmations
  const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const exportFetcher = useFetcher();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<'filtered' | 'all' | null>(null);

  // Debounce the search value to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    navigate({ search: params.toString() });
  };

  const handleTakeChange = (
    e: React.ChangeEvent<HTMLSelectElement> | number
  ) => {
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

  // Handle single delete
  const handleSingleDelete = (id: string) => {
    setItemToDelete(id);
    setShowSingleDeleteDialog(true);
  };

  // Handle bulk delete
  const handleBulkDelete = (ids: string[]) => {
    setItemsToDelete(ids);
    setShowBulkDeleteDialog(true);
  };

  // Confirm single delete
  const confirmSingleDelete = () => {
    if (!itemToDelete) return;

    const formData = new FormData();
    formData.append('intent', 'delete-single');
    formData.append('model', param.model || '');
    formData.append('id', itemToDelete);

    fetcher.submit(formData, { method: 'post' });
    setShowSingleDeleteDialog(false);
    setItemToDelete(null);
  };

  // Confirm bulk delete
  const confirmBulkDelete = () => {
    if (!itemsToDelete.length) return;

    const formData = new FormData();
    formData.append('intent', 'delete-bulk');
    formData.append('model', param.model || '');
    itemsToDelete.forEach((id) => {
      formData.append('ids', id);
    });

    fetcher.submit(formData, { method: 'post' });
    setShowBulkDeleteDialog(false);
    setItemsToDelete([]);
  };

  // Handle fetcher responses
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        const message = fetcher.data.deletedCount
          ? `Successfully deleted ${fetcher.data.deletedCount} items!`
          : 'Item deleted successfully!';
        toast.success(message);
        revalidator.revalidate();
      } else {
        toast.error(fetcher.data.error || 'An error occurred while deleting.');
      }
    }
  }, [fetcher.data]);

  // CSV export utility
  function exportToCSV(data: any[], filename: string) {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csvRows = [
      keys.join(','),
      ...data.map((row) =>
        keys.map((k) => JSON.stringify(row[k] ?? '')).join(',')
      ),
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${data.length} rows to ${filename}`);
    setExportLoading(false);
  }

  // Export handler
  const handleExportCSV = () => {
    setShowExportDialog(true);
  };

  // Actually perform the export after user chooses
  const doExport = (type: 'filtered' | 'all') => {
    setExportType(type);
    setExportLoading(true);
    setShowExportDialog(false);

    if (type === 'filtered') {
      exportToCSV(modelFindMany, `${param.model}-filtered-export.csv`);
      return;
    }

    const formData = new FormData();
    formData.append('intent', 'export-csv');
    formData.append('model', param.model || '');
    if (search) formData.append('search', search);
    exportFetcher.submit(formData, { method: 'post' });
  };

  useEffect(() => {
    if (exportFetcher.data && exportLoading) {
      setExportLoading(false);
      setExportType(null);
      if (
        exportFetcher.data.success &&
        Array.isArray(exportFetcher.data.rows)
      ) {
        exportToCSV(exportFetcher.data.rows, `${param.model}-export.csv`);
      } else {
        toast.error(exportFetcher.data.error || 'Failed to export data');
      }
    }
  }, [exportFetcher.data]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4 flex-shrink-0">{param.model}</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={exportLoading}>
                <Upload />
                {exportLoading ? 'Exporting...' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleExportCSV}
                disabled={exportLoading}
              >
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Export to XLSX (Coming Soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AddItemDialog
            modelName={param.model || ''}
            modelFields={modelFields}
          />
        </div>
        {/* Export confirmation dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Do you want to export the current filtered data or the whole
                data?
              </p>
              <div className="flex gap-2 justify-end">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={() => doExport('filtered')}
                  disabled={exportLoading}
                >
                  Export Filtered
                </Button>
                <Button
                  onClick={() => doExport('all')}
                  disabled={exportLoading}
                  variant="secondary"
                >
                  Export All
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        data={modelFindMany}
        className="flex-1 max-h-[calc(100vh-6rem)]"
        modelName={param.model}
        modelFields={modelFields}
        pagination={pagination}
        onPageChange={handlePageChange}
        onTakeChange={(n) =>
          handleTakeChange({ target: { value: String(n) } } as any)
        }
        search={search}
        onSearchChange={handleSearchChange}
        onSingleDelete={handleSingleDelete}
        onBulkDelete={handleBulkDelete}
        onSelectionReset={() => {
          // This will be called when selection is reset after deletion
        }}
        renderRowActions={(row) => (
          <div className="flex gap-1">
            <EditItemDialog
              modelFields={modelFields}
              modelName={param.model || ''}
              item={row}
              onSuccess={() => revalidator.revalidate()}
            />
            {/* The delete button is handled by onSingleDelete */}
          </div>
        )}
      />

      {/* Single Delete Confirmation Dialog */}
      <Dialog
        open={showSingleDeleteDialog}
        onOpenChange={setShowSingleDeleteDialog}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the{' '}
              <span className="font-semibold">{param.model}</span> item with ID{' '}
              <span className="font-mono bg-muted px-1 rounded">
                {itemToDelete}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSingleDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmSingleDelete}
              disabled={fetcher.state === 'submitting'}
            >
              {fetcher.state === 'submitting' ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-semibold">{itemsToDelete.length}</span>{' '}
              selected <span className="font-semibold">{param.model}</span>{' '}
              {itemsToDelete.length === 1 ? 'item' : 'items'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={fetcher.state === 'submitting'}
            >
              {fetcher.state === 'submitting'
                ? 'Deleting...'
                : `Delete ${itemsToDelete.length} ${itemsToDelete.length === 1 ? 'item' : 'items'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
