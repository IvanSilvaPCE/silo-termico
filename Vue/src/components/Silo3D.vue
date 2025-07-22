
<template>
  <div class="container-fluid h-100 p-3">
    <div class="row mb-3">
      <div class="col-12">
        <h4 class="text-primary mb-3">Silo 3D - Visualização</h4>
        
        <b-card>
          <template #header>
            <h6 class="mb-0">Controles 3D</h6>
          </template>
          
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="Altura do Silo" label-for="altura">
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
              <b-form-group label="Raio do Silo" label-for="raio">
                <b-form-input 
                  id="raio" 
                  v-model.number="parametros.raio" 
                  type="number" 
                  min="2" 
                  max="10"
                  @input="atualizarVisualizacao"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Número de Cabos" label-for="cabos">
                <b-form-input 
                  id="cabos" 
                  v-model.number="parametros.cabos" 
                  type="number" 
                  min="4" 
                  max="12"
                  @input="atualizarVisualizacao"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Rotação" label-for="rotacao">
                <b-form-input 
                  id="rotacao" 
                  v-model.number="parametros.rotacao" 
                  type="range" 
                  min="0" 
                  max="360"
                  @input="atualizarVisualizacao"
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
          class="d-flex justify-content-center align-items-center bg-dark rounded"
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
  name: 'Silo3D',
  data() {
    return {
      parametros: {
        altura: 10,
        raio: 5,
        cabos: 8,
        rotacao: 0
      },
      scene: null,
      camera: null,
      renderer: null,
      siloGroup: null
    }
  },
  mounted() {
    this.inicializarThreeJS()
    this.criarSilo3D()
  },
  beforeDestroy() {
    if (this.renderer) {
      this.renderer.dispose()
    }
  },
  methods: {
    inicializarThreeJS() {
      // Simulação básica do Three.js para demonstração
      this.renderizarPlaceholder()
    },
    renderizarPlaceholder() {
      const container = this.$refs.threejsContainer
      if (!container) return
      
      container.innerHTML = `
        <div class="d-flex flex-column align-items-center justify-content-center h-100 text-white">
          <div class="text-center">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="sr-only">Carregando...</span>
            </div>
            <h5>Visualização 3D do Silo</h5>
            <p class="text-muted">Altura: ${this.parametros.altura}m | Raio: ${this.parametros.raio}m</p>
            <p class="text-muted">Cabos: ${this.parametros.cabos} | Rotação: ${this.parametros.rotacao}°</p>
            <small class="text-info">
              * Three.js será implementado posteriormente
            </small>
          </div>
        </div>
      `
    },
    criarSilo3D() {
      // Implementação futura do Three.js
      this.renderizarPlaceholder()
    },
    atualizarVisualizacao() {
      this.renderizarPlaceholder()
    }
  }
}
</script>

<style scoped>
.bg-dark {
  background-color: #343a40 !important;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
