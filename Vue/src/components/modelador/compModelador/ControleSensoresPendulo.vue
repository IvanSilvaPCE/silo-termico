
<template>
  <div class="card mb-3">
    <div class="card-header bg-info text-white">
      <h6 class="mb-0"><i class="fa fa-wrench me-2"></i>Controle de Sensores por Pêndulo</h6>
    </div>
    <div class="card-body p-2">
      <div v-if="!modeloArcoAtual" class="alert alert-warning p-2">
        <small>Selecione um modelo de arco para configurar os sensores por pêndulo.</small>
      </div>

      <div v-else>
        <!-- Informações do Modelo -->
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <small class="fw-bold">Modelo: {{ modeloNome }}</small>
            <span class="badge bg-primary">{{ quantidadePendulos }} pêndulos</span>
          </div>
        </div>

        <!-- Controles por Pêndulo -->
        <div class="row g-2">
          <div 
            v-for="numeroPendulo in quantidadePendulos" 
            :key="numeroPendulo"
            class="col-12"
          >
            <div class="d-flex align-items-center justify-content-between p-2 border rounded">
              <div class="flex-grow-1">
                <strong class="small">Pêndulo {{ numeroPendulo }}</strong>
                <div class="text-muted small">
                  {{ sensoresPorPendulo[numeroPendulo] || 1 }} sensor{{ (sensoresPorPendulo[numeroPendulo] || 1) > 1 ? 'es' : '' }}
                </div>
              </div>
              
              <div class="input-group input-group-sm" style="max-width: 120px;">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm"
                  @click="alterarSensores(numeroPendulo, -1)"
                  :disabled="(sensoresPorPendulo[numeroPendulo] || 1) <= 1"
                  title="Diminuir sensores"
                >
                  -
                </button>
                
                <input 
                  type="number" 
                  class="form-control form-control-sm text-center"
                  :value="sensoresPorPendulo[numeroPendulo] || 1"
                  @change="setSensoresPendulo(numeroPendulo, $event.target.value)"
                  min="1" 
                  max="15"
                />
                
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm"
                  @click="alterarSensores(numeroPendulo, 1)"
                  :disabled="(sensoresPorPendulo[numeroPendulo] || 1) >= 15"
                  title="Aumentar sensores"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Controles Globais -->
        <div class="mt-3">
          <div class="row g-2">
            <div class="col-6">
              <button 
                type="button" 
                class="btn btn-outline-success btn-sm w-100"
                @click="aplicarSensoresUniformes"
              >
                <i class="fa fa-bar-chart me-1"></i>Aplicar Uniforme
              </button>
            </div>
            <div class="col-6">
              <button 
                type="button" 
                class="btn btn-outline-warning btn-sm w-100"
                @click="resetarSensoresParaPadrao"
              >
                <i class="fa fa-refresh me-1"></i>Resetar Padrão
              </button>
            </div>
          </div>
        </div>

        <!-- Resumo -->
        <div class="mt-3">
          <div class="alert alert-light p-2">
            <small class="fw-bold">Resumo:</small><br>
            <small>
              Total: {{ totalSensores }} sensores distribuídos em {{ quantidadePendulos }} pêndulos<br>
              Média: {{ mediaSensores.toFixed(1) }} sensores por pêndulo
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControleSensoresPendulo',
  props: {
    modeloArcoAtual: Number,
    modeloNome: String,
    quantidadePendulos: {
      type: Number,
      default: 3
    },
    sensoresPorPendulo: {
      type: Object,
      default: () => ({})
    }
  },
  emits: [
    'alterar-sensores-pendulo',
    'set-sensores-pendulo',
    'aplicar-sensores-uniformes',
    'resetar-sensores-padrao'
  ],
  computed: {
    totalSensores() {
      let total = 0
      for (let i = 1; i <= this.quantidadePendulos; i++) {
        total += this.sensoresPorPendulo[i] || 1
      }
      return total
    },
    
    mediaSensores() {
      return this.totalSensores / this.quantidadePendulos
    }
  },
  methods: {
    alterarSensores(numeroPendulo, incremento) {
      this.$emit('alterar-sensores-pendulo', numeroPendulo, incremento)
    },

    setSensoresPendulo(numeroPendulo, valor) {
      const novoValor = parseInt(valor)
      if (!isNaN(novoValor) && novoValor >= 1 && novoValor <= 15) {
        this.$emit('set-sensores-pendulo', numeroPendulo, novoValor)
      }
    },

    aplicarSensoresUniformes() {
      this.$emit('aplicar-sensores-uniformes')
    },

    resetarSensoresParaPadrao() {
      this.$emit('resetar-sensores-padrao')
    }
  }
}
</script>

<style scoped>
.input-group-sm .btn {
  min-width: 32px;
}

.input-group-sm .form-control {
  min-width: 50px;
}

@media (max-width: 576px) {
  .input-group-sm {
    max-width: 100px !important;
  }
  
  .input-group-sm .btn {
    min-width: 28px;
    font-size: 12px;
  }
  
  .input-group-sm .form-control {
    min-width: 40px;
    font-size: 12px;
  }
}
</style>
