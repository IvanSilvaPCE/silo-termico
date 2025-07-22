
<template>
  <div class="container-fluid h-100">
    <div class="row h-100">
      <!-- Painel de Controles -->
      <div class="col-lg-3 col-md-4 bg-light border-end p-3" style="height: 100vh; overflow-y: auto;">
        <h5 class="mb-3 text-primary">Configurações Silo 2D</h5>
        
        <!-- Configurações de Grid -->
        <b-card class="mb-3">
          <template #header>
            <h6 class="mb-0">Grid de Temperatura</h6>
          </template>
          
          <b-form-group label="Linhas" label-for="linhas">
            <b-form-input 
              id="linhas" 
              v-model.number="config.linhas" 
              type="number" 
              min="5" 
              max="20"
              @input="updateGrid"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Colunas" label-for="colunas">
            <b-form-input 
              id="colunas" 
              v-model.number="config.colunas" 
              type="number" 
              min="5" 
              max="20"
              @input="updateGrid"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Temperatura Mínima (°C)" label-for="tempMin">
            <b-form-input 
              id="tempMin" 
              v-model.number="config.tempMin" 
              type="number"
              @input="updateGrid"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Temperatura Máxima (°C)" label-for="tempMax">
            <b-form-input 
              id="tempMax" 
              v-model.number="config.tempMax" 
              type="number"
              @input="updateGrid"
            ></b-form-input>
          </b-form-group>
        </b-card>

        <!-- Simulação -->
        <b-card class="mb-3">
          <template #header>
            <h6 class="mb-0">Simulação</h6>
          </template>
          
          <b-form-group>
            <b-form-checkbox v-model="simulacao.ativa" @change="toggleSimulacao">
              Simulação Ativa
            </b-form-checkbox>
          </b-form-group>
          
          <b-form-group v-if="simulacao.ativa" label="Velocidade" label-for="velocidade">
            <b-form-select 
              id="velocidade" 
              v-model="simulacao.velocidade"
              :options="velocidadeOptions"
            ></b-form-select>
          </b-form-group>
        </b-card>

        <!-- Ações -->
        <div class="d-grid gap-2">
          <b-button variant="primary" @click="gerarDadosAleatorios">
            <b-icon icon="shuffle"></b-icon> Gerar Dados
          </b-button>
          <b-button variant="success" @click="salvarDados">
            <b-icon icon="save"></b-icon> Salvar
          </b-button>
          <b-button variant="secondary" @click="resetarGrid">
            <b-icon icon="arrow-clockwise"></b-icon> Resetar
          </b-button>
        </div>
      </div>

      <!-- Grid de Temperatura -->
      <div class="col-lg-9 col-md-8 d-flex align-items-center justify-content-center p-3">
        <b-card class="w-100" style="height: calc(100vh - 60px);">
          <template #header>
            <h5 class="mb-0">Mapa de Calor - Silo 2D</h5>
          </template>
          
          <div 
            class="grid-container d-flex align-items-center justify-content-center"
            style="height: calc(100vh - 200px); overflow: auto;"
          >
            <div 
              class="temperature-grid"
              :style="{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${config.colunas}, 1fr)`,
                gap: '2px',
                maxWidth: '100%',
                maxHeight: '100%'
              }"
            >
              <div
                v-for="(temperatura, index) in temperaturas"
                :key="index"
                class="grid-cell"
                :style="{
                  backgroundColor: getCorTemperatura(temperatura),
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: temperatura > 50 ? 'white' : 'black',
                  border: '1px solid #ccc',
                  cursor: 'pointer'
                }"
                :title="`Temperatura: ${temperatura.toFixed(1)}°C`"
                @click="selecionarCelula(index)"
              >
                {{ temperatura.toFixed(0) }}
              </div>
            </div>
          </div>

          <!-- Legenda -->
          <div class="mt-3">
            <h6>Legenda de Temperatura:</h6>
            <div class="d-flex align-items-center gap-3 flex-wrap">
              <div class="d-flex align-items-center">
                <div style="width: 20px; height: 20px; background: #2196F3; margin-right: 5px;"></div>
                <small>Fria (&lt; 25°C)</small>
              </div>
              <div class="d-flex align-items-center">
                <div style="width: 20px; height: 20px; background: #4CAF50; margin-right: 5px;"></div>
                <small>Normal (25-35°C)</small>
              </div>
              <div class="d-flex align-items-center">
                <div style="width: 20px; height: 20px; background: #FF9800; margin-right: 5px;"></div>
                <small>Quente (35-50°C)</small>
              </div>
              <div class="d-flex align-items-center">
                <div style="width: 20px; height: 20px; background: #F44336; margin-right: 5px;"></div>
                <small>Crítica (&gt; 50°C)</small>
              </div>
            </div>
          </div>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Silo2D',
  data() {
    return {
      config: {
        linhas: 10,
        colunas: 10,
        tempMin: 15,
        tempMax: 60
      },
      temperaturas: [],
      simulacao: {
        ativa: false,
        velocidade: 1000,
        intervalId: null
      },
      velocidadeOptions: [
        { value: 500, text: 'Rápida' },
        { value: 1000, text: 'Normal' },
        { value: 2000, text: 'Lenta' }
      ]
    }
  },
  mounted() {
    this.gerarDadosAleatorios()
  },
  beforeDestroy() {
    if (this.simulacao.intervalId) {
      clearInterval(this.simulacao.intervalId)
    }
  },
  methods: {
    updateGrid() {
      this.gerarDadosAleatorios()
    },
    gerarDadosAleatorios() {
      const total = this.config.linhas * this.config.colunas
      this.temperaturas = []
      
      for (let i = 0; i < total; i++) {
        const temp = Math.random() * (this.config.tempMax - this.config.tempMin) + this.config.tempMin
        this.temperaturas.push(temp)
      }
    },
    getCorTemperatura(temp) {
      if (temp < 25) return '#2196F3'      // Azul - Fria
      if (temp < 35) return '#4CAF50'      // Verde - Normal
      if (temp < 50) return '#FF9800'      // Laranja - Quente
      return '#F44336'                     // Vermelho - Crítica
    },
    selecionarCelula(index) {
      this.$bvToast.toast(`Temperatura: ${this.temperaturas[index].toFixed(2)}°C`, {
        title: `Célula ${index + 1}`,
        variant: 'info',
        autoHideDelay: 2000
      })
    },
    toggleSimulacao() {
      if (this.simulacao.ativa) {
        this.iniciarSimulacao()
      } else {
        this.pararSimulacao()
      }
    },
    iniciarSimulacao() {
      this.simulacao.intervalId = setInterval(() => {
        this.gerarDadosAleatorios()
      }, this.simulacao.velocidade)
    },
    pararSimulacao() {
      if (this.simulacao.intervalId) {
        clearInterval(this.simulacao.intervalId)
        this.simulacao.intervalId = null
      }
    },
    salvarDados() {
      const dados = {
        config: this.config,
        temperaturas: this.temperaturas,
        timestamp: new Date().getTime()
      }
      
      localStorage.setItem(`silo2d_${dados.timestamp}`, JSON.stringify(dados))
      
      // Salvar no Vuex também
      this.$store.dispatch('updateSiloData', dados)
      
      this.$bvToast.toast('Dados salvos com sucesso!', {
        title: 'Sucesso',
        variant: 'success',
        autoHideDelay: 3000
      })
    },
    resetarGrid() {
      this.config = {
        linhas: 10,
        colunas: 10,
        tempMin: 15,
        tempMax: 60
      }
      this.pararSimulacao()
      this.simulacao.ativa = false
      this.gerarDadosAleatorios()
    }
  }
}
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa !important;
}

.border-end {
  border-right: 1px solid #dee2e6 !important;
}

.grid-cell {
  transition: all 0.3s ease;
}

.grid-cell:hover {
  transform: scale(1.1);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.temperature-grid {
  max-width: 100%;
  max-height: 100%;
}

@media (max-width: 768px) {
  .grid-cell {
    width: 25px !important;
    height: 25px !important;
    font-size: 8px !important;
  }
}
</style>
