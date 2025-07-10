
import { useState, useEffect, useCallback } from 'react';
import configurationService from '../services/configurationService';

export const useModelConfiguration = (type) => {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadConfigurations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await configurationService.listConfigurations(type);
      if (result.success) {
        setConfigurations(result.configurations);
      } else {
        setError('Erro ao carregar configurações');
      }
    } catch (err) {
      setError('Erro ao conectar com o serviço de configuração');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const saveConfiguration = useCallback(async (name, configData, options = {}) => {
    setSaving(true);
    setError(null);
    
    try {
      const result = await configurationService.saveConfiguration(
        name, 
        type, 
        configData, 
        options
      );
      
      if (result.success) {
        await loadConfigurations(); // Recarregar lista
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMsg = 'Erro ao salvar configuração';
      setError(errorMsg);
      console.error(err);
      return { success: false, message: errorMsg };
    } finally {
      setSaving(false);
    }
  }, [type, loadConfigurations]);

  const loadConfiguration = useCallback(async (name) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await configurationService.loadConfiguration(name, type);
      
      if (result.success) {
        return { success: true, data: result.data, metadata: result.metadata };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMsg = 'Erro ao carregar configuração';
      setError(errorMsg);
      console.error(err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [type]);

  const deleteConfiguration = useCallback(async (name) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await configurationService.deleteConfiguration(name, type);
      
      if (result.success) {
        await loadConfigurations(); // Recarregar lista
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMsg = 'Erro ao deletar configuração';
      setError(errorMsg);
      console.error(err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [type, loadConfigurations]);

  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  return {
    configurations,
    loading,
    saving,
    error,
    saveConfiguration,
    loadConfiguration,
    deleteConfiguration,
    refreshConfigurations: loadConfigurations
  };
};

export default useModelConfiguration;
