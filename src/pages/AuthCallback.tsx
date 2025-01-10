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
          email: email ? `${email.substring(0, 3)}...` : null,
          fullUrl: window.location.href
        });

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
          console.log('Iniciando processo de verificação do token');
          
          // Determinar o tipo de verificação
          const verificationType = type || 'signup';
          console.log('Tipo de verificação:', verificationType);
          
          try {
            // Verificar se o token tem o formato esperado
            if (token.length < 32) {
              console.error('Token inválido: comprimento incorreto');
              throw new Error('Link de verificação inválido. Por favor, solicite um novo email.');
            }

            // Tentar verificar o token diretamente com a API do Supabase
            const response = await fetch(`https://juaeaocrdoaxwuybjkkv.supabase.co/auth/v1/verify?token=${token}&type=${verificationType}&redirect_to=https://floweasy.run/auth/callback`, {
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

            // Se for redirecionamento (303), verificar o conteúdo antes de prosseguir
            if (response.status === 303) {
              const redirectUrl = response.headers.get('location');
              console.log('URL de redirecionamento:', redirectUrl);

              if (redirectUrl) {
                // Aguardar um momento antes de verificar a sessão
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Verificar se a sessão foi estabelecida
                const { data: { session: finalSession }, error: sessionError } = await supabase.auth.getSession();

                if (finalSession) {
                  console.log('Sessão estabelecida após redirecionamento');
                  navigate('/dashboard');
                  return;
                }

                // Se não temos sessão após o redirecionamento, tentar signInWithOtp
                if (email) {
                  console.log('Tentando signInWithOtp após redirecionamento');
                  const { error: signInError } = await supabase.auth.signInWithOtp({
                    email,
                    token,
                    type: verificationType
                  });

                  if (signInError) {
                    console.error('Erro no signInWithOtp:', signInError);
                    throw signInError;
                  }

                  // Aguardar novamente pela sessão
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  const { data: { session: finalSession2 } } = await supabase.auth.getSession();

                  if (finalSession2) {
                    console.log('Sessão estabelecida após signInWithOtp');
                    navigate('/dashboard');
                    return;
                  }
                }
              }
            }

            // Se não for redirecionamento ou não conseguiu estabelecer sessão
            if (!response.ok) {
              const text = await response.text();
              console.error('Erro na resposta:', text);

              if (text.includes('token not found') || text.includes('expired')) {
                if (email) {
                  console.log('Token inválido/expirado, reenviando email');
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
              throw new Error('Erro ao verificar email');
            }

          } catch (error) {
            console.error('Erro detalhado na verificação:', error);
            throw error;
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