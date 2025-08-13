<template>
  <div class="mt-3 p-2 border rounded" style="background-color: #f0f8ff;">
    <div class="mb-2">
      <small class="fw-bold text-primary">🎯 Posicionamento dos Pêndulos/Cabos:</small>
    </div>

    <!-- Seletor de Cabo para Posicionamento Individual -->
    <div class="mb-2">
      <label class="form-label small fw-bold">Cabo Selecionado:</label>
      <select class="form-select form-select-sm" :value="caboSelecionadoPosicionamento"
        @change="$emit('update:cabo-selecionado-posicionamento', parseInt($event.target.value) || null)"
        :style="caboSelecionadoPosicionamento ? 'border-color: #FF6B35; box-shadow: 0 0 0 0.2rem rgba(255, 107, 53, 0.25);' : ''">
        <option :value="null">Selecione um cabo</option>
        <option v-for="i in (modelosArcos[modeloArcoAtual]?.quantidadePendulos || 3)" :key="i" :value="i">
          Cabo {{ i }}
        </option>
      </select>
      <small v-if="caboSelecionadoPosicionamento" class="text-warning d-block mt-1">
        🟠 Cabo {{ caboSelecionadoPosicionamento }} selecionado - visível em laranja no preview
      </small>
    </div>

    <!-- Controles de Posicionamento do Cabo Selecionado -->
    <div v-if="caboSelecionadoPosicionamento" class="mb-2">
      <label class="form-label small fw-bold">Posição do Cabo {{ caboSelecionadoPosicionamento }}:</label>
      <div class="row g-1">
        <div class="col-12 mb-2">
          <label class="form-label" style="font-size: 0.7rem;">Horizontal (X): {{
            posicoesCabos[caboSelecionadoPosicionamento]?.x || 0 }}px</label>
          <input type="range" class="form-range" :value="posicoesCabos[caboSelecionadoPosicionamento]?.x || 0"
            @input="updatePosicao('x', $event.target.value)" min="-100" max="100" step="1">
        </div>
        <div class="col-12">
          <label class="form-label" style="font-size: 0.7rem;">Vertical (Y): {{
            posicoesCabos[caboSelecionadoPosicionamento]?.y || 0 }}px</label>
          <input type="range" class="form-range" :value="posicoesCabos[caboSelecionadoPosicionamento]?.y || 0"
            @input="updatePosicao('y', $event.target.value)" min="-50" max="50" step="1">
        </div>
      </div>
    </div>

    <div class="text-center mt-2">
      <small class="text-info d-block" style="font-size: 0.7rem;">
        ⚙️ Selecione um cabo acima para ajustar sua posição individual
      </small>
      <button type="button" class="btn btn-outline-primary btn-sm mt-1" @click="$emit('resetar-posicoes-cabos')">
        🔄 Resetar Posições dos Cabos
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PosicionamentoCabos',
  props: {
    modeloArcoAtual: [Number, null],
    modelosArcos: Object,
    caboSelecionadoPosicionamento: [Number, null],
    posicoesCabos: Object
  },
  emits: ['update:cabo-selecionado-posicionamento', 'posicao-cabo-change', 'resetar-posicoes-cabos'],
  methods: {
    updatePosicao(tipo, valor) {
      if (!this.caboSelecionadoPosicionamento || !this.posicoesCabos[this.caboSelecionadoPosicionamento]) return

      this.posicoesCabos[this.caboSelecionadoPosicionamento][tipo] = parseFloat(valor) || 0
      this.$emit('posicao-cabo-change')
    }
  }
}
</script>
