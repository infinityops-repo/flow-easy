import React from 'react';
import { Button } from "@/components/ui/button";
import { Folder, Clock, Star, Layout } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { icon: Folder, label: "My Projects", path: "/my-projects" },
  { icon: Clock, label: "Latest", path: "/latest" },
  { icon: Star, label: "Featured", path: "/featured" },
  { icon: Layout, label: "Templates", path: "/templates" },
];

export const NavigationTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex gap-2 md:gap-4 justify-start md:justify-center px-4 min-w-full overflow-x-auto pb-2">
      {tabs.map(({ icon: Icon, label, path }) => (
        <Button
          key={label}
          variant={location.pathname === path ? "default" : "ghost"}
          className="flex items-center gap-2 whitespace-nowrap"
          onClick={() => navigate(path)}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
};