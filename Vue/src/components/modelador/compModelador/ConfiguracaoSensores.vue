<template>
  <div class="card mb-3">
    <div class="card-header bg-success text-white">
      <h6 class="mb-0">🌡️ Configuração dos Sensores</h6>
    </div>
    <div class="card-body">
      <!-- Seção para configurar sensores por pêndulo -->
      <div v-if="modeloArcoAtual && quantidadePendulos > 0" class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="small fw-bold text-primary">📊 Sensores por Pêndulo:</label>
          <button type="button" class="btn btn-outline-primary btn-sm"
            @click="abrirModalUniformizar" title="Aplicar mesma quantidade para todos">
            ⚖️ Uniformizar
          </button>
        </div>

        <!-- Sistema compacto com dropdown para seleção de pêndulo -->
        <div class="row g-2 mb-3">
          <div class="col-12">
            <label class="form-label small fw-bold text-white">🎯 Selecionar Pêndulo:</label>
            <select class="form-select form-select-sm w-100" v-model="penduloSelecionado">
              <option v-for="pendulo in quantidadePendulos" :key="pendulo" :value="pendulo">
                Pêndulo {{ pendulo }} - {{ getSensoresPendulo(pendulo) }} sensor{{ getSensoresPendulo(pendulo) > 1 ? 'es' : '' }}
              </option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold text-white">🔧 Quantidade de Sensores:</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text">🌡️</span>
              <button type="button" class="btn btn-outline-secondary"
                @click="alterarSensoresPendulo(penduloSelecionado, -1)" 
                :disabled="getSensoresPendulo(penduloSelecionado) <= 1">
                −
              </button>
              <input type="number" class="form-control text-center fw-bold"
                :value="getSensoresPendulo(penduloSelecionado)"
                @input="setSensoresPendulo(penduloSelecionado, parseInt($event.target.value) || 1)"
                min="1" max="32" />
              <button type="button" class="btn btn-outline-secondary"
                @click="alterarSensoresPendulo(penduloSelecionado, 1)" 
                :disabled="getSensoresPendulo(penduloSelecionado) >= 32">
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Resumo visual compacto de todos os pêndulos -->
        <div class="alert alert-light p-2 mb-3">
          <h6 class="small fw-bold mb-2">📊 Resumo dos Sensores:</h6>
          <div class="d-flex flex-wrap gap-1">
            <span v-for="pendulo in quantidadePendulos" :key="pendulo" 
              :class="['badge text-white', penduloSelecionado === pendulo ? 'bg-primary' : 'bg-secondary']"
              style="cursor: pointer; font-size: 0.75rem;"
              @click="penduloSelecionado = pendulo"
              :title="`Clique para selecionar Pêndulo ${pendulo}`">
              P{{ pendulo }}: {{ getSensoresPendulo(pendulo) }}
            </span>
          </div>
          <small class="text-muted mt-1 d-block">
            💡 Clique em um badge para selecionar o pêndulo
          </small>
        </div>

        <div class="mt-2 text-center">
          <small class="text-muted">
            Total: {{ totalSensores }} sensores em {{ quantidadePendulos }} pêndulos
          </small>
        </div>
      </div>

      <hr v-if="modeloArcoAtual && quantidadePendulos > 0" />

      <!-- Configurações Gerais dos Sensores -->
      <div class="mb-2">
        <label class="small fw-bold">Escala dos Sensores:</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.escala_sensores" type="range" min="10" max="30"
            class="form-range" @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.escala_sensores }}</span>
          <button type="button" class="btn btn-outline-secondary"
            @click="resetField('escala_sensores', 16)" title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Distância Y Sensores:</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.dist_y_sensores" type="range" min="8" max="20" class="form-range"
            @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.dist_y_sensores }}</span>
          <button type="button" class="btn btn-outline-secondary"
            @click="resetField('dist_y_sensores', 12)" title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Distância X Sensores:</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.dist_x_sensores" type="range" min="-100" max="100"
            class="form-range" @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.dist_x_sensores }}</span>
          <button type="button" class="btn btn-outline-secondary"
            @click="resetField('dist_x_sensores', 0)" title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Posição Horizontal:</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.posicao_horizontal" type="range" min="-150" max="150"
            class="form-range" @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.posicao_horizontal }}</span>
          <button type="button" class="btn btn-outline-secondary"
            @click="resetField('posicao_horizontal', 0)" title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Posição Vertical:</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.posicao_vertical" type="range" min="-100" max="100"
            class="form-range" @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.posicao_vertical }}</span>
          <button type="button" class="btn btn-outline-secondary"
            @click="resetField('posicao_vertical', 0)" title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Afastamento Vertical Pêndulo:</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.afastamento_vertical_pendulo" type="range" min="-50" max="50"
            class="form-range" @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.afastamento_vertical_pendulo }}</span>
          <button type="button" class="btn btn-outline-secondary"
            @click="resetField('afastamento_vertical_pendulo', 0)" title="Reset">
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para Uniformizar Sensores -->
    <div v-if="mostrarModalUniformizar" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">⚖️ Uniformizar Sensores</h5>
            <button type="button" class="btn-close btn-close-white" @click="fecharModalUniformizar"></button>
          </div>
          <div class="modal-body">
            <p class="mb-3">Aplicar a mesma quantidade de sensores para todos os {{ quantidadePendulos }} pêndulos?</p>
            
            <div class="mb-3">
              <label class="form-label small fw-bold">Quantidade de sensores:</label>
              <div class="input-group input-group-sm">
                <button type="button" class="btn btn-outline-secondary"
                  @click="quantidadeUniformizar = Math.max(1, quantidadeUniformizar - 1)">
                  −
                </button>
                <input type="number" class="form-control text-center fw-bold"
                  v-model.number="quantidadeUniformizar" min="1" max="32" />
                <button type="button" class="btn btn-outline-secondary"
                  @click="quantidadeUniformizar = Math.min(32, quantidadeUniformizar + 1)">
                  +
                </button>
              </div>
            </div>

            <div class="alert alert-info p-2">
              <small>
                <strong>Resultado:</strong> Todos os {{ quantidadePendulos }} pêndulos terão {{ quantidadeUniformizar }} sensor{{ quantidadeUniformizar > 1 ? 'es' : '' }} cada.
              </small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" @click="fecharModalUniformizar">
              Cancelar
            </button>
            <button type="button" class="btn btn-primary btn-sm" @click="confirmarUniformizar">
              ⚖️ Aplicar Uniformização
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfiguracaoSensores',
  props: {
    configArmazem: Object,
    modeloArcoAtual: Number,
    quantidadePendulos: {
      type: Number,
      default: 0
    },
    sensoresPorPendulo: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['armazem-change', 'sensores-cabo-change', 'aplicar-sensores-uniformes'],
  data() {
    return {
      penduloSelecionado: 1,
      mostrarModalUniformizar: false,
      quantidadeUniformizar: 1
    }
  },
  watch: {
    quantidadePendulos(novaQuantidade) {
      // Garantir que o pêndulo selecionado seja válido
      if (this.penduloSelecionado > novaQuantidade) {
        this.penduloSelecionado = Math.max(1, novaQuantidade)
      }
    }
  },
  computed: {
    totalSensores() {
      let total = 0
      for (let i = 1; i <= this.quantidadePendulos; i++) {
        total += this.getSensoresPendulo(i)
      }
      return total
    }
  },
  methods: {
    resetField(campo, valor) {
      this.configArmazem[campo] = valor
      this.$emit('armazem-change')
    },

    getSensoresPendulo(numeroPendulo) {
      return this.sensoresPorPendulo[numeroPendulo] || 1
    },

    setSensoresPendulo(numeroPendulo, quantidade) {
      const qtd = Math.max(1, Math.min(32, quantidade))
      console.log('🔧 [ConfiguracaoSensores] setSensoresPendulo:', { numeroPendulo, quantidade: qtd })
      this.$emit('sensores-cabo-change', { numeroPendulo, quantidade: qtd })
    },

    alterarSensoresPendulo(numeroPendulo, incremento) {
      const qtdAtual = this.getSensoresPendulo(numeroPendulo)
      const novaQtd = Math.max(1, Math.min(32, qtdAtual + incremento))
      console.log('🔧 [ConfiguracaoSensores] alterarSensoresPendulo:', { numeroPendulo, qtdAtual, novaQtd })
      this.$emit('sensores-cabo-change', { numeroPendulo, quantidade: novaQtd })
    },

    abrirModalUniformizar() {
      // Usar a quantidade do pêndulo selecionado como padrão
      this.quantidadeUniformizar = this.getSensoresPendulo(this.penduloSelecionado)
      this.mostrarModalUniformizar = true
    },

    fecharModalUniformizar() {
      this.mostrarModalUniformizar = false
    },

    confirmarUniformizar() {
      console.log('🔧 [ConfiguracaoSensores] aplicarSensoresUniformes:', {
        quantidade: this.quantidadeUniformizar,
        pendulos: this.quantidadePendulos
      })
      
      this.$emit('aplicar-sensores-uniformes', {
        quantidade: this.quantidadeUniformizar,
        totalPendulos: this.quantidadePendulos
      })
      
      this.fecharModalUniformizar()
    },

    // Garantir que o pêndulo selecionado seja válido ao inicializar
    mounted() {
      if (this.quantidadePendulos > 0) {
        this.penduloSelecionado = Math.min(this.penduloSelecionado, this.quantidadePendulos)
      }
    }
  }
}
</script>

<style scoped>
.badge {
  transition: all 0.2s ease;
  user-select: none;
}

.badge:hover {
  transform: scale(1.05);
  opacity: 0.8;
}

.badge.bg-primary {
  box-shadow: 0 2px 4px rgba(13, 110, 253, 0.3);
}

.badge.bg-secondary:hover {
  background-color: #6c757d !important;
}

.alert-light {
  border: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.input-group-sm .btn {
  font-size: 0.875rem;
  font-weight: bold;
}

.input-group-sm .input-group-text {
  font-size: 0.875rem;
  font-weight: bold;
  background-color: #e9ecef;
  border-color: #ced4da;
}

@media (max-width: 576px) {
  .badge {
    font-size: 0.65rem !important;
    margin: 1px;
  }
  
  .input-group-sm .btn {
    min-width: 32px !important;
    font-size: 0.75rem;
  }
  
  .input-group-sm .form-control {
    min-width: 60px !important;
    font-size: 0.875rem;
  }
  
  .input-group-sm .input-group-text {
    font-size: 0.75rem;
    min-width: 32px;
  }
}
</style>