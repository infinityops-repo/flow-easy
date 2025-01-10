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

        console.log('Parâmetros encontrados:', { token, type, error, errorDescription, email });

        if (error || errorDescription) {
          throw new Error(errorDescription || error || 'Erro na autenticação');
        }

        // Verificar se já existe uma sessão
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          console.log('Sessão já existe, redirecionando para dashboard');
          navigate('/dashboard');
          return;
        }

        if (!token && !email) {
          console.log('Nenhum token ou email encontrado');
          throw new Error('Link de verificação inválido');
        }

        // Se temos email mas não token, tentar reenviar o email
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

        // Se temos token, tentar verificar
        if (token) {
          console.log('Tentando verificar token...');
          
          // Determinar o tipo de verificação
          const verificationType = type === 'recovery' ? 'recovery' : 'signup';
          
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token,
            type: verificationType
          });

          if (verifyError) {
            console.error('Erro na verificação do token:', verifyError);
            
            // Se o token expirou ou não foi encontrado
            if (verifyError.message.includes('expired') || verifyError.message.includes('not found')) {
              if (email) {
                console.log('Token inválido, tentando reenviar verificação');
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
                  description: "O link anterior expirou. Enviamos um novo email de verificação para você.",
                  duration: 6000
                });

                setTimeout(() => navigate('/auth'), 3000);
                return;
              }
              
              throw new Error('O link de verificação expirou. Por favor, solicite um novo email.');
            }

            throw verifyError;
          }

          // Aguardar um momento para a sessão ser estabelecida
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verificar se a sessão foi estabelecida
          const { data: { session: finalSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Erro ao obter sessão:', sessionError);
            throw new Error('Erro ao estabelecer sua sessão');
          }
          
          if (finalSession) {
            console.log('Sessão estabelecida com sucesso');
            navigate('/dashboard');
            return;
          }
        }

        throw new Error('Não foi possível verificar sua conta');

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