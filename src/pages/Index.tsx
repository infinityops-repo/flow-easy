import React from 'react';
import { HeartLogo } from '@/components/HeartLogo';
import { WorkflowInput } from '@/components/WorkflowInput';
import { QuickAccess } from '@/components/QuickAccess';
import { NavigationTabs } from '@/components/NavigationTabs';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
      <HeartLogo />
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-6xl font-bold gradient-text">
          Idea to workflow in seconds.
        </h1>
        <p className="text-lg text-muted-foreground">
          Lovable is your superhuman workflow automation engineer.
        </p>
      </div>

      <WorkflowInput />
      <QuickAccess />
      
      <div className="mt-16">
        <NavigationTabs />
      </div>
    </div>
  );
};

export default Index;