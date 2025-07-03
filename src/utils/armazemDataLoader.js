
/**
 * Utilitário para carregar e processar dados do armazém de forma dinâmica
 */

class ArmazemDataLoader {
  constructor() {
    this.dadosCache = null;
    this.layoutCache = null;
  }

  /**
   * Carrega dados do JSON (simulando chamada de API)
   */
  async carregarDados() {
    try {
      // Em produção, isso seria uma chamada para API
      const response = await fetch('/src/data/dadosArmazemTopo.json');
      const dados = await response.json();
      
      this.dadosCache = dados;
      return dados;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Fallback para dados hardcoded se necessário
      return this.getDadosFallback();
    }
  }

  /**
   * Processa dados para componente TopoArmazem
   */
  processarParaTopo(dados) {
    if (!dados) return null;

    const layout = this.gerarLayoutTopo(dados.layout);
    const sensores = this.formatarSensoresParaTopo(dados.sensores);
    
    return {
      layout,
      sensores,
      configuracao: {
        layout_topo: layout
      }
    };
  }

  /**
   * Processa dados para componente Armazem3D
   */
  processarParaArmazem3D(dados) {
    if (!dados) return null;

    const numArcos = dados.layout.arcos.length;
    const numCelulas = dados.layout.celulas.length;
    const sensoresFormatados = this.formatarSensoresPara3D(dados.sensores, dados.layout.arcos);

    return {
      numeroArcos: numArcos,
      numeroCelulas: numCelulas,
      sensores: sensoresFormatados,
      ambiente: dados.ambiente,
      armazem: dados.armazem
    };
  }

  /**
   * Gera layout para vista de topo baseado no JSON
   */
  gerarLayoutTopo(layoutData) {
    const layout = {
      celulas: {
        tamanho_svg: [layoutData.dimensoes.largura_svg, layoutData.dimensoes.altura_svg],
        fundo: [
          layoutData.fundo.x,
          layoutData.fundo.y,
          layoutData.fundo.largura,
          layoutData.fundo.altura
        ]
      },
      aeradores: {}
    };

    // Processar células
    layoutData.celulas.forEach(celula => {
      layout.celulas[celula.id.toString()] = [
        celula.x,
        celula.y,
        celula.largura,
        celula.altura
      ];
    });

    // Processar aeradores
    layoutData.aeradores.forEach(aerador => {
      layout.aeradores[aerador.id.toString()] = [
        aerador.x,
        aerador.y,
        aerador.tipo
      ];
    });

    // Processar arcos
    layoutData.arcos.forEach(arco => {
      layout[arco.id.toString()] = {
        celula: arco.celula,
        pos_x: arco.pos_x,
        sensores: {}
      };

      arco.sensores.forEach(sensor => {
        layout[arco.id.toString()].sensores[sensor.id.toString()] = sensor.pos_y;
      });
    });

    return layout;
  }

  /**
   * Formata sensores para componente TopoArmazem
   */
  formatarSensoresParaTopo(sensores) {
    const formatados = {};
    
    Object.entries(sensores).forEach(([id, dados]) => {
      formatados[id] = [
        dados.falha,
        dados.ponto_quente,
        dados.ativo,
        dados.temperatura
      ];
    });

    return formatados;
  }

  /**
   * Formata sensores para componente Armazem3D
   */
  formatarSensoresPara3D(sensores, arcos) {
    const dadosFormatados = {};

    arcos.forEach(arco => {
      dadosFormatados[arco.id] = {
        celula: arco.celula,
        sensores: arco.sensores.map(sensor => ({
          id: sensor.id,
          ...sensores[sensor.id.toString()]
        }))
      };
    });

    return dadosFormatados;
  }

  /**
   * Calcula dimensões dinâmicas baseadas no layout
   */
  calcularDimensoes(layoutData) {
    const numArcos = layoutData.arcos.length;
    const numCelulas = layoutData.celulas.length;
    
    return {
      larguraArmazem: numArcos * 3.5,
      alturaArmazem: 8,
      profundidadeArmazem: 6,
      espacamentoArcos: 30,
      sensoresPorArco: layoutData.arcos[0]?.sensores.length || 3
    };
  }

  /**
   * Valida estrutura dos dados JSON
   */
  validarEstrutura(dados) {
    const camposObrigatorios = [
      'sensores',
      'layout',
      'layout.arcos',
      'layout.celulas',
      'layout.aeradores'
    ];

    return camposObrigatorios.every(campo => {
      const valor = campo.split('.').reduce((obj, prop) => obj?.[prop], dados);
      return valor !== undefined && valor !== null;
    });
  }

  /**
   * Dados de fallback em caso de erro
   */
  getDadosFallback() {
    return {
      sensores: {},
      layout: {
        dimensoes: { largura_svg: 600, altura_svg: 388 },
        celulas: [
          { id: 1, x: 5, y: 50, largura: 188, altura: 254 }
        ],
        arcos: [
          { id: 1, celula: 1, pos_x: 30, sensores: [{ id: 1, pos_y: 75 }] }
        ],
        aeradores: []
      },
      ambiente: {},
      armazem: {}
    };
  }

  /**
   * Simula chamada de API com dados dinâmicos
   */
  async simularAPI(configuracao = {}) {
    // Simula diferentes configurações de armazém
    const configs = {
      pequeno: {
        numArcos: 5,
        numCelulas: 2,
        sensoresPorArco: 2
      },
      medio: {
        numArcos: 10,
        numCelulas: 3,
        sensoresPorArco: 3
      },
      grande: {
        numArcos: 19,
        numCelulas: 3,
        sensoresPorArco: 3
      }
    };

    const config = configs[configuracao.tamanho] || configs.grande;
    return this.gerarDadosDinamicos(config);
  }

  /**
   * Gera dados dinâmicos baseado em configuração
   */
  gerarDadosDinamicos(config) {
    const dados = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      },
      sensores: {},
      layout: {
        dimensoes: { largura_svg: 600, altura_svg: 388 },
        celulas: [],
        arcos: [],
        aeradores: []
      }
    };

    // Gerar células
    const larguraCelula = 590 / config.numCelulas;
    for (let i = 0; i < config.numCelulas; i++) {
      dados.layout.celulas.push({
        id: i + 1,
        x: 5 + (i * larguraCelula),
        y: 50,
        largura: larguraCelula - 10,
        altura: 254
      });
    }

    // Gerar arcos e sensores
    let sensorId = 1;
    const espacamentoArco = 560 / config.numArcos;
    
    for (let i = 0; i < config.numArcos; i++) {
      const celulaId = Math.floor(i / (config.numArcos / config.numCelulas)) + 1;
      const arco = {
        id: i + 1,
        celula: Math.min(celulaId, config.numCelulas),
        pos_x: 30 + (i * espacamentoArco),
        sensores: []
      };

      // Gerar sensores para este arco
      for (let j = 0; j < config.sensoresPorArco; j++) {
        const posY = 75 + (j * 75);
        arco.sensores.push({
          id: sensorId,
          pos_y: posY
        });

        // Gerar dados do sensor
        dados.sensores[sensorId.toString()] = {
          falha: Math.random() < 0.05, // 5% chance de falha
          ponto_quente: Math.random() < 0.1, // 10% chance de ponto quente
          ativo: true,
          temperatura: Math.round((Math.random() * 10 + 20) * 10) / 10 // 20-30°C
        };

        sensorId++;
      }

      dados.layout.arcos.push(arco);
    }

    return dados;
  }
}

// Instância singleton
export default new ArmazemDataLoader();
