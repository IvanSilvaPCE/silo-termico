
<template>
  <div class="container-fluid h-100 p-3">
    <div class="row mb-3">
      <div class="col-12">
        <h4 class="text-primary mb-3">Silo 2D - Monitoramento</h4>
        
        <b-card>
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Controles do Silo</h6>
              <b-button-group size="sm">
                <b-button 
                  :variant="modo === 'temperatura' ? 'primary' : 'outline-primary'"
                  @click="setModo('temperatura')"
                >
                  Temperatura
                </b-button>
                <b-button 
                  :variant="modo === 'mapa' ? 'primary' : 'outline-primary'"
                  @click="setModo('mapa')"
                >
                  Mapa de Calor
                </b-button>
              </b-button-group>
            </div>
          </template>
          
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="Linhas" label-for="linhas">
                <b-form-input 
                  id="linhas" 
                  v-model.number="dimensoes.linhas" 
                  type="number" 
                  min="5" 
                  max="20"
                  @input="atualizarSilo"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Colunas" label-for="colunas">
                <b-form-input 
                  id="colunas" 
                  v-model.number="dimensoes.colunas" 
                  type="number" 
                  min="5" 
                  max="20"
                  @input="atualizarSilo"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Temp. Mín." label-for="tempMin">
                <b-form-input 
                  id="tempMin" 
                  v-model.number="temperaturaBounds.min" 
                  type="number"
                  @input="atualizarSilo"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Temp. Máx." label-for="tempMax">
                <b-form-input 
                  id="tempMax" 
                  v-model.number="temperaturaBounds.max" 
                  type="number"
                  @input="atualizarSilo"
                ></b-form-input>
              </b-form-group>
            </div>
          </div>
        </b-card>
      </div>
    </div>
    
    <div class="row h-75">
      <div class="col-12">
        <div 
          class="d-flex justify-content-center align-items-center"
          :style="{ 
            minHeight: 'calc(100vh - 180px)',
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'auto'
          }"
        >
          <svg
            ref="siloSvg"
            :viewBox="`0 0 ${largura} ${altura}`"
            :style="{
              maxWidth: '100%',
              maxHeight: '70vh',
              height: 'auto',
              minHeight: '350px',
              shapeRendering: 'auto',
              textRendering: 'geometricPrecision',
              imageRendering: 'optimizeQuality',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }"
            v-html="svgContent"
          >
          </svg>
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
      dimensoes: {
        linhas: 10,
        colunas: 10
      },
      temperaturaBounds: {
        min: 15,
        max: 45
      },
      largura: 800,
      altura: 600,
      svgContent: '',
      dadosTemperatura: []
    }
  },
  mounted() {
    this.gerarDadosTemperatura()
    this.atualizarSilo()
  },
  methods: {
    setModo(novoModo) {
      this.modo = novoModo
      this.atualizarSilo()
    },
    gerarDadosTemperatura() {
      const { linhas, colunas } = this.dimensoes
      const { min, max } = this.temperaturaBounds
      
      this.dadosTemperatura = []
      for (let i = 0; i < linhas; i++) {
        const linha = []
        for (let j = 0; j < colunas; j++) {
          const temp = min + Math.random() * (max - min)
          linha.push(parseFloat(temp.toFixed(1)))
        }
        this.dadosTemperatura.push(linha)
      }
    },
    atualizarSilo() {
      this.gerarDadosTemperatura()
      this.renderizarSilo()
    },
    renderizarSilo() {
      if (this.modo === 'temperatura') {
        this.renderizarSiloTemperatura()
      } else {
        this.renderizarSiloMapaCalor()
      }
    },
    renderizarSiloTemperatura() {
      const { linhas, colunas } = this.dimensoes
      const cellWidth = this.largura / colunas
      const cellHeight = this.altura / linhas
      
      let svg = ''
      
      // Background
      svg += `<rect width="${this.largura}" height="${this.altura}" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>`
      
      // Grid e valores de temperatura
      for (let i = 0; i < linhas; i++) {
        for (let j = 0; j < colunas; j++) {
          const x = j * cellWidth
          const y = i * cellHeight
          const temp = this.dadosTemperatura[i][j]
          const cor = this.getCorTemperatura(temp)
          
          svg += `
            <rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" 
                  fill="${cor}" stroke="#333" stroke-width="1" opacity="0.8"/>
            <text x="${x + cellWidth/2}" y="${y + cellHeight/2}" 
                  text-anchor="middle" dominant-baseline="central" 
                  font-size="12" font-family="Arial" fill="#333" font-weight="bold">
              ${temp}°C
            </text>
          `
        }
      }
      
      this.svgContent = svg
    },
    renderizarSiloMapaCalor() {
      const { linhas, colunas } = this.dimensoes
      const cellWidth = this.largura / colunas
      const cellHeight = this.altura / linhas
      
      let svg = ''
      
      // Background
      svg += `<rect width="${this.largura}" height="${this.altura}" fill="#000" stroke="#333" stroke-width="2"/>`
      
      // Mapa de calor
      for (let i = 0; i < linhas; i++) {
        for (let j = 0; j < colunas; j++) {
          const x = j * cellWidth
          const y = i * cellHeight
          const temp = this.dadosTemperatura[i][j]
          const intensidade = this.getIntensidadeCalor(temp)
          
          svg += `
            <rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" 
                  fill="hsl(${intensidade}, 100%, 50%)" stroke="none" opacity="0.9"/>
          `
        }
      }
      
      // Adicionar legenda
      svg += this.adicionarLegenda()
      
      this.svgContent = svg
    },
    getCorTemperatura(temp) {
      const { min, max } = this.temperaturaBounds
      const ratio = (temp - min) / (max - min)
      
      if (ratio < 0.3) return '#4CAF50'  // Verde
      if (ratio < 0.6) return '#FFC107'  // Amarelo
      if (ratio < 0.8) return '#FF9800'  // Laranja
      return '#F44336'  // Vermelho
    },
    getIntensidadeCalor(temp) {
      const { min, max } = this.temperaturaBounds
      const ratio = (temp - min) / (max - min)
      return Math.round(240 - (ratio * 240)) // De azul (240) para vermelho (0)
    },
    adicionarLegenda() {
      const legendaX = this.largura - 80
      const legendaY = 20
      
      let legenda = `
        <rect x="${legendaX - 10}" y="${legendaY - 10}" width="70" height="100" 
              fill="rgba(255,255,255,0.9)" stroke="#333" stroke-width="1"/>
        <text x="${legendaX}" y="${legendaY}" font-size="12" font-family="Arial" fill="#333" font-weight="bold">
          Legenda
        </text>
      `
      
      const cores = ['#4CAF50', '#FFC107', '#FF9800', '#F44336']
      const labels = ['Baixa', 'Média', 'Alta', 'Crítica']
      
      cores.forEach((cor, index) => {
        const y = legendaY + 15 + (index * 15)
        legenda += `
          <rect x="${legendaX}" y="${y}" width="12" height="12" fill="${cor}"/>
          <text x="${legendaX + 16}" y="${y + 9}" font-size="10" font-family="Arial" fill="#333">
            ${labels[index]}
          </text>
        `
      })
      
      return legenda
    }
  }
}
</script>

<style scoped>
.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.btn-group .btn {
  transition: all 0.2s;
}

.btn-group .btn:hover {
  transform: translateY(-1px);
}
</style>
