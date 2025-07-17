class LayoutManager {
  static layoutsArmazem = null;
  static layoutsArmazemPortal = null;

  // Carregar layouts do JSON antigo (comentado para manter compatibilidade)
  static async carregarLayoutsArmazem() {
    if (this.layoutsArmazem) return this.layoutsArmazem;

    try {
      // Layout antigo (mantido comentado)
      const response = await fetch('/models/armazem_1751288511791.json');
      this.layoutsArmazem = await response.json();
      return this.layoutsArmazem;
    } catch (error) {
      console.error('Erro ao carregar layouts do armazém:', error);
      return {};
    }
  }

  // Carregar novo modelo ArmazemPortal
  static async carregarLayoutsArmazemPortal() {
    if (this.layoutsArmazemPortal) return this.layoutsArmazemPortal;

    try {
      const response = await fetch('/models/modeloRotaCelular1ArmazemPortal_1751295173920.json');
      this.layoutsArmazemPortal = await response.json();
      return this.layoutsArmazemPortal;
    } catch (error) {
      console.error('Erro ao carregar layouts do ArmazemPortal:', error);
      return {};
    }
  }

  // Listar layouts disponíveis
  static listarLayouts(tipo = "armazem") {
    if (tipo === "armazem" && this.layoutsArmazem) {
      return Object.keys(this.layoutsArmazem);
    }
    if (tipo === "portal" && this.layoutsArmazemPortal) {
      return ["ArmazemPortal"];
    }
    return [];
  }

  // Obter configuração de um layout específico
  static obterLayout(tipo, nome) {
    if (tipo === "armazem" && this.layoutsArmazem) {
      return this.layoutsArmazem[nome];
    }
    return null;
  }

  // Adaptar layout para dados específicos
  static adaptarLayoutParaDados(tipo, nomeLayout, dados) {
    if (tipo !== "armazem" || !this.layoutsArmazem) return null;

    const layoutBase = this.layoutsArmazem[nomeLayout];
    if (!layoutBase) return null;

    const layoutAdaptado = JSON.parse(JSON.stringify(layoutBase)); // Deep clone

    // Analisar dados para determinar qual arco usar
    const pendulos = Object.keys(dados.leitura || {});
    const numeroPendulos = pendulos.map(p => parseInt(p)).sort((a, b) => a - b);

    // Encontrar o arco mais adequado baseado nos pêndulos disponíveis
    let arcoSelecionado = null;
    let melhorMatch = 0;

    layoutBase.arcos.forEach(arco => {
      const pendulosArco = arco.numero;
      const match = numeroPendulos.filter(p => pendulosArco.includes(p)).length;

      if (match > melhorMatch) {
        melhorMatch = match;
        arcoSelecionado = arco;
      }
    });

    if (arcoSelecionado) {
      // Adaptar o layout do arco selecionado
      const layoutArco = arcoSelecionado.layout_arco;

      // Ajustar posições dos cabos baseado nos dados reais
      const cabosReais = Object.keys(dados.leitura || {});
      const novoLayoutArco = {
        ...layoutArco,
        cabos: {}
      };

      // Mapear cabos reais para a estrutura do layout
      cabosReais.forEach((cabo, index) => {
        const numSensores = Object.keys(dados.leitura[cabo] || {}).length;
        novoLayoutArco.cabos[cabo] = numSensores;
      });

      return novoLayoutArco;
    }

    return layoutBase.arcos[0]?.layout_arco || null;
  }

  // Obter informações das células de um layout
  static obterInfoCelulas(nomeLayout) {
    if (!this.layoutsArmazem) return null;

    const layout = this.layoutsArmazem[nomeLayout];
    if (!layout) return null;

    const celulas = {};

    // Extrair informações das células do layout_topo
    Object.values(layout.layout_topo).forEach(pendulo => {
      if (pendulo.celula !== undefined) {
        const numCelula = pendulo.celula;
        if (!celulas[numCelula]) {
          celulas[numCelula] = {
            numero: numCelula,
            pendulos: [],
            sensores: 0
          };
        }

        // Adicionar pêndulo à célula
        const numSensores = Object.keys(pendulo.sensores || {}).length;
        celulas[numCelula].pendulos.push({
          posX: pendulo.pos_x,
          sensores: numSensores
        });
        celulas[numCelula].sensores += numSensores;
      }
    });

    return celulas;
  }

  // Determinar qual arco usar baseado no número do pêndulo
  static determinarArcoParaPendulo(nomeLayout, numeroPendulo) {
    if (!this.layoutsArmazem) return null;

    const layout = this.layoutsArmazem[nomeLayout];
    if (!layout) return null;

    // Encontrar em qual arco este pêndulo se encaixa
    for (const arco of layout.arcos) {
      if (arco.numero.includes(numeroPendulo)) {
        return arco.layout_arco;
      }
    }

    // Se não encontrar, retornar o primeiro arco
    return layout.arcos[0]?.layout_arco || null;
  }

  // Gerar estrutura de dados de exemplo baseada no layout
  static gerarDadosExemplo(nomeLayout) {
    if (!this.layoutsArmazem) return null;

    const layout = this.layoutsArmazem[nomeLayout];
    if (!layout) return null;

    const dadosExemplo = { leitura: {} };

    // Gerar dados para cada pêndulo baseado no layout_topo
    Object.keys(layout.layout_topo).forEach(key => {
      if (key === 'aeradores' || key === 'celulas') return;

      const pendulo = layout.layout_topo[key];
      const numeroPendulo = key;

      dadosExemplo.leitura[numeroPendulo] = {};

      // Gerar sensores para este pêndulo
      Object.keys(pendulo.sensores || {}).forEach((sensorKey, index) => {
        const sensorNum = index + 1;
        const temperatura = 20 + Math.random() * 15; // Temperatura entre 20-35°C

        dadosExemplo.leitura[numeroPendulo][sensorNum] = [
          temperatura,        // temperatura
          false,             // alarme
          false,             // pre_alarme
          false,             // falha
          true              // ativo
        ];
      });
    });

    return dadosExemplo;
  }

  // Métodos específicos para ArmazemPortal
  static async carregarDadosArmazemPortal() {
    await this.carregarLayoutsArmazemPortal();
    return this.layoutsArmazemPortal;
  }

  // Analisar estrutura dos arcos automaticamente
  static analisarEstruturaArcos(dadosPortal) {
    if (!dadosPortal?.arcos) return null;

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

  // Converter dados do ArmazemPortal para o formato esperado pelo componente
  static converterDadosPortalParaArmazem(dadosPortal, arcoAtual = 1) {
    if (!dadosPortal) return null;

    const dadosConvertidos = { leitura: {} };

    // Se arcoAtual for especificado, mostrar apenas esse arco
    if (arcoAtual && dadosPortal.arcos?.[arcoAtual]) {
      const pendulos = dadosPortal.arcos[arcoAtual];
      Object.entries(pendulos).forEach(([pendulo, sensores]) => {
        dadosConvertidos.leitura[pendulo] = sensores;
      });
    } else {
      // Converter dados detalhados dos arcos (tem prioridade)
      Object.entries(dadosPortal.arcos || {}).forEach(([arco, pendulos]) => {
        Object.entries(pendulos).forEach(([pendulo, sensores]) => {
          if (!dadosConvertidos.leitura[pendulo]) {
            dadosConvertidos.leitura[pendulo] = {};
          }

          // sensores = { "1": [temp, alarme, pre_alarme, falha, ativo], ... }
          Object.entries(sensores).forEach(([sensor, dadosSensor]) => {
            dadosConvertidos.leitura[pendulo][sensor] = dadosSensor;
          });
        });
      });

      // Para pêndulos que só estão em pendulos (sem dados detalhados), usar dados básicos
      Object.entries(dadosPortal.pendulos || {}).forEach(([pendulo, dados]) => {
        if (!dadosConvertidos.leitura[pendulo]) {
          // dados = [alarme, pre_alarme, ativo, temperatura_maxima]
          const [alarme, preAlarme, ativo, tempMaxima] = dados;

          dadosConvertidos.leitura[pendulo] = {
            "1": [tempMaxima, alarme, preAlarme, false, ativo]
          };
        }
      });
    }

    return dadosConvertidos;
  }

  // Obter dados de uma célula específica baseado na sequência de pêndulos
  static obterDadosCelula(dadosPortal, numeroCelula) {
    if (!dadosPortal?.configuracao?.sequencia_celulas) return null;

    // Encontrar a célula correta
    const celula = Object.values(dadosPortal.configuracao.sequencia_celulas)
      .find(c => c.celula === numeroCelula);

    if (!celula) return null;

    const dadosCelula = { leitura: {} };

    // Para cada pêndulo da célula, buscar seus dados nos arcos
    celula.sequencia_pendulos.forEach(pendulo => {
      const penduloStr = pendulo.toString();

      // Buscar nos arcos
      Object.entries(dadosPortal.arcos || {}).forEach(([arco, pendulos]) => {
        if (pendulos[penduloStr]) {
          dadosCelula.leitura[penduloStr] = pendulos[penduloStr];
        }
      });

      // Se não encontrou nos arcos, usar dados básicos
      if (!dadosCelula.leitura[penduloStr] && dadosPortal.pendulos?.[penduloStr]) {
        const [alarme, preAlarme, ativo, tempMaxima] = dadosPortal.pendulos[penduloStr];
        dadosCelula.leitura[penduloStr] = {
          "1": [tempMaxima, alarme, preAlarme, false, ativo]
        };
      }
    });

    return dadosCelula;
  }

  // Obter informações sobre células do ArmazemPortal
  static obterInfoCelulasPortal(dadosPortal) {
    if (!dadosPortal?.configuracao?.sequencia_celulas) return null;

    const celulas = {};

    Object.entries(dadosPortal.configuracao.sequencia_celulas).forEach(([key, celula]) => {
      const numCelula = celula.celula;
      celulas[numCelula] = {
        numero: numCelula,
        pendulos: celula.sequencia_pendulos,
        totalPendulos: celula.sequencia_pendulos.length
      };
    });

    return celulas;
  }

  // Gerar distribuição piramidal de sensores
  static gerarDistribuicaoPiramidal(totalPendulos, totalSensores) {
    if (totalPendulos === 1) return [totalSensores];

    const minSensores = 5;
    const distribuicao = new Array(totalPendulos).fill(minSensores);
    let sensoresRestantes = totalSensores - (totalPendulos * minSensores);

    const centro = Math.floor(totalPendulos / 2);
    for (let offset = 0; offset <= centro && sensoresRestantes > 0; offset++) {
      const indices = offset === 0 ? [centro] : 
                     totalPendulos % 2 === 1 ? [centro - offset, centro + offset] :
                     offset === 1 ? [centro - 1, centro] : [centro - offset, centro + offset - 1];

      indices.forEach(idx => {
        if (idx >= 0 && idx < totalPendulos && sensoresRestantes > 0) {
          distribuicao[idx]++;
          sensoresRestantes--;
        }
      });
    }

    return distribuicao;
  }

  // Gerar layout automático baseado na análise dos arcos
  static gerarLayoutAutomatico(analiseArcos) {
    if (!analiseArcos) return null;

    const layouts = {};

    // Calcular dimensões ideais uma única vez para todos os arcos
    let maxSensores = 0;
    let maxPendulos = 0;

    Object.values(analiseArcos.arcos).forEach(arco => {
      maxPendulos = Math.max(maxPendulos, arco.totalPendulos);
      arco.pendulos.forEach(pendulo => {
        maxSensores = Math.max(maxSensores, pendulo.totalSensores);
      });
    });

    // Calcular dimensões ideais
    const escala_sensores = 16;
    const dist_y_sensores = 12;
    const margemSuperior = 30;
    const margemInferior = 50;
    const margemPendulo = 20;

    const alturaBaseTelhado = 185;
    const alturaSensores = maxSensores * dist_y_sensores + escala_sensores;
    const alturaTotal = Math.max(
      alturaBaseTelhado, 
      margemSuperior + alturaSensores + margemInferior + margemPendulo
    );

    const larguraMinima = 350;
    const espacamentoPendulo = 50;
    const larguraCalculada = Math.max(larguraMinima, (maxPendulos * espacamentoPendulo) + 100);

    const dimensoesIdeais = {
      largura: larguraCalculada,
      altura: Math.max(alturaTotal, 250)
    };

    Object.entries(analiseArcos.arcos).forEach(([numeroArco, infoArco]) => {
      const totalPendulos = infoArco.totalPendulos;
      const totalSensores = infoArco.totalSensores;

      // Calcular distribuição piramidal baseada nos dados reais
      const distribuicaoReal = infoArco.pendulos.map(p => p.totalSensores);

      // Gerar posições dos pêndulos usando as dimensões calculadas
      const larguraBase = dimensoesIdeais.largura;
      const margemLateral = 50;
      const larguraUtil = larguraBase - (margemLateral * 2);
      const espacamento = totalPendulos > 1 ? larguraUtil / (totalPendulos - 1) : 0;

      const posicoes = [];
      for (let i = 0; i < totalPendulos; i++) {
        posicoes.push(margemLateral + (espacamento * i));
      }

      layouts[`arco_${numeroArco}`] = {
        tamanho_svg: [dimensoesIdeais.largura, dimensoesIdeais.altura],
        desenho_sensores: {
          escala_cores_sensores: 2,
          nome_sensores_direita: 0,
          nome_cabo_acima: 0,
          escala_sensores: 16,
          dist_y_sensores: 12,
          dist_y_nome_cabo: new Array(totalPendulos).fill(8),
          pos_x_cabos_uniforme: 1,
          pos_x_cabo: posicoes,
          pos_y_cabo: new Array(totalPendulos).fill(dimensoesIdeais.altura - 35),
        },
        desenho_arco: {
          tipo_telhado: 1,
          pb: dimensoesIdeais.altura - 50,
          lb: dimensoesIdeais.largura,
          hb: 30,
          hf: 5,
          lf: 250,
          le: 15,
          ht: 50,
          ctrl_p1: [60, 30],
          ctrl_p2: [97, 10],
        },
        cabos: Object.fromEntries(
          infoArco.pendulos.map((pendulo, index) => [
            pendulo.numero.toString(),
            pendulo.totalSensores
          ])
        ),
        distribuicao_sensores: distribuicaoReal,
        pendulos_ordem: infoArco.pendulos.map(p => p.numero)
      };
    });

    return layouts;
  }

  // Gerar dados exemplo para ArmazemPortal
  static gerarDadosExemploPortal() {
    const dados = {
      pendulos: {},
      arcos: {},
      configuracao: {
        layout_topo: {
          celulas: {
            tamanho_svg: [600, 388],
            fundo: [5, 49, 590, 256],
            "1": [5, 50, 188, 254],
            "2": [197, 50, 206, 254],
            "3": [407, 50, 188, 254]
          },
          aeradores: {}
        }
      }
    };

    const totalPendulos = 57;
    const totalArcos = 19;
    const numPendulosPorArco = Math.floor(totalPendulos / totalArcos);
    const numSensoresPorPendulo = 7;

    for (let arco = 1; arco <= totalArcos; arco++) {
      dados.arcos[arco] = {};

        for (let p = 1; p <= numPendulosPorArco; p++) {
          const idPendulo = ((arco - 1) * numPendulosPorArco) + p;
          dados.arcos[arco][idPendulo] = {};

          // Gerar dados simples para pêndulos
          const tempMedia = 20 + Math.random() * 15;
          const falhaGeral = Math.random() < 0.05;
          const pontoQuenteGeral = tempMedia > 30;
          const ativoGeral = Math.random() > 0.1;

          // Formato API para pêndulos: [falha, ponto_quente, ativo, temperatura]
          dados.pendulos[idPendulo] = [falhaGeral, pontoQuenteGeral, ativoGeral, tempMedia];

          for (let s = 1; s <= numSensoresPorPendulo; s++) {
            const temp = tempMedia + (Math.random() - 0.5) * 4;
            const pontoQuente = temp > 30;
            const falha = Math.random() < 0.02;
            const ativo = Math.random() > 0.05;

            // Formato API detalhado: [temperatura, ponto_quente, pre_alarme, falha, ativo]
            dados.arcos[arco][idPendulo][s] = [temp, pontoQuente, false, falha, ativo];
          }
        }
    }

    return dados;
  }
}

export default LayoutManager;