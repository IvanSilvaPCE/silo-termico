<template>
  <div class="svg-container-responsive w-100 h-100 position-relative">
    <!-- Componente de Controle da Imagem de Fundo (posicionado no topo) -->
    <div class="position-absolute" style="top: 10px; right: 10px; z-index: 10;">
      <ImagemFundo
        :tipoAtivo="'armazem'"
        :containerDimensions="{ width: '100%', height: '100%' }"
        :imagemInicial="imagemFundo"
        @imagem-mudou="atualizarImagemFundo"
        @opacidade-svg-mudou="atualizarOpacidadesSvg"
        @mostrar-toast="mostrarToast"
      />
    </div>

    <!-- Container para Imagem de Fundo e SVG -->
    <div class="svg-content-container" style="position: relative; width: 100%; height: 100%;">
      <!-- Imagem de Fundo Renderizada -->
      <div v-if="imagemFundo.url" class="imagem-fundo-container" :style="imagemContainerStyle">
        <img :src="imagemFundo.url" :style="imagemStyle" alt="Imagem de fundo do armazém" />
      </div>

      <!-- SVG do Armazém -->
      <div class="svg-wrapper" :style="svgWrapperStyle">
        <svg :viewBox="`0 0 ${dimensoesCalculadas.largura} ${dimensoesCalculadas.altura}`" :style="svgEstiloCompleto" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" v-html="svgContent">
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import ImagemFundo from './ImagemFundo.vue'

