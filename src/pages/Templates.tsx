import React from 'react';
import MainNav from '@/components/MainNav';
import { NavigationTabs } from '@/components/NavigationTabs';
import ProjectCard from '@/components/ProjectCard';

const templateProjects = [
  {
    title: "Basic Workflow",
    image: "/placeholder.svg",
    editedTime: "1 month ago",
    isPrivate: false
  },
  {
    title: "Advanced Template",
    image: "/placeholder.svg",
    editedTime: "2 weeks ago",
    isPrivate: false
  }
];

const Templates = () => {
  return (
    <>
      <MainNav />
      <div className="min-h-screen px-4 py-20 md:py-4">
        <NavigationTabs />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 px-4 max-w-7xl mx-auto">
          {templateProjects.map((project, index) => (
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

export default Templates;