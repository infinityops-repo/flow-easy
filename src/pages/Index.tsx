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
  title: string;
  image: string;
  prompt: string;
  workflow: any;
  platform: string;
  user_id: string;
  is_private: boolean;
  created_at?: string;
  updated_at?: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('my-projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [latestProjects, setLatestProjects] = useState<Project[]>([]);

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
        console.error('Error loading projects:', error);
        toast({
          title: "Error",
          description: "Unable to load your projects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [toast]);

  // Carrega os projetos mais recentes
  useEffect(() => {
    const loadLatestProjects = async () => {
      try {
        console.log('==================== CARREGANDO PROJETOS RECENTES ====================');
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error loading recent projects:', error);
          throw error;
        }

        console.log('Projetos recentes carregados:', data?.length || 0);
        console.log('Dados dos projetos:', data);
        
        setLatestProjects(data || []);
      } catch (error) {
        console.error('Error loading recent projects:', error);
        toast({
          title: "Error",
          description: "Unable to load recent projects. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (activeTab === 'latest') {
      loadLatestProjects();
    }
  }, [activeTab, toast]);

  const handleWorkflowGenerated = async (workflow: any, prompt: string, platform: string) => {
    console.log('==================== STARTING WORKFLOW SAVE ====================');
    console.log('Received workflow:', JSON.stringify(workflow, null, 2));
    console.log('Workflow type:', typeof workflow);
    console.log('Prompt:', prompt);
    console.log('Platform:', platform);
    console.log('Workflow keys:', Object.keys(workflow));
    console.log('Number of nodes:', workflow.nodes?.length);
    console.log('Number of connections:', workflow.edges?.length);
    console.log('Workflow size in bytes:', new TextEncoder().encode(JSON.stringify(workflow)).length);
    console.log('Node structure:', workflow.nodes?.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: Object.keys(node.data || {})
    })));
    console.log('Connection structure:', workflow.edges?.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type
    })));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('==================== CHECKING SESSION ====================');
      console.log('Session:', session?.user?.id);
      console.log('Authentication status:', session ? 'Authenticated' : 'Not authenticated');
      console.log('Complete session data:', JSON.stringify(session, null, 2));
      console.log('Request headers:', supabase.headers);
      console.log('Supabase URL:', supabase.supabaseUrl);

      if (!session?.user?.id) {
        console.error('User not authenticated - Session details:', session);
        throw new Error('User not authenticated');
      }

      console.log('==================== PREPARING PROJECT TO SAVE ====================');
      const project = {
        title: prompt.substring(0, 50),
        image: "https://placehold.co/600x400",
        prompt: prompt,
        workflow: workflow,
        platform,
        user_id: session.user.id,
        is_private: true
      };
      console.log('Project to be saved:', JSON.stringify(project, null, 2));
      console.log('Project type:', typeof project);
      console.log('Project keys:', Object.keys(project));
      console.log('Project size in bytes:', new TextEncoder().encode(JSON.stringify(project)).length);
      console.log('Field validation:');
      console.log('- Valid name:', project.title && project.title.length <= 50);
      console.log('- Description present:', !!project.prompt);
      console.log('- Valid workflow:', !!project.workflow && typeof project.workflow === 'object');
      console.log('- Valid platform:', !!project.platform);
      console.log('- Valid user ID:', !!project.user_id);

      console.log('==================== SAVING PROJECT TO SUPABASE ====================');
      console.log('Supabase configuration:', {
        autoRefreshToken: supabase.auth.autoRefreshToken,
        persistSession: supabase.auth.persistSession,
        storageKey: supabase.storageKey,
        headers: supabase.headers
      });

      // First we save the project
      console.log('Starting project insertion...');
      const { data: savedProject, error: saveError } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (saveError) {
        console.error('==================== ERROR SAVING PROJECT ====================');
        console.error('Error:', saveError);
        console.error('Details:', saveError.details);
        console.error('Hint:', saveError.hint);
        console.error('Code:', saveError.code);
        console.error('Message:', saveError.message);
        console.error('Stack:', saveError.stack);
        console.error('Failed project:', project);
        throw saveError;
      }

      console.log('==================== PROJECT SAVED SUCCESSFULLY ====================');
      console.log('Saved project:', JSON.stringify(savedProject, null, 2));
      console.log('Saved project ID:', savedProject?.id);
      console.log('Creation timestamp:', savedProject?.created_at);
      console.log('Saved workflow:', JSON.stringify(savedProject?.workflow, null, 2));
      console.log('Comparison with original:', {
        sameSize: JSON.stringify(workflow).length === JSON.stringify(savedProject?.workflow).length,
        sameKeys: JSON.stringify(Object.keys(workflow).sort()) === JSON.stringify(Object.keys(savedProject?.workflow || {}).sort())
      });

      console.log('==================== UPDATING LOCAL STATE ====================');
      console.log('Current project state:', projects.length);
      // Update local state first with newly saved project
      setProjects(prevProjects => {
        console.log('Updating state with new project...');
        const newProjects = [savedProject, ...prevProjects];
        console.log('New state:', newProjects.length, 'projects');
        return newProjects;
      });

      toast({
        title: "Success",
        description: "Workflow saved successfully!",
      });

      console.log('==================== UPDATING PROJECT LIST ====================');
      // Then fetch the updated list
      console.log('Fetching updated project list...');
      const { data: updatedProjects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('==================== ERROR FETCHING PROJECTS ====================');
        console.error('Error:', projectsError);
        console.error('Details:', projectsError.details);
        console.error('Hint:', projectsError.hint);
        console.error('Code:', projectsError.code);
        console.error('Message:', projectsError.message);
        console.error('Stack:', projectsError.stack);
        console.error('Search parameters:', {
          user_id: session.user.id,
          orderBy: 'created_at'
        });
      } else {
        console.log('==================== PROJECTS UPDATED ====================');
        console.log('Total projects:', updatedProjects?.length);
        console.log('Project IDs:', updatedProjects?.map(p => p.id));
        console.log('Projects ordered by:', updatedProjects?.map(p => ({ id: p.id, created_at: p.created_at })));
        console.log('Total projects size in bytes:', new TextEncoder().encode(JSON.stringify(updatedProjects)).length);
        console.log('Recently created project present:', updatedProjects?.some(p => p.id === savedProject?.id));
        setProjects(updatedProjects || []);
      }

      console.log('==================== STATE UPDATE COMPLETED ====================');
      console.log('Final project state:', projects.length);
      console.log('Recently created project in state:', projects.some(p => p.id === savedProject?.id));

    } catch (error) {
      console.error('==================== ERROR SAVING WORKFLOW ====================');
      console.error('Complete error:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error properties:', Object.keys(error));
      console.error('Project state at error:', projects.length);
      console.error('Supabase configuration at error:', {
        url: supabase.supabaseUrl,
        headers: supabase.headers,
        auth: {
          autoRefreshToken: supabase.auth.autoRefreshToken,
          persistSession: supabase.auth.persistSession
        }
      });
      
      toast({
        title: "Error saving workflow",
        description: error instanceof Error ? error.message : "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReuseProject = async (project: Project) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const newProject = {
        title: `${project.title} (copy)`,
        image: project.image,
        prompt: project.prompt,
        workflow: project.workflow,
        platform: project.platform,
        user_id: session.user.id,
        is_private: true
      };

      const { data: savedProject, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) throw error;

      setProjects([savedProject, ...projects]);

      toast({
        title: "Success",
        description: "Project duplicated successfully!",
      });
    } catch (error) {
      console.error('Error duplicating project:', error);
      toast({
        title: "Error",
        description: "Unable to duplicate the project. Please try again.",
        variant: "destructive",
      });
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
        title: "Success",
        description: "Project deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Unable to delete the project. Please try again.",
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

      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, title: newTitle } : p
      ));

      toast({
        title: "Success",
        description: "Project renamed successfully!",
      });
    } catch (error) {
      console.error('Error renaming project:', error);
      toast({
        title: "Error",
        description: "Unable to rename the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getProjectsForTab = () => {
    switch (activeTab) {
      case 'my-projects':
        return projects;
      case 'latest':
        return latestProjects;
      default:
        return projects;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
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
                  title={project.title}
                  image={project.image}
                  prompt={project.prompt}
                  platform={project.platform}
                  created_at={project.created_at}
                  updated_at={project.updated_at}
                  workflow={project.workflow}
                  onReuse={() => handleReuseProject(project)}
                  onDelete={async () => await handleDeleteProject(project.id)}
                  onRename={async (newTitle) => await handleRenameProject(project.id, newTitle)}
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