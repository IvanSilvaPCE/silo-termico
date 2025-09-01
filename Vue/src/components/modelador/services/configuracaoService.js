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

    // CORREÇÃO: Processar modelos em ordem crescente (1, 2, 3, ...)
    for (let i = 1; i <= quantidadeModelos; i++) {
      const modelo = carregarModeloIndividual(i)
      console.log(`🔍 [consolidarModelosParaBanco] Verificando modelo ${i}:`, modelo)

      if (modelo && modelo.configuracao) {
        modelosEncontrados++

        // Extrair todas as configurações do modelo
        const config = modelo.configuracao

        // CORREÇÃO CRÍTICA: Capturar posições exatas dos cabos de TODAS as fontes
        const posicoesCabosOriginais = {
          ...config.posicoesCabos,
          ...config.posicoesCabosIndividuais,
          ...config.posicoesCabosPersonalizadas
        }

        // CORREÇÃO CRÍTICA: Capturar informações detalhadas dos sensores por pêndulo
        const sensoresPorPenduloCompletos = {}
        const quantidadePendulos = config.quantidadePendulos || 3

        // VERIFICAÇÃO DE SEGURANÇA: Garantir que todas as propriedades existam
        if (!config.sensoresPorPendulo) config.sensoresPorPendulo = {}
        if (!config.alturasSensores) config.alturasSensores = {}
        if (!config.posicoesCabos) config.posicoesCabos = {}
        if (!config.posicoesCabosIndividuais) config.posicoesCabosIndividuais = {}
        if (!config.posicoesCabosPersonalizadas) config.posicoesCabosPersonalizadas = {}

        // Processar cada pêndulo individualmente
        for (let p = 1; p <= quantidadePendulos; p++) {
          const penduloKey = `P${p}`

          // Capturar informações dos sensores deste pêndulo
          let quantidadeSensores = 3 // padrão
          let alturaSensores = []

          // Buscar nas diferentes fontes de dados
          if (config.sensoresPorPendulo && config.sensoresPorPendulo[p]) {
            quantidadeSensores = config.sensoresPorPendulo[p]
          }

          if (config.sensoresPorPendulo && config.sensoresPorPendulo[penduloKey]) {
            quantidadeSensores = config.sensoresPorPendulo[penduloKey]
          }

          // Capturar alturas dos sensores com verificação robusta
          if (config.alturasSensores) {
            if (config.alturasSensores[p]) {
              alturaSensores = Array.isArray(config.alturasSensores[p]) ? [...config.alturasSensores[p]] : []
            } else if (config.alturasSensores[penduloKey]) {
              alturaSensores = Array.isArray(config.alturasSensores[penduloKey]) ? [...config.alturasSensores[penduloKey]] : []
            }
          }

          // Capturar posições específicas dos cabos deste pêndulo
          let posicaoCabo = null
          if (posicoesCabosOriginais[p]) {
            posicaoCabo = { ...posicoesCabosOriginais[p] }
          }

          sensoresPorPenduloCompletos[p] = {
            numeroPendulo: p,
            identificador: penduloKey,
            quantidadeSensores: quantidadeSensores,
            alturasSensores: alturaSensores.length > 0 ? [...alturaSensores] : [],
            posicaoCabo: posicaoCabo,
            configuracaoCompleta: {
              x: posicaoCabo?.x || 0,
              y: posicaoCabo?.y || 0,
              offsetX: posicaoCabo?.offsetX || 0,
              offsetY: posicaoCabo?.offsetY || 0,
              altura: posicaoCabo?.altura || 0,
              numeroSensores: quantidadeSensores
            }
          }

          console.log(`🎯 [consolidarModelosParaBanco] Modelo ${i} - Pêndulo ${p}:`, {
            quantidadeSensores,
            alturasSensores: alturaSensores,
            alturasSensoresLength: alturaSensores ? alturaSensores.length : 0,
            posicaoCabo,
            completo: sensoresPorPenduloCompletos[p]
          })
        }

        console.log(`🎯 [consolidarModelosParaBanco] Modelo ${i} - TODOS os dados capturados:`, {
          posicoesCabos: config.posicoesCabos,
          posicoesCabosIndividuais: config.posicoesCabosIndividuais,
          posicoesCabosPersonalizadas: config.posicoesCabosPersonalizadas,
          sensoresPorPendulo: config.sensoresPorPendulo,
          alturasSensores: config.alturasSensores,
          consolidadas: posicoesCabosOriginais,
          sensoresCompletos: sensoresPorPenduloCompletos
        })

        // CORREÇÃO: Garantir que a chave do modelo seja string para manter ordem
        modelosConsolidados[i.toString()] = {
          // Informações básicas do modelo
          numeroModelo: i,
          nome: config.nome || `Modelo ${i}`,
          posicao: config.posicao || (quantidadeModelos === 1 ? 'todos' :
                   quantidadeModelos === 2 ? (i === 1 ? 'impar' : 'par') :
                   quantidadeModelos === 3 ? (i === 1 ? 'frente_fundo' : i === 2 ? 'par' : 'impar') :
                   i === 1 ? 'frente' : i === quantidadeModelos ? 'fundo' : (i % 2 === 0 ? 'par' : 'impar')),

          // Quantidade de Pêndulos
          quantidadePendulos: quantidadePendulos,
          sensoresPorPendulo: config.sensoresPorPendulo || {},

          // CORREÇÃO CRÍTICA: Dados completos dos sensores por pêndulo
          sensoresPorPenduloCompletos: sensoresPorPenduloCompletos,
          alturasSensores: config.alturasSensores || {},

          // CORREÇÃO: Posições dos cabos individuais EXATAMENTE preservadas
          posicoesCabos: { ...posicoesCabosOriginais },
          posicoesCabosIndividuais: { ...posicoesCabosOriginais },
          posicoesCabosPersonalizadas: { ...posicoesCabosOriginais },

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
            afastamento_vertical_pendulo: config.afastamento_vertical_pendulo || 0,

            // CORREÇÃO CRÍTICA: Dados completos dos sensores preservados
            quantidadePendulos: quantidadePendulos,
            sensoresPorPendulo: config.sensoresPorPendulo || {},
            sensoresPorPenduloCompletos: sensoresPorPenduloCompletos,
            alturasSensores: config.alturasSensores || {},

            // CORREÇÃO CRÍTICA: Preservar EXATAMENTE as posições originais dos cabos
            posicoesCabos: { ...posicoesCabosOriginais },
            posicoesCabosIndividuais: { ...posicoesCabosOriginais },
            posicoesCabosPersonalizadas: { ...posicoesCabosOriginais },

            // Arrays de posição para compatibilidade com sistema antigo
            pos_x_cabo: config.pos_x_cabo || [],
            pos_y_cabo: config.pos_y_cabo || [],
            distancia_entre_cabos: config.distancia_entre_cabos || []
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

    // CORREÇÃO: Garantir ordem correta dos modelos (P1, P2, P3...)
    const modelosOrdenados = {}
    for (let i = 1; i <= quantidadeModelos; i++) {
      if (modelosConsolidados[i.toString()]) {
        modelosOrdenados[i.toString()] = modelosConsolidados[i.toString()]
      }
    }

    console.log(`✅ [consolidarModelosParaBanco] Modelos ordenados corretamente:`, {
      ordemOriginal: Object.keys(modelosConsolidados),
      ordemFinal: Object.keys(modelosOrdenados),
      detalhesModelos: Object.keys(modelosOrdenados).map(key => ({
        chave: key,
        numeroModelo: modelosOrdenados[key].numeroModelo,
        nome: modelosOrdenados[key].nome,
        quantidadePendulos: modelosOrdenados[key].quantidadePendulos,
        sensoresCompletos: Object.keys(modelosOrdenados[key].sensoresPorPenduloCompletos || {}).length
      }))
    })

    // VERIFICAÇÃO FINAL: Garantir que todos os dados estão presentes antes de criar dado_svg
    const verificacaoFinal = {
      totalModelos: Object.keys(modelosOrdenados).length,
      modelosComPosicoesCabos: 0,
      modelosComSensores: 0,
      modelosComAlturasSensores: 0,
      detalhesModelos: {}
    }

    Object.keys(modelosOrdenados).forEach(modeloKey => {
      const modelo = modelosOrdenados[modeloKey]
      if (modelo && modelo.configuracao) {
        const config = modelo.configuracao

        // Verificar posições dos cabos com segurança
        const temPosicoesCabos = config.posicoesCabos && typeof config.posicoesCabos === 'object' && Object.keys(config.posicoesCabos).length > 0
        if (temPosicoesCabos) verificacaoFinal.modelosComPosicoesCabos++

        // Verificar sensores com segurança
        const temSensores = config.sensoresPorPenduloCompletos && typeof config.sensoresPorPenduloCompletos === 'object' && Object.keys(config.sensoresPorPenduloCompletos).length > 0
        if (temSensores) verificacaoFinal.modelosComSensores++

        // Verificar alturas dos sensores com segurança
        const temAlturas = config.alturasSensores && typeof config.alturasSensores === 'object' && Object.keys(config.alturasSensores).length > 0
        if (temAlturas) verificacaoFinal.modelosComAlturasSensores++

        verificacaoFinal.detalhesModelos[modeloKey] = {
          nome: modelo.nome,
          temPosicoesCabos,
          temSensores,
          temAlturas,
          quantidadePendulos: modelo.quantidadePendulos || 0,
          totalCabos: config.posicoesCabos ? Object.keys(config.posicoesCabos).length : 0,
          totalSensores: config.sensoresPorPenduloCompletos ? Object.keys(config.sensoresPorPenduloCompletos).length : 0
        }
      }
    })

    console.log('🔍 [consolidarModelosParaBanco] VERIFICAÇÃO FINAL antes de salvar no banco:', verificacaoFinal)

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
        modelosDefinidos: modelosOrdenados, // USAR MODELOS ORDENADOS
        sistemaModelos: {
          quantidadeModelos: quantidadeModelos,
          modelosDefinidos: modelosOrdenados, // USAR MODELOS ORDENADOS
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
        verificacaoIntegridade: verificacaoFinal,
        dadosOriginais: {
          modelosEncontrados: modelosEncontrados,
          quantidadeEsperada: quantidadeModelos,
          ordemModelosOriginal: Object.keys(modelosConsolidados),
          ordemModelosFinal: Object.keys(modelosOrdenados)
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

// Helper function to apply cable positions to models
const aplicarPosicoesCabos = (modelos) => {
  Object.keys(modelos).forEach(modeloKey => {
    const modelo = modelos[modeloKey]
    if (modelo && modelo.configuracao) {
      // CORREÇÃO: Consolidar todas as variações de posições dos cabos
      const posicoesCabosConsolidadas = {
        ...modelo.configuracao.posicoesCabos,
        ...modelo.configuracao.posicoesCabosIndividuais,
        ...modelo.configuracao.posicoesCabosPersonalizadas,
        ...modelo.posicoesCabos,
        ...modelo.posicoesCabosIndividuais,
        ...modelo.posicoesCabosPersonalizadas
      }

      // Aplicar em todas as variações para garantir compatibilidade
      modelo.configuracao.posicoesCabos = posicoesCabosConsolidadas
      modelo.configuracao.posicoesCabosIndividuais = posicoesCabosConsolidadas
      modelo.configuracao.posicoesCabosPersonalizadas = posicoesCabosConsolidadas
      modelo.posicoesCabos = posicoesCabosConsolidadas

      console.log(`🎯 [aplicarPosicoesCabos] Modelo ${modeloKey} - Posições aplicadas:`, {
        quantidadeCabos: Object.keys(posicoesCabosConsolidadas).length,
        cabos: Object.keys(posicoesCabosConsolidadas),
        posicoes: posicoesCabosConsolidadas
      })
    }
  })
}

// Função para calcular limites do fundo do armazém
const calcularLimitesFundoArmazem = (config) => {
  const lb = config.lb || 350; // Largura do armazém
  const lf = config.lf || 250; // Largura do fundo
  const le = config.le || 15;  // Espessura lateral

  // Calcular limites do fundo baseado no tipo de fundo
  const inicioFundo = (lb - lf) / 2; // Posição X onde começa o fundo
  const fimFundo = inicioFundo + lf; // Posição X onde termina o fundo

  // Margem de segurança para os sensores não ficarem na borda
  const margemSeguranca = 20;

  return {
    xMinimo: inicioFundo + margemSeguranca,
    xMaximo: fimFundo - margemSeguranca,
    larguraUtil: (fimFundo - inicioFundo) - (2 * margemSeguranca),
    centro: lb / 2
  };
};

// Função para validar e ajustar posições dentro dos limites do fundo
const validarPosicaoDentroDoFundo = (posicao, limitesFundo, escala_sensores = 16) => {
  const metadeEscala = escala_sensores / 2;

  // Garantir que o sensor inteiro (incluindo sua largura) fique dentro do fundo
  const xMinimo = limitesFundo.xMinimo + metadeEscala;
  const xMaximo = limitesFundo.xMaximo - metadeEscala;

  // Ajustar posição se estiver fora dos limites
  if (posicao < xMinimo) {
    console.warn(`⚠️ [VALIDAÇÃO] Posição ${posicao} ajustada para ${xMinimo} (limite mínimo do fundo)`);
    return xMinimo;
  }

  if (posicao > xMaximo) {
    console.warn(`⚠️ [VALIDAÇÃO] Posição ${posicao} ajustada para ${xMaximo} (limite máximo do fundo)`);
    return xMaximo;
  }

  return posicao;
};

// Função para distribuir pêndulos automaticamente dentro do fundo
const distribuirPendulosDentroDoFundo = (quantidadePendulos, limitesFundo) => {
  const posicoes = [];

  if (quantidadePendulos === 1) {
    posicoes.push(limitesFundo.centro);
  } else {
    const espacamento = limitesFundo.larguraUtil / (quantidadePendulos - 1);

    for (let i = 0; i < quantidadePendulos; i++) {
      const posicao = limitesFundo.xMinimo + (i * espacamento);
      posicoes.push(posicao);
    }
  }

  return posicoes;
};

const preservarPosicoesCabos = (dadosSvg) => {
  try {
    const dados = typeof dadosSvg === 'string' ? JSON.parse(dadosSvg) : dadosSvg;

    if (dados.modelosDefinidos) {
      Object.keys(dados.modelosDefinidos).forEach(modeloKey => {
        const modelo = dados.modelosDefinidos[modeloKey];

        if (modelo.configuracao) {
          const config = modelo.configuracao;
          const quantidadePendulos = modelo.quantidadePendulos || 3;

          console.log(`💾 [PRESERVAÇÃO] Modelo ${modeloKey} - Salvando posições exatas dos ${quantidadePendulos} pêndulos`);

          // Garantir que propriedades básicas existam (sem alterar valores)
          if (config.escala_sensores === undefined) config.escala_sensores = 16;
          if (config.dist_y_sensores === undefined) config.dist_y_sensores = 12;
          if (config.dist_x_sensores === undefined) config.dist_x_sensores = 0;
          if (config.posicao_horizontal === undefined) config.posicao_horizontal = 0;
          if (config.posicao_vertical === undefined) config.posicao_vertical = 0;
          if (config.afastamento_vertical_pendulo === undefined) config.afastamento_vertical_pendulo = 0;

          // NOVO: Calcular limites do fundo do armazém
          const limitesFundo = calcularLimitesFundoArmazem(config);
          console.log(`📐 [LIMITES] Modelo ${modeloKey} - Limites do fundo:`, limitesFundo);

          // IMPORTANTE: Preservar posições individuais dos cabos EXATAMENTE como foram salvas
          if (!config.posicoesCabos) {
            config.posicoesCabos = {};
          }

          // Calcular posições padrão distribuídas dentro do fundo
          const posicoesDistribuidas = distribuirPendulosDentroDoFundo(quantidadePendulos, limitesFundo);

          // Garantir estrutura para cada cabo, mas SEM alterar posições existentes
          for (let i = 1; i <= quantidadePendulos; i++) {
            if (!config.posicoesCabos[i]) {
              // Usar posição distribuída dentro do fundo como padrão
              const posicaoPadrao = posicoesDistribuidas[i - 1] || limitesFundo.centro;

              config.posicoesCabos[i] = {
                x: posicaoPadrao, // Posição horizontal dentro do fundo
                y: 0, // Posição vertical personalizada
                offsetX: 0, // Offset adicional X
                offsetY: 0, // Offset adicional Y
                altura: 0, // Altura específica do cabo
                distanciaHorizontal: 0, // Distância horizontal específica
                numeroSensores: 3, // Número de sensores neste cabo/pêndulo
                timestampAlteracao: Date.now(),
                dentroDoFundo: true // Flag indicando que está dentro dos limites
              };
              console.log(`🆕 [PRESERVAÇÃO] Modelo ${modeloKey} - Cabo ${i} - Posição inicial dentro do fundo: ${posicaoPadrao}`);
            } else {
              // PRESERVAR posições já salvas, mas VALIDAR se estão dentro do fundo
              const posicaoExistente = config.posicoesCabos[i];

              // Apenas garantir que campos obrigatórios existam SEM ALTERAR valores existentes
              if (posicaoExistente.offsetX === undefined) posicaoExistente.offsetX = 0;
              if (posicaoExistente.offsetY === undefined) posicaoExistente.offsetY = 0;
              if (posicaoExistente.altura === undefined) posicaoExistente.altura = 0;
              if (posicaoExistente.distanciaHorizontal === undefined) posicaoExistente.distanciaHorizontal = 0;
              if (posicaoExistente.numeroSensores === undefined) posicaoExistente.numeroSensores = 3;
              if (!posicaoExistente.timestampAlteracao) posicaoExistente.timestampAlteracao = Date.now();

              // VALIDAR se a posição está dentro dos limites do fundo
              const posicaoFinalX = (posicaoExistente.x || 0) + (posicaoExistente.offsetX || 0);
              const posicaoValidada = validarPosicaoDentroDoFundo(posicaoFinalX, limitesFundo, config.escala_sensores);

              // Se a posição foi ajustada, atualizar
              if (posicaoValidada !== posicaoFinalX) {
                // Recalcular x e offsetX para manter a posição dentro do fundo
                posicaoExistente.x = posicaoValidada;
                posicaoExistente.offsetX = 0; // Resetar offset para evitar confusão
                posicaoExistente.timestampAlteracao = Date.now();
                posicaoExistente.ajustadoParaFundo = true;

                console.log(`🔧 [AJUSTE] Modelo ${modeloKey} - Cabo ${i} - Posição ajustada para dentro do fundo: ${posicaoValidada}`);
              }

              posicaoExistente.dentroDoFundo = true;

              console.log(`✅ [PRESERVAÇÃO] Modelo ${modeloKey} - Cabo ${i} - Posição validada: x=${posicaoExistente.x}, y=${posicaoExistente.y}`);
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ [configuracaoService] Erro ao preservar posições dos cabos:', error);
  }
};


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
      if (dados.tipoConfiguracao === 'armazem_completo_v5' || dados.versao === '5.0' || dados.quantidadeModelos) {
        // CORREÇÃO: Detectar configuração com modelos (v5.0 ou com modelosDefinidos)
        console.log('📦 [configuracaoService] Processando configuração v5.0 completa com posições preservadas')

        const modelosDefinidos = dados.modelosDefinidos || dados.sistemaModelos?.modelosDefinidos || {}

        // CORREÇÃO CRÍTICA: Aplicar posições dos cabos PRESERVANDO EXATAMENTE as coordenadas
        Object.keys(modelosDefinidos).forEach(modeloKey => {
          const modelo = modelosDefinidos[modeloKey]
          if (modelo && modelo.configuracao) {
            const config = modelo.configuracao

            // Preservar EXATAMENTE as posições originais sem alteração
            if (config.posicoesCabos || config.posicoesCabosIndividuais || config.posicoesCabosPersonalizadas) {
              const posicoesCabosOriginais = {
                ...config.posicoesCabos,
                ...config.posicoesCabosIndividuais,  
                ...config.posicoesCabosPersonalizadas
              }

              // Aplicar nas 3 propriedades para garantir compatibilidade
              config.posicoesCabos = { ...posicoesCabosOriginais }
              config.posicoesCabosIndividuais = { ...posicoesCabosOriginais }
              config.posicoesCabosPersonalizadas = { ...posicoesCabosOriginais }

              console.log(`🎯 [aplicarConfiguracaoCompleta] Modelo ${modeloKey} - Posições PRESERVADAS:`, {
                quantidadeCabos: Object.keys(posicoesCabosOriginais).length,
                posicoes: posicoesCabosOriginais
              })
            }

            // CORREÇÃO CRÍTICA: Preservar também as informações dos sensores por pêndulo
            if (config.sensoresPorPenduloCompletos) {
              console.log(`🎯 [aplicarConfiguracaoCompleta] Modelo ${modeloKey} - Sensores preservados:`, {
                quantidadePendulos: Object.keys(config.sensoresPorPenduloCompletos).length,
                sensores: config.sensoresPorPenduloCompletos
              })
            }

            // CORREÇÃO: Garantir que alturas dos sensores sejam preservadas
            if (config.alturasSensores) {
              console.log(`🎯 [aplicarConfiguracaoCompleta] Modelo ${modeloKey} - Alturas dos sensores preservadas:`, config.alturasSensores)
            }
          }
        })

        // CORREÇÃO ADICIONAL: Verificar se os dados estão sendo preservados corretamente
        console.log('🔍 [aplicarConfiguracaoCompleta] Verificação final dos dados preservados:', {
          totalModelos: Object.keys(modelosDefinidos).length,
          modelosComPosicoes: Object.keys(modelosDefinidos).filter(k => 
            modelosDefinidos[k]?.configuracao?.posicoesCabos && 
            Object.keys(modelosDefinidos[k].configuracao.posicoesCabos).length > 0
          ).length,
          modelosComSensores: Object.keys(modelosDefinidos).filter(k => 
            modelosDefinidos[k]?.configuracao?.sensoresPorPenduloCompletos && 
            Object.keys(modelosDefinidos[k].configuracao.sensoresPorPenduloCompletos).length > 0
          ).length
        })

        return {
          success: true,
          dados: {
            tipo: 'armazem',
            versao: '5.0',
            tipoConfiguracao: 'armazem_completo_v5',
            quantidadeModelos: dados.quantidadeModelos || Object.keys(modelosDefinidos).length,
            modelos: modelosDefinidos,
            configuracaoGlobal: dados.configuracaoGlobal || {},
            layoutsAutomaticos: dados.layoutsAutomaticos || {},
            dimensoesSVG: dados.dimensoesSVG || { largura: 350, altura: 200 },
            dadosOriginais: dados.dadosOriginais || null,
            estadoAtual: dados.estadoAtual || null,
            logicaDistribuicao: dados.sistemaModelos?.logicaDistribuicao || null
          }
        }
      } else if (dados.tipoConfiguracao === 'armazem_completo_v4' || dados.versao === '4.0') {
        // Nova estrutura v4.0 com sistema completo
        console.log('📦 [configuracaoService] Processando configuração v4.0 completa')

        // CORREÇÃO: Aplicar posições dos cabos
        const modelosComPosicoes = dados.sistemaModelos?.modelosDefinidos || {}
        aplicarPosicoesCabos(modelosComPosicoes)

        return {
          success: true,
          dados: {
            tipo: 'armazem',
            versao: '4.0',
            tipoConfiguracao: 'armazem_completo_v4',
            quantidadeModelos: dados.sistemaModelos?.quantidadeModelos || 1,
            modelos: modelosComPosicoes,
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
  validarConfiguracao,
  preservarPosicoesCabos // Exportando a nova função
}