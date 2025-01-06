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
            FlowEasy is an AI-powered workflow automation platform that helps you create and manage workflows quickly and efficiently.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How does it work?</AccordionTrigger>
          <AccordionContent>
            Simply describe your desired workflow in natural language, and our AI will create a customized automation solution for you.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>What integrations are supported?</AccordionTrigger>
          <AccordionContent>
            We support major platforms and tools including Slack, Gmail, Trello, and many more. New integrations are added regularly.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};