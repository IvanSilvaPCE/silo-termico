import client from '@/api.js'

// Serviço simplificado para gerenciar configurações de armazém
const salvarModeloIndividual = (numeroModelo, configuracaoModelo) => {
  try {
    const chaveModelo = `modelo_${numeroModelo}`
    const dadosModelo = {
      numero: numeroModelo,
      configuracao: configuracaoModelo,
      timestamp: Date.now(),
      tipo: 'modelo_individual'
    }

    localStorage.setItem(chaveModelo, JSON.stringify(dadosModelo))

    console.log(`✅ [configuracaoService] Modelo ${numeroModelo} salvo no localStorage`)
    return { success: true, message: `Modelo ${numeroModelo} salvo com sucesso!` }
  } catch (error) {
    console.error(`❌ [configuracaoService] Erro ao salvar modelo ${numeroModelo}:`, error)
    return { success: false, message: `Erro ao salvar modelo ${numeroModelo}` }
  }
}

const carregarModeloIndividual = (numeroModelo) => {
  try {
    const chaveModelo = `modelo_${numeroModelo}`
    const dados = localStorage.getItem(chaveModelo)
    if (dados) {
      return JSON.parse(dados)
    }
    return null
  } catch (error) {
    console.error(`❌ [configuracaoService] Erro ao carregar modelo ${numeroModelo}:`, error)
    return null
  }
}

const carregarModelosArcos = () => {
  try {
    const dados = localStorage.getItem('modelosArcosSalvos')
    if (dados) {
      return JSON.parse(dados)
    }
    return null
  } catch (error) {
    console.error('Erro ao carregar modelos de arcos:', error)
    return null
  }
}

