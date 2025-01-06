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
    let shouldRedirect = true;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Error during sign out:', error);
          if (error.message.includes('session_not_found')) {
            localStorage.removeItem('supabase.auth.token');
          } else {
            toast.error('Erro ao realizar logout. Tente novamente.');
            shouldRedirect = false;
          }
        } else {
          toast.success('Logout realizado com sucesso');
        }
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Erro ao realizar logout. Tente novamente.');
    } finally {
      if (shouldRedirect) {
        navigate('/auth');
      }
    }
  };

  return {
    userName,
    handleSignOut
  };
};