export default {
  name: 'ArmazemSvg',
  components: {
    ImagemFundo
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
    imagemFundo: {
      type: Object,
      default: () => ({
        url: null,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0.3
      })
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
      svgContent: '',
      imagemFundo: {
        url: null,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0.3
      },
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

    imagemContainerStyle() {
      return {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
      }
    },

    imagemStyle() {
      return {
        position: 'relative',
        left: this.imagemFundo.x + 'px',
        top: this.imagemFundo.y + 'px',
        transform: `scale(${this.imagemFundo.scale})`,
        transformOrigin: 'center center',
        opacity: this.imagemFundo.opacity,
        maxWidth: 'none',
        maxHeight: 'none',
        width: 'auto',
        height: 'auto',
        userSelect: 'none',
        pointerEvents: 'none',
        transition: 'all 0.3s ease-in-out',
        zIndex: 1
      }
    },

    svgStyle() {
      return {
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: this.isMobile ? '60vh' : 'calc(100vh - 320px)',
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
        height: '100%',
        opacity: this.opacidadesSvgLocal.geral
      }
    },

    svgEstiloCompleto() {
      return {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        border: '1px solid #ddd',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        imageRendering: 'optimizeQuality'
      }
    },
  },
  watch: {
    config: {
      handler(newConfig, oldConfig) {
        // 📐 DETECTAR MUDANÇA NA LARGURA BASE
        if (oldConfig && newConfig.lb !== oldConfig.lb) {
          console.log(`📐 [ArmazemSvg] Largura alterada: ${oldConfig.lb} → ${newConfig.lb}`)

          // Força recálculo das dimensões quando muda
          this.recalcularDimensoes()
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
    imagemFundo: {
      handler() {
        this.updateSVG()
      },
      deep: true
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
      this.svgContent = this.renderArmazem() + this.renderSensores()
    },

    calcularDimensoesBaseadoNoFundo() {
      // 📏 ADAPTAÇÃO DINÂMICA DO SVG - AJUSTADA PARA PREVIEW
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

      // 📐 LARGURA ADAPTATIVA - PRIORIZAR LARGURA SALVA NO MODELO
      let larguraBaseConfig = 350 // valor padrão

      // 🎯 BUSCAR largura na ordem de priridade
      if (config.lb && typeof config.lb === 'number' && config.lb > 0) {
        larguraBaseConfig = config.lb
      } else if (this.modeloAtual?.configuracao?.lb && typeof this.modeloAtual.configuracao.lb === 'number' && this.modeloAtual.configuracao.lb > 0) {
        larguraBaseConfig = this.modeloAtual.configuracao.lb
      }

      let larguraCalculada = Math.max(larguraBaseConfig, 300)

      // Expandir largura baseado na quantidade de pêndulos
      if (quantidadePendulos > 0) {
        const margemLateral = 35
        const espacamentoPendulo = 25
        const larguraMinimaNecessaria = (2 * margemLateral) + ((quantidadePendulos - 1) * espacamentoPendulo) + 50
        larguraCalculada = Math.max(larguraBaseConfig, larguraMinimaNecessaria)
      }

      // 📏 ALTURA OTIMIZADA PARA PREVIEW - REMOÇÃO DO ESPAÇO DESNECESSÁRIO
      const alturaBaseConfig = config.pb || 185

      // 🎯 CALCULAR altura mínima necessária baseada no telhado
      let alturaTopo = 10 // altura mínima do topo
      if (config.tipo_telhado === 1) {
        // Telhado pontudo - calcular altura real da ponta
        const curvaturaAjustada = Math.max(10, 50 - (config.curvatura_topo || 30))
        alturaTopo = Math.max(curvaturaAjustada, 15)
      } else if (config.tipo_telhado === 2 || config.tipo_telhado === 3) {
        // Telhado arredondado/arco - altura baseada na curvatura
        alturaTopo = Math.max(10, 60 - (config.curvatura_topo || 30))
      }

      // 🎯 ALTURA TOTAL OTIMIZADA - sem espaços desnecessários
      const margemTopoMinima = 20  // margem adequada acima do telhado para não cortar
      const alturaArmazem = alturaBaseConfig
      const alturaTotal = margemTopoMinima + alturaTopo + (config.ht || 50) + alturaArmazem

      // Extensão do fundo se necessário
      let extensaoFundo = 0
      if (config.tipo_fundo === 1) {
        extensaoFundo = config.altura_funil_v || 40
      } else if (config.tipo_fundo === 2) {
        extensaoFundo = config.altura_duplo_v || 35
      }

      // 📏 ALTURA BASE sem margens desnecessárias
      let alturaCalculada = alturaTotal + extensaoFundo

      // 🎯 AJUSTE para sensores - calcular espaço real necessário
      if (quantidadePendulos > 0 && Object.keys(sensoresPorPendulo).length > 0) {
        const maxSensores = Math.max(...Object.values(sensoresPorPendulo).map(s => parseInt(s) || 0))
        const escala_sensores = config.escala_sensores || 16
        const dist_y_sensores = config.dist_y_sensores || 12

        // Espaço real necessário para os sensores
        const espacoSensores = maxSensores * dist_y_sensores + escala_sensores + 20 // 20px de margem
        const espacoPendulos = 25 // espaço para o nome dos pêndulos

        const alturaComSensores = alturaTotal + extensaoFundo + espacoSensores + espacoPendulos
        alturaCalculada = Math.max(alturaCalculada, alturaComSensores)
      }

      // 📱 Altura mínima para diferentes dispositivos
      const alturaMinima = typeof window !== 'undefined' && window.innerWidth <= 576 ? 200 : 250
      alturaCalculada = Math.max(alturaCalculada, alturaMinima)

      console.log(`✅ [PREVIEW OTIMIZADO] Dimensões calculadas:`, {
        largura: larguraCalculada,
        altura: alturaCalculada,
        alturaTopo,
        alturaBase: alturaBaseConfig,
        extensaoFundo,
        quantidadePendulos
      })

      return {
        largura: larguraCalculada,
        altura: alturaCalculada
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

      // 🎯 POSICIONAMENTO OTIMIZADO DOS SENSORES (sem espaço desnecessário)
      const pb = config.pb || 185
      const yPendulo = pb + 10 + posicao_vertical // Reduzir espaçamento

      const totalCabos = estruturaPendulos.pendulos.length
      const indiceCentral = Math.floor((totalCabos - 1) / 2)

      // 🎯 CALCULAR POSIÇÕES DOS CABOS DINAMICAMENTE IGUAL ModeladorSVG.vue
      const larguraTotal = config.lb || this.dimensoesCalculadas.largura || 350
      const margemLateral = 35  // EXATAMENTE igual ModeladorSVG
      const larguraUtilizavel = larguraTotal - (2 * margemLateral)
      const posicoesCabosCalculadas = []

      if (totalCabos === 1) {
        posicoesCabosCalculadas.push(larguraTotal / 2)
      } else {
        const espacamento = larguraUtilizavel / (totalCabos - 1)
        for (let i = 0; i < totalCabos; i++) {
          posicoesCabosCalculadas.push(margemLateral + (i * espacamento))
        }
      }

      console.log(`🎯 [ArmazemSvg] Cálculo DINÂMICO igual ModeladorSVG:`, {
        larguraTotal,
        margemLateral,
        larguraUtilizavel,
        totalCabos,
        espacamento: totalCabos > 1 ? larguraUtilizavel / (totalCabos - 1) : 0,
        posicoesCabosCalculadas
      })

      estruturaPendulos.pendulos.forEach((pendulo, index) => {
        // 📏 USAR POSIÇÕES CALCULADAS DINAMICAMENTE (igual ModeladorSVG)
        const xCaboBase = posicoesCabosCalculadas[index]
        const distanciaDoMeio = index - indiceCentral
        const deslocamentoX = distanciaDoMeio * dist_x_sensores

        // 🎯 APLICAR OFFSET INDIVIDUAL (prioridade: posições manuais > modeloEspecifico > posicionamento de cabos)
        let offsetIndividualX = 0
        let offsetIndividualY = 0

        console.log(`🔍 [renderSensoresArmazem] P${pendulo.numero} - Verificando posições:`, {
          temPosicoesManualPendulos: !!(this.config.posicoesManualPendulos && this.config.posicoesManualPendulos[pendulo.numero]),
          temModeloEspecifico: !!(this.config.modeloEspecifico && this.config.modeloEspecifico.posicoesPendulos && this.config.modeloEspecifico.posicoesPendulos[pendulo.numero]),
          temPosicoesCabos: !!(this.config.posicoesCabos && this.config.posicoesCabos[pendulo.numero])
        })

        // Verificar se há posições manuais salvas para este pêndulo (PRIORIDADE 1)
        if (this.config.posicoesManualPendulos && this.config.posicoesManualPendulos[pendulo.numero]) {
          // Prioridade 1: Posições manuais de drag and drop do ModeladorSVG
          const posManual = this.config.posicoesManualPendulos[pendulo.numero]
          offsetIndividualX = parseFloat(posManual.x) || 0
          offsetIndividualY = parseFloat(posManual.y) || 0
          console.log(`✅ [renderSensoresArmazem] P${pendulo.numero} - Usando posições manuais:`, { x: offsetIndividualX, y: offsetIndividualY })
        } else if (this.config.modeloEspecifico && this.config.modeloEspecifico.posicoesPendulos && this.config.modeloEspecifico.posicoesPendulos[pendulo.numero]) {
          // Prioridade 2: Posições do modeloEspecifico (formato v6.0+)
          const posEspec = this.config.modeloEspecifico.posicoesPendulos[pendulo.numero]
          offsetIndividualX = parseFloat(posEspec.x) || 0
          offsetIndividualY = parseFloat(posEspec.y) || 0
          console.log(`✅ [renderSensoresArmazem] P${pendulo.numero} - Usando modeloEspecifico:`, { x: offsetIndividualX, y: offsetIndividualY })
        } else if (this.config.posicoesCabos && this.config.posicoesCabos[pendulo.numero]) {
          // Prioridade 3: Posições dos cabos (compatibilidade)
          const posCabo = this.config.posicoesCabos[pendulo.numero]
          offsetIndividualX = parseFloat(posCabo.x) || 0
          offsetIndividualY = parseFloat(posCabo.y) || 0
          console.log(`✅ [renderSensoresArmazem] P${pendulo.numero} - Usando posicoesCabos:`, { x: offsetIndividualX, y: offsetIndividualY })
        } else {
          console.log(`⚠️ [renderSensoresArmazem] P${pendulo.numero} - Nenhuma posição customizada encontrada, usando posição base calculada`)
        }

        const xCabo = xCaboBase + posicao_horizontal + deslocamentoX + offsetIndividualX
        const yPenduloFinal = yPendulo + offsetIndividualY
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

          const xSensorFinal = xCabo
          const ySensorFinal = ySensorBase

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

      console.log(`✅ [ArmazemSvg] Renderização DINÂMICA concluída: ${totalCabos} pêndulos distribuídos conforme largura ${larguraTotal}px`)
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
      console.log(`📐 [recalcularDimensoes] Novas dimensões calculadas:`, novasDimensoes)
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

    // Métodos para controle da imagem de fundo
    atualizarImagemFundo(novaImagem) {
      this.imagemFundo = { ...novaImagem }
      console.log('📸 [ArmazemSvg] Imagem de fundo atualizada:', this.imagemFundo)

      // Forçar atualização do componente para garantir que a imagem apareça
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },

    atualizarOpacidadesSvg(novasOpacidades) {
      this.opacidadesSvgLocal = { ...novasOpacidades }
      console.log('👁️ [ArmazemSvg] Opacidades SVG atualizadas:', this.opacidadesSvgLocal)
      this.updateSVG()
    },

    mostrarToast(evento) {
      // Emitir evento para componente pai mostrar toast
      this.$emit('mostrar-toast', evento)
      console.log('🔔 [ArmazemSvg] Toast:', evento.mensagem)
    }
  }
}
</script>

<style scoped>
.svg-container-responsive {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.svg-content-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.imagem-fundo-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

/* Garantir que o SVG fique acima da imagem de fundo */
.svg-wrapper svg {
  background-color: transparent !important;
}

/* Garantir que a imagem de fundo se ajuste corretamente */
.imagem-fundo-container img {
  max-width: none;
  max-height: none;
  object-fit: contain;
}
</style>