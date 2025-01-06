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

    const systemPrompt = platform === 'n8n' ? 
      `You are an expert n8n workflow creator. Create a workflow that accomplishes the user's goal.
      Your response must be a valid n8n workflow JSON object with this exact structure:
      {
        "name": "string",
        "nodes": [
          {
            "parameters": {
              // For Telegram nodes:
              "chatId": "string",
              "text": "string"
              // For HTTP nodes:
              "url": "string",
              "method": "string"
            },
            "name": "string",
            "type": "string", // MUST be "n8n-nodes-base.telegram" for Telegram nodes
            "typeVersion": 1,
            "position": [number, number],
            "id": "string"
          }
        ],
        "connections": {
          "Node Name": {
            "main": [
              [
                {
                  "node": "string",
                  "type": "main",
                  "index": 0
                }
              ]
            ]
          }
        },
        "active": true,
        "settings": {},
        "tags": [],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "versionId": "string"
      }
      
      IMPORTANT RULES:
      1. For Telegram nodes, ALWAYS use "n8n-nodes-base.telegram" as the type
      2. For HTTP Request nodes, ALWAYS use "n8n-nodes-base.httpRequest" as the type
      3. All node IDs must be unique UUIDs
      4. Position coordinates should be reasonable numbers (e.g., [100, 200])
      5. Return ONLY the JSON, no explanations` :
      `You are an expert Make.com workflow creator. Create a workflow that accomplishes the user's goal.
      Your response must be a valid Make.com workflow JSON object.`;

    console.log('Making request to OpenAI with prompt:', prompt);

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
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: `Create a workflow for: ${prompt}. Return ONLY the JSON, no explanations.` 
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
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let workflow = null;
    
    try {
      // Extract the JSON from the response and parse it
      const workflowText = data.choices[0].message.content.trim();
      console.log('Workflow text:', workflowText);
      
      workflow = JSON.parse(workflowText);
      console.log('Parsed workflow:', workflow);
      
      // Validate n8n specific structure
      if (platform === 'n8n') {
        if (!workflow.nodes || !workflow.connections || !Array.isArray(workflow.nodes)) {
          console.error('Invalid workflow structure:', workflow);
          throw new Error('Invalid n8n workflow structure');
        }

        // Validate each node
        workflow.nodes.forEach(node => {
          if (!node.type || !node.parameters || !node.id || !node.position) {
            console.error('Invalid node structure:', node);
            throw new Error('Invalid node structure');
          }

          // Validate Telegram node type if present
          if (node.type.includes('telegram') && node.type !== 'n8n-nodes-base.telegram') {
            console.error('Invalid Telegram node type:', node.type);
            throw new Error('Invalid Telegram node type');
          }
        });
      }
    } catch (parseError) {
      console.error('Error parsing or validating workflow:', parseError);
      throw new Error('Failed to generate valid workflow JSON');
    }

    // Generate a shareable URL
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