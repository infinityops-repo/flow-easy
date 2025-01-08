export interface Project {
  id: string;
  name: string;
  description: string;
  workflow: any;
  platform: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  workflow: any;
  platform: string;
  created_at?: string;
  updated_at?: string;
  onReuse: () => void;
  onDelete: () => Promise<void>;
  onRename: (newName: string) => Promise<void>;
}

export interface WorkflowInputProps {
  onWorkflowGenerated: (workflow: any, prompt: string, platform: string) => Promise<void>;
}

export interface Node {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
}

export interface Connection {
  node: string;
  type: string;
  index: number;
}

export interface Workflow {
  nodes: Node[];
  connections: {
    [key: string]: {
      main: Connection[][];
    };
  };
} 