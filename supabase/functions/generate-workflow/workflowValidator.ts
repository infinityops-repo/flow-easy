export function validateMakeWorkflow(workflow: any) {
  if (!workflow || typeof workflow !== 'object') {
    throw new Error('Workflow inválido: deve ser um objeto')
  }

  // Validação básica da estrutura do Make
  if (!workflow.name || typeof workflow.name !== 'string') {
    throw new Error('Workflow inválido: nome é obrigatório')
  }

  if (!Array.isArray(workflow.modules)) {
    throw new Error('Workflow inválido: modules deve ser um array')
  }

  if (!Array.isArray(workflow.connections)) {
    throw new Error('Workflow inválido: connections deve ser um array')
  }

  // Validar cada módulo
  workflow.modules.forEach((module: any, index: number) => {
    if (!module.id || typeof module.id !== 'string') {
      throw new Error(`Módulo ${index} inválido: id é obrigatório`)
    }
    if (!module.name || typeof module.name !== 'string') {
      throw new Error(`Módulo ${index} inválido: name é obrigatório`)
    }
    if (!module.type || typeof module.type !== 'string') {
      throw new Error(`Módulo ${index} inválido: type é obrigatório`)
    }
  })

  // Validar cada conexão
  workflow.connections.forEach((connection: any, index: number) => {
    if (!connection.from || typeof connection.from !== 'string') {
      throw new Error(`Conexão ${index} inválida: from é obrigatório`)
    }
    if (!connection.to || typeof connection.to !== 'string') {
      throw new Error(`Conexão ${index} inválida: to é obrigatório`)
    }
  })

  return true
}

export function validateN8nWorkflow(workflow: any) {
  if (!workflow || typeof workflow !== 'object') {
    throw new Error('Workflow inválido: deve ser um objeto')
  }

  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    throw new Error('Workflow inválido: nodes deve ser um array')
  }

  if (!workflow.connections || !Array.isArray(workflow.connections)) {
    throw new Error('Workflow inválido: connections deve ser um array')
  }

  workflow.nodes.forEach((node: any, index: number) => {
    if (!node.type || typeof node.type !== 'string') {
      throw new Error(`Node ${index} inválido: type é obrigatório`)
    }
    if (!node.parameters || typeof node.parameters !== 'object') {
      throw new Error(`Node ${index} inválido: parameters é obrigatório`)
    }
  })

  workflow.connections.forEach((connection: any, index: number) => {
    if (!connection.source || !connection.target) {
      throw new Error(`Conexão ${index} inválida: source e target são obrigatórios`)
    }
  })

  return true
}