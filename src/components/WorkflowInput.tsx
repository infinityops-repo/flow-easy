import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paperclip, Share2 } from 'lucide-react';

export const WorkflowInput = () => {
  const [platform, setPlatform] = useState<string>('n8n');

  return (
    <div className="w-full max-w-4xl px-4">
      <div className="glass-card p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-0 h-12">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="n8n">n8n</SelectItem>
              <SelectItem value="make">Make</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="w-full bg-background/50 border-0 placeholder:text-muted-foreground text-lg md:text-xl h-12 px-4 resize-y min-h-[3rem] max-h-[12rem]"
            placeholder={`Ask FlowEasy to create a ${platform} workflow for my...`}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <Button className="text-base md:text-lg px-6 py-2 h-12">Create →</Button>
        </div>
      </div>
    </div>
  );
};