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
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is FlowEasy?</AccordionTrigger>
          <AccordionContent>
            FlowEasy is an AI-powered workflow automation platform that helps you create and manage automations quickly and efficiently. With our technology, you can transform natural language descriptions into functional workflows in seconds.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>How does it work?</AccordionTrigger>
          <AccordionContent>
            It's simple: describe the workflow you want in natural language, and our AI will create a custom automation solution for you. FlowEasy automatically generates all the nodes, connections, and configurations needed for your automation to work seamlessly in n8n or Make (Integromat).
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>What integrations are supported?</AccordionTrigger>
          <AccordionContent>
            We support a wide range of integrations through n8n and Make platforms, including:
            • Productivity Tools: Gmail, Google Calendar, Microsoft Office 365
            • CRM and Sales: HubSpot, Salesforce, Pipedrive
            • Marketing: Mailchimp, SendGrid, Facebook Ads
            • Communication: Slack, Discord, WhatsApp
            • And much more! New integrations are added regularly.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>Do I need to know how to code?</AccordionTrigger>
          <AccordionContent>
            No! FlowEasy is designed to be accessible to everyone, regardless of technical expertise. Our AI translates your natural language descriptions into technical workflows, eliminating the need for programming knowledge.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>How can I get started?</AccordionTrigger>
          <AccordionContent>
            Getting started is easy:
            1. Create a free account
            2. Describe the workflow you want to automate
            3. Choose between n8n or Make as your platform
            4. The AI will generate your workflow in seconds
            5. Import the flow into your chosen platform and start using it!
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger>Is FlowEasy secure?</AccordionTrigger>
          <AccordionContent>
            Yes! Security is our priority. FlowEasy:
            • Doesn't store credentials or sensitive data
            • Uses end-to-end encryption
            • Follows security best practices
            • Complies with GDPR and other privacy regulations
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7">
          <AccordionTrigger>Can I customize the generated workflows?</AccordionTrigger>
          <AccordionContent>
            Absolutely! All workflows generated by FlowEasy can be customized:
            • Edit directly in the target platform (n8n or Make)
            • Adjust parameters and settings
            • Add or remove steps
            • Combine with other existing workflows
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-8">
          <AccordionTrigger>What support is available?</AccordionTrigger>
          <AccordionContent>
            We offer various levels of support:
            • Detailed documentation and tutorials
            • Knowledge base with practical examples
            • Email support for all users
            • Priority support for Pro subscribers
            • Dedicated consulting for Enterprise clients
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};