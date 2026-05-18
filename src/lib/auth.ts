import { createAuthClient } from 'better-auth/react';
import { stripeClient } from '@better-auth/stripe/client';

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV
    ? 'http://localhost:3001/'
    : 'https://backend.joinnentropy.com/',
  plugins: [
    stripeClient({
      subscription: true,
    }),
  ],
});

export const { useSession, signIn, signOut, signUp, subscription } = authClient;
