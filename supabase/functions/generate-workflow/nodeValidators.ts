// Node type validators and parameter checkers
export const nodeValidators = {
  schedule: (node: any) => {
    if (!node.parameters.mode) {
      throw new Error('Schedule node requires mode parameter');
    }
    if (node.parameters.mode === 'timeInterval' && !node.parameters.interval) {
      throw new Error('Schedule node with timeInterval mode requires interval parameter');
    }
  },
  
  slack: (node: any) => {
    const required = ['channel', 'text', 'webhookUrl'];
    required.forEach(param => {
      if (!node.parameters[param]) {
        throw new Error(`Slack node requires ${param} parameter`);
      }
    });
  },

  discord: (node: any) => {
    const required = ['channel', 'text', 'webhookUrl'];
    required.forEach(param => {
      if (!node.parameters[param]) {
        throw new Error(`Discord node requires ${param} parameter`);
      }
    });
  },

  httpRequest: (node: any) => {
    if (!node.parameters.url || !node.parameters.method) {
      throw new Error('HTTP Request node requires url and method parameters');
    }
  },

  telegram: (node: any) => {
    if (!node.parameters.chatId || !node.parameters.text) {
      throw new Error('Telegram node requires chatId and text parameters');
    }
  }
};