const consolidarModelosParaBanco = (quantidadeModelos, nomeConfiguracao) => {
  try {
    const modelosConsolidados = {}
    let modelosEncontrados = 0
    
    console.log(`🔄 [consolidarModelosParaBanco] Iniciando consolidação de ${quantidadeModelos} modelos`)
    
    // Coletar todos os modelos salvos individualmente
    for (let i = 1; i <= quantidadeModelos; i++) {
      const modelo = carregarModeloIndividual(i)
      console.log(`🔍 [consolidarModelosParaBanco] Verificando modelo ${i}:`, modelo)
      
      if (modelo && modelo.configuracao) {
        modelosEncontrados++
        
        // Extrair todas as configurações do modelo
        const config = modelo.configuracao
        
        modelosConsolidados[i] = {
          // Informações básicas do modelo
          numeroModelo: i,
          nome: config.nome || `Modelo ${i}`,
          posicao: config.posicao || (quantidadeModelos === 1 ? 'todos' : 
                   quantidadeModelos === 2 ? (i === 1 ? 'impar' : 'par') :
                   quantidadeModelos === 3 ? (i === 1 ? 'frente_fundo' : i === 2 ? 'par' : 'impar') :
                   i === 1 ? 'frente' : i === quantidadeModelos ? 'fundo' : (i % 2 === 0 ? 'par' : 'impar')),
          
          // Quantidade de Pêndulos
          quantidadePendulos: config.quantidadePendulos || 3,
          sensoresPorPendulo: config.sensoresPorPendulo || {},
          
          // Posição dos cabos separados
          posicoesCabos: config.posicoesCabos || {},
          
          // Configuração completa do armazém (todas as propriedades)
          configuracao: {
            // Dimensões Básicas
            pb: config.pb || 185,
            lb: config.lb || 350,
            hb: config.hb || 30,
            hf: config.hf || 5,
            lf: config.lf || 250,
            le: config.le || 15,
            
            // Telhado
            tipo_telhado: config.tipo_telhado || 1,
            ht: config.ht || 50,
            curvatura_topo: config.curvatura_topo || 30,
            pontas_redondas: config.pontas_redondas || false,
            raio_pontas: config.raio_pontas || 15,
            estilo_laterais: config.estilo_laterais || 'reta',
            curvatura_laterais: config.curvatura_laterais || 0,
            
            // Fundo
            tipo_fundo: config.tipo_fundo || 0,
            altura_fundo_reto: config.altura_fundo_reto || 10,
            altura_funil_v: config.altura_funil_v || 18,
            posicao_ponta_v: config.posicao_ponta_v || 0,
            inclinacao_funil_v: config.inclinacao_funil_v || 1,
            largura_abertura_v: config.largura_abertura_v || 20,
            altura_duplo_v: config.altura_duplo_v || 22,
            posicao_v_esquerdo: config.posicao_v_esquerdo || -1,
            posicao_v_direito: config.posicao_v_direito || 1,
            largura_abertura_duplo_v: config.largura_abertura_duplo_v || 2,
            altura_plataforma_duplo_v: config.altura_plataforma_duplo_v || 0.3,
            largura_plataforma_duplo_v: config.largura_plataforma_duplo_v || 10,
            deslocamento_horizontal_fundo: config.deslocamento_horizontal_fundo || 0,
            deslocamento_vertical_fundo: config.deslocamento_vertical_fundo || -1,
            
            // Sensores
            escala_sensores: config.escala_sensores || 16,
            dist_y_sensores: config.dist_y_sensores || 12,
            dist_x_sensores: config.dist_x_sensores || 0,
            posicao_horizontal: config.posicao_horizontal || 0,
            posicao_vertical: config.posicao_vertical || 0,
            afastamento_vertical_pendulo: config.afastamento_vertical_pendulo || 0
          },
          
          // Metadados
          timestampSalvamento: config.timestampSalvamento || Date.now(),
          validado: true
        }
      } else {
        console.warn(`⚠️ [consolidarModelosParaBanco] Modelo ${i} não encontrado ou sem configuração`)
      }
    }

    // Validar se encontrou todos os modelos esperados
    if (modelosEncontrados === 0) {
      console.error('❌ [consolidarModelosParaBanco] Nenhum modelo encontrado!')
      return { success: false, message: 'Nenhum modelo de arco configurado encontrado. Salve os modelos individualmente antes de salvar no banco.' }
    }
    
    if (modelosEncontrados < quantidadeModelos) {
      console.warn(`⚠️ [consolidarModelosParaBanco] Encontrados ${modelosEncontrados}/${quantidadeModelos} modelos`)
      return { success: false, message: `Apenas ${modelosEncontrados} de ${quantidadeModelos} modelos foram encontrados. Configure e salve todos os modelos antes de salvar no banco.` }
    }

    // Criar estrutura final para salvar no banco
    const dadosSvgFinal = {
      nm_modelo: nomeConfiguracao,
      tp_svg: 'A', // Armazém
      vista_svg: 'F', // Frontal
      ds_modelo: `Configuração com ${quantidadeModelos} modelo(s) de arco - ${new Date().toLocaleDateString('pt-BR')}`,
      dado_svg: JSON.stringify({
        versao: '5.0',
        tipo: 'armazem_completo',
        tipoConfiguracao: 'armazem_completo_v5',
        quantidadeModelos: quantidadeModelos,
        modelosDefinidos: modelosConsolidados,
        sistemaModelos: {
          quantidadeModelos: quantidadeModelos,
          modelosDefinidos: modelosConsolidados,
          logicaDistribuicao: {
            nome: quantidadeModelos === 1 ? 'Modelo Único' : 
                  quantidadeModelos === 2 ? 'Par/Ímpar' :
                  quantidadeModelos === 3 ? 'Frente/Fundo + Par/Ímpar' : 'Frente/Par/Ímpar/Fundo',
            aplicacao: quantidadeModelos === 1 ? 'todos_arcos' :
                      quantidadeModelos === 2 ? 'par_impar' :
                      quantidadeModelos === 3 ? 'frente_fundo_par_impar' : 'frente_par_impar_fundo'
          }
        },
        timestamp: Date.now(),
        consolidado: true,
        dadosOriginais: {
          modelosEncontrados: modelosEncontrados,
          quantidadeEsperada: quantidadeModelos
        }
      })
    }

    console.log('✅ [consolidarModelosParaBanco] Consolidação concluída:', {
      nomeConfiguracao,
      quantidadeModelos,
      modelosEncontrados,
      modelosProcessados: Object.keys(modelosConsolidados).length,
      tamanhoFinal: JSON.stringify(dadosSvgFinal.dado_svg).length
    })

    return { success: true, dados: dadosSvgFinal }
  } catch (error) {
    console.error('❌ [configuracaoService] Erro ao consolidar modelos para banco:', error)
    return { success: false, message: `Erro interno ao consolidar configurações: ${error.message}` }
  }
}

