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

  if (workflow.modules.length < 2) {
    throw new Error('Workflow Make inválido: deve ter pelo menos 2 módulos');
  }

  // Validate each module has required fields
  workflow.modules.forEach((module: any, index: number) => {
    if (!module.name) {
      throw new Error(`Módulo ${index + 1} inválido: nome é obrigatório`);
    }
    if (!module.type) {
      throw new Error(`Módulo ${index + 1} inválido: tipo é obrigatório`);
    }
    if (!module.parameters || typeof module.parameters !== 'object') {
      throw new Error(`Módulo ${index + 1} inválido: parameters é obrigatório e deve ser um objeto`);
    }
  });

  // Validate connections
  if (!Array.isArray(workflow.connections)) {
    throw new Error('Workflow Make inválido: connections deve ser um array');
  }

  if (workflow.connections.length === 0) {
    throw new Error('Workflow Make inválido: deve ter pelo menos uma conexão entre módulos');
  }

  // Validate metadata
  if (!workflow.metadata || typeof workflow.metadata !== 'object') {
    throw new Error('Workflow Make inválido: metadata é obrigatório');
  }
};

export const validateN8nWorkflow = (workflow: any) => {
  if (!workflow || typeof workflow !== 'object') {
    throw new Error('Workflow inválido: deve ser um objeto');
  }

  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    throw new Error('Workflow n8n inválido: nodes deve ser um array');
  }

  if (workflow.nodes.length < 2) {
    throw new Error('Workflow n8n inválido: deve ter pelo menos 2 nodes');
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
    if (!node.parameters || typeof node.parameters !== 'object') {
      throw new Error(`Node ${index + 1} inválido: parameters é obrigatório e deve ser um objeto`);
    }
    if (!Array.isArray(node.position) || node.position.length !== 2) {
      throw new Error(`Node ${index + 1} inválido: position deve ser um array com coordenadas [x, y]`);
    }
  });

  // Validate that there's at least one connection
  const hasConnections = Object.values(workflow.connections).some((conn: any) => 
    conn.main && Array.isArray(conn.main) && conn.main.length > 0
  );

  if (!hasConnections) {
    throw new Error('Workflow n8n inválido: deve ter pelo menos uma conexão entre nodes');
  }
});