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

      <!-- Cabos/Pêndulos posicionados -->
      <g v-for="(cabo, index) in cabosComPosicao" :key="`cabo_${index + 1}`" :id="`cabo_${index + 1}`" :transform="cabo.transform">
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
    }
  },
  data() {
    return {
      largura: 138,
      altura: 134,
      mostrarIndicadorNivel: true
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
    }
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
    
    // Função para calcular o transform com posicionamento anti-horário começando no minuto 15 (mantida para compatibilidade)
    calcularTransformAntiHorario(nivel, posicaoGlobal, totalCabos) {
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
      
      // Começar no minuto 15 do relógio (0 graus) e ir em sentido anti-horário
      const anguloInicial = 0 // Minuto 15 do relógio (3 horas = 0 graus)
      const incrementoAngulo = 360 / totalCabos // Distribuição uniforme
      const anguloFinal = anguloInicial + (incrementoAngulo * posicaoGlobal) // Anti-horário (soma devido à inversão em polarParaRetangular)
      
      return this.polarParaRetangular(raio, anguloFinal)
    },
    
    // Função melhorada para calcular o transform baseado no nível e posição circular (mantida para compatibilidade)
    calcularTransformCircular(nivel, index, totalNoNivel) {
      let raio = 0
      let anguloOffset = 0
      
      // Definir raio e offset de ângulo baseado no nível
      switch (nivel) {
        case 'centro':
          if (totalNoNivel === 1) {
            raio = 0 // Exatamente no centro se há apenas 1 cabo
          } else {
            raio = 15 // Círculo pequeno ao redor do centro para múltiplos cabos
          }
          anguloOffset = -90 // Começar do topo
          break
        case 'meio':
          raio = 37 // Círculo médio
          anguloOffset = -90 + (totalNoNivel > 0 ? 180 / totalNoNivel : 0) // Offset para evitar sobreposição
          break
        case 'externo':
          raio = 55 // Círculo externo
          anguloOffset = -90 + (totalNoNivel > 0 ? 90 / totalNoNivel : 0) // Offset diferente para variação visual
          break
      }
      
      // Se há apenas 1 cabo no nível e é o centro, posicionar exatamente no centro
      if (nivel === 'centro' && totalNoNivel === 1) {
        return this.polarParaRetangular(0, 0)
      }
      
      // Distribuir uniformemente no círculo correspondente
      // Começar do topo com offset e distribuir no sentido horário
      const anguloDistribuicao = anguloOffset + (360 / totalNoNivel) * index
      
      return this.polarParaRetangular(raio, anguloDistribuicao)
    },
    
    // Função para calcular o transform baseado no número de sensores e posição lógica (mantida para compatibilidade)
    calcularTransformPorSensores(numSensores, index, total, tipo) {
      if (tipo === 'central') {
        // Cabos com mais sensores ficam no centro (raio 0 ou muito pequeno)
        if (total === 1) {
          return this.polarParaRetangular(0, 0) // Exatamente no centro
        } else {
          // Se há múltiplos cabos com o mesmo número máximo de sensores, distribuir em círculo pequeno
          const anguloDistribuicao = (360 / total) * index
          return this.polarParaRetangular(15, anguloDistribuicao) // Raio pequeno ao redor do centro
        }
      } else {
        // Cabos periféricos: posicionamento baseado no número de sensores
        let raio
        
        // Definir raio baseado no número de sensores
        if (numSensores >= 10) {
          raio = 30 // Sensores 10-11: próximos ao centro
        } else if (numSensores >= 8) {
          raio = 45 // Sensores 8-9: círculo médio
        } else {
          raio = 55 // Sensores 1-7: círculo externo
        }
        
        // Distribuir uniformemente no círculo correspondente
        const anguloDistribuicao = (360 / total) * index
        
        return this.polarParaRetangular(raio, anguloDistribuicao)
      }
    },
    
    // Função para calcular o transform de cada cabo baseado no número total de cabos (método antigo para fallback)
    calcularTransformCabo(numCabos, index) {
      switch (numCabos) {
        case 1:
          return this.polarParaRetangular(0, 0)
        
        case 3:
          const angulos3 = [30, 150, 270]
          return this.polarParaRetangular(37, angulos3[index])
        
        case 4:
          const angulos4 = [75, 195, 315, 0]
          const raios4 = [37, 37, 37, 0]
          return this.polarParaRetangular(raios4[index], angulos4[index])
        
        case 5:
          const angulos5 = [15, 90, 180, 270, 0]
          const raios5 = [37, 37, 37, 37, 0]
          return this.polarParaRetangular(raios5[index], angulos5[index])
        
        case 6:
          const angulos6 = [30, 102, 174, 246, 318, 0]
          const raios6 = [37, 37, 37, 37, 37, 0]
          return this.polarParaRetangular(raios6[index], angulos6[index])
        
        case 10:
          const angulos10 = [30, 90, 150, 210, 270, 330, 60, 180, 300, 0]
          const raios10 = [50, 50, 50, 50, 50, 50, 30, 30, 30, 0]
          return this.polarParaRetangular(raios10[index], angulos10[index])
        
        case 15:
          const angulos15 = [40, 91.43, 142.86, 192.29, 245.72, 297.15, 348.58, 18, 69.43, 120.86, 172.29, 223.72, 275.15, 326.68, 0]
          const raios15 = [50, 50, 50, 50, 50, 50, 50, 30, 30, 30, 30, 30, 30, 30, 0]
          return this.polarParaRetangular(raios15[index], angulos15[index])
        
        case 19:
          // Para 19 cabos, distribui uniformemente em círculo
          const anguloBase19 = (360 / 19) * index
          const raio19 = index < 18 ? 45 : 0
          return this.polarParaRetangular(raio19, anguloBase19)
        
        default:
          // Para outros números, distribui uniformemente
          const anguloUniforme = (360 / numCabos) * index
          const raioUniforme = numCabos > 12 ? 45 : 37
          return this.polarParaRetangular(raioUniforme, anguloUniforme)
      }
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
    }
  }
}
</script>

<style scoped>
.topo-view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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