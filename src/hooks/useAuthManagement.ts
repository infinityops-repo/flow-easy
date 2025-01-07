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
        
        if (!session) {
          console.log('No active session found');
          return;
        }

        // Try to refresh the session if it's close to expiring
        if (session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const fiveMinutes = 5 * 60 * 1000;
          
          if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
            const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Error refreshing session:', refreshError);
              handleSignOut();
              return;
            }
            if (!newSession) {
              console.log('Session refresh failed');
              handleSignOut();
              return;
            }
          }
        }

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching profile:', error);
            if (error.code === 'PGRST301') {
              console.log('Session expired, signing out');
              handleSignOut();
            }
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

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error during sign out:', error);
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
      localStorage.clear();
      navigate('/auth');
    }
  };

  return {
    userName,
    handleSignOut
  };
};