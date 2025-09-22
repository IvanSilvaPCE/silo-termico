<template>
  <div class="card mb-3">
    <div class="card-header text-white" style="background-color: #06335E;">
      <h6 class="mb-0">🏗️ Modelos de Arcos do Armazém</h6>
    </div>

    <div class="card-body p-2">
      <!-- Layout responsivo com grid -->
      <div class="row g-2 mb-3">
        <div class="col-12 col-md-6">
          <label class="form-label small fw-bold">Quantidade de Modelos:</label>
          <select
            class="form-select form-select-sm w-100"
            :value="quantidadeModelosArcos"
            @change="$emit('quantidade-modelos-change', $event)"
          >
            <option :value="1">1 Modelo</option>
            <option :value="2">2 Modelos</option>
            <option :value="3">3 Modelos</option>
            <option :value="4">4 Modelos</option>
          </select>
        </div>

        <div class="col-12 col-md-6">
          <label class="form-label small fw-bold">Modelo Atual:</label>
          <select
            class="form-select form-select-sm w-100"
            :value="modeloArcoAtual"
            @change="$emit('modelo-arco-change', $event)"
          >
            <option :value="null">Selecione Modelo</option>
            <option v-for="i in quantidadeModelosArcos" :key="i" :value="i">
              Modelo {{ i }} - {{ getDescricaoModelo(i) }}
            </option>
          </select>
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-12">
          <label class="form-label small fw-bold">Nome do Modelo:</label>
          <input
            type="text"
            class="form-control form-control-sm w-100"
            :value="modeloNome"
            @input="$emit('nome-modelo-change', $event)"
            placeholder="Nome do modelo"
            :disabled="!modeloArcoAtual"
          />
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-12">
          <label class="form-label small fw-bold">Posição no Armazém:</label>
          <select
            class="form-select form-select-sm w-100"
            :value="modeloPosicao"
            @change="$emit('posicao-arco-change', $event)"
            :disabled="!modeloArcoAtual"
          >
            <template v-if="quantidadeModelosArcos === 1">
              <option value="todos">Todos os Arcos</option>
            </template>
            <template v-if="quantidadeModelosArcos === 2">
              <option value="par">Par (2º, 4º, 6º...)</option>
              <option value="impar">Ímpar (1º, 3º, 5º...)</option>
            </template>
            <template v-if="quantidadeModelosArcos === 3">
              <option value="frente_fundo">Frente/Fundo (1º e Último)</option>
              <option value="par">Par (2º, 4º, 6º...)</option>
              <option value="impar">Ímpar (3º, 5º, 7º...)</option>
            </template>
            <template v-if="quantidadeModelosArcos === 4">
              <option value="frente">Frente (1º Arco)</option>
              <option value="par">Par (2º, 4º, 6º...)</option>
              <option value="impar">Ímpar (3º, 5º, 7º...)</option>
              <option value="fundo">Fundo (Último Arco)</option>
            </template>
          </select>
        </div>
      </div>

      <!-- Controle de Quantidade de Pêndulos por Modelo -->
      <div v-if="modeloArcoAtual" class="mb-3">
        <label class="form-label small fw-bold">Quantidade de Pêndulos/Cabos:</label>

        <div class="d-flex align-items-center justify-content-center mb-2">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm flex-shrink-0"
            @click="alterarQuantidadePendulos(-1)"
            :disabled="(modelosArcosLocal[modeloArcoAtual]?.quantidadePendulos || 3) <= 0"
            title="Diminuir quantidade"
          >
            -
          </button>

          <input
            type="number"
            class="form-control form-control-sm text-center mx-2"
            style="max-width: 70px; min-width: 60px;"
            :value="modelosArcosLocal[modeloArcoAtual]?.quantidadePendulos"
            @input="onQuantidadePendulosChange"
            min="0" max="50"
          />

          <button
            type="button"
            class="btn btn-outline-secondary btn-sm flex-shrink-0"
            @click="alterarQuantidadePendulos(1)"
            :disabled="(modelosArcosLocal[modeloArcoAtual]?.quantidadePendulos || 3) >= 50"
            title="Aumentar quantidade"
          >
            +
          </button>
        </div>

        <div class="text-center">
          <small class="text-muted d-block">(0 a 50 pêndulos)</small>
          <small class="d-block" style="color: #06335E;">💡 Aplicado automaticamente no preview</small>
        </div>

        <!-- Controles de Posicionamento dos Pêndulos/Cabos -->
        <PosicionamentoCabos
          :modelo-arco-atual="modeloArcoAtual"
          :modelos-arcos="modelosArcosLocal"
          :cabo-selecionado-posicionamento="caboSelecionadoPosicionamento"
          :posicoes-cabos="posicoesCabos"
          @update:cabo-selecionado-posicionamento="$emit('update:cabo-selecionado-posicionamento', $event)"
          @posicao-cabo-change="$emit('posicao-cabo-change')"
          @resetar-posicoes-cabos="$emit('resetar-posicoes-cabos')"
        />
      </div>

      <!-- Status do Modelo Atual -->
      <div v-if="modeloArcoAtual" class="alert alert-info p-2">
        <div class="text-center mb-2">
          <strong class="d-block">EDITANDO:</strong>
          <span class="d-block small">{{ modelosArcosLocal[modeloArcoAtual]?.nome || `Modelo ${modeloArcoAtual}` }}</span>
        </div>

        <div class="d-flex flex-wrap justify-content-center gap-1 mb-2">
          <span class="badge bg-primary">
            {{ modelosArcosLocal[modeloArcoAtual]?.posicao || '' }}
          </span>
          <span class="badge bg-info">
            {{ modelosArcosLocal[modeloArcoAtual]?.quantidadePendulos || 3 }}P
          </span>
          <span v-if="modelosSalvos[modeloArcoAtual]" class="badge bg-success">SALVO</span>
        </div>

        <div class="d-grid">
          <button
            type="button"
            class="btn btn-success btn-sm"
            @click="$emit('salvar-modelo-atual')"
            title="Salvar este modelo"
          >
            💾 Salvar Modelo
          </button>
        </div>
      </div>

      <div v-else class="alert alert-warning p-2 text-center">
        <strong class="small">⚠️ Nenhum modelo selecionado</strong>
      </div>

      <!-- Resumo dos modelos -->
      <div class="mt-3">
        <h6 class="small fw-bold">Resumo dos Modelos:</h6>
        <div class="row g-1">
          <div v-for="i in quantidadeModelosArcos" :key="i" class="col-12 mb-1">
            <div :class="['card card-sm', { 'border-primary': modeloArcoAtual === i }]">
              <div class="card-body p-2">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="flex-grow-1 me-2">
                    <small class="fw-bold d-block">Modelo {{ i }}</small>
                    <small class="text-muted d-block text-truncate" style="max-width: 120px;">
                      {{ modelosArcosLocal[i]?.posicao || 'N/A' }}
                    </small>
                    <small class="text-muted d-block text-truncate" style="max-width: 120px;">
                      {{ modelosArcosLocal[i]?.nome || 'Sem nome' }}
                    </small>
                  </div>
                  <div class="text-end">
                    <span v-if="modelosSalvos[i]" class="badge bg-success badge-sm mb-1">✓</span>
                    <small class="d-block text-muted">
                      {{ modelosArcosLocal[i]?.quantidadePendulos || 3 }}P
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-2 text-center">
          <small class="text-muted">
            <strong>Status:</strong> {{ Object.keys(modelosSalvos).length }} de {{ quantidadeModelosArcos }} modelos salvos
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PosicionamentoCabos from './PosicionamentoCabos.vue'

