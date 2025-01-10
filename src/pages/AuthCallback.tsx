// @ts-ignore
import { useEffect, useState } from 'react';
// @ts-ignore
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

        // Extrair token e tipo da URL
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        const type = searchParams.get('type') || 'signup';

        console.log('Parâmetros encontrados:', { token, type });

        if (!token) {
          console.log('Nenhum token encontrado, verificando hash...');
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const error = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');

          if (error || errorDescription) {
            throw new Error(errorDescription || 'Erro na autenticação');
          }

          // Se não há token nem erro, pode ser um redirecionamento após verificação
          const { data: { session: redirectSession } } = await supabase.auth.getSession();
          if (redirectSession) {
            console.log('Sessão encontrada após redirecionamento');
            navigate('/dashboard');
            return;
          }

          throw new Error('Link de verificação inválido');
        }

        // Fazer a verificação diretamente com a API do Supabase
        console.log('Fazendo requisição de verificação...');
        const response = await fetch(`https://juaeaocrdoaxwuybjkkv.supabase.co/auth/v1/verify?token=${token}&type=${type}&redirect_to=https://floweasy.run/auth/callback`, {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YWVhb2NyZG9heHd1eWJqa2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyMDIwOTksImV4cCI6MjA1MTc3ODA5OX0.ZIlKfuMb9fujzwCVnESsmaso1IE3BxQt5zVPnXBVp6w',
          },
          redirect: 'manual'
        });

        console.log('Resposta da verificação:', {
          status: response.status,
          statusText: response.statusText,
          redirected: response.redirected,
          url: response.url
        });

        if (response.status === 303) {
          // Aguardar um momento para a sessão ser estabelecida
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Verificar a sessão após o redirecionamento
          const { data: { session: finalSession } } = await supabase.auth.getSession();

          if (finalSession) {
            console.log('Sessão estabelecida com sucesso');
            navigate('/dashboard');
            return;
          }
        }

        // Se chegou aqui, algo deu errado
        const text = await response.text();
        console.error('Conteúdo da resposta:', text);

        if (text.includes('token not found') || text.includes('invalid or has expired')) {
          throw new Error('Este link já foi utilizado ou expirou. Por favor, faça login para receber um novo link.');
        }

        throw new Error('Erro ao verificar email');

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