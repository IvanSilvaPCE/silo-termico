
<template>
  <div class="card mb-3 border-primary">
    <div class="card-header bg-primary text-white">
      <h6 class="mb-0"><i class="fa fa-crosshairs me-2"></i>Posicionamento dos Pêndulos/Cabos</h6>
    </div>
    <div class="card-body p-2">
      <!-- Seletor de Cabo para Posicionamento Individual -->
      <div class="row g-2 mb-3">
        <div class="col-12">
          <label class="form-label small fw-bold">Cabo Selecionado:</label>
          <div class="d-flex gap-2 align-items-center">
            <select class="form-select form-select-sm flex-grow-1" 
                    :value="caboSelecionadoPosicionamento" 
                    @input="$emit('update:cabo-selecionado-posicionamento', parseInt($event.target.value) || null)">
              <option :value="null">Selecione um cabo</option>
              <option v-for="i in (modelosArcos[modeloArcoAtual]?.quantidadePendulos || 3)" :key="i" :value="i">
                Cabo {{ i }}
              </option>
            </select>
            <button v-if="caboSelecionadoPosicionamento" 
                    type="button" 
                    class="btn btn-outline-secondary btn-sm"
                    @click="$emit('update:cabo-selecionado-posicionamento', null)" 
                    title="Desselecionar">
              ×
            </button>
          </div>
          <small v-if="caboSelecionadoPosicionamento" class="text-warning d-block mt-1">
            <i class="fa fa-dot-circle-o me-1" style="color: orange;"></i>Cabo {{ caboSelecionadoPosicionamento }} selecionado - visível em laranja no preview
          </small>
        </div>
      </div>

      <!-- Controles de Posicionamento do Cabo Selecionado -->
      <div v-if="caboSelecionadoPosicionamento" class="position-controls">
        <div class="alert alert-light p-2 mb-3">
          <h6 class="small fw-bold mb-2">Posição do Cabo {{ caboSelecionadoPosicionamento }}:</h6>
          
          <!-- Controle Horizontal -->
          <div class="control-group mb-3">
            <label class="form-label small fw-bold d-block">
              Horizontal (X): 
              <span class="badge bg-primary">{{ posicoesCabos[caboSelecionadoPosicionamento]?.x || 0 }}px</span>
            </label>
            <div class="d-flex align-items-center gap-2">
              <span class="small text-muted" style="min-width: 30px;">-100</span>
              <input type="range" 
                     class="form-range flex-grow-1" 
                     :value="posicoesCabos[caboSelecionadoPosicionamento]?.x || 0"
                     @input="updatePosicao('x', $event.target.value)" 
                     min="-100" 
                     max="100" 
                     step="1">
              <span class="small text-muted" style="min-width: 30px;">100</span>
            </div>
            <div class="d-flex justify-content-center mt-1">
              <input type="number" 
                     class="form-control form-control-sm text-center" 
                     style="width: 80px;"
                     :value="posicoesCabos[caboSelecionadoPosicionamento]?.x || 0"
                     @input="updatePosicao('x', $event.target.value)"
                     min="-100" 
                     max="100">
            </div>
          </div>

          <!-- Controle Vertical -->
          <div class="control-group mb-3">
            <label class="form-label small fw-bold d-block">
              Vertical (Y): 
              <span class="badge bg-success">{{ posicoesCabos[caboSelecionadoPosicionamento]?.y || 0 }}px</span>
            </label>
            <div class="d-flex align-items-center gap-2">
              <span class="small text-muted" style="min-width: 30px;">-50</span>
              <input type="range" 
                     class="form-range flex-grow-1" 
                     :value="posicoesCabos[caboSelecionadoPosicionamento]?.y || 0"
                     @input="updatePosicao('y', $event.target.value)" 
                     min="-50" 
                     max="50" 
                     step="1">
              <span class="small text-muted" style="min-width: 30px;">50</span>
            </div>
            <div class="d-flex justify-content-center mt-1">
              <input type="number" 
                     class="form-control form-control-sm text-center" 
                     style="width: 80px;"
                     :value="posicoesCabos[caboSelecionadoPosicionamento]?.y || 0"
                     @input="updatePosicao('y', $event.target.value)"
                     min="-50" 
                     max="50">
            </div>
          </div>

          <!-- Botões de Controle -->
          <div class="d-flex flex-wrap gap-2 justify-content-center">
            <button type="button" 
                    class="btn btn-outline-info btn-sm"
                    @click="resetarPosicaoCabo"
                    title="Resetar posição deste cabo">
              🔄 Reset Cabo
            </button>
            <button type="button" 
                    class="btn btn-outline-primary btn-sm" 
                    @click="resetarPosicoesCabos"
                    title="Resetar todas as posições">
              🔄 Reset Todos
            </button>
          </div>
        </div>
      </div>

      <!-- Mensagem quando nenhum cabo está selecionado -->
      <div v-else class="alert alert-info p-2 text-center">
        <small>
          <i class="fas fa-info-circle me-1"></i>
          Selecione um cabo acima para ajustar sua posição individual
        </small>
      </div>

      <!-- Informações adicionais -->
      <div class="mt-2">
        <small class="text-muted d-block text-center">
          💡 Dica: Você também pode arrastar os pêndulos diretamente no preview
        </small>
      </div>
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
      this.$emit('resetar-posicoes-cabos')
    },
    resetarPosicaoCabo() {
      if (!this.caboSelecionadoPosicionamento) return
      
      if (this.posicoesCabos[this.caboSelecionadoPosicionamento]) {
        this.posicoesCabos[this.caboSelecionadoPosicionamento].x = 0
        this.posicoesCabos[this.caboSelecionadoPosicionamento].y = 0
        this.$emit('posicao-cabo-change')
      }
    }
  }
}
</script>

<style scoped>
.position-controls .control-group {
  background: rgba(0, 123, 255, 0.05);
  border-radius: 6px;
  padding: 0.75rem;
  border: 1px solid rgba(0, 123, 255, 0.2);
}

.form-range {
  min-height: 1.5rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.btn-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  min-width: auto;
}

@media (max-width: 576px) {
  .card-body {
    padding: 0.75rem !important;
  }
  
  .control-group {
    padding: 0.5rem !important;
    margin-bottom: 0.75rem !important;
  }
  
  .d-flex.gap-2 {
    gap: 0.5rem !important;
  }
  
  .form-range {
    min-height: 1.25rem;
  }
  
  .btn-sm {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
  
  .small {
    font-size: 0.8rem;
  }
  
  .text-muted {
    font-size: 0.7rem !important;
  }
}

@media (max-width: 768px) {
  .d-flex.flex-wrap.gap-2 {
    justify-content: center !important;
    gap: 0.5rem !important;
  }
  
  .control-group .d-flex.align-items-center {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .form-range.flex-grow-1 {
    min-width: 120px;
    flex: 1 1 auto;
  }
}

.border-primary {
  border-color: #007bff !important;
}

.alert-light {
  background-color: rgba(248, 249, 250, 0.8);
  border-color: rgba(0, 123, 255, 0.2);
}
</style>