const carregarConfiguracaoCompleta = (nomeConfiguracao) => {
  try {
    const chave = `configArmazem_${nomeConfiguracao}`
    const dados = localStorage.getItem(chave)

    if (dados) {
      const configuracao = JSON.parse(dados)

      // Verificar se é uma configuração nova (com modelos) ou antiga
      if (configuracao.tipo === 'configuracao_armazem_completa' && configuracao.modelosArcos) {
        return {
          success: true,
          dados: configuracao,
          tipoConfiguracao: 'completa'
        }
      } else {
        // Configuração antiga - converter para novo formato
        return {
          success: true,
          dados: configuracao,
          tipoConfiguracao: 'legado'
        }
      }
    }

    return { success: false, message: 'Configuração não encontrada' }
  } catch (error) {
    console.error('Erro ao carregar configuração:', error)
    return { success: false, message: 'Erro ao carregar configuração' }
  }
}

const listarConfiguracoesSalvas = () => {
  try {
    const prefixo = 'configArmazem_'
    const configs = []

    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i)
      if (chave && chave.startsWith(prefixo)) {
        const nome = chave.replace(prefixo, '')

        // Verificar se a configuração é válida
        try {
          const dados = localStorage.getItem(chave)
          if (dados) {
            const config = JSON.parse(dados)
            configs.push({
              nome,
              timestamp: config.timestamp || 0,
              tipo: config.tipo || 'legado',
              versao: config.versao || '1.0'
            })
          }
        } catch (error) {
          console.warn(`Configuração inválida encontrada: ${chave}`)
        }
      }
    }

    // Ordenar por timestamp (mais recente primeiro)
    configs.sort((a, b) => b.timestamp - a.timestamp)

    return configs.map(config => config.nome)
  } catch (error) {
    console.error('Erro ao listar configurações:', error)
    return []
  }
}

const deletarConfiguracao = (nomeConfiguracao) => {
  try {
    const chave = `configArmazem_${nomeConfiguracao}`
    localStorage.removeItem(chave)
    return { success: true, message: 'Configuração deletada com sucesso!' }
  } catch (error) {
    console.error('Erro ao deletar configuração:', error)
    return { success: false, message: 'Erro ao deletar configuração' }
  }
}

// Função para determinar o layout dos arcos baseado na quantidade de modelos
const determinarLayoutArcos = (quantidadeModelos, indiceArco, totalArcos) => {
  switch (quantidadeModelos) {
    case 1:
      // Mesmo modelo para todos
      return 1

    case 2:
      // Par e Ímpar intercalando
      return (indiceArco % 2 === 0) ? 1 : 2

    case 3:
      // Primeiro e último usam modelo 1 (Frente/Fundo)
      // Os demais intercalam entre 2 (Par) e 3 (Ímpar)
      if (indiceArco === 0 || indiceArco === totalArcos - 1) {
        return 1 // Frente/Fundo
      } else {
        return (indiceArco % 2 === 0) ? 2 : 3 // Par/Ímpar
      }

    case 4:
      // Primeiro: Frente (1)
      // Último: Fundo (4)
      // Meio: intercala Par (2) e Ímpar (3)
      if (indiceArco === 0) {
        return 1 // Frente
      } else if (indiceArco === totalArcos - 1) {
        return 4 // Fundo
      } else {
        return (indiceArco % 2 === 0) ? 2 : 3 // Par/Ímpar
      }

    default:
      return 1
  }
}

