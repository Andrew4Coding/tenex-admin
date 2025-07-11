import { createAuthClient } from 'better-auth/react';
import { useRouteLoaderData } from 'react-router';
import type { loader as rootLoader } from '~/root';

export const getAuthClient = () => {
  const root_loader_data = useRouteLoaderData<typeof rootLoader>('root');
  const auth_url = root_loader_data?.auth_url;

  if (!auth_url) {
    throw new Error('Null auth url');
  }

  const auth_client = createAuthClient({
    baseURL: auth_url,
  });

  return auth_client;
};
