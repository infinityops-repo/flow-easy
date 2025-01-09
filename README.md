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
- `public`: Main schema containing all system tables
- `auth`: Supabase Auth schema containing the users table (`auth.users`)

### Tables (schema: public)

#### plans
Stores available subscription plans
- `id`: TEXT (PK) - Unique plan identifier (e.g., 'free', 'pro')
- `name`: TEXT - Plan name
- `description`: TEXT - Plan description
- `price`: DECIMAL(10,2) - Plan price
- `workflow_limit`: INTEGER - Workflow limit (NULL = unlimited)
- `features`: JSONB - List of plan features

#### subscriptions
Manages user subscriptions
- `id`: UUID (PK) - Unique subscription identifier
- `user_id`: UUID (FK) - Reference to `auth.users(id)`
- `plan_id`: TEXT (FK) - Reference to `plans(id)`
- `status`: TEXT - Subscription status (default: 'active')
- `stripe_subscription_id`: TEXT - Stripe subscription ID
- `stripe_customer_id`: TEXT - Stripe customer ID
- Period and control fields

#### usage_logs
Records workflow usage per user
- `id`: UUID (PK) - Unique record identifier
- `user_id`: UUID (FK) - Reference to `auth.users(id)`
- `subscription_id`: UUID (FK) - Reference to `subscriptions(id)`
- `workflows_used`: INTEGER - Number of workflows used
- `period_start`: TIMESTAMP - Period start
- `period_end`: TIMESTAMP - Period end

### Security Policies (RLS)

#### plans
- SELECT: Allowed for authenticated users

#### subscriptions
- SELECT: Users can only view their own subscriptions
- INSERT: Allowed for postgres role (used by trigger)

#### usage_logs
- SELECT: Users can only view their own logs
- INSERT: Allowed for postgres role (used by trigger)

### Automation

#### Trigger: on_auth_user_created
- Executed: AFTER INSERT ON auth.users
- Function: handle_new_user()
- Purpose: Automatically initializes a free subscription when a new user is created

#### Function: handle_new_user()
- Type: TRIGGER FUNCTION
- Security: SECURITY DEFINER
- Actions:
  1. Creates a subscription in the 'free' plan for the new user
  2. Creates an initial usage_log record for the current period
- Note: Uses explicit reference to public schema to avoid context errors

### Default Plans
1. Free
   - Price: $0
   - Limit: 5 workflows
   - Features: ["Basic templates", "Community support"]

2. Pro
   - Price: $12
   - Limit: Unlimited
   - Features: ["Premium templates", "Priority support", "Custom integrations"]

## Development

### Required Commands

After making changes to the database or functions:
```bash
supabase functions deploy generate-workflow
git add .
git commit -m "feat/fix: clear description of the change"
git push origin main
```
