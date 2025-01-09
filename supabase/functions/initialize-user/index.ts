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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Criar assinatura
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: 'free'
      })
      .select()
      .single()

    if (subscriptionError) throw subscriptionError

    // Criar log de uso
    const { error: usageError } = await supabaseClient
      .from('usage_logs')
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        period_start: new Date(new Date().setDate(1)),
        period_end: new Date(new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0))
      })

    if (usageError) throw usageError

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 