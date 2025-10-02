<template>
  <div class="card-body p-2">
    <!-- Seção: Dimensões da Lateral -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-arrows-alt me-1"></i> Dimensões da Lateral</h6>

    <div class="mb-3">
      <label class="form-label small fw-bold">Largura da Base: {{ configSilo.lb }}px</label>
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
      <label class="form-label small fw-bold">Altura do Silo: {{ configSilo.hs }}px</label>
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
      <label class="form-label small fw-bold">Altura da Base: {{ configSilo.hb }}px</label>
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
      <label class="form-label small fw-bold">Espessura da Base: {{ configSilo.eb }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configSilo.eb" type="range" min="2" max="15" class="form-range me-2"
          @input="$emit('silo-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'eb', 2)"
          title="Resetar para padrão (2)">
          ×
        </button>
      </div>
    </div>

    <!-- Seção: Sensores da Lateral -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-wifi me-1"></i> Sensores da Lateral</h6>

    <div class="mb-3">
      <label class="form-label small fw-bold">Escala dos Sensores: {{ configSilo.escala_sensores }}px</label>
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
      <label class="form-label small fw-bold">Distância Y entre Sensores: {{ configSilo.dist_y_sensores }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configSilo.dist_y_sensores" type="range" min="5" max="25" class="form-range me-2"
          @input="$emit('silo-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'dist_y_sensores', 12)"
          title="Resetar para padrão (12)">
          ×
        </button>
      </div>
    </div>

    <!-- Seção: Aeradores da Lateral -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-fan me-1"></i> Aeradores da Lateral</h6>

    <div class="form-check mb-3">
      <input class="form-check-input" type="checkbox" v-model="configSilo.aeradores_ativo" id="aeradoresAtivoLateral"
        @change="$emit('silo-change')" />
      <label class="form-check-label small" for="aeradoresAtivoLateral">
        <i class="fa fa-power-off me-1"></i> Ativar Aeradores
      </label>
    </div>

    <template v-if="configSilo.aeradores_ativo">
      <div class="mb-3">
        <label class="form-label small fw-bold">Número de Aeradores: {{ configSilo.na }}</label>
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
        <label class="form-label small fw-bold">Distância Horizontal: {{ configSilo.ds }}px</label>
        <div class="d-flex align-items-center">
          <input v-model.number="configSilo.ds" type="range" min="-50" max="100" class="form-range me-2"
            @input="$emit('silo-change')" />
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'ds', 30)"
            title="Resetar para padrão (30)">
            ×
          </button>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Distância Vertical: {{ configSilo.dy }}px</label>
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
        <label class="form-label small fw-bold">Espaçamento entre Aeradores: {{ configSilo.da }}px</label>
        <div class="d-flex align-items-center">
          <input v-model.number="configSilo.da" type="range" min="10" max="80" class="form-range me-2"
            @input="$emit('silo-change')" />
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('reset-field', 'da', 35)"
            title="Resetar para padrão (35)">
            ×
          </button>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Rotação dos Aeradores: {{ configSilo.aerador_rotacao || 0 }}°</label>
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
        <label class="form-label small fw-bold">Escala dos Aeradores: {{ (configSilo.aerador_escala || 1).toFixed(1) }}x</label>
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
</template>

<script>
export default {
  name: 'ControlesSiloLateral',
  props: {
    configSilo: {
      type: Object,
      required: true
    }
  },
  emits: ['silo-change', 'reset-field']
}
</script>
