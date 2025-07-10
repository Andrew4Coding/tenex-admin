import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon, ChevronsUpDownIcon, CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '~/components/ui/command';
import { generateSchema } from '~/lib/gen-schema';
import type { prismaModelField } from '~/types';
import { cn } from '~/lib/utils';

export function AddItemDialog({ modelFields, modelName, onSuccess }: {
  modelFields: prismaModelField[];
  modelName: string;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<z.ZodObject<any>>();

  // Generate Zod schema from modelFields
  useState(() => {
    generateSchema(modelFields).then(setSchema);
  });

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: modelFields.reduce((acc, field) => {
      if (field.name === 'id') {
        acc[field.name] = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() :
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
      } else {
        acc[field.name] = field.isList ? [] : '';
      }
      return acc;
    }, {} as Record<string, any>),
    mode: 'onChange',
  });

  const onSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/models/${modelName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to add item');
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {modelName}</DialogTitle>
        </DialogHeader>
        {schema ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className='max-h-[70vh] overflow-auto grid grid-cols-2 gap-4'>
                {modelFields.map((field) => (
                  <FormField
                    key={field.name}
                    name={field.name}
                    control={form.control}
                    render={({ field: f }) => {
                      // Local state for badge input
                      const [inputValue, setInputValue] = useState('');
                      return (
                        <FormItem>
                          <FormLabel>{field.name}</FormLabel>
                          <FormControl>
                            {field.isList && field.type === 'String' ? (
                              <div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {(Array.isArray(f.value) ? f.value : []).map((item: string, idx: number) => (
                                    <Badge key={item + idx} variant="secondary" className="flex items-center gap-1">
                                      {item}
                                      <button
                                        type="button"
                                        className="ml-1 focus:outline-none"
                                        onClick={() => {
                                          const newArr = (Array.isArray(f.value) ? f.value : []).filter((_: string, i: number) => i !== idx);
                                          f.onChange(newArr);
                                        }}
                                      >
                                        <XIcon className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                                <Input
                                  value={inputValue}
                                  onChange={e => setInputValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                      e.preventDefault();
                                      const val = (inputValue || '').trim();
                                      if (val && (!(Array.isArray(f.value)) || !(f.value as string[]).includes(val))) {
                                        f.onChange([...(Array.isArray(f.value) ? f.value : []), val]);
                                      }
                                      setInputValue('');
                                    }
                                  }}
                                  placeholder="Type and press Enter or comma to add"
                                  disabled={loading}
                                />
                              </div>
                            ) : field.kind === 'enum' && field.options ? (
                              (() => {
                                const options = field.options;
                                const selected = String(f.value ?? '');
                                const [open, setOpen] = useState(false);
                                return (
                                  <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                        type="button"
                                        tabIndex={0}
                                      >
                                        {selected
                                          ? options.find((option: string) => option === selected)
                                          : `Select Value`}
                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Search value..." />
                                        <CommandList>
                                          <CommandEmpty>No value found.</CommandEmpty>
                                          <CommandGroup>
                                            {options.map((option: string) => (
                                              <CommandItem
                                                key={option}
                                                value={option}
                                                onSelect={() => {
                                                  f.onChange(option);
                                                  setOpen(false);
                                                }}
                                              >
                                                <CheckIcon
                                                  className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selected === option ? "opacity-100" : "opacity-0"
                                                  )}
                                                />
                                                {option}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                );
                              })()
                            ) : field.kind === 'scalar' && Array.isArray(field.options) && field.options.length > 0 ? (
                              (() => {
                                const options = field.options;
                                const selected = String(f.value ?? '');
                                const [open, setOpen] = useState(false);
                                return (
                                  <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                        type="button"
                                        tabIndex={0}
                                      >
                                        {selected
                                          ? options.find((option: string) => option === selected)
                                          : `Select ID`}
                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Search id..." />
                                        <CommandList>
                                          <CommandEmpty>No id found.</CommandEmpty>
                                          <CommandGroup>
                                            {options.map((option: string) => (
                                              <CommandItem
                                                key={option}
                                                value={option}
                                                onSelect={() => {
                                                  f.onChange(option);
                                                  setOpen(false);
                                                }}
                                              >
                                                <CheckIcon
                                                  className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selected === option ? "opacity-100" : "opacity-0"
                                                  )}
                                                />
                                                {option}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                );
                              })()
                            ) : field.type === 'Boolean' ? (
                              <Select
                                value={f.value === '' ? '' : String(f.value)}
                                onValueChange={val => f.onChange(val === 'true')}
                                disabled={loading}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={`Select Value`} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">True</SelectItem>
                                  <SelectItem value="false">False</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : field.type === 'DateTime' ? (
                              <Input
                                {...f}
                                type="datetime-local"
                                value={String(f.value ?? '')}
                                onChange={e => f.onChange(e.target.value)}
                                disabled={loading}
                              />
                            ) : ["Int", "Float", "BigInt", "Decimal"].includes(field.type) ? (
                              <Input
                                {...f}
                                type="number"
                                value={String(f.value ?? '')}
                                onChange={e => f.onChange(e.target.value)}
                                disabled={loading}
                              />
                            ) : (
                              <Input {...f} value={String(f.value ?? '')} disabled={loading} />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              {error && <div className="text-destructive text-sm">{error}</div>}
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add'}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div>Loading schema...</div>
        )}
      </DialogContent>
    </Dialog>
  );
} 