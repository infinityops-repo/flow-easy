-- Cria a tabela de cache de workflows
create table public.workflow_cache (
    id uuid default gen_random_uuid() primary key,
    prompt text not null,
    platform text not null check (platform in ('n8n', 'make')),
    workflow jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Índices para melhorar performance de busca
    constraint workflow_cache_prompt_platform_idx unique (prompt, platform)
);

-- Permissões
alter table public.workflow_cache enable row level security;

-- Políticas de acesso
create policy "Workflows podem ser lidos por usuários autenticados"
on public.workflow_cache for select
to authenticated
using (true);

create policy "Apenas a função edge pode inserir workflows"
on public.workflow_cache for insert
to service_role
with check (true);

-- Comentários
comment on table public.workflow_cache is 'Cache de workflows gerados para economizar tokens da OpenAI';
comment on column public.workflow_cache.prompt is 'Prompt usado para gerar o workflow';
comment on column public.workflow_cache.platform is 'Plataforma do workflow (n8n ou make)';
comment on column public.workflow_cache.workflow is 'JSON do workflow gerado';
comment on column public.workflow_cache.created_at is 'Data e hora de criação do cache';
