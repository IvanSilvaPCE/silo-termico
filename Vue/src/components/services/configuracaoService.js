
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

const salvarConfiguracaoCompleta = (nomeConfiguracao, configuracao, modelosArcos, quantidadeModelos) => {
  try {
    const chave = `configArmazem_${nomeConfiguracao}`
    const dadosCompletos = {
      tipo: 'configuracao_armazem_completa',
      nomeConfiguracao,
      configuracao,
      modelosArcos,
      quantidadeModelos,
      timestamp: Date.now(),
      versao: '2.0'
    }
    
    console.log('🔄 [configuracaoService] Salvando configuração completa:', {
      nome: nomeConfiguracao,
      chave,
      quantidadeModelos,
      tamanhoJSON: JSON.stringify(dadosCompletos).length,
      configuracao: Object.keys(configuracao).length + ' propriedades'
    })
    
    localStorage.setItem(chave, JSON.stringify(dadosCompletos))
    
    console.log('✅ [configuracaoService] Configuração completa salva no localStorage:', chave)
    
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

export const configuracaoService = {
  salvarModelosArcos,
  carregarModelosArcos,
  salvarConfiguracaoCompleta,
  carregarConfiguracaoCompleta,
  listarConfiguracoesSalvas,
  deletarConfiguracao,
  determinarLayoutArcos
}
