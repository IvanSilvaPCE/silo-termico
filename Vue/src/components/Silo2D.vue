
<template>
  <div class="container-fluid p-1 p-md-2" style="min-height: 100vh; overflow: auto;">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-1 mb-md-2 fs-4 fs-md-1">Silo - Monitoramento de Temperatura</h1>
        
        <div v-if="carregandoModo" class="d-flex justify-content-center m-2">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
        
        <div v-else>
          <div 
            class="svg-container mb-1 mb-md-2" 
            :style="{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: 'calc(100vh - 180px)',
              maxHeight: 'calc(100vh - 140px)',
              overflow: 'auto'
            }"
          >
            <svg
              v-if="dados"
              width="100%"
              height="auto"
              :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`"
              :style="{
                maxWidth: '100%',
                maxHeight: modo === 'temperatura' ? '70vh' : '85vh',
                height: 'auto',
                minHeight: modo === 'temperatura' ? '350px' : '400px',
                shapeRendering: 'auto',
                textRendering: 'geometricPrecision',
                imageRendering: 'optimizeQuality',
                fillRule: 'evenodd',
                clipRule: 'evenodd'
              }"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g :transform="transformSilo">
                <!-- Fundo do Silo -->
                <g id="g_des_fundo">
                  <polygon 
                    fill="#E7E7E7" 
                    :points="pontosFundoSilo" 
                  />
                  <path
                    fill="#999999"
                    d="M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z"
                    :transform="`scale(${layout.desenho_corte_silo.lb / 152}, ${layout.desenho_corte_silo.hb / 15})`"
                  />
                  <ellipse 
                    fill="#999999" 
                    :cx="layout.desenho_corte_silo.lb / 2" 
                    :cy="layout.desenho_corte_silo.hs" 
                    :rx="layout.desenho_corte_silo.lb / 2" 
                    :ry="layout.desenho_corte_silo.hb" 
                  />
                  <ellipse 
                    fill="#CCCCCC" 
                    :cx="layout.desenho_corte_silo.lb / 2" 
                    :cy="layout.desenho_corte_silo.hs - layout.desenho_corte_silo.eb" 
                    :rx="layout.desenho_corte_silo.lb / 2" 
                    :ry="layout.desenho_corte_silo.hb" 
                  />
                </g>

                <!-- Mapa de Calor (modo mapa) -->
                <g v-if="modo === 'mapa'">
                  <defs>
                    <filter id="blurFilter">
                      <feGaussianBlur stdDeviation="0.4" />
                    </filter>
                    <clipPath id="clipSilo">
                      <path :d="pathClipSilo" />
                    </clipPath>
                  </defs>
                  <g filter="url(#blurFilter)" clip-path="url(#clipSilo)">
                    <rect
                      v-for="(bloco, index) in blocosMapaCalor"
                      :key="`bloco-${index}`"
                      :x="bloco.x"
                      :y="bloco.y"
                      :width="bloco.width"
                      :height="bloco.height"
                      :fill="bloco.fill"
                    />
                  </g>
                </g>

                <!-- Sensores (modo temperatura) -->
                <g v-if="modo === 'temperatura'">
                  <g v-for="(sensores, pend, penduloIndex) in leitura" :key="`cabo-${pend}`">
                    <!-- Nome do pêndulo -->
                    <rect
                      :id="`C${pend}`"
                      :x="getBaseX(penduloIndex)"
                      :y="getYPendulo(penduloIndex)"
                      :width="layout.desenho_sensores.escala_sensores"
                      :height="layout.desenho_sensores.escala_sensores / 2"
                      rx="2"
                      ry="2"
                      fill="#3A78FD"
                    />
                    <text
                      :id="`TC${pend}`"
                      :x="getBaseX(penduloIndex) + layout.desenho_sensores.escala_sensores / 2"
                      :y="getYPendulo(penduloIndex) + layout.desenho_sensores.escala_sensores / 4"
                      text-anchor="middle"
                      dominant-baseline="central"
                      font-weight="bold"
                      :font-size="layout.desenho_sensores.escala_sensores * 0.4 - 0.5"
                      font-family="Arial"
                      fill="white"
                    >
                      {{ pend }}
                    </text>

                    <!-- Sensores individuais -->
                    <g v-for="(valores, sensorKey) in sensores" :key="`sensor-${pend}-${sensorKey}`">
                      <g v-for="sensor in [parseInt(sensorKey)]" :key="`s-${sensor}`">
                        <!-- Nome do sensor -->
                        <text
                          :id="`TIND${pend}S${sensor}`"
                          :x="layout.desenho_sensores.nome_sensores_direita === 0 ? getBaseX(penduloIndex) - 2 : getBaseX(penduloIndex) + layout.desenho_sensores.escala_sensores + 2"
                          :y="getBaseY(penduloIndex) + (layout.desenho_sensores.escala_sensores / 2) / 2 - layout.desenho_sensores.dist_y_sensores * sensor"
                          :text-anchor="layout.desenho_sensores.nome_sensores_direita === 0 ? 'end' : 'start'"
                          dominant-baseline="central"
                          font-weight="bold"
                          :font-size="layout.desenho_sensores.escala_sensores * 0.4 - 1.5"
                          font-family="Arial"
                          fill="black"
                        >
                          S{{ sensor }}
                        </text>
                        
                        <!-- Retângulo do sensor -->
                        <rect
                          :id="`C${pend}S${sensor}`"
                          :x="getBaseX(penduloIndex)"
                          :y="getYSensor(penduloIndex, sensor)"
                          :width="layout.desenho_sensores.escala_sensores"
                          :height="layout.desenho_sensores.escala_sensores / 2"
                          rx="2"
                          ry="2"
                          :fill="getSensorColor(valores)"
                          stroke="black"
                          :stroke-width="valores[1] ? 0.6 : 0.25"
                        />
                        
                        <!-- Texto do sensor -->
                        <text
                          :id="`TC${pend}S${sensor}`"
                          :x="getBaseX(penduloIndex) + layout.desenho_sensores.escala_sensores / 2"
                          :y="getYSensor(penduloIndex, sensor) + (layout.desenho_sensores.escala_sensores / 2) / 2"
                          text-anchor="middle"
                          dominant-baseline="central"
                          font-weight="bold"
                          :font-size="layout.desenho_sensores.escala_sensores * 0.4 - 0.5"
                          font-family="Arial"
                          :fill="getSensorColor(valores) === '#ff2200' ? 'white' : 'black'"
                        >
                          {{ getSensorText(valores) }}
                        </text>
                        
                        <!-- Overlay de erro -->
                        <rect
                          v-if="valores[3]"
                          :id="`FC${pend}S${sensor}`"
                          :x="getBaseX(penduloIndex) - 0.5"
                          :y="getYSensor(penduloIndex, sensor) - 0.5"
                          :width="layout.desenho_sensores.escala_sensores + 1"
                          :height="layout.desenho_sensores.escala_sensores / 2 + 1"
                          rx="2"
                          ry="2"
                          fill="red"
                          fill-opacity="0.6"
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>

              <!-- Aeradores -->
              <g v-if="layout.aeradores && layout.aeradores.na > 0">
                <g 
                  v-for="id in layout.aeradores.na" 
                  :key="`aerador-${id}`"
                  :id="`aerador_${id}`" 
                  :transform="getTransformAerador(id)"
                >
                  <circle
                    :id="`fundo_aerador_${id}`"
                    :cx="70 + 12.5 + 3.5"
                    cy="24"
                    r="10"
                    :fill="getCorAerador(id)"
                  />
                  <rect x="86.5" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
                  <text
                    :x="70 + 12.5 + 3.5"
                    y="7"
                    text-anchor="middle"
                    dominant-baseline="central"
                    font-weight="bold"
                    font-size="6.5"
                    font-family="Arial"
                    fill="white"
                  >
                    AE-{{ id }}
                  </text>
                  
                  <!-- Pás do aerador -->
                  <g v-if="getStatusAerador(id) === 3" :style="{ visibility: 'visible' }">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      dur="2s"
                      values="0 86.35 24.05; 360 86.35 24.05;"
                      repeatCount="indefinite"
                    />
                    <path
                      v-for="angle in [0, 60, 120, 180, 240, 300]"
                      :key="`blade-girando-${id}-${angle}`"
                      :d="dBlade"
                      fill="white"
                      :transform="angle === 0 ? undefined : `rotate(${angle},86.35,24.05)`"
                    />
                  </g>
                  <g v-else :style="{ visibility: 'visible' }">
                    <path
                      v-for="angle in [0, 60, 120, 180, 240, 300]"
                      :key="`blade-parado-${id}-${angle}`"
                      :d="dBlade"
                      fill="white"
                      :transform="angle === 0 ? undefined : `rotate(${angle},86.35,24.05)`"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
        
        <div class="d-flex justify-content-center py-2">
          <button class="btn btn-primary" @click="trocarModo">
            {{ modo === 'temperatura' ? 'Ver Mapa de Calor' : 'Ver Temperatura' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Silo2D',
  data() {
    return {
      modo: 'temperatura',
      carregandoModo: false,
      dados: null,
      blocosMapaCalor: [],
      dBlade: "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
    }
  },
  computed: {
    layout() {
      return this.dados?.dados_layout || {}
    },
    leitura() {
      return this.dados?.leitura || {}
    },
    motorStatus() {
      return this.dados?.motor?.statusMotor || []
    },
    larguraSVG() {
      if (!this.layout.tamanho_svg) return 400
      return this.layout.tamanho_svg[0]
    },
    alturaSVG() {
      if (!this.layout.tamanho_svg) return 300
      return this.layout.tamanho_svg[1]
    },
    transformSilo() {
      if (!(this.layout.aeradores && this.layout.aeradores.na > 0)) return ""
      return `translate(${Number(this.layout.aeradores.ds) + 34}, 0)`
    },
    pontosFundoSilo() {
      if (!this.layout.desenho_corte_silo) return "0,0"
      const { lb, hs, hb } = this.layout.desenho_corte_silo
      const p1 = [0, hs]
      const p2 = [lb, hs]
      const p3 = [lb, hb * 1.75]
      const p4 = [lb / 2, 0]
      const p5 = [0, hb * 1.75]
      return `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`
    },
    pathClipSilo() {
      if (!this.layout.desenho_corte_silo) return "M 0,0 L 100,0 L 100,100 L 0,100 Z"
      const { lb, hs, hb } = this.layout.desenho_corte_silo
      const p1 = [0, hs]
      const p2 = [lb, hs]
      const p3 = [lb, hb * 1.75]
      const p4 = [lb / 2, 0]
      const p5 = [0, hb * 1.75]
      return `M ${p1[0]},${p1[1]} L ${p2[0]},${p2[1]} L ${p3[0]},${p3[1]} L ${p4[0]},${p4[1]} L ${p5[0]},${p5[1]} Z`
    }
  },
  mounted() {
    this.carregarDados()
  },
  watch: {
    modo() {
      if (this.modo === 'mapa') {
        this.$nextTick(() => {
          this.gerarMapaCalor()
        })
      }
    }
  },
  methods: {
    async carregarDados() {
      try {
        // Dados simulados mais realistas seguindo o padrão React
        const dadosSimulados = {
          dados_layout: {
            tamanho_svg: [400, 300],
            desenho_corte_silo: {
              lb: 200,
              hs: 180,
              hb: 15,
              eb: 5
            },
            desenho_sensores: {
              escala_sensores: 16,
              dist_y_sensores: 12,
              pos_y_cabo: [160, 160, 160, 160, 160],
              pos_x_cabo: [50, 25],
              pos_x_cabos_uniforme: 1,
              nome_sensores_direita: 0,
              nome_cabo_acima: 0,
              dist_y_nome_cabo: [10, 10, 10, 10, 10]
            },
            aeradores: {
              na: 4,
              ds: 30,
              dy: 0,
              da: 35
            }
          },
          leitura: {
            'P1': {
              '1': [23.5, false, false, false, true],
              '2': [24.1, false, false, false, true],
              '3': [22.8, false, false, false, true],
              '4': [25.2, false, false, false, true],
              '5': [23.9, false, false, false, true],
              '6': [22.1, false, false, false, true],
              '7': [24.3, false, false, false, true],
              '8': [23.7, false, false, false, true]
            },
            'P2': {
              '1': [26.3, false, false, false, true],
              '2': [27.1, false, false, false, true],
              '3': [25.8, false, false, false, true],
              '4': [28.2, false, false, false, true],
              '5': [26.9, false, false, false, true],
              '6': [27.5, false, false, false, true]
            },
            'P3': {
              '1': [21.5, false, false, false, true],
              '2': [22.1, false, false, false, true],
              '3': [20.8, false, false, false, true],
              '4': [23.2, false, false, false, true],
              '5': [22.9, false, false, false, true],
              '6': [21.4, false, false, false, true],
              '7': [22.8, false, false, false, true]
            },
            'P4': {
              '1': [29.1, false, false, false, true],
              '2': [30.2, false, false, false, true],
              '3': [28.7, false, false, false, true],
              '4': [31.1, false, false, false, true],
              '5': [29.8, false, false, false, true]
            }
          },
          motor: {
            statusMotor: [0, 3, 1, 4]
          }
        }
        this.dados = dadosSimulados
      } catch (error) {
        console.error('Erro ao carregar dados do silo:', error)
      }
    },

    corFaixaExata(t) {
      if (t === -1000) return "#ff0000"
      if (t < 12) return "#0384fc"
      else if (t < 15) return "#03e8fc"
      else if (t < 17) return "#03fcbe"
      else if (t < 21) return "#07fc03"
      else if (t < 25) return "#c3ff00"
      else if (t < 27) return "#fcf803"
      else if (t < 30) return "#ffb300"
      else if (t < 35) return "#ff2200"
      else if (t < 50) return "#ff0090"
      else return "#f700ff"
    },

    getSensorColor(valores) {
      if (valores[4] === false) return "#e7e7e7"
      const temp = parseFloat(valores[0])
      return this.corFaixaExata(temp)
    },

    getSensorText(valores) {
      if (valores[3]) return "ERRO"
      const temp = parseFloat(valores[0]).toFixed(1)
      return temp
    },

    getBaseX(idxCabo) {
      if (!this.layout.desenho_sensores) return 0
      const ds = this.layout.desenho_sensores
      const escala = Number(ds.escala_sensores)
      const posXCabo = ds.pos_x_cabo
      const posXUniforme = Number(ds.pos_x_cabos_uniforme)
      const nCabos = Object.keys(this.leitura).length
      const dist = posXCabo[1] || 0
      const totalWidthCabos = (nCabos - 1) * dist + escala
      const lb = this.layout.desenho_corte_silo.lb
      const offsetCabos = (lb - totalWidthCabos) / 2
      
      return posXUniforme === 0 ? posXCabo[idxCabo] : offsetCabos + idxCabo * dist
    },

    getBaseY(idxCabo) {
      if (!this.layout.desenho_sensores) return 0
      return this.layout.desenho_sensores.pos_y_cabo[idxCabo]
    },

    getYPendulo(idxCabo) {
      if (!this.layout.desenho_sensores) return 0
      const ds = this.layout.desenho_sensores
      const numSensores = Object.keys(Object.values(this.leitura)[idxCabo] || {}).length
      const baseY = ds.pos_y_cabo[idxCabo]
      const nomeCaboAcima = Number(ds.nome_cabo_acima)
      const distYNomeCabo = ds.dist_y_nome_cabo[idxCabo]
      const distYSensores = Number(ds.dist_y_sensores)
      
      return nomeCaboAcima === 1
        ? baseY - (numSensores + 1) * distYSensores - distYNomeCabo
        : baseY + distYNomeCabo
    },

    getYSensor(idxCabo, sensor) {
      if (!this.layout.desenho_sensores) return 0
      const ds = this.layout.desenho_sensores
      const baseY = ds.pos_y_cabo[idxCabo]
      const distYSensores = Number(ds.dist_y_sensores)
      return baseY - distYSensores * sensor
    },

    getTransformAerador(id) {
      if (!this.layout.aeradores) return ""
      const { ds, dy, da } = this.layout.aeradores
      const { hs, lb } = this.layout.desenho_corte_silo
      const posY = hs + dy - 30
      const posX = lb + ds * 2 - 31
      
      if (id === 1) return `translate(-73, ${posY})`
      else if (id === 2) return `translate(${posX}, ${posY})`
      else if (id === 3) return `translate(-73, ${posY - 35 - da})`
      else if (id === 4) return `translate(${posX}, ${posY - 35 - da})`
      else if (id === 5) return `translate(-73, ${posY - 70 - da * 2})`
      else if (id === 6) return `translate(${posX}, ${posY - 70 - da * 2})`
      
      return ""
    },

    getCorAerador(id) {
      const status = this.getStatusAerador(id)
      const cores = {
        0: "#c5c5c5", // desligado
        1: "#ffeb3b", // startando
        3: "#31dd0f", // ligado
        4: "#ff0000"  // erro
      }
      return cores[status] || cores[0]
    },

    getStatusAerador(id) {
      return this.motorStatus[id - 1] ?? 0
    },

    gerarMapaCalor() {
      if (!this.dados || this.modo !== 'mapa') return

      const ds = this.layout.desenho_sensores
      const distYSensores = Number(ds.dist_y_sensores)
      const posYCabo = ds.pos_y_cabo
      const posXCabo = ds.pos_x_cabo
      const posXUniforme = Number(ds.pos_x_cabos_uniforme)
      
      // Coletar sensores ativos e calcular nível de grão
      const sensores = []
      let nivelMaisAlto = 0
      
      Object.entries(this.leitura).forEach(([, objSensores], idxCabo) => {
        const xCabo = posXUniforme === 0 ? posXCabo[idxCabo] : posXCabo[0] + posXCabo[1] * idxCabo
        const yCabo = posYCabo[idxCabo]
        Object.entries(objSensores).forEach(([sensorKey, dadosSensor]) => {
          const sensorIdx = parseInt(sensorKey, 10)
          const t = parseFloat(dadosSensor[0])
          const ativo = dadosSensor[4]
          const ySensor = yCabo - distYSensores * sensorIdx
          
          sensores.push({ x: xCabo, y: ySensor, t, ativo })
          
          if (ativo && t !== -1000) {
            if (ySensor < nivelMaisAlto || nivelMaisAlto === 0) {
              nivelMaisAlto = ySensor
            }
          }
        })
      })

      // Criar mapa de níveis por cabo para contorno ondulado
      const niveisPorCabo = {}
      Object.entries(this.leitura).forEach(([, objSensores], idxCabo) => {
        const xCabo = posXUniforme === 0 ? posXCabo[idxCabo] : posXCabo[0] + posXCabo[1] * idxCabo
        let nivelMaisAltoNesteCabo = 0
        
        Object.entries(objSensores).forEach(([sensorKey, dadosSensor]) => {
          const sensorIdx = parseInt(sensorKey, 10)
          const t = parseFloat(dadosSensor[0])
          const ativo = dadosSensor[4]
          const ySensor = posYCabo[idxCabo] - distYSensores * sensorIdx
          
          if (ativo && t !== -1000) {
            if (ySensor < nivelMaisAltoNesteCabo || nivelMaisAltoNesteCabo === 0) {
              nivelMaisAltoNesteCabo = ySensor
            }
          }
        })
        
        niveisPorCabo[xCabo] = nivelMaisAltoNesteCabo
      })

      // Gerar grid de blocos
      const [largura, altura] = this.layout.tamanho_svg
      const isMobile = window.innerWidth < 768
      const resolucao = isMobile ? 160 : 240
      const wCell = largura / resolucao
      const hCell = altura / resolucao
      const blocos = []
      
      // Função IDW
      const idw = (cx, cy) => {
        let somaPesos = 0
        let somaTemp = 0
        const power = 2
        let temSensorAtivo = false

        sensores.forEach(({ x, y, t, ativo }) => {
          if (t === -1000 || !ativo) return
          temSensorAtivo = true
          const dist = Math.max(Math.hypot(x - cx, y - cy), 0.0001)
          const peso = 1 / Math.pow(dist, power)
          somaPesos += peso
          somaTemp += t * peso
        })

        if (!temSensorAtivo) return null
        return somaPesos === 0 ? -1000 : somaTemp / somaPesos
      }

      // Função para verificar se um ponto está na área com grão
      const temGraoNaPosicao = (cx, cy) => {
        const { hs } = this.layout.desenho_corte_silo
        
        // Encontrar os dois cabos mais próximos horizontalmente
        const cabosOrdenados = Object.keys(niveisPorCabo)
          .map(x => ({ x: parseFloat(x), nivel: niveisPorCabo[x] }))
          .sort((a, b) => a.x - b.x)
        
        if (cabosOrdenados.length === 0) return false
        
        let nivelInterpolado = 0
        
        if (cabosOrdenados.length === 1) {
          nivelInterpolado = cabosOrdenados[0].nivel
        } else {
          let caboEsquerda = cabosOrdenados[0]
          let caboDireita = cabosOrdenados[cabosOrdenados.length - 1]
          
          // Encontrar os cabos que cercam o ponto cx
          for (let i = 0; i < cabosOrdenados.length - 1; i++) {
            if (cx >= cabosOrdenados[i].x && cx <= cabosOrdenados[i + 1].x) {
              caboEsquerda = cabosOrdenados[i]
              caboDireita = cabosOrdenados[i + 1]
              break
            }
          }
          
          // Se cx está fora do range, usar o cabo mais próximo
          if (cx < cabosOrdenados[0].x) {
            nivelInterpolado = cabosOrdenados[0].nivel
          } else if (cx > cabosOrdenados[cabosOrdenados.length - 1].x) {
            nivelInterpolado = cabosOrdenados[cabosOrdenados.length - 1].nivel
          } else {
            // Interpolação linear entre os dois cabos
            const distTotal = caboDireita.x - caboEsquerda.x
            const distAtual = cx - caboEsquerda.x
            const fator = distTotal === 0 ? 0 : distAtual / distTotal
            
            nivelInterpolado = caboEsquerda.nivel + (caboDireita.nivel - caboEsquerda.nivel) * fator
          }
        }
        
        if (nivelInterpolado === 0) return false
        
        const margemSeguranca = 15
        return cy >= nivelInterpolado - margemSeguranca && cy <= hs
      }

      // Função para verificar se há sensores ativos na posição
      const temSensorAtivoNaPosicao = (cx, cy) => {
        const raioVerificacao = 50
        
        for (const sensor of sensores) {
          if (!sensor.ativo) continue
          
          const distancia = Math.hypot(sensor.x - cx, sensor.y - cy)
          if (distancia <= raioVerificacao) {
            return true
          }
        }
        
        return false
      }

      for (let i = 0; i < resolucao; i++) {
        for (let j = 0; j < resolucao; j++) {
          const cx = i * wCell + wCell / 2
          const cy = j * hCell + hCell / 2
          
          let cor
          if (temGraoNaPosicao(cx, cy) && temSensorAtivoNaPosicao(cx, cy)) {
            const tempInterpolada = idw(cx, cy)
            cor = tempInterpolada === null ? "#e7e7e7" : this.corFaixaExata(tempInterpolada)
          } else {
            cor = "#e7e7e7"
          }

          blocos.push({
            x: i * wCell,
            y: j * hCell,
            width: wCell,
            height: hCell,
            fill: cor
          })
        }
      }
      
      this.blocosMapaCalor = blocos
    },

    trocarModo() {
      this.carregandoModo = true
      setTimeout(() => {
        this.modo = this.modo === 'temperatura' ? 'mapa' : 'temperatura'
        this.carregandoModo = false
      }, 600)
    }
  }
}
</script>

<style scoped>
.svg-container {
  min-height: calc(100vh - 180px);
  max-height: calc(100vh - 140px);
}

@media (max-width: 768px) {
  .fs-4 {
    font-size: 1.1rem !important;
  }
  
  .svg-container {
    min-height: 300px;
    max-height: 400px;
  }
}
</style>
