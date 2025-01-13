// @ts-ignore
import { useEffect, useState } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (isProcessing) return;
        setIsProcessing(true);

        console.log('Iniciando processo de callback de autenticação');
        console.log('URL completa:', window.location.href);

        // Extrair parâmetros da URL
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const email = searchParams.get('email');
        const accessToken = searchParams.get('access_token');

        // Log dos parâmetros (ocultando informações sensíveis)
        console.log('Parâmetros da URL:', {
          token: token ? `${token.substring(0, 10)}...` : null,
          type,
          error,
          errorDescription,
          email: email ? `${email.substring(0, 3)}...` : null,
          hasAccessToken: !!accessToken
        });

        // Se já temos um access_token, significa que o redirecionamento foi bem-sucedido
        if (accessToken) {
          console.log('Access token encontrado, verificando sessão...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (session) {
            console.log('Sessão encontrada com access token');
            navigate('/dashboard');
            return;
          }

          // Se não tem sessão mas tem access_token, tentar estabelecer
          try {
            console.log('Tentando estabelecer sessão com access token');
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: searchParams.get('refresh_token') || ''
            });

            if (!setSessionError) {
              console.log('Sessão estabelecida com sucesso');
              navigate('/dashboard');
              return;
            }
          } catch (error) {
            console.error('Erro ao estabelecer sessão:', error);
          }
        }

        // Verificar erros nos parâmetros
        if (error || errorDescription) {
          console.error('Erro encontrado nos parâmetros:', { error, errorDescription });
          throw new Error(errorDescription || error || 'Erro na autenticação');
        }

        // Verificar se já existe uma sessão
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          console.log('Sessão já existe, redirecionando para dashboard');
          navigate('/dashboard');
          return;
        }

        // Se não temos token nem email, erro
        if (!token && !email) {
          console.log('Nenhum token ou email encontrado');
          throw new Error('Link de verificação inválido');
        }

        // Se temos email mas não token, tentar reenviar
        if (email && !token) {
          console.log('Email encontrado, tentando reenviar verificação');
          const { error: signInError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: 'https://floweasy.run/auth/callback'
            }
          });

          if (signInError) {
            console.error('Erro ao reenviar email:', signInError);
            throw new Error('Erro ao reenviar email de verificação');
          }

          toast({
            title: "Email reenviado",
            description: "Um novo email de verificação foi enviado. Por favor, verifique sua caixa de entrada.",
            duration: 6000
          });
          
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Se chegamos aqui, temos um token para verificar
        try {
          console.log('Iniciando verificação do token');
          
          // Tentar verificar com verifyOtp
          const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
            token,
            type: type as any || 'signup'
          });

          // Se houver erro na verificação
          if (verifyError) {
            console.error('Erro na verificação do token:', verifyError);
            
            // Se o erro for de token não encontrado ou expirado
            if (verifyError.message.includes('token not found') || 
                verifyError.message.includes('expired') ||
                verifyError.message.includes('invalid')) {
              
              if (email) {
                console.log('Token inválido/expirado, tentando reenviar');
                const { error: resendError } = await supabase.auth.signInWithOtp({
                  email,
                  options: {
                    emailRedirectTo: 'https://floweasy.run/auth/callback'
                  }
                });

                if (!resendError) {
                  toast({
                    title: "Link expirado",
                    description: "Um novo email de verificação foi enviado. Por favor, verifique sua caixa de entrada.",
                    duration: 6000
                  });
                  setTimeout(() => navigate('/auth'), 3000);
                  return;
                }
              }
              
              throw new Error('Link de verificação expirado. Por favor, faça login para receber um novo link.');
            }
            
            throw verifyError;
          }

          // Aguardar um momento para a sessão ser estabelecida
          console.log('Token verificado, aguardando estabelecimento da sessão...');
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Verificar se a sessão foi estabelecida
          const { data: { session: finalSession }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Erro ao verificar sessão final:', sessionError);
            throw new Error('Erro ao estabelecer sua sessão');
          }

          if (finalSession) {
            console.log('Sessão estabelecida com sucesso');
            navigate('/dashboard');
            return;
          }

          // Se ainda não temos sessão, tentar atualizar
          console.log('Tentando atualizar sessão...');
          const { error: refreshError } = await supabase.auth.refreshSession();
          
          if (!refreshError) {
            const { data: { session: refreshedSession } } = await supabase.auth.getSession();
            if (refreshedSession) {
              console.log('Sessão estabelecida após atualização');
              navigate('/dashboard');
              return;
            }
          }

          throw new Error('Não foi possível estabelecer sua sessão');

        } catch (error) {
          console.error('Erro detalhado na verificação:', error);
          throw error;
        }

      } catch (error) {
        console.error('Erro no processo de callback:', error);
        setError(error.message || 'Erro ao processar autenticação');
        toast({
          title: "Erro na verificação",
          description: error.message || 'Erro ao processar autenticação',
          variant: "destructive",
          duration: 6000
        });
        setTimeout(() => navigate('/auth'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, toast, isProcessing]);

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