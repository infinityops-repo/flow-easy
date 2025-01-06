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
      // First clear all local storage data
      localStorage.clear();
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        navigate('/auth');
        return;
      }

      if (!session) {
        // If no session exists, just redirect
        navigate('/auth');
        return;
      }

      // Attempt to sign out
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error during sign out:', error);
        // If session not found, just redirect
        if (error.message.includes('session_not_found')) {
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
      // In case of any error, clear storage and redirect
      localStorage.clear();
      navigate('/auth');
    }
  };

  return {
    userName,
    handleSignOut
  };
};