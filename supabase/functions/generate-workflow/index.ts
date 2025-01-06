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
              // Discord node parameters
              "channel": "string",         // Required for Discord nodes
              "text": "string",            // Required for Discord nodes
              "webhookUrl": "string",      // Required for Discord nodes
              
              // HTTP node parameters
              "url": "string",             // Required for HTTP nodes
              "method": "string",          // Required for HTTP nodes (GET, POST, etc)
              "authentication": "string",   // Optional for HTTP nodes
              "headers": {},               // Optional for HTTP nodes
              
              // Telegram node parameters
              "chatId": "string",          // Required for Telegram nodes
              "text": "string",            // Required for Telegram nodes
              "additionalFields": {},      // Optional for Telegram nodes
              
              // Schedule node parameters
              "mode": "string",            // Required for Schedule nodes (e.g. "timeInterval")
              "interval": [1, "minutes"],  // Required for Schedule nodes with timeInterval mode
              
              // Email node parameters
              "fromEmail": "string",       // Required for Email nodes
              "toEmail": "string",         // Required for Email nodes
              "subject": "string",         // Required for Email nodes
              "text": "string",            // Required for Email nodes
              
              // Database node parameters
              "table": "string",           // Required for Database nodes
              "operation": "string",       // Required for Database nodes (e.g. "select", "insert")
              
              // Function node parameters
              "code": "string",            // Required for Function nodes (JavaScript code)
              
              // JSON node parameters
              "mode": "string",            // Required for JSON nodes (e.g. "parse", "stringify")
              "property": "string",        // Required for JSON nodes
              
              // Any other node-specific parameters should be included based on the node type
            },
            "name": "string",
            "type": "string",             // MUST use exact node types:
                                         // - "n8n-nodes-base.discord" for Discord
                                         // - "n8n-nodes-base.telegram" for Telegram
                                         // - "n8n-nodes-base.httpRequest" for HTTP
                                         // - "n8n-nodes-base.schedule" for Schedule
                                         // - "n8n-nodes-base.emailSend" for Email
                                         // - "n8n-nodes-base.postgres" for PostgreSQL
                                         // - "n8n-nodes-base.function" for Function
                                         // - "n8n-nodes-base.set" for Set
                                         // - "n8n-nodes-base.if" for If
                                         // - "n8n-nodes-base.switch" for Switch
                                         // - "n8n-nodes-base.json" for JSON
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
      1. ALWAYS use the correct node type prefix "n8n-nodes-base." followed by the specific node name
      2. Include ALL required parameters for the specific node type you're using
      3. Make sure parameter values match the expected format (strings, numbers, arrays, etc)
      4. All node IDs must be unique UUIDs
      5. Position coordinates should be reasonable numbers (e.g., [100, 200])
      6. Return ONLY the JSON, no explanations
      7. For HTTP requests getting data, always include proper error handling
      8. When connecting to external services (Discord, Telegram, etc), ensure all required authentication parameters are included
      9. For trigger nodes (like Schedule), ensure they are properly configured as the first node
      10. For conditional nodes (If, Switch), ensure proper connection structure in the connections object
      11. ANALYZE THE USER'S REQUEST CAREFULLY to determine which nodes are needed
      12. USE THE MOST APPROPRIATE NODE for the task - don't default to HTTP if a specialized node exists` :
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
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let workflow = null;
    
    try {
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

          // Validate node type format
          if (!node.type.startsWith('n8n-nodes-base.')) {
            console.error('Invalid node type format:', node.type);
            throw new Error('Invalid node type format - must start with n8n-nodes-base.');
          }

          // Validate required parameters based on node type
          const nodeType = node.type.replace('n8n-nodes-base.', '');
          
          switch (nodeType) {
            case 'discord':
              if (!node.parameters.channel || !node.parameters.text || !node.parameters.webhookUrl) {
                throw new Error('Missing required Discord node parameters');
              }
              break;
            case 'telegram':
              if (!node.parameters.chatId || !node.parameters.text) {
                throw new Error('Missing required Telegram node parameters');
              }
              break;
            case 'httpRequest':
              if (!node.parameters.url || !node.parameters.method) {
                throw new Error('Missing required HTTP node parameters');
              }
              break;
            case 'schedule':
              if (!node.parameters.mode) {
                throw new Error('Missing required Schedule node parameters');
              }
              break;
            case 'emailSend':
              if (!node.parameters.fromEmail || !node.parameters.toEmail || !node.parameters.subject) {
                throw new Error('Missing required Email node parameters');
              }
              break;
            // Add more node type validations as needed
          }
        });
      }
    } catch (parseError) {
      console.error('Error parsing or validating workflow:', parseError);
      throw new Error(`Failed to generate valid workflow JSON: ${parseError.message}`);
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