import React from "react";
import { useNavigate } from "react-router-dom";
import { GitBranch, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { DesktopNav } from "./navigation/DesktopNav";
import { UserMenu } from "./navigation/UserMenu";

const MainNav = () => {
  const navigate = useNavigate();
  const { userName, handleSignOut } = useAuthManagement();

  const handleNavigation = () => {
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center px-4 md:px-6 justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2" onClick={handleNavigation} style={{ cursor: 'pointer' }}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#9b87f5] to-[#1EAEDB]">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Flow<span className="text-[#9b87f5]">Easy</span>
            </span>
          </div>
          
          <div className="hidden md:block">
            <DesktopNav onNavigate={handleNavigation} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <UserMenu 
              userName={userName}
              onNavigate={handleNavigation}
              onSignOut={handleSignOut}
            />
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="px-2 py-4 border-b border-white/10">
                    <p className="font-medium">{userName}</p>
                  </div>
                  <Button variant="ghost" className="justify-start" onClick={handleNavigation}>News</Button>
                  <Button variant="ghost" className="justify-start" onClick={handleNavigation}>Support</Button>
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <Button variant="ghost" className="justify-start" onClick={handleNavigation}>Profile</Button>
                    <Button variant="ghost" className="justify-start" onClick={handleNavigation}>Settings</Button>
                    <Button variant="ghost" className="justify-start text-red-500" onClick={handleSignOut}>Sign out</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav;