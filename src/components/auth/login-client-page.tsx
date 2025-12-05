
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { AuthForm } from '@/components/auth/auth-form';
import { Bot } from 'lucide-react';
import Link from 'next/link';
import { Plushye } from '../logo/plushye';

export function LoginClientPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user is already logged in (and not anonymous), redirect to the chat page.
    if (!isUserLoading && user && !user.isAnonymous) {
      router.push('/chat');
    }
  }, [user, isUserLoading, router]);

  // Show a loading state while the user's status is being checked
  // or if they are already logged in and about to be redirected.
  if (isUserLoading || (user && !user.isAnonymous)) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="flex items-center gap-2 text-lg">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Carregando...
            </div>
        </div>
    );
  }

  // If there's no user or the user is anonymous, show the login form.
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Plushye />
          Nyx AI
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Esta IA transformou completamente meu fluxo de trabalho. A capacidade de gerar código e analisar problemas complexos é simplesmente incrível.&rdquo;
            </p>
            <footer className="text-sm">Desenvolvedor Satisfeito</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Crie uma conta ou faça login
            </h1>
            <p className="text-sm text-muted-foreground">
              Digite seu e-mail e senha para continuar
            </p>
          </div>
          <AuthForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Ao continuar, você concorda com nossos{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
