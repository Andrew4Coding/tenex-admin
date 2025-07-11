import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const getAuthClient = () => {
  const auth_client = createAuthClient({
    plugins: [
      inferAdditionalFields({
        user: {
          isRootAdmin: {
            type: 'boolean',
            default: false,
            description: 'Indicates if the user is a root admin',
          },
        },
      }),
    ],
  });

  return auth_client;
};
