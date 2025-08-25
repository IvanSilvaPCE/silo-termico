<template>
  <div class="gerenciador-configuracoes">
    <!-- Inicializador de Modelos -->
    <InicializadorModelos :tipo-ativo="tipoAtivo" :tem-configuracao-atual="temConfiguracaoAtual"
      @modelo-inicializado="$emit('modelo-inicializado', $event)" @mostrar-toast="$emit('mostrar-toast', $event)" />


    <!-- Informações sobre o Sistema -->
    <div class="alert alert-light">
      <h6>Como funciona o sistema de modelos:</h6>
      <ul class="mb-0 small">
        <li><strong>1 Modelo:</strong> Mesmo modelo para todos os arcos</li>
        <li><strong>2 Modelos:</strong> Par (2º, 4º, 6º...) e Ímpar (1º, 3º, 5º...)</li>
        <li><strong>3 Modelos:</strong> Frente/Fundo iguais (1º e último), meio intercala Par/Ímpar</li>
        <li><strong>4 Modelos:</strong> Frente (1º), Par, Ímpar, Fundo (último) específicos</li>
      </ul>
    </div>
  </div>
</template>

<script>
import InicializadorModelos from './InicializadorModelos.vue'

export default {
  name: 'GerenciadorConfiguracoes',
  components: {
    InicializadorModelos
  },
  props: {
    tipoAtivo: String,
    temConfiguracaoAtual: Boolean
  },
  emits: [
    'modelo-inicializado',
    'mostrar-toast'
  ]
}
</script>

<style scoped>
.gerenciador-configuracoes {
  margin-top: 20px;
}

.d-flex.gap-2>* {
  margin-right: 0.5rem;
}

.d-flex.gap-2>*:last-child {
  margin-right: 0;
}

.list-group-item {
  border-left: 3px solid #007bff;
}

.alert {
  border-radius: 0.375rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
