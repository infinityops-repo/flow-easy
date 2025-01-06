import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from 'lucide-react';

const templates = [
  "Crypto portfolio tracker",
  "AI image generator",
  "Music player",
  "Social media dashboard",
];

export const QuickAccess = () => {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
      {templates.map((template) => (
        <Button
          key={template}
          variant="secondary"
          className="glass-card hover:bg-secondary/50"
        >
          {template}
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      ))}
    </div>
  );
};