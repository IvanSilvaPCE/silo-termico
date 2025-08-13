
<template>
  <div class="d-grid gap-2 mb-3">
    <button type="button" class="btn btn-warning" @click="$emit('resetar-padrao')">
      🔄 Resetar para Padrão
    </button>
    <button v-if="tipoAtivo === 'armazem'" type="button" class="btn btn-outline-warning"
      @click="$emit('resetar-modelos-padrao')">
      🗑️ Limpar Todos os Modelos
    </button>
    <button v-if="dadosVindosDoPreview" type="button" class="btn btn-info" @click="$emit('voltar-preview')">
      ⬅️ Voltar ao Preview
    </button>
  </div>
</template>

<script>
export default {
  name: 'BotoesControle',
  props: {
    tipoAtivo: String,
    dadosVindosDoPreview: Boolean
  },
  emits: ['resetar-padrao', 'resetar-modelos-padrao', 'voltar-preview']
}
</script>
