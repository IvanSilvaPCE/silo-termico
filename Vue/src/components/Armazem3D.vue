
<template>
  <div class="container-fluid h-100 p-3">
    <div class="row">
      <div class="col-12">
        <h4 class="text-primary mb-3">Armazém 3D - Visualização Completa</h4>
        
        <div class="card mb-3">
          <div class="card-header">
            <h6 class="mb-0">Controles 3D do Armazém</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label for="largura">Largura</label>
                  <input 
                    id="largura" 
                    v-model.number="parametros.largura" 
                    type="number" 
                    min="10" 
                    max="50"
                    class="form-control"
                    @input="atualizarVisualizacao"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label for="profundidade">Profundidade</label>
                  <input 
                    id="profundidade" 
                    v-model.number="parametros.profundidade" 
                    type="number" 
                    min="10" 
                    max="50"
                    class="form-control"
                    @input="atualizarVisualizacao"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label for="altura">Altura</label>
                  <input 
                    id="altura" 
                    v-model.number="parametros.altura" 
                    type="number" 
                    min="5" 
                    max="20"
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
                <button 
                  class="btn btn-outline-info btn-sm"
                  @click="sincronizarModelador"
                >
                  Sincronizar com Modelador
                </button>
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

        <!-- Estatísticas dos dados reais -->
        <div v-if="dados && analiseArcos" class="card mb-3">
          <div class="card-header bg-info text-white">
            <h6 class="mb-0">📊 Estatísticas dos Dados Reais</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <strong>Arcos:</strong> {{ analiseArcos.totalArcos }}
              </div>
              <div class="col-md-3">
                <strong>Pêndulos:</strong> {{ totalPendulos }}
              </div>
              <div class="col-md-3">
                <strong>Sensores:</strong> {{ totalSensores }}
              </div>
              <div class="col-md-3">
                <strong>Aeradores:</strong> {{ totalAeradores }}
              </div>
            </div>
            <hr />
            <div class="row">
              <div class="col-md-4">
                <strong>Por Célula:</strong>
              </div>
              <div class="col-md-8">
                <div class="d-flex gap-3">
                  <span v-for="(count, celula) in totalSensoresPorCelula" :key="celula">
                    Célula {{ celula }}: {{ count }} sensores
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row h-75">
      <div class="col-12">
        <div 
          class="d-flex justify-content-center align-items-center bg-secondary rounded position-relative"
          :style="{ 
            minHeight: 'calc(100vh - 300px)',
            maxHeight: 'calc(100vh - 200px)',
            overflow: 'hidden'
          }"
        >
          <!-- Canvas Three.js será renderizado aqui -->
          <div ref="threejsContainer" class="w-100 h-100"></div>
          
          <!-- Controles overlay -->
          <div class="position-absolute bottom-0 start-0 p-3 bg-dark text-white rounded-top-end" style="z-index: 1000;">
            <small>
              <div><strong>Dimensões:</strong> {{ parametros.largura }}m x {{ parametros.profundidade }}m x {{ parametros.altura }}m</div>
              <div><strong>Nível:</strong> <span class="text-warning">{{ parametros.nivel }}%</span></div>
              <div><strong>Status:</strong> <span class="text-info">Visualização 3D Ativa</span></div>
            </small>
          </div>

          <!-- Loading indicator -->
          <div 
            v-if="carregando"
            class="position-absolute top-50 start-50 translate-middle text-white"
          >
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <div class="mt-2">Carregando modelo 3D...</div>
          </div>

          <!-- Fallback quando não há Three.js -->
          <div 
            v-if="!threejsDisponivel"
            class="d-flex flex-column align-items-center justify-content-center h-100 text-white text-center p-4"
          >
            <div class="mb-4">
              <div class="display-1 text-primary">🏢</div>
            </div>
            <h5>Visualização 3D do Armazém</h5>
            <div class="row text-center mt-3">
              <div class="col-6">
                <small class="text-muted">Dimensões:</small><br>
                <span>{{ parametros.largura }}m x {{ parametros.profundidade }}m x {{ parametros.altura }}m</span>
              </div>
              <div class="col-6">
                <small class="text-muted">Nível de Grãos:</small><br>
                <span class="text-warning">{{ parametros.nivel }}%</span>
              </div>
            </div>
            <div class="mt-4 w-50">
              <div class="progress" style="height: 20px;">
                <div 
                  class="progress-bar bg-warning" 
                  role="progressbar" 
                  :style="{ width: parametros.nivel + '%' }"
                  :aria-valuenow="parametros.nivel" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {{ parametros.nivel }}%
                </div>
              </div>
            </div>
            <small class="text-info mt-3 d-block">
              * Implementação Three.js está sendo carregada...
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Armazem3D',
  data() {
    return {
      parametros: {
        largura: 30,
        profundidade: 20,
        altura: 12,
        nivel: 75,
        autoRotate: true
      },
      dados: null,
      analiseArcos: null,
      config3D: null,
      carregando: true,
      threejsDisponivel: false,
      totalPendulos: 0,
      totalSensores: 0,
      totalAeradores: 0,
      totalSensoresPorCelula: { 1: 0, 2: 0, 3: 0 }
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
        
        // Carregar dados reais
        const response = await fetch("/models/modeloRotaArmazemPortal_1751897945212.json")
        const dadosCarregados = await response.json()
        this.dados = dadosCarregados

        // Analisar estrutura
        this.analiseArcos = this.analisarEstruturaArcos(dadosCarregados)
        
        // Calcular estatísticas
        this.calcularEstatisticas()

        // Carregar configuração salva
        const configArmazemSalva = localStorage.getItem("configArmazem")
        if (configArmazemSalva) {
          const configParsed = JSON.parse(configArmazemSalva)
          this.config3D = configParsed
        } else {
          this.config3D = this.obterConfigPadrao()
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        this.carregando = false
      }
    },

    verificarThreeJS() {
      // Simular verificação do Three.js (seria implementado com import dinâmico)
      setTimeout(() => {
        this.threejsDisponivel = true
        if (this.threejsDisponivel) {
          this.inicializarVisualizacao()
        }
      }, 1000)
    },

    analisarEstruturaArcos(dadosPortal) {
      if (!dadosPortal?.arcos) return null

      const analise = {
        totalArcos: Object.keys(dadosPortal.arcos).length,
        arcos: {},
        estatisticas: {
          totalPendulos: 0,
          totalSensores: 0
        }
      }

      Object.entries(dadosPortal.arcos).forEach(([numeroArco, pendulos]) => {
        const pendulosDoArco = Object.keys(pendulos)
        const infoArco = {
          numeroArco: parseInt(numeroArco),
          pendulos: [],
          totalPendulos: pendulosDoArco.length,
          totalSensores: 0
        }

        pendulosDoArco.forEach(numeroPendulo => {
          const sensores = pendulos[numeroPendulo]
          const numerosSensores = Object.keys(sensores)
          const infoPendulo = {
            numero: parseInt(numeroPendulo),
            totalSensores: numerosSensores.length,
            sensores: sensores
          }

          infoArco.pendulos.push(infoPendulo)
          infoArco.totalSensores += infoPendulo.totalSensores
        })

        analise.arcos[numeroArco] = infoArco
        analise.estatisticas.totalPendulos += infoArco.totalPendulos
        analise.estatisticas.totalSensores += infoArco.totalSensores
      })

      return analise
    },

    calcularEstatisticas() {
      if (!this.dados?.configuracao?.layout_topo || !this.analiseArcos) return

      const layoutTopo = this.dados.configuracao.layout_topo
      this.totalAeradores = layoutTopo.aeradores ? Object.keys(layoutTopo.aeradores).length : 0
      
      let totalPendulos = 0
      const sensoresPorCelula = { 1: 0, 2: 0, 3: 0 }
      
      if (layoutTopo) {
        Object.entries(layoutTopo).forEach(([arcoKey, arcoData]) => {
          if (arcoKey === 'celulas' || arcoKey === 'aeradores') return
          
          const sensores = arcoData.sensores || {}
          const celula = arcoData.celula
          const numSensores = Object.keys(sensores).length
          
          totalPendulos += numSensores
          if (celula >= 1 && celula <= 3) {
            sensoresPorCelula[celula] += numSensores
          }
        })
      }

      this.totalPendulos = totalPendulos
      this.totalSensores = this.analiseArcos.estatisticas.totalSensores
      this.totalSensoresPorCelula = sensoresPorCelula
    },

    obterConfigPadrao() {
      return {
        pb: 185,
        lb: 350,
        hb: 30,
        hf: 5,
        lf: 250,
        le: 15,
        ht: 50,
        tipo_telhado: 1,
        tipo_fundo: 0,
        intensidade_fundo: 20,
        curvatura_topo: 30
      }
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
      
      // Criar simulação de cena 3D (placeholder até implementar Three.js completo)
      const cenaDiv = document.createElement('div')
      cenaDiv.className = 'd-flex flex-column align-items-center justify-content-center h-100 text-white'
      cenaDiv.style.background = 'linear-gradient(45deg, #1a1a1a, #333333)'
      
      const elementos = [
        `<div class="mb-4">
          <div class="display-1" style="font-size: 4rem;">🏭</div>
        </div>`,
        `<h5 class="text-center">Armazém 3D - Visualização Ativa</h5>`,
        `<div class="row text-center mt-3 w-75">
          <div class="col-4">
            <div class="card bg-dark border-secondary">
              <div class="card-body p-2">
                <small class="text-muted">Pêndulos</small><br>
                <strong class="text-primary">${this.totalPendulos}</strong>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="card bg-dark border-secondary">
              <div class="card-body p-2">
                <small class="text-muted">Sensores</small><br>
                <strong class="text-success">${this.totalSensores}</strong>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="card bg-dark border-secondary">
              <div class="card-body p-2">
                <small class="text-muted">Aeradores</small><br>
                <strong class="text-warning">${this.totalAeradores}</strong>
              </div>
            </div>
          </div>
        </div>`,
        `<div class="mt-4 w-50">
          <div class="d-flex justify-content-between mb-2">
            <small>Nível de Grãos</small>
            <small class="text-warning">${this.parametros.nivel}%</small>
          </div>
          <div class="progress" style="height: 8px;">
            <div 
              class="progress-bar bg-gradient" 
              style="width: ${this.parametros.nivel}%; background: linear-gradient(90deg, #ffc107, #28a745);"
            ></div>
          </div>
        </div>`,
        `<div class="mt-4 text-center">
          <div class="row">
            <div class="col-4">
              <small class="text-muted">Largura</small><br>
              <span class="badge bg-info">${this.parametros.largura}m</span>
            </div>
            <div class="col-4">
              <small class="text-muted">Profundidade</small><br>
              <span class="badge bg-info">${this.parametros.profundidade}m</span>
            </div>
            <div class="col-4">
              <small class="text-muted">Altura</small><br>
              <span class="badge bg-info">${this.parametros.altura}m</span>
            </div>
          </div>
        </div>`,
        `<small class="text-info mt-4 text-center">
          <div class="spinner-grow spinner-grow-sm me-2" role="status"></div>
          Sistema 3D inicializado com dados reais do armazém
        </small>`
      ]
      
      cenaDiv.innerHTML = elementos.join('')
      container.appendChild(cenaDiv)
      
      // Simular rotação se ativada
      if (this.parametros.autoRotate) {
        this.iniciarAnimacao(cenaDiv)
      }
    },

    iniciarAnimacao(elemento) {
      if (!this.parametros.autoRotate) return
      
      let angulo = 0
      const animar = () => {
        if (!this.parametros.autoRotate) return
        
        angulo += 0.5
        const icon = elemento.querySelector('.display-1')
        if (icon) {
          icon.style.transform = `rotateY(${angulo}deg)`
          icon.style.transition = 'transform 0.1s ease'
        }
        
        setTimeout(() => requestAnimationFrame(animar), 50)
      }
      
      animar()
    },

    atualizarVisualizacao() {
      if (this.threejsDisponivel) {
        this.renderizarCena3D()
      }
    },

    sincronizarModelador() {
      const configArmazemSalva = localStorage.getItem("configArmazem")
      if (configArmazemSalva) {
        this.config3D = JSON.parse(configArmazemSalva)
        this.atualizarVisualizacao()
        this.$toast?.success?.("Configurações do ModeladorSVG carregadas!") || 
        alert("Configurações do ModeladorSVG recarregadas!")
      } else {
        this.$toast?.warning?.("Nenhuma configuração encontrada no ModeladorSVG.") ||
        alert("Nenhuma configuração encontrada no ModeladorSVG.")
      }
    },

    resetarParametros() {
      this.parametros = {
        largura: 30,
        profundidade: 20,
        altura: 12,
        nivel: 75,
        autoRotate: true
      }
      this.atualizarVisualizacao()
    }
  }
}
</script>

<style scoped>
.bg-secondary {
  background-color: #6c757d !important;
}

.progress {
  background-color: rgba(255, 255, 255, 0.2);
}

.form-control-range {
  width: 100%;
}

.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.badge {
  font-size: 0.8rem;
}

@keyframes rotate {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
}

.display-1 {
  animation: rotate 10s linear infinite;
}

/* Pausar animação quando autoRotate está desabilitado */
.display-1.paused {
  animation-play-state: paused;
}
</style>
