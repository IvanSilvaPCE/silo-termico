<template>
  <div class="svg-container-responsive w-100 position-relative">
    <!-- SVG do Armazém -->
    <div class="svg-wrapper" :style="svgWrapperStyle">
      <!-- SVG content is generated internally by trusted methods (renderArmazem/renderSensores) -->
      <svg :viewBox="`0 0 ${dimensoesCalculadas.largura} ${dimensoesCalculadas.altura}`" :style="svgEstiloCompleto" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" v-html="svgContent">
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArmazemSvg',
  components: {
  },
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        pb: 185,
        lb: 350,
        hb: 30,
        hf: 6,
        lf: 250,
        le: 15,
        ht: 50,
        tipo_telhado: 1,
        curvatura_topo: 30,
        pontas_redondas: false,
        raio_pontas: 15,
        estilo_laterais: 'reta',
        curvatura_laterais: 0,
        tipo_fundo: 0,
        altura_fundo_reto: 10,
        altura_funil_v: 18,
        posicao_ponta_v: 0,
        inclinacao_funil_v: 1,
        largura_abertura_v: 20,
        altura_duplo_v: 22,
        posicao_v_esquerdo: -1,
        posicao_v_direito: 1,
        largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3,
        largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0,
        deslocamento_vertical_fundo: -1,
        escala_sensores: 16,
        dist_y_sensores: 12,
        dist_x_sensores: 0,
        posicao_horizontal: 0,
        posicao_vertical: 0,
        afastamento_vertical_pendulo: 0,
        // 🎯 ESTRUTURA CORRIGIDA: Dados separados por modelo
        quantidadePendulos: 3,
        sensoresPorPendulo: {}, // Quantidade de sensores para cada pêndulo: { 1: 4, 2: 3, 3: 5 }
        posicoesCabos: {}, // Posições individuais dos pêndulos: { 1: {x: 0, y: 0}, 2: {x: 10, y: 5} }
        alturasSensores: {}, // Alturas personalizadas por pêndulo e sensor: { 1: {1: 25, 2: 50}, 2: {1: 30} }
        // Dimensões específicas baseadas no fundo
        dimensoesSvgFundo: {
          largura: null,
          altura: null,
          baseadoEm: 'config_fundo'
        },
        // Novas chaves para salvar posições manuais
        posicoesManualPendulos: {}, // Ex: { 1: { x: 100, y: 50 }, 2: { x: 150, y: 60 } }
        posicoesManualSensores: {} // Ex: { '1-1': { x: 110, y: 45 }, '1-2': { x: 110, y: 35 } }
      })
    },
    dadosSensores: {
      type: Object,
      default: null
    },
    modeloAtual: {
      type: Object,
      default: () => ({
        quantidadePendulos: 3,
        sensoresPorPendulo: { 1: 4, 2: 3, 3: 5 },
        posicoesCabos: {}
      })
    },
    larguraSvg: {
      type: Number,
      default: 350
    },
    alturaSvg: {
      type: Number,
      default: 300
    },
    // Nova prop para forçar dimensões específicas
    dimensoesPersonalizadas: {
      type: Object,
      default: null
    },
    opacidadesSvg: {
      type: Object,
      default: () => ({
        geral: 1.0,
        pendulos: 1.0,
        estrutura: 1.0
      })
    }
  },
  data() {
    return {
      larguraSVG: 350,
      alturaSVG: 300,
      svgViewBox: '0 0 350 300',

      // Offset para posicionamento de pêndulos
      offsetPenduloX: 0,

      // Cache de elementos calculados
      elementosCache: {
        pathArmazem: '',
        posicoesCabos: [],
        posicoesSensores: []
      },

      // Controle de redimensionamento
      redimensionandoSVG: false,
      svgContent: '',
      opacidadesSvgLocal: {
        geral: 1.0,
        pendulos: 1.0,
        estrutura: 1.0
      }
    }
  },
  computed: {
    dimensoesCalculadas() {
      // Se há dimensões personalizadas vindas do banco, usar essas
      if (this.dimensoesPersonalizadas) {
        return {
          largura: this.dimensoesPersonalizadas.largura || this.calcularDimensoesBaseadoNoFundo().largura,
          altura: this.dimensoesPersonalizadas.altura || this.calcularDimensoesBaseadoNoFundo().altura
        }
      }

      // Se há dimensões salvas na configuração, usar essas
      if (this.config.dimensoesSvgFundo && this.config.dimensoesSvgFundo.largura && this.config.dimensoesSvgFundo.altura) {
        return {
          largura: this.config.dimensoesSvgFundo.largura,
          altura: this.config.dimensoesSvgFundo.altura
        }
      }

      // Caso contrário, calcular baseado no fundo
      return this.calcularDimensoesBaseadoNoFundo()
    },


    svgStyle() {
      return {
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: this.isMobile ? '50vh' : '500px',
        minHeight: this.isMobile ? '200px' : '250px',
        border: '1px solid #ddd',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        imageRendering: 'optimizeQuality'
      }
    },

    svgWrapperStyle() {
      return {
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: 'auto',
        opacity: this.opacidadesSvgLocal.geral,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 10px'
      }
    },

    svgEstiloCompleto() {
      return {
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: this.isMobile ? '50vh' : '500px',
        border: '1px solid #ddd',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        imageRendering: 'optimizeQuality',
        display: 'block',
        objectFit: 'contain'
      }
    },
  },
  watch: {
    config: {
      handler(newConfig, oldConfig) {
        // 📐 DETECTAR MUDANÇA NA LARGURA BASE
        if (oldConfig && newConfig.lb !== oldConfig.lb) {

          // Força recálculo das dimensões quando muda
          const novasDimensoes = this.recalcularDimensoes()
          // 🎯 SALVAR automaticamente as novas dimensões
          this.salvarDimensoesNoModelo(novasDimensoes)
        }
        this.updateSVG()
      },
      deep: true,
      immediate: true
    },
    dadosSensores: {
      handler() {
        this.updateSVG()
      },
      deep: true
    },
    modeloAtual: {
      handler() {
        this.updateSVG()
      },
      deep: true
    },
    larguraSvg() {
      this.updateSVG()
    },
    alturaSvg() {
      this.updateSVG()
    },
    opacidadesSvg: {
      handler(novasOpacidades) {
        this.opacidadesSvgLocal = { ...novasOpacidades }
        this.updateSVG()
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.updateSVG()
  },
  methods: {
    updateSVG() {
      // Generate SVG content from internal methods (safe since no external input)
      const rawContent = this.renderArmazem() + this.renderSensores()
      this.svgContent = this.validateSvgContent(rawContent)
    },

    // Security validation for SVG content (internal generation only)
    validateSvgContent(content) {
      // Since content is generated internally by trusted methods, basic validation is sufficient
      // Remove any potentially dangerous elements/attributes (though shouldn't exist in our generated content)
      const safeContent = content
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove any script tags
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers

      return safeContent
    },

    calcularDimensoesBaseadoNoFundo() {
      // 📏 ADAPTAÇÃO DINÂMICA DO SVG - RESPONSIVO COMPLETO
      const config = this.config


      // 🚀 DETECTAR quantidade de pêndulos dinamicamente
      let quantidadePendulos = 0
      let sensoresPorPendulo = {}

      if (config.modeloEspecifico) {
        quantidadePendulos = config.modeloEspecifico.quantidadePendulos || 0
        sensoresPorPendulo = config.modeloEspecifico.sensoresPorPendulo || {}
      } else {
        quantidadePendulos = config.quantidadePendulos || this.modeloAtual?.quantidadePendulos || 0
        sensoresPorPendulo = config.sensoresPorPendulo || this.modeloAtual?.sensoresPorPendulo || {}
      }

      // 🔍 FALLBACK: Extrair dos dados se não há quantidade definida
      if (quantidadePendulos === 0) {
        const pendulosDetectados = Math.max(
          Object.keys(sensoresPorPendulo).length,
          ...Object.keys(sensoresPorPendulo).map(p => parseInt(p) || 0)
        )
        quantidadePendulos = pendulosDetectados || 3
      }

      // 📐 LARGURA BASE - PRIORIZAR LARGURA SALVA NO MODELO (HIERARQUIA CORRIGIDA)
      let larguraBase = 350 // valor padrão

      // Prioridade 1: Configuração atual do componente (mais específica)
      if (config.lb && typeof config.lb === 'number' && config.lb > 0) {
        larguraBase = config.lb
      } 
      // Prioridade 2: Configuração do modelo atual
      else if (this.modeloAtual?.configuracao?.lb && typeof this.modeloAtual.configuracao.lb === 'number' && this.modeloAtual.configuracao.lb > 0) {
        larguraBase = this.modeloAtual.configuracao.lb
      }
      // Prioridade 3: Largura das props externas
      else if (this.larguraSvg && this.larguraSvg > 200) {
        larguraBase = this.larguraSvg
      }

      // Expandir largura baseado na quantidade de pêndulos se necessário
      if (quantidadePendulos > 0) {
        const margemLateral = 35
        const espacamentoPendulo = 25
        const larguraMinimaNecessaria = (2 * margemLateral) + ((quantidadePendulos - 1) * espacamentoPendulo) + 50
        larguraBase = Math.max(larguraBase, larguraMinimaNecessaria)
      }

      // 📏 ALTURA COMPLETA - CALCULAR TODOS OS COMPONENTES
      const alturaBaseConfig = config.pb || 185

      // Altura do telhado baseada no tipo
      let alturaTelho = 20
      if (config.tipo_telhado === 1) {
        const curvaturaAjustada = Math.max(15, 60 - (config.curvatura_topo || 30))
        alturaTelho = curvaturaAjustada
      } else if (config.tipo_telhado === 2 || config.tipo_telhado === 3) {
        alturaTelho = Math.max(15, 70 - (config.curvatura_topo || 30))
      }

      // Altura do corpo principal
      const alturaCorpo = (config.ht || 50) + alturaBaseConfig

      // Extensão do fundo
      let extensaoFundo = 0
      if (config.tipo_fundo === 1) {
        extensaoFundo = config.altura_funil_v || 40
      } else if (config.tipo_fundo === 2) {
        extensaoFundo = config.altura_duplo_v || 35
      }

      // 🎯 NÃO CALCULAR ESPAÇO PARA SENSORES - manter ViewBox consistente
      // (Os sensores são renderizados mas não afetam as dimensões do ViewBox)
      const espacoSensores = 0

      // 🔧 CORRIGIDO: Altura natural sem ajustes arbitrários para alinhamento com ModeladorSVG
      const margemTopo = 25
      const margemBase = 15
      const alturaTotal = margemTopo + alturaTelho + alturaCorpo + extensaoFundo + espacoSensores + margemBase


      return {
        largura: larguraBase,
        altura: alturaTotal
      }
    },

    renderArmazem() {
      return `
        <style>
          .sensor-element, .pendulo-element, text, rect {
            transition: all 0.15s ease-out;
          }
        </style>
      ` + this.renderTelhadoComOpacidade() + this.renderFundoComOpacidade()
    },

    renderTelhadoComOpacidade() {
      const svgTelhado = this.renderTelhado()
      // Aplicar opacidade da estrutura ao telhado
      return svgTelhado.replace(/fill="#E6E6E6"/g, `fill="#E6E6E6" opacity="${this.opacidadesSvgLocal.estrutura}"`)
                      .replace(/stroke="#999999"/g, `stroke="#999999" opacity="${this.opacidadesSvgLocal.estrutura}"`)
    },

    renderFundoComOpacidade() {
      const svgFundo = this.renderFundo()
      // Aplicar opacidade da estrutura ao fundo
      return svgFundo.replace(/fill="#999999"/g, `fill="#999999" opacity="${this.opacidadesSvgLocal.estrutura}"`)
    },

    renderTelhado() {
      const {
        tipo_telhado, curvatura_topo, pb, lb, hb, hf, lf, le, ht, tipo_fundo,
        pontas_redondas, raio_pontas, estilo_laterais, curvatura_laterais
      } = this.config

      if (tipo_telhado === 1) {
        // Telhado Pontudo - AJUSTADO PARA PREVIEW
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 7
        }

        // 🎯 ALTURA DO TOPO AJUSTADA - começar mais próximo do topo do viewBox
        const alturaTopo = Math.max(15, 50 - (curvatura_topo || 30))
        const margemTopo = 20 // margem adequada do topo para não cortar

        const p1 = [(lb - lf) / 2, pb - hf + extensao]
        const p2 = [le, pb - hb + extensao]
        const p3 = [le, pb - ht]
        const p4 = [lb / 2, margemTopo] // Posição ajustada para não cortar
        const p5 = [lb - le, pb - ht]
        const p6 = [lb - le, pb - hb + extensao]
        const p7 = [lb - (lb - lf) / 2, pb - hf + extensao]

        if (pontas_redondas || estilo_laterais !== 'reta') {
          let pathTelhado = `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]}`

          if (estilo_laterais === 'curvatura_lateral' && curvatura_laterais !== 0) {
            if (curvatura_laterais < 0) {
              pathTelhado += ` Q ${p3[0] + Math.abs(curvatura_laterais)} ${(p3[1] + p4[1]) / 2} ${p4[0]} ${p4[1]}`
            } else {
              pathTelhado += ` Q ${p3[0] - curvatura_laterais} ${(p3[1] + p4[1]) / 2} ${p4[0]} ${p4[1]}`
            }
          } else {
            pathTelhado += ` L ${p4[0]} ${p4[1]}`
          }

          if (pontas_redondas) {
            const pontoControle1X = p4[0] - (raio_pontas || 15)
            const pontoControle2X = p4[0] + (raio_pontas || 15)
            pathTelhado = pathTelhado.replace(`L ${p4[0]} ${p4[1]}`,
              `Q ${pontoControle1X} ${p4[1] - (raio_pontas || 15)} ${p4[0]} ${p4[1]} Q ${pontoControle2X} ${p4[1] - (raio_pontas || 15)} ${p5[0]} ${p5[1]}`)
          } else {
            if (estilo_laterais === 'curvatura_lateral' && curvatura_laterais !== 0) {
              if (curvatura_laterais < 0) {
                pathTelhado += ` Q ${p5[0] - Math.abs(curvatura_laterais)} ${(p5[1] + p4[1]) / 2} ${p5[0]} ${p5[1]}`
              } else {
                pathTelhado += ` Q ${p5[0] + curvatura_laterais} ${(p5[1] + p4[1]) / 2} ${p5[0]} ${p5[1]}`
              }
            } else {
              pathTelhado += ` L ${p5[0]} ${p5[1]}`
            }
          }

          pathTelhado += ` L ${p6[0]} ${p6[1]} L ${p7[0]} ${p7[1]} Z`
          return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="${pathTelhado}" />`
        } else {
          const pathTelhado = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')}`
          return `<polygon fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" points="${pathTelhado}" />`
        }
      } else if (tipo_telhado === 2) {
        // Telhado Arredondado - AJUSTADO PARA PREVIEW
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        const alturaCurva = Math.max(20, 60 - (curvatura_topo || 30)) // altura mínima aumentada
        const margemTopo = 20

        let pathTelhado = `M ${(lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` L ${le} ${pb - hb + extensao}`
        pathTelhado += ` L ${le} ${pb - ht}`
        pathTelhado += ` Q ${lb / 2} ${margemTopo} ${lb - le} ${pb - ht}` // Ajustado para não cortar
        pathTelhado += ` L ${lb - le} ${pb - hb + extensao}`
        pathTelhado += ` L ${lb - (lb - lf) / 2} ${pb - hf + extensao} Z`

        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="${pathTelhado}" />`
      } else if (tipo_telhado === 3) {
        // Telhado em Arco - AJUSTADO PARA PREVIEW
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        const raioArco = Math.max(20, curvatura_topo || 30)
        const margemTopo = 25 // margem adequada para o arco não cortar

        let pathTelhado = `M ${(lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` L ${le} ${pb - hb + extensao}`
        pathTelhado += ` L ${le} ${pb - ht}`
        // Ajustar o arco para começar mais baixo
        const alturaArco = Math.min(raioArco, (pb - ht) - margemTopo)
        pathTelhado += ` A ${(lb - le * 2) / 2} ${alturaArco} 0 0 1 ${lb - le} ${pb - ht}`
        pathTelhado += ` L ${lb - le} ${pb - hb + extensao}`
        pathTelhado += ` L ${lb - (lb - lf) / 2} ${pb - hf + extensao} Z`

        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="${pathTelhado}" />`
      }

      return ''
    },

    renderFundo() {
      const { tipo_fundo } = this.config

      if (tipo_fundo === 0) {
        return this.renderFundoReto()
      } else if (tipo_fundo === 1) {
        return this.renderFundoFunilV()
      } else if (tipo_fundo === 2) {
        return this.renderFundoDuploV()
      }

      return ''
    },

    renderFundoReto() {
      const {
        pb, lb, hb, le, lf, altura_fundo_reto = 10,
        deslocamento_horizontal_fundo = 0, deslocamento_vertical_fundo = 0
      } = this.config

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]
      const p3 = [lb - (lb - lf) / 2 + ajuste_horizontal, pb - altura_fundo_reto + ajuste_base]
      const p4 = [(lb - lf) / 2 + ajuste_horizontal, pb - altura_fundo_reto + ajuste_base]
      const p5 = [le + ajuste_horizontal, pb - hb + ajuste_base]
      const p6 = [0 + ajuste_horizontal, pb - hb + ajuste_base]
      const p7 = [0 + ajuste_horizontal, pb + ajuste_base]
      const p8 = [lb + ajuste_horizontal, pb + ajuste_base]

      const pathBase = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')} ${p8.join(',')}`
      return `<polygon fill="#999999" points="${pathBase}" />`
    },

    renderFundoFunilV() {
      const {
        pb, lb, hb, le, altura_funil_v = 40, posicao_ponta_v = 0,
        largura_abertura_v = 20, inclinacao_funil_v = 1,
        deslocamento_horizontal_fundo = 0, deslocamento_vertical_fundo = 0
      } = this.config

      const centroBase = lb / 2
      const deslocamentoPonta = lb * 0.1 * posicao_ponta_v
      const pontaX = centroBase + deslocamentoPonta

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo

      const inclinacao_direita = altura_funil_v * inclinacao_funil_v
      const inclinacao_esquerda = altura_funil_v * inclinacao_funil_v

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]
      const p3 = [pontaX + largura_abertura_v / 2 + inclinacao_direita + ajuste_horizontal, pb - hb + ajuste_base + altura_funil_v]
      const p4 = [pontaX - largura_abertura_v / 2 - inclinacao_esquerda + ajuste_horizontal, pb - hb + ajuste_base + altura_funil_v]
      const p5 = [le + ajuste_horizontal, pb - hb + ajuste_base]
      const p6 = [0 + ajuste_horizontal, pb - hb + ajuste_base]
      const p7 = [0 + ajuste_horizontal, pb + ajuste_base]
      const p8 = [lb + ajuste_horizontal, pb + ajuste_base]

      const pontos = [p1, p2, p3, p4, p5, p6, p7, p8]
      const pathBase = pontos.map(p => p.join(',')).join(' ')
      return `<polygon fill="#999999" points="${pathBase}" />`
    },

    renderFundoDuploV() {
      const {
        pb, lb, hb, le, altura_duplo_v = 35,
        posicao_v_esquerdo = -0.5, posicao_v_direito = 0.5,
        largura_abertura_duplo_v = 15, altura_plataforma_duplo_v = 0.3,
        largura_plataforma_duplo_v = 40,
        deslocamento_horizontal_fundo = 0, deslocamento_vertical_fundo = 0
      } = this.config

      const centroBase = lb / 2
      const pontaEsquerdaX = centroBase + lb * 0.2 * posicao_v_esquerdo
      const pontaDireitaX = centroBase + lb * 0.2 * posicao_v_direito

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]
      const p3 = [pontaDireitaX + largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p4 = [pontaDireitaX - largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p5 = [centroBase + largura_plataforma_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v * altura_plataforma_duplo_v]
      const p6 = [centroBase - largura_plataforma_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v * altura_plataforma_duplo_v]
      const p7 = [pontaEsquerdaX + largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p8 = [pontaEsquerdaX - largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p9 = [le + ajuste_horizontal, pb - hb + ajuste_base]
      const p10 = [0 + ajuste_horizontal, pb - hb + ajuste_base]
      const p11 = [0 + ajuste_horizontal, pb + ajuste_base]
      const p12 = [lb + ajuste_horizontal, pb + ajuste_base]

      const pontos = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]
      const pathBase = pontos.map(p => p.join(',')).join(' ')
      return `<polygon fill="#999999" points="${pathBase}" />`
    },

    renderSensores() {
      // 🎯 REPLICAR EXATAMENTE A LÓGICA DO ModeladorSVG.vue
      let elementos = ''

      // Determinar estrutura dos pêndulos baseada no modelo atual (igual ModeladorSVG)
      let estruturaPendulos
      const modeloAtual = this.modeloAtual

      if (modeloAtual && (modeloAtual.quantidadePendulos || modeloAtual.sensoresPorPendulo)) {
        // Usar configuração do modelo para o arco
        const quantidade = modeloAtual.quantidadePendulos || 3
        const sensoresPorPendulo = modeloAtual.sensoresPorPendulo || {}

        estruturaPendulos = {
          pendulos: Array.from({ length: quantidade }, (_, i) => ({
            numero: i + 1,
            totalSensores: sensoresPorPendulo[i + 1] || 1
          }))
        }
      } else {
        // Fallback para estrutura mínima
        estruturaPendulos = {
          pendulos: Array.from({ length: 3 }, (_, i) => ({
            numero: i + 1,
            totalSensores: 3
          }))
        }
      }

      if (!estruturaPendulos) return ''

      // Usar configuração aplicada (igual ModeladorSVG)
      const config = this.config
      const escala_sensores = config.escala_sensores || 16
      const dist_y_sensores = config.dist_y_sensores || 12
      const dist_x_sensores = config.dist_x_sensores || 0
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      // 🔧 CORRIGIDO: Usar largura do viewBox para manter alinhamento correto
      const totalCabos = estruturaPendulos.pendulos.length
      const larguraTotal = this.dimensoesCalculadas.largura  // Usar largura real do viewBox
      const indiceCentral = Math.floor((totalCabos - 1) / 2)


      estruturaPendulos.pendulos.forEach((pendulo, index) => {
        // 🔧 CORRIGIDO: Usar fonte única de verdade para posições
        const distanciaDoMeio = index - indiceCentral
        const deslocamentoX = distanciaDoMeio * dist_x_sensores


        // 🎯 FONTE ÚNICA DE VERDADE: Calcular posição original do pêndulo (IGUAL ModeladorSVG.vue)
        const posicaoOriginalPendulo = this.calcularPosicaoOriginalPendulo(pendulo.numero, totalCabos, larguraTotal)
        let xCaboFinal = posicaoOriginalPendulo.x
        let yPenduloFinal = posicaoOriginalPendulo.y

        // 🎯 BUSCAR POSIÇÃO MANUAL ESPECÍFICA DO PÊNDULO (não dos sensores)
        if (this.config.modeloEspecifico && this.config.modeloEspecifico.posicoesManualPendulos && this.config.modeloEspecifico.posicoesManualPendulos[pendulo.numero]) {
          // PRIORIDADE 1: Posições manuais da estrutura v6.0 (posicoesManualPendulos)
          const posManualPenduloV6 = this.config.modeloEspecifico.posicoesManualPendulos[pendulo.numero]
          // 🔧 CORRIGIDO: Aplicar offset à posição original calculada (IGUAL ModeladorSVG.vue)
          xCaboFinal = posicaoOriginalPendulo.x + (parseFloat(posManualPenduloV6.x) || 0)
          yPenduloFinal = posicaoOriginalPendulo.y + (parseFloat(posManualPenduloV6.y) || 0)
        } else if (this.config.posicoesManualPendulos && this.config.posicoesManualPendulos[pendulo.numero]) {
          // PRIORIDADE 2: Posições manuais de drag and drop do ModeladorSVG (compatibilidade)
          const posManualPendulo = this.config.posicoesManualPendulos[pendulo.numero]
          // 🔧 CORRIGIDO: Aplicar offset à posição original calculada (IGUAL ModeladorSVG.vue)
          xCaboFinal = posicaoOriginalPendulo.x + (parseFloat(posManualPendulo.x) || 0)
          yPenduloFinal = posicaoOriginalPendulo.y + (parseFloat(posManualPendulo.y) || 0)
        } else if (this.config.modeloEspecifico && this.config.modeloEspecifico.posicoesPendulos && this.config.modeloEspecifico.posicoesPendulos[pendulo.numero]) {
          // PRIORIDADE 3: Posições do modeloEspecifico (formato v6.0+ estrutural)
          const posEspecPendulo = this.config.modeloEspecifico.posicoesPendulos[pendulo.numero]
          const offsetPenduloX = parseFloat(posEspecPendulo.x) || 0
          const offsetPenduloY = parseFloat(posEspecPendulo.y) || 0
          xCaboFinal = posicaoOriginalPendulo.x + offsetPenduloX
          yPenduloFinal = posicaoOriginalPendulo.y + offsetPenduloY
        } else if (this.config.posicoesCabos && this.config.posicoesCabos[pendulo.numero]) {
          // PRIORIDADE 4: Posições dos cabos (compatibilidade)
          const posCaboPendulo = this.config.posicoesCabos[pendulo.numero]
          const offsetPenduloX = parseFloat(posCaboPendulo.x) || 0
          const offsetPenduloY = parseFloat(posCaboPendulo.y) || 0
          xCaboFinal = posicaoOriginalPendulo.x + offsetPenduloX
          yPenduloFinal = posicaoOriginalPendulo.y + offsetPenduloY
        } else {
        }

        // Para compatibilidade com o código existente
        const xCabo = xCaboFinal
        const numSensores = pendulo.totalSensores

        // 🎨 DETERMINAR COR DO PÊNDULO (igual ModeladorSVG)
        const corPendulo = "#3A78FD"
        const strokePendulo = "none"
        const strokeWidth = "0"

        // 📦 RETÂNGULO DO NOME DO PÊNDULO (igual ModeladorSVG)
        elementos += `
          <rect
            id="C${index + 1}"
            x="${xCabo - escala_sensores / 2}"
            y="${yPenduloFinal}"
            width="${escala_sensores}"
            height="${escala_sensores / 2}"
            rx="2"
            ry="2"
            fill="${corPendulo}"
            stroke="${strokePendulo}"
            stroke-width="${strokeWidth}"
            opacity="${this.opacidadesSvgLocal.pendulos}"
          />
        `

        // 📝 TEXTO DO NOME DO PÊNDULO (igual ModeladorSVG)
        elementos += `
          <text
            id="TC${index + 1}"
            x="${xCabo}"
            y="${yPenduloFinal + escala_sensores / 4}"
            text-anchor="middle"
            dominant-baseline="central"
            font-weight="bold"
            font-size="${escala_sensores * 0.4 - 0.5}"
            font-family="Arial"
            fill="white"
            opacity="${this.opacidadesSvgLocal.pendulos}"
          >
            P${pendulo.numero}
          </text>
        `

        // 🌡️ SENSORES (igual ModeladorSVG)
        for (let s = 1; s <= numSensores; s++) {
          const ySensorBase = yPenduloFinal - dist_y_sensores * s - 25 - afastamento_vertical_pendulo

          let xSensorFinal = xCabo
          let ySensorFinal = ySensorBase

          // 🎯 VERIFICAR POSIÇÕES MANUAIS DOS SENSORES (independente do pêndulo)
          const chaveManualSensor = `${pendulo.numero}-${s}`

          // 🎯 CALCULAR POSIÇÃO ORIGINAL DO SENSOR (IGUAL ModeladorSVG.vue)
          const posicaoOriginalSensor = this.calcularPosicaoOriginalSensor(pendulo.numero, s, totalCabos, larguraTotal)

          // PRIORIDADE 1: Posições manuais da estrutura v6.0
          if (this.config.modeloEspecifico && this.config.modeloEspecifico.posicoesManualSensores && this.config.modeloEspecifico.posicoesManualSensores[chaveManualSensor]) {
            const posManualSensorV6 = this.config.modeloEspecifico.posicoesManualSensores[chaveManualSensor]
            // 🔧 CORRIGIDO: Aplicar offset à posição original calculada (IGUAL ModeladorSVG.vue)
            xSensorFinal = posicaoOriginalSensor.x + (parseFloat(posManualSensorV6.x) || 0)
            ySensorFinal = posicaoOriginalSensor.y + (parseFloat(posManualSensorV6.y) || 0)
          }
          // PRIORIDADE 2: Posições manuais de compatibilidade
          else if (this.config.posicoesManualSensores && this.config.posicoesManualSensores[chaveManualSensor]) {
            const posManualSensor = this.config.posicoesManualSensores[chaveManualSensor]
            // 🔧 CORRIGIDO: Aplicar offset à posição original calculada (IGUAL ModeladorSVG.vue)
            xSensorFinal = posicaoOriginalSensor.x + (parseFloat(posManualSensor.x) || 0)
            ySensorFinal = posicaoOriginalSensor.y + (parseFloat(posManualSensor.y) || 0)
          }
          // CASO PADRÃO: Seguir posição do pêndulo movido
          else {
            xSensorFinal = xCabo  // Seguir posição X do pêndulo (com seu offset)
            ySensorFinal = ySensorBase  // Manter posição Y padrão do sensor
          }

          // 🎯 LIMITES AJUSTADOS PARA PREVIEW OTIMIZADO
          if (ySensorFinal > 15 && ySensorFinal < (this.dimensoesCalculadas.altura - 40)) {
            // 🌡️ DETERMINAR COR DO SENSOR (igual ModeladorSVG)
            let corSensor = "#ccc"
            let valorSensor = "0"

            if (this.dadosSensores?.leitura?.[pendulo.numero]?.[s]) {
              const dadosSensor = this.dadosSensores.leitura[pendulo.numero][s]
              const temp = parseFloat(dadosSensor[0])
              const falha = dadosSensor[3]
              const nivel = dadosSensor[4]

              if (!nivel || temp == 0) {
                corSensor = "#e6e6e6"
                valorSensor = "0"
              } else {
                corSensor = this.corFaixaExata(temp)
                valorSensor = falha ? "ERRO" : temp.toFixed(1)
              }
            }

            const strokeSensor = "black"
            const strokeWidthSensor = "1"

            // 📦 RETÂNGULO DO SENSOR (igual ModeladorSVG)
            elementos += `
              <rect
                id="C${index + 1}S${s}"
                x="${xSensorFinal - escala_sensores / 2}"
                y="${ySensorFinal}"
                width="${escala_sensores}"
                height="${escala_sensores / 2}"
                rx="2"
                ry="2"
                fill="${corSensor}"
                stroke="${strokeSensor}"
                stroke-width="${strokeWidthSensor}"
                opacity="${this.opacidadesSvgLocal.pendulos}"
              />
            `

            // 📝 TEXTO DO VALOR DO SENSOR (igual ModeladorSVG)
            elementos += `
              <text
                id="TC${index + 1}S${s}"
                x="${xSensorFinal}"
                y="${ySensorFinal + escala_sensores / 4}"
                text-anchor="middle"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 0.5}"
                font-family="Arial"
                fill="${corSensor === "#ff2200" ? "white" : "black"}"
                opacity="${this.opacidadesSvgLocal.pendulos}"
              >
                ${valorSensor}
              </text>
            `

            // 📝 NOME DO SENSOR (igual ModeladorSVG)
            elementos += `
              <text
                id="TIND${index + 1}S${s}"
                x="${xSensorFinal - escala_sensores / 2 - 2}"
                y="${ySensorFinal + escala_sensores / 4}"
                text-anchor="end"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 1.5}"
                font-family="Arial"
                fill="black"
                opacity="${this.opacidadesSvgLocal.pendulos}"
              >
                S${s}
              </text>
            `
          }
        }
      })

      return elementos
    },



    corFaixaExata(temp) {
      if (temp < 12) return '#0384fc'
      else if (temp < 15) return '#03e8fc'
      else if (temp < 17) return '#03fcbe'
      else if (temp < 21) return '#07fc03'
      else if (temp < 25) return '#c3ff00'
      else if (temp < 27) return '#fcf800'
      else if (temp < 30) return '#ffb300'
      else if (temp < 35) return '#ff2200'
      else if (temp < 50) return '#ff0090'
      else return '#f700ff'
    },

    // Método para forçar recálculo de dimensões
    recalcularDimensoes() {
      const novasDimensoes = this.calcularDimensoesBaseadoNoFundo()

      // 🎯 SALVAR as dimensões corretas no modelo atual
      this.salvarDimensoesNoModelo(novasDimensoes)

      this.$emit('dimensoes-atualizadas', novasDimensoes)

      // Força atualização reativa
      this.$nextTick(() => {
        this.$forceUpdate()
      })

      return novasDimensoes
    },

    // Método para aplicar dimensões específicas vindas do banco
    aplicarDimensoesDoBanco(dimensoes) {
      if (dimensoes && dimensoes.largura && dimensoes.altura) {
        this.$emit('dimensoes-aplicadas', {
          largura: dimensoes.largura,
          altura: dimensoes.altura,
          origem: 'banco_dados'
        })
      }
    },


    atualizarOpacidadesSvg(novasOpacidades) {
      this.opacidadesSvgLocal = { ...novasOpacidades }
      this.updateSVG()
    },

    // 🎯 NOVO: Salvar dimensões corretas no modelo
    salvarDimensoesNoModelo(dimensoes) {

      // Emitir evento para o ModeladorSVG salvar as dimensões
      this.$emit('salvar-dimensoes-modelo', {
        largura: dimensoes.largura,
        altura: dimensoes.altura,
        calculadoEm: new Date().toISOString(),
        baseadoEm: 'calculo_otimizado'
      })
    },

    // 🎯 CORRIGIDO: Calcular posição baseada nos limites do fundo (área cinza claro)
    calcularPosicaoOriginalPendulo(numeroPendulo, totalCabos, larguraTotal) {
      const config = this.config

      // 🎯 CALCULAR LIMITES DO FUNDO com todos os parâmetros (incluindo deslocamentos)
      const limitesFundo = this.calcularLimitesFundoCompleto(config)

      // 🎯 Y: Posição baseada no pb (base do armazém)
      const pb = config.pb || 185
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0
      const yPendulo = pb + 15 + posicao_vertical

      // 🎯 X: Distribuir dentro da área útil do fundo (não na largura total do SVG)
      let xCabo
      if (totalCabos === 1) {
        xCabo = limitesFundo.centro
      } else {
        const espacamento = limitesFundo.larguraUtil / (totalCabos - 1)
        xCabo = limitesFundo.xMinimo + ((numeroPendulo - 1) * espacamento)
      }

      // 🎯 APLICAR offset ANTES da validação e VALIDAR posição final considerando escala do sensor
      const escala_sensores = config.escala_sensores || 16
      const xComOffset = xCabo + posicao_horizontal
      const xFinal = this.validarPosicaoDentroDoFundo(xComOffset, limitesFundo, escala_sensores)

      return { x: xFinal, y: yPendulo }
    },

    // 🎯 FUNÇÃO COMPLETA: Calcular limites do fundo com deslocamentos
    calcularLimitesFundoCompleto(config) {
      const lb = config.lb || 350; // Largura do armazém
      const lf = config.lf || 250; // Largura do fundo
      const deslocamento_horizontal_fundo = config.deslocamento_horizontal_fundo || 0

      // Calcular limites do fundo considerando deslocamento horizontal
      const inicioFundo = (lb - lf) / 2 + deslocamento_horizontal_fundo; 
      const fimFundo = inicioFundo + lf; 

      // Margem de segurança para os sensores não ficarem na borda
      const margemSeguranca = 20;

      return {
        xMinimo: inicioFundo + margemSeguranca,
        xMaximo: fimFundo - margemSeguranca,
        larguraUtil: (fimFundo - inicioFundo) - (2 * margemSeguranca),
        centro: (inicioFundo + fimFundo) / 2  // Centro do fundo com deslocamento
      };
    },

    // 🎯 FUNÇÃO AUXILIAR: Validar posição considerando escala do sensor
    validarPosicaoDentroDoFundo(posicao, limitesFundo, escala_sensores = 16) {
      const metadeEscala = escala_sensores / 2;

      // Garantir que o sensor inteiro (incluindo sua largura) fique dentro do fundo
      const xMinimo = limitesFundo.xMinimo + metadeEscala;
      const xMaximo = limitesFundo.xMaximo - metadeEscala;

      // Ajustar posição se estiver fora dos limites
      if (posicao < xMinimo) {
        return xMinimo;
      }

      if (posicao > xMaximo) {
        return xMaximo;
      }

      return posicao;
    },

    // 🎯 NOVO: Calcular posição original do sensor (IGUAL ModeladorSVG.vue)
    calcularPosicaoOriginalSensor(numeroPendulo, numeroSensor, totalCabos, larguraTotal) {
      const posicaoPendulo = this.calcularPosicaoOriginalPendulo(numeroPendulo, totalCabos, larguraTotal)
      const config = this.config
      const dist_y_sensores = config.dist_y_sensores || 12
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      const ySensor = posicaoPendulo.y - dist_y_sensores * numeroSensor - 25 - afastamento_vertical_pendulo

      return { x: posicaoPendulo.x, y: ySensor }
    }
  }
}
</script>

<style scoped>
.svg-container-responsive {
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-content-container {
  width: 100%;
  height: auto;
  max-height: 550px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 20px 10px;
}


.svg-wrapper {
  width: 100%;
  height: auto;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* SVG responsivo que mantém proporção e mostra conteúdo completo */
.svg-wrapper svg {
  background-color: transparent !important;
  width: 100%;
  height: auto;
  max-height: 500px;
  display: block;
  object-fit: contain;
}

/* Imagem de fundo adaptável */
.imagem-fundo-container img {
  max-width: none;
  max-height: none;
  object-fit: contain;
}

/* Media queries para dispositivos menores */
@media (max-width: 768px) {
  .svg-container-responsive {
    padding: 10px;
  }

  .svg-wrapper svg {
    width: 100%;
    height: auto;
  }
}

@media (max-width: 576px) {
  .svg-container-responsive {
    padding: 5px;
  }
}
</style>