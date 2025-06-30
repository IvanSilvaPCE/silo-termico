class LayoutManager {
  static layoutsArmazem = null;

  // Carregar layouts do JSON anexado
  static async carregarLayoutsArmazem() {
    if (this.layoutsArmazem) return this.layoutsArmazem;

    try {
      // Importar o JSON dos layouts padrão
      const response = await fetch('/attached_assets/armazem_1751288511791.json');
      this.layoutsArmazem = await response.json();
      return this.layoutsArmazem;
    } catch (error) {
      console.error('Erro ao carregar layouts do armazém:', error);
      return {};
    }
  }

  // Listar layouts disponíveis
  static listarLayouts(tipo = "armazem") {
    if (tipo === "armazem" && this.layoutsArmazem) {
      return Object.keys(this.layoutsArmazem);
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
}

export default LayoutManager;