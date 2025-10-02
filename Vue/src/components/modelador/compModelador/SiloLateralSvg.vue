<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`"
    :style="{
      width: '100%',
      height: 'auto',
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
  >
    <!-- Estrutura do Silo -->
    <g :transform="transformSilo" :style="{ opacity: opacidadesSvg.estrutura }">
      <!-- Corpo do silo (polígono) -->
      <polygon fill="#E7E7E7" :points="pontosSilo" />
      
      <!-- Tampa superior -->
      <path
        fill="#999999"
        d="M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z"
        :transform="`scale(${config.lb / 152}, ${config.hb / 15})`"
      />
      
      <!-- Base elíptica -->
      <ellipse 
        fill="#999999" 
        :cx="config.lb / 2" 
        :cy="config.hs" 
        :rx="config.lb / 2" 
        :ry="config.hb" 
      />
      <ellipse 
        fill="#CCCCCC" 
        :cx="config.lb / 2" 
        :cy="config.hs - config.eb" 
        :rx="config.lb / 2" 
        :ry="config.hb" 
      />
    </g>

    <!-- Aeradores (se ativo) -->
    <g v-if="config.aeradores_ativo" v-html="renderAeradoresSilo()"></g>

    <!-- Pêndulos e Sensores -->
    <g :style="{ opacity: opacidadesSvg.pendulos }">
      <g :transform="transformSilo">
        <g v-for="p in quantidadePendulos" :key="`pendulo_${p}`">
          <!-- Pêndulo -->
          <rect
            :id="`PenduloSilo_${p}`"
            :x="calcularPosicaoXPendulo(p) - escalaSensores / 2"
            :y="yPendulo"
            :width="escalaSensores"
            :height="escalaSensores / 2"
            rx="2"
            ry="2"
            fill="#3A78FD"
            stroke="none"
            stroke-width="0"
            class="pendulo-element"
          />
          <text
            :id="`TextoPenduloSilo_${p}`"
            :x="calcularPosicaoXPendulo(p)"
            :y="yPendulo + escalaSensores / 4"
            text-anchor="middle"
            dominant-baseline="central"
            font-weight="bold"
            :font-size="escalaSensores * 0.4 - 0.5"
            font-family="Arial"
            fill="white"
            class="pendulo-element"
          >
            P{{ p }}
          </text>

          <!-- Sensores do pêndulo -->
          <g v-for="s in getSensoresPorPendulo(p)" :key="`sensor_${p}_${s}`">
            <rect
              :id="`SensorSilo_${p}_${s}`"
              :x="calcularPosicaoXPendulo(p) - escalaSensores / 2"
              :y="calcularPosicaoYSensor(s)"
              :width="escalaSensores"
              :height="escalaSensores / 2"
              rx="2"
              ry="2"
              :fill="getCorSensor(p, s)"
              stroke="black"
              stroke-width="1"
              class="sensor-element"
            />
            <text
              :id="`ValorSensorSilo_${p}_${s}`"
              :x="calcularPosicaoXPendulo(p)"
              :y="calcularPosicaoYSensor(s) + escalaSensores / 4"
              text-anchor="middle"
              dominant-baseline="central"
              :font-size="escalaSensores * 0.4 - 0.5"
              font-family="Arial"
              :fill="getCorSensor(p, s) === '#ff2200' ? 'white' : 'black'"
              class="sensor-element"
            >
              {{ getValorSensor(p, s) }}
            </text>
            <text
              :id="`NomeSensorSilo_${p}_${s}`"
              :x="calcularPosicaoXPendulo(p) - escalaSensores / 2 - 2"
              :y="calcularPosicaoYSensor(s) + escalaSensores / 4"
              text-anchor="end"
              dominant-baseline="central"
              :font-size="escalaSensores * 0.4 - 1.5"
              font-family="Arial"
              fill="black"
              class="sensor-element"
            >
              S{{ s }}
            </text>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'SiloLateralSvg',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        lb: 200,
        hs: 180,
        hb: 15,
        eb: 2,
        escala_sensores: 16,
        dist_y_sensores: 12,
        aeradores_ativo: false,
        na: 4,
        ds: 30,
        dy: 0,
        da: 35,
        aerador_rotacao: 0,
        aerador_escala: 1,
        quantidadePendulos: 5,
        sensoresPorPendulo: {
          1: 5, 2: 5, 3: 5, 4: 5, 5: 5
        }
      })
    },
    dadosSensores: {
      type: Object,
      default: null
    },
    imagemFundo: {
      type: Object,
      default: () => ({ url: null })
    },
    opacidadesSvg: {
      type: Object,
      default: () => ({ 
        geral: 1, 
        pendulos: 1, 
        estrutura: 1 
      })
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    larguraSVG() {
      return this.config.lb + (this.config.aeradores_ativo ? this.config.ds * 2 + 68 : 0)
    },
    alturaSVG() {
      return this.config.hs + this.config.hb * 1.75 + 80
    },
    pontosSilo() {
      const { lb, hs, hb } = this.config
      const p1 = [0, hs]
      const p2 = [lb, hs]
      const p3 = [lb, hb * 1.75]
      const p4 = [lb / 2, 0]
      const p5 = [0, hb * 1.75]
      return `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`
    },
    transformSilo() {
      return this.config.aeradores_ativo ? `translate(${this.config.ds + 34}, 0)` : ""
    },
    quantidadePendulos() {
      return this.config.quantidadePendulos || 5
    },
    escalaSensores() {
      return this.config.escala_sensores || 16
    },
    distYSensores() {
      return this.config.dist_y_sensores || 12
    },
    yPendulo() {
      return this.config.hs + 25
    }
  },
  methods: {
    calcularPosicaoXPendulo(numeroPendulo) {
      const { lb } = this.config
      const margemLateral = 40
      const larguraUtil = lb - (2 * margemLateral)
      
      if (this.quantidadePendulos === 1) {
        return lb / 2
      } else {
        const espacamento = larguraUtil / (this.quantidadePendulos - 1)
        return margemLateral + ((numeroPendulo - 1) * espacamento)
      }
    },
    calcularPosicaoYSensor(numeroSensor) {
      return this.yPendulo - this.distYSensores * numeroSensor - 25
    },
    getSensoresPorPendulo(numeroPendulo) {
      return this.config.sensoresPorPendulo[numeroPendulo] || 5
    },
    getCorSensor(pendulo, sensor) {
      if (this.dadosSensores?.leitura?.[pendulo]?.[sensor]) {
        const dados = this.dadosSensores.leitura[pendulo][sensor]
        const temp = parseFloat(dados[0])
        const nivel = dados[4]

        if (!nivel || temp == 0) {
          return "#e6e6e6"
        } else {
          return this.corFaixaExata(temp)
        }
      }
      return "#ccc"
    },
    getValorSensor(pendulo, sensor) {
      if (this.dadosSensores?.leitura?.[pendulo]?.[sensor]) {
        const dados = this.dadosSensores.leitura[pendulo][sensor]
        const temp = parseFloat(dados[0])
        const falha = dados[3]
        const nivel = dados[4]

        if (!nivel || temp == 0) {
          return "0"
        } else {
          return falha ? "ERRO" : temp.toFixed(1)
        }
      }
      return "0"
    },
    corFaixaExata(temp) {
      if (temp < 15) return "#1e90ff"
      else if (temp < 25) return "#32cd32"
      else if (temp < 35) return "#ffff00"
      else if (temp < 45) return "#ffa500"
      else return "#ff2200"
    },
    renderAeradoresSilo() {
      const { na, ds, dy, da, lb, hs } = this.config
      const posY = hs + dy - 30
      const posX = lb + ds * 2 - 31
      let aeradores = ''

      const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
      const angles = [0, 60, 120, 180, 240, 300]
      
      const aeradorEscala = this.config.aerador_escala || 1
      const aeradorRotacao = this.config.aerador_rotacao || 0

      for (let id = 1; id <= na; id++) {
        let transform = ""
        if (id === 1) transform = `translate(-73, ${posY})`
        else if (id === 2) transform = `translate(${posX}, ${posY})`
        else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`
        else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`
        else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`
        else if (id === 6) transform = `translate(${posX}, ${posY - 70 - da * 2})`
        
        const centerX = 70 + 12.5 + 3.5
        const centerY = 24
        const transformCompleto = `${transform} rotate(${aeradorRotacao} ${centerX} ${centerY}) scale(${aeradorEscala} ${aeradorEscala})`

        aeradores += `
          <g transform="${transformCompleto}">
            <circle cx="${centerX}" cy="${centerY}" r="10" fill="#c5c5c5" />
            <rect x="${70 + 3.5}" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
            <text x="${centerX}" y="7" text-anchor="middle" dominant-baseline="central" font-weight="bold" font-size="6.5" font-family="Arial" fill="white">AE-${id}</text>
            <g>
              ${angles.map(angle =>
          `<path d="${dBlade}" fill="white" ${angle === 0 ? '' : `transform="rotate(${angle},${centerX},${centerY})"`} />`
        ).join('')}
            </g>
          </g>
        `
      }

      return aeradores
    }
  }
}
</script>

<style scoped>
.sensor-element, .pendulo-element {
  transition: all 0.15s ease-out;
}
</style>
