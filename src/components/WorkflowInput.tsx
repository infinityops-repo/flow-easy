import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paperclip, Share2 } from 'lucide-react';

export const WorkflowInput = () => {
  const [platform, setPlatform] = useState<string>('n8n');

  return (
    <div className="w-full max-w-4xl px-4">
      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-col space-y-4">
          <Input
            className="w-full bg-background/80 border-0 placeholder:text-muted-foreground/70 text-base h-12 px-4 resize-y min-h-[3rem] max-h-[12rem] rounded-md"
            placeholder={`Ask FlowEasy to create a ${platform} workflow for my...`}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-background/50">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-[120px] bg-background/80 border-0 h-9">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="n8n">n8n</SelectItem>
                  <SelectItem value="make">Make</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-background/50">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <Button className="h-9 px-4">Create →</Button>
          </div>
        </div>
      </div>
    </div>
  );
};