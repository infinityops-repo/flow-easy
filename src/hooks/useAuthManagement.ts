import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthManagement = () => {
  const [userName, setUserName] = useState<string>("User");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        setIsAuthenticated(!!session);
        
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
          // Use the user's email directly from the session
          setUserName(session.user.email || 'User');
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        handleSignOut();
      }
    };

    fetchUserProfile();
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
        toast({
          title: "Error",
          description: "Error during logout. Please try again.",
          variant: "destructive",
        });
      } else {
        setIsAuthenticated(false);
        toast({
          title: "Success",
          description: "Successfully logged out",
        });
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
    isAuthenticated,
    handleSignOut
  };
};