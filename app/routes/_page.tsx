import { PrismaClient } from '@prisma/client';
import { Outlet, useLoaderData } from 'react-router';
import { Toaster } from 'sonner';
import { AppSidebar } from '~/components/ui/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';

export async function loader() {
  // List models from prisma psql
  const prisma = new PrismaClient();
  const query: { table_name: string }[] = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  
  const models = query.map((item) => item.table_name);

  return {
    models
  };
}

export default function PageLayout() {
  const contextData = useLoaderData<typeof loader>();
  
  return (
    <main className='h-screen overflow-hidden font-tiktok'>
      <SidebarProvider>
        <AppSidebar
          models={contextData.models}
        />
        <SidebarTrigger />
        <div className='p-4 w-full h-full max-h-screen overflow-hidden'>
          <Outlet context={contextData} />
        </div>
        <Toaster />
      </SidebarProvider>
    </main>
  );
}
