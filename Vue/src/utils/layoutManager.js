
class LayoutManager {
  static analisarEstruturaArcos(dados) {
    if (!dados) {
      console.error("Dados não fornecidos para análise");
      return null;
    }

    try {
      const analise = {
        totalArcos: 1,
        arcos: {},
        estatisticas: {
          totalPendulos: 0,
          totalSensores: 0,
        },
      };

      // Se há configuração, usar ela
      if (dados.configuracao) {
        // Processar arcos da configuração
        if (dados.configuracao.arcos) {
          Object.keys(dados.configuracao.arcos).forEach((numeroArco) => {
            const arcoConfig = dados.configuracao.arcos[numeroArco];
            analise.arcos[numeroArco] = {
              totalPendulos: arcoConfig.pendulos
                ? arcoConfig.pendulos.length
                : 0,
              totalSensores: 0,
              pendulos: [],
            };

            if (arcoConfig.pendulos) {
              arcoConfig.pendulos.forEach((pendulo) => {
                const penduloInfo = {
                  numero: pendulo.numero || pendulo.id,
                  totalSensores: pendulo.sensores ? pendulo.sensores.length : 0,
                };
                analise.arcos[numeroArco].pendulos.push(penduloInfo);
                analise.arcos[numeroArco].totalSensores +=
                  penduloInfo.totalSensores;
              });
            }

            analise.estatisticas.totalPendulos +=
              analise.arcos[numeroArco].totalPendulos;
            analise.estatisticas.totalSensores +=
              analise.arcos[numeroArco].totalSensores;
          });

          analise.totalArcos = Object.keys(dados.configuracao.arcos).length;
        }
      }

      // Se há pêndulos diretamente, processar
      if (dados.pendulos) {
        if (!analise.arcos[1]) {
          analise.arcos[1] = {
            totalPendulos: 0,
            totalSensores: 0,
            pendulos: [],
          };
        }

        Object.keys(dados.pendulos).forEach((pendulo) => {
          const penduloData = dados.pendulos[pendulo];
          const penduloInfo = {
            numero: parseInt(pendulo.replace("P", "")) || parseInt(pendulo),
            totalSensores: penduloData.sensores
              ? Object.keys(penduloData.sensores).length
              : Array.isArray(penduloData)
                ? 1
                : 0,
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
        analise.arcos[1] = {
          totalPendulos: 0,
          totalSensores: 0,
          pendulos: [],
        };

        Object.keys(dados.leitura).forEach((pendulo) => {
          const sensores = dados.leitura[pendulo];
          const penduloInfo = {
            numero: parseInt(pendulo.replace("P", "").replace("C", "")) || 1,
            totalSensores: Object.keys(sensores).length,
          };

          analise.arcos[1].pendulos.push(penduloInfo);
          analise.arcos[1].totalSensores += penduloInfo.totalSensores;
        });

        analise.arcos[1].totalPendulos = analise.arcos[1].pendulos.length;
        analise.estatisticas.totalPendulos = analise.arcos[1].totalPendulos;
        analise.estatisticas.totalSensores = analise.arcos[1].totalSensores;
      }

      // Se ainda não há dados, criar estrutura mínima baseada nos dados brutos
      if (
        Object.keys(analise.arcos).length === 0 &&
        typeof dados === "object"
      ) {
        analise.arcos[1] = {
          totalPendulos: 1,
          totalSensores: 1,
          pendulos: [
            {
              numero: 1,
              totalSensores: 1,
            },
          ],
        };
        analise.estatisticas.totalPendulos = 1;
        analise.estatisticas.totalSensores = 1;
      }

      return analise;
    } catch (error) {
      console.error("Erro ao analisar estrutura dos arcos:", error);
      return null;
    }
  }

  static gerarLayoutAutomatico(analiseArcos) {
    if (!analiseArcos || !analiseArcos.arcos) {
      return {}
    }

    const layouts = {}

    Object.keys(analiseArcos.arcos).forEach(numeroArco => {
      const arco = analiseArcos.arcos[numeroArco]
      const totalPendulos = arco.totalPendulos || 0
      
      // Gerar posições uniformes para os cabos
      const posicoesCabos = []
      const larguraTotal = 350 // largura padrão do armazém
      const margemLateral = 35
      const larguraUtilizavel = larguraTotal - (2 * margemLateral)
      
      for (let i = 0; i < totalPendulos; i++) {
        if (totalPendulos === 1) {
          posicoesCabos.push(larguraTotal / 2)
        } else {
          const espacamento = larguraUtilizavel / (totalPendulos - 1)
          posicoesCabos.push(margemLateral + (i * espacamento))
        }
      }

      layouts[`arco_${numeroArco}`] = {
        arco: parseInt(numeroArco),
        totalPendulos: totalPendulos,
        desenho_sensores: {
          pos_x_cabo: posicoesCabos
        }
      }
    })

    return layouts
  }

  static converterDadosPortalParaArmazem(dadosPortal, numeroArco) {
    if (!dadosPortal) return null;

    const dadosConvertidos = {
      leitura: {},
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
            1: [
              penduloData[3] || 0, // temperatura
              penduloData[1] || false, // ponto_quente
              false, // pre_alarme
              penduloData[0] || false, // falha
              penduloData[2] !== false, // ativo
            ],
          };
        }
        // Se é objeto com sensores
        else if (penduloData && penduloData.sensores) {
          dadosConvertidos.leitura[penduloId] = penduloData.sensores;
        }
        // Se é objeto simples
        else if (typeof penduloData === "object") {
          dadosConvertidos.leitura[penduloId] = {
            1: [
              penduloData.temperatura || 0,
              penduloData.ponto_quente || false,
              penduloData.pre_alarme || false,
              penduloData.falha || false,
              penduloData.ativo !== false,
            ],
          };
        }
      });
    }

