export const validateMakeWorkflow = (workflow: any) => {
  if (!workflow || typeof workflow !== 'object') {
    throw new Error('Workflow inválido: deve ser um objeto');
  }

  // Basic Make workflow structure validation
  if (!workflow.name || typeof workflow.name !== 'string') {
    throw new Error('Workflow Make inválido: nome é obrigatório');
  }

  if (!Array.isArray(workflow.modules)) {
    throw new Error('Workflow Make inválido: modules deve ser um array');
  }

  // Validate each module has required fields
  workflow.modules.forEach((module: any, index: number) => {
    if (!module.name) {
      throw new Error(`Módulo ${index + 1} inválido: nome é obrigatório`);
    }
    if (!module.type) {
      throw new Error(`Módulo ${index + 1} inválido: tipo é obrigatório`);
    }
  });
};

export const validateN8nWorkflow = (workflow: any) => {
  if (!workflow || typeof workflow !== 'object') {
    throw new Error('Workflow inválido: deve ser um objeto');
  }

  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    throw new Error('Workflow n8n inválido: nodes deve ser um array');
  }

  if (!workflow.connections || typeof workflow.connections !== 'object') {
    throw new Error('Workflow n8n inválido: connections deve ser um objeto');
  }

  // Validate each node has required fields
  workflow.nodes.forEach((node: any, index: number) => {
    if (!node.name) {
      throw new Error(`Node ${index + 1} inválido: nome é obrigatório`);
    }
    if (!node.type) {
      throw new Error(`Node ${index + 1} inválido: tipo é obrigatório`);
    }
    if (!node.parameters) {
      throw new Error(`Node ${index + 1} inválido: parameters é obrigatório`);
    }
  });
};