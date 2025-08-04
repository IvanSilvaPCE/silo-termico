class LayoutManager {
  static analisarEstruturaArcos(dados) {
    console.log('=== ANALISANDO ESTRUTURA DOS ARCOS ===');
    console.log('Dados recebidos para análise:', JSON.stringify(dados, null, 2));

    if (!dados) {
      console.error('Dados não fornecidos para análise');
      return null;
    }

    try {
      const analise = {
        totalArcos: 1,
        arcos: {},
        estatisticas: {
          totalPendulos: 0,
          totalSensores: 0
        }
      };

      // Se há configuração, usar ela
      if (dados.configuracao) {
        console.log('Usando configuração encontrada:', dados.configuracao);

        // Processar arcos da configuração
        if (dados.configuracao.arcos) {
          Object.keys(dados.configuracao.arcos).forEach(numeroArco => {
            const arcoConfig = dados.configuracao.arcos[numeroArco];
            analise.arcos[numeroArco] = {
              totalPendulos: arcoConfig.pendulos ? arcoConfig.pendulos.length : 0,
              totalSensores: 0,
              pendulos: []
            };

            if (arcoConfig.pendulos) {
              arcoConfig.pendulos.forEach(pendulo => {
                const penduloInfo = {
                  numero: pendulo.numero || pendulo.id,
                  totalSensores: pendulo.sensores ? pendulo.sensores.length : 0
                };
                analise.arcos[numeroArco].pendulos.push(penduloInfo);
                analise.arcos[numeroArco].totalSensores += penduloInfo.totalSensores;
              });
            }

            analise.estatisticas.totalPendulos += analise.arcos[numeroArco].totalPendulos;
            analise.estatisticas.totalSensores += analise.arcos[numeroArco].totalSensores;
          });

          analise.totalArcos = Object.keys(dados.configuracao.arcos).length;
        }
      }

      // Se há pêndulos diretamente, processar
      if (dados.pendulos) {
        console.log('Processando pêndulos diretos:', dados.pendulos);

        if (!analise.arcos[1]) {
          analise.arcos[1] = {
            totalPendulos: 0,
            totalSensores: 0,
            pendulos: []
          };
        }

        Object.keys(dados.pendulos).forEach(pendulo => {
          const penduloData = dados.pendulos[pendulo];
          const penduloInfo = {
            numero: parseInt(pendulo.replace('P', '')) || parseInt(pendulo),
            totalSensores: penduloData.sensores ? Object.keys(penduloData.sensores).length : 
                         Array.isArray(penduloData) ? 1 : 0
          };

          analise.arcos[1].pendulos.push(penduloInfo);
          analise.arcos[1].totalSensores += penduloInfo.totalSensores;
        });

        analise.arcos[1].totalPendulos = analise.arcos[1].pendulos.length;
        analise.estatisticas.totalPendulos = analise.arcos[1].totalPendulos;
        analise.estatisticas.totalSensores = analise.arcos[1].totalSensores;
      }

      // Se há leitura, usar ela para determinar estrutura
      if (dados.leitura && Object.keys(analise.arcos).length === 0) {
        console.log('Processando estrutura a partir das leituras:', dados.leitura);

        analise.arcos[1] = {
          totalPendulos: 0,
          totalSensores: 0,
          pendulos: []
        };

        Object.keys(dados.leitura).forEach(pendulo => {
          const sensores = dados.leitura[pendulo];
          const penduloInfo = {
            numero: parseInt(pendulo.replace('P', '').replace('C', '')) || 1,
            totalSensores: Object.keys(sensores).length
          };

          analise.arcos[1].pendulos.push(penduloInfo);
          analise.arcos[1].totalSensores += penduloInfo.totalSensores;
        });

        analise.arcos[1].totalPendulos = analise.arcos[1].pendulos.length;
        analise.estatisticas.totalPendulos = analise.arcos[1].totalPendulos;
        analise.estatisticas.totalSensores = analise.arcos[1].totalSensores;
      }

      // Se ainda não há dados, criar estrutura mínima baseada nos dados brutos
      if (Object.keys(analise.arcos).length === 0 && typeof dados === 'object') {
        console.log('Criando estrutura mínima baseada nos dados disponíveis');

        analise.arcos[1] = {
          totalPendulos: 1,
          totalSensores: 1,
          pendulos: [{
            numero: 1,
            totalSensores: 1
          }]
        };
        analise.estatisticas.totalPendulos = 1;
        analise.estatisticas.totalSensores = 1;
      }

      console.log('Análise final gerada:', JSON.stringify(analise, null, 2));
      return analise;

    } catch (error) {
      console.error('Erro ao analisar estrutura dos arcos:', error);
      return null;
    }
  }

  static gerarLayoutAutomatico(analise) {
    console.log('=== GERANDO LAYOUT AUTOMÁTICO ===');
    console.log('Análise recebida:', JSON.stringify(analise, null, 2));

    if (!analise) return null;

    const layouts = {};

    Object.keys(analise.arcos).forEach(numeroArco => {
      const arco = analise.arcos[numeroArco];
      const layout = {
        desenho_sensores: {
          pos_x_cabo: []
        }
      };

      // Calcular posições X dos cabos/pêndulos
      const larguraTotal = 350;
      const margemLateral = 50;
      const larguraDisponivel = larguraTotal - (2 * margemLateral);
      const espacamento = arco.totalPendulos > 1 ? larguraDisponivel / (arco.totalPendulos - 1) : 0;

      for (let i = 0; i < arco.totalPendulos; i++) {
        const posX = arco.totalPendulos === 1 
          ? larguraTotal / 2 
          : margemLateral + (i * espacamento);
        layout.desenho_sensores.pos_x_cabo.push(posX);
      }

      layouts[`arco_${numeroArco}`] = layout;
    });

    console.log('Layouts gerados:', JSON.stringify(layouts, null, 2));
    return layouts;
  }

  static converterDadosPortalParaArmazem(dadosPortal, numeroArco) {
    console.log('=== CONVERTENDO DADOS PARA ARMAZÉM ===');
    console.log('Dados do portal:', JSON.stringify(dadosPortal, null, 2));
    console.log('Número do arco:', numeroArco);

    if (!dadosPortal) return null;

    const dadosConvertidos = {
      leitura: {}
    };

    // Se há leitura direta, usar ela
    if (dadosPortal.leitura) {
      dadosConvertidos.leitura = dadosPortal.leitura;
    }

    // Se há pêndulos, converter para formato de leitura
    if (dadosPortal.pendulos) {
      Object.keys(dadosPortal.pendulos).forEach((penduloKey, index) => {
        const penduloData = dadosPortal.pendulos[penduloKey];
        const penduloId = `P${index + 1}`;

        // Se é array (formato simples): [falha, ponto_quente, ativo, temperatura]
        if (Array.isArray(penduloData)) {
          dadosConvertidos.leitura[penduloId] = {
            '1': [
              penduloData[3] || 0,        // temperatura
              penduloData[1] || false,    // ponto_quente  
              false,                      // pre_alarme
              penduloData[0] || false,    // falha
              penduloData[2] !== false    // ativo
            ]
          };
        }
        // Se é objeto com sensores
        else if (penduloData && penduloData.sensores) {
          dadosConvertidos.leitura[penduloId] = penduloData.sensores;
        }
        // Se é objeto simples
        else if (typeof penduloData === 'object') {
          dadosConvertidos.leitura[penduloId] = {
            '1': [
              penduloData.temperatura || 0,
              penduloData.ponto_quente || false,
              penduloData.pre_alarme || false,
              penduloData.falha || false,
              penduloData.ativo !== false
            ]
          };
        }
      });
    }

    console.log('Dados convertidos:', JSON.stringify(dadosConvertidos, null, 2));
    return dadosConvertidos;
  }
}

export default LayoutManager;