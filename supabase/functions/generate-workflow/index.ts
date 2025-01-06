import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const systemPrompt = `You are an expert automation workflow creator for ${platform}. 
    Create a workflow that accomplishes the user's goal. 
    Your response must be a valid JSON object with the following structure:
    {
      "name": "workflow name",
      "description": "brief description",
      "nodes": [
        {
          "id": "unique node id",
          "type": "node type (trigger, action, etc)",
          "name": "node name",
          "parameters": { node specific parameters }
        }
      ],
      "connections": [
        {
          "sourceNode": "source node id",
          "targetNode": "target node id"
        }
      ]
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
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
    const workflowText = data.choices[0].message.content;
    
    // Parse the response to ensure it's valid JSON
    const workflow = JSON.parse(workflowText);

    // Generate a shareable URL (you can implement storage later)
    const shareableUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(workflow, null, 2))}`;

    return new Response(
      JSON.stringify({ workflow, shareableUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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