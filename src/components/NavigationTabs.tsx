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
    <div className="flex gap-2 md:gap-4 justify-start md:justify-center px-4 min-w-full overflow-x-auto pb-2">
      {tabs.map(({ icon: Icon, label }) => (
        <Button
          key={label}
          variant="ghost"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
};