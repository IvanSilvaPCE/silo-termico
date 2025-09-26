
<template>
  <div class="container-fluid p-1 p-md-2" style="min-height: 100vh; overflow: auto;">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-1 mb-md-2 fs-4 fs-md-1">Silo - Monitoramento de Temperatura</h1>

        <div v-if="carregandoModo" class="d-flex justify-content-center m-2">
          <div class="spinner-border" role="status">
            <span class="visually-hidden"></span>
          </div>
        </div>

        <div v-else>
          <div class="svg-container mb-1 mb-md-2" :style="{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 180px)',
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'auto'
          }">
            <!-- Vista de Topo Separada -->
            <TopoView v-if="(modo === 'topo' || modo === 'mapa-topo') && dados && leitura" 
                      :dados="dados" 
                      :leitura="leitura" 
                      :modoMapaCalor="modo === 'mapa-topo'" />
            
            <!-- SVG das outras vistas -->
            <svg v-else-if="dados && (modo === 'temperatura' || modo === 'mapa')" width="100%" height="auto" :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`" :style="{
              maxWidth: '100%',
              maxHeight: modo === 'temperatura' ? '70vh' : '85vh',
              height: 'auto',
              minHeight: modo === 'temperatura' ? '350px' : '400px',
              shapeRendering: 'auto',
              textRendering: 'geometricPrecision',
              imageRendering: 'optimizeQuality',
              fillRule: 'evenodd',
              clipRule: 'evenodd'
            }" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
              <g :transform="transformSilo">
                <!-- Fundo do Silo -->
                <g id="g_des_fundo">
                  <polygon fill="#E7E7E7" :points="pontosFundoSilo" />
                  <path fill="#999999"
                    d="M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z"
                    :transform="`scale(${layout.desenho_corte_silo.lb / 152}, ${layout.desenho_corte_silo.hb / 15})`" />
                  <ellipse fill="#999999" :cx="layout.desenho_corte_silo.lb / 2" :cy="layout.desenho_corte_silo.hs"
                    :rx="layout.desenho_corte_silo.lb / 2" :ry="layout.desenho_corte_silo.hb" />
                  <ellipse fill="#CCCCCC" :cx="layout.desenho_corte_silo.lb / 2"
                    :cy="layout.desenho_corte_silo.hs - layout.desenho_corte_silo.eb"
                    :rx="layout.desenho_corte_silo.lb / 2" :ry="layout.desenho_corte_silo.hb" />
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
                    <rect v-for="(bloco, index) in blocosMapaCalor" :key="`bloco-${index}`" :x="bloco.x" :y="bloco.y"
                      :width="bloco.width" :height="bloco.height" :fill="bloco.fill" />
                  </g>
                </g>

                <!-- Vista de Topo (modo topo) -->
                <!-- topo moved to TopoView --><g v-if="false">
                  <!-- Fundo circular do topo do silo -->
                  <defs>
                    <radialGradient id="topoGradient" gradientUnits="objectBoundingBox" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0" style="stop-color:whitesmoke"/>
                      <stop offset="1" style="stop-color:#999999"/>
                    </radialGradient>
                  </defs>
                  
                  <!-- Círculo principal do silo -->
                  <circle 
                    :cx="larguraSVGTopo / 2" 
                    :cy="alturaSVGTopo / 2" 
                    :r="raioSiloTopo" 
                    fill="url(#topoGradient)" 
                    stroke="#999999" 
                    stroke-width="1.7"
                  />
                  
                  <!-- Linhas divisórias radiais -->
                  <g stroke="#999999" stroke-width="0.85" opacity="0.7">
                    <line :x1="larguraSVGTopo / 2" :y1="alturaSVGTopo / 2 - raioSiloTopo" :x2="larguraSVGTopo / 2" :y2="alturaSVGTopo / 2 + raioSiloTopo" />
                    <line :x1="larguraSVGTopo / 2 - raioSiloTopo * Math.cos(Math.PI/4)" :y1="alturaSVGTopo / 2 - raioSiloTopo * Math.sin(Math.PI/4)" 
                          :x2="larguraSVGTopo / 2 + raioSiloTopo * Math.cos(Math.PI/4)" :y2="alturaSVGTopo / 2 + raioSiloTopo * Math.sin(Math.PI/4)" />
                    <line :x1="larguraSVGTopo / 2 - raioSiloTopo" :y1="alturaSVGTopo / 2" :x2="larguraSVGTopo / 2 + raioSiloTopo" :y2="alturaSVGTopo / 2" />
                    <line :x1="larguraSVGTopo / 2 - raioSiloTopo * Math.cos(Math.PI/4)" :y1="alturaSVGTopo / 2 + raioSiloTopo * Math.sin(Math.PI/4)" 
                          :x2="larguraSVGTopo / 2 + raioSiloTopo * Math.cos(Math.PI/4)" :y2="alturaSVGTopo / 2 - raioSiloTopo * Math.sin(Math.PI/4)" />
                  </g>
                  
                  <!-- Círculo central -->
                  <circle 
                    :cx="larguraSVGTopo / 2" 
                    :cy="alturaSVGTopo / 2" 
                    :r="raioSiloTopo * 0.2" 
                    fill="#E6E6E6" 
                    stroke="#999999" 
                    stroke-width="0.85"
                  />
                  
                  <!-- Círculo médio -->
                  <circle 
                    :cx="larguraSVGTopo / 2" 
                    :cy="alturaSVGTopo / 2" 
                    :r="raioSiloTopo * 0.55" 
                    fill="none" 
                    stroke="#999999" 
                    stroke-width="0.85"
                  />
                  
                  <!-- Pêndulos/Cabos como círculos coloridos -->
                  <g v-for="(posicao, index) in posicoesCabosTopo" :key="`cabo-topo-${index}`">
                    <circle 
                      :cx="posicao.x" 
                      :cy="posicao.y" 
                      :r="5.7" 
                      :fill="getCorMediaPendulo(posicao.pendulo)"
                      stroke="black" 
                      stroke-width="0.8"
                    />
                    <text 
                      :x="posicao.x" 
                      :y="posicao.y" 
                      text-anchor="middle" 
                      dominant-baseline="central" 
                      font-weight="bold" 
                      font-size="5" 
                      font-family="Arial"
                      :fill="getCorMediaPendulo(posicao.pendulo) === '#ff2200' ? 'white' : 'black'"
                    >
                      {{ posicao.label }}
                    </text>
                  </g>
                </g>

                <!-- Sensores (modo temperatura) -->
                <g v-if="modo === 'temperatura'">
                  <g v-for="(sensores, pend, penduloIndex) in leitura" :key="`cabo-${pend}`">
                    <!-- Nome do pêndulo -->
                    <rect :id="`C${pend}`" :x="getBaseX(penduloIndex)" :y="getYPendulo(penduloIndex)"
                      :width="layout.desenho_sensores.escala_sensores"
                      :height="layout.desenho_sensores.escala_sensores / 2" rx="2" ry="2" fill="#3A78FD" />
                    <text :id="`TC${pend}`" :x="getBaseX(penduloIndex) + layout.desenho_sensores.escala_sensores / 2"
                      :y="getYPendulo(penduloIndex) + layout.desenho_sensores.escala_sensores / 4" text-anchor="middle"
                      dominant-baseline="central" font-weight="bold"
                      :font-size="layout.desenho_sensores.escala_sensores * 0.4 - 0.5" font-family="Arial" fill="white">
                      {{ pend }}
                    </text>

                    <!-- Sensores individuais -->
                    <g v-for="(valores, sensorKey) in sensores" :key="`sensor-${pend}-${sensorKey}`">
                      <g v-for="sensor in [parseInt(sensorKey)]" :key="`s-${sensor}`">
                        <!-- Nome do sensor -->
                        <text :id="`TIND${pend}S${sensor}`"
                          :x="layout.desenho_sensores.nome_sensores_direita === 0 ? getBaseX(penduloIndex) - 2 : getBaseX(penduloIndex) + layout.desenho_sensores.escala_sensores + 2"
                          :y="getBaseY(penduloIndex) + (layout.desenho_sensores.escala_sensores / 2) / 2 - layout.desenho_sensores.dist_y_sensores * sensor"
                          :text-anchor="layout.desenho_sensores.nome_sensores_direita === 0 ? 'end' : 'start'"
                          dominant-baseline="central" font-weight="bold"
                          :font-size="layout.desenho_sensores.escala_sensores * 0.4 - 1.5" font-family="Arial"
                          fill="black">
                          S{{ sensor }}
                        </text>

                        <!-- Retângulo do sensor -->
                        <rect :id="`C${pend}S${sensor}`" :x="getBaseX(penduloIndex)" :y="getYSensor(penduloIndex, sensor)"
                          :width="layout.desenho_sensores.escala_sensores"
                          :height="layout.desenho_sensores.escala_sensores / 2" rx="2" ry="2"
                          :fill="getSensorColor(valores)" stroke="black" :stroke-width="valores[1] ? 0.6 : 0.25" />

                        <!-- Texto do sensor -->
                        <text :id="`TC${pend}S${sensor}`"
                          :x="getBaseX(penduloIndex) + layout.desenho_sensores.escala_sensores / 2"
                          :y="getYSensor(penduloIndex, sensor) + (layout.desenho_sensores.escala_sensores / 2) / 2"
                          text-anchor="middle" dominant-baseline="central" font-weight="bold"
                          :font-size="layout.desenho_sensores.escala_sensores * 0.4 - 0.5" font-family="Arial"
                          :fill="getSensorColor(valores) === '#ff2200' ? 'white' : 'black'">
                          {{ getSensorText(valores) }}
                        </text>

                        <!-- Overlay de erro -->
                        <rect v-if="valores[3]" :id="`FC${pend}S${sensor}`" :x="getBaseX(penduloIndex) - 0.5"
                          :y="getYSensor(penduloIndex, sensor) - 0.5" :width="layout.desenho_sensores.escala_sensores + 1"
                          :height="layout.desenho_sensores.escala_sensores / 2 + 1" rx="2" ry="2" fill="red"
                          fill-opacity="0.6" />
                      </g>
                    </g>
                  </g>
                </g>
              </g>

              <!-- Aeradores (apenas nos modos lateral e mapa) -->
              <g v-if="layout.aeradores && layout.aeradores.na > 0 && (modo === 'temperatura' || modo === 'mapa')">
                <g v-for="id in layout.aeradores.na" :key="`aerador-${id}`" :id="`aerador_${id}`"
                  :transform="getTransformAerador(id)">
                  <circle :id="`fundo_aerador_${id}`" :cx="70 + 12.5 + 3.5" cy="24" r="10" :fill="getCorAerador(id)" />
                  <rect x="73" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
                  <text :x="70 + 12.5 + 3.5" y="7" text-anchor="middle" dominant-baseline="central" font-weight="bold"
                    font-size="6.5" font-family="Arial" fill="white">
                    AE-{{ id }}
                  </text>

                  <!-- Pás do aerador -->
                  <g v-if="getStatusAerador(id) === 3" :style="{ visibility: 'visible' }">
                    <animateTransform attributeName="transform" type="rotate" dur="2s"
                      values="0 86.35 24.05; 360 86.35 24.05;" repeatCount="indefinite" />
                    <path v-for="angle in [0, 60, 120, 180, 240, 300]" :key="`blade-girando-${id}-${angle}`" :d="dBlade"
                      fill="white" :transform="angle === 0 ? undefined : `rotate(${angle},86.35,24.05)`" />
                  </g>
                  <g v-else :style="{ visibility: 'visible' }">
                    <path v-for="angle in [0, 60, 120, 180, 240, 300]" :key="`blade-parado-${id}-${angle}`" :d="dBlade"
                      fill="white" :transform="angle === 0 ? undefined : `rotate(${angle},86.35,24.05)`" />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>

        

        <!-- Navegação de Sensores - Apenas no modo mapa-topo -->
        <div v-if="modo === 'mapa-topo'" class="row mb-3">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <button class="btn btn-outline-primary" @click="navegarSensor('anterior')" :disabled="sensorAtual === 0">
                <i class="fa fa-chevron-left"></i> Anterior
              </button>
              <div class="text-center flex-grow-1">
                <h6 class="mb-0">
                  Sensor {{ sensorAtual }} - {{ getNomeSensor(sensorAtual) }} - Média: {{ getMediaSensor(sensorAtual) }}
                </h6>
              </div>
              <button class="btn btn-outline-primary" @click="navegarSensor('proxima')" :disabled="sensorAtual >= totalSensores - 1">
                Próxima <i class="fa fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center py-4">
          <div class="custom-button-group" role="group" aria-label="Modos de visualização">
            <button 
              class="custom-mode-btn" 
              :class="{ 'active': modo === 'temperatura' }"
              @click="setModo('temperatura')"
            >
              <i class="fa fa-bar-chart"></i>
              <span>Lateral</span>
            </button>
            <button 
              class="custom-mode-btn" 
              :class="{ 'active': modo === 'mapa' }"
              @click="setModo('mapa')"
            >
              <i class="fa fa-fire"></i>
              <span>Mapa Térmico Lateral</span>
            </button>
            <button 
              class="custom-mode-btn" 
              :class="{ 'active': modo === 'topo' }"
              @click="setModo('topo')"
            >
              <i class="fa fa-circle-o"></i>
              <span>Topo</span>
            </button>
            <button 
              class="custom-mode-btn" 
              :class="{ 'active': modo === 'mapa-topo' }"
              @click="setModo('mapa-topo')"
            >
              <i class="fa fa-bullseye"></i>
              <span>Mapa Térmico Topo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopoView from './TopoView.vue'

export default {
  name: 'Silo2D',
  components: {
    TopoView
  },
  data() {
    return {
      modo: 'temperatura',
      carregandoModo: false,
      dados: null,
      blocosMapaCalor: [],
      dBlade: "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z",
      configuracaoSelecionada: '',
      configuracoesDisponiveis: [],
      sensorAtual: 0
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
    },

    // Propriedades computadas para vista de topo
    larguraSVGTopo() {
      return 300
    },

    alturaSVGTopo() {
      return 300
    },

    raioSiloTopo() {
      return 120
    },

    posicoesCabosTopo() {
      if (!this.leitura) return []
      
      const cabos = Object.keys(this.leitura)
      const numCabos = cabos.length
      const centro = { x: this.larguraSVGTopo / 2, y: this.alturaSVGTopo / 2 }
      const raioCirculo = this.raioSiloTopo * 0.7 // Posicionar cabos a 70% do raio
      
      return cabos.map((cabo, index) => {
        const angulo = (2 * Math.PI * index) / numCabos - Math.PI / 2 // Começar no topo
        const x = centro.x + raioCirculo * Math.cos(angulo)
        const y = centro.y + raioCirculo * Math.sin(angulo)
        
        return {
          x,
          y,
          pendulo: cabo,
          label: cabo,
          index
        }
      })
    },

    totalSensores() {
      if (!this.leitura) return 0
      let maxSensor = 0
      Object.values(this.leitura).forEach(sensores => {
        const sensorNums = Object.keys(sensores).map(k => parseInt(k))
        if (sensorNums.length > 0) {
          maxSensor = Math.max(maxSensor, Math.max(...sensorNums))
        }
      })
      return maxSensor + 1
    }
  },
  mounted() {
    this.carregarDados()
    this.carregarConfiguracoesDisponiveis()
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
        // Carregar dados do arquivo rotaSilo.json usando import
        const dadosRotaSilo = await import('./rotaSilo.json')
        const dadosReais = dadosRotaSilo.default || dadosRotaSilo

        // Reorganizar os dados para usar a sequência de pêndulos
        const sequenciaPendulos = dadosReais.configuracao.sequencia_pendulos
        const pendulosOriginais = dadosReais.pendulos

        // Reorganizar leitura baseada na sequência
        const leituraOrganizada = {}
        sequenciaPendulos.forEach(numeroPendulo => {
          const chavePendulo = `P${numeroPendulo}`
          if (pendulosOriginais[chavePendulo]) {
            leituraOrganizada[chavePendulo] = pendulosOriginais[chavePendulo]
          }
        })

        // Montar estrutura de dados compatível
        this.dados = {
          dados_layout: dadosReais.configuracao,
          leitura: leituraOrganizada,
          motor: { statusMotor: [] } // Adicionar dados de motor se necessário
        }

      } catch (error) {
        console.error('Erro ao carregar dados do rotaSilo.json:', error)
        // Fallback para dados básicos se houver erro
        this.dados = {
          dados_layout: {
            tamanho_svg: [525, 188],
            desenho_corte_silo: { lb: 463, hs: 163, hb: 25, eb: 3 },
            desenho_sensores: {
              escala_sensores: 16,
              dist_y_sensores: 12,
              pos_y_cabo: [152],
              pos_x_cabo: [9, 30],
              pos_x_cabos_uniforme: 1,
              nome_sensores_direita: 0,
              nome_cabo_acima: 0,
              dist_y_nome_cabo: [0]
            },
            aeradores: { na: 4, ds: -4, dy: 0, da: 0 }
          },
          leitura: {},
          motor: { statusMotor: [] }
        }
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
      // Se não tem grão (último item false), cor cinza
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
      const lb = this.layout.desenho_corte_silo.lb

      if (posXUniforme === 0) {
        // Usar posições específicas do layout
        return posXCabo[idxCabo] || 0
      } else {
        // Distribuição uniforme melhorada baseada no React
        const offsetInicial = posXCabo[0] || 9 // Offset inicial
        const distEntreCabos = posXCabo[1] || 30 // Distância entre cabos

        // Calcular a largura total ocupada pelos cabos
        const larguraTotalCabos = (nCabos - 1) * distEntreCabos + escala

        // Se a largura total for menor que a largura do silo, centralizar
        if (larguraTotalCabos < lb) {
          const margemCentralizacao = (lb - larguraTotalCabos) / 2
          return margemCentralizacao + idxCabo * distEntreCabos
        } else {
          // Se não couber, usar o offset inicial
          return offsetInicial + idxCabo * distEntreCabos
        }
      }
    },

    getBaseY(idxCabo) {
      if (!this.layout.desenho_sensores) return 0
      const ds = this.layout.desenho_sensores
      return ds.pos_y_cabo[idxCabo] || ds.pos_y_cabo[0] || 160
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
        const xCabo = this.getBaseX(idxCabo) + ds.escala_sensores / 2
        const yCabo = posYCabo[idxCabo]
        Object.entries(objSensores).forEach(([sensorKey, dadosSensor]) => {
          const sensorIdx = parseInt(sensorKey, 10)
          const t = parseFloat(dadosSensor[0])
          const temGrao = dadosSensor[4] // Último item indica se tem grão
          const ySensor = yCabo - distYSensores * sensorIdx

          sensores.push({ x: xCabo, y: ySensor, t, ativo: temGrao })

          if (temGrao && t !== -1000) {
            if (ySensor < nivelMaisAlto || nivelMaisAlto === 0) {
              nivelMaisAlto = ySensor
            }
          }
        })
      })

      // Criar mapa de níveis por cabo para contorno ondulado com interpolação para cabos com erro
      const niveisPorCabo = {}
      const cabosComErro = []
      
      // Primeiro passo: identificar cabos válidos e com erro
      Object.entries(this.leitura).forEach(([, objSensores], idxCabo) => {
        const xCabo = this.getBaseX(idxCabo) + ds.escala_sensores / 2
        let nivelMaisAltoNesteCabo = 0
        let caboComErro = false

        // Verificar se o cabo tem erro (temperatura 0 ou todos sensores com falha)
        const sensoresComErro = Object.values(objSensores).filter(sensor => 
          parseFloat(sensor[0]) === 0 || sensor[3] === true
        )
        
        caboComErro = sensoresComErro.length === Object.keys(objSensores).length

        if (!caboComErro) {
          Object.entries(objSensores).forEach(([sensorKey, dadosSensor]) => {
            const sensorIdx = parseInt(sensorKey, 10)
            const t = parseFloat(dadosSensor[0])
            const temGrao = dadosSensor[4] // Último item indica se tem grão
            const ySensor = posYCabo[idxCabo] - distYSensores * sensorIdx

            if (temGrao && t !== -1000 && t !== 0) {
              if (ySensor < nivelMaisAltoNesteCabo || nivelMaisAltoNesteCabo === 0) {
                nivelMaisAltoNesteCabo = ySensor
              }
            }
          })
          
          niveisPorCabo[xCabo] = nivelMaisAltoNesteCabo
        } else {
          cabosComErro.push({ xCabo, idxCabo })
        }
      })

      // Segundo passo: interpolar cabos com erro
      cabosComErro.forEach(({ xCabo, idxCabo }) => {
        const cabosOrdenados = Object.keys(niveisPorCabo)
          .map(x => ({ x: parseFloat(x), nivel: niveisPorCabo[x] }))
          .sort((a, b) => a.x - b.x)

        if (cabosOrdenados.length >= 2) {
          // Encontrar cabos anterior e posterior válidos
          let caboAnterior = null
          let caboPosterior = null

          for (let i = 0; i < cabosOrdenados.length; i++) {
            if (cabosOrdenados[i].x < xCabo) {
              caboAnterior = cabosOrdenados[i]
            }
            if (cabosOrdenados[i].x > xCabo && !caboPosterior) {
              caboPosterior = cabosOrdenados[i]
              break
            }
          }

          // Interpolar o nível
          let nivelInterpolado = 0
          if (caboAnterior && caboPosterior) {
            // Interpolação linear entre anterior e posterior
            const distTotal = caboPosterior.x - caboAnterior.x
            const distAtual = xCabo - caboAnterior.x
            const fator = distTotal === 0 ? 0 : distAtual / distTotal
            nivelInterpolado = caboAnterior.nivel + (caboPosterior.nivel - caboAnterior.nivel) * fator
          } else if (caboAnterior) {
            // Usar só o anterior se não há posterior
            nivelInterpolado = caboAnterior.nivel
          } else if (caboPosterior) {
            // Usar só o posterior se não há anterior
            nivelInterpolado = caboPosterior.nivel
          }

          niveisPorCabo[xCabo] = nivelInterpolado
        }
      })

      // Gerar grid de blocos
      const [largura, altura] = this.layout.tamanho_svg
      const isMobile = window.innerWidth < 768
      const resolucao = isMobile ? 160 : 240
      const wCell = largura / resolucao
      const hCell = altura / resolucao
      const blocos = []

      // Criar sensores interpolados para cabos com erro
      const sensoresInterpolados = [...sensores]
      
      cabosComErro.forEach(({ xCabo, idxCabo }) => {
        const yCabo = posYCabo[idxCabo]
        const sensoresOriginais = Object.entries(Object.values(this.leitura)[idxCabo] || {})

        sensoresOriginais.forEach(([sensorKey, dadosSensor]) => {
          const sensorIdx = parseInt(sensorKey, 10)
          const ySensor = yCabo - distYSensores * sensorIdx
          
          // Encontrar sensores válidos na mesma altura em outros cabos
          const sensoresNaMesmaAltura = sensores.filter(sensor => 
            Math.abs(sensor.y - ySensor) <= distYSensores / 2 && 
            sensor.ativo && 
            sensor.t !== 0 && 
            sensor.t !== -1000
          )

          if (sensoresNaMesmaAltura.length >= 2) {
            // Calcular temperatura média dos sensores válidos na mesma altura
            const tempMedia = sensoresNaMesmaAltura.reduce((acc, sensor) => acc + sensor.t, 0) / sensoresNaMesmaAltura.length
            
            // Adicionar sensor interpolado
            sensoresInterpolados.push({
              x: xCabo,
              y: ySensor,
              t: tempMedia,
              ativo: true
            })
          } else if (sensoresNaMesmaAltura.length === 1) {
            // Se só há um sensor válido, usar sua temperatura
            sensoresInterpolados.push({
              x: xCabo,
              y: ySensor,
              t: sensoresNaMesmaAltura[0].t,
              ativo: true
            })
          }
        })
      })

      // Função IDW usando sensores interpolados
      const idw = (cx, cy) => {
        let somaPesos = 0
        let somaTemp = 0
        const power = 2
        let temSensorAtivo = false

        sensoresInterpolados.forEach(({ x, y, t, ativo }) => {
          if (t === -1000 || !ativo || t === 0) return
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

    setModo(novoModo) {
      if (this.modo === novoModo) return
      this.carregandoModo = true
      setTimeout(() => {
        this.modo = novoModo
        this.carregandoModo = false
      }, 200)
    },

    trocarModo() {
      // Manter compatibilidade com código anterior
      const modos = ['temperatura', 'mapa', 'topo']
      const indexAtual = modos.indexOf(this.modo)
      const proximoIndex = (indexAtual + 1) % modos.length
      this.setModo(modos[proximoIndex])
    },

    carregarConfiguracoesDisponiveis() {
      const prefixo = 'configSilo_'
      const configs = []

      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const chave = localStorage.key(i)
          if (chave && chave.startsWith(prefixo)) {
            const nome = chave.replace(prefixo, '')
            configs.push(nome)
          }
        }
      }

      this.configuracoesDisponiveis = configs.sort()
    },

    aplicarConfiguracao() {
      if (!this.configuracaoSelecionada) {
        // Voltar para configuração padrão
        this.carregarDados()
        return
      }

      if (typeof localStorage !== 'undefined') {
        const chave = `configSilo_${this.configuracaoSelecionada}`
        const configSalva = localStorage.getItem(chave)

        if (configSalva) {
          try {
            const configData = JSON.parse(configSalva)
            
            // Aplicar configuração carregada aos dados atuais
            if (this.dados && this.dados.dados_layout) {
              // Mesclar configuração salva com dados existentes
              this.dados.dados_layout = {
                ...this.dados.dados_layout,
                ...configData,
                // Manter estrutura de SVG se existir
                tamanho_svg: this.dados.dados_layout.tamanho_svg || [525, 188]
              }
            }

            console.log(`Configuração "${this.configuracaoSelecionada}" aplicada ao silo`)
          } catch (error) {
            console.error('Erro ao aplicar configuração:', error)
            alert('Erro ao carregar configuração. Verifique se o arquivo está correto.')
          }
        } else {
          alert('Configuração não encontrada!')
          this.configuracaoSelecionada = ''
        }
      }
    },

    abrirModelador() {
      // Preparar dados para o modelador
      if (typeof localStorage !== 'undefined') {
        const dadosParaModelador = {
          tipoAtivo: 'silo',
          configuracaoAtual: this.dados?.dados_layout || null,
          origem: 'silo_preview',
          timestamp: new Date().getTime()
        }

        localStorage.setItem('dadosModeladorSilo', JSON.stringify(dadosParaModelador))
        localStorage.setItem('timestampModeladorSilo', dadosParaModelador.timestamp.toString())
      }

      // Navegar para o modelador ou abrir em nova aba
      if (this.$router) {
        this.$router.push({ 
          name: 'ModeladorSVG',
          query: { 
            tipo: 'silo',
            origem: 'preview'
          }
        })
      } else {
        // Fallback - abrir em nova aba se não há roteamento
        window.open('/modelador?tipo=silo&origem=preview', '_blank')
      }
    },

    // Método para calcular a média de temperatura por pêndulo
    getMediaTemperaturaPendulo(pendulo) {
      if (!this.leitura[pendulo]) return 0
      
      const sensores = Object.values(this.leitura[pendulo])
      const temperaturas = sensores
        .filter(sensor => {
          const temp = parseFloat(sensor[0])
          const temGrao = sensor[4]
          const temFalha = sensor[3]
          return !temFalha && temGrao && temp !== -1000 && temp !== 0
        })
        .map(sensor => parseFloat(sensor[0]))
      
      if (temperaturas.length === 0) return 0
      
      const soma = temperaturas.reduce((acc, temp) => acc + temp, 0)
      return soma / temperaturas.length
    },

    // Método para obter a cor baseada na média de temperatura do pêndulo
    getCorMediaPendulo(pendulo) {
      const mediaTemp = this.getMediaTemperaturaPendulo(pendulo)
      
      if (mediaTemp === 0) return "#e7e7e7" // Cinza para sem dados
      
      return this.corFaixaExata(mediaTemp)
    },

    // Navegação de sensores
    navegarSensor(direcao) {
      if (direcao === 'anterior' && this.sensorAtual > 0) {
        this.sensorAtual--
      } else if (direcao === 'proxima' && this.sensorAtual < this.totalSensores - 1) {
        this.sensorAtual++
      }
    },

    // Obter nome do sensor baseado no nível
    getNomeSensor(sensorNum) {
      const niveis = {
        0: 'Topo (1º nível)',
        1: '2º nível',
        2: '3º nível', 
        3: '4º nível',
        4: '5º nível',
        5: '6º nível',
        6: '7º nível',
        7: '8º nível',
        8: 'Base (9º nível)'
      }
      return niveis[sensorNum] || `${sensorNum + 1}º nível`
    },

    // Calcular média do sensor específico em todos os pêndulos
    getMediaSensor(sensorNum) {
      if (!this.leitura) return 'N/A'
      
      const temperaturas = []
      Object.values(this.leitura).forEach(sensores => {
        if (sensores[sensorNum]) {
          const temp = parseFloat(sensores[sensorNum][0])
          const temGrao = sensores[sensorNum][4]
          const temFalha = sensores[sensorNum][3]
          
          if (!temFalha && temGrao && temp !== -1000 && temp !== 0) {
            temperaturas.push(temp)
          }
        }
      })

      if (temperaturas.length === 0) return 'N/A'
      
      const media = temperaturas.reduce((acc, temp) => acc + temp, 0) / temperaturas.length
      return `${media.toFixed(1)}°C`
    }
  }
}
</script>

<style scoped>
.svg-container {
  min-height: calc(100vh - 180px);
  max-height: calc(100vh - 140px);
}

.custom-button-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 16px;
}

.custom-mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  height: 90px;
  padding: 16px 24px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #ffffff;
  border-radius: 16px;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  font-weight: 600;
  color: #495057;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.custom-mode-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.custom-mode-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 12px 35px rgba(0, 123, 255, 0.15),
    0 4px 15px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: #007bff;
}

.custom-mode-btn:hover::before {
  opacity: 1;
}

.custom-mode-btn:active {
  transform: translateY(-2px) scale(1.01);
  transition: all 0.1s ease;
}

.custom-mode-btn.active {
  background: linear-gradient(145deg, #007bff 0%, #0056b3 100%);
  border-color: #0056b3;
  color: #ffffff;
  box-shadow: 
    0 10px 30px rgba(0, 123, 255, 0.4),
    0 4px 15px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.custom-mode-btn.active::before {
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
  opacity: 1;
}

.custom-mode-btn i {
  font-size: 26px;
  margin-bottom: 10px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.custom-mode-btn span {
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  line-height: 1.3;
  letter-spacing: 0.5px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
}

.custom-mode-btn:not(.active) i,
.custom-mode-btn:not(.active) span {
  color: #495057;
  opacity: 1;
  visibility: visible;
}

.custom-mode-btn:not(.active):hover i,
.custom-mode-btn:not(.active):hover span {
  color: #007bff;
  text-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
}

.custom-mode-btn.active i,
.custom-mode-btn.active span {
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .fs-4 {
    font-size: 1.1rem !important;
  }

  .svg-container {
    min-height: 300px;
    max-height: 400px;
  }

  .custom-button-group {
    gap: 16px;
    padding: 12px;
  }

  .custom-mode-btn {
    min-width: 120px;
    height: 80px;
    padding: 12px 18px;
  }

  .custom-mode-btn i {
    font-size: 22px;
    margin-bottom: 8px;
  }

  .custom-mode-btn span {
    font-size: 10px;
    line-height: 1.2;
  }
}

@media (max-width: 576px) {
  .custom-button-group {
    gap: 12px;
    padding: 8px;
  }

  .custom-mode-btn {
    min-width: 100px;
    height: 70px;
    padding: 10px 15px;
    border-radius: 12px;
  }

  .custom-mode-btn i {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .custom-mode-btn span {
    font-size: 9px;
    line-height: 1.1;
  }
}
</style>
