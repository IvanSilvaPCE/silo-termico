
class ConfigurationService {
  constructor() {
    // Não usar pg no frontend - apenas localStorage
    this.isClient = typeof window !== 'undefined';
  }

  async saveConfiguration(name, type, configData, options = {}) {
    const {
      description = '',
      userId = 'default',
      isDefault = false,
      tags = []
    } = options;

    // No frontend, usar apenas localStorage
    if (this.isClient) {
      return this.saveToLocalStorage(name, type, configData, options);
    }

    // Fallback para localStorage
    return this.saveToLocalStorage(name, type, configData, options);
  }

  async loadConfiguration(name, type, userId = 'default') {
    // No frontend, usar apenas localStorage
    if (this.isClient) {
      return this.loadFromLocalStorage(name, type);
    }

    return this.loadFromLocalStorage(name, type);
  }

  async listConfigurations(type, userId = 'default') {
    // No frontend, usar apenas localStorage
    if (this.isClient) {
      return this.listFromLocalStorage(type);
    }

    return this.listFromLocalStorage(type);
  }

  async deleteConfiguration(name, type, userId = 'default') {
    // No frontend, usar apenas localStorage
    if (this.isClient) {
      return this.deleteFromLocalStorage(name, type);
    }

    return this.deleteFromLocalStorage(name, type);
  }

  // Métodos de localStorage
  saveToLocalStorage(name, type, configData, options) {
    const key = `config${type === 'silo' ? 'Silo' : 'Armazem'}_${name}`;
    const configWithMetadata = {
      ...configData,
      _metadata: {
        name,
        type,
        description: options.description || '',
        isDefault: options.isDefault || false,
        tags: options.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    localStorage.setItem(key, JSON.stringify(configWithMetadata));
    return { success: true, message: 'Configuração salva localmente!' };
  }

  loadFromLocalStorage(name, type) {
    const key = `config${type === 'silo' ? 'Silo' : 'Armazem'}_${name}`;
    const saved = localStorage.getItem(key);
    
    if (!saved) {
      return { success: false, message: 'Configuração não encontrada' };
    }
    
    try {
      const parsed = JSON.parse(saved);
      const { _metadata, ...configData } = parsed;
      
      return {
        success: true,
        data: configData,
        metadata: _metadata || {}
      };
    } catch (error) {
      return { success: false, message: 'Erro ao carregar configuração' };
    }
  }

  listFromLocalStorage(type) {
    const prefix = `config${type === 'silo' ? 'Silo' : 'Armazem'}_`;
    const configurations = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const name = key.replace(prefix, '');
        const saved = localStorage.getItem(key);
        
        try {
          const parsed = JSON.parse(saved);
          const metadata = parsed._metadata || {};
          
          configurations.push({
            name,
            description: metadata.description || '',
            created_at: metadata.createdAt,
            updated_at: metadata.updatedAt,
            is_default: metadata.isDefault || false,
            tags: metadata.tags || []
          });
        } catch (error) {
          console.warn(`Erro ao parsear configuração ${name}:`, error);
        }
      }
    }
    
    return { success: true, configurations };
  }

  deleteFromLocalStorage(name, type) {
    const key = `config${type === 'silo' ? 'Silo' : 'Armazem'}_${name}`;
    localStorage.removeItem(key);
    return { success: true, message: 'Configuração removida localmente!' };
  }
}

export default new ConfigurationService();
