class LayoutManager {
  static layoutsArmazem = null;
  static layoutsArmazemPortal = null;

  // Carregar layouts do JSON antigo (comentado para manter compatibilidade)
  static async carregarLayoutsArmazem() {
    if (this.layoutsArmazem) return this.layoutsArmazem;

    try {
      // Layout antigo (mantido comentado)
      const response = await fetch('/attached_assets/armazem_1751288511791.json');
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
      const response = await fetch('/attached_assets/modeloRotaCelular1ArmazemPortal_1751295173920.json');
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

  // Converter dados do ArmazemPortal para o formato esperado pelo componente
  static converterDadosPortalParaArmazem(dadosPortal) {
    if (!dadosPortal) return null;

    const dadosConvertidos = { leitura: {} };

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

  // Gerar dados exemplo para ArmazemPortal
  static gerarDadosExemploPortal() {
    const totalPendulos = 57;
    const totalArcos = 19;
    
    const dadosExemplo = {
      pendulos: {},
      arcos: {},
      configuracao: {
        layout_topo: {},
        sequencia_celulas: {
          "131": { celula: 1, sequencia_pendulos: [] },
          "132": { celula: 2, sequencia_pendulos: [] },
          "133": { celula: 3, sequencia_pendulos: [] }
        }
      }
    };

    // Gerar pendulos básicos
    for (let p = 1; p <= totalPendulos; p++) {
      const temp = 20 + Math.random() * 15;
      const alarme = Math.random() < 0.1;
      dadosExemplo.pendulos[p] = [alarme, false, true, temp];
      
      // Distribuir pêndulos nas células
      if (p <= 18) dadosExemplo.configuracao.sequencia_celulas["131"].sequencia_pendulos.push(p);
      else if (p <= 39) dadosExemplo.configuracao.sequencia_celulas["132"].sequencia_pendulos.push(p);
      else dadosExemplo.configuracao.sequencia_celulas["133"].sequencia_pendulos.push(p);
    }

    // Gerar arcos com sensores detalhados
    for (let a = 1; a <= totalArcos; a++) {
      dadosExemplo.arcos[a] = {};
      
      // Cada arco tem 2-3 pêndulos
      const pendulosNoArco = Math.floor(totalPendulos / totalArcos);
      const inicio = (a - 1) * pendulosNoArco + 1;
      const fim = Math.min(a * pendulosNoArco, totalPendulos);
      
      for (let p = inicio; p <= fim; p++) {
        dadosExemplo.arcos[a][p] = {};
        
        // Cada pêndulo tem 4-11 sensores
        const numSensores = 4 + Math.floor(Math.random() * 8);
        for (let s = 1; s <= numSensores; s++) {
          const temp = 20 + Math.random() * 15;
          const alarme = Math.random() < 0.05;
          const falha = Math.random() < 0.02;
          
          dadosExemplo.arcos[a][p][s] = [temp, alarme, false, falha, true];
        }
      }
    }

    return dadosExemplo;
  }
}

export default LayoutManager;