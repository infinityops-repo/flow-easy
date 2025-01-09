import React from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

interface DesktopNavProps {
  onNavigate: () => void;
}

export const DesktopNav = ({ onNavigate }: DesktopNavProps) => {
  return (
    <Menubar className="border-none bg-transparent">
      <MenubarMenu>
        <MenubarTrigger className="font-medium" onClick={onNavigate}>News</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onNavigate}>Latest Updates</MenubarItem>
          <MenubarItem onClick={onNavigate}>Blog</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="font-medium" onClick={onNavigate}>Support</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onNavigate}>Help Center</MenubarItem>
          <MenubarItem onClick={onNavigate}>Contact Us</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};