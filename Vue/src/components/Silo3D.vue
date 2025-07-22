
<template>
  <div class="container-fluid h-100 p-3">
    <div class="row">
      <div class="col-12">
        <h4 class="text-primary mb-3">Silo 3D - Visualização Tridimensional</h4>
        
        <div class="card mb-3">
          <div class="card-header">
            <h6 class="mb-0">Controles 3D do Silo</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label for="raioSilo">Raio do Silo</label>
                  <input 
                    id="raioSilo" 
                    v-model.number="parametros.raioSilo" 
                    type="number" 
                    min="1" 
                    max="10"
                    step="0.5"
                    class="form-control"
                    @input="atualizarVisualizacao"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label for="alturaSilo">Altura do Silo</label>
                  <input 
                    id="alturaSilo" 
                    v-model.number="parametros.alturaSilo" 
                    type="number" 
                    min="5" 
                    max="20"
                    step="0.5"
                    class="form-control"
                    @input="atualizarVisualizacao"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label for="nivel">Nível de Grãos %</label>
                  <input 
                    id="nivel" 
                    v-model.number="parametros.nivel" 
                    type="range" 
                    min="0" 
                    max="100"
                    class="form-control-range"
                    @input="atualizarVisualizacao"
                  />
                  <small class="text-muted">{{ parametros.nivel }}%</small>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label for="numCabos">Número de Cabos</label>
                  <input 
                    id="numCabos" 
                    v-model.number="parametros.numCabos" 
                    type="number" 
                    min="1" 
                    max="8"
                    class="form-control"
                    @input="atualizarVisualizacao"
                  />
                </div>
              </div>
            </div>
            
            <div class="row mt-3">
              <div class="col-md-4">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    v-model="parametros.autoRotate"
                    id="autoRotate"
                    @change="atualizarVisualizacao"
                  />
                  <label class="form-check-label" for="autoRotate">
                    Rotação Automática
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    v-model="parametros.mostrarAeradores"
                    id="mostrarAeradores"
                    @change="atualizarVisualizacao"
                  />
                  <label class="form-check-label" for="mostrarAeradores">
                    Mostrar Aeradores
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <button 
                  class="btn btn-outline-secondary btn-sm"
                  @click="resetarParametros"
                >
                  Resetar Parâmetros
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estatísticas dos dados -->
        <div v-if="dados" class="card mb-3">
          <div class="card-header bg-success text-white">
            <h6 class="mb-0">📈 Dados do Silo 3D</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <strong>Pêndulos:</strong> {{ Object.keys(dados.leitura || {}).length }}
              </div>
              <div class="col-md-3">
                <strong>Total Sensores:</strong> {{ totalSensores }}
              </div>
              <div class="col-md-3">
                <strong>Aeradores:</strong> {{ dados.dados_layout?.aeradores?.na || 0 }}
              </div>
              <div class="col-md-3">
                <strong>Temperatura Média:</strong> {{ temperaturaMedia }}°C
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row h-75">
      <div class="col-12">
        <div 
          class="d-flex justify-content-center align-items-center bg-gradient rounded position-relative"
          :style="{ 
            minHeight: 'calc(100vh - 280px)',
            maxHeight: 'calc(100vh - 180px)',
            overflow: 'hidden',
            background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)'
          }"
        >
          <!-- Canvas Three.js será renderizado aqui -->
          <div ref="threejsContainer" class="w-100 h-100"></div>
          
          <!-- Controles overlay -->
          <div class="position-absolute bottom-0 start-0 p-3 bg-dark text-white rounded-top-end" style="z-index: 1000;">
            <small>
              <div><strong>Raio:</strong> {{ parametros.raioSilo }}m</div>
              <div><strong>Altura:</strong> {{ parametros.alturaSilo }}m</div>
              <div><strong>Nível:</strong> <span class="text-warning">{{ parametros.nivel }}%</span></div>
              <div><strong>Cabos:</strong> {{ parametros.numCabos }}</div>
            </small>
          </div>

          <!-- Indicador de temperatura -->
          <div v-if="dados" class="position-absolute top-0 end-0 p-3">
            <div class="card bg-dark text-white" style="min-width: 200px;">
              <div class="card-header p-2">
                <h6 class="mb-0">🌡️ Temperaturas</h6>
              </div>
              <div class="card-body p-2">
                <div class="d-flex justify-content-between">
                  <small>Mínima:</small>
                  <span class="text-info">{{ temperaturaMinima }}°C</span>
                </div>
                <div class="d-flex justify-content-between">
                  <small>Máxima:</small>
                  <span class="text-danger">{{ temperaturaMaxima }}°C</span>
                </div>
                <div class="d-flex justify-content-between">
                  <small>Média:</small>
                  <span class="text-warning">{{ temperaturaMedia }}°C</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading indicator -->
          <div 
            v-if="carregando"
            class="position-absolute top-50 start-50 translate-middle text-dark"
          >
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <div class="mt-2 text-center">Carregando modelo 3D...</div>
          </div>

          <!-- Fallback quando não há Three.js -->
          <div 
            v-if="!threejsDisponivel"
            class="d-flex flex-column align-items-center justify-content-center h-100 text-dark text-center p-4"
          >
            <div class="mb-4">
              <div class="display-1 text-primary">🌾</div>
            </div>
            <h5>Visualização 3D do Silo</h5>
            <div class="row text-center mt-3 w-75">
              <div class="col-4">
                <div class="card border-primary">
                  <div class="card-body p-2">
                    <small class="text-muted">Raio</small><br>
                    <strong class="text-primary">{{ parametros.raioSilo }}m</strong>
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div class="card border-success">
                  <div class="card-body p-2">
                    <small class="text-muted">Altura</small><br>
                    <strong class="text-success">{{ parametros.alturaSilo }}m</strong>
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div class="card border-warning">
                  <div class="card-body p-2">
                    <small class="text-muted">Cabos</small><br>
                    <strong class="text-warning">{{ parametros.numCabos }}</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-4 w-75">
              <div class="d-flex justify-content-between mb-2">
                <small>Nível de Grãos</small>
                <small class="text-warning">{{ parametros.nivel }}%</small>
              </div>
              <div class="progress" style="height: 12px;">
                <div 
                  class="progress-bar bg-gradient" 
                  :style="{ 
                    width: parametros.nivel + '%',
                    background: 'linear-gradient(90deg, #ffc107, #28a745)'
                  }"
                ></div>
              </div>
            </div>

            <div v-if="dados" class="mt-4 text-center">
              <div class="row">
                <div class="col-6">
                  <small class="text-muted">Sensores Ativos</small><br>
                  <span class="badge bg-success">{{ sensoresAtivos }}</span>
                </div>
                <div class="col-6">
                  <small class="text-muted">Temperatura Média</small><br>
                  <span class="badge bg-info">{{ temperaturaMedia }}°C</span>
                </div>
              </div>
            </div>
            
            <small class="text-secondary mt-4 text-center">
              <div class="spinner-grow spinner-grow-sm me-2" role="status"></div>
              Sistema 3D com dados reais do silo
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Silo3D',
  data() {
    return {
      parametros: {
        raioSilo: 3,
        alturaSilo: 12,
        nivel: 66.6,
        numCabos: 5,
        autoRotate: true,
        mostrarAeradores: true
      },
      dados: null,
      carregando: true,
      threejsDisponivel: false
    }
  },
  computed: {
    totalSensores() {
      if (!this.dados?.leitura) return 0
      let total = 0
      Object.values(this.dados.leitura).forEach(sensores => {
        total += Object.keys(sensores).length
      })
      return total
    },
    sensoresAtivos() {
      if (!this.dados?.leitura) return 0
      let ativos = 0
      Object.values(this.dados.leitura).forEach(sensores => {
        Object.values(sensores).forEach(([, , , , ativo]) => {
          if (ativo) ativos++
        })
      })
      return ativos
    },
    temperaturaMinima() {
      if (!this.dados?.leitura) return 0
      let min = Infinity
      Object.values(this.dados.leitura).forEach(sensores => {
        Object.values(sensores).forEach(([temp, , , , ativo]) => {
          if (ativo && temp < min) min = temp
        })
      })
      return min === Infinity ? 0 : min.toFixed(1)
    },
    temperaturaMaxima() {
      if (!this.dados?.leitura) return 0
      let max = -Infinity
      Object.values(this.dados.leitura).forEach(sensores => {
        Object.values(sensores).forEach(([temp, , , , ativo]) => {
          if (ativo && temp > max) max = temp
        })
      })
      return max === -Infinity ? 0 : max.toFixed(1)
    },
    temperaturaMedia() {
      if (!this.dados?.leitura) return 0
      let soma = 0
      let count = 0
      Object.values(this.dados.leitura).forEach(sensores => {
        Object.values(sensores).forEach(([temp, , , , ativo]) => {
          if (ativo) {
            soma += temp
            count++
          }
        })
      })
      return count > 0 ? (soma / count).toFixed(1) : 0
    }
  },
  mounted() {
    this.inicializarDados()
    this.verificarThreeJS()
  },
  methods: {
    async inicializarDados() {
      try {
        this.carregando = true
        
        // Carregar dados simulados do silo
        const dadosSimulados = {
          dados_layout: {
            desenho_corte_silo: {
              lb: 200,
              hs: 180,
              hb: 15,
              eb: 5
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
              '6': [26.1, false, false, false, true],
              '7': [24.8, false, false, false, true],
              '8': [25.5, false, false, false, true]
            },
            'P2': {
              '1': [26.3, false, false, false, true],
              '2': [27.1, false, false, false, true],
              '3': [25.8, false, false, false, true],
              '4': [28.2, false, false, false, true],
              '5': [27.5, false, false, false, true],
              '6': [26.9, false, false, false, true],
              '7': [28.1, false, false, false, true]
            },
            'P3': {
              '1': [21.5, false, false, false, true],
              '2': [22.1, false, false, false, true],
              '3': [20.8, false, false, false, true],
              '4': [23.2, false, false, false, true],
              '5': [22.9, false, false, false, true],
              '6': [21.4, false, false, false, true],
              '7': [22.7, false, false, false, true],
              '8': [23.1, false, false, false, true]
            },
            'P4': {
              '1': [29.1, false, false, false, true],
              '2': [30.2, false, false, false, true],
              '3': [28.8, false, false, false, true],
              '4': [31.1, false, false, false, true],
              '5': [29.7, false, false, false, true],
              '6': [30.5, false, false, false, true]
            },
            'P5': {
              '1': [24.4, false, false, false, true],
              '2': [25.1, false, false, false, true],
              '3': [23.8, false, false, false, true],
              '4': [25.9, false, false, false, true],
              '5': [24.7, false, false, false, true],
              '6': [25.3, false, false, false, true],
              '7': [24.9, false, false, false, true]
            }
          },
          dados: {
            nivel: 66.6
          },
          motor: {
            statusMotor: [0, 3, 1, 4]
          }
        }
        
        this.dados = dadosSimulados
        
        // Ajustar parâmetros baseados nos dados
        this.parametros.numCabos = Object.keys(dadosSimulados.leitura).length
        this.parametros.nivel = dadosSimulados.dados.nivel
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        this.carregando = false
      }
    },

    verificarThreeJS() {
      // Simular verificação do Three.js
      setTimeout(() => {
        this.threejsDisponivel = true
        if (this.threejsDisponivel) {
          this.inicializarVisualizacao()
        }
      }, 1000)
    },

    inicializarVisualizacao() {
      if (!this.$refs.threejsContainer) return
      
      this.renderizarCena3D()
    },

    renderizarCena3D() {
      const container = this.$refs.threejsContainer
      if (!container) return
      
      // Limpar container
      container.innerHTML = ''
      
      // Criar simulação de cena 3D
      const cenaDiv = document.createElement('div')
      cenaDiv.className = 'd-flex flex-column align-items-center justify-content-center h-100 position-relative'
      cenaDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      cenaDiv.style.color = 'white'
      
      // Elementos da cena
      const elementos = [
        // Silo principal
        `<div class="position-relative mb-4" style="perspective: 1000px;">
          <div class="silo-3d" style="
            width: ${this.parametros.raioSilo * 40}px;
            height: ${this.parametros.alturaSilo * 20}px;
            background: linear-gradient(45deg, #e8e8e8, #b8b8b8);
            border-radius: ${this.parametros.raioSilo * 20}px ${this.parametros.raioSilo * 20}px 0 0;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: rotateY(${this.parametros.autoRotate ? '15deg' : '0deg'}) rotateX(10deg);
            transition: transform 0.5s ease;
          ">
            <!-- Topo cônico -->
            <div style="
              position: absolute;
              top: -20px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: ${this.parametros.raioSilo * 22}px solid transparent;
              border-right: ${this.parametros.raioSilo * 22}px solid transparent;
              border-bottom: 40px solid #999999;
            "></div>
            
            <!-- Nível de grãos -->
            <div style="
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: ${this.parametros.nivel}%;
              background: linear-gradient(45deg, #D4B886, #C8A876);
              border-radius: 0 0 ${this.parametros.raioSilo * 20}px ${this.parametros.raioSilo * 20}px;
              opacity: 0.8;
            "></div>
            
            <!-- Cabos -->
            ${Array.from({ length: this.parametros.numCabos }, (_, i) => {
              const angle = (i / this.parametros.numCabos) * 360
              const radius = this.parametros.raioSilo * 15
              const x = Math.cos(angle * Math.PI / 180) * radius + this.parametros.raioSilo * 20
              const y = Math.sin(angle * Math.PI / 180) * radius + this.parametros.raioSilo * 20
              return `
                <div style="
                  position: absolute;
                  left: ${x}px;
                  top: ${y}px;
                  width: 2px;
                  height: 80%;
                  background: #1a1a1a;
                  transform-origin: top;
                  z-index: 2;
                ">
                  <!-- Sensores no cabo -->
                  ${this.renderizarSensoresCabo(i + 1)}
                </div>
              `
            }).join('')}
          </div>
        </div>`,
        
        // Informações da cena
        `<div class="text-center">
          <h5 class="mb-3">Silo 3D - Visualização Ativa</h5>
          <div class="row text-center">
            <div class="col-3">
              <div class="card bg-transparent border-light">
                <div class="card-body p-2">
                  <small class="text-light">Pêndulos</small><br>
                  <strong class="text-primary">${this.parametros.numCabos}</strong>
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="card bg-transparent border-light">
                <div class="card-body p-2">
                  <small class="text-light">Sensores</small><br>
                  <strong class="text-success">${this.totalSensores}</strong>
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="card bg-transparent border-light">
                <div class="card-body p-2">
                  <small class="text-light">Nível</small><br>
                  <strong class="text-warning">${this.parametros.nivel}%</strong>
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="card bg-transparent border-light">
                <div class="card-body p-2">
                  <small class="text-light">Aeradores</small><br>
                  <strong class="text-info">${this.dados?.dados_layout?.aeradores?.na || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>`,

        // Aeradores (se ativados)
        this.parametros.mostrarAeradores ? `
          <div class="mt-4">
            <div class="d-flex justify-content-center gap-3">
              ${Array.from({ length: this.dados?.dados_layout?.aeradores?.na || 4 }, (_, i) => `
                <div class="aerador-3d" style="
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  background: ${this.getCorAerador3D(i + 1)};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  font-weight: bold;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                  ${this.getStatusAerador3D(i + 1) === 3 ? 'animation: spin 2s linear infinite;' : ''}
                ">
                  AE-${i + 1}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''
      ]
      
      cenaDiv.innerHTML = elementos.filter(Boolean).join('')
      container.appendChild(cenaDiv)
      
      // Adicionar CSS para animações
      this.adicionarEstilosAnimacao()
      
      // Iniciar rotação automática se ativada
      if (this.parametros.autoRotate) {
        this.iniciarRotacaoAutomatica(cenaDiv)
      }
    },

    renderizarSensoresCabo(numCabo) {
      if (!this.dados?.leitura || !this.dados.leitura[`P${numCabo}`]) return ''
      
      const sensores = this.dados.leitura[`P${numCabo}`]
      const numSensores = Object.keys(sensores).length
      
      return Object.entries(sensores).map(([sensorId, [temp, , , , ativo]], index) => {
        const yPos = (index / numSensores) * 70 + 10
        const cor = ativo ? this.corFaixaExata(temp) : '#666666'
        
        return `
          <div style="
            position: absolute;
            left: -4px;
            top: ${yPos}%;
            width: 10px;
            height: 6px;
            background: ${cor};
            border-radius: 2px;
            z-index: 3;
            box-shadow: 0 1px 3px rgba(0,0,0,0.5);
          " title="P${numCabo}S${sensorId}: ${temp}°C"></div>
        `
      }).join('')
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

    getCorAerador3D(id) {
      const status = this.getStatusAerador3D(id)
      const cores = {
        0: "#c5c5c5", // desligado
        1: "#ffeb3b", // startando
        3: "#31dd0f", // ligado
        4: "#ff0000"  // erro
      }
      return cores[status] || cores[0]
    },

    getStatusAerador3D(id) {
      return this.dados?.motor?.statusMotor?.[id - 1] ?? 0
    },

    adicionarEstilosAnimacao() {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .silo-3d:hover {
          transform: rotateY(25deg) rotateX(15deg) scale(1.05);
        }
        
        .aerador-3d {
          transition: all 0.3s ease;
        }
        
        .aerador-3d:hover {
          transform: scale(1.2);
        }
      `
      document.head.appendChild(style)
    },

    iniciarRotacaoAutomatica(elemento) {
      if (!this.parametros.autoRotate) return
      
      let angulo = 15
      const animar = () => {
        if (!this.parametros.autoRotate) return
        
        angulo += 0.5
        const silo = elemento.querySelector('.silo-3d')
        if (silo) {
          silo.style.transform = `rotateY(${angulo}deg) rotateX(10deg)`
        }
        
        setTimeout(() => requestAnimationFrame(animar), 100)
      }
      
      animar()
    },

    atualizarVisualizacao() {
      if (this.threejsDisponivel) {
        this.renderizarCena3D()
      }
    },

    resetarParametros() {
      this.parametros = {
        raioSilo: 3,
        alturaSilo: 12,
        nivel: 66.6,
        numCabos: 5,
        autoRotate: true,
        mostrarAeradores: true
      }
      this.atualizarVisualizacao()
    }
  }
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.form-control-range {
  width: 100%;
}

.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.progress {
  background-color: rgba(255, 255, 255, 0.2);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.spinner-grow {
  animation: pulse 1.5s infinite;
}
</style>
