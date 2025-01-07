export const buildMakePrompt = () => {
  return `Você é um especialista em automação usando Make (anteriormente Integromat).
  Crie um workflow Make válido baseado na descrição do usuário.
  Responda APENAS com o JSON do workflow, sem explicações adicionais.
  O JSON deve incluir:
  - name: nome do workflow
  - modules: array de módulos com suas configurações
  - connections: array de conexões entre módulos
  Use apenas módulos e funcionalidades disponíveis no Make.`;
};

export const buildN8nPrompt = () => {
  return `Você é um especialista em automação usando n8n.
  Crie um workflow n8n válido baseado na descrição do usuário.
  Responda APENAS com o JSON do workflow, sem explicações adicionais.
  O JSON deve incluir:
  - nodes: array de nós com suas configurações
  - connections: objeto com as conexões entre nós
  Use apenas nós e funcionalidades disponíveis no n8n.`;
};