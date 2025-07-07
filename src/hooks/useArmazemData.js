
import { useState, useEffect } from 'react';
import armazemDataLoader from '../utils/armazemDataLoader';

/**
 * Hook personalizado para gerenciar dados do armazém
 */
export const useArmazemData = (configuracao = {}) => {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      let dadosCarregados;
      
      if (configuracao.simularAPI) {
        dadosCarregados = await armazemDataLoader.simularAPI(configuracao);
      } else {
        dadosCarregados = await armazemDataLoader.carregarDados();
      }
      
      if (!armazemDataLoader.validarEstrutura(dadosCarregados)) {
        throw new Error('Estrutura de dados inválida');
      }
      
      setDados(dadosCarregados);
      setUltimaAtualizacao(new Date());
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro(error.message);
      
      // Usar dados de fallback
      const dadosFallback = armazemDataLoader.getDadosFallback();
      setDados(dadosFallback);
      
    } finally {
      setCarregando(false);
    }
  };

  const recarregarDados = () => {
    carregarDados();
  };

  const getDadosParaTopo = () => {
    return dados ? armazemDataLoader.processarParaTopo(dados) : null;
  };

  const getDadosPara3D = () => {
    return dados ? armazemDataLoader.processarParaArmazem3D(dados) : null;
  };

  const getDimensoes = () => {
    return dados ? armazemDataLoader.calcularDimensoes(dados.layout) : null;
  };

  const getSensorPorId = (id) => {
    return dados?.sensores?.[id.toString()] || null;
  };

  const getSensoresPorCelula = (celulaId) => {
    if (!dados) return [];
    
    return dados.layout.arcos
      .filter(arco => arco.celula === celulaId)
      .flatMap(arco => 
        arco.sensores.map(sensor => ({
          ...sensor,
          ...dados.sensores[sensor.id.toString()],
          arco: arco.id
        }))
      );
  };

  const getSensoresComAlerta = () => {
    if (!dados) return [];
    
    return Object.entries(dados.sensores)
      .filter(([id, sensor]) => sensor.falha || sensor.ponto_quente)
      .map(([id, sensor]) => ({ id: parseInt(id), ...sensor }));
  };

  const getEstatisticas = () => {
    if (!dados) return null;
    
    const sensores = Object.values(dados.sensores);
    const temperaturas = sensores
      .filter(s => s.ativo && s.temperatura > 0)
      .map(s => s.temperatura);
    
    return {
      totalSensores: sensores.length,
      sensoresAtivos: sensores.filter(s => s.ativo).length,
      sensoresComFalha: sensores.filter(s => s.falha).length,
      pontosQuentes: sensores.filter(s => s.ponto_quente).length,
      temperaturaMedia: temperaturas.length > 0 
        ? temperaturas.reduce((a, b) => a + b, 0) / temperaturas.length 
        : 0,
      temperaturaMaxima: temperaturas.length > 0 ? Math.max(...temperaturas) : 0,
      temperaturaMinima: temperaturas.length > 0 ? Math.min(...temperaturas) : 0
    };
  };

  useEffect(() => {
    carregarDados();
  }, [configuracao.tamanho, configuracao.simularAPI]);

  // Auto-refresh a cada 30 segundos se configurado
  useEffect(() => {
    if (configuracao.autoRefresh) {
      const interval = setInterval(() => {
        carregarDados();
      }, configuracao.autoRefreshInterval || 30000);
      
      return () => clearInterval(interval);
    }
  }, [configuracao.autoRefresh, configuracao.autoRefreshInterval]);

  return {
    dados,
    carregando,
    erro,
    ultimaAtualizacao,
    recarregarDados,
    getDadosParaTopo,
    getDadosPara3D,
    getDimensoes,
    getSensorPorId,
    getSensoresPorCelula,
    getSensoresComAlerta,
    getEstatisticas
  };
};

export default useArmazemData;
