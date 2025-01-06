import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Share2 } from 'lucide-react';

export const WorkflowInput = () => {
  return (
    <div className="w-full max-w-2xl">
      <div className="glass-card p-4">
        <Input
          className="w-full bg-background/50 border-0 placeholder:text-muted-foreground mb-3"
          placeholder="Ask Lovable to create a workflow for my..."
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <Button>Create →</Button>
        </div>
      </div>
    </div>
  );
};