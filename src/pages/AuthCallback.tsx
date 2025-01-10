import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Iniciando processo de callback de autenticação');
        console.log('URL completa:', window.location.href);

        // Verificar se já existe uma sessão primeiro
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (session) {
          console.log('Sessão já existe, redirecionando para dashboard');
          navigate('/dashboard');
          return;
        }

        // Verificar parâmetros de erro
        const searchParams = new URLSearchParams(window.location.search);
        const errorCode = searchParams.get('error_code');
        const errorDescription = searchParams.get('error_description');

        if (errorCode || errorDescription) {
          const errorMessage = errorDescription || 'O link de confirmação expirou ou é inválido';
          console.error('Erro detectado na URL:', errorMessage);
          throw new Error(errorMessage);
        }

        // Verificar token
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token) {
          console.log('Nenhum token encontrado');
          throw new Error('Link de verificação inválido');
        }

        console.log('Iniciando verificação do token');
        const response = await fetch(`https://juaeaocrdoaxwuybjkkv.supabase.co/auth/v1/verify?token=${token}&type=${type || 'signup'}&redirect_to=https://floweasy.run/auth/callback`, {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YWVhb2NyZG9heHd1eWJqa2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyMDIwOTksImV4cCI6MjA1MTc3ODA5OX0.ZIlKfuMb9fujzwCVnESsmaso1IE3BxQt5zVPnXBVp6w',
          },
          redirect: 'follow'
        });

        console.log('Resposta da verificação:', {
          status: response.status,
          statusText: response.statusText,
          redirected: response.redirected,
          url: response.url
        });

        // Se a resposta não for ok e não for um redirecionamento, é um erro
        if (!response.ok && !response.redirected) {
          const responseData = await response.json().catch(() => ({}));
          console.error('Erro na verificação:', responseData);
          
          if (responseData.error === 'One-time token not found') {
            throw new Error('Este link já foi utilizado. Por favor, faça login normalmente.');
          }
          
          throw new Error(responseData.error_description || 'Erro ao verificar email');
        }

        // Aguardar um momento para a sessão ser estabelecida
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar a sessão novamente
        const { data: { session: finalSession }, error: finalSessionError } = await supabase.auth.getSession();

        if (finalSession) {
          console.log('Sessão estabelecida com sucesso');
          navigate('/dashboard');
          return;
        }

        if (finalSessionError) {
          console.error('Erro ao obter sessão final:', finalSessionError);
          throw finalSessionError;
        }

        // Se chegou aqui sem sessão, tentar login
        navigate('/auth');

      } catch (error) {
        console.error('Erro detalhado no callback:', error);
        
        setError(error.message || 'Erro ao processar autenticação');
        toast({
          title: "Erro na verificação",
          description: error.message || 'Erro ao processar autenticação',
          variant: "destructive",
          duration: 6000
        });
        
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p>Verificando autenticação...</p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 