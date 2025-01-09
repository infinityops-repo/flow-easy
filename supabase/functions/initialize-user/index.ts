import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Iniciando inicialização do usuário...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (authError) {
      console.error('Erro de autenticação:', authError)
      throw new Error('Unauthorized')
    }

    if (!user) {
      console.error('Usuário não encontrado')
      throw new Error('User not found')
    }

    console.log('Usuário autenticado:', user.id)

    // Criar assinatura
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: 'free'
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('Erro ao criar assinatura:', subscriptionError)
      throw subscriptionError
    }

    console.log('Assinatura criada:', subscription.id)

    // Criar log de uso
    const { error: usageError } = await supabaseClient
      .from('usage_logs')
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        period_start: new Date(new Date().setDate(1)),
        period_end: new Date(new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0))
      })

    if (usageError) {
      console.error('Erro ao criar log de uso:', usageError)
      throw usageError
    }

    console.log('Log de uso criado com sucesso')

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro durante a inicialização do usuário:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 