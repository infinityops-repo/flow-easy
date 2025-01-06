import React from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const MainNav = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center px-6 justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#9b87f5] to-[#1EAEDB]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 3V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 9C18 9 18 3 12 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 15C6 15 6 21 12 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 15C18 15 18 21 12 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">
              Flow<span className="text-[#9b87f5]">Easy</span>
            </span>
          </div>
          
          <Menubar className="border-none bg-transparent">
            <MenubarMenu>
              <MenubarTrigger className="font-medium">Templates</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>New Template</MenubarItem>
                <MenubarItem>Browse All</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="font-medium">Careers</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Open Positions</MenubarItem>
                <MenubarItem>Join Our Team</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="font-medium">News</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Latest Updates</MenubarItem>
                <MenubarItem>Blog</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="font-medium">Support</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Help Center</MenubarItem>
                <MenubarItem>Contact Us</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
            <span className="font-medium">Michael Moreira</span>
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MainNav;
