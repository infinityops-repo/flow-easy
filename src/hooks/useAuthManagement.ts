import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useAuthManagement = () => {
  const [userName, setUserName] = useState<string>("Usuário");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }

          if (profile) {
            setUserName(profile.full_name || profile.username || 'Usuário');
          } else {
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta",
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        variant: "destructive",
        title: "Erro ao realizar logout",
        description: "Ocorreu um erro ao tentar desconectar da sua conta",
      });
    } finally {
      // Always navigate to auth page after sign out attempt
      navigate('/auth');
    }
  };

  return {
    userName,
    handleSignOut
  };
};