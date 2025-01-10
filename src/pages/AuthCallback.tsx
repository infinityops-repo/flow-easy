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

          throw new Error('Link de verificação inválido');
        }

        // Tentar verificar o token usando verifyOtp
        console.log('Tentando verificar token com verifyOtp...');
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any
        });

        if (verifyError) {
          console.error('Erro na verificação do token:', verifyError);
          if (verifyError.message.includes('token not found')) {
            throw new Error('Este link já foi utilizado ou expirou. Por favor, faça login para receber um novo link.');
          }
          throw verifyError;
        }

        console.log('Resposta da verificação:', data);

        // Aguardar um momento para a sessão ser estabelecida
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verificar a sessão novamente
        const { data: { session: finalSession }, error: finalSessionError } = await supabase.auth.getSession();

        if (finalSessionError) {
          console.error('Erro ao obter sessão final:', finalSessionError);
          throw finalSessionError;
        }

        if (finalSession) {
          console.log('Sessão estabelecida com sucesso');
          navigate('/dashboard');
          return;
        }

        // Se chegou aqui sem sessão, voltar para login
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