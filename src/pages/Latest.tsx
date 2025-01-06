import React from 'react';
import MainNav from '@/components/MainNav';
import { NavigationTabs } from '@/components/NavigationTabs';
import ProjectCard from '@/components/ProjectCard';

const latestProjects = [
  {
    title: "Latest Workflow",
    image: "/placeholder.svg",
    editedTime: "1 hour ago",
    isPrivate: false
  },
  {
    title: "Recent Template",
    image: "/placeholder.svg",
    editedTime: "5 hours ago",
    isPrivate: true
  }
];

const Latest = () => {
  return (
    <>
      <MainNav />
      <div className="min-h-screen px-4 py-20 md:py-4">
        <NavigationTabs />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 px-4 max-w-7xl mx-auto">
          {latestProjects.map((project, index) => (
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

export default Latest;