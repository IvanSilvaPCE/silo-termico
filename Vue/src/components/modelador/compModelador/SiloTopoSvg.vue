<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    xml:space="preserve"
    width="100%"
    height="auto"
    version="1.0"
    :viewBox="`0 0 ${largura} ${altura}`"
    :style="{
      maxWidth: '100%',
      maxHeight: isMobile ? '60vh' : 'calc(100vh - 320px)',
      minHeight: isMobile ? '200px' : '250px',
      border: '1px solid #ddd',
      backgroundColor: imagemFundo.url ? 'transparent' : '#f8f9fa',
      borderRadius: '4px',
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision',
      imageRendering: 'optimizeQuality',
      position: 'relative',
      zIndex: 2,
      opacity: imagemFundo.url ? opacidadesSvg.geral : 1,
      transition: 'opacity 0.3s ease-in-out'
    }" 
    preserveAspectRatio="xMidYMid meet"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <radialGradient 
        id="topoGradient" 
        gradientUnits="userSpaceOnUse" 
        gradientTransform="matrix(1.00886 -0 -0 1.00886 -1 -1)" 
        :cx="centroX" 
        :cy="centroY" 
        :r="raioSilo" 
        :fx="centroX" 
        :fy="centroY"
      >
        <stop offset="0" style="stop-opacity:1; stop-color:whitesmoke"/>
        <stop offset="1" style="stop-opacity:1; stop-color:#999999"/>
      </radialGradient>
    </defs>

    <!-- Fundo circular do topo do silo -->
    <g id="desenho_fundo" :style="{ opacity: opacidadesSvg.estrutura }">
      <!-- Círculo principal com gradiente -->
      <path 
        class="silo-background" 
        fill="url(#topoGradient)" 
        stroke="#999999" 
        stroke-width="1.6929" 
        stroke-miterlimit="22.9256"
        :d="pathCirculoSilo"
      />

      <!-- Linhas divisórias radiais -->
      <g stroke="#999999" stroke-width="0.8465" stroke-miterlimit="22.9256" fill="none">
        <!-- Linha vertical -->
        <line :x1="centroX" :y1="centroY - raioSilo" :x2="centroX" :y2="centroY + raioSilo" />
        <!-- Linha diagonal 1 -->
        <line 
          :x1="centroX - raioSilo * Math.cos(Math.PI/4)" 
          :y1="centroY - raioSilo * Math.sin(Math.PI/4)" 
          :x2="centroX + raioSilo * Math.cos(Math.PI/4)" 
          :y2="centroY + raioSilo * Math.sin(Math.PI/4)" 
        />
        <!-- Linha horizontal -->
        <line :x1="centroX - raioSilo" :y1="centroY" :x2="centroX + raioSilo" :y2="centroY" />
        <!-- Linha diagonal 2 -->
        <line 
          :x1="centroX - raioSilo * Math.cos(Math.PI/4)" 
          :y1="centroY + raioSilo * Math.sin(Math.PI/4)" 
          :x2="centroX + raioSilo * Math.cos(Math.PI/4)" 
          :y2="centroY - raioSilo * Math.sin(Math.PI/4)" 
        />
      </g>

      <!-- Círculo central -->
      <circle 
        :cx="centroX" 
        :cy="centroY" 
        :r="raioSilo * 0.21" 
        fill="#E6E6E6" 
        stroke="#999999" 
        stroke-width="0.8465"
      />

      <!-- Círculo médio -->
      <circle 
        :cx="centroX" 
        :cy="centroY" 
        :r="raioSilo * 0.57" 
        fill="none" 
        stroke="#999999" 
        stroke-width="0.8465"
      />
    </g>

    <!-- Pêndulos posicionados -->
    <g :style="{ opacity: opacidadesSvg.pendulos }">
      <g 
        v-for="(pendulo, index) in pendulosComPosicao" 
        :key="`pendulo_${index + 1}`" 
        :id="`pendulo_${index + 1}`"
        :transform="pendulo.transform"
        @mousedown="iniciarDrag($event, pendulo, 'pendulo')"
        style="cursor: move;"
      >
        <!-- Círculo principal do pêndulo -->
        <circle 
          :cx="centroX" 
          :cy="centroY" 
          r="5.7138"
          fill="#06335E"
          stroke="black" 
          stroke-width="0.8"
          :title="`Pêndulo ${pendulo.label}`"
        />

        <!-- Texto do pêndulo -->
        <text 
          :x="centroX" 
          :y="centroY"  
          class="pendulo-text" 
          text-anchor="middle" 
          dominant-baseline="central"
          fill="white"
          font-size="7"
          font-weight="bold"
        >
          P{{ pendulo.label }}
        </text>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'SiloTopoSvg',
  props: {
    config: {
      type: Object,
      required: true
    },
    imagemFundo: {
      type: Object,
      default: () => ({ url: null })
    },
    opacidadesSvg: {
      type: Object,
      default: () => ({ geral: 1, pendulos: 1, estrutura: 1 })
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      largura: 138,
      altura: 134,
      posicoesManualPendulos: {},
      isDragging: false,
      dragElement: null,
      dragOffset: { x: 0, y: 0 }
    }
  },
  computed: {
    centroX() {
      return 68.7343
    },
    centroY() {
      return 66.5965
    },
    raioSilo() {
      return 65.75
    },
    pathCirculoSilo() {
      return "M66.5965 0.8465c34.2065,0 62.3078,26.1228 65.453,59.5066l1.6233 0c1.6221,0 2.9493,1.3271 2.9493,2.9493l0 6.2908c0,1.6221 -1.3271,2.9493 -2.9493,2.9493l-1.597 0c-3.0059,33.5258 -31.1715,59.804 -65.4794,59.804 -36.3127,0 -65.75,-29.4373 -65.75,-65.75 0,-36.3127 29.4373,-65.75 65.75,-65.75z"
    },
    quantidadePendulos() {
      return this.config?.quantidadePendulos || 5
    },
    pendulosComPosicao() {
      const pendulos = []

      for (let i = 1; i <= this.quantidadePendulos; i++) {
        // Verificar se há posição manual
        if (this.posicoesManualPendulos[i]) {
          pendulos.push({
            label: i,
            transform: `translate(${this.posicoesManualPendulos[i].x},${this.posicoesManualPendulos[i].y})`
          })
        } else {
          // Calcular posição automática em círculo
          pendulos.push({
            label: i,
            transform: this.calcularPosicaoCircular(i - 1, this.quantidadePendulos)
          })
        }
      }

      return pendulos
    }
  },
  mounted() {
    document.addEventListener('mousemove', this.handleDrag)
    document.addEventListener('mouseup', this.pararDrag)
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('mouseup', this.pararDrag)
  },
  methods: {
    calcularPosicaoCircular(index, total) {
      // Se só há 1 pêndulo, coloca no centro
      if (total === 1) {
        return `translate(0,0)`
      }

      // 🎯 LÓGICA CORRIGIDA: Começar no ângulo 0° (3 horas) e ir no sentido anti-horário
      const raioBase = this.raioSilo * 0.6 // Usar 60% do raio do silo
      const anguloInicial = 0 // Começar no ângulo 0° (3 horas do relógio)
      const incrementoAngulo = (2 * Math.PI) / total
      // Sentido anti-horário: subtrair o incremento
      const anguloFinal = anguloInicial - (incrementoAngulo * index)

      // 🎯 FUNCIONALIDADE: Ajustar tamanho do raio baseado na quantidade de sensores
      const numeroSensores = this.config.sensoresPorPendulo?.[index + 1] || 5
      const raioAjustado = this.calcularRaioComBaseEmSensores(raioBase, numeroSensores)

      const x = raioAjustado * Math.cos(anguloFinal)
      const y = raioAjustado * Math.sin(anguloFinal)
      return `translate(${x},${y})`
    },

    // 🎯 NOVO MÉTODO: Calcular raio baseado na quantidade de sensores
    calcularRaioComBaseEmSensores(raioBase, numeroSensores) {
      // Lógica: pêndulos com mais sensores ficam mais próximos do centro
      // Sensores 1-3: raio normal
      // Sensores 4-6: raio reduzido em 10%
      // Sensores 7+: raio reduzido em 20%
      if (numeroSensores <= 3) {
        return raioBase
      } else if (numeroSensores <= 6) {
        return raioBase * 0.9 // 10% mais próximo do centro
      } else {
        return raioBase * 0.8 // 20% mais próximo do centro
      }
    },

    polarParaRetangular(raio, angulo) {
      // Método mantido para compatibilidade, mas não usado no cálculo principal
      const anguloRad = (angulo * Math.PI) / 180 * -1
      const x = raio * Math.cos(anguloRad)
      const y = raio * Math.sin(anguloRad)
      return `translate(${x},${y})`
    },

    iniciarDrag(event, pendulo, tipo) {
      event.preventDefault()

      this.isDragging = true
      this.dragElement = pendulo
      this.dragType = tipo

      // Pegar coordenadas do mouse no SVG
      const svg = event.target.closest('svg')
      const pt = svg.createSVGPoint()
      pt.x = event.clientX
      pt.y = event.clientY
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())

      // Calcular offset
      const match = pendulo.transform.match(/translate\(([-\d.]+),([-\d.]+)\)/)
      if (match) {
        this.dragOffset = {
          x: svgP.x - parseFloat(match[1]) - this.centroX,
          y: svgP.y - parseFloat(match[2]) - this.centroY
        }
      }
    },

    handleDrag(event) {
      if (!this.isDragging || !this.dragElement) return

      const svg = this.$el
      if (!svg || svg.tagName !== 'svg') return

      const pt = svg.createSVGPoint()
      pt.x = event.clientX
      pt.y = event.clientY
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())

      const newX = svgP.x - this.centroX - this.dragOffset.x
      const newY = svgP.y - this.centroY - this.dragOffset.y

      // Limitar movimento dentro do círculo do silo
      const distancia = Math.sqrt(newX * newX + newY * newY)
      const raioMaximo = this.raioSilo - 10

      let finalX = newX
      let finalY = newY

      if (distancia > raioMaximo) {
        const angulo = Math.atan2(newY, newX)
        finalX = Math.cos(angulo) * raioMaximo
        finalY = Math.sin(angulo) * raioMaximo
      }

      // Atualizar posição
      this.$set(this.posicoesManualPendulos, this.dragElement.label, {
        x: finalX,
        y: finalY
      })

      // Emitir evento de atualização
      this.$emit('posicoes-atualizadas', {
        tipo: 'topo',
        pendulos: { ...this.posicoesManualPendulos }
      })
    },

    pararDrag() {
      this.isDragging = false
      this.dragElement = null
      this.dragType = null
    }
  }
}
</script>

<style scoped>
.pendulo-text {
  pointer-events: none;
  user-select: none;
}
</style>