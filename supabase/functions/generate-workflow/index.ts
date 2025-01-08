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
    console.log('==================== INICIANDO GERAÇÃO DO WORKFLOW ====================');
    console.log('Request recebida:', { prompt, platform });

    // Obtém o token de autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Token de autorização não encontrado');
      throw new Error('Usuário não autenticado');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Cria um novo cliente Supabase com o token do usuário
    const userSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verifica se o usuário está autenticado
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user?.id) {
      console.error('Erro ao obter usuário:', userError);
      throw new Error('Usuário não autenticado');
    }

    if (!prompt) {
      throw new Error('Prompt é obrigatório');
    }

    if (!['n8n', 'make'].includes(platform)) {
      throw new Error('Plataforma inválida');
    }

    // Verifica se existe no cache
    const { data: cachedWorkflow, error: cacheError } = await supabase
      .from('workflow_cache')
      .select('workflow')
      .eq('prompt', prompt)
      .eq('platform', platform)
      .single();

    console.log('==================== VERIFICAÇÃO DE CACHE ====================');
    console.log('Cache error:', cacheError);
    console.log('Cache data:', cachedWorkflow);

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Erro ao verificar cache:', cacheError);
    }

    if (cachedWorkflow?.workflow) {
      console.log('==================== WORKFLOW ENCONTRADO NO CACHE ====================');
      console.log('Tipo do workflow:', typeof cachedWorkflow.workflow);
      console.log('Workflow do cache:', JSON.stringify(cachedWorkflow.workflow, null, 2));
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

    console.log('==================== GERANDO NOVO WORKFLOW ====================');
    const systemPrompt = platform === 'make' ? buildMakePrompt() : buildN8nPrompt();
    console.log('System prompt:', systemPrompt);
    
    console.log('==================== CHAMANDO OPENAI ====================');
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

    console.log('==================== RESPOSTA OPENAI ====================');
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
          throw new Error('Limite de requisições atingido. Por favor, tente novamente mais tarde.');
        }
      } catch (e) {
        console.error('Erro ao parsear erro da OpenAI:', e);
      }
      
      throw new Error(`Erro ao chamar OpenAI API: ${completion.status} - ${completion.statusText}`);
    }

    const response = await completion.json();
    console.log('==================== PROCESSANDO RESPOSTA ====================');
    console.log('Response completa:', JSON.stringify(response, null, 2));
    
    if (!response.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response:', response);
      throw new Error('Resposta inválida da API');
    }

    try {
      const content = response.choices[0].message.content.trim();
      console.log('==================== PARSEANDO WORKFLOW ====================');
      console.log('Conteúdo bruto:', content);
      
      const jsonMatch = content.match(/```(?:json)?\n?(.*?)\n?```/s);
      const rawWorkflow = jsonMatch ? jsonMatch[1].trim() : content.trim();
      console.log('Workflow sem markdown:', rawWorkflow);

      try {
        const parsedWorkflow = JSON.parse(rawWorkflow.replace(/^\s*```\s*|\s*```\s*$/g, ''));
        console.log('==================== WORKFLOW PARSEADO ====================');
        console.log('Workflow estruturado:', JSON.stringify(parsedWorkflow, null, 2));
        
        console.log('==================== DETALHES DO WORKFLOW ====================');
        console.log('Tipo dos nós:', parsedWorkflow.nodes.map(node => node.type));
        console.log('Parâmetros dos nós:', parsedWorkflow.nodes.map(node => ({
          name: node.name,
          parameters: node.parameters
        })));
        console.log('Estrutura das conexões:', Object.keys(parsedWorkflow.connections).map(key => ({
          from: key,
          to: parsedWorkflow.connections[key].main.flat().map(conn => conn.node)
        })));

        console.log('==================== VALIDAÇÃO DO WORKFLOW ====================');
        console.log('Checando nós obrigatórios...');
        console.log('Checando conexões obrigatórias...');
        console.log('Checando parâmetros obrigatórios...');

        if (platform === 'make') {
          validateMakeWorkflow(parsedWorkflow);
        } else {
          validateN8nWorkflow(parsedWorkflow);
        }
        console.log('Validação concluída com sucesso');

        console.log('==================== RESULTADO DA VALIDAÇÃO ====================');
        console.log('Nós válidos:', parsedWorkflow.nodes.length > 0);
        console.log('Conexões válidas:', Object.keys(parsedWorkflow.connections).length > 0);
        console.log('Parâmetros válidos:', parsedWorkflow.nodes.every(node => node.parameters !== undefined));

        console.log('==================== PROCESSANDO CONEXÕES ====================');
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
        console.log('Conexões processadas:', JSON.stringify(parsedWorkflow.connections, null, 2));

        console.log('==================== SALVANDO NO CACHE ====================');
        const { error: cacheError } = await supabase
          .from('workflow_cache')
          .insert([{
            prompt,
            platform,
            workflow: parsedWorkflow
          }]);

        if (cacheError) {
          console.error('Erro ao salvar no cache:', cacheError);
        } else {
          console.log('Workflow salvo no cache com sucesso');
        }

        console.log('==================== SALVANDO NO PROJECTS ====================');
        
        // Força atualização do schema
        await userSupabase.rpc('reload_schema_cache');
        
        const { error: projectError } = await userSupabase
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

        if (projectError) {
          console.error('Erro ao salvar no projects:', projectError);
          throw projectError;
        } else {
          console.log('Workflow salvo no projects com sucesso');
        }

        console.log('==================== PREPARANDO RESPOSTA ====================');
        const response = {
          workflow: parsedWorkflow,
          shareableUrl: null,
          fromCache: false
        };
        console.log('Resposta final:', JSON.stringify(response, null, 2));

        return new Response(
          JSON.stringify(response),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      } catch (parseError) {
        console.error('==================== ERRO DE PARSE/VALIDAÇÃO ====================');
        console.error('Erro:', parseError);
        console.error('Stack:', parseError.stack);
        throw new Error('Formato de workflow inválido. Por favor, tente novamente.');
      }
    } catch (e) {
      console.error('==================== ERRO GERAL ====================');
      console.error('Erro:', e);
      console.error('Stack:', e.stack);
      console.error('Conteúdo bruto:', response.choices[0].message.content);
      throw new Error('Formato de workflow inválido. Por favor, tente novamente.');
    }

  } catch (error) {
    console.error('==================== ERRO NA REQUISIÇÃO ====================');
    console.error('Erro:', error);
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