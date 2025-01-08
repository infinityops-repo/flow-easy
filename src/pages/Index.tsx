import React, { useState, useEffect } from 'react';
import { HeartLogo } from '@/components/HeartLogo';
import { WorkflowInput } from '@/components/WorkflowInput';
import { NavigationTabs } from '@/components/NavigationTabs';
import MainNav from '@/components/MainNav';
import { ProjectCard } from '@/components/ProjectCard';
import { PricingSection } from '@/components/PricingSection';
import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  workflow: any;
  platform: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('my-projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Carrega os projetos do usuário
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        setProjects(data);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus projetos. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [toast]);

  const handleWorkflowGenerated = async (workflow: any, prompt: string, platform: string) => {
    console.log('==================== INICIANDO SALVAMENTO DO WORKFLOW ====================');
    console.log('Workflow recebido:', JSON.stringify(workflow, null, 2));
    console.log('Tipo do workflow:', typeof workflow);
    console.log('Prompt:', prompt);
    console.log('Plataforma:', platform);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Sessão:', session?.user?.id);

      if (!session?.user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('==================== PREPARANDO PROJETO PARA SALVAR ====================');
      const project = {
        name: prompt.substring(0, 50),
        description: prompt,
        workflow: workflow,
        platform,
        user_id: session.user.id,
      };
      console.log('Projeto a ser salvo:', JSON.stringify(project, null, 2));

      console.log('==================== SALVANDO PROJETO NO SUPABASE ====================');
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (error) {
        console.error('==================== ERRO AO SALVAR PROJETO ====================');
        console.error('Erro:', error);
        console.error('Detalhes:', error.details);
        console.error('Hint:', error.hint);
        throw error;
      }

      console.log('==================== PROJETO SALVO COM SUCESSO ====================');
      console.log('Projeto salvo:', data);

      // Atualiza a lista de projetos
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('==================== ERRO AO BUSCAR PROJETOS ====================');
        console.error('Erro:', projectsError);
        throw projectsError;
      }

      console.log('==================== PROJETOS ATUALIZADOS ====================');
      console.log('Total de projetos:', projects.length);
      setProjects(projects);

    } catch (error) {
      console.error('==================== ERRO NO SALVAMENTO DO WORKFLOW ====================');
      console.error('Erro completo:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      toast({
        title: "Erro ao salvar workflow",
        description: error instanceof Error ? error.message : "Falha ao salvar workflow. Por favor, tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleReuseProject = (project: Project) => {
    if (project.description && project.platform) {
      // Aqui vamos passar os dados do projeto para o WorkflowInput
      // Implementaremos essa funcionalidade no próximo passo
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
      
      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o projeto. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRenameProject = async (projectId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: newName })
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.map(project => 
        project.id === projectId 
          ? { ...project, name: newName } 
          : project
      ));

      toast({
        title: "Sucesso",
        description: "Projeto renomeado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao renomear projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível renomear o projeto. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getProjectsForTab = () => {
    switch (activeTab) {
      case 'my-projects':
        return projects;
      case 'latest':
        return [];
      case 'featured':
        return [];
      case 'templates':
        return [];
      default:
        return projects;
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 px-4 py-12 md:py-20">
          <HeartLogo />
          
          <div className="text-center space-y-3 md:space-y-4 max-w-3xl px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold gradient-text">
              Idea to workflow in seconds.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              FlowEasy is your superhuman workflow automation engineer.
            </p>
          </div>

          <WorkflowInput onWorkflowGenerated={handleWorkflowGenerated} />
          
          <div className="mt-8 md:mt-16 w-full">
            <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 px-4 max-w-7xl mx-auto">
              {getProjectsForTab().map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  description={project.description}
                  platform={project.platform}
                  created_at={project.created_at}
                  updated_at={project.updated_at}
                  workflow={project.workflow}
                  onReuse={() => handleReuseProject(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                  onRename={(newName) => handleRenameProject(project.id, newName)}
                />
              ))}
            </div>
          </div>

          <FAQSection />
          <PricingSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;