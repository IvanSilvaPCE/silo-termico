<template>
  <div class="topo-view-container">
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      xml:space="preserve"
      width="100%"
      height="auto"
      version="1.0"
      :viewBox="`0 0 ${largura} ${altura}`"
      :style="{
        maxWidth: '100%',
        maxHeight: '80vh',
        height: 'auto',
        minHeight: '400px',
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        imageRendering: 'optimizeQuality',
        fillRule: 'evenodd',
        clipRule: 'evenodd'
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
      <g id="desenho_fundo">
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

        <!-- Linhas laterais (indicador de nível) -->
        <g v-if="mostrarIndicadorNivel" stroke="gray" stroke-width="0.8465" stroke-linecap="round" stroke-miterlimit="22.9256" fill="none">
          <line :x1="largura - 10" :y1="centroY - 2.5" :x2="centroX + raioSilo * 0.6" :y2="centroY - 2.5" />
          <line :x1="largura - 10" :y1="centroY + 2.5" :x2="centroX + raioSilo * 0.6" :y2="centroY + 2.5" />
          <!-- Pequenas divisões verticais -->
          <g v-for="i in 20" :key="`divisao-${i}`">
            <line 
              :x1="(centroX + raioSilo * 0.6) + (largura - 10 - (centroX + raioSilo * 0.6)) * (i - 1) / 19" 
              :y1="centroY - 2.5" 
              :x2="(centroX + raioSilo * 0.6) + (largura - 10 - (centroX + raioSilo * 0.6)) * (i - 1) / 19" 
              :y2="centroY + 2.5" 
            />
          </g>
        </g>
      </g>

      <!-- Mapa térmico por camadas -->
      <g v-if="modoMapaCalor">
        <defs>
          <filter id="blurFilterTopo">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <clipPath id="clipSiloTopo">
            <circle :cx="centroX" :cy="centroY" :r="raioSilo" />
          </clipPath>
        </defs>
        <g filter="url(#blurFilterTopo)" clip-path="url(#clipSiloTopo)">
          <rect 
            v-for="(bloco, index) in blocosMapaCalorTopo" 
            :key="`bloco-topo-${index}`" 
            :x="bloco.x" 
            :y="bloco.y"
            :width="bloco.width" 
            :height="bloco.height" 
            :fill="bloco.fill" 
          />
        </g>
      </g>

      <!-- Cabos/Pêndulos posicionados (apenas no modo normal) -->
      <g v-if="!modoMapaCalor" v-for="(cabo, index) in cabosComPosicao" :key="`cabo_${index + 1}`" :id="`cabo_${index + 1}`" :transform="cabo.transform">
        <!-- Círculo de pulso (animação quando há problema) -->
        <circle 
          v-if="temProblema(cabo.pendulo)"
          fill="red" 
          :cx="centroX" 
          :cy="centroY" 
          r="8"
        >
          <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
        </circle>

        <!-- Círculo principal do cabo -->
        <circle 
          :cx="centroX" 
          :cy="centroY" 
          r="5.7138"
          :fill="getCorMediaPendulo(cabo.pendulo)"
          stroke="black" 
          stroke-width="0.8"
          :title="`Pêndulo ${cabo.label} - Temp. Média: ${getTemperaturaMediaPendulo(cabo.pendulo)}°C`"
        />

        <!-- Texto do cabo -->
        <text 
          :x="centroX" 
          :y="centroY"  
          class="cabo-text" 
          text-anchor="middle" 
          dominant-baseline="central"
          :fill="getCorTexto(getCorMediaPendulo(cabo.pendulo))"
        >
          {{ cabo.label }}
        </text>

        <!-- Círculo de falha (overlay vermelho quando há erro) -->
        <circle 
          v-if="temFalha(cabo.pendulo)"
          fill="red" 
          :cx="centroX" 
          :cy="centroY" 
          r="7" 
          fill-opacity="0.6"
        />
      </g>
      

    </svg>

    <!-- Navegação de camadas (só aparece quando mapa de calor está ativo) -->
    <div v-if="modoMapaCalor && camadasPorProfundidade.length > 0" class="navegacao-camadas">
      <button 
        class="btn-navegacao anterior"
        @click="anteriorCamada"
      >
        ← Anterior
      </button>
      
      <div class="info-camada">
        <small>{{ camadaAtualInfo }}</small>
      </div>
      
      <button 
        class="btn-navegacao proxima"
        @click="proximaCamada"
      >
        Próxima →
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopoView',
  props: {
    dados: {
      type: Object,
      required: true
    },
    leitura: {
      type: Object,
      required: true
    },
    modoMapaCalor: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      largura: 138,
      altura: 134,
      mostrarIndicadorNivel: true,
      camadaAtual: 0
    }
  },
  computed: {
    centroX() {
      return 68.7343 // Centro X conforme o SVG original
    },
    centroY() {
      return 66.5965 // Centro Y conforme o SVG original
    },
    raioSilo() {
      return 65.75 // Raio do silo conforme o SVG original
    },
    pathCirculoSilo() {
      // Path do círculo do silo baseado no SVG original
      return "M66.5965 0.8465c34.2065,0 62.3078,26.1228 65.453,59.5066l1.6233 0c1.6221,0 2.9493,1.3271 2.9493,2.9493l0 6.2908c0,1.6221 -1.3271,2.9493 -2.9493,2.9493l-1.597 0c-3.0059,33.5258 -31.1715,59.804 -65.4794,59.804 -36.3127,0 -65.75,-29.4373 -65.75,-65.75 0,-36.3127 29.4373,-65.75 65.75,-65.75z"
    },
    numeroDeCapbos() {
      if (!this.leitura) return 0
      return Object.keys(this.leitura).length
    },
    cabosComPosicao() {
      if (!this.leitura || Object.keys(this.leitura).length === 0) return []

      const cabos = Object.keys(this.leitura)

      // Analisar número de sensores para cada cabo
      const cabosComSensores = cabos.map(pendulo => {
        const numSensores = Object.keys(this.leitura[pendulo]).length
        return {
          pendulo: pendulo,
          label: pendulo,
          numSensores: numSensores
        }
      })

      // Ordenar por número de sensores (decrescente) para facilitar agrupamento
      cabosComSensores.sort((a, b) => b.numSensores - a.numSensores)

      // Encontrar quantidades únicas de sensores para criar grupos
      const quantidadesUnicas = [...new Set(cabosComSensores.map(c => c.numSensores))].sort((a, b) => b - a)

      // Separar em 3 níveis baseado na quantidade de sensores
      let gruposCabos = {
        centro: [],    // Cabos com mais sensores
        meio: [],      // Cabos com quantidade intermediária
        externo: []    // Cabos com menos sensores
      }

      if (quantidadesUnicas.length === 1) {
        // Se todos têm a mesma quantidade, distribui no círculo médio
        gruposCabos.meio = [...cabosComSensores]
      } else if (quantidadesUnicas.length === 2) {
        // Se há 2 quantidades diferentes: maior no centro, menor no externo
        gruposCabos.centro = cabosComSensores.filter(c => c.numSensores === quantidadesUnicas[0])
        gruposCabos.externo = cabosComSensores.filter(c => c.numSensores === quantidadesUnicas[1])
      } else {
        // Se há 3 ou mais quantidades: maior no centro, menor no externo, resto no meio
        const maiorQuantidade = quantidadesUnicas[0]
        const menorQuantidade = quantidadesUnicas[quantidadesUnicas.length - 1]

        gruposCabos.centro = cabosComSensores.filter(c => c.numSensores === maiorQuantidade)
        gruposCabos.externo = cabosComSensores.filter(c => c.numSensores === menorQuantidade)
        gruposCabos.meio = cabosComSensores.filter(c => 
          c.numSensores !== maiorQuantidade && c.numSensores !== menorQuantidade
        )
      }

      const resultado = []
      let indiceGlobal = 1

      // Função para ordenar numericamente os pêndulos (P1, P2, P3, etc.)
      const ordenarNumericamente = (cabos) => {
        return cabos.sort((a, b) => {
          const numA = parseInt(a.pendulo.replace('P', ''))
          const numB = parseInt(b.pendulo.replace('P', ''))
          return numA - numB
        })
      }

      // Ordenar cada grupo numericamente
      gruposCabos.centro = ordenarNumericamente(gruposCabos.centro)
      gruposCabos.meio = ordenarNumericamente(gruposCabos.meio)
      gruposCabos.externo = ordenarNumericamente(gruposCabos.externo)

      // Posicionar primeiro grupo externo (cabos laterais) - cada grupo tem sua própria distribuição circular
      gruposCabos.externo.forEach((cabo, index) => {
        resultado.push({
          ...cabo,
          transform: this.calcularTransformCircularIndependente('externo', index, gruposCabos.externo.length),
          index: indiceGlobal++,
          nivel: 'externo'
        })
      })

      // Posicionar segundo grupo do meio (intermediários) - novo círculo independente
      gruposCabos.meio.forEach((cabo, index) => {
        resultado.push({
          ...cabo,
          transform: this.calcularTransformCircularIndependente('meio', index, gruposCabos.meio.length),
          index: indiceGlobal++,
          nivel: 'meio'
        })
      })

      // Posicionar por último grupo do centro (central)
      gruposCabos.centro.forEach((cabo, index) => {
        let transform
        if (gruposCabos.centro.length === 1) {
          // Cabo central único sempre fica no centro geométrico
          transform = this.polarParaRetangular(0, 0)
        } else {
          // Múltiplos cabos centrais têm seu próprio círculo independente
          transform = this.calcularTransformCircularIndependente('centro', index, gruposCabos.centro.length)
        }

        resultado.push({
          ...cabo,
          transform: transform,
          index: indiceGlobal++,
          nivel: 'centro'
        })
      })

      return resultado
    },

    // Propriedades para mapa de calor térmico por camadas de profundidade
    camadasPorProfundidade() {
      if (!this.leitura) return []

      // Encontrar o número máximo de sensores para definir as camadas
      const cabos = Object.keys(this.leitura)
      let maxSensores = 0
      
      cabos.forEach(pendulo => {
        const numSensores = Object.keys(this.leitura[pendulo]).length
        if (numSensores > maxSensores) {
          maxSensores = numSensores
        }
      })

      // Criar camadas de 0 até maxSensores-1 (índices dos sensores)
      // Sensor 0 = Topo, Sensor 1 = 2º nível, etc.
      const camadas = []
      for (let camadaIndex = 0; camadaIndex < maxSensores; camadaIndex++) {
        let nomeCamada
        if (camadaIndex === 0) {
          nomeCamada = 'Topo (1º nível)'
        } else {
          nomeCamada = `${camadaIndex + 1}º nível`
        }
        
        camadas.push({
          indice: camadaIndex,
          nome: `Sensor ${camadaIndex} - ${nomeCamada}`,
          profundidade: camadaIndex + 1,
          cor: this.getCorCamada(camadaIndex)
        })
      }

      return camadas
    },

    // Blocos do mapa térmico para a camada atual
    blocosMapaCalorTopo() {
      if (!this.modoMapaCalor || !this.camadasPorProfundidade.length) return []

      const camadaAtual = this.camadasPorProfundidade[this.camadaAtual]
      const sensorIndex = camadaAtual.indice

      // Coletar dados de temperatura para esta camada específica
      const dadosTemperatura = []
      const posicoesCabos = this.cabosComPosicao

      posicoesCabos.forEach(cabo => {
        if (this.leitura[cabo.pendulo] && this.leitura[cabo.pendulo][sensorIndex]) {
          const dadosSensor = this.leitura[cabo.pendulo][sensorIndex]
          const temp = parseFloat(dadosSensor[0])
          const temGrao = dadosSensor[4]
          const temErro = dadosSensor[3]

          // Só incluir se tem grão, não tem erro e temperatura válida
          if (temGrao && !temErro && temp !== -1000 && temp !== 0) {
            // Converter posição do cabo (que está em transform) para coordenadas x,y
            const match = cabo.transform.match(/translate\(([-\d.]+),([-\d.]+)\)/)
            if (match) {
              const x = parseFloat(match[1]) + this.centroX
              const y = parseFloat(match[2]) + this.centroY
              dadosTemperatura.push({ x, y, temp })
            }
          }
        }
      })

      if (dadosTemperatura.length === 0) return []

      // Gerar grade de blocos para o mapa térmico
      const resolucao = 20 // Grade 20x20
      const raio = this.raioSilo
      const centro = { x: this.centroX, y: this.centroY }
      const blocos = []

      for (let i = 0; i < resolucao; i++) {
        for (let j = 0; j < resolucao; j++) {
          const x = centro.x - raio + (2 * raio * i) / resolucao
          const y = centro.y - raio + (2 * raio * j) / resolucao

          // Verificar se o ponto está dentro do círculo do silo
          const distCentro = Math.hypot(x - centro.x, y - centro.y)
          if (distCentro > raio) continue

          // Interpolação IDW (Inverse Distance Weighting)
          const tempInterpolada = this.calcularIDW(x, y, dadosTemperatura)
          
          if (tempInterpolada !== null) {
            const tamanhoBloco = (2 * raio) / resolucao
            blocos.push({
              x: x - tamanhoBloco / 2,
              y: y - tamanhoBloco / 2,
              width: tamanhoBloco,
              height: tamanhoBloco,
              fill: this.corFaixaExata(tempInterpolada)
            })
          }
        }
      }

      return blocos
    },

    

    temperaturaMediaCamadaAtual() {
      if (!this.modoMapaCalor || !this.camadasPorProfundidade.length) return null

      const camadaAtual = this.camadasPorProfundidade[this.camadaAtual]
      const sensorIndex = camadaAtual.indice

      const temperaturas = []
      const cabos = Object.keys(this.leitura)

      cabos.forEach(pendulo => {
        if (this.leitura[pendulo] && this.leitura[pendulo][sensorIndex]) {
          const dadosSensor = this.leitura[pendulo][sensorIndex]
          if (dadosSensor && dadosSensor[4] === true && dadosSensor[3] === false) {
            const temp = parseFloat(dadosSensor[0])
            if (temp !== null && temp !== -1000 && temp !== 0) {
              temperaturas.push(temp)
            }
          }
        }
      })

      if (temperaturas.length === 0) return null
      return temperaturas.reduce((sum, temp) => sum + temp, 0) / temperaturas.length
    },

    camadaAtualInfo() {
      if (!this.modoMapaCalor || !this.camadasPorProfundidade.length) return ''
      const camada = this.camadasPorProfundidade[this.camadaAtual]
      if (!camada) return ''
      return `${camada.nome} - Média: ${this.temperaturaMediaCamadaAtual !== null ? this.temperaturaMediaCamadaAtual.toFixed(1) + '°C' : 'N/A'}`
    },

    camadaAnterior() {
      if (!this.modoMapaCalor || !this.camadasPorProfundidade.length) return { cor: '#CCCCCC' }
      const indiceAnterior = (this.camadaAtual - 1 + this.camadasPorProfundidade.length) % this.camadasPorProfundidade.length
      return this.camadasPorProfundidade[indiceAnterior]
    },

    camadaProxima() {
      if (!this.modoMapaCalor || !this.camadasPorProfundidade.length) return { cor: '#CCCCCC' }
      const indiceProximo = (this.camadaAtual + 1) % this.camadasPorProfundidade.length
      return this.camadasPorProfundidade[indiceProximo]
    },

    
  },
  methods: {
    // Função para converter coordenadas polares em retangulares (baseada no HTML original)
    polarParaRetangular(raio, angulo) {
      // Converte o ângulo de graus para radianos e inverte
      const anguloRad = (angulo * Math.PI) / 180 * -1

      // Calcula o deslocamento em coordenadas retangulares
      const x = raio * Math.cos(anguloRad)
      const y = raio * Math.sin(anguloRad)

      // Retorna a string de transform
      return `translate(${x},${y})`
    },

    // Função para calcular o transform com cada círculo independente, começando no minuto 15
    calcularTransformCircularIndependente(nivel, index, totalNoNivel) {
      let raio = 0

      // Definir raio baseado no nível
      switch (nivel) {
        case 'centro':
          raio = 15 // Círculo pequeno ao redor do centro
          break
        case 'meio':
          raio = 37 // Círculo médio
          break
        case 'externo':
          raio = 55 // Círculo externo
          break
      }

      // Cada círculo começa no minuto 15 (0 graus)
      const anguloInicial = 0 // Minuto 15 do relógio (3 horas = 0 graus)

      // Distribuir os cabos uniformemente pelo círculo completo (360°)
      let anguloFinal
      if (totalNoNivel === 1) {
        // Se só há 1 cabo no nível, fica na posição inicial
        anguloFinal = anguloInicial
      } else {
        // Distribuir uniformemente em 360° para completar o círculo
        const incrementoAngulo = 360 / totalNoNivel // Dividir o círculo completo
        anguloFinal = anguloInicial + (incrementoAngulo * index)
      }

      return this.polarParaRetangular(raio, anguloFinal)
    },





    temProblema(pendulo) {
      // Verifica se há algum problema nos sensores do pêndulo que justifique animação
      if (!this.leitura || !this.leitura[pendulo]) return false

      const sensores = this.leitura[pendulo]
      for (const sensorKey in sensores) {
        const valores = sensores[sensorKey]
        if (valores && valores[3] === true) { // Há erro
          return true
        }
      }
      return false
    },

    temFalha(pendulo) {
      // Verifica se há falha crítica no pêndulo
      if (!this.leitura || !this.leitura[pendulo]) return false

      const sensores = this.leitura[pendulo]
      let todosSensoresSemGrao = true

      for (const sensorKey in sensores) {
        const valores = sensores[sensorKey]
        if (valores && valores[4] === true) { // Tem grão
          todosSensoresSemGrao = false
          break
        }
      }

      return todosSensoresSemGrao // Falha se todos os sensores estão sem grão
    },

    getCorMediaPendulo(pendulo) {
      if (!this.leitura || !this.leitura[pendulo]) {
        return '#CCCCCC' // Cor padrão se não há dados
      }

      const sensores = this.leitura[pendulo]
      const temperaturasValidas = []

      // Coleta temperaturas válidas de todos os sensores do pêndulo
      for (const sensorKey in sensores) {
        const valores = sensores[sensorKey]

        // Filtra sensores válidos: tem grão (valores[4] === true) e sem erro (valores[3] === false)
        // e temperatura válida (não 0, não -1000)
        if (valores && 
            valores[4] === true && // tem grão
            valores[3] === false && // sem erro
            valores[0] !== null && valores[0] !== 0 && valores[0] !== -1000) {
          temperaturasValidas.push(parseFloat(valores[0]))
        }
      }

      // Se não há temperaturas válidas, retorna cor cinza
      if (temperaturasValidas.length === 0) {
        return '#CCCCCC'
      }

      // Calcula média das temperaturas válidas
      const media = temperaturasValidas.reduce((sum, temp) => sum + temp, 0) / temperaturasValidas.length

      // Aplica a mesma lógica de cores usada no sistema
      return this.corFaixaExata(media)
    },

    getTemperaturaMediaPendulo(pendulo) {
      if (!this.leitura || !this.leitura[pendulo]) {
        return '---'
      }

      const sensores = this.leitura[pendulo]
      const temperaturasValidas = []

      for (const sensorKey in sensores) {
        const valores = sensores[sensorKey]

        if (valores && 
            valores[4] === true && 
            valores[3] === false && 
            valores[0] !== null && valores[0] !== 0 && valores[0] !== -1000) {
          temperaturasValidas.push(parseFloat(valores[0]))
        }
      }

      if (temperaturasValidas.length === 0) {
        return '---'
      }

      const media = temperaturasValidas.reduce((sum, temp) => sum + temp, 0) / temperaturasValidas.length
      return media.toFixed(1)
    },

    getCorTexto(corFundo) {
      // Define cor do texto baseado no contraste com a cor de fundo
      const coresEscuras = ['#ff2200', '#ff6600', '#ff9900']
      return coresEscuras.some(cor => corFundo.toLowerCase().includes(cor.substring(1))) ? 'white' : 'black'
    },

    corFaixaExata(t) {
      // Função idêntica ao Silo2D para garantir cores consistentes
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

    getCorCamada(indice) {
      // Define cores para as camadas do mapa de calor
      const cores = [
        '#ff2200', // Mais quente (profundidade 1)
        '#ff6600',
        '#ff9900',
        '#fcf803',
        '#07fc03',
        '#03fcbe',
        '#03e8fc', // Mais frio (profundidades maiores)
      ]
      return cores[indice % cores.length]
    },

    alternarModoMapaCalor() {
      this.modoMapaCalor = !this.modoMapaCalor
      // Sempre começar pela primeira camada (topo) quando ativar ou desativar
      this.camadaAtual = 0
    },

    anteriorCamada() {
      if (!this.modoMapaCalor) return
      this.camadaAtual = (this.camadaAtual - 1 + this.camadasPorProfundidade.length) % this.camadasPorProfundidade.length
    },

    proximaCamada() {
      if (!this.modoMapaCalor) return
      this.camadaAtual = (this.camadaAtual + 1) % this.camadasPorProfundidade.length
    },

    // Método para calcular interpolação IDW (Inverse Distance Weighting)
    calcularIDW(x, y, dadosTemperatura, power = 2) {
      if (dadosTemperatura.length === 0) return null

      let somaPesos = 0
      let somaTemperaturas = 0

      dadosTemperatura.forEach(dado => {
        const distancia = Math.hypot(x - dado.x, y - dado.y)
        
        // Se está muito próximo de um ponto, usar exatamente essa temperatura
        if (distancia < 0.1) {
          return dado.temp
        }

        const peso = 1 / Math.pow(distancia, power)
        somaPesos += peso
        somaTemperaturas += dado.temp * peso
      })

      if (somaPesos === 0) return null
      return somaTemperaturas / somaPesos
    }
  }
}
</script>

