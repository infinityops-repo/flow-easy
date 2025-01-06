import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ChevronDown, GitBranch, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const MainNav = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("Usuário");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', session.user.id)
            .maybeSingle(); // Changed from single() to maybeSingle()

          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }

          if (profile) {
            setUserName(profile.full_name || profile.username || 'Usuário');
          } else {
            // If no profile exists, create one
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{ id: session.user.id }]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleNavigation = () => {
    navigate('/');
  };

  const handleSignOut = async () => {
    try {
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session exists, just redirect to auth page
        navigate('/auth');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta",
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Erro ao realizar logout",
        description: "Ocorreu um erro ao tentar desconectar da sua conta",
      });
      
      // Force navigation to auth page if we get a session error
      if (error.message?.includes('session_not_found')) {
        navigate('/auth');
      }
    }
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
            <Menubar className="border-none bg-transparent">
              <MenubarMenu>
                <MenubarTrigger className="font-medium" onClick={handleNavigation}>Templates</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={handleNavigation}>New Template</MenubarItem>
                  <MenubarItem onClick={handleNavigation}>Browse All</MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className="font-medium" onClick={handleNavigation}>News</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={handleNavigation}>Latest Updates</MenubarItem>
                  <MenubarItem onClick={handleNavigation}>Blog</MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className="font-medium" onClick={handleNavigation}>Support</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={handleNavigation}>Help Center</MenubarItem>
                  <MenubarItem onClick={handleNavigation}>Contact Us</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                <span className="font-medium">{userName}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleNavigation}>Perfil</DropdownMenuItem>
                <DropdownMenuItem onClick={handleNavigation}>Configurações</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <Button variant="ghost" className="justify-start" onClick={handleNavigation}>Templates</Button>
                  <Button variant="ghost" className="justify-start" onClick={handleNavigation}>News</Button>
                  <Button variant="ghost" className="justify-start" onClick={handleNavigation}>Support</Button>
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <Button variant="ghost" className="justify-start" onClick={handleNavigation}>Perfil</Button>
                    <Button variant="ghost" className="justify-start" onClick={handleNavigation}>Configurações</Button>
                    <Button variant="ghost" className="justify-start text-red-500" onClick={handleSignOut}>Sair</Button>
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
