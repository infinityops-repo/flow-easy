import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parse } from "https://deno.land/x/json5@v1.0.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { validateMakeWorkflow, validateN8nWorkflow } from "./workflowValidator.ts";
import { buildMakePrompt, buildN8nPrompt } from "./promptBuilder.ts";

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, platform } = await req.json();
    console.log('Received request:', { prompt, platform });

    if (!prompt) {
      throw new Error('Prompt é obrigatório');
    }

    if (!['n8n', 'make'].includes(platform)) {
      throw new Error('Plataforma inválida');
    }

    const systemPrompt = platform === 'make' ? buildMakePrompt() : buildN8nPrompt();
    
    console.log('Sending request to OpenAI...');
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: systemPrompt 
          },
          { 
            role: "user", 
            content: `Create a workflow that: ${prompt}. Remember to include all required fields and at least 2 modules/nodes with proper connections.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!completion.ok) {
      const error = await completion.text();
      console.error('OpenAI API error:', error);
      console.error('OpenAI API status:', completion.status);
      console.error('OpenAI API statusText:', completion.statusText);

      try {
        const errorJson = JSON.parse(error);
        if (errorJson.error?.code === 'insufficient_quota') {
          throw new Error('Limite de requisições atingido. Por favor, tente novamente mais tarde.');
        }
      } catch (e) {
        // Se não conseguir parsear o JSON, usa a mensagem genérica
      }
      
      throw new Error(`Erro ao chamar OpenAI API: ${completion.status} - ${completion.statusText}`);
    }

    const response = await completion.json();
    console.log('OpenAI response received');
    
    if (!response.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response:', response);
      throw new Error('Resposta inválida da API');
    }

    let workflow;
    try {
      const content = response.choices[0].message.content.trim();
      console.log('Raw OpenAI response:', content);
      
      // Remove os blocos de código markdown se existirem
      const jsonMatch = content.match(/```json\n?(.*)\n?```/s);
      const rawWorkflow = jsonMatch ? jsonMatch[1].trim() : content;

      // Limpa o JSON removendo caracteres de escape
      workflow = rawWorkflow
        .replace(/\\n/g, '')
        .replace(/\\"/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
      
      return new Response(
        JSON.stringify({ 
          workflow,
          shareableUrl: null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (e) {
      console.error('Error:', e);
      console.error('Raw content:', response.choices[0].message.content);
      throw new Error('Formato de workflow inválido. Por favor, tente novamente.');
    }

    try {
      // Validate the workflow based on platform
      if (platform === 'make') {
        validateMakeWorkflow(workflow);
      } else {
        validateN8nWorkflow(workflow);
      }
    } catch (e) {
      console.error('Validation error:', e, 'Workflow:', workflow);
      throw e;
    }

    return new Response(
      JSON.stringify({ 
        workflow,
        shareableUrl: null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});