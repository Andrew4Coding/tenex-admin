import { createAuthClient } from 'better-auth/react';

export const getAuthClient = () => {
  const auth_client = createAuthClient();

  return auth_client;
};