// Função para aplicar configuração completa carregada do banco
const aplicarConfiguracaoCompleta = (configuracaoCarregada, tipoAtivo) => {
  try {
    console.log('🔄 [configuracaoService] Aplicando configuração carregada:', {
      nome: configuracaoCarregada.nome,
      tipo: typeof configuracaoCarregada.dados,
      tipoAtivo
    })

    const dados = configuracaoCarregada.dados

    // Verificar se é uma configuração de silo ou armazém
    if (tipoAtivo === 'silo') {
      // Para silo, aplicar configuração diretamente
      return {
        success: true,
        dados: {
          tipo: 'silo',
          configuracaoGlobal: dados.configuracao || dados,
          dimensoesSVG: dados.dimensoesSVG || { largura: 400, altura: 300 }
        }
      }
    } else if (tipoAtivo === 'armazem') {
      // Para armazém, verificar versão e estrutura
      if (dados.tipoConfiguracao === 'armazem_completo_v4' || dados.versao === '4.0') {
        // Nova estrutura v4.0 com sistema completo
        console.log('📦 [configuracaoService] Processando configuração v4.0 completa')

        return {
          success: true,
          dados: {
            tipo: 'armazem',
            versao: '4.0',
            tipoConfiguracao: 'armazem_completo_v4',
            quantidadeModelos: dados.sistemaModelos?.quantidadeModelos || 1,
            modelos: dados.sistemaModelos?.modelosDefinidos || {},
            configuracaoGlobal: dados.configuracaoGlobal || {},
            layoutsAutomaticos: dados.layoutsAutomaticos || {},
            dimensoesSVG: dados.dimensoesSVG || { largura: 350, altura: 200 },
            dadosOriginais: dados.dadosOriginais || null,
            estadoAtual: dados.estadoAtual || null,
            logicaDistribuicao: dados.sistemaModelos?.logicaDistribuicao || null
          }
        }
      } else if (dados.versao && (dados.versao.startsWith('3.') || dados.versao.startsWith('2.'))) {
        // Configuração com sistema de modelos (versões anteriores)
        console.log('📦 [configuracaoService] Processando configuração v3.x/v2.x')

        return {
          success: true,
          dados: {
            tipo: 'armazem',
            versao: dados.versao,
            quantidadeModelos: dados.quantidadeModelos || 1,
            modelos: dados.modelosArcos || {},
            configuracaoGlobal: dados.configuracaoGlobal || dados.configuracao || {},
            layoutsAutomaticos: dados.layoutsAutomaticos || {},
            dimensoesSVG: dados.dimensoesSVG || { largura: 350, altura: 200 },
            dadosOriginais: dados.dadosOriginais || null
          }
        }
      } else {
        // Configuração simples (compatibilidade)
        console.log('📦 [configuracaoService] Processando configuração simples (compatibilidade)')

        return {
          success: true,
          dados: {
            tipo: 'armazem',
            versao: '1.0',
            quantidadeModelos: 1,
            modelos: {
              1: {
                nome: 'Modelo Único',
                posicao: 'todos',
                config: dados,
                quantidadePendulos: 3,
                sensoresPorPendulo: { 1: 4, 2: 3, 3: 5 }
              }
            },
            configuracaoGlobal: dados,
            layoutsAutomaticos: {},
            dimensoesSVG: { largura: 350, altura: 200 }
          }
        }
      }
    }

    return { success: false, message: 'Tipo de configuração não reconhecido' }
  } catch (error) {
    console.error('❌ [configuracaoService] Erro ao aplicar configuração:', error)
    return { success: false, message: 'Erro ao processar configuração carregada' }
  }
}

// Função especializada para preparar dados para salvamento no banco
const prepararDadosParaBanco = (dadosCompletos) => {
  try {
    const dadosParaBanco = {
      versao: '4.0',
      tipo: 'armazem_completo_banco',
      timestamp: Date.now(),
      
      // Todos os modelos criados
      modelos: dadosCompletos.modelosArcos || {},
      quantidadeModelos: dadosCompletos.quantidadeModelos || 1,
      
      // Configuração global final
      configuracao: dadosCompletos.configuracao || {},
      
      // Layouts e estruturas
      layouts: dadosCompletos.layoutsAutomaticos || {},
      dimensoes: dadosCompletos.dimensoesSVG || { largura: 350, altura: 200 },
      
      // Estado completo do sistema
      sistema: {
        totalArcos: dadosCompletos.totalArcos || 0,
        totalPendulos: dadosCompletos.totalPendulos || 0,
        totalSensores: dadosCompletos.totalSensores || 0,
        distribuicao: dadosCompletos.logicaDistribuicao || null
      },
      
      // Dados originais preservados
      dadosOriginais: dadosCompletos.dadosOriginais || null,
      
      // Variáveis de estado
      variaveis: dadosCompletos.variaveis || {},
      
      // Histórico de criação dos modelos
      historico: dadosCompletos.historicoCriacao || []
    }

    console.log('🏦 [configuracaoService] Dados preparados para banco:', {
      versao: dadosParaBanco.versao,
      quantidadeModelos: dadosParaBanco.quantidadeModelos,
      modelosKeys: Object.keys(dadosParaBanco.modelos),
      tamanhoFinal: JSON.stringify(dadosParaBanco).length
    })

    return {
      success: true,
      dados: dadosParaBanco,
      dadosString: JSON.stringify(dadosParaBanco)
    }
  } catch (error) {
    console.error('❌ [configuracaoService] Erro ao preparar dados para banco:', error)
    return { success: false, message: 'Erro ao preparar dados para salvamento' }
  }
}

