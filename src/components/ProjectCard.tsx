import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  image: string;
  editedTime: string;
  isPrivate?: boolean;
}

const ProjectCard = ({ title, image, editedTime, isPrivate }: ProjectCardProps) => {
  return (
    <Card className="overflow-hidden group cursor-pointer transition-all hover:ring-2 hover:ring-primary/50">
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-[200px] object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{title}</h3>
            {isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Edited {editedTime}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;