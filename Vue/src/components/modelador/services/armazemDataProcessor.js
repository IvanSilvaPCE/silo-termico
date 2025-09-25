/**
 * Serviço para processar dados do armazém e aplicar modelos de arcos
 * Converte dados da API em estrutura compatível com o sistema de modelagem
 */

import LayoutManager from '../utils/layoutManager.js'

const ArmazemDataProcessor = {
  /**
   * Lógicas de distribuição dos modelos de arcos
   */
  logicas: {
    1: 'Modelo Único',
    2: 'Par/Ímpar', 
    3: 'Frente/Fundo + Par/Ímpar',
    4: 'Frente/Par/Ímpar/Fundo'
  },

  /**
   * Processa dados brutos da API do armazém
   * @param {Object} dadosAPI - Dados vindos da API do armazém
   * @param {Number} tipoModelo - Tipo do modelo (1-4)
   * @returns {Object} Dados processados e organizados por modelo
   */
  processarDadosArmazem(dadosAPI, tipoModelo = 1) {
    if (!dadosAPI || !dadosAPI.arcos) {
      console.warn('Dados da API inválidos ou sem arcos')
      return this.criarEstruturaPadrao()
    }

    // Analisar estrutura dos arcos usando o layoutManager existente
    const analiseArcos = LayoutManager.analisarEstruturaArcos(dadosAPI)
    
    // Aplicar lógica do modelo selecionado
    const dadosProcessados = this.aplicarLogicaModelo(dadosAPI, analiseArcos, tipoModelo)

    return {
      dadosOriginais: dadosAPI,
      analiseArcos: analiseArcos,
      modeloAplicado: {
        tipo: tipoModelo,
        nome: this.logicas[tipoModelo],
        dados: dadosProcessados
      },
      metadados: {
        processadoEm: new Date().toISOString(),
        totalArcos: analiseArcos.totalArcos,
        totalPendulos: analiseArcos.estatisticas.totalPendulos,
        totalSensores: analiseArcos.estatisticas.totalSensores
      }
    }
  },

  /**
   * Aplica a lógica do modelo selecionado aos dados
   * @param {Object} dadosAPI - Dados originais da API
   * @param {Object} analiseArcos - Análise da estrutura dos arcos
   * @param {Number} tipoModelo - Tipo do modelo (1-4)
   * @returns {Object} Dados organizados por modelo
   */
  aplicarLogicaModelo(dadosAPI, analiseArcos, tipoModelo) {
    switch(tipoModelo) {
      case 1:
        return this.aplicarModeloUnico(dadosAPI, analiseArcos)
      case 2:
        return this.aplicarModeloParImpar(dadosAPI, analiseArcos)
      case 3:
        return this.aplicarModeloFrenteFundoParImpar(dadosAPI, analiseArcos)
      case 4:
        return this.aplicarModeloFrenteParImparFundo(dadosAPI, analiseArcos)
      default:
        console.warn(`Tipo de modelo ${tipoModelo} não reconhecido, usando Modelo Único`)
        return this.aplicarModeloUnico(dadosAPI, analiseArcos)
    }
  },

  /**
   * Modelo 1: Modelo Único - todos os arcos usam o mesmo modelo
   */
  aplicarModeloUnico(dadosAPI, analiseArcos) {
    // Usar o primeiro arco como modelo base
    const primeiroArco = Object.keys(dadosAPI.arcos)[0]
    const modeloBase = this.extrairModeloDoArco(dadosAPI.arcos[primeiroArco], analiseArcos.arcos[primeiroArco])

    return {
      quantidadeModelos: 1,
      modelos: {
        1: {
          nome: 'Modelo Único',
          posicao: 'todos',
          configuracao: modeloBase.configuracao,
          sensoresPorPendulo: modeloBase.sensoresPorPendulo,
          quantidadePendulos: modeloBase.quantidadePendulos,
          dadosSensores: modeloBase.dadosSensores,
          arcosAssociados: Object.keys(dadosAPI.arcos).map(n => parseInt(n))
        }
      },
      mapeamentoArcos: this.criarMapeamentoArcos(analiseArcos.totalArcos, [1], 1)
    }
  },

  /**
   * Modelo 2: Par/Ímpar - arcos pares e ímpares têm modelos diferentes
   */
  aplicarModeloParImpar(dadosAPI, analiseArcos) {
    const arcosImpares = []
    const arcosPares = []

    // Separar arcos por paridade
    Object.keys(dadosAPI.arcos).forEach(numeroArco => {
      const num = parseInt(numeroArco)
      if (num % 2 === 0) {
        arcosPares.push(num)
      } else {
        arcosImpares.push(num)
      }
    })

    // Criar modelos baseados em arcos representativos
    const modeloImpar = arcosImpares.length > 0 ? 
      this.extrairModeloDoArco(dadosAPI.arcos[arcosImpares[0]], analiseArcos.arcos[arcosImpares[0]]) :
      this.criarModeloPadrao()

    const modeloPar = arcosPares.length > 0 ? 
      this.extrairModeloDoArco(dadosAPI.arcos[arcosPares[0]], analiseArcos.arcos[arcosPares[0]]) :
      this.criarModeloPadrao()

    return {
      quantidadeModelos: 2,
      modelos: {
        1: {
          nome: 'Modelo Ímpar',
          posicao: 'impar',
          configuracao: modeloImpar.configuracao,
          sensoresPorPendulo: modeloImpar.sensoresPorPendulo,
          quantidadePendulos: modeloImpar.quantidadePendulos,
          dadosSensores: modeloImpar.dadosSensores,
          arcosAssociados: arcosImpares
        },
        2: {
          nome: 'Modelo Par',
          posicao: 'par',
          configuracao: modeloPar.configuracao,
          sensoresPorPendulo: modeloPar.sensoresPorPendulo,
          quantidadePendulos: modeloPar.quantidadePendulos,
          dadosSensores: modeloPar.dadosSensores,
          arcosAssociados: arcosPares
        }
      },
      mapeamentoArcos: this.criarMapeamentoArcos(analiseArcos.totalArcos, [1, 2], 2)
    }
  },

  /**
   * Modelo 3: Frente/Fundo + Par/Ímpar - 4 combinações
   */
  aplicarModeloFrenteFundoParImpar(dadosAPI, analiseArcos) {
    const totalArcos = analiseArcos.totalArcos
    const metade = Math.ceil(totalArcos / 2)

    const frenteImpares = []
    const frentePares = []
    const fundoImpares = []
    const fundoPares = []

    Object.keys(dadosAPI.arcos).forEach(numeroArco => {
      const num = parseInt(numeroArco)
      const isFrente = num <= metade
      const isImpar = num % 2 === 1

      if (isFrente && isImpar) frenteImpares.push(num)
      else if (isFrente && !isImpar) frentePares.push(num)
      else if (!isFrente && isImpar) fundoImpares.push(num)
      else fundoPares.push(num)
    })

    // Criar modelos baseados em representantes de cada grupo
    const grupos = [
      { nome: 'Frente Ímpar', posicao: 'frente_impar', arcos: frenteImpares },
      { nome: 'Frente Par', posicao: 'frente_par', arcos: frentePares },
      { nome: 'Fundo Ímpar', posicao: 'fundo_impar', arcos: fundoImpares },
      { nome: 'Fundo Par', posicao: 'fundo_par', arcos: fundoPares }
    ]

    const modelos = {}
    grupos.forEach((grupo, index) => {
      const modelo = grupo.arcos.length > 0 ?
        this.extrairModeloDoArco(dadosAPI.arcos[grupo.arcos[0]], analiseArcos.arcos[grupo.arcos[0]]) :
        this.criarModeloPadrao()

      modelos[index + 1] = {
        nome: grupo.nome,
        posicao: grupo.posicao,
        configuracao: modelo.configuracao,
        sensoresPorPendulo: modelo.sensoresPorPendulo,
        quantidadePendulos: modelo.quantidadePendulos,
        dadosSensores: modelo.dadosSensores,
        arcosAssociados: grupo.arcos
      }
    })

    return {
      quantidadeModelos: 4,
      modelos: modelos,
      mapeamentoArcos: this.criarMapeamentoArcos(analiseArcos.totalArcos, [1, 2, 3, 4], 3)
    }
  },

  /**
   * Modelo 4: Frente/Par/Ímpar/Fundo - 4 grupos sequenciais
   */
  aplicarModeloFrenteParImparFundo(dadosAPI, analiseArcos) {
    const totalArcos = analiseArcos.totalArcos
    const quartoArcos = Math.ceil(totalArcos / 4)

    const grupos = [
      { nome: 'Frente', posicao: 'frente', inicio: 1, fim: quartoArcos },
      { nome: 'Par', posicao: 'par', inicio: quartoArcos + 1, fim: quartoArcos * 2 },
      { nome: 'Ímpar', posicao: 'impar', inicio: quartoArcos * 2 + 1, fim: quartoArcos * 3 },
      { nome: 'Fundo', posicao: 'fundo', inicio: quartoArcos * 3 + 1, fim: totalArcos }
    ]

    const modelos = {}
    grupos.forEach((grupo, index) => {
      // Encontrar arcos neste intervalo
      const arcosGrupo = Object.keys(dadosAPI.arcos)
        .map(n => parseInt(n))
        .filter(n => n >= grupo.inicio && n <= grupo.fim)

      const modelo = arcosGrupo.length > 0 ?
        this.extrairModeloDoArco(dadosAPI.arcos[arcosGrupo[0]], analiseArcos.arcos[arcosGrupo[0]]) :
        this.criarModeloPadrao()

      modelos[index + 1] = {
        nome: grupo.nome,
        posicao: grupo.posicao,
        configuracao: modelo.configuracao,
        sensoresPorPendulo: modelo.sensoresPorPendulo,
        quantidadePendulos: modelo.quantidadePendulos,
        dadosSensores: modelo.dadosSensores,
        arcosAssociados: arcosGrupo
      }
    })

    return {
      quantidadeModelos: 4,
      modelos: modelos,
      mapeamentoArcos: this.criarMapeamentoArcos(analiseArcos.totalArcos, [1, 2, 3, 4], 4)
    }
  },

  /**
   * Extrai modelo do arco baseado nos dados reais
   */
  extrairModeloDoArco(dadosArco, analiseArco) {
    const quantidadePendulos = analiseArco.totalPendulos
    const sensoresPorPendulo = {}
    const dadosSensores = {}

    // Processar cada pêndulo
    Object.keys(dadosArco).forEach(numeroPendulo => {
      const penduloNum = parseInt(numeroPendulo)
      const dadosPendulo = dadosArco[numeroPendulo]
      
      // Contar sensores ativos
      const sensoresAtivos = Object.values(dadosPendulo).filter(sensor => sensor[4] === true)
      sensoresPorPendulo[penduloNum] = sensoresAtivos.length

      // Extrair dados dos sensores para visualização
      dadosSensores[penduloNum] = {}
      Object.keys(dadosPendulo).forEach(numeroSensor => {
        const sensorNum = parseInt(numeroSensor)
        const [valor, flag1, flag2, flag3, ativo] = dadosPendulo[numeroSensor]
        
        dadosSensores[penduloNum][sensorNum] = {
          valor: valor,
          ativo: ativo,
          flags: [flag1, flag2, flag3]
        }
      })
    })

    // Gerar layout automático
    const layout = LayoutManager.gerarLayoutParaArco(analiseArco)

    return {
      quantidadePendulos: quantidadePendulos,
      sensoresPorPendulo: sensoresPorPendulo,
      dadosSensores: dadosSensores,
      configuracao: {
        // Configuração baseada no layout gerado
        lb: layout.configuracao.largura,
        pb: layout.configuracao.altura,
        escala_sensores: layout.desenho_sensores.escala_sensores,
        dist_y_sensores: layout.desenho_sensores.dist_y_sensores,
        posicoesCabos: {
          1: layout.desenho_sensores.pos_x_cabo
        }
      }
    }
  },

  /**
   * Cria modelo padrão quando não há dados
   */
  criarModeloPadrao() {
    return {
      quantidadePendulos: 3,
      sensoresPorPendulo: { 1: 3, 2: 3, 3: 3 },
      dadosSensores: {},
      configuracao: {
        lb: 350,
        pb: 300,
        escala_sensores: 16,
        dist_y_sensores: 12,
        posicoesCabos: { 1: [100, 175, 250] }
      }
    }
  },

  /**
   * Cria mapeamento de qual modelo usar para cada arco baseado no tipo de modelo
   */
  criarMapeamentoArcos(totalArcos, tiposModelos, tipoModelo) {
    const mapeamento = {}
    
    for (let arco = 1; arco <= totalArcos; arco++) {
      let modeloIndex
      
      switch(tipoModelo) {
        case 1: // Modelo único
          modeloIndex = 1
          break
        case 2: // Par/Ímpar
          modeloIndex = arco % 2 === 0 ? 2 : 1
          break
        case 3: // Frente/Fundo + Par/Ímpar
          const metade = Math.ceil(totalArcos / 2)
          if (arco <= metade) {
            modeloIndex = arco % 2 === 0 ? 2 : 1 // Frente par/ímpar
          } else {
            modeloIndex = arco % 2 === 0 ? 4 : 3 // Fundo par/ímpar
          }
          break
        case 4: // Frente/Par/Ímpar/Fundo (quartis)
          const quartoArcos = Math.ceil(totalArcos / 4)
          if (arco <= quartoArcos) {
            modeloIndex = 1 // Frente
          } else if (arco <= quartoArcos * 2) {
            modeloIndex = 2 // Par
          } else if (arco <= quartoArcos * 3) {
            modeloIndex = 3 // Ímpar
          } else {
            modeloIndex = 4 // Fundo
          }
          break
        default:
          modeloIndex = 1
      }
      
      mapeamento[arco] = modeloIndex
    }
    
    return mapeamento
  },

  /**
   * Determina qual modelo usar para um arco específico
   */
  determinarModeloParaArco(numeroArco, dadosProcessados) {
    if (!dadosProcessados || !dadosProcessados.mapeamentoArcos) {
      return 1
    }
    
    return dadosProcessados.mapeamentoArcos[numeroArco] || 1
  },

  /**
   * Obter dados do modelo para um arco específico
   */
  obterDadosModeloParaArco(numeroArco, dadosProcessados) {
    const modeloIndex = this.determinarModeloParaArco(numeroArco, dadosProcessados)
    return dadosProcessados.modeloAplicado?.dados?.modelos?.[modeloIndex] || null
  },

  /**
   * Sincronizar dados de sensores de um arco específico
   */
  sincronizarDadosSensoresArco(numeroArco, dadosAPI, dadosProcessados) {
    const modelo = this.obterDadosModeloParaArco(numeroArco, dadosProcessados)
    
    if (!modelo || !dadosAPI.arcos || !dadosAPI.arcos[numeroArco]) {
      return null
    }

    // Extrair dados reais dos sensores para o arco
    const dadosArcoAPI = dadosAPI.arcos[numeroArco]
    const dadosSincronizados = {}

    Object.keys(dadosArcoAPI).forEach(numeroPendulo => {
      const penduloNum = parseInt(numeroPendulo)
      const dadosPendulo = dadosArcoAPI[numeroPendulo]
      
      dadosSincronizados[penduloNum] = {}
      
      Object.keys(dadosPendulo).forEach(numeroSensor => {
        const sensorNum = parseInt(numeroSensor)
        const [valor, flag1, flag2, flag3, ativo] = dadosPendulo[numeroSensor]
        
        dadosSincronizados[penduloNum][sensorNum] = {
          valor: valor,
          ativo: ativo,
          flags: [flag1, flag2, flag3],
          timestamp: dadosAPI.DAT
        }
      })
    })

    return dadosSincronizados
  },

  /**
   * Criar estrutura padrão quando não há dados
   */
  criarEstruturaPadrao() {
    return {
      dadosOriginais: null,
      analiseArcos: LayoutManager.criarEstruturaMinima(),
      modeloAplicado: {
        tipo: 1,
        nome: 'Modelo Único',
        dados: {
          quantidadeModelos: 1,
          modelos: {
            1: this.criarModeloPadrao()
          },
          mapeamentoArcos: { 1: 1 }
        }
      },
      metadados: {
        processadoEm: new Date().toISOString(),
        totalArcos: 1,
        totalPendulos: 3,
        totalSensores: 9
      }
    }
  },

  /**
   * Validar dados da API
   */
  validarDadosAPI(dadosAPI) {
    if (!dadosAPI) return false
    if (!dadosAPI.arcos || typeof dadosAPI.arcos !== 'object') return false
    
    // Verificar se há pelo menos um arco válido
    const arcosValidos = Object.keys(dadosAPI.arcos).filter(numeroArco => {
      const dadosArco = dadosAPI.arcos[numeroArco]
      return dadosArco && typeof dadosArco === 'object' && Object.keys(dadosArco).length > 0
    })
    
    return arcosValidos.length > 0
  }
}

export default ArmazemDataProcessor