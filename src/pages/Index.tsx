import React, { useState, useEffect } from 'react';
import { HeartLogo } from '@/components/HeartLogo';
import { WorkflowInput } from '@/components/WorkflowInput';
import { NavigationTabs } from '@/components/NavigationTabs';
import MainNav from '@/components/MainNav';
import ProjectCard from '@/components/ProjectCard';
import { PricingSection } from '@/components/PricingSection';
import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  image: string;
  editedTime: string;
  isPrivate: boolean;
  prompt?: string;
  platform?: string;
  workflow?: any;
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

        const formattedProjects = data.map(project => ({
          id: project.id,
          title: project.title,
          image: project.image,
          editedTime: new Date(project.updated_at).toLocaleString(),
          isPrivate: project.is_private,
          prompt: project.prompt,
          platform: project.platform,
          workflow: project.workflow
        }));

        setProjects(formattedProjects);
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const newProject = {
        user_id: session.user.id,
        title: `${platform}-workflow-${projects.length + 1}`,
        image: "/placeholder.svg",
        prompt,
        platform,
        workflow: workflow,
        is_private: true
      };

      console.log('Salvando projeto:', newProject);

      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      console.log('Projeto salvo:', data);

      const formattedProject: Project = {
        id: data.id,
        title: data.title,
        image: data.image,
        editedTime: new Date(data.updated_at).toLocaleString(),
        isPrivate: data.is_private,
        prompt: data.prompt,
        platform: data.platform,
        workflow: data.workflow
      };

      setProjects([formattedProject, ...projects]);
      setActiveTab('my-projects');

      toast({
        title: "Sucesso",
        description: "Projeto salvo com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o projeto. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleReuseProject = (project: Project) => {
    if (project.prompt && project.platform) {
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

  const handleRenameProject = async (projectId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ title: newTitle })
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.map(project => 
        project.id === projectId 
          ? { ...project, title: newTitle } 
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
                  title={project.title}
                  image={project.image}
                  editedTime={project.editedTime}
                  isPrivate={project.isPrivate}
                  prompt={project.prompt}
                  platform={project.platform}
                  onReuse={() => handleReuseProject(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                  onRename={(newTitle) => handleRenameProject(project.id, newTitle)}
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