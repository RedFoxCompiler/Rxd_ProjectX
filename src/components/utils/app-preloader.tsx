
'use client';

// This component is no longer needed as the preloading strategy has been changed
// to use Next.js's native <Link prefetch>.
// It's kept as an empty file to avoid breaking imports if they exist, but its functionality is removed.

export function AppPreloader({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
