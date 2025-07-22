
<template>
  <div class="container-fluid h-100 p-3">
    <div class="row mb-3">
      <div class="col-12">
        <h4 class="text-primary mb-3">Armazém 3D - Visualização</h4>
        
        <b-card>
          <template #header>
            <h6 class="mb-0">Controles 3D do Armazém</h6>
          </template>
          
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="Comprimento" label-for="comprimento">
                <b-form-input 
                  id="comprimento" 
                  v-model.number="parametros.comprimento" 
                  type="number" 
                  min="10" 
                  max="50"
                  @input="atualizarVisualizacao"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Largura" label-for="largura">
                <b-form-input 
                  id="largura" 
                  v-model.number="parametros.largura" 
                  type="number" 
                  min="10" 
                  max="50"
                  @input="atualizarVisualizacao"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Altura" label-for="altura">
                <b-form-input 
                  id="altura" 
                  v-model.number="parametros.altura" 
                  type="number" 
                  min="5" 
                  max="20"
                  @input="atualizarVisualizacao"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Nível de Grãos %" label-for="nivel">
                <b-form-input 
                  id="nivel" 
                  v-model.number="parametros.nivel" 
                  type="range" 
                  min="0" 
                  max="100"
                  @input="atualizarVisualizacao"
                ></b-form-input>
                <small class="text-muted">{{ parametros.nivel }}%</small>
              </b-form-group>
            </div>
          </div>
        </b-card>
      </div>
    </div>
    
    <div class="row h-75">
      <div class="col-12">
        <div 
          class="d-flex justify-content-center align-items-center bg-secondary rounded"
          :style="{ 
            minHeight: 'calc(100vh - 180px)',
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'hidden'
          }"
        >
          <div ref="threejsContainer" class="w-100 h-100"></div>
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
        comprimento: 30,
        largura: 20,
        altura: 12,
        nivel: 75
      }
    }
  },
  mounted() {
    this.inicializarVisualizacao()
  },
  methods: {
    inicializarVisualizacao() {
      this.renderizarPlaceholder()
    },
    renderizarPlaceholder() {
      const container = this.$refs.threejsContainer
      if (!container) return
      
      container.innerHTML = `
        <div class="d-flex flex-column align-items-center justify-content-center h-100 text-white">
          <div class="text-center">
            <div class="mb-4">
              <b-icon icon="building" font-scale="5" class="text-primary"></b-icon>
            </div>
            <h5>Visualização 3D do Armazém</h5>
            <div class="row text-center mt-3">
              <div class="col-6">
                <small class="text-muted">Dimensões:</small><br>
                <span>${this.parametros.comprimento}m x ${this.parametros.largura}m x ${this.parametros.altura}m</span>
              </div>
              <div class="col-6">
                <small class="text-muted">Nível de Grãos:</small><br>
                <span class="text-warning">${this.parametros.nivel}%</span>
              </div>
            </div>
            <div class="mt-4">
              <div class="progress" style="height: 20px;">
                <div 
                  class="progress-bar bg-warning" 
                  role="progressbar" 
                  :style="{ width: parametros.nivel + '%' }"
                  :aria-valuenow="parametros.nivel" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  ${this.parametros.nivel}%
                </div>
              </div>
            </div>
            <small class="text-info mt-3 d-block">
              * Implementação Three.js em desenvolvimento
            </small>
          </div>
        </div>
      `
    },
    atualizarVisualizacao() {
      this.renderizarPlaceholder()
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
</style>
