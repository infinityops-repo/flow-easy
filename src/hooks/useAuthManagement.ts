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
      // Primeiro, obter a sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Se não houver sessão, apenas limpar localStorage e redirecionar
        localStorage.clear();
        navigate('/auth');
        return;
      }

      // Tentar fazer logout
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });

      if (error) {
        console.error('Error during sign out:', error);
        // Se o erro for de sessão não encontrada, limpar localStorage
        if (error.message.includes('session_not_found')) {
          localStorage.clear();
          navigate('/auth');
          return;
        }
        toast.error('Erro ao realizar logout. Tente novamente.');
      } else {
        localStorage.clear(); // Garantir que todos os dados locais sejam limpos
        toast.success('Logout realizado com sucesso');
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // Em caso de erro, tentar limpar tudo e redirecionar
      localStorage.clear();
      toast.error('Erro ao realizar logout. Tente novamente.');
      navigate('/auth');
    }
  };

  return {
    userName,
    handleSignOut
  };
};