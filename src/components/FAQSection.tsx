import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQSection = () => {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>O que é o FlowEasy?</AccordionTrigger>
          <AccordionContent>
            FlowEasy é uma plataforma de automação de fluxos de trabalho potencializada por IA que ajuda você a criar e gerenciar automações de forma rápida e eficiente. Com nossa tecnologia, você pode transformar descrições em linguagem natural em fluxos de trabalho funcionais em segundos.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Como funciona?</AccordionTrigger>
          <AccordionContent>
            É simples: descreva o fluxo de trabalho que você deseja em linguagem natural, e nossa IA criará uma solução de automação personalizada para você. O FlowEasy gera automaticamente todos os nós, conexões e configurações necessárias para sua automação funcionar perfeitamente no n8n ou Make (Integromat).
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Quais integrações são suportadas?</AccordionTrigger>
          <AccordionContent>
            Suportamos uma ampla gama de integrações através das plataformas n8n e Make, incluindo:
            • Ferramentas de Produtividade: Gmail, Google Calendar, Microsoft Office 365
            • CRM e Vendas: HubSpot, Salesforce, Pipedrive
            • Marketing: Mailchimp, SendGrid, Facebook Ads
            • Comunicação: Slack, Discord, WhatsApp
            • E muito mais! Novas integrações são adicionadas regularmente.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>Preciso saber programar?</AccordionTrigger>
          <AccordionContent>
            Não! O FlowEasy foi projetado para ser acessível a todos, independentemente do nível técnico. Nossa IA traduz suas descrições em linguagem natural para fluxos de trabalho técnicos, eliminando a necessidade de conhecimento em programação.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>Como posso começar?</AccordionTrigger>
          <AccordionContent>
            Começar é fácil:
            1. Crie uma conta gratuita
            2. Descreva o fluxo de trabalho que você deseja automatizar
            3. Escolha entre n8n ou Make como plataforma
            4. A IA gerará seu fluxo de trabalho em segundos
            5. Importe o fluxo na plataforma escolhida e comece a usar!
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger>É seguro usar o FlowEasy?</AccordionTrigger>
          <AccordionContent>
            Sim! Segurança é nossa prioridade. O FlowEasy:
            • Não armazena credenciais ou dados sensíveis
            • Utiliza criptografia de ponta a ponta
            • Segue as melhores práticas de segurança
            • Está em conformidade com GDPR e outras regulamentações de privacidade
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7">
          <AccordionTrigger>Posso personalizar os fluxos gerados?</AccordionTrigger>
          <AccordionContent>
            Absolutamente! Todos os fluxos gerados pelo FlowEasy podem ser personalizados:
            • Edite diretamente na plataforma de destino (n8n ou Make)
            • Ajuste parâmetros e configurações
            • Adicione ou remova etapas
            • Combine com outros fluxos existentes
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-8">
          <AccordionTrigger>Qual suporte está disponível?</AccordionTrigger>
          <AccordionContent>
            Oferecemos vários níveis de suporte:
            • Documentação detalhada e tutoriais
            • Base de conhecimento com exemplos práticos
            • Suporte por email para todos os usuários
            • Suporte prioritário para assinantes Pro
            • Consultoria dedicada para clientes Enterprise
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};