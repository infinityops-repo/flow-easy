import { nodeValidators } from "./nodeValidators.ts";

// Workflow structure validator
export const validateWorkflow = (workflow: any, platform: string) => {
  if (!workflow.nodes || !workflow.connections || !Array.isArray(workflow.nodes)) {
    throw new Error('Invalid workflow structure: missing nodes or connections');
  }

  // Validate each node
  workflow.nodes.forEach((node: any) => {
    if (!node.type || !node.parameters || !node.id || !node.position) {
      throw new Error('Invalid node structure: missing required properties');
    }

    // Validate node type format for n8n
    if (platform === 'n8n' && !node.type.startsWith('n8n-nodes-base.')) {
      throw new Error(`Invalid node type format: ${node.type} - must start with n8n-nodes-base.`);
    }

    // Get base node type
    const nodeType = node.type.replace('n8n-nodes-base.', '');
    
    // Validate node parameters using validators
    const validator = nodeValidators[nodeType];
    if (validator) {
      validator(node);
    }
  });

  return true;
};