
<template>
  <div class="card mb-3">
    <div class="card-header text-white" style="background-color: #06335E;">
      <h6 class="mb-0">⬇️ Configuração do Fundo</h6>
    </div>
    <div class="card-body">
      <!-- Seletor do Tipo de Fundo -->
      <div class="row g-2 mb-3">
        <div class="col-12">
          <label class="small fw-bold">Tipo do Fundo:</label>
          <div class="input-group input-group-sm">
            <select class="form-select" v-model="configArmazem.tipo_fundo" @change="$emit('armazem-change')">
              <option :value="0">Reto</option>
              <option :value="1">Funil/V</option>
              <option :value="2">Duplo V</option>
            </select>
            <button type="button" class="btn btn-outline-secondary" @click="resetField('tipo_fundo', 0)"
              title="Reset">
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Controles específicos para Fundo Reto -->
      <div v-if="configArmazem.tipo_fundo === 0" class="alert alert-light p-2">
        <h6 class="small mb-2">Configurações do Fundo Reto:</h6>
        <div class="row g-2">
          <div class="col-12">
            <label class="form-label small">Altura do Fundo Reto:</label>
            <div class="d-flex align-items-center gap-2">
              <input v-model.number="configArmazem.altura_fundo_reto" type="range" min="0" max="50"
                class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 80px;">
                <input v-model.number="configArmazem.altura_fundo_reto" type="number" min="0" max="50"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('altura_fundo_reto', 10)" title="Reset">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Controles específicos para Funil V -->
      <div v-if="configArmazem.tipo_fundo === 1" class="alert alert-light p-2">
        <h6 class="small mb-2">Configurações do Funil V:</h6>
        <div class="row g-2">
          <div class="col-12 col-sm-6 mb-2">
            <label class="form-label small">Altura do Funil:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.altura_funil_v" type="range" min="10" max="120"
                class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.altura_funil_v" type="number" min="10" max="120"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('altura_funil_v', 18)" title="Reset">
                ×
              </button>
            </div>
          </div>
          <div class="col-12 col-sm-6 mb-2">
            <label class="form-label small">Posição da Ponta:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.posicao_ponta_v" type="range" min="-2" max="2" step="0.1"
                class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.posicao_ponta_v" type="number" min="-2" max="2" step="0.1"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('posicao_ponta_v', 0)" title="Reset">
                ×
              </button>
            </div>
          </div>
          <div class="col-12 col-sm-6 mb-2">
            <label class="form-label small">Largura da Abertura:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.largura_abertura_v" type="range" min="2" max="80"
                class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.largura_abertura_v" type="number" min="2" max="80"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('largura_abertura_v', 20)" title="Reset">
                ×
              </button>
            </div>
          </div>
          <div class="col-12 col-sm-6 mb-2">
            <label class="form-label small">Inclinação das Paredes:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.inclinacao_funil_v" type="range" min="0" max="10" step="0.1"
                class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.inclinacao_funil_v" type="number" min="0" max="10" step="0.1"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('inclinacao_funil_v', 1)" title="Reset">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Controles específicos para Duplo V -->
      <div v-if="configArmazem.tipo_fundo === 2" class="alert alert-light p-2">
        <h6 class="small mb-2">Configurações do Duplo V:</h6>
        <div class="row g-2">
          <div class="col-12 col-md-6 mb-2">
            <label class="form-label small">Altura dos Funis:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.altura_duplo_v" type="range" min="10" max="120"
                class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.altura_duplo_v" type="number" min="10" max="120"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('altura_duplo_v', 22)" title="Reset">
                ×
              </button>
            </div>
          </div>
          <div class="col-12 col-md-6 mb-2">
            <label class="form-label small">Posição V Esquerdo:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.posicao_v_esquerdo" type="range" min="-2" max="0.5"
                step="0.1" class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.posicao_v_esquerdo" type="number" min="-2" max="0.5" step="0.1"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('posicao_v_esquerdo', -1)" title="Reset">
                ×
              </button>
            </div>
          </div>
          <div class="col-12 col-md-6 mb-2">
            <label class="form-label small">Posição V Direito:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.posicao_v_direito" type="range" min="-0.5" max="2" step="0.1"
                class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.posicao_v_direito" type="number" min="-0.5" max="2" step="0.1"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('posicao_v_direito', 1)" title="Reset">
                ×
              </button>
            </div>
          </div>
          <div class="col-12 col-md-6 mb-2">
            <label class="form-label small">Largura das Aberturas:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.largura_abertura_duplo_v" type="range" min="2" max="80"
                class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.largura_abertura_duplo_v" type="number" min="2" max="80"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('largura_abertura_duplo_v', 2)" title="Reset">
                ×
              </button>
            </div>
          </div>
          <div class="col-12 col-md-6 mb-2">
            <label class="form-label small">Altura da Plataforma:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.altura_plataforma_duplo_v" type="range" min="0" max="1"
                step="0.1" class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.altura_plataforma_duplo_v" type="number" min="0" max="1" step="0.1"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('altura_plataforma_duplo_v', 0.3)" title="Reset">
                ×
              </button>
            </div>
          </div>
          <div class="col-12 col-md-6 mb-2">
            <label class="form-label small">Largura da Plataforma:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.largura_plataforma_duplo_v" type="range" min="10" max="120"
                class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.largura_plataforma_duplo_v" type="number" min="10" max="120"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('largura_plataforma_duplo_v', 10)" title="Reset">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Movimentação do Fundo (comum a todos) -->
      <div class="alert alert-warning p-2">
        <h6 class="small mb-2">🔄 Movimentação do Fundo:</h6>
        <div class="row g-2">
          <div class="col-12 col-md-6 mb-2">
            <label class="small fw-bold">Deslocamento Horizontal:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.deslocamento_horizontal_fundo" type="range" min="-100"
                max="100" class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.deslocamento_horizontal_fundo" type="number" min="-100" max="100"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('deslocamento_horizontal_fundo', 0)" title="Reset">
                ×
              </button>
            </div>
          </div>
          <div class="col-12 col-md-6 mb-2">
            <label class="small fw-bold">Deslocamento Vertical:</label>
            <div class="d-flex align-items-center gap-1">
              <input v-model.number="configArmazem.deslocamento_vertical_fundo" type="range" min="-100"
                max="100" class="form-range flex-grow-1" @input="$emit('armazem-change')" />
              <div class="input-group input-group-sm" style="width: 70px;">
                <input v-model.number="configArmazem.deslocamento_vertical_fundo" type="number" min="-100" max="100"
                  class="form-control form-control-sm text-center" @input="$emit('armazem-change')" />
              </div>
              <button type="button" class="btn btn-outline-secondary btn-sm"
                @click="resetField('deslocamento_vertical_fundo', obterDeslocamentoVerticalPadrao(configArmazem.tipo_fundo))"
                title="Reset">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfiguracaoFundo',
  props: {
    configArmazem: Object
  },
  emits: ['armazem-change'],
  methods: {
    resetField(campo, valor) {
      this.configArmazem[campo] = valor
      this.$emit('armazem-change')
    },
    obterDeslocamentoVerticalPadrao(tipoFundo) {
      switch (tipoFundo) {
        case 0: return 0  // Reto
        case 1: return 7  // Funil V
        case 2: return 10 // Duplo V
        default: return 0
      }
    }
  }
}
</script>

<style scoped>
.form-range {
  min-width: 80px;
}

.input-group-sm .form-control {
  min-height: 28px;
}

.btn-sm {
  min-width: 28px;
  padding: 0.25rem;
}

@media (max-width: 576px) {
  .d-flex.align-items-center.gap-1 {
    flex-wrap: wrap;
    gap: 0.25rem !important;
  }
  
  .form-range {
    min-width: 100px;
    margin-bottom: 0.25rem;
  }
  
  .input-group {
    width: 60px !important;
  }
  
  .btn-sm {
    min-width: 24px;
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .col-md-6 {
    margin-bottom: 0.5rem;
  }
  
  .input-group {
    width: 65px !important;
  }
}
</style>
