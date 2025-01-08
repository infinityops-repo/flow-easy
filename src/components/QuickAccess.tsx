import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  prompt: string;
  platform: 'n8n' | 'make';
}

const templates: Template[] = [
  {
    id: 'lead-generation',
    title: 'Lead generation workflow',
    prompt: 'Criar um workflow para coletar leads de redes sociais, validar os emails e adicionar em uma planilha ou CRM',
    platform: 'n8n'
  },
  {
    id: 'email-automation',
    title: 'Email automation flow',
    prompt: 'Criar um workflow de automação de email para enviar mensagens personalizadas baseadas em gatilhos específicos',
    platform: 'n8n'
  },
  {
    id: 'customer-onboarding',
    title: 'Customer onboarding',
    prompt: 'Criar um workflow de onboarding que envia emails de boas-vindas, documentação e acompanha o progresso do cliente',
    platform: 'n8n'
  },
  {
    id: 'data-sync',
    title: 'Data sync automation',
    prompt: 'Criar um workflow para sincronizar dados entre diferentes sistemas, com validação e tratamento de erros',
    platform: 'n8n'
  },
];

interface QuickAccessProps {
  onTemplateSelect: (template: Template) => void;
}

export const QuickAccess = ({ onTemplateSelect }: QuickAccessProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-2xl px-4 w-full">
      {templates.map((template) => (
        <Button
          key={template.id}
          variant="secondary"
          className="glass-card hover:bg-secondary/50 text-sm md:text-base"
          onClick={() => onTemplateSelect(template)}
        >
          {template.title}
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      ))}
    </div>
  );
};