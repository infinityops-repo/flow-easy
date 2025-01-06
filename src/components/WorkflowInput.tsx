import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Share2 } from 'lucide-react';

export const WorkflowInput = () => {
  return (
    <div className="w-full max-w-2xl px-4">
      <div className="glass-card p-3 md:p-4">
        <Input
          className="w-full bg-background/50 border-0 placeholder:text-muted-foreground mb-3 text-sm md:text-base"
          placeholder="Ask FlowEasy to create a workflow for my..."
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <Button className="text-sm md:text-base">Create →</Button>
        </div>
      </div>
    </div>
  );
};