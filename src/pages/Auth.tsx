import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FormEvent extends Event {
  preventDefault(): void;
}

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const isSignUp = searchParams.get('mode') === 'signup';
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const hash = window.location.hash;
      if (hash.includes('error=access_denied') && hash.includes('error_code=otp_expired')) {
        toast({
          title: "Link expirado",
          description: "O link de confirmação expirou. Por favor, faça login para receber um novo link.",
          variant: "destructive",
          duration: 6000
        });
        window.location.hash = '';
        return;
      }

      console.log('Checking auth session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      if (session) {
        console.log('Session found, redirecting to dashboard...');
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Por favor, insira seu email para receber um novo link de confirmação.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'https://floweasy.run/auth/callback'
        }
      });

      if (error) throw error;

      toast({
        title: "Email reenviado",
        description: "Um novo link de confirmação foi enviado para seu email.",
        duration: 5000
      });
    } catch (err) {
      console.error('Erro ao reenviar email:', err);
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o email de confirmação. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Iniciando processo de autenticação...', {
        mode: isSignUp ? 'signup' : 'login',
        email
      });
      
      if (isSignUp) {
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        console.log('Criando novo usuário...');
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://floweasy.run/auth/callback',
            data: {
              email_confirm_sent_at: new Date().toISOString()
            }
          }
        });

        if (signUpError) {
          console.error('Erro detalhado no signup:', {
            error: signUpError,
            code: signUpError.code,
            message: signUpError.message,
            details: signUpError.details
          });

          if (signUpError.message.includes('User already registered')) {
            const { error: signInError } = await supabase.auth.signInWithOtp({
              email,
              options: {
                emailRedirectTo: 'https://floweasy.run/auth/callback'
              }
            });

            if (signInError) {
              console.error('Erro ao enviar email de verificação:', signInError);
              throw new Error('Não foi possível enviar o email de verificação. Por favor, tente novamente mais tarde.');
            }

            toast({
              title: "Email já cadastrado",
              description: "Enviamos um novo link de verificação para seu email. Por favor, verifique sua caixa de entrada e spam.",
              duration: 8000
            });

            setEmail('');
            setPassword('');
            return;
          }

          throw signUpError;
        }

        if (!authData.user) {
          console.error('Usuário não criado após signup bem-sucedido');
          throw new Error('Erro ao criar usuário');
        }

        console.log('Usuário criado com sucesso:', {
          id: authData.user.id,
          email: authData.user.email,
          confirmationSent: authData.user.confirmation_sent_at
        });

          toast({
          title: "Conta criada com sucesso!",
          description: "Por favor, verifique seu email para confirmar sua conta. O link de confirmação expira em 24 horas.",
          duration: 10000
        });

        setEmail('');
        setPassword('');
        return;

      } else {
        console.log('Iniciando processo de login...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('Erro detalhado no login:', {
            error: signInError,
            code: signInError.code,
            message: signInError.message,
            details: signInError.details
          });
          throw signInError;
        }

        console.log('Login realizado com sucesso:', {
          userId: signInData.user?.id,
          email: signInData.user?.email,
          session: signInData.session?.access_token ? 'Presente' : 'Ausente'
        });
      }

      navigate('/dashboard');

    } catch (err) {
      console.error('Erro detalhado na autenticação:', {
        error: err,
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      if (err.message.includes('Email not confirmed')) {
        setError('Por favor confirme seu email antes de fazer login');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Email ou senha inválidos');
      } else if (err.message.includes('Email rate limit exceeded')) {
        setError('Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9b87f5] to-[#1EAEDB] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
        <span className="text-2xl font-bold">
              Flow<span className="text-[#9b87f5]">Easy</span>
            </span>
          </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-white">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            {isSignUp ? 'Enter your email to create your account' : 'Enter your email to sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
        </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
                {error.includes('Email not confirmed') && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    className="ml-2 text-[#9b87f5] hover:text-[#8b77e5]"
                  >
                    Reenviar email de confirmação
                  </button>
                )}
        </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[#9b87f5] hover:bg-[#8b77e5] text-white"
              disabled={loading}
            >
              {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(isSignUp ? '/auth' : '/auth?mode=signup')}
              className="text-[#9b87f5] hover:text-[#8b77e5] text-sm"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
      </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;