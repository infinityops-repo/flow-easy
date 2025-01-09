import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parse } from "https://deno.land/x/json5@v1.0.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { validateMakeWorkflow, validateN8nWorkflow } from "./workflowValidator.ts";
import { buildMakePrompt, buildN8nPrompt } from "./promptBuilder.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, platform } = await req.json();
    console.log('==================== STARTING WORKFLOW GENERATION ====================');
    console.log('Request received:', { prompt, platform });

    // Get the authentication token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Authentication token not found');
      throw new Error('User not authenticated');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create a new Supabase client with the user's token
    const userSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify if the user is authenticated
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user?.id) {
      console.error('Error getting user:', userError);
      throw new Error('User not authenticated');
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    if (!['n8n', 'make'].includes(platform)) {
      throw new Error('Invalid platform');
    }

    // Verify if exists in cache
    const { data: cachedWorkflow, error: cacheError } = await supabase
      .from('workflow_cache')
      .select('workflow')
      .eq('prompt', prompt)
      .eq('platform', platform)
      .single();

    console.log('==================== CACHE VERIFICATION ====================');
    console.log('Cache error:', cacheError);
    console.log('Cache data:', cachedWorkflow);

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Error verifying cache:', cacheError);
    }

    if (cachedWorkflow?.workflow) {
      console.log('==================== WORKFLOW FOUND IN CACHE ====================');
      console.log('Workflow type:', typeof cachedWorkflow.workflow);
      console.log('Workflow from cache:', JSON.stringify(cachedWorkflow.workflow, null, 2));
      return new Response(
        JSON.stringify({ 
          workflow: cachedWorkflow.workflow,
          shareableUrl: null,
          fromCache: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    console.log('==================== GENERATING NEW WORKFLOW ====================');
    const systemPrompt = platform === 'make' ? buildMakePrompt() : buildN8nPrompt();
    console.log('System prompt:', systemPrompt);
    
    console.log('==================== CALLING OPENAI ====================');
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

    console.log('==================== OPENAI RESPONSE ====================');
    console.log('Status:', completion.status);
    console.log('Status text:', completion.statusText);

    if (!completion.ok) {
      const error = await completion.text();
      console.error('OpenAI API error:', error);
      console.error('OpenAI API status:', completion.status);
      console.error('OpenAI API statusText:', completion.statusText);

      try {
        const errorJson = JSON.parse(error);
        console.log('Error JSON:', errorJson);
        if (errorJson.error?.code === 'insufficient_quota') {
          throw new Error('Request limit reached. Please try again later.');
        }
      } catch (e) {
        console.error('Error parsing OpenAI error:', e);
      }
      
      throw new Error(`Error calling OpenAI API: ${completion.status} - ${completion.statusText}`);
    }

    const response = await completion.json();
    console.log('==================== PROCESSING RESPONSE ====================');
    console.log('Full response:', JSON.stringify(response, null, 2));
    
    if (!response.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response:', response);
      throw new Error('Invalid API response');
    }

    try {
      const content = response.choices[0].message.content.trim();
      console.log('==================== PARSING WORKFLOW ====================');
      console.log('Raw content:', content);
      
      const jsonMatch = content.match(/```(?:json)?\n?(.*?)\n?```/s);
      const rawWorkflow = jsonMatch ? jsonMatch[1].trim() : content.trim();
      console.log('Workflow without markdown:', rawWorkflow);

      try {
        const parsedWorkflow = JSON.parse(rawWorkflow.replace(/^\s*```\s*|\s*```\s*$/g, ''));
        console.log('==================== WORKFLOW PARSED ====================');
        console.log('Workflow structured:', JSON.stringify(parsedWorkflow, null, 2));
        
        console.log('==================== WORKFLOW DETAILS ====================');
        console.log('Node types:', parsedWorkflow.nodes.map(node => node.type));
        console.log('Node parameters:', parsedWorkflow.nodes.map(node => ({
          name: node.name,
          parameters: node.parameters
        })));
        console.log('Connection structure:', Object.keys(parsedWorkflow.connections).map(key => ({
          from: key,
          to: parsedWorkflow.connections[key].main.flat().map(conn => conn.node)
        })));

        console.log('==================== WORKFLOW VALIDATION ====================');
        console.log('Checking required nodes...');
        console.log('Checking required connections...');
        console.log('Checking required parameters...');

        if (platform === 'make') {
          validateMakeWorkflow(parsedWorkflow);
        } else {
          validateN8nWorkflow(parsedWorkflow);
        }
        console.log('Validation completed successfully');

        console.log('==================== WORKFLOW VALIDATION RESULT ====================');
        console.log('Valid nodes:', parsedWorkflow.nodes.length > 0);
        console.log('Valid connections:', Object.keys(parsedWorkflow.connections).length > 0);
        console.log('Valid parameters:', parsedWorkflow.nodes.every(node => node.parameters !== undefined));

        console.log('==================== PROCESSING CONNECTIONS ====================');
        if (parsedWorkflow.connections) {
          Object.keys(parsedWorkflow.connections).forEach(key => {
            const connection = parsedWorkflow.connections[key];
            if (connection.main) {
              connection.main = connection.main.map((mainArr: any[]) => 
                mainArr.map((conn: any) => {
                  if (conn && typeof conn === 'object') {
                    return {
                      node: conn.node || '',
                      type: conn.type || 'main',
                      index: conn.index || 0
                    };
                  }
                  return conn;
                })
              );
            }
          });
        }
        console.log('Processed connections:', JSON.stringify(parsedWorkflow.connections, null, 2));

        console.log('==================== SAVING TO CACHE ====================');
        const { error: cacheError } = await supabase
          .from('workflow_cache')
          .insert([{
            prompt,
            platform,
            workflow: parsedWorkflow
          }]);

        if (cacheError) {
          console.error('Error saving to cache:', cacheError);
        } else {
          console.log('Workflow successfully saved to cache');
        }

        console.log('==================== SAVING TO PROJECTS ====================');
        
        // Try to save to projects with retry
        let retryCount = 0;
        const maxRetries = 3;
        let projectError;
        
        while (retryCount < maxRetries) {
          const { error } = await userSupabase
            .from('projects')
            .insert([{
              user_id: user.id,
              title: prompt.substring(0, 50),
              image: "https://placehold.co/600x400",
              prompt: prompt,
              workflow: parsedWorkflow,
              platform,
              is_private: true
            }]);
            
          if (!error) {
            console.log('Workflow successfully saved to projects');
            projectError = null;
            break;
          }
          
          projectError = error;
          console.error(`Attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }

        if (projectError) {
          console.error('Error saving to projects after all attempts:', projectError);
          throw projectError;
        }

        console.log('==================== PREPARING RESPONSE ====================');
        const response = {
          workflow: parsedWorkflow,
          shareableUrl: null,
          fromCache: false
        };
        console.log('Final response:', JSON.stringify(response, null, 2));

    return new Response(
          JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
      } catch (parseError) {
        console.error('==================== PARSE/VALIDATION ERROR ====================');
        console.error('Error:', parseError);
        console.error('Stack:', parseError.stack);
        throw new Error('Invalid workflow format. Please try again.');
      }
    } catch (e) {
      console.error('==================== GENERAL ERROR ====================');
      console.error('Error:', e);
      console.error('Stack:', e.stack);
      console.error('Raw content:', response.choices[0].message.content);
      throw new Error('Invalid workflow format. Please try again.');
    }

  } catch (error) {
    console.error('==================== REQUEST ERROR ====================');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});