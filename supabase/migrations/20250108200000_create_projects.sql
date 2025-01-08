-- Cria a tabela de projetos
create table public.projects (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    title text not null,
    image text not null,
    prompt text,
    platform text check (platform in ('n8n', 'make')),
    workflow jsonb,
    is_private boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Índices para melhorar performance
    constraint projects_user_id_title_idx unique (user_id, title)
);

-- Função para atualizar o updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Trigger para atualizar o updated_at
create trigger projects_handle_updated_at
    before update on public.projects
    for each row
    execute function public.handle_updated_at();

-- Permissões
alter table public.projects enable row level security;

-- Políticas de acesso
create policy "Usuários podem ver seus próprios projetos"
on public.projects for select
to authenticated
using (auth.uid() = user_id);

create policy "Usuários podem inserir seus próprios projetos"
on public.projects for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus próprios projetos"
on public.projects for update
to authenticated
using (auth.uid() = user_id);

create policy "Usuários podem deletar seus próprios projetos"
on public.projects for delete
to authenticated
using (auth.uid() = user_id);

-- Comentários
comment on table public.projects is 'Projetos salvos pelos usuários';
comment on column public.projects.user_id is 'ID do usuário dono do projeto';
comment on column public.projects.title is 'Título do projeto';
comment on column public.projects.image is 'URL da imagem do projeto';
comment on column public.projects.prompt is 'Prompt usado para gerar o workflow';
comment on column public.projects.platform is 'Plataforma do workflow (n8n ou make)';
comment on column public.projects.workflow is 'JSON do workflow';
comment on column public.projects.is_private is 'Se o projeto é privado';
comment on column public.projects.created_at is 'Data e hora de criação';
comment on column public.projects.updated_at is 'Data e hora da última atualização'; 