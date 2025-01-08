import { ProjectCardProps } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Copy, Repeat, Eye } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface ProjectCardProps {
  id: string;
  title: string;
  image: string;
  prompt: string;
  platform: string;
  created_at?: string;
  updated_at?: string;
  workflow: any;
  onReuse: () => void;
  onDelete: () => Promise<void>;
  onRename: (newTitle: string) => Promise<void>;
}

export const ProjectCard = ({ 
  id, 
  title, 
  image,
  prompt, 
  platform, 
  created_at, 
  workflow,
  onReuse,
  onDelete,
  onRename 
}: ProjectCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const handleRename = async () => {
    if (newTitle.trim() && newTitle !== title) {
      await onRename(newTitle);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {isEditing ? (
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="max-w-[200px]"
              autoFocus
            />
          ) : (
            <h3 className="font-medium text-lg cursor-pointer hover:text-primary" onClick={() => setIsEditing(true)}>
              {title}
            </h3>
          )}
          <p className="text-sm text-muted-foreground">{prompt}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {platform === 'make' ? 'Make' : 'n8n'}
            </Badge>
            {created_at && (
              <span>
                Criado em {new Date(created_at).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onReuse}>
            <Repeat className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowWorkflow(true)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={showWorkflow} onOpenChange={setShowWorkflow}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Workflow {platform === 'make' ? 'Make' : 'n8n'}</DialogTitle>
            <DialogDescription>
              {title}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap bg-background/80 p-4 rounded-md overflow-x-auto">
                {JSON.stringify(workflow, null, 2)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}