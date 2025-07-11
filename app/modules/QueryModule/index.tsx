import { AlertCircleIcon, Play } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import DataTable from '~/components/ui/data-table';
import { Textarea } from '~/components/ui/textarea';

export const QueryModule = () => {
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  const [sql, setSql] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateSql = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'SQL query cannot be empty.';
    if (!/^select\s+/i.test(trimmed)) return 'Only SELECT queries are allowed.';
    if (
      /;|--|\/\*|drop|delete|update|insert|alter|create|grant|revoke|truncate/i.test(
        trimmed
      )
    )
      return 'Unsafe SQL query detected. Only simple SELECT queries are allowed.';
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSql(e.target.value);
    setError(validateSql(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    setError(null);
    const trimmed = sql.trim();
    const validation = validateSql(sql);
    if (validation) {
      setError(validation);
      return;
    }
    const formData = new FormData();
    formData.append('sql', trimmed);
    fetcher.submit(formData, { method: 'post' });
  };

  useEffect(() => {
    console.log('HELLO!');

    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success('Query executed successfully!');
      } else {
        setError(
          fetcher.data.error || 'An error occurred while executing the query.'
        );
        toast.error(
          fetcher.data.error || 'An error occurred while executing the query.'
        );
      }

      revalidator.revalidate();
    }
  }, [fetcher.data]);

  const results = fetcher.data?.data;

  return (
    <main className="spacey-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">SQL Query Playground</h1>
        <div className="space-y-4">
          <Textarea
            className="w-full min-h-[120px] border rounded p-2 font-jetbrains"
            placeholder="Enter your SQL query here..."
            value={sql}
            onChange={handleInputChange}
            name="sql"
          />
          {(error || fetcher.data?.error) && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || fetcher.data?.error}
              </AlertDescription>
            </Alert>
          )}
          <Button
            disabled={fetcher.state === 'submitting' || !sql.trim()}
            onClick={handleSubmit}
          >
            <Play />
            {fetcher.state === 'submitting' ? 'Running...' : 'Run Query'}
          </Button>
        </div>
      </div>

      <section className="block mt-4">
        {results && <DataTable data={results} isSearchDisabled />}
      </section>
    </main>
  );
};
