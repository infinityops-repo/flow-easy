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
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session exists, just navigate to auth page
        navigate('/auth');
        return;
      }

      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during sign out:', error);
        // If we get a session_not_found error, clear local storage and redirect
        if (error.message.includes('session_not_found')) {
          localStorage.removeItem('supabase.auth.token');
          navigate('/auth');
          return;
        }
        toast.error('Erro ao realizar logout. Tente novamente.');
      } else {
        toast.success('Logout realizado com sucesso');
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Erro ao realizar logout. Tente novamente.');
      // Ensure navigation happens even if there's an error
      navigate('/auth');
    }
  };

  return {
    userName,
    handleSignOut
  };
};