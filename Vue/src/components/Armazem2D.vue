
<template>
  <div class="container-fluid h-100">
    <div class="row h-100">
      <!-- Painel de Controles -->
      <div class="col-lg-3 col-md-4 bg-light border-end p-3" style="height: 100vh; overflow-y: auto;">
        <h5 class="mb-3 text-primary">Configurações Armazém 2D</h5>
        
        <!-- Configurações de Layout -->
        <b-card class="mb-3">
          <template #header>
            <h6 class="mb-0">Layout do Armazém</h6>
          </template>
          
          <b-form-group label="Setores X" label-for="setoresX">
            <b-form-input 
              id="setoresX" 
              v-model.number="config.setoresX" 
              type="number" 
              min="3" 
              max="15"
              @input="updateLayout"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Setores Y" label-for="setoresY">
            <b-form-input 
              id="setoresY" 
              v-model.number="config.setoresY" 
              type="number" 
              min="3" 
              max="15"
              @input="updateLayout"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Tipo de Visualização" label-for="tipoVis">
            <v-select 
              v-model="config.tipoVisualizacao"
              :options="tipoVisualizacaoOptions"
              label="label"
              :reduce="option => option.value"
              @input="updateLayout"
            ></v-select>
          </b-form-group>
        </b-card>

        <!-- Configurações de Temperatura -->
        <b-card class="mb-3">
          <template #header>
            <h6 class="mb-0">Parâmetros de Temperatura</h6>
          </template>
          
          <b-form-group label="Temp. Mínima (°C)" label-for="tempMin">
            <b-form-input 
              id="tempMin" 
              v-model.number="config.tempMin" 
              type="number"
              @input="updateTemperaturas"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Temp. Máxima (°C)" label-for="tempMax">
            <b-form-input 
              id="tempMax" 
              v-model.number="config.tempMax" 
              type="number"
              @input="updateTemperaturas"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Temp. Crítica (°C)" label-for="tempCritica">
            <b-form-input 
              id="tempCritica" 
              v-model.number="config.tempCritica" 
              type="number"
              @input="updateTemperaturas"
            ></b-form-input>
          </b-form-group>
        </b-card>

        <!-- Monitoramento -->
        <b-card class="mb-3">
          <template #header>
            <h6 class="mb-0">Monitoramento</h6>
          </template>
          
          <b-form-group>
            <b-form-checkbox v-model="monitoramento.ativo" @change="toggleMonitoramento">
              Monitoramento Ativo
            </b-form-checkbox>
          </b-form-group>
          
          <b-form-group>
            <b-form-checkbox v-model="alarmes.ativos">
              Alarmes Ativos
            </b-form-checkbox>
          </b-form-group>
          
          <div v-if="monitoramento.ativo" class="mt-2">
            <small class="text-muted">Última atualização: {{ ultimaAtualizacao }}</small>
          </div>
        </b-card>

        <!-- Ações -->
        <div class="d-grid gap-2">
          <b-button variant="primary" @click="atualizarDados">
            <b-icon icon="arrow-clockwise"></b-icon> Atualizar
          </b-button>
          <b-button variant="success" @click="salvarConfiguracao">
            <b-icon icon="save"></b-icon> Salvar Config
          </b-button>
          <b-button variant="warning" @click="exportarDados">
            <b-icon icon="download"></b-icon> Exportar
          </b-button>
          <b-button variant="secondary" @click="resetar">
            <b-icon icon="arrow-counterclockwise"></b-icon> Resetar
          </b-button>
        </div>
      </div>

      <!-- Visualização do Armazém -->
      <div class="col-lg-9 col-md-8 d-flex align-items-center justify-content-center p-3">
        <b-card class="w-100" style="height: calc(100vh - 60px);">
          <template #header>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Mapa de Temperatura - Armazém 2D</h5>
              <b-badge 
                :variant="getStatusVariant()" 
                pill
              >
                {{ getStatusTexto() }}
              </b-badge>
            </div>
          </template>
          
          <div 
            class="armazem-container d-flex align-items-center justify-content-center"
            style="height: calc(100vh - 250px); overflow: auto;"
          >
            <!-- Visualização em Grid -->
            <div 
              v-if="config.tipoVisualizacao === 'grid'"
              class="armazem-grid"
              :style="{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${config.setoresX}, 1fr)`,
                gap: '3px',
                maxWidth: '100%',
                maxHeight: '100%',
                padding: '10px'
              }"
            >
              <div
                v-for="(setor, index) in setores"
                :key="index"
                class="setor-cell"
                :style="{
                  backgroundColor: getCorSetor(setor),
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: setor.temperatura > config.tempCritica ? 'white' : 'black',
                  border: `2px solid ${setor.alerta ? '#dc3545' : '#ccc'}`,
                  cursor: 'pointer',
                  borderRadius: '4px'
                }"
                :title="`Setor ${setor.id}: ${setor.temperatura.toFixed(1)}°C`"
                @click="selecionarSetor(index)"
                :class="{ 'setor-alerta': setor.alerta }"
              >
                <div>S{{ setor.id }}</div>
                <div style="font-size: 8px;">{{ setor.temperatura.toFixed(0) }}°</div>
              </div>
            </div>

            <!-- Visualização em Mapa -->
            <div 
              v-else-if="config.tipoVisualizacao === 'mapa'"
              class="armazem-mapa w-100 h-100 position-relative"
              style="background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px;"
            >
              <svg 
                viewBox="0 0 600 400" 
                class="w-100 h-100"
                style="max-height: calc(100vh - 300px);"
              >
                <!-- Fundo do armazém -->
                <rect x="50" y="50" width="500" height="300" fill="#e9ecef" stroke="#6c757d" stroke-width="2" rx="10"/>
                
                <!-- Título -->
                <text x="300" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#495057">
                  Vista Superior - Armazém
                </text>
                
                <!-- Setores no mapa -->
                <g v-for="(setor, index) in setores" :key="'mapa-' + index">
                  <rect
                    :x="getPosicaoSetorX(index)"
                    :y="getPosicaoSetorY(index)"
                    :width="getSizeSetor()"
                    :height="getSizeSetor()"
                    :fill="getCorSetor(setor)"
                    :stroke="setor.alerta ? '#dc3545' : '#6c757d'"
                    :stroke-width="setor.alerta ? '3' : '1'"
                    @click="selecionarSetor(index)"
                    style="cursor: pointer;"
                  />
                  <text
                    :x="getPosicaoSetorX(index) + getSizeSetor() / 2"
                    :y="getPosicaoSetorY(index) + getSizeSetor() / 2 - 5"
                    text-anchor="middle"
                    font-size="10"
                    font-weight="bold"
                    :fill="setor.temperatura > config.tempCritica ? 'white' : 'black'"
                  >
                    {{ setor.id }}
                  </text>
                  <text
                    :x="getPosicaoSetorX(index) + getSizeSetor() / 2"
                    :y="getPosicaoSetorY(index) + getSizeSetor() / 2 + 8"
                    text-anchor="middle"
                    font-size="8"
                    :fill="setor.temperatura > config.tempCritica ? 'white' : 'black'"
                  >
                    {{ setor.temperatura.toFixed(0) }}°
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <!-- Informações e Legenda -->
          <div class="row mt-3">
            <div class="col-md-6">
              <h6>Estatísticas:</h6>
              <small>
                <strong>Temp. Média:</strong> {{ getTemperaturaMedia() }}°C<br>
                <strong>Setores Críticos:</strong> {{ getSetoresCriticos() }}<br>
                <strong>Total de Setores:</strong> {{ setores.length }}
              </small>
            </div>
            <div class="col-md-6">
              <h6>Legenda:</h6>
              <div class="d-flex flex-wrap gap-2">
                <div class="d-flex align-items-center">
                  <div style="width: 15px; height: 15px; background: #28a745; margin-right: 5px; border-radius: 2px;"></div>
                  <small>Normal</small>
                </div>
                <div class="d-flex align-items-center">
                  <div style="width: 15px; height: 15px; background: #ffc107; margin-right: 5px; border-radius: 2px;"></div>
                  <small>Atenção</small>
                </div>
                <div class="d-flex align-items-center">
                  <div style="width: 15px; height: 15px; background: #dc3545; margin-right: 5px; border-radius: 2px;"></div>
                  <small>Crítico</small>
                </div>
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
  name: 'Armazem2D',
  data() {
    return {
      config: {
        setoresX: 8,
        setoresY: 6,
        tempMin: 18,
        tempMax: 55,
        tempCritica: 45,
        tipoVisualizacao: 'grid'
      },
      setores: [],
      monitoramento: {
        ativo: false,
        intervalId: null
      },
      alarmes: {
        ativos: true
      },
      ultimaAtualizacao: '',
      tipoVisualizacaoOptions: [
        { label: 'Grade', value: 'grid' },
        { label: 'Mapa', value: 'mapa' }
      ]
    }
  },
  mounted() {
    this.initArmazem()
  },
  beforeDestroy() {
    if (this.monitoramento.intervalId) {
      clearInterval(this.monitoramento.intervalId)
    }
  },
  methods: {
    initArmazem() {
      this.updateLayout()
      this.updateTemperaturas()
    },
    updateLayout() {
      const total = this.config.setoresX * this.config.setoresY
      this.setores = []
      
      for (let i = 0; i < total; i++) {
        this.setores.push({
          id: i + 1,
          temperatura: 0,
          alerta: false,
          x: i % this.config.setoresX,
          y: Math.floor(i / this.config.setoresX)
        })
      }
      this.updateTemperaturas()
    },
    updateTemperaturas() {
      this.setores.forEach(setor => {
        setor.temperatura = Math.random() * (this.config.tempMax - this.config.tempMin) + this.config.tempMin
        setor.alerta = setor.temperatura > this.config.tempCritica
      })
      this.ultimaAtualizacao = new Date().toLocaleTimeString()
    },
    getCorSetor(setor) {
      if (setor.temperatura > this.config.tempCritica) return '#dc3545' // Vermelho
      if (setor.temperatura > this.config.tempCritica * 0.8) return '#ffc107' // Amarelo
      return '#28a745' // Verde
    },
    getPosicaoSetorX(index) {
      const setor = this.setores[index]
      return 70 + (setor.x * (460 / this.config.setoresX))
    },
    getPosicaoSetorY(index) {
      const setor = this.setores[index]
      return 70 + (setor.y * (260 / this.config.setoresY))
    },
    getSizeSetor() {
      return Math.min(460 / this.config.setoresX - 2, 260 / this.config.setoresY - 2)
    },
    selecionarSetor(index) {
      const setor = this.setores[index]
      this.$bvToast.toast(
        `Temperatura: ${setor.temperatura.toFixed(2)}°C\nPosição: (${setor.x + 1}, ${setor.y + 1})`, 
        {
          title: `Setor ${setor.id}`,
          variant: setor.alerta ? 'danger' : 'info',
          autoHideDelay: 3000
        }
      )
    },
    toggleMonitoramento() {
      if (this.monitoramento.ativo) {
        this.monitoramento.intervalId = setInterval(() => {
          this.updateTemperaturas()
        }, 5000)
      } else {
        if (this.monitoramento.intervalId) {
          clearInterval(this.monitoramento.intervalId)
        }
      }
    },
    atualizarDados() {
      this.updateTemperaturas()
      this.$bvToast.toast('Dados atualizados!', {
        title: 'Atualização',
        variant: 'success',
        autoHideDelay: 2000
      })
    },
    salvarConfiguracao() {
      const dados = {
        config: this.config,
        setores: this.setores,
        timestamp: new Date().getTime()
      }
      
      localStorage.setItem(`armazem2d_${dados.timestamp}`, JSON.stringify(dados))
      this.$store.dispatch('updateArmazemData', dados)
      
      this.$bvToast.toast('Configuração salva!', {
        title: 'Sucesso',
        variant: 'success',
        autoHideDelay: 3000
      })
    },
    exportarDados() {
      const dados = {
        config: this.config,
        setores: this.setores,
        estatisticas: {
          temperaturaMedia: this.getTemperaturaMedia(),
          setoresCriticos: this.getSetoresCriticos(),
          totalSetores: this.setores.length
        },
        timestamp: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `armazem2d_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
    resetar() {
      this.config = {
        setoresX: 8,
        setoresY: 6,
        tempMin: 18,
        tempMax: 55,
        tempCritica: 45,
        tipoVisualizacao: 'grid'
      }
      this.monitoramento.ativo = false
      if (this.monitoramento.intervalId) {
        clearInterval(this.monitoramento.intervalId)
      }
      this.initArmazem()
    },
    getTemperaturaMedia() {
      if (this.setores.length === 0) return '0.0'
      const soma = this.setores.reduce((acc, setor) => acc + setor.temperatura, 0)
      return (soma / this.setores.length).toFixed(1)
    },
    getSetoresCriticos() {
      return this.setores.filter(setor => setor.alerta).length
    },
    getStatusVariant() {
      const criticos = this.getSetoresCriticos()
      if (criticos > this.setores.length * 0.3) return 'danger'
      if (criticos > 0) return 'warning'
      return 'success'
    },
    getStatusTexto() {
      const criticos = this.getSetoresCriticos()
      if (criticos > this.setores.length * 0.3) return 'CRÍTICO'
      if (criticos > 0) return 'ATENÇÃO'
      return 'NORMAL'
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

.setor-cell {
  transition: all 0.3s ease;
}

.setor-cell:hover {
  transform: scale(1.05);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.setor-alerta {
  animation: pulseAlert 2s infinite;
}

@keyframes pulseAlert {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@media (max-width: 768px) {
  .setor-cell {
    width: 30px !important;
    height: 30px !important;
    font-size: 8px !important;
  }
}
</style>
