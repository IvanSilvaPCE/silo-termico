<template>
  <div class="d-grid gap-2 mb-3">
    <button type="button" class="btn btn-outline-secondary" @click="$emit('resetar-padrao')">
      🔄 Resetar para Padrão
    </button>
    <button v-if="tipoAtivo === 'armazem'" type="button" class="btn btn-outline-secondary"
      @click="$emit('resetar-modelos-padrao')">
      🗑️ Limpar Todos os Modelos
    </button>
    <button 
          v-if="dadosVindosDoPreview" 
          type="button" 
          class="btn btn-sm w-100 mb-2" style="background-color: #06335E; color: white;" 
          @click="$emit('voltar-preview')"
        >
          🔙 Voltar ao Preview
        </button>

        <button 
          v-if="tipoAtivo === 'armazem'" 
          type="button" 
          class="btn btn-outline-danger btn-sm w-100 mb-2" 
          @click="$emit('resetar-posicoes-manual')"
          title="Resetar posições manuais dos pêndulos e sensores (ambos salvos no banco)"
        >
          🎯 Resetar Posições Manuais
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
  emits: [
    'resetar-padrao',
    'resetar-modelos-padrao', 
    'voltar-preview',
    'resetar-posicoes-manual'
  ],
}
</script>