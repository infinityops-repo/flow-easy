import { ProjectCardProps } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function ProjectCard({
  id,
  name,
  description,
  platform,
  created_at,
  updated_at,
  onReuse,
  onDelete,
  onRename,
}: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleRename = async () => {
    if (newName.trim() && newName !== name) {
      await onRename(newName);
    }
    setIsEditing(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
            <Button onClick={handleRename}>Salvar</Button>
          </div>
        ) : (
          <CardTitle className="flex justify-between items-center">
            <span>{name}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onReuse}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-muted-foreground">
          Plataforma: {platform === "make" ? "Make" : "n8n"}
        </span>
        <span className="text-sm text-muted-foreground">
          Atualizado em: {new Date(updated_at || created_at || "").toLocaleString()}
        </span>
      </CardFooter>
    </Card>
  );
}