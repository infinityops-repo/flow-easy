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

        // Obter a sessão atual
        console.log('Tentando obter sessão do Supabase');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao verificar sessão:', {
            error: sessionError,
            code: sessionError.code,
            message: sessionError.message,
            details: sessionError.details
          });
          setError('Erro ao verificar sua sessão');
          toast({
            title: "Erro",
            description: `Erro ao verificar sua sessão: ${sessionError.message}`,
            variant: "destructive"
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        if (!session) {
          console.log('Nenhuma sessão encontrada, verificando token na URL');
          
          // Extrair token da URL
          const token = searchParams.get('token');
          const type = searchParams.get('type');
          
          console.log('Parâmetros encontrados:', { token, type });
          
          if (token) {
            console.log('Token encontrado na URL, tentando verificar');
            try {
              const { data, error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: type as any || 'signup'
              });

              if (verifyError) {
                console.error('Erro ao verificar token:', {
                  error: verifyError,
                  code: verifyError.code,
                  message: verifyError.message,
                  details: verifyError.details
                });
                throw verifyError;
              }

              if (data?.user) {
                console.log('Verificação bem-sucedida:', {
                  userId: data.user.id,
                  email: data.user.email
                });
                navigate('/dashboard');
                return;
              }
            } catch (verifyError) {
              console.error('Erro na verificação:', verifyError);
              throw verifyError;
            }
          } else {
            // Se não encontrou o token na query, tenta no hash
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const tokenHash = hashParams.get('access_token');
            
            if (tokenHash) {
              console.log('Token hash encontrado no hash da URL:', tokenHash);
              try {
                const { data, error: verifyError } = await supabase.auth.verifyOtp({
                  token_hash: tokenHash,
                  type: 'signup'
                });

                if (verifyError) {
                  console.error('Erro ao verificar token hash:', verifyError);
                  throw verifyError;
                }

                if (data?.user) {
                  console.log('Verificação por hash bem-sucedida:', {
                    userId: data.user.id,
                    email: data.user.email
                  });
                  navigate('/dashboard');
                  return;
                }
              } catch (verifyError) {
                console.error('Erro na verificação por hash:', verifyError);
                throw verifyError;
              }
            } else {
              console.log('Nenhum token encontrado na URL (nem query nem hash)');
              setError('Link de verificação inválido ou expirado');
              setTimeout(() => navigate('/auth'), 3000);
              return;
            }
          }
        }

        // Se chegou aqui, temos uma sessão válida
        console.log('Sessão válida encontrada:', {
          userId: session.user.id,
          email: session.user.email,
          lastSignIn: session.user.last_sign_in_at
        });
        navigate('/dashboard');
        
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
          description: `Erro ao processar autenticação: ${error.message}`,
          variant: "destructive"
        });
        setTimeout(() => navigate('/auth'), 3000);
      }
    }

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