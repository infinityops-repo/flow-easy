import React from 'react';
import { GitBranch } from 'lucide-react';

export const HeartLogo = () => {
  return (
    <div className="w-20 h-20 animate-heart-beat">
      <div className="w-full h-full gradient-heart rounded-lg flex items-center justify-center">
        <GitBranch className="w-12 h-12 text-white" />
      </div>
    </div>
  );
};