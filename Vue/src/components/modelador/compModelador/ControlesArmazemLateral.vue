<template>
  <div class="card-body p-2">
    <!-- Seção: Dimensões da Lateral -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-arrows-alt me-1"></i> Dimensões da Lateral</h6>

    <div class="mb-3">
      <label class="form-label small fw-bold">Profundidade (pb): {{ configArmazem.pb }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.pb" type="range" min="100" max="400" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('pb', 185)"
          title="Resetar para padrão (185)">
          ×
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">Largura Base (lb): {{ configArmazem.lb }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.lb" type="range" min="200" max="600" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('lb', 350)"
          title="Resetar para padrão (350)">
          ×
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">Altura Base (hb): {{ configArmazem.hb }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.hb" type="range" min="10" max="80" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('hb', 30)"
          title="Resetar para padrão (30)">
          ×
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">Altura Telhado (ht): {{ configArmazem.ht }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.ht" type="range" min="10" max="100" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('ht', 50)"
          title="Resetar para padrão (50)">
          ×
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">Espessura Lateral (le): {{ configArmazem.le }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.le" type="range" min="5" max="40" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('le', 15)"
          title="Resetar para padrão (15)">
          ×
        </button>
      </div>
    </div>

    <!-- Seção: Sensores da Lateral -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-wifi me-1"></i> Sensores da Lateral</h6>

    <div class="mb-3">
      <label class="form-label small fw-bold">Escala dos Sensores: {{ configArmazem.escala_sensores }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.escala_sensores" type="range" min="8" max="32" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('escala_sensores', 16)"
          title="Resetar para padrão (16)">
          ×
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">Distância Y entre Sensores: {{ configArmazem.dist_y_sensores }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.dist_y_sensores" type="range" min="5" max="25" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('dist_y_sensores', 12)"
          title="Resetar para padrão (12)">
          ×
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">Distância X entre Sensores: {{ configArmazem.dist_x_sensores }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.dist_x_sensores" type="range" min="-10" max="10" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('dist_x_sensores', 0)"
          title="Resetar para padrão (0)">
          ×
        </button>
      </div>
    </div>

    <!-- Seção: Posicionamento -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-bullseye me-1"></i> Posicionamento</h6>

    <div class="mb-3">
      <label class="form-label small fw-bold">Posição Horizontal: {{ configArmazem.posicao_horizontal }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.posicao_horizontal" type="range" min="-50" max="50" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('posicao_horizontal', 0)"
          title="Resetar para padrão (0)">
          ×
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">Posição Vertical: {{ configArmazem.posicao_vertical }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.posicao_vertical" type="range" min="-50" max="50" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('posicao_vertical', 0)"
          title="Resetar para padrão (0)">
          ×
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">Afastamento Vertical Pêndulo: {{ configArmazem.afastamento_vertical_pendulo }}px</label>
      <div class="d-flex align-items-center">
        <input v-model.number="configArmazem.afastamento_vertical_pendulo" type="range" min="-30" max="30" class="form-range me-2"
          @input="$emit('armazem-change')" />
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetField('afastamento_vertical_pendulo', 0)"
          title="Resetar para padrão (0)">
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControlesArmazemLateral',
  props: {
    configArmazem: {
      type: Object,
      required: true
    }
  },
  emits: ['armazem-change'],
  methods: {
    resetField(field, defaultValue) {
      this.configArmazem[field] = defaultValue
      this.$emit('armazem-change')
    }
  }
}
</script>
