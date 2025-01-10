# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7d850f51-b45f-4f24-9865-193ac2e26028

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7d850f51-b45f-4f24-9865-193ac2e26028) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7d850f51-b45f-4f24-9865-193ac2e26028) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Checklist de Deploy

Sempre que fizer alterações no código, siga esta sequência:

1. Fazer as alterações no código
2. Testar localmente
3. Deploy no Supabase e GitHub (execute os comandos juntos):
   ```bash
   supabase functions deploy generate-workflow && git add . && git commit -m "feat/fix: descrição clara da alteração" && git push origin main
   ```

⚠️ IMPORTANTE: Nunca pule nenhum desses passos! A ordem é essencial para manter a consistência entre ambientes.

# FlowEasy

## Database Structure

### Schemas
- `public`: Schema principal contendo todas as tabelas do sistema
- `auth`: Schema do Supabase Auth contendo a tabela de usuários (`auth.users`)

### Tabelas (schema: public)

#### workflow_cache
Armazena cache de workflows gerados
- `id`: UUID (PK) - Identificador único
- `prompt`: TEXT - Prompt usado para gerar o workflow
- `platform`: TEXT - Plataforma do workflow (n8n, make)
- `workflow`: JSONB - Workflow gerado em formato JSON
- `created_at`: TIMESTAMPTZ - Data de criação

#### projects
Armazena os projetos/workflows dos usuários
- `id`: UUID (PK) - Identificador único
- `user_id`: UUID (FK) - Referência para `auth.users(id)`
- `title`: TEXT - Título do projeto
- `image`: TEXT - URL da imagem do projeto
- `prompt`: TEXT - Prompt usado para gerar o workflow
- `platform`: TEXT - Plataforma do workflow (n8n, make)
- `workflow`: JSONB - Workflow em formato JSON
- `is_private`: BOOLEAN - Se o projeto é privado
- `created_at`: TIMESTAMPTZ - Data de criação
- `updated_at`: TIMESTAMPTZ - Data de atualização

#### plans
Armazena os planos disponíveis
- `id`: TEXT (PK) - Identificador único do plano (ex: 'free', 'pro')
- `name`: TEXT - Nome do plano
- `description`: TEXT - Descrição do plano
- `price`: DECIMAL(10,2) - Preço do plano (default: 0)
- `workflow_limit`: INTEGER - Limite de workflows (NULL = ilimitado)
- `features`: JSONB - Lista de funcionalidades do plano
- `created_at`: TIMESTAMPTZ - Data de criação
- `updated_at`: TIMESTAMPTZ - Data de atualização

#### subscriptions
Gerencia as assinaturas dos usuários
- `id`: UUID (PK) - Identificador único da assinatura
- `user_id`: UUID (FK) - Referência para `auth.users(id)`
- `plan_id`: TEXT (FK) - Referência para `plans(id)`
- `status`: TEXT - Status da assinatura (default: 'active')
- `stripe_subscription_id`: TEXT - ID da assinatura no Stripe
- `stripe_customer_id`: TEXT - ID do cliente no Stripe
- `current_period_start`: TIMESTAMPTZ - Início do período atual
- `current_period_end`: TIMESTAMPTZ - Fim do período atual
- `cancel_at_period_end`: BOOLEAN - Se cancela no fim do período
- `created_at`: TIMESTAMPTZ - Data de criação
- `updated_at`: TIMESTAMPTZ - Data de atualização

#### usage_logs
Registra o uso de workflows por usuário
- `id`: UUID (PK) - Identificador único do registro
- `user_id`: UUID (FK) - Referência para `auth.users(id)`
- `subscription_id`: UUID (FK) - Referência para `subscriptions(id)`
- `workflows_used`: INTEGER - Número de workflows usados
- `period_start`: TIMESTAMPTZ - Início do período
- `period_end`: TIMESTAMPTZ - Fim do período
- `created_at`: TIMESTAMPTZ - Data de criação
- `updated_at`: TIMESTAMPTZ - Data de atualização

### Políticas de Segurança (RLS)

#### plans
- SELECT: Permitido para usuários autenticados

#### subscriptions
- SELECT: Usuários só podem ver suas próprias assinaturas
- INSERT: Permitido para role postgres (usado pelo trigger)

#### usage_logs
- SELECT: Usuários só podem ver seus próprios logs
- INSERT: Permitido para role postgres (usado pelo trigger)

### Automações

#### Trigger: on_auth_user_created
- Executado: AFTER INSERT ON auth.users
- Função: handle_new_user()
- Propósito: Inicializa automaticamente uma assinatura gratuita quando um novo usuário é criado

#### Função: handle_new_user()
- Tipo: TRIGGER FUNCTION
- Segurança: SECURITY DEFINER
- Ações:
  1. Cria uma assinatura no plano 'free' para o novo usuário
  2. Cria um registro inicial de usage_log para o período atual
- Nota: Usa referência explícita ao schema public para evitar erros de contexto

### Planos Padrão
1. Free
   - Preço: $0
   - Limite: 5 workflows
   - Funcionalidades: ["Basic templates", "Community support"]

2. Pro
   - Preço: $12
   - Limite: Ilimitado
   - Funcionalidades: ["Premium templates", "Priority support", "Custom integrations"]

## Development

### Required Commands

After making changes to the database or functions:
```bash
supabase functions deploy generate-workflow
git add .
git commit -m "feat/fix: descrição clara da alteração"
git push origin main
```

# Flow Easy

Aplicação para criação e execução de workflows.

## Desenvolvimento

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Deploy

### Banco de dados

Para aplicar alterações no banco de dados:

1. Crie uma nova migração:
```bash
supabase migration new nome_da_migracao
```

2. Edite o arquivo criado em `supabase/migrations`

3. Aplique a migração:
```bash
supabase db reset
```

4. Faça deploy das alterações:
```bash
supabase db push
```

### Edge Functions

Para fazer deploy de funções edge:

```bash
supabase functions deploy nome-da-funcao
```

### Frontend

1. Faça build da aplicação:
```bash
npm run build
```

2. Faça deploy para produção:
```bash
npm run deploy
```

### Git

Para enviar alterações:

```bash
git add .
git commit -m "feat/fix: descrição clara da alteração"
git push origin main
```

## Estrutura do Banco de Dados

### Tabelas

#### plans
- id (text, PK)
- name (text)
- description (text)
- max_workflows (integer)
- created_at (timestamptz)

#### subscriptions
- id (uuid, PK)
- user_id (uuid, FK -> auth.users)
- plan_id (text, FK -> plans)
- created_at (timestamptz)
- updated_at (timestamptz)

#### usage_logs
- id (uuid, PK)
- user_id (uuid, FK -> auth.users)
- subscription_id (uuid, FK -> subscriptions)
- workflows_used (integer)
- period_start (timestamptz)
- period_end (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)

### Políticas de Segurança

- Usuários autenticados podem ver apenas seus próprios dados
- Service role tem acesso total às tabelas
- Triggers são executados com SECURITY DEFINER
