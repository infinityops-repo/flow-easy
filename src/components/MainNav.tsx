import React from "react";
import { useNavigate } from "react-router-dom";
import { GitBranch } from "lucide-react";
import { Button } from "./ui/button";
import { useAuthManagement } from "@/hooks/useAuthManagement";

const MainNav = () => {
  const navigate = useNavigate();
  const { userName, isAuthenticated, handleSignOut } = useAuthManagement();

  const handleNavigation = (path: string = '/') => {
    navigate(path);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center px-4 md:px-6 justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2" onClick={() => handleNavigation()} style={{ cursor: 'pointer' }}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#9b87f5] to-[#1EAEDB]">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Flow<span className="text-[#9b87f5]">Easy</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => handleNavigation('/settings')}>Settings</Button>
              <Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>Sign in</Button>
              <Button variant="default" onClick={() => navigate('/auth?mode=signup')}>Create account</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainNav;