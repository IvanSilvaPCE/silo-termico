
<template>
  <div class="card mt-3">
    <div class="card-header bg-info text-white">
      <h6 class="mb-0 small">📋 Gerenciar Configurações</h6>
    </div>
    <div class="card-body p-2 p-md-3">
      <div class="mb-3">
        <label class="form-label small fw-bold">Nome da Configuração:</label>
        <input type="text" class="form-control form-control-sm" :value="nomeConfiguracao"
          @input="$emit('update:nome-configuracao', $event.target.value)" placeholder="Digite o nome..." />
      </div>

      <div class="d-grid gap-2 mb-3">
        <button type="button" class="btn btn-success btn-sm" @click="$emit('salvar-configuracao')"
          :disabled="!nomeConfiguracao.trim()">
          💾 Salvar {{ tipoAtivo === 'silo' ? 'Silo' : 'Armazém' }}
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="$emit('carregar-configuracao')"
          :disabled="!nomeConfiguracao.trim()">
          📂 Carregar Configuração
        </button>
      </div>

      <!-- Lista de configurações salvas -->
      <div v-if="configsDisponiveis.length > 0" class="alert alert-light">
        <h6>Configurações Salvas:</h6>
        <div class="d-flex flex-wrap gap-1">
          <span v-for="nome in configsDisponiveis" :key="nome" class="badge bg-secondary position-relative">
            {{ nome }}
            <button type="button" class="btn-close btn-close-white" style="font-size: 8px; margin-left: 5px"
              @click="$emit('deletar-configuracao', nome)" aria-label="Close"></button>
          </span>
        </div>
        <div class="mt-2">
          <small class="text-muted">Clique em uma configuração para carregar rapidamente:</small>
          <div class="d-flex flex-wrap gap-1 mt-1">
            <button v-for="nome in configsDisponiveis" :key="nome" type="button"
              class="btn btn-sm btn-outline-primary" @click="$emit('carregar-configuracao', nome)">
              {{ nome }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="tipoAtivo === 'armazem'" class="alert alert-info">
        <small>
          <strong>📌 Dica:</strong> Quando salvar um armazém, todos os {{ quantidadeModelosArcos }} modelos de
          arcos
          configurados
          serão salvos junto. Ao carregar, a configuração completa será restaurada com todos os modelos.
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GerenciadorConfiguracoes',
  props: {
    tipoAtivo: String,
    nomeConfiguracao: String,
    configsDisponiveis: Array,
    quantidadeModelosArcos: Number
  },
  emits: [
    'update:nome-configuracao',
    'salvar-configuracao',
    'carregar-configuracao',
    'deletar-configuracao'
  ]
}
</script>
