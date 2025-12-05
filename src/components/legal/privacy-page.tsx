import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 md:px-6">
      <div className="mb-8">
        <Button asChild variant="outline">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Link>
        </Button>
      </div>
      <div className="prose prose-invert max-w-none">
        <h1>Política de Privacidade</h1>
        <p>Última atualização: 23 de Maio de 2024</p>

        <p>
          Bem-vindo à Nyx AI. Esta Política de Privacidade explica como
          coletamos, usamos, divulgamos e protegemos suas informações quando você
          usa nosso serviço.
        </p>

        <h2>1. Coleta de Informações</h2>
        <p>
          Coletamos informações que você nos fornece diretamente, como quando
          você cria uma conta, se comunica conosco ou usa nossos serviços.
          Isso pode incluir seu nome, endereço de e-mail e o conteúdo de suas
          mensagens.
        </p>

        <h2>2. Uso de Informações</h2>
        <p>
          Usamos as informações que coletamos para operar, manter e fornecer os
          recursos e a funcionalidade do serviço, bem como para nos comunicarmos
          diretamente com você, por exemplo, para enviar e-mails relacionados
          ao serviço.
        </p>

        <h2>3. Compartilhamento de Informações</h2>
        <p>
          Não compartilharemos suas informações com terceiros, exceto conforme
          descrito nesta Política de Privacidade ou se tivermos obtido seu
          consentimento.
        </p>

        <h2>4. Segurança</h2>
        <p>
          Tomamos medidas razoáveis para proteger as informações que coletamos
          contra perda, roubo, uso indevido e acesso, divulgação, alteração e
          destruição não autorizados.
        </p>
      </div>
    </div>
  );
}
