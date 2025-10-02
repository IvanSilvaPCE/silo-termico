<template>
  <div class="svg-container-responsive w-100 h-100">
    <svg :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`" :style="{
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
    }" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" v-html="svgContent">
    </svg>
  </div>
</template>

<script>
export default {
  name: 'SiloSvg',
  props: {
    config: {
      type: Object,
      default: () => ({
        lb: 200,
        hs: 180,
        hb: 15,
        eb: 5,
        aeradores_ativo: false,
        na: 4,
        ds: 30,
        dy: 0,
        da: 35,
        // Configurações de sensores e cabos para silo
        escala_sensores: 16,
        dist_y_sensores: 12,
        quantidadePendulos: 5,
        sensoresPorPendulo: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
        posicoesCabos: {},
        posicao_horizontal: 0,
        posicao_vertical: 0
      })
    },
    dadosSensores: {
      type: Object,
      default: null
    },
    modeloAtual: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      larguraSVG: 400,
      alturaSVG: 300,
      svgContent: ''
    }
  },
  computed: {
    configComputada() {
      return {
        lb: this.config?.lb || 200,
        hs: this.config?.hs || 180,
        hb: this.config?.hb || 15,
        eb: this.config?.eb || 5,
        aeradores_ativo: this.config?.aeradores_ativo || false,
        na: this.config?.na || 4,
        ds: this.config?.ds || 30,
        dy: this.config?.dy || 0,
        da: this.config?.da || 35,
        // Incluir campos de sensores e cabos
        escala_sensores: this.config?.escala_sensores || 16,
        dist_y_sensores: this.config?.dist_y_sensores || 12,
        quantidadePendulos: this.config?.quantidadePendulos || 5,
        sensoresPorPendulo: this.config?.sensoresPorPendulo || { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
        posicoesCabos: this.config?.posicoesCabos || {},
        posicao_horizontal: this.config?.posicao_horizontal || 0,
        posicao_vertical: this.config?.posicao_vertical || 0,
        // Suporte para posições manuais (baseado no ArmazemSvg)
        posicoesManualPendulos: this.config?.posicoesManualPendulos || {},
        posicoesManualSensores: this.config?.posicoesManualSensores || {},
        modeloEspecifico: this.config?.modeloEspecifico || null
      }
    }
  },
  watch: {
    config: {
      handler() {
        this.updateSVG()
      },
      deep: true
    }
  },
  mounted() {
    this.updateSVG()
  },
  methods: {
    updateSVG() {
      this.calcularDimensoesSVG()
      this.generateSVG()
    },

    calcularDimensoesSVG() {
      this.larguraSVG = this.configComputada.lb + (this.configComputada.aeradores_ativo ? this.configComputada.ds * 2 + 68 : 0)
      
      // Calcular altura dinâmica baseada no máximo de sensores
      const maxSensores = Math.max(...Object.values(this.configComputada.sensoresPorPendulo || {}))
      const alturaExtra = Math.max(0, (maxSensores - 5) * this.configComputada.dist_y_sensores)
      this.alturaSVG = this.configComputada.hs + this.configComputada.hb * 1.75 + alturaExtra
    },

    generateSVG() {
      this.svgContent = this.renderSilo() + this.renderSensores()
    },

    renderSilo() {
      const { lb, hs, hb, eb } = this.configComputada
      const p1 = [0, hs]
      const p2 = [lb, hs]
      const p3 = [lb, hb * 1.75]
      const p4 = [lb / 2, 0]
      const p5 = [0, hb * 1.75]
      const points = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`

      const transformSilo = this.configComputada.aeradores_ativo ? `translate(${this.configComputada.ds + 34}, 0)` : ""

      let svg = `
        <g transform="${transformSilo}">
          <polygon fill="#E7E7E7" points="${points}" />
          <path
            fill="#999999"
            d="M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z"
            transform="scale(${lb / 152}, ${hb / 15})"
          />
          <ellipse fill="#999999" cx="${lb / 2}" cy="${hs}" rx="${lb / 2}" ry="${hb}" />
          <ellipse fill="#CCCCCC" cx="${lb / 2}" cy="${hs - eb}" rx="${lb / 2}" ry="${hb}" />
        </g>
      `

      if (this.configComputada.aeradores_ativo) {
        svg += this.renderAeradoresSilo()
      }

      return svg
    },

    renderAeradoresSilo() {
      const { na, ds, dy, da, lb, hs } = this.configComputada
      const posY = hs + dy - 30
      const posX = lb + ds * 2 - 31
      let aeradores = ''

      const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
      const angles = [0, 60, 120, 180, 240, 300]

      for (let id = 1; id <= na; id++) {
        let transform = ""
        if (id === 1) transform = `translate(-73, ${posY})`
        else if (id === 2) transform = `translate(${posX}, ${posY})`
        else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`
        else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`
        else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`
        else if (id === 6) transform = `translate(${posX}, ${posY - 70 - da * 2})`

        aeradores += `
          <g transform="${transform}">
            <circle cx="${70 + 12.5 + 3.5}" cy="24" r="10" fill="#c5c5c5" />
            <rect x="${70 + 3.5}" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
            <text x="${70 + 12.5 + 3.5}" y="7" text-anchor="middle" dominant-baseline="central" font-weight="bold" font-size="6.5" font-family="Arial" fill="white">AE-${id}</text>
            <g>
              ${angles.map(angle =>
          `<path d="${dBlade}" fill="white" ${angle === 0 ? '' : `transform="rotate(${angle},86.35,24.05)"`} />`
        ).join('')}
            </g>
          </g>
        `
      }

      return aeradores
    },

    renderSensores() {
      if (!this.config) {
        return ''
      }

      let elementos = ''

      // Determinar estrutura dos pêndulos baseada no modelo atual
      const config = this.configComputada
      let quantidadePendulos = 5
      let sensoresPorPendulo = { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 }
      let posicoesPendulosSalvas = null

      // Prioridade 1: Configuração do modelo atual
      if (this.modeloAtual && (this.modeloAtual.quantidadePendulos || this.modeloAtual.sensoresPorPendulo)) {
        quantidadePendulos = this.modeloAtual.quantidadePendulos || quantidadePendulos
        sensoresPorPendulo = this.modeloAtual.sensoresPorPendulo || sensoresPorPendulo
      }
      // Prioridade 2: Configuração específica do modelo (estrutura v6.0)
      else if (config.modeloEspecifico) {
        quantidadePendulos = config.modeloEspecifico.quantidadePendulos || quantidadePendulos
        sensoresPorPendulo = config.modeloEspecifico.sensoresPorPendulo || sensoresPorPendulo
      }
      // Prioridade 3: Configuração geral
      else {
        quantidadePendulos = config.quantidadePendulos || quantidadePendulos
        sensoresPorPendulo = config.sensoresPorPendulo || sensoresPorPendulo
      }

      // Verificar se há posições salvas dos pêndulos
      if (config.pendulos?.posicoesSVG) {
        posicoesPendulosSalvas = config.pendulos.posicoesSVG
      }

      const escala_sensores = config.escala_sensores
      const dist_y_sensores = config.dist_y_sensores
      const posicao_horizontal = config.posicao_horizontal
      const posicao_vertical = config.posicao_vertical

      // Calcular posições dos pêndulos baseadas no fundo do SVG do silo
      const larguraSilo = config.lb
      const alturaSilo = config.hs
      const offsetAeradores = config.aeradores_ativo ? config.ds + 34 : 0
      const margemInternaLateral = larguraSilo * 0.1
      const larguraUtilSilo = larguraSilo - (2 * margemInternaLateral)

      for (let p = 1; p <= quantidadePendulos; p++) {
        const numSensores = sensoresPorPendulo[p] || 5

        let xCaboFinal, yPenduloFinal

        // Usar posições salvas se disponíveis
        if (posicoesPendulosSalvas && posicoesPendulosSalvas[p]) {
          xCaboFinal = posicoesPendulosSalvas[p].x
          yPenduloFinal = posicoesPendulosSalvas[p].y
        } else {
          // Calcular posição baseada no fundo do SVG
          let xCaboOriginal

          if (quantidadePendulos === 1) {
            xCaboOriginal = offsetAeradores + (larguraSilo / 2)
          } else {
            const espacamento = larguraUtilSilo / (quantidadePendulos - 1)
            xCaboOriginal = offsetAeradores + margemInternaLateral + ((p - 1) * espacamento)
          }

          // Posição Y baseada na altura do silo
          const yPenduloOriginal = alturaSilo + 25

          // Aplicar offsets de configuração
          xCaboFinal = xCaboOriginal + posicao_horizontal
          yPenduloFinal = yPenduloOriginal + posicao_vertical

          // Aplicar posições manuais se existirem
          if (config.posicoesManualPendulos?.[p]) {
            const posManual = config.posicoesManualPendulos[p]
            xCaboFinal += (parseFloat(posManual.x) || 0)
            yPenduloFinal += (parseFloat(posManual.y) || 0)
          }
        }

        const xCaboNormalizado = xCaboFinal
        const yPenduloNormalizado = yPenduloFinal

        // Renderizar sensores do pêndulo
        for (let s = 1; s <= numSensores; s++) {
          const ySensor = yPenduloNormalizado - dist_y_sensores * s - 35

          // Verificar se o sensor está dentro dos limites visíveis (ajustado para permitir mais sensores)
          if (ySensor > -50) {
            let xSensorFinal = xCaboNormalizado  // Partir da posição normalizada do cabo
            let ySensorFinal = ySensor

            // Aplicar posições manuais dos sensores (seguindo ArmazemSvg)
            const chaveManualSensor = `${p}-${s}`

            if (config.modeloEspecifico?.posicoesManualSensores?.[chaveManualSensor]) {
              // PRIORIDADE 1: Posições manuais da estrutura v6.0 (aditivas)
              const posManual = config.modeloEspecifico.posicoesManualSensores[chaveManualSensor]
              xSensorFinal += (parseFloat(posManual.x) || 0)
              ySensorFinal += (parseFloat(posManual.y) || 0)
            } else if (config.posicoesManualSensores?.[chaveManualSensor]) {
              // PRIORIDADE 2: Posições manuais de compatibilidade (aditivas)
              const posManual = config.posicoesManualSensores[chaveManualSensor]
              xSensorFinal += (parseFloat(posManual.x) || 0)
              ySensorFinal += (parseFloat(posManual.y) || 0)
            }

            // Determinar cor e valor do sensor (seguindo ArmazemSvg)
            let corSensor = "#ccc"
            let valorSensor = "0"

            // Suporte para múltiplos formatos de dados de sensores
            if (this.dadosSensores?.leitura?.[`P${p}`]?.[s]) {
              const dadosSensor = this.dadosSensores.leitura[`P${p}`][s]
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
            } else if (this.dadosSensores?.[`P${p}`]?.[s]) {
              // Formato alternativo de dados de sensores (seguindo SiloComponente)
              const dadosSensor = this.dadosSensores[`P${p}`][s]
              if (dadosSensor.temperatura) {
                const temp = dadosSensor.temperatura
                corSensor = this.corFaixaExata(temp)
                valorSensor = temp.toFixed(1)
              }
            }

            // Preservar posições dos sensores para fidelidade total com modelos salvos
            const xSensorNormalizado = xSensorFinal
            const ySensorNormalizado = ySensorFinal

            // Renderizar sensor na posição normalizada (ACIMA do pêndulo)
            elementos += `
              <rect
                id="C${p}S${s}"
                x="${xSensorNormalizado - escala_sensores / 2}"
                y="${ySensorNormalizado}"
                width="${escala_sensores}"
                height="${escala_sensores / 2}"
                rx="2"
                ry="2"
                fill="${corSensor}"
                stroke="black"
                stroke-width="1"
              />
            `

            // Texto do valor do sensor
            elementos += `
              <text
                id="TC${p}S${s}"
                x="${xSensorNormalizado}"
                y="${ySensorNormalizado + escala_sensores / 4}"
                text-anchor="middle"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 0.5}"
                font-family="Arial"
                fill="${corSensor === '#ff2200' ? 'white' : 'black'}"
              >
                ${valorSensor}
              </text>
            `

            // Nome do sensor
            elementos += `
              <text
                id="TIND${p}S${s}"
                x="${xSensorNormalizado - escala_sensores / 2 - 2}"
                y="${ySensorNormalizado + escala_sensores / 4}"
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
        }

        // Renderizar pêndulo (cabo) DEPOIS dos sensores (na base)
        elementos += `
          <rect
            id="C${p}"
            x="${xCaboNormalizado - escala_sensores / 2}"
            y="${yPenduloNormalizado}"
            width="${escala_sensores}"
            height="${escala_sensores / 2}"
            rx="2"
            ry="2"
            fill="#3A78FD"
            stroke="none"
            stroke-width="0"
          />
        `

        // Texto do pêndulo
        elementos += `
          <text
            id="TC${p}"
            x="${xCaboNormalizado}"
            y="${yPenduloNormalizado + escala_sensores / 4}"
            text-anchor="middle"
            dominant-baseline="central"
            font-weight="bold"
            font-size="${escala_sensores * 0.4 - 0.5}"
            font-family="Arial"
            fill="white"
          >
            P${p}
          </text>
        `
      }

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
}
</style>