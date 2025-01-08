import React, { useState } from 'react';
import { HeartLogo } from '@/components/HeartLogo';
import { WorkflowInput } from '@/components/WorkflowInput';
import { NavigationTabs } from '@/components/NavigationTabs';
import MainNav from '@/components/MainNav';
import ProjectCard from '@/components/ProjectCard';
import { PricingSection } from '@/components/PricingSection';
import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';

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

const latestProjects = [
  {
    title: "Latest Project 1",
    image: "/placeholder.svg",
    editedTime: "1 hour ago",
    isPrivate: false
  },
];

const featuredProjects = [
  {
    title: "Featured Project 1",
    image: "/placeholder.svg",
    editedTime: "2 days ago",
    isPrivate: false
  },
];

const templateProjects = [
  {
    title: "Template 1",
    image: "/placeholder.svg",
    editedTime: "1 week ago",
    isPrivate: false
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('my-projects');

  const getProjectsForTab = () => {
    switch (activeTab) {
      case 'my-projects':
        return projectsData;
      case 'latest':
        return latestProjects;
      case 'featured':
        return featuredProjects;
      case 'templates':
        return templateProjects;
      default:
        return projectsData;
    }
  };

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

          <WorkflowInput />
          
          <div className="mt-8 md:mt-16 w-full">
            <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 px-4 max-w-7xl mx-auto">
              {getProjectsForTab().map((project, index) => (
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

          <FAQSection />
          <PricingSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;