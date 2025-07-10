import { Link } from 'react-router';
import { Button } from '~/components/ui/button';

export const LandingModule = ({ modelsCount }: { modelsCount?: number }) => {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold mb-2">Welcome to Tenex Admin</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-xl">
        Manage your database models, run queries, and explore your data with a clean, minimal interface.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center">
        <div className="flex-1 bg-card rounded-lg shadow p-6 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold mb-2">{modelsCount ?? '--'}</div>
          <div className="text-muted-foreground">Total Models</div>
        </div>
        <div className="flex-1 bg-card rounded-lg shadow p-6 flex flex-col items-center gap-4">
          <div className="text-lg font-semibold mb-2">Quick Links</div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/query">Query Playground</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/settings">Settings</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};
