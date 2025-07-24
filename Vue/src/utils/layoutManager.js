
class LayoutManager {
  static analisarEstruturaArcos(dadosPortal) {
    if (!dadosPortal?.arcos) {
      console.error('Dados do portal não encontrados ou sem arcos');
      return null;
    }

    const analise = {
      totalArcos: Object.keys(dadosPortal.arcos).length,
      arcos: {},
      estatisticas: {
        totalPendulos: 0,
        totalSensores: 0,
        pendulosPorArco: [],
        sensoresPorPendulo: []
      }
    };

    Object.entries(dadosPortal.arcos).forEach(([numeroArco, pendulos]) => {
      const pendulosDoArco = Object.keys(pendulos);
      const infoArco = {
        numeroArco: parseInt(numeroArco),
        pendulos: [],
        totalPendulos: pendulosDoArco.length,
        totalSensores: 0
      };

      pendulosDoArco.forEach(numeroPendulo => {
        const sensores = pendulos[numeroPendulo];
        const numerosSensores = Object.keys(sensores);
        const infoPendulo = {
          numero: parseInt(numeroPendulo),
          totalSensores: numerosSensores.length,
          sensores: sensores
        };

        infoArco.pendulos.push(infoPendulo);
        infoArco.totalSensores += infoPendulo.totalSensores;
        analise.estatisticas.sensoresPorPendulo.push(infoPendulo.totalSensores);
      });

      analise.arcos[numeroArco] = infoArco;
      analise.estatisticas.totalPendulos += infoArco.totalPendulos;
      analise.estatisticas.totalSensores += infoArco.totalSensores;
      analise.estatisticas.pendulosPorArco.push(infoArco.totalPendulos);
    });

    return analise;
  }

  static gerarLayoutAutomatico(analise) {
    if (!analise) {
      console.error('Análise de estrutura não fornecida');
      return null;
    }

    const layouts = {};

    Object.entries(analise.arcos).forEach(([numeroArco, infoArco]) => {
      // Calcular espaçamento baseado no número de pêndulos
      const espacamentoBase = Math.max(50, 400 / (infoArco.totalPendulos + 1));
      const margemLateral = espacamentoBase;

      // Posições dos cabos distribuídas uniformemente
      const posicoesCabos = infoArco.pendulos.map((pendulo, index) => {
        return margemLateral + (index * espacamentoBase);
      });

      layouts[`arco_${numeroArco}`] = {
        arco: parseInt(numeroArco),
        totalPendulos: infoArco.totalPendulos,
        totalSensores: infoArco.totalSensores,
        desenho_sensores: {
          pos_x_cabo: posicoesCabos,
          escala_sensores: 16,
          dist_y_sensores: 12
        }
      };
    });

    return layouts;
  }

  static converterDadosPortalParaArmazem(dadosPortal, numeroArco) {
    const dadosConvertidos = {
      leitura: {}
    };

    if (dadosPortal.arcos && dadosPortal.arcos[numeroArco]) {
      Object.entries(dadosPortal.arcos[numeroArco]).forEach(([pendulo, sensores]) => {
        dadosConvertidos.leitura[pendulo] = {};
        Object.entries(sensores).forEach(([sensorKey, dadosSensor]) => {
          const [temp, pontoQuente, preAlarme, falha, ativo] = dadosSensor;
          dadosConvertidos.leitura[pendulo][sensorKey] = [
            parseFloat(temp) || 0,
            pontoQuente || false,
            preAlarme || false,
            falha || false,
            ativo !== false
          ];
        });
      });
    }

    return dadosConvertidos;
  }
}

export default LayoutManager;
