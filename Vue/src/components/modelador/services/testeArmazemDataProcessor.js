/**
 * Arquivo de teste para o ArmazemDataProcessor
 * Demonstra como processar dados do armazém com diferentes modelos
 */

import ArmazemDataProcessor from './armazemDataProcessor.js'

// Dados de exemplo baseados no arquivo fornecido pelo usuário
const dadosExemplo = {
  "AER": "30,30,30,30",
  "CUL": "2",
  "FCV": "0", 
  "CMA": "0",
  "NIV": 71.6,
  "VOL": "716",
  "DAT": "2025-08-13 08:03:47",
  "TMS": 20.5,
  "pendulos": {
    "1": [false, false, true, 24.5],
    "2": [false, false, true, 25.5],
    "3": [false, false, true, 0],
    "4": [false, false, true, 23.5],
    "5": [false, false, true, 24.5]
  },
  "arcos": {
    "1": {
      "1": {
        "1": [24.5, false, false, false, true],
        "2": [19, false, false, false, true],
        "3": [20, false, false, false, true],
        "4": [20, true, false, false, true]
      },
      "2": {
        "1": [25.5, false, false, false, true],
        "2": [22, false, false, false, true],
        "3": [20.5, false, false, false, true],
        "4": [20, false, false, false, true],
        "5": [20.5, true, false, false, true]
      },
      "3": {
        "1": [23.5, false, false, false, true],
        "2": [22, false, false, false, true],
        "3": [20, false, false, false, true],
        "4": [20, false, false, false, true],
        "5": [20, false, false, false, true]
      }
    },
    "2": {
      "4": {
        "1": [23.5, false, false, false, true],
        "2": [20, false, false, false, true],
        "3": [22.5, false, false, false, true],
        "4": [20, false, false, false, true]
      },
      "5": {
        "1": [24.5, false, false, false, true],
        "2": [22, false, false, false, true],
        "3": [21, false, false, false, true],
        "4": [20, false, false, false, true]
      }
    },
    "3": {
      "7": {
        "1": [24, false, false, false, true],
        "2": [19.5, false, false, false, true],
        "3": [20.5, false, false, false, true],
        "4": [20, false, false, false, false]
      },
      "8": {
        "1": [25, false, false, false, false],
        "2": [23, false, false, false, false],
        "3": [25.5, false, false, false, false]
      }
    },
    "4": {
      "10": {
        "1": [28.5, false, false, false, true],
        "2": [22.5, false, false, false, true],
        "3": [21, false, false, false, true]
      }
    }
  }
}

// Função para testar todos os modelos
export function testarTodosModelos() {
  console.log('=== TESTE DO SISTEMA DE PROCESSAMENTO DE DADOS DO ARMAZÉM ===')
  console.log('Dados de entrada:', dadosExemplo)
  console.log()

  // Testar cada tipo de modelo
  for (let tipoModelo = 1; tipoModelo <= 4; tipoModelo++) {
    console.log(`--- TESTANDO MODELO ${tipoModelo}: ${ArmazemDataProcessor.logicas[tipoModelo]} ---`)
    
    const resultado = ArmazemDataProcessor.processarDadosArmazem(dadosExemplo, tipoModelo)
    
    console.log('📊 Análise dos Arcos:', {
      totalArcos: resultado.analiseArcos.totalArcos,
      totalPendulos: resultado.analiseArcos.estatisticas.totalPendulos,
      totalSensores: resultado.analiseArcos.estatisticas.totalSensores
    })
    
    console.log('🎯 Modelo Aplicado:', {
      tipo: resultado.modeloAplicado.tipo,
      nome: resultado.modeloAplicado.nome,
      quantidadeModelos: resultado.modeloAplicado.dados.quantidadeModelos
    })
    
    console.log('🗂️ Modelos Criados:')
    Object.values(resultado.modeloAplicado.dados.modelos).forEach((modelo, index) => {
      console.log(`  ${index + 1}. ${modelo.nome} (${modelo.posicao}) - ${modelo.quantidadePendulos} pêndulos`)
      console.log(`     Arcos associados: ${modelo.arcosAssociados.join(', ')}`)
    })
    
    console.log('🔗 Mapeamento de Arcos:')
    Object.entries(resultado.modeloAplicado.dados.mapeamentoArcos).forEach(([arco, modelo]) => {
      console.log(`  Arco ${arco} → Modelo ${modelo}`)
    })
    
    console.log()
  }
}

