import { useState } from 'react';
import { useLoaderData } from 'react-router';
import DataTable from '~/components/ui/data-table';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Checkbox } from '~/components/ui/checkbox';

// TODO: Wire models prop from loader or parent
const CRUD_OPTIONS = ['create', 'read', 'update', 'delete'];
const MOCK_MODELS = ['User', 'Post', 'Comment']; // Replace with real models prop

export const SettingsUserModule = ({ models = MOCK_MODELS }) => {
  const { allowedUsers } = useLoaderData();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    models.forEach(model => {
      initial[model] = {};
      CRUD_OPTIONS.forEach(opt => {
        initial[model][opt] = false;
      });
    });
    return initial;
  });

  const handleCheckbox = (model: string, perm: string) => {
    setPermissions(prev => ({
      ...prev,
      [model]: {
        ...prev[model],
        [perm]: !prev[model][perm],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit email and permissions to backend
    setOpen(false);
    setEmail('');
    // Reset permissions
    setPermissions(() => {
      const initial: Record<string, Record<string, boolean>> = {};
      models.forEach(model => {
        initial[model] = {};
        CRUD_OPTIONS.forEach(opt => {
          initial[model][opt] = false;
        });
      });
      return initial;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Allowed User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Permissions</label>
                <div className="overflow-auto max-h-72 border rounded">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="p-2 text-left">Model</th>
                        {CRUD_OPTIONS.map(opt => (
                          <th key={opt} className="p-2 capitalize">{opt}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {models.map(model => (
                        <tr key={model}>
                          <td className="p-2 font-mono">{model}</td>
                          {CRUD_OPTIONS.map(opt => (
                            <td key={opt} className="p-2 text-center">
                              <Checkbox
                                checked={permissions[model][opt]}
                                onCheckedChange={() => handleCheckbox(model, opt)}
                                aria-label={`${model} ${opt}`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable data={[]} modelName="user" />
    </div>
  );
};
