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

        console.log('Parâmetros da URL:', {
          token: token ? `${token.substring(0, 10)}...` : null,
          type,
          error,
          errorDescription,
          email: email ? `${email.substring(0, 3)}...` : null
        });

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

        // Verificar token
        if (!token) {
          console.log('Nenhum token encontrado');
          if (email) {
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
          } else {
            throw new Error('Link de verificação inválido');
          }
          
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        try {
          console.log('Iniciando verificação do token');
          
          // Tentar verificar com verifyOtp primeiro
          const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
            token,
            type: type as any || 'signup'
          });

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
            
            // Se não for erro de token, tentar signInWithOtp como fallback
            console.log('Tentando signInWithOtp como fallback');
            const { error: signInError } = await supabase.auth.signInWithOtp({
              email: email || '',
              token,
              type: 'signup'
            });

            if (signInError) {
              console.error('Erro no fallback signInWithOtp:', signInError);
              throw signInError;
            }
          }

          // Aguardar um momento para a sessão ser estabelecida
          console.log('Aguardando estabelecimento da sessão...');
          await new Promise(resolve => setTimeout(resolve, 3000));

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

          // Se chegou aqui sem sessão, tentar atualizar a sessão
          console.log('Tentando atualizar sessão...');
          const { error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Erro ao atualizar sessão:', refreshError);
            throw new Error('Não foi possível estabelecer sua sessão');
          }

          // Verificar sessão uma última vez
          const { data: { session: finalSession2 } } = await supabase.auth.getSession();
          
          if (finalSession2) {
            console.log('Sessão estabelecida após atualização');
            navigate('/dashboard');
            return;
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