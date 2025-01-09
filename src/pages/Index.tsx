import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
  const [activeTab, setActiveTab] = useState('latest');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [latestProjects, setLatestProjects] = useState<Project[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session?.user) {
        loadUserProjects(session.user.id);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loadUserProjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
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

  useEffect(() => {
    const loadLatestProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('is_private', false)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
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
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your workflow.",
        variant: "default",
      });
      navigate('/auth');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const project = {
        title: prompt.substring(0, 50),
        image: "https://placehold.co/600x400",
        prompt: prompt,
        workflow: workflow,
        platform,
        user_id: session.user.id,
        is_private: true
      };

      const { data: savedProject, error: saveError } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (saveError) throw saveError;

      setProjects(prevProjects => [savedProject, ...prevProjects]);

      toast({
        title: "Success",
        description: "Workflow saved successfully!",
      });

      const { data: updatedProjects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(updatedProjects || []);

    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Error saving workflow",
        description: error instanceof Error ? error.message : "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReuseProject = async (project: Project) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reuse workflows.",
        variant: "default",
      });
      navigate('/auth');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
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
    if (!isAuthenticated) return;

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
    if (!isAuthenticated) return;

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
        return isAuthenticated ? projects : [];
      case 'latest':
        return latestProjects;
      default:
        return isAuthenticated ? projects : latestProjects;
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

          {isAuthenticated && (
            <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          )}

          <div className="w-full max-w-7xl px-4 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getProjectsForTab().map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onReuse={handleReuseProject}
                  onDelete={handleDeleteProject}
                  onRename={handleRenameProject}
                  isOwner={isAuthenticated && project.user_id === supabase.auth.user()?.id}
                />
              ))}
            </div>

            {!isAuthenticated && (
              <div className="text-center mt-8">
                <Button onClick={() => navigate('/auth')} variant="default">
                  Sign in to save and manage your workflows
                </Button>
              </div>
            )}
          </div>
        </div>

        <PricingSection />
        <FAQSection />
        <Footer />
      </main>
    </div>
  );
};

export default Index;