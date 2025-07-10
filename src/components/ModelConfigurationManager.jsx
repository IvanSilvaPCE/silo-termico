
import React, { useState } from 'react';
import useModelConfiguration from '../hooks/useModelConfiguration';

const ModelConfigurationManager = ({ 
  type, 
  currentConfig, 
  onConfigurationLoad,
  onConfigurationSave 
}) => {
  const [showManager, setShowManager] = useState(false);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [configTags, setConfigTags] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  const {
    configurations,
    loading,
    saving,
    error,
    saveConfiguration,
    loadConfiguration,
    deleteConfiguration
  } = useModelConfiguration(type);

  const handleSave = async () => {
    if (!configName.trim()) {
      alert('Digite um nome para a configuração!');
      return;
    }

    const tags = configTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const result = await saveConfiguration(configName, currentConfig, {
      description: configDescription,
      isDefault,
      tags
    });

    if (result.success) {
      alert(result.message);
      setConfigName('');
      setConfigDescription('');
      setConfigTags('');
      setIsDefault(false);
      if (onConfigurationSave) {
        onConfigurationSave(configName, currentConfig);
      }
    } else {
      alert(`Erro: ${result.message}`);
    }
  };

  const handleLoad = async (name) => {
    const result = await loadConfiguration(name);
    
    if (result.success) {
      if (onConfigurationLoad) {
        onConfigurationLoad(result.data, result.metadata);
      }
      alert('Configuração carregada com sucesso!');
    } else {
      alert(`Erro: ${result.message}`);
    }
  };

  const handleDelete = async (name) => {
    if (!confirm(`Tem certeza que deseja excluir a configuração "${name}"?`)) {
      return;
    }

    const result = await deleteConfiguration(name);
    
    if (result.success) {
      alert(result.message);
    } else {
      alert(`Erro: ${result.message}`);
    }
  };

  if (!showManager) {
    return (
      <button 
        className="btn btn-info"
        onClick={() => setShowManager(true)}
      >
        Gerenciar Configurações
      </button>
    );
  }

  return (
    <div className="card mt-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Gerenciador de Configurações - {type}</h6>
        <button 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setShowManager(false)}
        >
          ×
        </button>
      </div>
      
      <div className="card-body">
        {error && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Seção de Salvar Nova Configuração */}
        <div className="mb-4">
          <h6 className="text-primary">Nova Configuração</h6>
          
          <div className="mb-2">
            <label className="form-label">Nome:</label>
            <input
              type="text"
              className="form-control"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Nome da configuração"
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Descrição:</label>
            <textarea
              className="form-control"
              rows="2"
              value={configDescription}
              onChange={(e) => setConfigDescription(e.target.value)}
              placeholder="Descrição opcional da configuração"
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Tags (separadas por vírgula):</label>
            <input
              type="text"
              className="form-control"
              value={configTags}
              onChange={(e) => setConfigTags(e.target.value)}
              placeholder="ex: industrial, médio, exportação"
            />
          </div>

          <div className="mb-2">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <label className="form-check-label">
                Configuração padrão
              </label>
            </div>
          </div>

          <button
            className="btn btn-success"
            onClick={handleSave}
            disabled={saving || !configName.trim()}
          >
            {saving ? 'Salvando...' : 'Salvar Configuração'}
          </button>
        </div>

        <hr />

        {/* Seção de Configurações Salvas */}
        <div>
          <h6 className="text-primary">Configurações Salvas</h6>
          
          {loading ? (
            <div className="text-center">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : configurations.length === 0 ? (
            <p className="text-muted">Nenhuma configuração salva</p>
          ) : (
            <div className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {configurations.map((config) => (
                <div key={config.name} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1 d-flex align-items-center">
                        {config.name}
                        {config.is_default && (
                          <span className="badge bg-primary ms-2">Padrão</span>
                        )}
                      </h6>
                      
                      {config.description && (
                        <p className="mb-1 small text-muted">{config.description}</p>
                      )}
                      
                      {config.tags && config.tags.length > 0 && (
                        <div className="mb-1">
                          {config.tags.map(tag => (
                            <span key={tag} className="badge bg-secondary me-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <small className="text-muted">
                        Atualizado: {new Date(config.updated_at).toLocaleString('pt-BR')}
                      </small>
                    </div>
                    
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleLoad(config.name)}
                        title="Carregar configuração"
                      >
                        Carregar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(config.name)}
                        title="Excluir configuração"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelConfigurationManager;
