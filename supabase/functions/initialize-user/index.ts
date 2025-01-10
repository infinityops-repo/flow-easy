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
    console.log('Iniciando inicialização do usuário...')
    
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
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header:', authHeader)
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader?.replace('Bearer ', '') ?? ''
    )

    if (authError) {
      console.error('Erro de autenticação:', authError)
      throw new Error(`Erro de autenticação: ${authError.message}`)
    }

    if (!user) {
      console.error('Usuário não encontrado')
      throw new Error('Usuário não encontrado')
    }

    console.log('Usuário autenticado:', user.id)

    // Verificar se já existe assinatura
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select()
      .eq('user_id', user.id)
      .single()

    if (existingSub) {
      console.log('Assinatura já existe:', existingSub.id)
      return new Response(
        JSON.stringify({ status: 'success', subscription: existingSub }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

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
      throw new Error(`Erro ao criar assinatura: ${subscriptionError.message}`)
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
      throw new Error(`Erro ao criar log de uso: ${usageError.message}`)
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
    console.error('Erro detalhado:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}) 