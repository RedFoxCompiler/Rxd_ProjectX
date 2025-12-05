
# Nyx AI - Instruções de Uso

Obrigado por baixar o projeto Nyx AI! Este arquivo contém todo o código-fonte da aplicação que você estava usando no ambiente de desenvolvimento.

## Passos para Rodar o Projeto Localmente

### 1. Descompacte o Arquivo
Primeiro, descompacte o arquivo `nyx-ai-project.zip` em uma pasta de sua escolha no seu computador.

### 2. Instale as Dependências
Abra um terminal ou prompt de comando, navegue até a pasta que você acabou de criar e execute o seguinte comando para instalar todas as bibliotecas necessárias:

```bash
npm install
```

### 3. Obtenha e Configure sua Chave de API da Gemini
Para que a inteligência artificial funcione, você precisa da sua própria chave de API do Google Gemini.

- **Obtenha a chave**: Vá para [Google AI Studio](https://aistudio.google.com/app/apikey) e crie uma nova chave de API.
- **Configure a chave**: Na raiz do seu projeto, você encontrará um arquivo chamado `.env`. Abra-o e adicione sua chave da seguinte forma:

```
GEMINI_API_KEY=SUA_CHAVE_API_VAI_AQUI
```

Substitua `SUA_CHAVE_API_VAI_AQUI` pela chave que você copiou do Google AI Studio.

### 4. Rode o Servidor de Desenvolvimento
Com tudo instalado e configurado, inicie a aplicação com o comando:

```bash
npm run dev
```

O terminal mostrará um endereço local, geralmente `http://localhost:9002`. Abra este endereço no seu navegador para ver a aplicação funcionando!

---

## Estrutura do Projeto

- **/src/app/**: Contém todas as páginas e a lógica de roteamento do Next.js.
  - **/src/app/chat/page.tsx**: A página principal da interface de chat.
- **/src/components/**: Contém todos os componentes React reutilizáveis.
  - **/src/components/chat/**: Componentes específicos da interface de chat.
  - **/src/components/ui/**: Componentes de UI da biblioteca ShadCN.
- **/src/ai/flows/**: Contém os "fluxos" do Genkit, que definem a lógica e os prompts enviados para a IA.
- **/src/firebase/**: Contém toda a configuração de conexão com o Firebase (autenticação, Firestore, etc.).
- **/public/**: Arquivos estáticos, como imagens.
- **/.env**: Arquivo para suas variáveis de ambiente (como a chave da API).

Agora você tem controle total sobre o código. Sinta-se à vontade para modificar, expandir e integrar qualquer outro modelo ou tecnologia que desejar!
