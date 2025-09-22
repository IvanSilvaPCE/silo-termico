
<template>
  <div class="card mb-3">
    <div class="card-header text-white" style="background-color: #06335E;">
      <h6 class="mb-0">🏠 Configuração do Telhado</h6>
    </div>
    <div class="card-body">
      <div class="mb-2">
        <label class="small fw-bold">Tipo do Telhado:</label>
        <div class="input-group input-group-sm">
          <select class="form-select" v-model="configArmazem.tipo_telhado" @change="$emit('armazem-change')">
            <option :value="1">Pontudo</option>
            <option :value="2">Arredondado</option>
            <option :value="3">Arco</option>
          </select>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('tipo_telhado', 1)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Curvatura do Topo:</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.curvatura_topo" type="range" min="10" max="80" class="form-range"
            @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.curvatura_topo }}</span>
          <button type="button" class="btn btn-outline-secondary"
            @click="resetField('curvatura_topo', 30)" title="Reset">
            ×
          </button>
        </div>
        <small class="text-muted">Controla a altura/curvatura do topo do telhado</small>
      </div>

      <!-- Personalização das Pontas -->
      <div class="mb-2">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-model="configArmazem.pontas_redondas"
            @change="$emit('armazem-change')" />
          <label class="form-check-label small fw-bold">Pontas Redondas</label>
        </div>
      </div>

      <div v-if="configArmazem.pontas_redondas" class="mb-2">
        <label class="small fw-bold">Raio das Pontas:</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.raio_pontas" type="range" min="5" max="50" class="form-range"
            @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.raio_pontas }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('raio_pontas', 15)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <!-- Personalização das Laterais -->
      <div class="mb-2">
        <label class="small fw-bold">Estilo das Laterais:</label>
        <div class="input-group input-group-sm">
          <select class="form-select" v-model="configArmazem.estilo_laterais" @change="$emit('armazem-change')">
            <option value="reta">Laterais Retas</option>
            <option value="curvatura_lateral">Curvatura Lateral</option>
          </select>
          <button type="button" class="btn btn-outline-secondary"
            @click="resetField('estilo_laterais', 'reta')" title="Reset">
            ×
          </button>
        </div>
      </div>

      <div v-if="configArmazem.estilo_laterais !== 'reta'" class="mb-2">
        <label class="small fw-bold">Intensidade da Curvatura:</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.curvatura_laterais" type="range" min="-150" max="150"
            class="form-range" @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.curvatura_laterais }}</span>
          <button type="button" class="btn btn-outline-secondary"
            @click="resetField('curvatura_laterais', 0)" title="Reset">
            ×
          </button>
        </div>
        <small class="text-muted">0 = reto | Negativo = barriga para dentro | Positivo = barriga para fora</small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfiguracaoTelhado',
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
