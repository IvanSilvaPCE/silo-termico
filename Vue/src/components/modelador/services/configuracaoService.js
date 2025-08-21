import client from '@/api.js'

// Serviço para gerenciar configurações de armazém no localStorage
const salvarModelosArcos = (modelos, quantidadeModelos) => {
  try {
    const dadosModelos = {
      quantidadeModelos,
      modelos,
      timestamp: Date.now(),
      tipo: 'modelos_arcos'
    }

    console.log('🔄 [configuracaoService] Salvando modelos de arcos:', {
      quantidadeModelos,
      modelosKeys: Object.keys(modelos),
      tamanhoJSON: JSON.stringify(dadosModelos).length
    })

    localStorage.setItem('modelosArcosSalvos', JSON.stringify(dadosModelos))

    console.log('✅ [configuracaoService] Modelos de arcos salvos no localStorage com sucesso!')

    return { success: true, message: 'Modelos de arcos salvos com sucesso!' }
  } catch (error) {
    console.error('❌ [configuracaoService] Erro ao salvar modelos de arcos:', error)
    return { success: false, message: 'Erro ao salvar modelos de arcos' }
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

const salvarConfiguracaoCompleta = (nomeConfiguracao, dadosCompletos, manterEstado = true) => {
  try {
    const chave = `configArmazem_${nomeConfiguracao}`
    
    // Estrutura completa v4.0 que inclui TODOS os dados necessários
    const configuracaoFinal = {
      tipo: 'armazem_completo_v4',
      nomeConfiguracao,
      versao: '4.0',
      timestamp: Date.now(),
      
      // Sistema de modelos completo
      sistemaModelos: {
        quantidadeModelos: dadosCompletos.quantidadeModelos || 1,
        modelosDefinidos: dadosCompletos.modelosArcos || {},
        logicaDistribuicao: dadosCompletos.logicaDistribuicao || null,
        historicoCriacao: dadosCompletos.historicoCriacao || []
      },
      
      // Configuração global do SVG
      configuracaoGlobal: dadosCompletos.configuracao || {},
      
      // Layouts automáticos gerados
      layoutsAutomaticos: dadosCompletos.layoutsAutomaticos || {},
      
      // Dimensões do SVG
      dimensoesSVG: dadosCompletos.dimensoesSVG || { largura: 350, altura: 200 },
      
      // Dados originais preservados
      dadosOriginais: dadosCompletos.dadosOriginais || null,
      
      // Estado atual do modelador
      estadoAtual: {
        modeloAtivo: dadosCompletos.modeloAtivo || 1,
        variaveis: dadosCompletos.variaveis || {},
        configuracaoAtiva: dadosCompletos.configuracaoAtiva || {},
        ultimaAlteracao: Date.now()
      },
      
      // Metadados adicionais
      metadados: {
        totalArcos: dadosCompletos.totalArcos || 0,
        totalPendulos: dadosCompletos.totalPendulos || 0,
        totalSensores: dadosCompletos.totalSensores || 0,
        estruturaDados: dadosCompletos.estruturaDados || null
      }
    }

    console.log('🔄 [configuracaoService] Salvando configuração completa v4.0:', {
      nome: nomeConfiguracao,
      chave,
      quantidadeModelos: configuracaoFinal.sistemaModelos.quantidadeModelos,
      modelosKeys: Object.keys(configuracaoFinal.sistemaModelos.modelosDefinidos),
      tamanhoJSON: JSON.stringify(configuracaoFinal).length,
      totalPropriedades: Object.keys(configuracaoFinal.configuracaoGlobal).length
    })

    localStorage.setItem(chave, JSON.stringify(configuracaoFinal))

    // Manter os modelos ativos no localStorage se solicitado
    if (manterEstado) {
      const estadoAtivo = {
        quantidadeModelos: configuracaoFinal.sistemaModelos.quantidadeModelos,
        modelos: configuracaoFinal.sistemaModelos.modelosDefinidos,
        timestamp: Date.now(),
        tipo: 'modelos_arcos_ativo',
        versao: '4.0'
      }
      localStorage.setItem('modelosArcosSalvos', JSON.stringify(estadoAtivo))
      console.log('💾 [configuracaoService] Estado ativo mantido no localStorage')
    }

    console.log('✅ [configuracaoService] Configuração completa v4.0 salva:', chave)

    return { success: true, message: 'Configuração completa salva com sucesso!' }
  } catch (error) {
    console.error('❌ [configuracaoService] Erro ao salvar configuração completa:', error)
    return { success: false, message: 'Erro ao salvar configuração completa' }
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

export const configuracaoService = {
  salvarModelosArcos,
  carregarModelosArcos,
  salvarConfiguracaoCompleta,
  carregarConfiguracaoCompleta,
  listarConfiguracoesSalvas,
  deletarConfiguracao,
  determinarLayoutArcos,
  aplicarConfiguracaoCompleta,
  prepararDadosParaBanco,
  limparVariaveisModelo
}