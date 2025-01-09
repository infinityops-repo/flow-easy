import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase usando service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    console.log('Usuário autenticado:', user.id)

    // Criar assinatura
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
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
    const { error: usageError } = await supabaseAdmin
      .from('usage_logs')
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        workflows_used: 0,
        period_start: new Date(new Date().setDate(1)).toISOString(),
        period_end: new Date(new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0)).toISOString()
      })

    if (usageError) {
      console.error('Erro ao criar log de uso:', usageError)
      throw usageError
    }

    console.log('Log de uso criado com sucesso')

    return new Response(
      JSON.stringify({ status: 'success', subscription }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}) 