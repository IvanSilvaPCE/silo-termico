
<template>
  <div class="card mb-3">
    <div class="card-header bg-primary text-white">
      <h6 class="mb-0">📐 Dimensões Básicas do Armazém</h6>
    </div>
    <div class="card-body">
      <div class="mb-2">
        <label class="small fw-bold">Profundidade Base (pb):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.pb" type="range" min="100" max="300" class="form-range"
            @input="onDimensaoChange" />
          <span class="input-group-text">{{ configArmazem.pb }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('pb', 185)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Largura Base (lb):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.lb" type="range" min="200" max="500" class="form-range"
            @input="onDimensaoChange" />
          <span class="input-group-text">{{ configArmazem.lb }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('lb', 350)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Altura Base (hb):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.hb" type="range" min="10" max="80" class="form-range"
            @input="onDimensaoChange" />
          <span class="input-group-text">{{ configArmazem.hb }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('hb', 30)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Altura Frente (hf):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.hf" type="range" min="2" max="20" class="form-range"
            @input="onDimensaoChange" />
          <span class="input-group-text">{{ configArmazem.hf }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('hf', 5)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Largura Frente (lf):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.lf" type="range" min="150" max="350" class="form-range"
            @input="onDimensaoChange" />
          <span class="input-group-text">{{ configArmazem.lf }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('lf', 250)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Largura Estrutura (le):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.le" type="range" min="5" max="50" class="form-range"
            @input="onDimensaoChange" />
          <span class="input-group-text">{{ configArmazem.le }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('le', 15)"
            title="Reset">
            ×
          </button>
        </div>
      </div>

      <div class="mb-2">
        <label class="small fw-bold">Altura Teto (ht):</label>
        <div class="input-group input-group-sm">
          <input v-model.number="configArmazem.ht" type="range" min="20" max="100" class="form-range"
            @input="onDimensaoChange" />
          <span class="input-group-text">{{ configArmazem.ht }}</span>
          <button type="button" class="btn btn-outline-secondary" @click="resetField('ht', 50)"
            title="Reset">
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DimensoesBasicas',
  props: {
    configArmazem: Object
  },
  emits: ['armazem-change', 'dimensoes-alteradas'],
  methods: {
    resetField(campo, valor) {
      console.log(`📐 [DimensoesBasicas] Reset do campo ${campo}:`, {
        valorAnterior: this.configArmazem[campo],
        novoValor: valor
      })
      
      this.configArmazem[campo] = valor
      
      // 💾 SALVAR imediatamente após reset
      this.salvarDimensoesNoLocalStorage()
      
      this.$emit('armazem-change')
      this.$emit('dimensoes-alteradas', {
        campo,
        valor,
        configuracao: this.configArmazem
      })
      
      console.log('📐 [DimensoesBasicas] Configuração após reset:', this.configArmazem)
    },

    // 💾 Método para salvar dimensões imediatamente
    salvarDimensoesNoLocalStorage() {
      try {
        const chave = 'dimensoes_temp_' + Date.now()
        const dadosDimensoes = {
          dimensoes: this.configArmazem,
          timestamp: Date.now(),
          versao: '6.0'
        }
        localStorage.setItem(chave, JSON.stringify(dadosDimensoes))
        console.log('💾 [DimensoesBasicas] Dimensões salvas temporariamente:', chave)
      } catch (error) {
        console.warn('⚠️ [DimensoesBasicas] Erro ao salvar dimensões:', error)
      }
    },
    
    onDimensaoChange() {
      // 🔧 GARANTIR que todos os valores sejam números válidos
      const dimensoesValidadas = {
        pb: Number(this.configArmazem.pb) || 185,
        lb: Number(this.configArmazem.lb) || 350,
        hb: Number(this.configArmazem.hb) || 30,
        hf: Number(this.configArmazem.hf) || 6,
        lf: Number(this.configArmazem.lf) || 250,
        le: Number(this.configArmazem.le) || 15,
        ht: Number(this.configArmazem.ht) || 50
      }

      // Aplicar valores validados de volta ao objeto
      Object.assign(this.configArmazem, dimensoesValidadas)

      console.log('📐 [DimensoesBasicas] Dimensão alterada e validada:', {
        configuracao: this.configArmazem,
        dimensoesValidadas,
        tipos: {
          pb: typeof this.configArmazem.pb,
          lb: typeof this.configArmazem.lb,
          hb: typeof this.configArmazem.hb,
          hf: typeof this.configArmazem.hf,
          lf: typeof this.configArmazem.lf,
          le: typeof this.configArmazem.le,
          ht: typeof this.configArmazem.ht
        }
      })

      // 💾 FORÇAR SALVAMENTO IMEDIATO no localStorage para preservar
      this.salvarDimensoesNoLocalStorage()
      
      this.$emit('armazem-change')
      this.$emit('dimensoes-alteradas', {
        configuracao: this.configArmazem,
        dimensoesValidadas,
        timestamp: Date.now()
      })
    },

    // 💾 NOVO: Método para salvar dimensões imediatamente
    salvarDimensoesNoLocalStorage() {
      try {
        const chave = 'dimensoes_temp_' + Date.now()
        const dadosDimensoes = {
          dimensoes: this.configArmazem,
          timestamp: Date.now(),
          versao: '6.0'
        }
        localStorage.setItem(chave, JSON.stringify(dadosDimensoes))
        console.log('💾 [DimensoesBasicas] Dimensões salvas temporariamente:', chave)
      } catch (error) {
        console.warn('⚠️ [DimensoesBasicas] Erro ao salvar dimensões:', error)
      }
    }
  }
}
</script>
