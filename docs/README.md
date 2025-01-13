# Flow Easy

Flow Easy é uma plataforma SaaS (Software as a Service) que permite aos usuários criar e gerenciar fluxos de trabalho de forma simples e intuitiva.

## Visão Geral

A plataforma oferece uma interface moderna e intuitiva para automatização de processos, com foco em simplicidade e eficiência.

## Arquitetura

### Frontend
- React + TypeScript
- Tailwind CSS para estilização
- React Router para navegação
- Shadcn/ui para componentes de interface

### Backend
- Supabase para autenticação e banco de dados
- PostgreSQL como banco de dados principal
- Edge Functions para processamento serverless

## Funcionalidades Principais

### Autenticação
- Login com email/senha
- Confirmação de email obrigatória
- Recuperação de senha
- Proteção de rotas autenticadas

#### Fluxo de Autenticação
1. **Registro**
   - Usuário fornece email e senha
   - Sistema envia email de confirmação
   - Link de confirmação válido por 2 horas
   - Redirecionamento para `/auth/callback` após confirmação

2. **Login**
   - Autenticação via email/senha
   - Sessão mantida via JWT
   - Redirecionamento para dashboard após login

3. **Recuperação de Senha**
   - Usuário solicita reset de senha
   - Email enviado com link de recuperação
   - Link válido por 2 horas

### Gerenciamento de Usuários
- Perfis de usuário
- Configurações de conta
- Gerenciamento de assinaturas

### Sistema de Assinaturas
- Planos disponíveis:
  - Free
  - Pro
  - Enterprise
- Integração com sistema de pagamentos
- Limites de uso por plano

## Banco de Dados

### Tabelas Principais
1. **users**
   - Informações básicas do usuário
   - Configurações de perfil
   - Status da conta

2. **subscriptions**
   - Plano atual
   - Status da assinatura
   - Histórico de pagamentos

3. **usage_logs**
   - Registro de uso da plataforma
   - Métricas por usuário
   - Limites de consumo

## Políticas de Segurança

### Autenticação
- Tokens JWT com expiração de 1 hora
- Refresh tokens para renovação automática
- Rate limiting em tentativas de login

### Banco de Dados
- RLS (Row Level Security) ativo
- Políticas por tabela
- Backup automático

## Configurações de Ambiente

### Desenvolvimento
```bash
# Variáveis de ambiente necessárias
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
```

### Produção
- URL base: https://floweasy.run
- URLs de redirecionamento configuradas:
  - https://floweasy.run/auth/callback

## Fluxo de Desenvolvimento

### Padrões de Código
- ESLint para linting
- Prettier para formatação
- Commits semânticos

### Processo de Deploy
1. Testes locais
2. Push para GitHub
3. Deploy automático via CI/CD

## Monitoramento

### Logs
- Logs detalhados de autenticação
- Monitoramento de uso
- Alertas de erro

### Métricas
- Usuários ativos
- Taxa de conversão
- Uso por recurso

## Roadmap

### Fase 1 (Atual)
- [x] Sistema de autenticação
- [x] Estrutura básica do banco
- [x] Dashboard inicial

### Fase 2
- [ ] Editor de fluxos
- [ ] Integrações básicas
- [ ] Sistema de pagamentos

### Fase 3
- [ ] Templates prontos
- [ ] API pública
- [ ] Marketplace

## Suporte

### Canais
- Email: suporte@floweasy.run
- Chat in-app
- Documentação online

## Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça commit das alterações
4. Push para a branch
5. Abra um Pull Request

## Licença

Todos os direitos reservados © 2024 Flow Easy
