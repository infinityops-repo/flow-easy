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
      throw new Error('Prompt and platform are required');
    }

    console.log('Processing request:', { prompt, platform });

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
            content: `Create a workflow for: ${prompt}. Analyze the request carefully and use the most appropriate nodes. Return ONLY the JSON, no explanations.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let workflow = null;
    
    try {
      const workflowText = data.choices[0].message.content.trim();
      console.log('Parsing workflow JSON');
      
      workflow = JSON.parse(workflowText);
      console.log('Validating workflow structure');
      
      validateWorkflow(workflow, platform);
      
      // Generate a shareable URL
      const shareableUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(workflow, null, 2))}`;

      return new Response(
        JSON.stringify({ workflow, shareableUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error processing workflow:', error);
      throw new Error(`Failed to generate valid workflow JSON: ${error.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});