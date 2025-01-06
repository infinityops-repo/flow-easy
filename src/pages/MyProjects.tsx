import React from 'react';
import MainNav from '@/components/MainNav';
import { NavigationTabs } from '@/components/NavigationTabs';
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

const MyProjects = () => {
  return (
    <>
      <MainNav />
      <div className="min-h-screen px-4 py-20 md:py-4">
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
    </>
  );
};

export default MyProjects;