<style scoped>
.topo-view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Botões de controle abaixo do SVG */
.botoes-controle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-controle {
  padding: 10px 20px;
  border: 2px solid #007bff;
  border-radius: 25px;
  background-color: white;
  color: #007bff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  text-align: center;
}

.btn-controle:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn-controle.ativo {
  background-color: #007bff;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-controle.ativo:hover {
  background-color: #0056b3;
}

.btn-topo.ativo {
  background-color: #28a745;
  border-color: #28a745;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-topo.ativo:hover {
  background-color: #218838;
  border-color: #218838;
}

.btn-mapa-calor.ativo {
  background-color: #dc3545;
  border-color: #dc3545;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-mapa-calor.ativo:hover {
  background-color: #c82333;
  border-color: #c82333;
}

.navegacao-camadas {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.btn-navegacao {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-navegacao:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.info-camada {
  text-align: center;
  font-size: 11px;
  color: #666;
  max-width: 200px;
  line-height: 1.3;
}

svg {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

/* Estilos baseados no SVG original */
.silo-background {
  stroke-miterlimit: 22.9256;
}

.cabo-text {
  font-weight: bold;
  font-size: 5px;
  font-family: 'Arial', sans-serif;
}

/* Animações para melhor visualização */
circle[fill*="red"] {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* Efeitos de hover para melhor interatividade */
g[id^="cabo_"]:hover circle {
  stroke-width: 1.2;
  filter: brightness(1.1);
}

g[id^="cabo_"]:hover text {
  font-weight: bolder;
}

/* Responsividade */
@media (max-width: 768px) {
  .topo-view-container {
    padding: 10px;
  }

  .cabo-text {
    font-size: 4px;
  }
}

@media (max-width: 480px) {
  .cabo-text {
    font-size: 3px;
  }
}
</style>