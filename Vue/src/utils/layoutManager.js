
class LayoutManager {
  static analisarEstruturaArcos(dados) {
    if (!dados?.arcos) return null;

    const arcos = {};
    let totalPendulos = 0;
    let totalSensores = 0;

    Object.entries(dados.arcos).forEach(([numeroArco, dadosArco]) => {
      const pendulos = [];
      let totalPendulosArco = 0;
      let totalSensoresArco = 0;

      Object.entries(dadosArco).forEach(([numeroPendulo, sensoresPendulo]) => {
        const totalSensoresPendulo = Object.keys(sensoresPendulo).length;

        pendulos.push({
          numero: parseInt(numeroPendulo),
          totalSensores: totalSensoresPendulo,
          sensores: Object.keys(sensoresPendulo).map(s => parseInt(s))
        });

        totalPendulosArco++;
        totalSensoresArco += totalSensoresPendulo;
      });

      arcos[numeroArco] = {
        numero: parseInt(numeroArco),
        totalPendulos: totalPendulosArco,
        totalSensores: totalSensoresArco,
        pendulos: pendulos.sort((a, b) => a.numero - b.numero)
      };

      totalPendulos += totalPendulosArco;
      totalSensores += totalSensoresArco;
    });

    return {
      totalArcos: Object.keys(arcos).length,
      arcos,
      estatisticas: {
        totalPendulos,
        totalSensores,
        mediaPendulosPorArco: totalPendulos / Object.keys(arcos).length,
        mediaSensoresPorArco: totalSensores / Object.keys(arcos).length
      }
    };
  }

  static gerarLayoutAutomatico(analiseArcos) {
    if (!analiseArcos) return null;

    const layouts = {};
    const margemLateral = 50;
    const espacamentoMinimo = 40;

    Object.entries(analiseArcos.arcos).forEach(([numeroArco, dadosArco]) => {
      const numPendulos = dadosArco.totalPendulos;
      const larguraTotal = Math.max(350, numPendulos * espacamentoMinimo + margemLateral * 2);

      const posicoes = [];
      if (numPendulos === 1) {
        posicoes.push(larguraTotal / 2);
      } else {
        const larguraUtil = larguraTotal - margemLateral * 2;
        const espacamento = larguraUtil / (numPendulos - 1);

        for (let i = 0; i < numPendulos; i++) {
          posicoes.push(margemLateral + i * espacamento);
        }
      }

      layouts[`arco_${numeroArco}`] = {
        tamanho_svg: [larguraTotal, 250],
        desenho_sensores: {
          pos_x_cabo: posicoes,
          pos_y_cabo: Array(numPendulos).fill(200),
          dist_y_nome_cabo: Array(numPendulos).fill(15),
          dist_y_sensores: 12,
          escala_sensores: 16,
          pos_x_cabos_uniforme: 0,
          nome_sensores_direita: 0,
          nome_cabo_acima: 1
        }
      };
    });

    return layouts;
  }

  static converterDadosPortalParaArmazem(dadosPortal, numeroArco) {
    if (!dadosPortal?.arcos?.[numeroArco]) {
      return { leitura: {} };
    }

    const arcoData = dadosPortal.arcos[numeroArco];
    const leitura = {};

    Object.entries(arcoData).forEach(([numeroPendulo, sensoresPendulo]) => {
      leitura[`P${numeroPendulo}`] = {};

      Object.entries(sensoresPendulo).forEach(([numeroSensor, dadosSensor]) => {
        // Formato: [temperatura, ponto_quente, pre_alarme, falha, ativo]
        leitura[`P${numeroPendulo}`][numeroSensor] = [
          dadosSensor[0] || 20 + Math.random() * 10, // temperatura
          dadosSensor[1] || false, // ponto_quente
          dadosSensor[2] || false, // pre_alarme
          dadosSensor[3] || false, // falha
          dadosSensor[4] !== undefined ? dadosSensor[4] : true // ativo
        ];
      });
    });

    return {
      leitura,
      configuracao: dadosPortal.configuracao || {}
    };
  }
}

export default LayoutManager;
