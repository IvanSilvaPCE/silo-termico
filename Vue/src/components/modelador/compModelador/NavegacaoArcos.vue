<template>
  <div :class="isMobile ? 'mobile-navigation' : ''">
    <!-- Layout Mobile -->
    <div v-if="isMobile" class="mobile-layout">
      <!-- Linha 1: Navegação compacta -->
      <div class="d-flex align-items-center justify-content-center mb-2 flex-wrap gap-1 mobile-nav-buttons">
        <button 
          type="button" 
          class="btn btn-outline-secondary btn-sm nav-btn"
          @click="$emit('mudar-arco', Math.max(1, arcoAtual - 1))" 
          :disabled="arcoAtual <= 1"
          title="Arco anterior"
        >
          ←
        </button>
        <select 
          class="form-select form-select-sm text-center mx-1 mobile-select" 
          :value="arcoAtual"
          @change="$emit('mudar-arco', parseInt($event.target.value))"
        >
          <option v-for="numeroArco in totalArcos" :key="numeroArco" :value="numeroArco">
            {{ numeroArco }}
          </option>
        </select>
        <button 
          type="button" 
          class="btn btn-outline-secondary btn-sm nav-btn"
          @click="$emit('mudar-arco', Math.min(totalArcos, arcoAtual + 1))"
          :disabled="arcoAtual >= totalArcos" 
          title="Próximo arco"
        >
          →
        </button>
      </div>

      <!-- Linha 2: Informações compactas -->
      <div class="text-center mobile-info">
        <div class="mb-1">
          <small><strong>{{ arcoAtual }}/{{ totalArcos }}</strong></small>
          <span v-if="modeloEditando" class="badge ms-1 mobile-badge" style="background-color: #D32626; color: white;">EDIT</span>
          <span v-if="configuracaoBanco" class="badge text-white ms-1 mobile-badge" style="background-color: #06335E;">BANCO</span>
        </div>
        <div class="mb-1 d-flex justify-content-center align-items-center flex-wrap gap-1 mobile-badges">
          <span class="badge text-white mobile-badge" style="background-color: #06335E;">
            {{ totalPendulos }}P
          </span>
          <span class="badge bg-secondary text-white mobile-badge">
            {{ totalSensores }}S
          </span>
          <span :class="badgeClass" style="color: white;" class="mobile-badge">
            {{ badgeText }}
          </span>
        </div>
        <small class="text-muted d-block mobile-model-name">{{ nomeModelo }}</small>
      </div>
    </div>

    <!-- Layout Desktop -->
    <div v-else class="desktop-layout">
      <div class="row g-1 align-items-center">
        <!-- Navegação -->
        <div class="col-md-4 col-lg-3">
          <div class="d-flex align-items-center justify-content-center justify-content-lg-start">
            <button 
              type="button" 
              class="btn btn-outline-secondary btn-sm me-1"
              @click="$emit('mudar-arco', Math.max(1, arcoAtual - 1))" 
              :disabled="arcoAtual <= 1"
              title="Arco anterior"
            >
              ← Anterior
            </button>
            <select 
              class="form-select form-select-sm mx-1" 
              style="min-width: 100px; max-width: 120px;"
              :value="arcoAtual" 
              @change="$emit('mudar-arco', parseInt($event.target.value))"
            >
              <option v-for="numeroArco in totalArcos" :key="numeroArco" :value="numeroArco">
                Arco {{ numeroArco }}
              </option>
            </select>
            <button 
              type="button" 
              class="btn btn-outline-secondary btn-sm ms-1"
              @click="$emit('mudar-arco', Math.min(totalArcos, arcoAtual + 1))"
              :disabled="arcoAtual >= totalArcos" 
              title="Próximo arco"
            >
              Próximo →
            </button>
          </div>
        </div>

        <!-- Informações do Arco -->
        <div class="col-md-4 col-lg-3 text-center">
          <div>
            <strong class="text-nowrap">Arco {{ arcoAtual }}/{{ totalArcos }}</strong>
            <span v-if="modeloEditando" class="badge ms-1" style="background-color: #D32626; color: white;">EDITANDO</span>
            <span v-if="configuracaoBanco" class="badge text-white ms-1" style="background-color: #06335E;">BANCO</span>
          </div>
          <small class="text-muted d-block">{{ nomeModelo }}</small>
        </div>

        <!-- Badges de Contadores -->
        <div class="col-md-4 col-lg-6 text-center text-md-end">
          <div class="d-flex flex-wrap justify-content-center justify-content-md-end align-items-center gap-1">
            <span class="badge text-white" style="background-color: #06335E;">
              {{ totalPendulos }} Pêndulos
            </span>
            <span class="badge bg-secondary text-white">
              {{ totalSensores }} Sensores
            </span>
            <span :class="badgeClass" style="color: white;">
              {{ badgeText }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavegacaoArcos',
  props: {
    isMobile: {
      type: Boolean,
      default: false
    },
    arcoAtual: {
      type: Number,
      required: true
    },
    totalArcos: {
      type: Number,
      required: true
    },
    totalPendulos: {
      type: Number,
      default: 0
    },
    totalSensores: {
      type: Number,
      default: 0
    },
    badgeClass: {
      type: String,
      default: ''
    },
    badgeText: {
      type: String,
      default: ''
    },
    nomeModelo: {
      type: String,
      default: 'Modelo Padrão'
    },
    modeloEditando: {
      type: Boolean,
      default: false
    },
    configuracaoBanco: {
      type: Boolean,
      default: false
    }
  },
  emits: ['mudar-arco']
}
</script>