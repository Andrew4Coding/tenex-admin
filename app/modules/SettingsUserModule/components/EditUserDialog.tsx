import { Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFetcher, useOutletContext } from 'react-router';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

const CRUD_OPTIONS = ['create', 'read', 'update', 'delete'];

interface EditUserDialogProps {
  user: any;
  onSuccess?: () => void;
}

export function EditUserDialog({ user, onSuccess }: EditUserDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState(user.email);
    const { models = [] } = useOutletContext<{ models: string[] }>();
    const fetcher = useFetcher();

    const [permissions, setPermissions] = useState(() => {
        const initial: Record<string, Record<string, boolean>> = {};
        models.forEach(model => {
            initial[model] = {};
            CRUD_OPTIONS.forEach(opt => {
                initial[model][opt] = false;
            });
        });
        
        // Populate with existing permissions
        user.UserModelPermission.forEach((perm: any) => {
            if (initial[perm.model]) {
                initial[perm.model] = {
                    create: perm.canCreate,
                    read: perm.canRead,
                    update: perm.canUpdate,
                    delete: perm.canDelete,
                };
            }
        });
        
        return initial;
    });

    // Reset form when dialog opens/closes or user changes
    useEffect(() => {
        if (open) {
            setEmail(user.email);
            setPermissions(() => {
                const initial: Record<string, Record<string, boolean>> = {};
                models.forEach(model => {
                    initial[model] = {};
                    CRUD_OPTIONS.forEach(opt => {
                        initial[model][opt] = false;
                    });
                });
                
                // Populate with existing permissions
                user.UserModelPermission.forEach((perm: any) => {
                    if (initial[perm.model]) {
                        initial[perm.model] = {
                            create: perm.canCreate,
                            read: perm.canRead,
                            update: perm.canUpdate,
                            delete: perm.canDelete,
                        };
                    }
                });
                
                return initial;
            });
        }
    }, [open, user, models]);

    // Handle fetcher state changes
    useEffect(() => {
        if (fetcher.data) {
            if (fetcher.data.success) {
                // Success - close dialog
                setOpen(false);
                // Call onSuccess callback
                onSuccess?.();
                // Show success toast
                toast.success(fetcher.data.message || 'User updated successfully!');
            } else {
                // Error - show error message
                toast.error(fetcher.data.error || 'An error occurred while updating the user.');
            }
        }
    }, [fetcher.data]);

    const handleCheckbox = (model: string, perm: string) => {
        setPermissions(prev => ({
            ...prev,
            [model]: {
                ...prev[model],
                [perm]: !prev[model][perm],
            },
        }));
    };

    const handleRowCheckbox = (model: string) => {
        const isRowChecked = CRUD_OPTIONS.every(opt => permissions[model][opt]);
        const newValue = !isRowChecked;

        setPermissions(prev => ({
            ...prev,
            [model]: Object.fromEntries(
                CRUD_OPTIONS.map(opt => [opt, newValue])
            ),
        }));
    };

    const handleColumnCheckbox = (perm: string) => {
        const isColumnChecked = models.every(model => permissions[model][perm]);
        const newValue = !isColumnChecked;

        setPermissions(prev => {
            const updated = { ...prev };
            models.forEach(model => {
                updated[model] = { ...updated[model], [perm]: newValue };
            });
            return updated;
        });
    };

    const handleAdministratorCheckbox = () => {
        const isAllChecked = models.every(model =>
            CRUD_OPTIONS.every(opt => permissions[model][opt])
        );
        const newValue = !isAllChecked;

        setPermissions(prev => {
            const updated = { ...prev };
            models.forEach(model => {
                updated[model] = Object.fromEntries(
                    CRUD_OPTIONS.map(opt => [opt, newValue])
                );
            });
            return updated;
        });
    };

    const isRowChecked = (model: string) => {
        return CRUD_OPTIONS.every(opt => permissions[model][opt]);
    };

    const isColumnChecked = (perm: string) => {
        return models.every(model => permissions[model][perm]);
    };

    const isAdministratorChecked = () => {
        return models.every(model =>
            CRUD_OPTIONS.every(opt => permissions[model][opt])
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Submit the form data using fetcher
        const formData = new FormData();
        formData.append('intent', 'update');
        formData.append('id', user.id);
        formData.append('email', email);
        formData.append('permissions', JSON.stringify(permissions));
        
        fetcher.submit(formData, {
            method: 'post',
            action: '/settings/users'
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className='min-w-[70%] max-w-[90vw]'>
                <DialogHeader>
                    <DialogTitle>Edit Allowed User</DialogTitle>
                </DialogHeader>
                <fetcher.Form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="user@example.com"
                            disabled={fetcher.state === 'submitting'}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Model Permissions</label>
                        <div className='flex gap-2 items-center mb-2'>
                            <Checkbox
                                checked={isAdministratorChecked()}
                                onCheckedChange={handleAdministratorCheckbox}
                                aria-label="Select all"
                                disabled={fetcher.state === 'submitting'}
                            />
                            <Label>
                                Full Access
                            </Label>
                        </div>
                        <div className="overflow-auto max-h-72 border rounded">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead className="w-12">Model</TableHead>
                                        {CRUD_OPTIONS.map(opt => (
                                            <TableHead key={opt} className="w-12 text-center capitalize">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Checkbox
                                                        checked={isColumnChecked(opt)}
                                                        onCheckedChange={() => handleColumnCheckbox(opt)}
                                                        aria-label={`Select all ${opt}`}
                                                        disabled={fetcher.state === 'submitting'}
                                                    />
                                                    {opt}
                                                </div>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {models.map(model => (
                                        <TableRow key={model}>
                                            <TableCell className="w-12">
                                                <Checkbox
                                                    checked={isRowChecked(model)}
                                                    onCheckedChange={() => handleRowCheckbox(model)}
                                                    aria-label={`Select all ${model}`}
                                                    disabled={fetcher.state === 'submitting'}
                                                />
                                            </TableCell>
                                            <TableCell className="w-12">{model}</TableCell>
                                            {CRUD_OPTIONS.map(opt => (
                                                <TableCell key={opt} className="w-12 text-center">
                                                    <Checkbox
                                                        checked={permissions[model][opt]}
                                                        onCheckedChange={() => handleCheckbox(model, opt)}
                                                        aria-label={`${model} ${opt}`}
                                                        disabled={fetcher.state === 'submitting'}
                                                    />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="submit" 
                            disabled={fetcher.state === 'submitting'}
                        >
                            {fetcher.state === 'submitting' ? 'Updating...' : 'Update'}
                        </Button>
                    </DialogFooter>
                </fetcher.Form>
            </DialogContent>
        </Dialog>
    )
} 