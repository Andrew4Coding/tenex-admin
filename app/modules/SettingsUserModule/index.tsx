import { useEffect, useState } from 'react';
import { useFetcher, useLoaderData, useRevalidator } from 'react-router';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import DataTable from '~/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { AddUserDialog } from './components/AddUserDialog';
import { EditUserDialog } from './components/EditUserDialog';
import { UserPermissionDialog } from './components/UserPermissionDialog';

export const SettingsUserModule = () => {
  const { allowedUsers } = useLoaderData();
  const revalidator = useRevalidator();
  const fetcher = useFetcher();

  // State for delete confirmations
  const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);

  // State for permission dialog
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Transform the data for the DataTable
  const tableData = allowedUsers.map((user: any) => ({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    permissions: user.UserModelPermission.length,
    // Add a computed field for permissions summary
    permissionsSummary: user.UserModelPermission
      .map((perm: any) => `${perm.model}: ${['create', 'read', 'update', 'delete'].filter(op => perm[`can${op.charAt(0).toUpperCase() + op.slice(1)}`]).join(',')}`)
      .join('; ')
  }));

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
          ? `Successfully deleted ${fetcher.data.deletedCount} users!`
          : 'User deleted successfully!';
        toast.success(message);
        revalidator.revalidate();
      } else {
        toast.error(fetcher.data.error || 'An error occurred while deleting.');
      }
    }
  }, [fetcher.data]);

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <div className="flex justify-end mb-2">
        <AddUserDialog onSuccess={() => revalidator.revalidate()} />
      </div>
      <div className="w-full min-w-0 overflow-hidden">
        <DataTable 
          data={tableData} 
          className="w-full"
          onSingleDelete={handleSingleDelete}
          onBulkDelete={handleBulkDelete}
          onSelectionReset={() => {
            // This will be called when selection is reset after deletion
          }}
          renderRowActions={(row) => (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const user = allowedUsers.find((u: any) => u.id === row.id);
                  if (user) {
                    setSelectedUser(user);
                    setShowPermissionDialog(true);
                  }
                }}
              >
                View
              </Button>
              <EditUserDialog
                user={allowedUsers.find((u: any) => u.id === row.id)}
                onSuccess={() => revalidator.revalidate()}
              />
              {/* The delete button is handled by onSingleDelete */}
            </div>
          )}
        />
      </div>

      {/* User Permission Dialog */}
      <UserPermissionDialog
        user={selectedUser}
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
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
              This action cannot be undone. This will permanently delete the allowed user with ID{' '}
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
              selected allowed user{itemsToDelete.length === 1 ? '' : 's'}.
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
                : `Delete ${itemsToDelete.length} user${itemsToDelete.length === 1 ? '' : 's'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
