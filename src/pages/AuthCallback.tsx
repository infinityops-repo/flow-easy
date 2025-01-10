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
        // Log inicial do processo
        console.log('Iniciando processo de callback de autenticação');
        console.log('URL completa:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search params:', window.location.search);

        // Verificar se há erro no hash da URL
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        const errorCode = searchParams.get('error_code');
        const errorDescription = searchParams.get('error_description');

        console.log('Parâmetros de erro:', { errorCode, errorDescription });

        if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired') || errorCode) {
          const errorMessage = errorDescription || 'O link de confirmação expirou ou é inválido';
          console.error('Erro detectado na URL:', errorMessage);
          setError(errorMessage);
          toast({
            title: "Link inválido",
            description: errorMessage,
            variant: "destructive",
            duration: 6000
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Tentar recuperar a sessão primeiro
        console.log('Tentando recuperar sessão...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (session) {
          console.log('Sessão encontrada, redirecionando para dashboard');
          navigate('/dashboard');
          return;
        }

        // Se não há sessão, tentar verificar o token
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        console.log('Parâmetros encontrados:', { token, type });

        if (!token) {
          console.log('Nenhum token encontrado, verificando hash...');
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');

          if (accessToken) {
            console.log('Access token encontrado no hash');
            // Se temos um access_token, significa que a autenticação já foi feita
            navigate('/dashboard');
            return;
          }

          setError('Link de verificação inválido ou expirado');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Se temos um token, fazer a verificação diretamente com a API do Supabase
        console.log('Tentando verificar token diretamente...');
        const response = await fetch(`https://juaeaocrdoaxwuybjkkv.supabase.co/auth/v1/verify?token=${token}&type=${type || 'signup'}&redirect_to=https://floweasy.run/auth/callback`, {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YWVhb2NyZG9heHd1eWJqa2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyMDIwOTksImV4cCI6MjA1MTc3ODA5OX0.ZIlKfuMb9fujzwCVnESsmaso1IE3BxQt5zVPnXBVp6w',
          }
        });

        if (!response.ok) {
          const responseData = await response.json().catch(() => ({}));
          console.error('Erro na verificação:', responseData);
          throw new Error(responseData.error_description || 'Erro ao verificar email');
        }

        // Após a verificação, tentar obter a sessão novamente
        const { data: { session: newSession }, error: newSessionError } = await supabase.auth.getSession();
        
        if (newSession) {
          console.log('Nova sessão criada após verificação');
          navigate('/dashboard');
          return;
        }

        if (newSessionError) {
          console.error('Erro ao obter nova sessão:', newSessionError);
          throw newSessionError;
        }

        // Se chegou aqui sem sessão, algo deu errado
        throw new Error('Não foi possível criar uma sessão após a verificação');

      } catch (error) {
        console.error('Erro detalhado no callback:', {
          error,
          name: error.name,
          message: error.message,
          stack: error.stack,
          url: window.location.href
        });
        
        setError('Erro ao processar autenticação');
        toast({
          title: "Erro",
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