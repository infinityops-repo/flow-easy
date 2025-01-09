import React from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";

interface DesktopNavProps {
  onNavigate: (path: string) => void;
}

export const DesktopNav = ({ onNavigate }: DesktopNavProps) => {
  return (
    <nav className="flex items-center gap-6">
      <Button variant="ghost" onClick={() => onNavigate('/news')}>News</Button>
      <Button variant="ghost" onClick={() => onNavigate('/support')}>Support</Button>
    </nav>
  );
};