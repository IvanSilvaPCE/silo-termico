
<template>
  <div class="card mb-3">
    <div class="card-header bg-success text-white">
      <h6 class="mb-0">🌡️ Configuração dos Sensores</h6>
    </div>
    <div class="card-body">
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
  </div>
</template>

<script>
export default {
  name: 'ConfiguracaoSensores',
  props: {
    configArmazem: Object
  },
  emits: ['armazem-change'],
  methods: {
    resetField(campo, valor) {
      this.configArmazem[campo] = valor
      this.$emit('armazem-change')
    }
  }
}
</script>
