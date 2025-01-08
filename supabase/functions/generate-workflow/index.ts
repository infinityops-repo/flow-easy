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

      try {
        // Valida o JSON
        const parsedWorkflow = JSON.parse(rawWorkflow);
        
        // Valida o workflow baseado na plataforma
        if (platform === 'make') {
          validateMakeWorkflow(parsedWorkflow);
        } else {
          validateN8nWorkflow(parsedWorkflow);
        }

        // Retorna o workflow validado
        workflow = rawWorkflow;
      } catch (parseError) {
        console.error('Parse/Validation error:', parseError);
        throw new Error('Formato de workflow inválido. Por favor, tente novamente.');
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
    } catch (e) {
      console.error('Error:', e);
      console.error('Raw content:', response.choices[0].message.content);
      throw new Error('Formato de workflow inválido. Por favor, tente novamente.');
    }

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