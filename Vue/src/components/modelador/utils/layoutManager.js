const LayoutManager = {
  // Analisar estrutura dos arcos baseada na nova estrutura da API
  analisarEstruturaArcos(dados) {
    if (!dados.arcos) {
      return this.criarEstruturaMinima()
    }

    const estrutura = {
      totalArcos: 0,
      arcos: {},
      estatisticas: {
        totalPendulos: 0,
        totalSensores: 0
      }
    }

    // Processar cada arco
    Object.keys(dados.arcos).forEach(numeroArco => {
      const dadosArco = dados.arcos[numeroArco]
      const arcoNum = parseInt(numeroArco)

      estrutura.totalArcos = Math.max(estrutura.totalArcos, arcoNum)

      const infoArco = {
        numero: arcoNum,
        totalPendulos: 0,
        totalSensores: 0,
        pendulos: []
      }

      // Processar cada pêndulo no arco
      Object.keys(dadosArco).forEach(numeroPendulo => {
        const dadosPendulo = dadosArco[numeroPendulo]
        const penduloNum = parseInt(numeroPendulo)

        const infoPendulo = {
          numero: penduloNum,
          totalSensores: Object.keys(dadosPendulo).length
        }

        infoArco.pendulos.push(infoPendulo)
        infoArco.totalPendulos++
        infoArco.totalSensores += infoPendulo.totalSensores
      })

      // Ordenar pêndulos por número
      infoArco.pendulos.sort((a, b) => a.numero - b.numero)

      estrutura.arcos[arcoNum] = infoArco
      estrutura.estatisticas.totalPendulos += infoArco.totalPendulos
      estrutura.estatisticas.totalSensores += infoArco.totalSensores
    })

    return estrutura
  },

  criarEstruturaMinima() {
    return {
      totalArcos: 1,
      arcos: {
        1: {
          numero: 1,
          totalPendulos: 1,
          totalSensores: 1,
          pendulos: [{ numero: 1, totalSensores: 1 }]
        }
      },
      estatisticas: {
        totalPendulos: 1,
        totalSensores: 1
      }
    }
  },

  // Gerar layout automático baseado na análise
  gerarLayoutAutomatico(analiseArcos) {
    if (!analiseArcos) return {}

    const layouts = {}

    Object.values(analiseArcos.arcos).forEach(arco => {
      const layoutArco = this.gerarLayoutParaArco(arco)
      layouts[`arco_${arco.numero}`] = layoutArco
    })

    return layouts
  },

  gerarLayoutParaArco(infoArco) {
    const totalPendulos = infoArco.totalPendulos || infoArco.pendulos?.length || 1

    // Calcular largura baseada na quantidade de pêndulos  
    const larguraMinima = 350
    const larguraCalculada = Math.max(larguraMinima, totalPendulos * 80 + 120)

    // Margem mais generosa para garantir que os cabos fiquem bem centralizados
    const margemLateral = Math.max(50, larguraCalculada * 0.12)
    const larguraUtilizavel = larguraCalculada - (2 * margemLateral)

    // Calcular posições dos cabos distribuídas uniformemente
    const posicoesCabos = []

    if (totalPendulos === 1) {
      posicoesCabos.push(larguraCalculada / 2)
    } else {
      const espacamento = larguraUtilizavel / (totalPendulos - 1)
      for (let i = 0; i < totalPendulos; i++) {
        const posicao = margemLateral + (i * espacamento)
        posicoesCabos.push(Math.round(posicao * 10) / 10) // Arredondar para 1 casa decimal
      }
    }

    // Calcular altura adequada
    const maxSensores = Math.max(...(infoArco.pendulos?.map(p => p.totalSensores) || [4]))
    const alturaCalculada = Math.max(300, 200 + (maxSensores * 15))

    return {
      desenho_sensores: {
        pos_x_cabo: posicoesCabos,
        escala_sensores: 16,
        dist_y_sensores: 12
      },
      configuracao: {
        largura: larguraCalculada,
        altura: alturaCalculada,
        totalPendulos: totalPendulos
      }
    }
  }
}

export default LayoutManager