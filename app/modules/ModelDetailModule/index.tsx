import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useFetcher, useLoaderData, useNavigate, useRevalidator } from 'react-router';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import type { ModelDetailLoader } from './loader';

export const ModelDetailModule = () => {
  const { item, modelName, modelFields, relatedModels } = useLoaderData<typeof ModelDetailLoader>();

  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const renderFieldValue = (key: string, value: any) => {
    // Find the field definition for this key
    const fieldDef = modelFields?.find(field => field.name === key);

    if (fieldDef?.type === 'DateTime' && value) {
      // Handle DateTime values
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        return (
          <Badge variant="secondary" title={value}>{formatted}</Badge>
        );
      }
    } else if (fieldDef?.type === 'Boolean' && typeof value === 'boolean') {
      // Handle Boolean values
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "True" : "False"}
        </Badge>
      );
    } else if (fieldDef?.type === 'Json' && value) {
      // Handle JSON values
      const jsonStr = typeof value === 'string' ? value : JSON.stringify(value);
      return (
        <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
          {jsonStr}
        </pre>
      );
    } else if (typeof value === 'string' && value.startsWith('https://')) {
      // Handle URL values
      return (
        <Link
          to={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-300 underline hover:text-blue-500 duration-300 transition-all underline-offset-2"
        >
          {value}
        </Link>
      );
    } else if (typeof value === 'object' && value !== null) {
      // Handle other objects
      return (
        <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    } else if (value instanceof Date) {
      // Fallback for actual Date objects
      const formatted = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')} ${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
      return (
        <Badge variant="secondary" title={value.toISOString()}>{formatted}</Badge>
      );
    } else {
      // Default string display
      return (
        <span className="text-sm">{String(value ?? '')}</span>
      );
    }
  };

  const handleEdit = () => {
    navigate(`/${modelName}/${item.id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    const formData = new FormData();
    formData.append('intent', 'delete');
    fetcher.submit(formData, { method: 'post' });
    setShowDeleteDialog(false);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success('Item deleted successfully!');
        navigate(`/${modelName}`);
      } else {
        toast.error(fetcher.data.error || 'An error occurred while deleting the item.');
      }
      revalidator.revalidate();
    }
  }, [fetcher.data, navigate, modelName, revalidator]);

  return (
    <div className="h-full max-h-[calc(100vh-6rem)] flex flex-col gap-8">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to={`/${modelName}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{modelName} Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            disabled={fetcher.state === 'submitting'}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={fetcher.state === 'submitting'}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 min-h-0 pr-2 overflow-auto">
        <div className="bg-card rounded-lg border p-6">
          <div className="grid gap-6">
            {Object.entries(item).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-muted-foreground capitalize">
                  {key}
                </Label>
                <div>
                  {renderFieldValue(key, value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Models Section - Fixed at bottom */}
        {relatedModels && relatedModels.length > 0 && (
          <div className="mt-6 bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Related Models</h2>
            <div className="flex flex-wrap gap-2">
              {relatedModels.map((relatedModel, index) => (
                <Link to={`/${relatedModel.name}/${relatedModel.id ? `${relatedModel.id}` : ''}`} key={index} className="no-underline">
                  <Badge
                    key={`${relatedModel.name}-${index}`}
                    variant="outline"
                    className="text-sm px-3 py-1 hover:bg-muted transition-colors duration-200"
                  >
                    {relatedModel.name}
                    {relatedModel.id && (
                      <span className="ml-1 text-muted-foreground">
                        ({relatedModel.id})
                      </span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the{' '}
              <span className="font-semibold">{modelName}</span> item with ID{' '}
              <span className="font-mono bg-muted px-1 rounded">{item.id}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={fetcher.state === 'submitting'}
            >
              {fetcher.state === 'submitting' ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
