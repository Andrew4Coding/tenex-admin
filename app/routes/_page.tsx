import { PrismaClient } from '@prisma/client';
import { Loader, RefreshCcw } from 'lucide-react';
import { isRouteErrorResponse, Link, Outlet, useLoaderData, useNavigate, useNavigation, type LoaderFunctionArgs } from 'react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from '~/components/context/theme-provider';
import { AppSidebar } from '~/components/ui/app-sidebar';
import { Button } from '~/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { ThemeToggler } from '~/components/ui/ThemeToggler';
import type { Route } from '../+types/root';

export async function loader(args: LoaderFunctionArgs): Promise<{ models: string[] }> {
  // List models from prisma psql
  const prisma = new PrismaClient();
  const query: { table_name: string }[] = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;

  const models = query.map((item) => item.table_name).filter((name) => !name.startsWith('_') && name !== 'migrations' && name !== 'prisma_migrations');

  return {
    models
  };
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const contextData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';

  return (
    <ThemeProvider>
      <main className='h-screen overflow-hidden font-tiktok'>
        <SidebarProvider>
          <AppSidebar models={contextData.models} />
          <SidebarTrigger />
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-none transition-opacity animate-fade-in" >
              <div className="bg-white dark:bg-zinc-900 rounded-full p-6 shadow-lg flex items-center justify-center">
                <Loader className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
          )}
          <div className='p-4 w-full h-full max-h-screen overflow-hidden space-y-2'>
            <div className='w-full flex justify-end'>
              <ThemeToggler />
            </div>
            {children}
          </div>
          <Toaster />
        </SidebarProvider>
      </main>
    </ThemeProvider>
  );
}

export default function PageLayout() {
  const contextData = useLoaderData<typeof loader>();
  return (
    <MainLayout>
      <Outlet context={contextData} />
    </MainLayout>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = JSON.stringify(error);

  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.data || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className='text-center space-y-4'>
        <div>
          <h1 className='text-2xl font-bold'>{message}</h1>
          <p className='text-gray-500'>{details}</p>
        </div>
        {stack && (
          <pre className='text-sm max-h-96 overflow-auto'>
            {stack}
          </pre>
        )}
        <div className='grid grid-cols-2 gap-4'>
          <Button variant='outline' onClick={() => navigate(0)} className='w-full'>
            <RefreshCcw />
            Reload
          </Button>
          <Link to={'/'}>
            <Button className='w-full'>
              I don't give a f*ck
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}