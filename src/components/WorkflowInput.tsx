import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Paperclip, Share2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const WorkflowInput = () => {
  const [platform, setPlatform] = useState<string>('n8n');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<string | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const { toast } = useToast();

  const handleGenerateWorkflow = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your workflow",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        'https://juaeaocrdoaxwuybjkkv.supabase.co/functions/v1/generate-workflow',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ prompt, platform }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate workflow');
      }

      const { workflow, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      setGeneratedWorkflow(workflow);
      setShowWorkflow(true);
      
      toast({
        title: "Success",
        description: "Workflow generated successfully!",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl px-4">
      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-col space-y-4">
          <Input
            className="w-full bg-background/80 border-0 placeholder:text-muted-foreground/70 text-base h-12 px-4 resize-y min-h-[3rem] max-h-[12rem] rounded-md"
            placeholder={`Ask FlowEasy to create a ${platform} workflow for my...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
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
            <Button 
              className="h-9 px-4" 
              onClick={handleGenerateWorkflow}
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Create →"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showWorkflow} onOpenChange={setShowWorkflow}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generated Workflow</DialogTitle>
            <DialogDescription>
              Here's your generated workflow for {platform}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap bg-background/80 p-4 rounded-md">
              {generatedWorkflow}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};