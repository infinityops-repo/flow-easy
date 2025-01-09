import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

const Auth = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/")
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          toast({
            title: "Successfully logged in",
            description: "Welcome back!",
          })
          navigate("/")
        } else if (event === "SIGNED_OUT") {
          navigate("/auth")
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate, toast])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#9b87f5] to-[#1EAEDB]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-2xl tracking-tight">
              Flow<span className="text-[#9b87f5]">Easy</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold gradient-text">
            Welcome to FlowEasy
          </h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to start creating your workflows
          </p>
        </div>

        <div className="glass-card p-6">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#9b87f5',
                    brandAccent: '#1EAEDB',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full',
                anchor: 'text-[#9b87f5] hover:text-[#1EAEDB]',
                message: 'text-red-500',
              },
            }}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign in',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Choose a password',
                  button_label: 'Create account',
                  loading_button_label: 'Creating account...',
                  social_provider_text: 'Create account with {{provider}}',
                  link_text: 'Don\'t have an account? Sign up',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Auth