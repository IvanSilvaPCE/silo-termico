
<template>
  <div class="container-fluid h-100 p-3">
    <div class="row mb-3">
      <div class="col-12">
        <h4 class="text-primary mb-3">Armazém 2D - Monitoramento</h4>
        
        <b-card>
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Configurações do Armazém</h6>
              <b-button variant="success" size="sm" @click="gerarNovoMapa">
                <b-icon icon="arrow-clockwise"></b-icon> Atualizar
              </b-button>
            </div>
          </template>
          
          <div class="row">
            <div class="col-md-2">
              <b-form-group label="Largura" label-for="largura">
                <b-form-input 
                  id="largura" 
                  v-model.number="dimensoes.largura" 
                  type="number" 
                  min="10" 
                  max="50"
                  @input="atualizarArmazem"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Altura" label-for="altura">
                <b-form-input 
                  id="altura" 
                  v-model.number="dimensoes.altura" 
                  type="number" 
                  min="10" 
                  max="50"
                  @input="atualizarArmazem"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Setores X" label-for="setoresX">
                <b-form-input 
                  id="setoresX" 
                  v-model.number="setores.x" 
                  type="number" 
                  min="5" 
                  max="20"
                  @input="atualizarArmazem"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Setores Y" label-for="setoresY">
                <b-form-input 
                  id="setoresY" 
                  v-model.number="setores.y" 
                  type="number" 
                  min="5" 
                  max="20"
                  @input="atualizarArmazem"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Temp. Mín." label-for="tempMin">
                <b-form-input 
                  id="tempMin" 
                  v-model.number="temperaturaRange.min" 
                  type="number"
                  @input="atualizarArmazem"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Temp. Máx." label-for="tempMax">
                <b-form-input 
                  id="tempMax" 
                  v-model.number="temperaturaRange.max" 
                  type="number"
                  @input="atualizarArmazem"
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
            minHeight: 'calc(100vh - 220px)',
            maxHeight: 'calc(100vh - 160px)',
            overflow: 'auto'
          }"
        >
          <div ref="armazemContainer" class="w-100 h-100"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Armazem2D',
  data() {
    return {
      dimensoes: {
        largura: 800,
        altura: 600
      },
      setores: {
        x: 10,
        y: 8
      },
      temperaturaRange: {
        min: 15,
        max: 45
      },
      dadosTemperatura: [],
      svg: null
    }
  },
  mounted() {
    this.inicializarArmazem()
  },
  methods: {
    inicializarArmazem() {
      this.gerarDadosTemperatura()
      this.criarSVG()
    },
    gerarDadosTemperatura() {
      const { x, y } = this.setores
      const { min, max } = this.temperaturaRange
      
      this.dadosTemperatura = []
      for (let i = 0; i < y; i++) {
        const linha = []
        for (let j = 0; j < x; j++) {
          const temp = min + Math.random() * (max - min)
          linha.push(parseFloat(temp.toFixed(1)))
        }
        this.dadosTemperatura.push(linha)
      }
    },
    criarSVG() {
      const container = this.$refs.armazemContainer
      if (!container) return
      
      container.innerHTML = ''
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      svg.setAttribute('width', '100%')
      svg.setAttribute('height', '70vh')
      svg.setAttribute('viewBox', `0 0 ${this.dimensoes.largura} ${this.dimensoes.altura}`)
      
      this.renderizarArmazem(svg)
      container.appendChild(svg)
    },
    renderizarArmazem(svg) {
      const { largura, altura } = this.dimensoes
      const { x: setoresX, y: setoresY } = this.setores
      
      const larguraSetor = largura / setoresX
      const alturaSetor = altura / setoresY
      
      // Background
      const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      background.setAttribute('width', largura)
      background.setAttribute('height', altura)
      background.setAttribute('fill', '#f8f9fa')
      background.setAttribute('stroke', '#333')
      background.setAttribute('stroke-width', '2')
      svg.appendChild(background)
      
      // Setores com temperatura
      for (let i = 0; i < setoresY; i++) {
        for (let j = 0; j < setoresX; j++) {
          const x = j * larguraSetor
          const y = i * alturaSetor
          const temp = this.dadosTemperatura[i][j]
          const cor = this.getCorTemperatura(temp)
          
          // Setor
          const setor = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          setor.setAttribute('x', x)
          setor.setAttribute('y', y)
          setor.setAttribute('width', larguraSetor)
          setor.setAttribute('height', alturaSetor)
          setor.setAttribute('fill', cor)
          setor.setAttribute('stroke', '#333')
          setor.setAttribute('stroke-width', '1')
          setor.setAttribute('opacity', '0.8')
          svg.appendChild(setor)
          
          // Texto da temperatura
          const texto = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          texto.setAttribute('x', x + larguraSetor / 2)
          texto.setAttribute('y', y + alturaSetor / 2)
          texto.setAttribute('text-anchor', 'middle')
          texto.setAttribute('dominant-baseline', 'central')
          texto.setAttribute('font-size', '12')
          texto.setAttribute('font-family', 'Arial')
          texto.setAttribute('font-weight', 'bold')
          texto.setAttribute('fill', '#333')
          texto.textContent = `${temp}°C`
          svg.appendChild(texto)
        }
      }
      
      // Adicionar título
      const titulo = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      titulo.setAttribute('x', largura / 2)
      titulo.setAttribute('y', 30)
      titulo.setAttribute('text-anchor', 'middle')
      titulo.setAttribute('font-size', '20')
      titulo.setAttribute('font-family', 'Arial')
      titulo.setAttribute('font-weight', 'bold')
      titulo.setAttribute('fill', '#007bff')
      titulo.textContent = 'Mapa de Temperatura do Armazém'
      svg.appendChild(titulo)
    },
    getCorTemperatura(temp) {
      const { min, max } = this.temperaturaRange
      const ratio = (temp - min) / (max - min)
      
      if (ratio < 0.25) return '#4CAF50'  // Verde
      if (ratio < 0.5) return '#8BC34A'   // Verde claro
      if (ratio < 0.75) return '#FFC107'  // Amarelo
      return '#F44336'  // Vermelho
    },
    atualizarArmazem() {
      this.gerarDadosTemperatura()
      this.criarSVG()
    },
    gerarNovoMapa() {
      this.atualizarArmazem()
      
      this.$bvToast.toast('Mapa do armazém atualizado!', {
        title: 'Atualização',
        variant: 'success',
        autoHideDelay: 2000
      })
    }
  }
}
</script>

<style scoped>
.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
</style>
