import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TermsPage() {
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
        <h1>Termos de Serviço</h1>
        <p>Última atualização: 23 de Maio de 2024</p>
        <p>
          Por favor, leia estes Termos de Serviço ("Termos", "Termos de
          Serviço") cuidadosamente antes de usar o serviço Nyx AI
          (o "Serviço") operado por nós.
        </p>
        <p>
          Seu acesso e uso do Serviço estão condicionados à sua aceitação e
          conformidade com estes Termos. Estes Termos se aplicam a todos os
          visitantes, usuários e outras pessoas que acessam ou usam o Serviço.
        </p>

        <h2>Contas</h2>
        <p>
          Ao criar uma conta conosco, você deve nos fornecer informações precisas,
          completas e atuais em todos os momentos. A falha em fazer isso constitui
          uma violação dos Termos, o que pode resultar na rescisão imediata de sua
          conta em nosso Serviço.
        </p>

        <h2>Propriedade Intelectual</h2>
        <p>
          O Serviço e seu conteúdo original (excluindo conteúdo gerado pelo usuário), recursos e funcionalidades são e
          permanecerão propriedade exclusiva de seus criadores, <strong>Leonardo Rodrigues e Ellysson Martins</strong>. O nome "Nyx AI", o logotipo e
          quaisquer outros elementos de marca distintivos são protegidos por leis de direitos autorais e marcas registradas.
        </p>
        
        <h2>Conduta do Usuário e Restrições</h2>
        <p>
          Você concorda em não usar o Serviço para qualquer finalidade que seja ilegal ou proibida por estes Termos. Você não pode:
        </p>
        <ul>
            <li>
                Usar o Serviço de qualquer forma que possa danificar, desabilitar, sobrecarregar ou prejudicar qualquer servidor nosso, ou as redes conectadas a qualquer servidor nosso.
            </li>
            <li>
                Tentar obter acesso não autorizado a qualquer parte do Serviço, outras contas, sistemas de computador ou redes conectadas a qualquer servidor nosso, através de hacking, extração de senha ou qualquer outro meio.
            </li>
            <li>
                Fazer engenharia reversa, descompilar ou desmontar qualquer parte do software do Serviço, exceto e somente na medida em que tal atividade seja expressamente permitida pela lei aplicável.
            </li>
             <li>
                Enviar conteúdo que seja ilegal, odioso, ameaçador, abusivo, ou que infrinja os direitos de propriedade intelectual de terceiros.
            </li>
        </ul>

        <h2>Rescisão</h2>
        <p>
          Podemos rescindir ou suspender o acesso ao nosso Serviço imediatamente,
          sem aviso prévio ou responsabilidade, por qualquer motivo,
          incluindo, sem limitação, se você violar os Termos.
        </p>
      </div>
    </div>
  );
}
