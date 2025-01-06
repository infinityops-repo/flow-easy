import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paperclip, Share2 } from 'lucide-react';

export const WorkflowInput = () => {
  const [platform, setPlatform] = useState<string>('n8n');

  return (
    <div className="w-full max-w-2xl px-4">
      <div className="glass-card p-3 md:p-4 space-y-3">
        <div className="flex gap-3">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-[140px] bg-background/50 border-0">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="n8n">n8n</SelectItem>
              <SelectItem value="make">Make</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="w-full bg-background/50 border-0 placeholder:text-muted-foreground text-sm md:text-base"
            placeholder={`Ask FlowEasy to create a ${platform} workflow for my...`}
          />
        </div>
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