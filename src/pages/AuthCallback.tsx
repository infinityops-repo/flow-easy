import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Verificar se há erro no hash da URL
        const hash = window.location.hash;
        if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
          setError('O link de confirmação expirou ou é inválido');
          toast({
            title: "Link inválido",
            description: "O link de confirmação expirou ou é inválido. Por favor, faça login para receber um novo link.",
            variant: "destructive",
            duration: 6000
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Obter a sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao verificar sessão:', sessionError);
          setError('Erro ao verificar sua sessão');
          toast({
            title: "Erro",
            description: "Houve um erro ao verificar sua sessão. Por favor, tente fazer login novamente.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        if (!session) {
          console.log('Nenhuma sessão encontrada, redirecionando para login');
          setError('Sessão não encontrada');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Se chegou aqui, temos uma sessão válida
        console.log('Sessão válida encontrada, redirecionando para dashboard');
        navigate('/dashboard');
        
      } catch (error) {
        console.error('Erro no callback:', error);
        setError('Erro ao processar autenticação');
        toast({
          title: "Erro",
          description: "Houve um erro ao processar sua autenticação. Por favor, tente fazer login novamente.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9b87f5] to-[#1EAEDB] flex items-center justify-center animate-pulse">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl text-white">
        {error || 'Verificando autenticação...'}
      </h2>
    </div>
  );
};

export default AuthCallback; 