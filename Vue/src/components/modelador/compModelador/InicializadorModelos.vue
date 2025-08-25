
<template>
  <div class="inicializador-modelos">
    
    <div class="d-grid gap-2 mb-3">
      <button
        class="btn btn-outline-primary btn-sm"
        @click="inicializarModeloPadrao"
        :disabled="isInicializando"
      >
        <span v-if="!isInicializando">Inicializar Modelo Padrão</span>
        <div v-else class="d-flex align-items-center justify-content-center">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden"></span>
          </div>
          <span>Inicializando...</span>
        </div>
      </button>
      
      <button
        v-if="temConfiguracaoAtual"
        class="btn btn-outline-warning btn-sm"
        @click="confirmarReset"
        :disabled="isInicializando"
      >
        🔄 Reset para Padrão
      </button>
    </div>
    
    <!-- Modal de Confirmação -->
    <div
      class="modal fade"
      id="modalResetConfirmacao"
      tabindex="-1"
      ref="modalReset"
    >
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Reset</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <p>Deseja resetar para o modelo padrão?</p>
            <small class="text-warning">⚠️ Esta ação irá sobrescrever a configuração atual.</small>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-warning btn-sm"
              @click="executarReset"
            >
              Resetar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InicializadorModelos',
  props: {
    tipoAtivo: String,
    temConfiguracaoAtual: Boolean
  },
  emits: [
    'modelo-inicializado',
    'mostrar-toast'
  ],
  data() {
    return {
      isInicializando: false
    }
  },
  methods: {
    async inicializarModeloPadrao() {
      this.isInicializando = true
      
      try {
        const { configuracaoService } = await import('../services/configuracaoService')
        const modeloPadrao = configuracaoService.obterModeloPadrao(this.tipoAtivo)
        
        console.log('🎯 [InicializadorModelos] Inicializando modelo padrão:', {
          tipo: this.tipoAtivo,
          modeloPadrao
        })
        
        this.$emit('modelo-inicializado', {
          tipo: this.tipoAtivo,
          dados: modeloPadrao,
          isModeloPadrao: true
        })
        
        this.mostrarToast('Modelo padrão inicializado com sucesso!', 'success')
      } catch (error) {
        console.error('❌ [InicializadorModelos] Erro ao inicializar modelo padrão:', error)
        this.mostrarToast('Erro ao inicializar modelo padrão', 'error')
      } finally {
        this.isInicializando = false
      }
    },
    
    confirmarReset() {
      const modal = new bootstrap.Modal(this.$refs.modalReset)
      modal.show()
    },
    
    async executarReset() {
      // Fechar modal
      const modal = bootstrap.Modal.getInstance(this.$refs.modalReset)
      modal.hide()
      
      // Executar inicialização
      await this.inicializarModeloPadrao()
    },
    
    mostrarToast(mensagem, tipo = 'info') {
      this.$emit('mostrar-toast', { mensagem, tipo })
    }
  }
}
</script>

<style scoped>
.inicializador-modelos {
  margin-bottom: 20px;
}

.alert {
  border-radius: 0.375rem;
}
</style>
