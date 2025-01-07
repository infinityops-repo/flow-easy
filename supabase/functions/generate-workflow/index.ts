import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { corsHeaders } from "../_shared/cors.ts"
import { validateMakeWorkflow, validateN8nWorkflow } from "./workflowValidator.ts"
import { buildMakePrompt, buildN8nPrompt } from "./promptBuilder.ts"

const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const { prompt, platform } = await req.json()

    if (!prompt) {
      throw new Error('Prompt é obrigatório')
    }

    if (!['n8n', 'make'].includes(platform)) {
      throw new Error('Plataforma inválida')
    }

    const systemPrompt = platform === 'make' ? buildMakePrompt() : buildN8nPrompt()
    
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    })

    const response = await completion.json()
    
    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Resposta inválida da API')
    }

    let workflow
    try {
      workflow = JSON.parse(response.choices[0].message.content)
    } catch (e) {
      console.error('Erro ao fazer parse do JSON:', e)
      throw new Error('Formato de workflow inválido')
    }

    // Validar o workflow gerado
    if (platform === 'make') {
      validateMakeWorkflow(workflow)
    } else {
      validateN8nWorkflow(workflow)
    }

    // Salvar o workflow no banco de dados
    const { data: { user } } = await supabase.auth.getUser(req.headers.get('Authorization')?.split('Bearer ')[1] || '')
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data: workflowData, error: workflowError } = await supabase
      .from('workflows')
      .insert([
        {
          title: `Workflow ${platform} - ${new Date().toLocaleString()}`,
          description: prompt,
          nodes: workflow.nodes || {},
          connections: workflow.connections || {},
          user_id: user.id,
        }
      ])
      .select()
      .single()

    if (workflowError) {
      throw workflowError
    }

    return new Response(
      JSON.stringify({
        workflow,
        shareableUrl: `${supabaseUrl}/storage/v1/object/public/workflows/${workflowData.id}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})