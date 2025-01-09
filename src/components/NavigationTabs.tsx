import React from 'react';
import { Button } from "@/components/ui/button";
import { Folder, Clock, Layout } from 'lucide-react';

const tabs = [
  { icon: Folder, label: "My Projects", id: "my-projects" },
  { icon: Clock, label: "Latest", id: "latest" },
  { icon: Layout, label: "Templates", id: "templates" },
];

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
  return (
    <div className="flex gap-2 md:gap-4 justify-start md:justify-center px-4 min-w-full overflow-x-auto pb-2">
      {tabs.map(({ icon: Icon, label, id }) => (
        <Button
          key={label}
          variant={activeTab === id ? "default" : "ghost"}
          className="flex items-center gap-2 whitespace-nowrap"
          onClick={() => onTabChange(id)}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
};