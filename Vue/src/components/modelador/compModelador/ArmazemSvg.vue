<template>
  <div class="svg-container-responsive w-100 h-100">
    <svg
      :viewBox="`0 0 ${dimensoesCalculadas.largura} ${dimensoesCalculadas.altura}`"
      :style="{
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        border: '1px solid #ddd',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        imageRendering: 'optimizeQuality'
      }"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      v-html="svgContent">
    </svg>
  </div>
</template>

<script>
export default {
  name: 'ArmazemSvg',
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
        posicoesCabos: {},
        // Dimensões específicas baseadas no fundo
        dimensoesSvgFundo: {
          largura: null,
          altura: null,
          baseadoEm: 'config_fundo'
        }
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
    }
  },
  data() {
    return {
      svgContent: ''
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
    }
  },
  watch: {
    config: {
      handler() {
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
      const config = this.config
      
      // USAR EXATAMENTE A MESMA LÓGICA DO MODELADORSVG
      const larguraBase = Math.max(config.lb || 350, 300)
      
      // Altura baseada no fundo IGUAL AO MODELADORSVG
      const alturaFundo = config.pb + 20  // Altura base + margem
      const alturaTopoNecessaria = 80     // Espaço adequado para o topo
      const alturaTotal = alturaFundo + alturaTopoNecessaria

      // Para diferentes tipos de fundo, ajustar altura IGUAL AO MODELADORSVG
      let extensaoFundo = 0
      if (config.tipo_fundo === 1) {
        extensaoFundo = config.altura_funil_v || 40
      } else if (config.tipo_fundo === 2) {
        extensaoFundo = config.altura_duplo_v || 35
      }

      const alturaFinal = Math.max(alturaTotal + extensaoFundo, 280)

      // Se há sensores, calcular espaço necessário IGUAL AO MODELADORSVG
      if (this.modeloAtual && this.modeloAtual.quantidadePendulos) {
        const maxSensores = Math.max(...Object.values(this.modeloAtual.sensoresPorPendulo || {}))
        const escala_sensores = config.escala_sensores || 16
        const dist_y_sensores = config.dist_y_sensores || 12
        const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0
        
        const alturaSensores = maxSensores * dist_y_sensores + escala_sensores
        const margemSuperior = 30
        const margemInferior = 50
        const margemPendulo = 20

        const alturaComSensores = Math.max(
          alturaFinal,
          margemSuperior + alturaSensores + margemInferior + margemPendulo
        )
        
        return {
          largura: larguraBase,
          altura: Math.max(alturaComSensores, 280)
        }
      }
      
      return {
        largura: larguraBase,
        altura: Math.max(alturaFinal, 250)
      }
    },

    renderArmazem() {
      return `
        <style>
          .sensor-element, .pendulo-element, text, rect {
            transition: all 0.15s ease-out;
          }
        </style>
      ` + this.renderTelhado() + this.renderFundo()
    },

    renderTelhado() {
      const {
        tipo_telhado, curvatura_topo, pb, lb, hb, hf, lf, le, ht, tipo_fundo,
        pontas_redondas, raio_pontas, estilo_laterais, curvatura_laterais
      } = this.config

      if (tipo_telhado === 1) {
        // Telhado Pontudo
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 7
        }

        const alturaTopo = Math.max(10, 50 - (curvatura_topo || 30))
        const p1 = [(lb - lf) / 2, pb - hf + extensao]
        const p2 = [le, pb - hb + extensao]
        const p3 = [le, pb - ht]
        const p4 = [lb / 2, alturaTopo]
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
        // Telhado Arredondado
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        const alturaCurva = Math.max(10, 60 - (curvatura_topo || 30))
        let pathTelhado = `M ${(lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` L ${le} ${pb - hb + extensao}`
        pathTelhado += ` L ${le} ${pb - ht}`
        pathTelhado += ` Q ${lb / 2} ${alturaCurva} ${lb - le} ${pb - ht}`
        pathTelhado += ` L ${lb - le} ${pb - hb + extensao}`
        pathTelhado += ` L ${lb - (lb - lf) / 2} ${pb - hf + extensao} Z`

        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="${pathTelhado}" />`
      } else if (tipo_telhado === 3) {
        // Telhado em Arco
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        const raioArco = Math.max(20, curvatura_topo || 30)
        let pathTelhado = `M ${(lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` L ${le} ${pb - hb + extensao}`
        pathTelhado += ` L ${le} ${pb - ht}`
        pathTelhado += ` A ${(lb - le * 2) / 2} ${raioArco} 0 0 1 ${lb - le} ${pb - ht}`
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
      if (!this.dadosSensores || !this.modeloAtual) return ''

      const escala_sensores = this.config.escala_sensores || 16
      const dist_y_sensores = this.config.dist_y_sensores || 12
      const dist_x_sensores = this.config.dist_x_sensores || 0
      const posicao_horizontal = this.config.posicao_horizontal || 0
      const posicao_vertical = this.config.posicao_vertical || 0
      const afastamento_vertical_pendulo = this.config.afastamento_vertical_pendulo || 0

      // USAR EXATAMENTE A MESMA LÓGICA DO MODELADORSVG
      const pb = (this.config.pb || this.dimensoesCalculadas.altura - 50) + (this.dimensoesCalculadas.altura < 300 ? 0 : 50)
      const yPenduloBase = pb + 15 + posicao_vertical

      const totalCabos = Object.keys(this.dadosSensores.leitura).length
      const indiceCentral = Math.floor((totalCabos - 1) / 2)

      // Calcular posições automáticas EXATAMENTE igual ao ModeladorSVG
      const larguraTotal = this.config.lb || 350
      const margemLateral = 35
      const larguraUtilizavel = larguraTotal - (2 * margemLateral)
      const posicoesCabos = []

      if (totalCabos === 1) {
        posicoesCabos.push(larguraTotal / 2)
      } else {
        const espacamento = larguraUtilizavel / (totalCabos - 1)
        for (let i = 0; i < totalCabos; i++) {
          posicoesCabos.push(margemLateral + (i * espacamento))
        }
      }

      let elementos = ''

      Object.entries(this.dadosSensores.leitura).forEach(([numeroPenduloStr, sensores], index) => {
        const numeroPendulo = parseInt(numeroPenduloStr)
        
        // USAR POSIÇÕES INDIVIDUAIS SALVAS DO MODELO
        let xCaboFinal = posicoesCabos[index] || larguraTotal / 2
        let yPenduloFinal = yPenduloBase

        // Aplicar posições individuais salvas - PRIORIDADE MÁXIMA
        if (this.config.posicoesCabos && this.config.posicoesCabos[numeroPendulo]) {
          const posicaoCabo = this.config.posicoesCabos[numeroPendulo]
          
          // USAR POSIÇÕES SALVAS DIRETAMENTE
          if (posicaoCabo.x !== undefined && posicaoCabo.x !== null) {
            xCaboFinal = parseFloat(posicaoCabo.x)
          }
          
          if (posicaoCabo.y !== undefined && posicaoCabo.y !== null) {
            yPenduloFinal = yPenduloBase + parseFloat(posicaoCabo.y)
          }
          
          // Aplicar offsets adicionais se existirem
          if (posicaoCabo.offsetX) {
            xCaboFinal += parseFloat(posicaoCabo.offsetX)
          }
          
          if (posicaoCabo.offsetY) {
            yPenduloFinal += parseFloat(posicaoCabo.offsetY)
          }
        } else {
          // Fallback para cálculo automático apenas se não houver posição salva
          const distanciaDoMeio = index - indiceCentral
          const deslocamentoX = distanciaDoMeio * dist_x_sensores
          xCaboFinal = posicoesCabos[index] + posicao_horizontal + deslocamentoX
          yPenduloFinal = yPenduloBase + posicao_vertical
        }

        // Retângulo do pêndulo - MESMO ESTILO DO MODELADORSVG
        elementos += `
          <rect
            x="${xCaboFinal - escala_sensores / 2}"
            y="${yPenduloFinal}"
            width="${escala_sensores}"
            height="${escala_sensores / 2}"
            rx="2" ry="2"
            fill="#3A78FD"
            stroke="none"
          />
        `

        // Texto do pêndulo - MESMO ESTILO DO MODELADORSVG
        elementos += `
          <text
            x="${xCaboFinal}"
            y="${yPenduloFinal + escala_sensores / 4}"
            text-anchor="middle"
            dominant-baseline="central"
            font-weight="bold"
            font-size="${escala_sensores * 0.4 - 0.5}"
            font-family="Arial"
            fill="white"
          >
            P${numeroPendulo}
          </text>
        `

        // Sensores - USAR MESMA FÓRMULA DE POSICIONAMENTO DO MODELADORSVG
        Object.entries(sensores).forEach(([numeroSensor, dadosSensor]) => {
          const s = parseInt(numeroSensor)
          // MESMA FÓRMULA DO MODELADORSVG: yPenduloFinal - dist_y_sensores * s - 25 - afastamento_vertical_pendulo
          const ySensorBase = yPenduloFinal - dist_y_sensores * s - 25 - afastamento_vertical_pendulo
          const xSensorFinal = xCaboFinal
          const ySensorFinal = ySensorBase

          // VERIFICAÇÃO DE LIMITES IGUAL AO MODELADORSVG
          if (ySensorFinal > 50 && ySensorFinal < (pb - 10)) {
            const [temp, pontoQuente, preAlarme, falha, nivel] = dadosSensor
            let cor = "#ccc"
            let valorSensor = "0"

            if (!nivel || temp == 0) {
              cor = "#e6e6e6"
              valorSensor = "0"
            } else {
              cor = this.corFaixaExata(parseFloat(temp) || 0)
              valorSensor = falha ? "ERRO" : (parseFloat(temp) || 0).toFixed(1)
            }

            // Retângulo do sensor - MESMO ESTILO DO MODELADORSVG
            elementos += `
              <rect
                x="${xSensorFinal - escala_sensores / 2}"
                y="${ySensorFinal}"
                width="${escala_sensores}"
                height="${escala_sensores / 2}"
                rx="2" ry="2"
                fill="${cor}"
                stroke="black"
                stroke-width="1"
              />
            `

            // Texto do valor - MESMO ESTILO DO MODELADORSVG
            elementos += `
              <text
                x="${xSensorFinal}"
                y="${ySensorFinal + escala_sensores / 4}"
                text-anchor="middle"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 0.5}"
                font-family="Arial"
                fill="${cor === "#ff2200" ? "white" : "black"}"
              >
                ${valorSensor}
              </text>
            `

            // Nome do sensor - MESMO ESTILO DO MODELADORSVG
            elementos += `
              <text
                x="${xSensorFinal - escala_sensores / 2 - 2}"
                y="${ySensorFinal + escala_sensores / 4}"
                text-anchor="end"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 1.5}"
                font-family="Arial"
                fill="black"
              >
                S${s}
              </text>
            `
          }
        })
      })

      return elementos
    },

    

    corFaixaExata(temp) {
      if (temp < 12) return '#0384fc'
      else if (temp < 15) return '#03e8fc'
      else if (temp < 17) return '#03fcbe'
      else if (temp < 21) return '#07fc03'
      else if (temp < 25) return '#c3ff00'
      else if (temp < 27) return '#fcf803'
      else if (temp < 30) return '#ffb300'
      else if (temp < 35) return '#ff2200'
      else if (temp < 50) return '#ff0090'
      else return '#f700ff'
    },

    // Método para forçar recálculo de dimensões
    recalcularDimensoes() {
      const novasDimensoes = this.calcularDimensoesBaseadoNoFundo()
      this.$emit('dimensoes-atualizadas', novasDimensoes)
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
  /* height: 100%; */
}
</style>