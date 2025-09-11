<template>
  <div class="svg-container-responsive w-100 position-relative">
    <!-- Container para Imagem de Fundo e SVG -->
    <div class="svg-content-container" style="position: relative; width: 100%; height: auto;">
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
      },
      // Estados para drag and drop
      isDragging: false,
      dragElement: null,
      dragOffset: { x: 0, y: 0 }
    }
  },
  computed: {
    dimensoesCalculadas() {
      // 🎯 PADRONIZAÇÃO CRÍTICA: Sempre usar dimensões consistentes com o que será salvo
      
      // Prioridade 1: Props passadas diretamente (ViewBox sincronizado)
      if (this.larguraSvg && this.alturaSvg && this.larguraSvg > 0 && this.alturaSvg > 0) {
        const dimensoesProps = {
          largura: this.larguraSvg,
          altura: this.alturaSvg
        }
        console.log('🎯 [ArmazemSvg] VIEWBOX SINCRONIZADO - Usando dimensões das props:', dimensoesProps)
        
        // 🎯 CRÍTICO: Emitir dimensões para o ModeladorSVG sempre que usar props
        this.$nextTick(() => {
          this.$emit('dimensoes-atualizadas', dimensoesProps)
        })
        
        return dimensoesProps
      }

      // Prioridade 2: Dimensões salvas na configuração 
      if (this.config.dimensoesSvgFundo && this.config.dimensoesSvgFundo.largura && this.config.dimensoesSvgFundo.altura) {
        const dimensoesSalvas = {
          largura: this.config.dimensoesSvgFundo.largura,
          altura: this.config.dimensoesSvgFundo.altura
        }
        console.log('📐 [ArmazemSvg] Usando dimensões salvas na configuração:', dimensoesSalvas)
        return dimensoesSalvas
      }

      // Prioridade 3: Dimensões personalizadas vindas do banco
      if (this.dimensoesPersonalizadas && this.dimensoesPersonalizadas.largura && this.dimensoesPersonalizadas.altura) {
        console.log('📐 [ArmazemSvg] Usando dimensões personalizadas do banco:', this.dimensoesPersonalizadas)
        return {
          largura: this.dimensoesPersonalizadas.largura,
          altura: this.dimensoesPersonalizadas.altura
        }
      }

      // Prioridade 4: Calcular baseado na configuração
      const dimensoesCalculadas = this.calcularDimensoesBaseadoNoFundo()
      
      // 🔒 PADRONIZAR dimensões e garantir que sejam salvas
      const dimensoesPadronizadas = {
        largura: Math.max(dimensoesCalculadas.largura, 350), // Largura mínima padrão
        altura: Math.max(dimensoesCalculadas.altura, 250)    // Altura mínima padrão
      }
      
      console.log('📐 [ArmazemSvg] Dimensões calculadas e padronizadas:', {
        original: dimensoesCalculadas,
        padronizada: dimensoesPadronizadas
      })

      // 🎯 CRÍTICO: Sempre emitir as dimensões calculadas para o ModeladorSVG salvar
      this.$nextTick(() => {
        this.$emit('dimensoes-atualizadas', dimensoesPadronizadas)
      })
      
      return dimensoesPadronizadas
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
      // 🔒 PADRONIZAÇÃO: Estilo consistente independente do container pai
      return {
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: 'auto',
        minHeight: '300px', // Altura mínima garantida
        maxHeight: '600px', // Altura máxima para evitar desproporcionalidade
        opacity: this.opacidadesSvgLocal.geral,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 10px',
        boxSizing: 'border-box' // Garantir cálculo correto das dimensões
      }
    },

    svgEstiloCompleto() {
      // 🔒 PADRONIZAÇÃO: Dimensões consistentes baseadas no viewBox interno
      const dimensoes = this.dimensoesCalculadas
      const aspectRatio = dimensoes.largura / dimensoes.altura
      
      return {
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        // 🎯 CRÍTICO: Manter aspect ratio consistente baseado nas dimensões internas
        aspectRatio: aspectRatio.toFixed(3),
        minHeight: '250px',
        maxHeight: this.isMobile ? '60vh' : '500px',
        border: '1px solid #ddd',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        imageRendering: 'optimizeQuality',
        display: 'block',
        objectFit: 'contain',
        // 🔒 ESTABILIZAR posicionamento para drag and drop consistente
        transformOrigin: 'center center',
        userSelect: 'none'
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
    
    // Adicionar event listeners para drag and drop
    this.$nextTick(() => {
      this.adicionarEventListeners()
    })
  },
  
  beforeDestroy() {
    // Cleanup dos event listeners
    this.removerEventListeners()
  },
  methods: {
    updateSVG() {
      this.svgContent = this.renderArmazem() + this.renderSensores()
    },

    calcularDimensoesBaseadoNoFundo() {
      // 📏 PADRONIZAÇÃO CRÍTICA: Cálculo consistente que será sincronizado com o salvamento
      const config = this.config

      console.log('📐 [calcularDimensoesBaseadoNoFundo] Configuração recebida:', {
        lb: config.lb,
        pb: config.pb,
        hb: config.hb,
        modeloEspecifico: !!config.modeloEspecifico,
        modeloAtual: !!this.modeloAtual
      })

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

      // 🔒 PADRONIZAÇÃO DA LARGURA: Sempre usar uma base consistente
      const LARGURA_MINIMA_PADRAO = 350
      const LARGURA_MAXIMA_SENSATA = 800
      
      let larguraBase = LARGURA_MINIMA_PADRAO

      // 🎯 CRÍTICO: Priorizar config.lb que será salvo no ModeladorSVG
      if (config.lb && typeof config.lb === 'number' && config.lb >= LARGURA_MINIMA_PADRAO && config.lb <= LARGURA_MAXIMA_SENSATA) {
        larguraBase = config.lb
        console.log('📐 [SALVAMENTO] Usando largura da config (será salva):', larguraBase)
      } 
      // Prioridade 2: Modelo atual com validação
      else if (this.modeloAtual?.configuracao?.lb && typeof this.modeloAtual.configuracao.lb === 'number' && 
               this.modeloAtual.configuracao.lb >= LARGURA_MINIMA_PADRAO && this.modeloAtual.configuracao.lb <= LARGURA_MAXIMA_SENSATA) {
        larguraBase = this.modeloAtual.configuracao.lb
        console.log('📐 [SALVAMENTO] Usando largura do modelo (será salva):', larguraBase)
      }

      // 📏 GARANTIR largura mínima baseada nos pêndulos
      if (quantidadePendulos > 0) {
        const MARGEM_LATERAL_PADRAO = 35
        const ESPACAMENTO_MINIMO_PENDULO = 25
        const larguraMinimaNecessaria = (2 * MARGEM_LATERAL_PADRAO) + ((quantidadePendulos - 1) * ESPACAMENTO_MINIMO_PENDULO) + 50
        if (larguraBase < larguraMinimaNecessaria) {
          console.log(`📐 [SALVAMENTO] Ajustando largura para acomodar ${quantidadePendulos} pêndulos: ${larguraBase} → ${larguraMinimaNecessaria}`)
          larguraBase = larguraMinimaNecessaria
        }
      }

      // 🔒 PADRONIZAÇÃO DA ALTURA: Cálculo consistente que será salvo
      const ALTURA_MINIMA_PADRAO = 250
      const ALTURA_MAXIMA_SENSATA = 600
      
      const alturaBaseConfig = Math.max(config.pb || 185, 150) // Altura base mínima

      // Altura do telhado padronizada
      let alturaTelho = 20
      if (config.tipo_telhado === 1) {
        alturaTelho = Math.max(15, Math.min(60, 60 - (config.curvatura_topo || 30)))
      } else if (config.tipo_telhado === 2 || config.tipo_telhado === 3) {
        alturaTelho = Math.max(15, Math.min(70, 70 - (config.curvatura_topo || 30)))
      }

      // Altura do corpo principal
      const alturaCorpo = Math.max(config.ht || 50, 30) + alturaBaseConfig

      // Extensão do fundo limitada
      let extensaoFundo = 0
      if (config.tipo_fundo === 1) {
        extensaoFundo = Math.min(config.altura_funil_v || 40, 80)
      } else if (config.tipo_fundo === 2) {
        extensaoFundo = Math.min(config.altura_duplo_v || 35, 70)
      }

      // 🎯 ALTURA TOTAL PADRONIZADA
      const MARGEM_TOPO_PADRAO = 25
      const MARGEM_BASE_PADRAO = 15
      const AJUSTE_VIEWBOX = -80 // Manter compatibilidade com ViewBox otimizado
      
      let alturaTotal = MARGEM_TOPO_PADRAO + alturaTelho + alturaCorpo + extensaoFundo + MARGEM_BASE_PADRAO + AJUSTE_VIEWBOX
      
      // Garantir limites sensatos
      alturaTotal = Math.max(ALTURA_MINIMA_PADRAO, Math.min(alturaTotal, ALTURA_MAXIMA_SENSATA))

      const dimensoesFinais = {
        largura: larguraBase,
        altura: alturaTotal
      }

      console.log(`✅ [DIMENSÕES PARA SALVAMENTO] Calculadas para sincronização com ModeladorSVG:`, {
        ...dimensoesFinais,
        componentes: {
          margemTopo: MARGEM_TOPO_PADRAO,
          alturaTelho,
          alturaCorpo,
          extensaoFundo,
          margemBase: MARGEM_BASE_PADRAO,
          ajusteViewBox: AJUSTE_VIEWBOX
        },
        quantidadePendulos,
        configLbOriginal: config.lb,
        limitesAplicados: {
          larguraMinima: LARGURA_MINIMA_PADRAO,
          larguraMaxima: LARGURA_MAXIMA_SENSATA,
          alturaMinima: ALTURA_MINIMA_PADRAO,
          alturaMaxima: ALTURA_MAXIMA_SENSATA
        }
      })

      return dimensoesFinais
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
      const config = this.config

      // 🎯 PRIORIDADE 1: Usar dados do modeloEspecifico se disponível (estrutura v6.0+)
      if (config.modeloEspecifico) {
        const quantidade = config.modeloEspecifico.quantidadePendulos || 3
        const sensoresPorPendulo = config.modeloEspecifico.sensoresPorPendulo || {}

        estruturaPendulos = {
          pendulos: Array.from({ length: quantidade }, (_, i) => ({
            numero: i + 1,
            totalSensores: sensoresPorPendulo[i + 1] || sensoresPorPendulo[(i + 1).toString()] || 3
          }))
        }
        
        console.log('🎯 [renderSensores] Usando modeloEspecifico:', {
          quantidade,
          sensoresPorPendulo,
          estruturaPendulos
        })
      }
      // 🎯 PRIORIDADE 2: Usar dados do modeloAtual se disponível
      else if (this.modeloAtual && (this.modeloAtual.quantidadePendulos || this.modeloAtual.sensoresPorPendulo)) {
        const quantidade = this.modeloAtual.quantidadePendulos || 3
        const sensoresPorPendulo = this.modeloAtual.sensoresPorPendulo || {}

        estruturaPendulos = {
          pendulos: Array.from({ length: quantidade }, (_, i) => ({
            numero: i + 1,
            totalSensores: sensoresPorPendulo[i + 1] || sensoresPorPendulo[(i + 1).toString()] || 3
          }))
        }
        
        console.log('🎯 [renderSensores] Usando modeloAtual:', {
          quantidade,
          sensoresPorPendulo,
          estruturaPendulos
        })
      }
      // 🎯 PRIORIDADE 3: Usar dados da config direta
      else if (config.quantidadePendulos || config.sensoresPorPendulo) {
        const quantidade = config.quantidadePendulos || 3
        const sensoresPorPendulo = config.sensoresPorPendulo || {}

        estruturaPendulos = {
          pendulos: Array.from({ length: quantidade }, (_, i) => ({
            numero: i + 1,
            totalSensores: sensoresPorPendulo[i + 1] || sensoresPorPendulo[(i + 1).toString()] || 3
          }))
        }
        
        console.log('🎯 [renderSensores] Usando config direta:', {
          quantidade,
          sensoresPorPendulo,
          estruturaPendulos
        })
      }
      // 🎯 FALLBACK: Estrutura mínima padrão
      else {
        estruturaPendulos = {
          pendulos: Array.from({ length: 3 }, (_, i) => ({
            numero: i + 1,
            totalSensores: 3
          }))
        }
        
        console.log('🎯 [renderSensores] Usando fallback padrão:', estruturaPendulos)
      }

      if (!estruturaPendulos) return ''

      // Usar configuração aplicada (igual ModeladorSVG)
      const escala_sensores = config.escala_sensores || 16
      const dist_y_sensores = config.dist_y_sensores || 12
      const dist_x_sensores = config.dist_x_sensores || 0
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      // 🔒 PADRONIZAÇÃO CRÍTICA: Sistema de coordenadas absoluto e consistente
      // Sempre usar dimensões internas calculadas, nunca dimensões do container pai
      const dimensoesPadrao = this.dimensoesCalculadas
      const pb = config.pb || 185
      const yPendulo = pb + 10 + posicao_vertical

      const totalCabos = estruturaPendulos.pendulos.length
      const indiceCentral = Math.floor((totalCabos - 1) / 2)

      // 🎯 USAR SEMPRE as dimensões internas padronizadas para coordenadas
      const larguraTotal = dimensoesPadrao.largura  // SEMPRE usar dimensões internas
      const MARGEM_LATERAL_PADRAO = 35  // Constante padronizada
      const larguraUtilizavel = larguraTotal - (2 * MARGEM_LATERAL_PADRAO)
      const posicoesCabosCalculadas = []

      if (totalCabos === 1) {
        posicoesCabosCalculadas.push(larguraTotal / 2)
      } else {
        const espacamento = larguraUtilizavel / (totalCabos - 1)
        for (let i = 0; i < totalCabos; i++) {
          posicoesCabosCalculadas.push(MARGEM_LATERAL_PADRAO + (i * espacamento))
        }
      }

      console.log(`🔒 [COORDENADAS PADRONIZADAS] Sistema absoluto:`, {
        larguraTotal,
        alturaTotal: dimensoesPadrao.altura,
        margemLateral: MARGEM_LATERAL_PADRAO,
        larguraUtilizavel,
        totalCabos,
        posicoesCabosCalculadas,
        yPendulo
      })

      console.log(`🎯 [ArmazemSvg] Cálculo DINÂMICO igual ModeladorSVG:`, {
        larguraTotal,
        margemLateral: MARGEM_LATERAL_PADRAO,
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

        // 🎯 APLICAR OFFSET INDIVIDUAL DO PÊNDULO (apenas para o pêndulo, não influenciar sensores)
        let offsetPenduloX = 0
        let offsetPenduloY = 0

        console.log(`🔍 [renderSensoresArmazem] P${pendulo.numero} - Verificando posições do pêndulo:`, {
          temPosicoesManualPendulos: !!(this.config.posicoesManualPendulos && this.config.posicoesManualPendulos[pendulo.numero]),
          temModeloEspecificoManual: !!(this.config.modeloEspecifico && this.config.modeloEspecifico.posicoesManualPendulos && this.config.modeloEspecifico.posicoesManualPendulos[pendulo.numero]),
          temModeloEspecificoPosicoes: !!(this.config.modeloEspecifico && this.config.modeloEspecifico.posicoesPendulos && this.config.modeloEspecifico.posicoesPendulos[pendulo.numero]),
          temPosicoesCabos: !!(this.config.posicoesCabos && this.config.posicoesCabos[pendulo.numero])
        })

        // 🎯 BUSCAR POSIÇÃO MANUAL ESPECÍFICA DO PÊNDULO (não dos sensores)
        if (this.config.modeloEspecifico && this.config.modeloEspecifico.posicoesManualPendulos && this.config.modeloEspecifico.posicoesManualPendulos[pendulo.numero]) {
          // PRIORIDADE 1: Posições manuais da estrutura v6.0 (posicoesManualPendulos)
          const posManualPenduloV6 = this.config.modeloEspecifico.posicoesManualPendulos[pendulo.numero]
          offsetPenduloX = parseFloat(posManualPenduloV6.x) || 0
          offsetPenduloY = parseFloat(posManualPenduloV6.y) || 0
          console.log(`✅ [renderSensoresArmazem] P${pendulo.numero} - Usando posição manual do pêndulo v6.0:`, { x: offsetPenduloX, y: offsetPenduloY })
        } else if (this.config.posicoesManualPendulos && this.config.posicoesManualPendulos[pendulo.numero]) {
          // PRIORIDADE 2: Posições manuais de drag and drop do ModeladorSVG (compatibilidade)
          const posManualPendulo = this.config.posicoesManualPendulos[pendulo.numero]
          offsetPenduloX = parseFloat(posManualPendulo.x) || 0
          offsetPenduloY = parseFloat(posManualPendulo.y) || 0
          console.log(`✅ [renderSensoresArmazem] P${pendulo.numero} - Usando posição manual do pêndulo compatibilidade:`, { x: offsetPenduloX, y: offsetPenduloY })
        } else if (this.config.modeloEspecifico && this.config.modeloEspecifico.posicoesPendulos && this.config.modeloEspecifico.posicoesPendulos[pendulo.numero]) {
          // PRIORIDADE 3: Posições do modeloEspecifico (formato v6.0+ estrutural)
          const posEspecPendulo = this.config.modeloEspecifico.posicoesPendulos[pendulo.numero]
          offsetPenduloX = parseFloat(posEspecPendulo.x) || 0
          offsetPenduloY = parseFloat(posEspecPendulo.y) || 0
          console.log(`✅ [renderSensoresArmazem] P${pendulo.numero} - Usando modeloEspecifico posicoesPendulos:`, { x: offsetPenduloX, y: offsetPenduloY })
        } else if (this.config.posicoesCabos && this.config.posicoesCabos[pendulo.numero]) {
          // PRIORIDADE 4: Posições dos cabos (compatibilidade)
          const posCaboPendulo = this.config.posicoesCabos[pendulo.numero]
          offsetPenduloX = parseFloat(posCaboPendulo.x) || 0
          offsetPenduloY = parseFloat(posCaboPendulo.y) || 0
          console.log(`✅ [renderSensoresArmazem] P${pendulo.numero} - Usando posicoesCabos:`, { x: offsetPenduloX, y: offsetPenduloY })
        } else {
          console.log(`⚠️ [renderSensoresArmazem] P${pendulo.numero} - Nenhuma posição customizada encontrada, usando posição base calculada`)
        }

        // 🎯 POSIÇÕES FINAIS DO PÊNDULO
        const xCabo = xCaboBase + posicao_horizontal + deslocamentoX + offsetPenduloX
        const yPenduloFinal = yPendulo + offsetPenduloY
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
          
          // 🎯 CALCULAR POSIÇÃO BASE DO SENSOR (relativa ao pêndulo)
          let xSensorBase = xCabo  // Posição X base do pêndulo (já com offset aplicado)
          let ySensorBaseCalc = ySensorBase  // Posição Y padrão do sensor
          
          // PRIORIDADE 1: Posições manuais da estrutura v6.0
          if (this.config.modeloEspecifico && this.config.modeloEspecifico.posicoesManualSensores && this.config.modeloEspecifico.posicoesManualSensores[chaveManualSensor]) {
            const posManualSensorV6 = this.config.modeloEspecifico.posicoesManualSensores[chaveManualSensor]
            // 🔧 CORRIGIDO: Aplicar offset do sensor à posição base do armazém, não do pêndulo
            xSensorFinal = xCaboBase + posicao_horizontal + deslocamentoX + (parseFloat(posManualSensorV6.x) || 0)
            ySensorFinal = yPendulo + (parseFloat(posManualSensorV6.y) || 0)
            console.log(`✅ [renderSensoresArmazem] P${pendulo.numero}S${s} - Usando posição manual v6.0:`, { 
              offsetSensor: { x: posManualSensorV6.x, y: posManualSensorV6.y }, 
              final: { x: xSensorFinal, y: ySensorFinal },
              basePendulo: { x: xCaboBase, y: yPendulo }
            })
          }
          // PRIORIDADE 2: Posições manuais de compatibilidade
          else if (this.config.posicoesManualSensores && this.config.posicoesManualSensores[chaveManualSensor]) {
            const posManualSensor = this.config.posicoesManualSensores[chaveManualSensor]
            // 🔧 CORRIGIDO: Aplicar offset do sensor à posição base do armazém, não do pêndulo
            xSensorFinal = xCaboBase + posicao_horizontal + deslocamentoX + (parseFloat(posManualSensor.x) || 0)
            ySensorFinal = yPendulo + (parseFloat(posManualSensor.y) || 0)
            console.log(`✅ [renderSensoresArmazem] P${pendulo.numero}S${s} - Usando posição manual compatibilidade:`, { 
              offsetSensor: { x: posManualSensor.x, y: posManualSensor.y }, 
              final: { x: xSensorFinal, y: ySensorFinal },
              basePendulo: { x: xCaboBase, y: yPendulo }
            })
          }
          // CASO PADRÃO: Seguir posição do pêndulo movido
          else {
            xSensorFinal = xCabo  // Seguir posição X do pêndulo (com seu offset)
            ySensorFinal = ySensorBase  // Manter posição Y padrão do sensor
            console.log(`📍 [renderSensoresArmazem] P${pendulo.numero}S${s} - Usando posição padrão seguindo pêndulo:`, { 
              pendulo: { x: xCabo, y: yPenduloFinal }, 
              sensor: { x: xSensorFinal, y: ySensorFinal }
            })
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
      console.log('📐 [recalcularDimensoes] Novas dimensões calculadas:', novasDimensoes)

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

    // Métodos para controle da imagem de fundo (controlados pelo componente pai)
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

    // 🎯 NOVO: Salvar dimensões corretas no modelo com sincronização garantida
    salvarDimensoesNoModelo(dimensoes) {
      console.log('💾 [ArmazemSvg] Salvando dimensões no modelo com sincronização:', dimensoes)

      // 🔒 CRÍTICO: Garantir que config.lb seja atualizado ANTES de salvar
      if (this.config && dimensoes.largura && dimensoes.largura !== this.config.lb) {
        console.log(`🔧 [SINCRONIZAÇÃO] Atualizando config.lb antes de salvar: ${this.config.lb} → ${dimensoes.largura}`)
        
        // Emitir atualização da configuração primeiro
        this.$emit('configuracao-atualizada', {
          ...this.config,
          lb: dimensoes.largura,
          dimensoesSvgFundo: {
            largura: dimensoes.largura,
            altura: dimensoes.altura,
            baseadoEm: 'calculo_sincronizado',
            calculadoEm: new Date().toISOString()
          }
        })
      }

      // Emitir evento para o ModeladorSVG salvar as dimensões sincronizadas
      this.$emit('salvar-dimensoes-modelo', {
        largura: dimensoes.largura,
        altura: dimensoes.altura,
        calculadoEm: new Date().toISOString(),
        baseadoEm: 'calculo_sincronizado',
        configLbAtualizado: true
      })
    },

    // 🔒 NOVO: Normalizar coordenadas para o sistema interno padronizado
    normalizarCoordenadaParaSistemaInterno(coordenada, tipo = 'x') {
      const dimensoes = this.dimensoesCalculadas
      
      if (tipo === 'x') {
        // Normalizar coordenada X baseada na largura interna
        const larguraInterna = dimensoes.largura
        const coordenadaNormalizada = Math.max(0, Math.min(coordenada, larguraInterna))
        return Math.round(coordenadaNormalizada * 10) / 10 // Arredondar para 1 casa decimal
      } else if (tipo === 'y') {
        // Normalizar coordenada Y baseada na altura interna
        const alturaInterna = dimensoes.altura
        const coordenadaNormalizada = Math.max(0, Math.min(coordenada, alturaInterna))
        return Math.round(coordenadaNormalizada * 10) / 10 // Arredondar para 1 casa decimal
      }
      
      return coordenada
    },

    // 🔒 NOVO: Converter coordenadas do DOM para sistema interno
    converterCoordenadaDOMParaInterno(coordenadaDOM, elemento, tipo = 'x') {
      if (!elemento) return coordenadaDOM
      
      const dimensoes = this.dimensoesCalculadas
      const rectElemento = elemento.getBoundingClientRect()
      
      if (tipo === 'x') {
        // Converter coordenada X do DOM para sistema interno
        const proporcaoX = dimensoes.largura / rectElemento.width
        return this.normalizarCoordenadaParaSistemaInterno(coordenadaDOM * proporcaoX, 'x')
      } else if (tipo === 'y') {
        // Converter coordenada Y do DOM para sistema interno  
        const proporcaoY = dimensoes.altura / rectElemento.height
        return this.normalizarCoordenadaParaSistemaInterno(coordenadaDOM * proporcaoY, 'y')
      }
      
      return coordenadaDOM
    },

    // 🎯 DRAG AND DROP: Adicionar event listeners
    adicionarEventListeners() {
      const svgWrapper = this.$el.querySelector('.svg-wrapper svg')
      if (!svgWrapper) {
        console.warn('⚠️ [adicionarEventListeners] SVG wrapper não encontrado')
        return
      }

      // Adicionar listeners de mouse para drag and drop
      svgWrapper.addEventListener('mousedown', this.onMouseDown)
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)

      console.log('✅ [adicionarEventListeners] Event listeners de drag and drop adicionados')
    },

    // 🎯 DRAG AND DROP: Remover event listeners
    removerEventListeners() {
      const svgWrapper = this.$el?.querySelector('.svg-wrapper svg')
      if (svgWrapper) {
        svgWrapper.removeEventListener('mousedown', this.onMouseDown)
      }
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)

      console.log('🗑️ [removerEventListeners] Event listeners removidos')
    },

    // 🎯 DRAG AND DROP: Mouse down
    onMouseDown(event) {
      const elemento = event.target
      const id = elemento.id
      
      if (!id || (!id.startsWith('C') && !id.startsWith('TC'))) {
        return // Só permitir drag em pêndulos e sensores
      }

      event.preventDefault()
      
      // Determinar tipo de elemento
      let tipo, numeroPendulo, numeroSensor = null
      
      if (id.match(/^C\d+S\d+$/)) {
        // Sensor individual (ex: C1S1)
        tipo = 'sensor'
        const match = id.match(/^C(\d+)S(\d+)$/)
        numeroPendulo = parseInt(match[1])
        numeroSensor = parseInt(match[2])
      } else if (id.match(/^C\d+$/)) {
        // Pêndulo (ex: C1)
        tipo = 'pendulo'
        numeroPendulo = parseInt(id.replace('C', ''))
      } else {
        return // ID não reconhecido
      }

      // Iniciar drag
      this.isDragging = true
      this.dragElement = { id, tipo, numeroPendulo, numeroSensor }
      
      // Calcular offset inicial
      const svg = elemento.closest('svg')
      const rect = svg.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      // Converter para coordenadas SVG
      const coordsSVG = this.converterParaCoordenadaSVG(svg, mouseX, mouseY)
      
      // Obter posição atual do elemento
      const elementoRect = elemento.getBBox()
      this.dragOffset = {
        x: coordsSVG.x - (elementoRect.x + elementoRect.width / 2),
        y: coordsSVG.y - (elementoRect.y + elementoRect.height / 2)
      }

      console.log(`🖱️ [onMouseDown] Iniciando drag:`, {
        tipo,
        numeroPendulo,
        numeroSensor,
        coordsSVG,
        offset: this.dragOffset
      })
    },

    // 🎯 DRAG AND DROP: Mouse move
    onMouseMove(event) {
      if (!this.isDragging || !this.dragElement) return

      event.preventDefault()
      
      const svg = this.$el.querySelector('.svg-wrapper svg')
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      // Converter para coordenadas SVG
      const coordsSVG = this.converterParaCoordenadaSVG(svg, mouseX, mouseY)
      
      // Calcular nova posição
      const novaX = coordsSVG.x - this.dragOffset.x
      const novaY = coordsSVG.y - this.dragOffset.y
      
      // Aplicar posição temporariamente
      const elemento = svg.querySelector(`#${this.dragElement.id}`)
      if (elemento) {
        if (this.dragElement.tipo === 'pendulo') {
          // Mover pêndulo
          elemento.setAttribute('x', novaX - 8) // Ajustar para centro
          elemento.setAttribute('y', novaY)
        } else if (this.dragElement.tipo === 'sensor') {
          // Mover sensor
          elemento.setAttribute('x', novaX - 8) // Ajustar para centro
          elemento.setAttribute('y', novaY)
        }
      }
    },

    // 🎯 DRAG AND DROP: Mouse up
    onMouseUp(event) {
      if (!this.isDragging || !this.dragElement) return

      const svg = this.$el.querySelector('.svg-wrapper svg')
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      // Converter para coordenadas SVG
      const coordsSVG = this.converterParaCoordenadaSVG(svg, mouseX, mouseY)
      
      // Calcular posição final
      const novaX = coordsSVG.x - this.dragOffset.x
      const novaY = coordsSVG.y - this.dragOffset.y
      
      // Salvar posição baseada no tipo
      if (this.dragElement.tipo === 'pendulo') {
        // Salvar posição do pêndulo
        this.$emit('posicao-pendulo-alterada', {
          numeroPendulo: this.dragElement.numeroPendulo,
          x: novaX,
          y: novaY
        })
      } else if (this.dragElement.tipo === 'sensor') {
        // Salvar posição do sensor
        this.$emit('posicao-sensor-alterada', {
          numeroPendulo: this.dragElement.numeroPendulo,
          numeroSensor: this.dragElement.numeroSensor,
          x: novaX,
          y: novaY
        })
      }

      console.log(`✅ [onMouseUp] Drag finalizado:`, {
        tipo: this.dragElement.tipo,
        numeroPendulo: this.dragElement.numeroPendulo,
        numeroSensor: this.dragElement.numeroSensor,
        posicaoFinal: { x: novaX, y: novaY }
      })

      // Limpar estado de drag
      this.isDragging = false
      this.dragElement = null
      this.dragOffset = { x: 0, y: 0 }
    },

    // 🎯 DRAG AND DROP: Converter coordenadas do mouse para SVG
    converterParaCoordenadaSVG(svg, mouseX, mouseY) {
      const viewBox = svg.getAttribute('viewBox')
      if (!viewBox) return { x: mouseX, y: mouseY }
      
      const [minX, minY, width, height] = viewBox.split(' ').map(Number)
      const svgRect = svg.getBoundingClientRect()
      
      const scaleX = width / svgRect.width
      const scaleY = height / svgRect.height
      
      return {
        x: minX + (mouseX * scaleX),
        y: minY + (mouseY * scaleY)
      }
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