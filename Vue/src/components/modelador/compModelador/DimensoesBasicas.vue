
<template>
  <div class="card-body">
      <div class="mb-2">
        <label class="small fw-bold">Profundidade Base (pb):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.pb" type="range" min="100" max="300" class="form-range"
            @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.pb }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('pb', 185)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Largura Base (lb):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.lb" type="range" min="200" max="500" class="form-range"
            @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.lb }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('lb', 350)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Altura Base (hb):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.hb" type="range" min="10" max="80" class="form-range"
            @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.hb }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('hb', 30)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Altura Frente (hf):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.hf" type="range" min="2" max="20" class="form-range"
            @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.hf }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('hf', 5)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Largura Frente (lf):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.lf" type="range" min="150" max="350" class="form-range"
            @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.lf }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('lf', 250)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Largura Estrutura (le):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.le" type="range" min="5" max="50" class="form-range"
            @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.le }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('le', 15)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Altura Teto (ht):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.ht" type="range" min="20" max="100" class="form-range"
            @input="$emit('armazem-change')" />
          <span class="input-group-text">{{ configArmazem.ht }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('ht', 50)"
            title="Reset">
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DimensoesBasicas',
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
