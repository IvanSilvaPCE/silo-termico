
<template>
  <div class="silo-standalone">
    <!-- Controles opcionais -->
    <div v-if="showControls" class="controls-panel mb-3">
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">Controles do Silo</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <label class="form-label">Largura Base (lb)</label>
              <input v-model.number="config.lb" type="number" class="form-control" @input="updateConfig" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Altura Silo (hs)</label>
              <input v-model.number="config.hs" type="number" class="form-control" @input="updateConfig" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Altura Base (hb)</label>
              <input v-model.number="config.hb" type="number" class="form-control" @input="updateConfig" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Escala Sensores</label>
              <input v-model.number="config.escala_sensores" type="number" class="form-control" @input="updateConfig" />
            </div>
          </div>
          <div class="row mt-2">
            <div class="col-md-6">
              <div class="form-check">
                <input v-model="config.aeradores_ativo" type="checkbox" class="form-check-input" @change="updateConfig" />
                <label class="form-check-label">Aeradores Ativos</label>
              </div>
            </div>
            <div v-if="config.aeradores_ativo" class="col-md-3">
              <label class="form-label">Qtd Aeradores</label>
              <input v-model.number="config.na" type="number" min="1" max="6" class="form-control"
                @input="updateConfig" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SVG do Silo -->
    <div class="silo-preview">
      <Silo2D :config="finalConfig" :modo="modo" :dados="processedData" @modo-change="$emit('modo-change', $event)" />
    </div>
  </div>
</template>

<script>
import Silo2D from '../Silo2D.vue'

export default {
  name: 'SiloStandalone',
  components: {
    Silo2D
  },
  props: {
    // Dados do banco ou externos
    data: {
      type: Object,
      default: null
    },
    // Configuração personalizada
    customConfig: {
      type: Object,
      default: () => ({})
    },
    // Modo de visualização
    modo: {
      type: String,
      default: 'temperatura',
      validator: value => ['temperatura', 'mapa'].includes(value)
    },
    // Mostrar controles
    showControls: {
      type: Boolean,
      default: false
    },
    // Largura e altura específicas
    width: {
      type: Number,
      default: null
    },
    height: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      // Configuração padrão do silo
      config: {
        lb: 200,
        hs: 180,
        hb: 15,
        eb: 5,
        escala_sensores: 16,
        dist_y_sensores: 12,
        pos_x_cabos_uniforme: 1,
        pos_x_cabo: [50, 25],
        pos_y_cabo: [160, 160, 160, 160, 160],
        aeradores_ativo: false,
        na: 4,
        ds: 30,
        dy: 0,
        da: 35
      },
      processedData: null
    }
  },
  computed: {
    finalConfig() {
      const merged = { ...this.config, ...this.customConfig }

      // Aplicar dimensões específicas se fornecidas
      if (this.width) merged.lb = this.width
      if (this.height) merged.hs = this.height

      return merged
    }
  },
  watch: {
    data: {
      handler() {
        this.processData()
      },
      deep: true,
      immediate: true
    },
    customConfig: {
      handler() {
        this.updateConfig()
      },
      deep: true
    }
  },
  mounted() {
    this.processData()
  },
  methods: {
    processData() {
      // SiloComponente é apenas para preview/modelagem - sempre usar dados exemplares
      this.criarDadosExemplares()
    },

    criarDadosExemplares() {
      // Criar dados exemplares para demonstração
      const layout = {
        tamanho_svg: [525, 188],
        desenho_corte_silo: {
          lb: this.finalConfig.lb || 463,
          hs: this.finalConfig.hs || 163,
          hb: this.finalConfig.hb || 25,
          eb: this.finalConfig.eb || 3
        },
        desenho_sensores: {
          escala_sensores: this.finalConfig.escala_sensores || 16,
          dist_y_sensores: this.finalConfig.dist_y_sensores || 12,
          pos_y_cabo: [this.finalConfig.pos_y_cabo?.[0] || 152],
          pos_x_cabo: this.finalConfig.pos_x_cabo || [9, 30],
          pos_x_cabos_uniforme: this.finalConfig.pos_x_cabos_uniforme || 1,
          nome_sensores_direita: 0,
          nome_cabo_acima: 0,
          dist_y_nome_cabo: [0]
        },
        aeradores: this.finalConfig.aeradores_ativo ? {
          na: this.finalConfig.na || 4,
          ds: this.finalConfig.ds || -4,
          dy: this.finalConfig.dy || 0,
          da: this.finalConfig.da || 0
        } : { na: 0 }
      }

      // Criar leitura exemplar
      const leitura = {}
      for (let p = 1; p <= 3; p++) {
        leitura[p] = {}
        for (let s = 1; s <= 4; s++) {
          const temp = Math.random() * 30 + 10 // 10-40°C
          leitura[p][s] = [
            Math.round(temp * 10) / 10,
            false, false, false, true
          ]
        }
      }

      this.processedData = {
        dados_layout: layout,
        leitura: leitura,
        motor: { statusMotor: [0, 0, 0, 0] }
      }
    },

    updateConfig() {
      this.$emit('config-change', this.finalConfig)
      // Reprocessar dados
      this.$nextTick(() => {
        this.processData()
      })
    },

    // Métodos públicos para uso externo
    loadConfig(newConfig) {
      this.config = { ...this.config, ...newConfig }
      this.updateConfig()
    },

    loadData(newData) {
      this.processData()
    },

    exportConfig() {
      return this.finalConfig
    },

    exportData() {
      return {
        config: this.finalConfig,
        processedData: this.processedData
      }
    }
  }
}
</script>

<style scoped>
.silo-standalone {
  width: 100%;
  min-height: 300px;
}

.controls-panel {
  background: #f8f9fa;
  border-radius: 8px;
}

.silo-preview {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .controls-panel .row>div {
    margin-bottom: 0.5rem;
  }
}
</style>
