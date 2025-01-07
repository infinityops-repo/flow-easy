import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { validateMakeWorkflow, validateN8nWorkflow } from "./workflowValidator.ts";
import { buildMakePrompt, buildN8nPrompt } from "./promptBuilder.ts";

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, platform } = await req.json();

    if (!prompt) {
      throw new Error('Prompt é obrigatório');
    }

    if (!['n8n', 'make'].includes(platform)) {
      throw new Error('Plataforma inválida');
    }

    const systemPrompt = platform === 'make' ? buildMakePrompt() : buildN8nPrompt();
    
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const response = await completion.json();
    
    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Resposta inválida da API');
    }

    let workflow;
    try {
      workflow = JSON.parse(response.choices[0].message.content);
    } catch (e) {
      console.error('Erro ao fazer parse do JSON:', e);
      throw new Error('Formato de workflow inválido');
    }

    // Validar o workflow gerado
    if (platform === 'make') {
      validateMakeWorkflow(workflow);
    } else {
      validateN8nWorkflow(workflow);
    }

    return new Response(
      JSON.stringify({ workflow }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});