export const validateMakeWorkflow = (workflow: any) => {
  if (!workflow || typeof workflow !== 'object') {
    throw new Error('Workflow inválido: deve ser um objeto');
  }

  // Validação básica para Make (Integromat)
  if (!workflow.name || typeof workflow.name !== 'string') {
    throw new Error('Workflow Make inválido: nome é obrigatório');
  }

  if (!Array.isArray(workflow.modules)) {
    throw new Error('Workflow Make inválido: modules deve ser um array');
  }
};

export const validateN8nWorkflow = (workflow: any) => {
  if (!workflow || typeof workflow !== 'object') {
    throw new Error('Workflow inválido: deve ser um objeto');
  }

  // Validação básica para n8n
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    throw new Error('Workflow n8n inválido: nodes deve ser um array');
  }

  if (!workflow.connections || typeof workflow.connections !== 'object') {
    throw new Error('Workflow n8n inválido: connections deve ser um objeto');
  }
};