import React from 'react';
import { HeartLogo } from '@/components/HeartLogo';
import { WorkflowInput } from '@/components/WorkflowInput';
import { QuickAccess } from '@/components/QuickAccess';
import { NavigationTabs } from '@/components/NavigationTabs';
import MainNav from '@/components/MainNav';
import ProjectCard from '@/components/ProjectCard';

const projectsData = [
  {
    title: "workflow-magic-creator",
    image: "/lovable-uploads/2be9b7d8-3454-4224-819a-b88e10b73602.png",
    editedTime: "2 minutes ago",
    isPrivate: true
  },
  {
    title: "tunnelr",
    image: "/placeholder.svg",
    editedTime: "3 days ago",
    isPrivate: true
  }
];

const Index = () => {
  return (
    <>
      <MainNav />
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 md:gap-8 px-4 py-20 md:py-4">
        <HeartLogo />
        
        <div className="text-center space-y-4 max-w-3xl px-4">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold gradient-text">
            Idea to workflow in seconds.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            FlowEasy is your superhuman workflow automation engineer.
          </p>
        </div>

        <WorkflowInput />
        <QuickAccess />
        
        <div className="mt-8 md:mt-16 w-full">
          <NavigationTabs />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 px-4 max-w-7xl mx-auto">
            {projectsData.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                image={project.image}
                editedTime={project.editedTime}
                isPrivate={project.isPrivate}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;