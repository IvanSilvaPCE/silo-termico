
// Import do serviço backend - apenas localStorage no frontend
import backendService from '../../backend/services/configurationService.js';

class ConfigurationService {
  constructor() {
    // Usar apenas localStorage no frontend
    this.isClient = typeof window !== 'undefined';
  }

  async saveConfiguration(name, type, configData, options = {}) {
    return backendService.saveConfiguration(name, type, configData, options);
  }

  async loadConfiguration(name, type, userId = 'default') {
    return backendService.loadConfiguration(name, type, userId);
  }

  async listConfigurations(type, userId = 'default') {
    return backendService.listConfigurations(type, userId);
  }

  async deleteConfiguration(name, type, userId = 'default') {
    return backendService.deleteConfiguration(name, type, userId);
  }

  
}

export default new ConfigurationService();
