'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth, initiateEmailSignUp, initiateEmailSignIn, initiateAnonymousSignIn, initiateGoogleSignIn, setDocumentNonBlocking, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { updateProfile } from 'firebase/auth';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { doc } from 'firebase/firestore';


const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  rememberMe: z.boolean().default(false),
  name: z.string().optional(),
  dateOfBirth: z.date().optional(),
}).refine(data => {
    // Validation is only required during sign up, which we can't easily check here.
    // We will do contextual validation in the onSubmit function.
    return true;
});

type UserFormValue = z.infer<typeof formSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.126,44,30.022,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export function AuthForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(true);
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
      name: '',
    },
  });

  const onSubmit = async (data: UserFormValue) => {
    setIsLoading(true);
    try {
      const persistence = data.rememberMe;
      if (isSignUp) {
        if (!data.name || !data.dateOfBirth) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Por favor, preencha o nome e a data de nascimento.' });
            setIsLoading(false);
            return;
        }

        const today = new Date();
        const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
        if (data.dateOfBirth > tenYearsAgo) {
            toast({ variant: 'destructive', title: 'Idade inválida', description: 'Você deve ter pelo menos 10 anos para se cadastrar.' });
            setIsLoading(false);
            return;
        }

        const userCredential = await initiateEmailSignUp(auth, data.email, data.password, persistence);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: data.name });
          // Also save date of birth to Firestore
          const userDocRef = doc(firestore, 'users', userCredential.user.uid);
          setDocumentNonBlocking(userDocRef, { 
              name: data.name, 
              email: data.email,
              dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd')
          }, { merge: true });
        }
      } else {
        await initiateEmailSignIn(auth, data.email, data.password, persistence);
      }
      // Redirection is handled by LoginClientPage
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: error.message || `Ocorreu um erro durante a ${isSignUp ? 'criação da conta' : 'tentativa de login'}.`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        await initiateGoogleSignIn(auth, true);
        // Redirection is handled by LoginClientPage
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Erro de Autenticação",
            description: error.message || "Não foi possível fazer login com o Google.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    try {
      await initiateAnonymousSignIn(auth, true);
      // Redirection is handled by LoginClientPage, which will push to /chat
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Não foi possível fazer login como anônimo.',
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <>
       <div className="grid gap-2">
            <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}>
                 {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : <GoogleIcon className="mr-2 h-4 w-4" />}
                Continuar com Google
            </Button>
            <Button variant="outline" onClick={handleAnonymousSignIn} disabled={isLoading}>
                Continuar como Anônimo
            </Button>
        </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
            Ou continue com
            </span>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {isSignUp && (
            <>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="Seu nome completo"
                            disabled={isLoading}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Data de Nascimento</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                    <span>Escolha uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                captionLayout="dropdown-nav"
                                fromYear={new Date().getFullYear() - 100}
                                toYear={new Date().getFullYear() - 10}
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                locale={ptBR}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>
                           Lembrar de mim
                        </FormLabel>
                    </div>
                </FormItem>
            )}
            />

          <Button disabled={isLoading} className="w-full" type="submit">
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </Button>
        </form>
      </Form>
      
      <p className="text-center text-sm text-muted-foreground mt-4">
        {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="underline underline-offset-4 hover:text-primary"
        >
          {isSignUp ? 'Entrar' : 'Criar conta'}
        </button>
      </p>
    </>
  );
}
