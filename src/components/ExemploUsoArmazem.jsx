
import React from 'react';
import { useArmazemData } from '../hooks/useArmazemData';

const ExemploUsoArmazem = () => {
  // Exemplo 1: Armazém padrão
  const { 
    dados, 
    carregando, 
    erro, 
    getDadosParaTopo, 
    getDadosPara3D,
    getEstatisticas,
    getSensoresComAlerta,
    recarregarDados
  } = useArmazemData();

  // Exemplo 2: Armazém pequeno simulado
  const armazemPequeno = useArmazemData({ 
    simularAPI: true, 
    tamanho: 'pequeno',
    autoRefresh: true,
    autoRefreshInterval: 15000 
  });

  const estatisticas = getEstatisticas();
  const alertas = getSensoresComAlerta();

  if (carregando) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="alert alert-danger m-3">
        <h6>Erro ao carregar dados:</h6>
        <p>{erro}</p>
        <button className="btn btn-outline-danger btn-sm" onClick={recarregarDados}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>Sistema Dinâmico de Armazém</h5>
              <small className="text-muted">
                Dados atualizados dinamicamente via JSON/API
              </small>
            </div>
            <div className="card-body">
              
              {/* Estatísticas */}
              {estatisticas && (
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body text-center">
                        <h4>{estatisticas.totalSensores}</h4>
                        <small>Total Sensores</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-success text-white">
                      <div className="card-body text-center">
                        <h4>{estatisticas.sensoresAtivos}</h4>
                        <small>Sensores Ativos</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body text-center">
                        <h4>{estatisticas.pontosQuentes}</h4>
                        <small>Pontos Quentes</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-danger text-white">
                      <div className="card-body text-center">
                        <h4>{estatisticas.sensoresComFalha}</h4>
                        <small>Com Falha</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alertas */}
              {alertas.length > 0 && (
                <div className="alert alert-warning">
                  <h6>⚠️ Sensores com Alerta:</h6>
                  <ul className="mb-0">
                    {alertas.map(sensor => (
                      <li key={sensor.id}>
                        Sensor {sensor.id}: 
                        {sensor.falha && <span className="badge bg-danger ms-1">Falha</span>}
                        {sensor.ponto_quente && <span className="badge bg-warning ms-1">Ponto Quente</span>}
                        <span className="ms-2">Temp: {sensor.temperatura}°C</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Estrutura do Layout */}
              <div className="row">
                <div className="col-md-6">
                  <h6>Configuração Atual:</h6>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Número de Arcos:</span>
                      <strong>{dados?.layout?.arcos?.length || 0}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Número de Células:</span>
                      <strong>{dados?.layout?.celulas?.length || 0}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Total de Aeradores:</span>
                      <strong>{dados?.layout?.aeradores?.length || 0}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Temperatura Média:</span>
                      <strong>{estatisticas?.temperaturaMedia?.toFixed(1) || 0}°C</strong>
                    </li>
                  </ul>
                </div>
                
                <div className="col-md-6">
                  <h6>Ações:</h6>
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={recarregarDados}
                    >
                      🔄 Recarregar Dados
                    </button>
                    
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => console.log('Dados Topo:', getDadosParaTopo())}
                    >
                      📊 Ver Dados Topo (Console)
                    </button>
                    
                    <button 
                      className="btn btn-outline-info"
                      onClick={() => console.log('Dados 3D:', getDadosPara3D())}
                    >
                      🏗️ Ver Dados 3D (Console)
                    </button>
                  </div>
                </div>
              </div>

              {/* Demo armazém pequeno */}
              <div className="mt-4 p-3 bg-light rounded">
                <h6>Demo: Armazém Pequeno (Simulado)</h6>
                {armazemPequeno.carregando ? (
                  <div className="text-center">
                    <div className="spinner-border spinner-border-sm" />
                    <span className="ms-2">Carregando armazém pequeno...</span>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-4">
                      <small>Arcos: {armazemPequeno.dados?.layout?.arcos?.length || 0}</small>
                    </div>
                    <div className="col-md-4">
                      <small>Células: {armazemPequeno.dados?.layout?.celulas?.length || 0}</small>
                    </div>
                    <div className="col-md-4">
                      <small>Auto-refresh: Ativo</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExemploUsoArmazem;