export default {
  name: 'ModelosArcos',
  components: { PosicionamentoCabos },

  props: {
    quantidadeModelosArcos: Number,
    modeloArcoAtual: [Number, null],
    modelosArcos: Object,
    modelosSalvos: Object,
    modeloNome: String,
    modeloPosicao: String,
    caboSelecionadoPosicionamento: [Number, null],
    posicoesCabos: Object
  },

  data() {
    return {
      modelosArcosLocal: {},
      travadoExterno: false,
      emitirDebounce: null
    }
  },

  created() {
    this.emitirDebounce = this.debounce((payload) => {
      this.$emit('modelo-dados-atualizados', payload)
    }, 150)
  },

  watch: {
    // sincronia do pai -> local (sem loop)
    modelosArcos: {
      immediate: true,
      deep: true,
      handler(novo) {
        this.travadoExterno = true
        this.modelosArcosLocal = this.clonar(novo || {})
        this.$nextTick(() => { this.travadoExterno = false })
      }
    },

    // edições locais -> emite para o pai (tempo real, com debounce)
    modelosArcosLocal: {
      deep: true,
      handler(novo) {
        if (this.travadoExterno || !this.modeloArcoAtual) return
        const dados = novo[this.modeloArcoAtual]
        if (!dados) return
        this.emitirDebounce({
          modeloAtual: this.modeloArcoAtual,
          dadosModelo: this.clonar(dados)
        })
      }
    }
  },

  methods: {
    // util
    clonar(v) { return JSON.parse(JSON.stringify(v)) },
    debounce(fn, espera = 150) {
      let t
      return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), espera) }
    },

    getDescricaoModelo(modeloNum) {
      if (this.quantidadeModelosArcos === 1) return 'todos'
      if (this.quantidadeModelosArcos === 2) return modeloNum === 1 ? 'par' : 'impar'
      if (this.quantidadeModelosArcos === 3) return modeloNum === 1 ? 'frente/fundo' : (modeloNum === 2 ? 'par' : 'impar')
      if (this.quantidadeModelosArcos === 4) return ['frente', 'par', 'impar', 'fundo'][modeloNum - 1] || ''
      return ''
    },

    // usa SEMPRE o estado local
    onQuantidadePendulosChange(event) {
      if (!this.modeloArcoAtual) return
      const nova = Math.max(0, Math.min(50, parseInt(event.target.value) || 0))
      const m = this.obterModeloLocal(this.modeloArcoAtual)
      this.$set(m, 'quantidadePendulos', nova)
      this.$emit('quantidade-pendulos-change', { target: { value: nova }, modeloArcoAtual: this.modeloArcoAtual })
    },

    alterarQuantidadePendulos(incremento) {
      if (!this.modeloArcoAtual) return
      const m = this.obterModeloLocal(this.modeloArcoAtual)
      const atual = m.quantidadePendulos || 3
      const nova = Math.max(0, Math.min(50, atual + incremento))
      this.$set(m, 'quantidadePendulos', nova)
      this.$emit('alterar-quantidade-pendulos', { incremento, novaQuantidade: nova, modeloArcoAtual: this.modeloArcoAtual })
    },

    obterModeloLocal(indice) {
      if (!this.modelosArcosLocal[indice]) this.$set(this.modelosArcosLocal, indice, {})
      return this.modelosArcosLocal[indice]
    }
  }
}
</script>
