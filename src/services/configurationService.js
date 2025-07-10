
import { Pool } from 'pg';

class ConfigurationService {
  constructor() {
    this.pool = null;
    this.initializePool();
  }

  initializePool() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn('DATABASE_URL não encontrada. Usando localStorage como fallback.');
      return;
    }

    // Usar connection pooler para melhor performance
    const poolUrl = databaseUrl.replace('.us-east-2', '-pooler.us-east-2');
    
    this.pool = new Pool({
      connectionString: poolUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async saveConfiguration(name, type, configData, options = {}) {
    const {
      description = '',
      userId = 'default',
      isDefault = false,
      tags = []
    } = options;

    // Fallback para localStorage se não houver banco
    if (!this.pool) {
      return this.saveToLocalStorage(name, type, configData, options);
    }

    try {
      const client = await this.pool.connect();
      try {
        const query = `
          INSERT INTO model_configurations (name, type, description, config_data, user_id, is_default, tags)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (name, type, user_id) 
          DO UPDATE SET 
            config_data = EXCLUDED.config_data,
            description = EXCLUDED.description,
            is_default = EXCLUDED.is_default,
            tags = EXCLUDED.tags,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id, created_at, updated_at
        `;
        
        const result = await client.query(query, [
          name, type, JSON.stringify(configData), userId, isDefault, tags
        ]);
        
        return {
          success: true,
          id: result.rows[0].id,
          message: 'Configuração salva com sucesso!'
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      // Fallback para localStorage
      return this.saveToLocalStorage(name, type, configData, options);
    }
  }

  async loadConfiguration(name, type, userId = 'default') {
    // Fallback para localStorage se não houver banco
    if (!this.pool) {
      return this.loadFromLocalStorage(name, type);
    }

    try {
      const client = await this.pool.connect();
      try {
        const query = `
          SELECT * FROM model_configurations 
          WHERE name = $1 AND type = $2 AND user_id = $3
        `;
        
        const result = await client.query(query, [name, type, userId]);
        
        if (result.rows.length === 0) {
          // Tentar carregar do localStorage como fallback
          return this.loadFromLocalStorage(name, type);
        }
        
        return {
          success: true,
          data: result.rows[0].config_data,
          metadata: {
            id: result.rows[0].id,
            description: result.rows[0].description,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at,
            isDefault: result.rows[0].is_default,
            tags: result.rows[0].tags
          }
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      return this.loadFromLocalStorage(name, type);
    }
  }

  async listConfigurations(type, userId = 'default') {
    // Fallback para localStorage se não houver banco
    if (!this.pool) {
      return this.listFromLocalStorage(type);
    }

    try {
      const client = await this.pool.connect();
      try {
        const query = `
          SELECT id, name, description, created_at, updated_at, is_default, tags
          FROM model_configurations 
          WHERE type = $1 AND user_id = $2
          ORDER BY is_default DESC, updated_at DESC
        `;
        
        const result = await client.query(query, [type, userId]);
        
        return {
          success: true,
          configurations: result.rows
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao listar configurações:', error);
      return this.listFromLocalStorage(type);
    }
  }

  async deleteConfiguration(name, type, userId = 'default') {
    // Fallback para localStorage se não houver banco
    if (!this.pool) {
      return this.deleteFromLocalStorage(name, type);
    }

    try {
      const client = await this.pool.connect();
      try {
        const query = `
          DELETE FROM model_configurations 
          WHERE name = $1 AND type = $2 AND user_id = $3
          RETURNING id
        `;
        
        const result = await client.query(query, [name, type, userId]);
        
        if (result.rows.length === 0) {
          return { success: false, message: 'Configuração não encontrada' };
        }
        
        return { success: true, message: 'Configuração removida com sucesso!' };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao deletar configuração:', error);
      return this.deleteFromLocalStorage(name, type);
    }
  }

  // Métodos de fallback para localStorage
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
