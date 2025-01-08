import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Trash2, RefreshCw, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProjectCardProps {
  title: string;
  image: string;
  editedTime: string;
  isPrivate?: boolean;
  onReuse?: () => void;
  onDelete?: () => void;
  onRename?: (newTitle: string) => void;
  prompt?: string;
  platform?: string;
}

const ProjectCard = ({ 
  title, 
  image, 
  editedTime, 
  isPrivate,
  onReuse,
  onDelete,
  onRename,
  prompt,
  platform 
}: ProjectCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleRename = () => {
    if (onRename && newTitle.trim() !== '') {
      onRename(newTitle);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <Card className="overflow-hidden group cursor-pointer transition-all hover:ring-2 hover:ring-primary/50">
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-[200px] object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {onReuse && (
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onReuse();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reutilizar
              </Button>
            )}
            {onRename && (
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Renomear
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex-1 mr-2">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleRename}
                  autoFocus
                  className="text-lg font-medium"
                  placeholder="Digite o novo título..."
                />
              </div>
            ) : (
              <h3 className="text-lg font-medium">{title}</h3>
            )}
            {isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Editado {editedTime}</p>
          {prompt && (
            <p className="text-sm text-muted-foreground mt-2 truncate">
              {prompt}
            </p>
          )}
          {platform && (
            <p className="text-xs text-muted-foreground mt-1">
              Plataforma: {platform}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;