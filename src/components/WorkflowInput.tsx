import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Paperclip, Share2, Download, Copy } from 'lucide-react';
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
        title: "Erro",
        description: "Por favor, insira uma descrição para seu workflow",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.functions.invoke('generate-workflow', {
        body: { prompt, platform },
      });

      if (error) {
        throw error;
      }

      if (!data || !data.workflow) {
        throw new Error('Resposta inválida do servidor');
      }

      const parsedWorkflow = typeof data.workflow === 'string' ? JSON.parse(data.workflow) : data.workflow;
      setGeneratedWorkflow(parsedWorkflow);
      setShareableUrl(data.shareableUrl);
      setShowWorkflow(true);
      
      // Notifica o componente pai sobre o novo workflow
      if (onWorkflowGenerated) {
        onWorkflowGenerated(parsedWorkflow, prompt, platform);
      }

      toast({
        title: "Sucesso",
        description: `Workflow ${platform === 'make' ? 'Make' : 'n8n'} gerado com sucesso!`,
      });

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao gerar workflow. Por favor, tente novamente.",
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
      title: "Copiado!",
      description: `JSON do workflow ${platform === 'make' ? 'Make' : 'n8n'} copiado para a área de transferência`,
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
      return "Para importar no Make (Integromat):\n1. Acesse make.com\n2. Clique em 'Criar um novo cenário'\n3. Clique no menu '...' (três pontos)\n4. Selecione 'Importar Blueprint'\n5. Cole o JSON gerado";
    }
    return "Para importar no n8n:\n1. Acesse seu n8n\n2. Clique em 'Workflows'\n3. Clique em 'Import from File'\n4. Cole o JSON gerado";
  };

  return (
    <div className="w-full max-w-4xl px-4">
      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-col space-y-4">
          <Input
            className="w-full bg-background/80 border-0 placeholder:text-muted-foreground/70 text-base h-12 px-4 resize-y min-h-[3rem] max-h-[12rem] rounded-md"
            placeholder={`Peça ao FlowEasy para criar um workflow ${platform === 'make' ? 'Make' : 'n8n'} para...`}
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
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-background/50">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              className="h-9 px-4" 
              onClick={handleGenerateWorkflow}
              disabled={isLoading}
            >
              {isLoading ? "Gerando..." : "Criar →"}
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