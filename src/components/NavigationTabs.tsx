import React from 'react';
import { Button } from "@/components/ui/button";
import { Folder, Clock, Star, Layout } from 'lucide-react';

const tabs = [
  { icon: Folder, label: "My Projects" },
  { icon: Clock, label: "Latest" },
  { icon: Star, label: "Featured" },
  { icon: Layout, label: "Templates" },
];

export const NavigationTabs = () => {
  return (
    <div className="flex gap-4 justify-center max-w-2xl">
      {tabs.map(({ icon: Icon, label }) => (
        <Button
          key={label}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
};