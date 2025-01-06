import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "./promptBuilder.ts";
import { validateWorkflow } from "./workflowValidator.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, platform } = await req.json();

    if (!prompt || !platform) {
      throw new Error('Prompt e plataforma são obrigatórios');
    }

    console.log('Processando solicitação:', { prompt, platform });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: buildSystemPrompt(platform)
          },
          { 
            role: 'user', 
            content: `Crie um workflow para: ${prompt}. Retorne APENAS o objeto JSON do workflow.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na API do OpenAI:', errorData);
      throw new Error(`Erro na API do OpenAI: ${errorData}`);
    }

    const data = await response.json();
    console.log('Resposta do OpenAI recebida');

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Resposta inválida do OpenAI');
    }

    let workflow = null;
    
    try {
      const workflowText = data.choices[0].message.content.trim();
      console.log('Workflow gerado:', workflowText);
      
      workflow = JSON.parse(workflowText);
      console.log('Validando estrutura do workflow');
      
      validateWorkflow(workflow, platform);
      
      const shareableUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(workflow, null, 2))}`;

      return new Response(
        JSON.stringify({ workflow, shareableUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Erro ao processar workflow:', error);
      throw new Error(`Falha ao gerar JSON válido do workflow: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});