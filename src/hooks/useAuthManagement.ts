import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthManagement = () => {
  const [userName, setUserName] = useState<string>("Usuário");
  const navigate = useNavigate();

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
      // First clear any existing session data from localStorage
      localStorage.removeItem('supabase.auth.token');
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local'  // Only clear the current tab's session
      });
      
      if (error) {
        console.error('Error during sign out:', error);
        toast.error('Erro ao realizar logout. Tente novamente.');
      } else {
        toast.success('Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Erro ao realizar logout. Tente novamente.');
    } finally {
      // Always navigate to auth page after attempting logout
      navigate('/auth');
    }
  };

  return {
    userName,
    handleSignOut
  };
};