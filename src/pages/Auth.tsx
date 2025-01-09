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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          console.error('Signup error:', error);
          let errorMessage = "Ocorreu um erro durante o cadastro.";
          
          if (error.message.includes("database")) {
            errorMessage = "Erro ao salvar os dados do usuário. Por favor, tente novamente.";
          } else if (error.message.includes("password")) {
            errorMessage = "A senha deve ter pelo menos 6 caracteres.";
          } else if (error.message.includes("email")) {
            errorMessage = "Por favor, forneça um email válido.";
          }
          
          throw new Error(errorMessage);
        }
        toast({
          title: "Sucesso",
          description: "Verifique seu email para confirmar o cadastro.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error('Login error:', error);
          let errorMessage = "Ocorreu um erro durante o login.";
          
          if (error.message.includes("Invalid login credentials")) {
            errorMessage = "Email ou senha incorretos.";
          }
          
          throw new Error(errorMessage);
        }
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
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
            {isSignUp ? 'Criar uma conta' : 'Bem-vindo de volta'}
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            {isSignUp ? 'Digite seu email para criar sua conta' : 'Digite seu email para entrar na sua conta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#9b87f5] hover:bg-[#8b77e5] text-white"
              disabled={loading}
            >
              {loading ? 'Carregando...' : isSignUp ? 'Criar conta' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(isSignUp ? '/auth' : '/auth?mode=signup')}
              className="text-[#9b87f5] hover:text-[#8b77e5] text-sm"
            >
              {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem uma conta? Crie uma'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;