'use client';

import { LoginClientPage } from '@/components/auth/login-client-page';

export default function LoginPage() {
  // This server component now only renders the client component,
  // which contains all stateful logic and effects.
  return <LoginClientPage />;
}