// Função para testar sincronização de um arco específico
export function testarSincronizacaoArco(numeroArco = 1, tipoModelo = 1) {
  console.log(`=== TESTE DE SINCRONIZAÇÃO - ARCO ${numeroArco} ===`)
  
  const dadosProcessados = ArmazemDataProcessor.processarDadosArmazem(dadosExemplo, tipoModelo)
  
  // Obter dados do modelo para o arco
  const dadosModelo = ArmazemDataProcessor.obterDadosModeloParaArco(numeroArco, dadosProcessados)
  
  if (dadosModelo) {
    console.log('🎯 Modelo aplicado ao arco:', {
      nome: dadosModelo.nome,
      posicao: dadosModelo.posicao,
      quantidadePendulos: dadosModelo.quantidadePendulos,
      sensoresPorPendulo: dadosModelo.sensoresPorPendulo
    })
    
    // Sincronizar dados de sensores
    const dadosSincronizados = ArmazemDataProcessor.sincronizarDadosSensoresArco(
      numeroArco, 
      dadosExemplo, 
      dadosProcessados
    )
    
    if (dadosSincronizados) {
      console.log('📡 Dados sincronizados do arco:', dadosSincronizados)
    } else {
      console.log('⚠️ Nenhum dado de sensor encontrado para este arco')
    }
  } else {
    console.log('❌ Modelo não encontrado para este arco')
  }
}

// Função para validar a estrutura de dados
export function validarEstruturaDados() {
  console.log('=== VALIDAÇÃO DA ESTRUTURA DE DADOS ===')
  
  const isValido = ArmazemDataProcessor.validarDadosAPI(dadosExemplo)
  console.log('✅ Dados válidos:', isValido)
  
  if (isValido) {
    console.log('📋 Estrutura detectada:')
    console.log('  - Células encontradas:', Object.keys(dadosExemplo.arcos).length)
    
    Object.entries(dadosExemplo.arcos).forEach(([celula, dadosCelula]) => {
      console.log(`  - Célula ${celula}: ${Object.keys(dadosCelula).length} arcos`)
      
      Object.entries(dadosCelula).forEach(([arco, dadosArco]) => {
        const pendulos = Object.keys(dadosArco).length
        const sensores = Object.values(dadosArco).reduce((total, dadosPendulo) => {
          return total + Object.keys(dadosPendulo).length
        }, 0)
        console.log(`    - Arco ${arco}: ${pendulos} pêndulos, ${sensores} sensores`)
      })
    })
  }
}

// Função principal de demonstração
export function demonstracao() {
  console.log('🚀 INICIANDO DEMONSTRAÇÃO DO SISTEMA')
  console.log('=====================================')
  
  // 1. Validar dados
  validarEstruturaDados()
  console.log()
  
  // 2. Testar todos os modelos
  testarTodosModelos()
  
  // 3. Testar sincronização específica
  testarSincronizacaoArco(1, 2) // Arco 1 com modelo Par/Ímpar
  console.log()
  testarSincronizacaoArco(2, 2) // Arco 2 com modelo Par/Ímpar
  console.log()
  
  console.log('✅ DEMONSTRAÇÃO CONCLUÍDA')
}

// Executar demonstração se arquivo for importado
if (typeof window !== 'undefined') {
  // No navegador, disponibilizar no console
  window.ArmazemDataProcessorTest = {
    demonstracao,
    testarTodosModelos,
    testarSincronizacaoArco,
    validarEstruturaDados,
    dadosExemplo
  }
  
  console.log('🧪 Teste do ArmazemDataProcessor carregado!')
  console.log('Execute: ArmazemDataProcessorTest.demonstracao() para ver a demonstração completa')
}

export default {
  demonstracao,
  testarTodosModelos,
  testarSincronizacaoArco,
  validarEstruturaDados,
  dadosExemplo
}