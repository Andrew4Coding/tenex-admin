import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Badge } from '~/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

interface UserPermissionDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CRUD_OPTIONS = ['create', 'read', 'update', 'delete'];

export function UserPermissionDialog({ user, open, onOpenChange }: UserPermissionDialogProps) {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getPermissionBadge = (permission: any) => {
    const permissions = [];
    if (permission.canCreate) permissions.push('Create');
    if (permission.canRead) permissions.push('Read');
    if (permission.canUpdate) permissions.push('Update');
    if (permission.canDelete) permissions.push('Delete');
    
    if (permissions.length === 0) {
      return <Badge variant="secondary">No Access</Badge>;
    }
    
    return <Badge variant="default">{permissions.join(', ')}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="space-y-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Email:</span>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">User ID:</span>
                <p className="mt-1 font-mono text-xs">{user.id}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Created:</span>
                <p className="mt-1">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Last Updated:</span>
                <p className="mt-1">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Permissions Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Model Permissions</h3>
            <div className="text-sm text-muted-foreground">
              {user.UserModelPermission.length} model{user.UserModelPermission.length !== 1 ? 's' : ''} configured
            </div>
            
            {user.UserModelPermission.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Model</TableHead>
                      <TableHead className="w-48">Permissions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.UserModelPermission.map((permission: any) => (
                      <TableRow key={permission.id}>
                        <TableCell className="text-sm">
                          {permission.model}
                        </TableCell>
                        <TableCell>
                          {getPermissionBadge(permission)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No permissions configured for this user.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 