// Função para limpar variáveis após salvar modelo individual
const limparVariaveisModelo = () => {
  try {
    // Limpar dados temporários do localStorage
    const itensParaLimpar = [
      'configracaoTemporaria',
      'variaveisModelo',
      'estadoModeloAtivo',
      'alteracoesPendentes'
    ]

    itensParaLimpar.forEach(item => {
      localStorage.removeItem(item)
    })

    console.log('🧹 [configuracaoService] Variáveis do modelo limpa para próximo modelo')

    return { success: true, message: 'Variáveis limpas com sucesso' }
  } catch (error) {
    console.error('❌ [configuracaoService] Erro ao limpar variáveis:', error)
    return { success: false, message: 'Erro ao limpar variáveis' }
  }
}

// Função para validar configuração antes do salvamento
const validarConfiguracao = (configuracao, modelos, quantidadeModelos, tipo) => {
  try {
    console.log('🔍 [configuracaoService] Validando configuração:', {
      tipo,
      quantidadeModelos,
      temConfiguracao: !!configuracao,
      temModelos: !!modelos,
      modelosKeys: modelos ? Object.keys(modelos) : []
    })

    const erros = []

    // Validação para Silo
    if (tipo === 'silo') {
      if (!configuracao || Object.keys(configuracao).length === 0) {
        erros.push('Configuração do silo não foi definida')
      }
      
      return {
        valido: erros.length === 0,
        erros,
        detalhes: {
          tipo: 'silo',
          temConfiguracao: !!configuracao
        }
      }
    }

    // Validação para Armazém
    if (tipo === 'armazem') {
      // Validar quantidade de modelos
      if (!quantidadeModelos || quantidadeModelos < 1 || quantidadeModelos > 4) {
        erros.push('Quantidade de modelos deve estar entre 1 e 4')
      }

      // Validar se existem modelos definidos
      if (!modelos || Object.keys(modelos).length === 0) {
        erros.push('Nenhum modelo de arco foi definido')
      } else {
        // Validar se a quantidade de modelos bate com os modelos definidos
        const modelosDefinidos = Object.keys(modelos).length
        if (modelosDefinidos !== quantidadeModelos) {
          erros.push(`Quantidade de modelos (${quantidadeModelos}) não confere com modelos definidos (${modelosDefinidos})`)
        }

        // Validar cada modelo individualmente
        for (let i = 1; i <= quantidadeModelos; i++) {
          const modelo = modelos[i]
          if (!modelo) {
            erros.push(`Modelo ${i} não foi configurado`)
            continue
          }

          if (!modelo.nome || modelo.nome.trim() === '') {
            erros.push(`Modelo ${i} não possui nome definido`)
          }

          if (!modelo.configuracao || Object.keys(modelo.configuracao).length === 0) {
            erros.push(`Modelo ${i} não possui configuração definida`)
          }

          if (!modelo.quantidadePendulos || modelo.quantidadePendulos < 1) {
            erros.push(`Modelo ${i} não possui quantidade de pêndulos válida`)
          }
        }
      }

      // Validar configuração global
      if (!configuracao || Object.keys(configuracao).length === 0) {
        erros.push('Configuração global do armazém não foi definida')
      }
    }

    const validacaoResultado = {
      valido: erros.length === 0,
      erros,
      detalhes: {
        tipo,
        quantidadeModelos: quantidadeModelos || 0,
        modelosDefinidos: modelos ? Object.keys(modelos).length : 0,
        temConfiguracaoGlobal: !!(configuracao && Object.keys(configuracao).length > 0),
        modelosValidos: modelos ? Object.values(modelos).filter(m => 
          m && m.nome && m.configuracao && Object.keys(m.configuracao).length > 0
        ).length : 0
      }
    }

    if (validacaoResultado.valido) {
      console.log('✅ [configuracaoService] Configuração validada com sucesso')
    } else {
      console.warn('⚠️ [configuracaoService] Configuração com problemas:', erros)
    }

    return validacaoResultado
  } catch (error) {
    console.error('❌ [configuracaoService] Erro na validação da configuração:', error)
    return {
      valido: false,
      erros: ['Erro interno na validação da configuração'],
      detalhes: null
    }
  }
}

export const configuracaoService = {
  salvarModeloIndividual,
  carregarModeloIndividual,
  consolidarModelosParaBanco,
  carregarConfiguracaoCompleta,
  listarConfiguracoesSalvas,
  deletarConfiguracao,
  determinarLayoutArcos,
  aplicarConfiguracaoCompleta,
  prepararDadosParaBanco,
  limparVariaveisModelo,
  validarConfiguracao
}