<template>
  <div class="mt-3 p-2 border rounded" style="background-color: #f0f8ff;">
    <div class="mb-2">
      <small class="fw-bold text-primary">🎯 Posicionamento dos Pêndulos/Cabos:</small>
    </div>

    <!-- Seletor de Cabo para Posicionamento Individual -->
    <div class="mb-2">
      <label class="form-label small fw-bold">Cabo Selecionado:</label>
      <select class="form-select form-select-sm" :value="caboSelecionadoPosicionamento" @input="$emit('update:cabo-selecionado-posicionamento', parseInt($event.target.value) || null)">
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
      <button type="button" class="btn btn-outline-secondary btn-sm me-1" @click="$emit('update:cabo-selecionado-posicionamento', null)">
        ← Voltar
      </button>
      <button type="button" class="btn btn-outline-primary btn-sm" @click="resetarPosicoesCabos">
        🔄 Resetar Posições
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
    },
    resetarPosicoesCabos() {
      this.$emit('resetar-posicoes-cabos');
    }
  }
}
</script>