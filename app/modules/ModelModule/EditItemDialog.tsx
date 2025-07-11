import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, ChevronsUpDownIcon, Pencil, XIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFetcher, useRevalidator } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/components/ui/command';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useDebounce } from '~/hooks/use-debounce';
import { generateSchema } from '~/lib/gen-schema';
import { cn } from '~/lib/utils';
import type { prismaModelField } from '~/types';

export function EditItemDialog({ modelFields, modelName, item, onSuccess }: {
  modelFields: prismaModelField[];
  modelName: string;
  item: Record<string, any>;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [schema, setSchema] = useState<z.ZodObject<any>>();
  const [foreignKeyOptions, setForeignKeyOptions] = useState<Record<string, string[]>>({});
  const [foreignKeySearch, setForeignKeySearch] = useState<Record<string, string>>({});
  const [foreignKeyLoading, setForeignKeyLoading] = useState<Record<string, boolean>>({});
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  // Remove createdAt and updatedAt
  const filteredFields = modelFields.filter(field => field.name !== 'createdAt' && field.name !== 'updatedAt');

  // Identify foreign key fields (scalar fields with more than 20 options)
  const foreignKeyFields = filteredFields.filter(field => 
    field.kind === 'scalar' && 
    Array.isArray(field.options) && 
    field.options.length > 20
  );

  // Debounced search for foreign key fields
  const debouncedSearch = useDebounce(foreignKeySearch, 300);

  // Fetch foreign key options
  const fetchForeignKeyOptions = useCallback(async (fieldName: string, search: string) => {
    try {
      setForeignKeyLoading(prev => ({ ...prev, [fieldName]: true }));
      const formData = new FormData();
      formData.append('modelField', fieldName);
      formData.append('modelName', modelName);
      formData.append('search', search);

      const response = await fetch('/api/options', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setForeignKeyOptions(prev => ({
          ...prev,
          [fieldName]: data.options || []
        }));
      }
    } catch (error) {
      console.error('Error fetching foreign key options:', error);
    } finally {
      setForeignKeyLoading(prev => ({ ...prev, [fieldName]: false }));
    }
  }, [modelName]);

  // Effect to fetch options when search changes
  useEffect(() => {
    Object.entries(debouncedSearch).forEach(([fieldName, search]) => {
      fetchForeignKeyOptions(fieldName, search);
    });
  }, [debouncedSearch, fetchForeignKeyOptions]);

  // Generate Zod schema from modelFields
  useState(() => {
    generateSchema(modelFields).then(setSchema);
  });

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: filteredFields.reduce((acc, field) => {
      acc[field.name] = item[field.name] ?? (field.isList ? [] : '');
      return acc;
    }, {} as Record<string, any>),
    mode: 'onChange',
  });

  const onSubmit = async (values: any) => {
    const formData = new FormData();
    formData.append('intent', 'update');
    formData.append('model', modelName);
    formData.append('id', item.id);
    formData.append('data', JSON.stringify(values));
    fetcher.submit(formData, { method: 'post' });
  };

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success('Item updated successfully!');
        setOpen(false);
        form.reset();
        onSuccess?.();
        revalidator.revalidate();
      } else {
        toast.error(fetcher.data.error || 'An error occurred while updating the item.');
      }
    }
  }, [fetcher.data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {modelName}</DialogTitle>
        </DialogHeader>
        {schema ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
              <div className='max-h-[70vh] overflow-auto grid grid-cols-1 sm:grid-cols-2 gap-4 w-full'>
                {filteredFields.map((field) => (
                  <FormField
                    key={field.name}
                    name={field.name}
                    control={form.control}
                    render={({ field: f }) => {
                      // Local state for badge input
                      const [inputValue, setInputValue] = useState('');
                      return (
                        <FormItem className="w-full">
                          <FormLabel className="text-sm">
                            {field.name}
                            {foreignKeyFields.some(fk => fk.name === field.name) && (
                              <Badge variant="outline" className="ml-2 text-xs">FK</Badge>
                            )}
                          </FormLabel>
                          <FormControl className="w-full">
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
                                  disabled={fetcher.state === 'submitting'}
                                  className="w-full"
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
                                            <ScrollArea className="h-64">
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
                                            </ScrollArea>
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                );
                              })()
                            ) : field.kind === 'scalar' && Array.isArray(field.options) && field.options.length > 0 ? (
                              (() => {
                                const isForeignKey = foreignKeyFields.some(fk => fk.name === field.name);
                                const options = isForeignKey ? (foreignKeyOptions[field.name] ?? []) : field.options;
                                const selected = String(f.value ?? '');
                                const [open, setOpen] = useState(false);
                                const loading = isForeignKey ? foreignKeyLoading[field.name] : false;
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
                                        <span className='max-w-[150px] text-ellipsis line-clamp-1'>
                                          {selected
                                            ? options.find((option: string) => option === selected)
                                            : `Select ${isForeignKey ? 'Foreign Key' : 'ID'}`}
                                        </span>
                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        {isForeignKey ? (
                                          <CommandInput
                                            placeholder={`Search foreign key...`}
                                            value={foreignKeySearch[field.name] || ''}
                                            onValueChange={(value) => {
                                              setForeignKeySearch(prev => ({
                                                ...prev,
                                                [field.name]: value
                                              }));
                                            }}
                                          />
                                        ) : (
                                          <CommandInput placeholder={`Search id...`} />
                                        )}
                                        <CommandList className="max-h-64 overflow-auto">
                                          {loading && (
                                            <div className="p-2 text-xs text-muted-foreground">Loading...</div>
                                          )}
                                          <CommandEmpty>No {isForeignKey ? 'foreign key' : 'id'} found.</CommandEmpty>
                                          <CommandGroup>
                                            <ScrollArea className="max-h-64">
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
                                                  <span className='max-w-[200px] text-ellipsis line-clamp-1'>
                                                    {option}
                                                  </span>
                                                </CommandItem>
                                              ))}
                                            </ScrollArea>
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
                                disabled={fetcher.state === 'submitting'}
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
                                disabled={fetcher.state === 'submitting'}
                                className="w-full"
                              />
                            ) : ["Int", "Float", "BigInt", "Decimal"].includes(field.type) ? (
                              <Input
                                {...f}
                                type="number"
                                value={String(f.value ?? '')}
                                onChange={e => f.onChange(e.target.value)}
                                disabled={fetcher.state === 'submitting'}
                                className="w-full"
                              />
                            ) : (
                              <Input {...f} value={String(f.value ?? '')} disabled={fetcher.state === 'submitting'} className="w-full" />
                            )}
                          </FormControl>
                          <FormMessage className='line-clamp-2 text-ellipsis' />
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={fetcher.state === 'submitting'}>
                  {fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
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