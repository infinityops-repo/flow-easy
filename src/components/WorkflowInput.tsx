import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Paperclip, Download, Copy } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuickAccess } from './QuickAccess';

interface WorkflowInputProps {
  onWorkflowGenerated?: (workflow: any, prompt: string, platform: string) => void;
}

export const WorkflowInput = ({ onWorkflowGenerated }: WorkflowInputProps) => {
  const [platform, setPlatform] = useState<string>('n8n');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
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
      console.log('==================== INICIANDO GERAÇÃO DO WORKFLOW ====================');
      console.log('Prompt:', prompt);
      console.log('Plataforma:', platform);

      const { data: { session } } = await supabase.auth.getSession();
      console.log('Sessão:', session?.user?.id);
      
      if (!session?.access_token) {
        throw new Error('User not authenticated');
      }

      console.log('==================== CHAMANDO FUNÇÃO GENERATE-WORKFLOW ====================');
      const { data, error } = await supabase.functions.invoke('generate-workflow', {
        body: { prompt, platform },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Erro na função generate-workflow:', error);
        throw error;
      }

      if (!data || !data.workflow) {
        console.error('Invalid response:', data);
        throw new Error('Invalid server response');
      }

      console.log('==================== WORKFLOW GERADO COM SUCESSO ====================');
      console.log('Workflow:', JSON.stringify(data.workflow, null, 2));
      console.log('Tipo do workflow:', typeof data.workflow);
      console.log('É objeto?', data.workflow !== null && typeof data.workflow === 'object');
      console.log('Chaves:', Object.keys(data.workflow));

      // Armazena o workflow como está para a interface
      setGeneratedWorkflow(data.workflow);
      setShareableUrl(data.shareableUrl);
      setShowWorkflow(true);
      
      // Notifica o componente pai sobre o novo workflow
      if (onWorkflowGenerated) {
        console.log('==================== CHAMANDO CALLBACK onWorkflowGenerated ====================');
        console.log('Parâmetros:', {
          workflow: data.workflow,
          prompt,
          platform
        });
        
        try {
          await onWorkflowGenerated(data.workflow, prompt, platform);
          console.log('==================== CALLBACK EXECUTADO COM SUCESSO ====================');
        } catch (callbackError) {
          console.error('==================== ERRO NO CALLBACK ====================');
          console.error('Erro:', callbackError);
          throw callbackError;
        }
      }

      toast({
        title: "Success",
        description: `${platform === 'make' ? 'Make' : 'n8n'} workflow generated successfully!`,
      });

    } catch (error) {
      console.error('==================== ERRO NA GERAÇÃO DO WORKFLOW ====================');
      console.error('Erro completo:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setPrompt(template.prompt);
    setPlatform(template.platform);
  };

  const handleCopyJson = () => {
    const workflowString = typeof generatedWorkflow === 'string' ? generatedWorkflow : JSON.stringify(generatedWorkflow);
    
    navigator.clipboard.writeText(workflowString);
    toast({
      title: "Copied!",
      description: `${platform === 'make' ? 'Make' : 'n8n'} workflow JSON copied to clipboard`,
    });
  };

  const handleDownloadJson = () => {
    const workflowString = typeof generatedWorkflow === 'string' ? generatedWorkflow : JSON.stringify(generatedWorkflow);
    
    const blob = new Blob([workflowString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${platform}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPlatformInstructions = () => {
    if (platform === 'make') {
      return "To import in Make (Integromat):\n1. Go to make.com\n2. Click on 'Create a new scenario'\n3. Click on the '...' (three dots) menu\n4. Select 'Import Blueprint'\n5. Paste the generated JSON";
    }
    return "To import in n8n:\n1. Access your n8n\n2. Click on 'Workflows'\n3. Click on 'Import from File'\n4. Paste the generated JSON";
  };

  return (
    <div className="w-full max-w-4xl px-4">
      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-col space-y-4">
          <Input
            className="w-full bg-background/80 border-0 placeholder:text-muted-foreground/70 text-base h-12 px-4 resize-y min-h-[3rem] max-h-[12rem] rounded-md"
            placeholder={`Ask FlowEasy to create a ${platform === 'make' ? 'Make' : 'n8n'} workflow for...`}
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
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="n8n">n8n</SelectItem>
                  <SelectItem value="make">Make</SelectItem>
                </SelectContent>
              </Select>
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

      <div className="mt-4">
        <QuickAccess onTemplateSelect={handleTemplateSelect} />
      </div>

      <Dialog open={showWorkflow} onOpenChange={setShowWorkflow}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Workflow {platform === 'make' ? 'Make' : 'n8n'} Gerado</DialogTitle>
            <DialogDescription>
              {getPlatformInstructions()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={handleCopyJson}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadJson}>
                <Download className="h-4 w-4 mr-2" />
                Baixar JSON
              </Button>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap bg-background/80 p-4 rounded-md overflow-x-auto">
                {JSON.stringify(generatedWorkflow)}
              </pre>
            </div>
            {shareableUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Link Compartilhável:</p>
                <Input 
                  value={shareableUrl} 
                  readOnly 
                  className="bg-background/80 font-mono text-sm"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};