    return dadosConvertidos;
  }

  static gerarLayoutParaArco(arco) {
    if (!arco || !arco.pendulos) {
      return {
        desenho_sensores: {
          pos_x_cabo: [175] // Posição padrão central
        }
      }
    }

    const totalPendulos = arco.pendulos.length
    const larguraBase = 350 // Largura padrão do armazém
    const margemLateral = 35
    const larguraUtilizavel = larguraBase - (2 * margemLateral)

    const posicoesCabos = []

    if (totalPendulos === 1) {
      // Um único pêndulo no centro
      posicoesCabos.push(larguraBase / 2)
    } else {
      // Distribuir uniformemente
      const espacamento = larguraUtilizavel / (totalPendulos - 1)
      
      for (let i = 0; i < totalPendulos; i++) {
        const posicao = margemLateral + (i * espacamento)
        posicoesCabos.push(posicao)
      }
    }

    return {
      desenho_sensores: {
        pos_x_cabo: posicoesCabos
      }
    }
  }

  static calcularDimensoesIdeais(analiseArcos) {
    if (!analiseArcos) return { largura: 350, altura: 200 }

    let maxSensores = 0
    let maxPendulos = 0

    Object.values(analiseArcos.arcos).forEach(arco => {
      maxPendulos = Math.max(maxPendulos, arco.totalPendulos)
      arco.pendulos.forEach(pendulo => {
        maxSensores = Math.max(maxSensores, pendulo.totalSensores)
      })
    })

    const escala_sensores = 16
    const dist_y_sensores = 12
    const margemSuperior = 30
    const margemInferior = 50
    const margemPendulo = 20

    const alturaBaseTelhado = 185
    const alturaSensores = maxSensores * dist_y_sensores + escala_sensores
    const alturaTotal = Math.max(
      alturaBaseTelhado,
      margemSuperior + alturaSensores + margemInferior + margemPendulo
    )

    const larguraMinima = 350
    const espacamentoPendulo = 50
    const larguraCalculada = Math.max(larguraMinima, (maxPendulos * espacamentoPendulo) + 100)

    return {
      largura: larguraCalculada,
      altura: Math.max(alturaTotal, 250)
    }
  }
}

export default LayoutManager;
