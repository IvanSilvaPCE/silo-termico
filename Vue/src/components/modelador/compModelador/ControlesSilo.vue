<template>
  <div v-if="tipoAtivo === 'silo'" class="card mb-3">
      <div class="card-header text-white" style="background-color: #06335E;">
        <h6 class="mb-0">⚙️ Configurações do Silo</h6>
      </div>
      <div class="card-body">
        <!-- Seção: Dimensões Básicas -->
        <div class="mb-3">
          <label class="form-label">Largura da Base: {{ configSilo.lb }}px</label>
          <div class="d-flex align-items-center">
            <input v-model.number="configSilo.lb" type="range" min="100" max="400" class="form-range me-2"
              @input="$emit('silo-change')" />
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'lb', 200)"
              title="Resetar para padrão (200)">
              ×
            </button>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Altura do Silo: {{ configSilo.hs }}px</label>
          <div class="d-flex align-items-center">
            <input v-model.number="configSilo.hs" type="range" min="100" max="300" class="form-range me-2"
              @input="$emit('silo-change')" />
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'hs', 180)"
              title="Resetar para padrão (180)">
              ×
            </button>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Altura da Base: {{ configSilo.hb }}px</label>
          <div class="d-flex align-items-center">
            <input v-model.number="configSilo.hb" type="range" min="5" max="30" class="form-range me-2"
              @input="$emit('silo-change')" />
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'hb', 15)"
              title="Resetar para padrão (15)">
              ×
            </button>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Espessura da Base: {{ configSilo.eb }}px</label>
          <div class="d-flex align-items-center">
            <input v-model.number="configSilo.eb" type="range" min="2" max="15" class="form-range me-2"
              @input="$emit('silo-change')" />
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'eb', 5)"
              title="Resetar para padrão (5)">
              ×
            </button>
          </div>
        </div>

        <!-- Seção: Sensores -->
        <h6 class="mb-3" style="color: #06335E;">📊 Configurações dos Sensores</h6>

        <div class="mb-3">
          <label class="form-label">Escala dos Sensores: {{ configSilo.escala_sensores }}px</label>
          <div class="d-flex align-items-center">
            <input v-model.number="configSilo.escala_sensores" type="range" min="8" max="32" class="form-range me-2"
              @input="$emit('silo-change')" />
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'escala_sensores', 16)"
              title="Resetar para padrão (16)">
              ×
            </button>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Distância Y entre Sensores: {{ configSilo.dist_y_sensores }}px</label>
          <div class="d-flex align-items-center">
            <input v-model.number="configSilo.dist_y_sensores" type="range" min="5" max="25" class="form-range me-2"
              @input="$emit('silo-change')" />
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'dist_y_sensores', 12)"
              title="Resetar para padrão (12)">
              ×
            </button>
          </div>
        </div>

        <!-- Seção: Aeradores -->
        <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-fan"></i> Configurações dos Aeradores</h6>

        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" v-model="configSilo.aeradores_ativo" id="aeradoresAtivo"
            @change="$emit('silo-change')" />
          <label class="form-check-label" for="aeradoresAtivo">
            <i class="fa fa-power-off me-1"></i> Ativar Aeradores
          </label>
        </div>

        <template v-if="configSilo.aeradores_ativo">
          <div class="mb-3">
            <label class="form-label"><i class="fa fa-list-ol me-1"></i> Número de Aeradores: {{ configSilo.na }}</label>
            <div class="d-flex align-items-center">
              <input v-model.number="configSilo.na" type="range" min="1" max="8" class="form-range me-2"
                @input="$emit('silo-change')" />
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'na', 4)"
                title="Resetar para padrão (4)">
                ×
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label"><i class="fa fa-arrows-h me-1"></i> Distância Horizontal do SVG: {{ configSilo.ds }}px</label>
            <div class="d-flex align-items-center">
              <input v-model.number="configSilo.ds" type="range" min="-50" max="100" class="form-range me-2"
                @input="$emit('silo-change')" />
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'ds', -4)"
                title="Resetar para padrão (-4)">
                ×
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label"><i class="fa fa-arrows-v me-1"></i> Distância Vertical dos Aeradores: {{ configSilo.dy }}px</label>
            <div class="d-flex align-items-center">
              <input v-model.number="configSilo.dy" type="range" min="-50" max="50" class="form-range me-2"
                @input="$emit('silo-change')" />
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'dy', 0)"
                title="Resetar para padrão (0)">
                ×
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label"><i class="fa fa-expand me-1"></i> Espaçamento entre Aeradores: {{ configSilo.da }}px</label>
            <div class="d-flex align-items-center">
              <input v-model.number="configSilo.da" type="range" min="10" max="80" class="form-range me-2"
                @input="$emit('silo-change')" />
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'da', 0)"
                title="Resetar para padrão (0)">
                ×
              </button>
            </div>
          </div>

          <!-- Novos Controles Criativos dos Aeradores -->
          <div class="mb-3">
            <label class="form-label"><i class="fa fa-rotate-right me-1"></i> Rotação dos Aeradores: {{ configSilo.aerador_rotacao || 0 }}°</label>
            <div class="d-flex align-items-center">
              <input v-model.number="configSilo.aerador_rotacao" type="range" min="0" max="360" class="form-range me-2"
                @input="$emit('silo-change')" />
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'aerador_rotacao', 0)"
                title="Resetar para padrão (0)">
                ×
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label"><i class="fa fa-search-plus me-1"></i> Escala dos Aeradores: {{ (configSilo.aerador_escala || 1).toFixed(1) }}x</label>
            <div class="d-flex align-items-center">
              <input v-model.number="configSilo.aerador_escala" type="range" min="0.5" max="2" step="0.1" class="form-range me-2"
                @input="$emit('silo-change')" />
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'aerador_escala', 1)"
                title="Resetar para padrão (1)">
                ×
              </button>
            </div>
          </div>
        </template>

        
      </div>
    </div>
</template>

<script>
export default {
  name: 'ControlesSilo',
  props: {
    tipoAtivo: String,
    configSilo: Object
  },
  emits: ['silo-change', 'reset-field'],
  methods: {
    resetField(campo, valor) {
      this.configSilo[campo] = valor
      this.$emit('silo-change')
    }
  }
}
</script>