
<template>
  <div class="armazem-standalone">
    <!-- Controles opcionais -->
    <div v-if="showControls" class="controls-panel mb-3">
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">Controles do Armazém</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <label class="form-label">Largura (lb)</label>
              <input 
                v-model.number="config.lb" 
                type="number" 
                class="form-control"
                @input="updateConfig"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Altura Base (pb)</label>
              <input 
                v-model.number="config.pb" 
                type="number" 
                class="form-control"
                @input="updateConfig"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Tipo Telhado</label>
              <select 
                v-model.number="config.tipo_telhado" 
                class="form-control"
                @change="updateConfig"
              >
                <option :value="1">Pontudo</option>
                <option :value="2">Arredondado</option>
                <option :value="3">Arco</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Escala Sensores</label>
              <input 
                v-model.number="config.escala_sensores" 
                type="number" 
                class="form-control"
                @input="updateConfig"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SVG do Armazém -->
    <div class="armazem-preview">
      <Armazem2D
        :config="finalConfig"
        :modo="modo"
        :dados="processedData"
        :arco-atual="arcoAtual"
        :layouts-automaticos="layoutsAutomaticos"
        :analise-arcos="analiseArcos"
        @modo-change="$emit('modo-change', $event)"
      />
    </div>

    <!-- Navegação de Arcos -->
    <div v-if="showNavigation && analiseArcos" class="navigation-panel mt-3">
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <button 
              @click="previousArco"
              :disabled="arcoAtual <= 1"
              class="btn btn-primary"
            >
              ← Anterior
            </button>
            
            <div class="arco-info text-center">
              <strong>Arco {{ arcoAtual }}/{{ analiseArcos.totalArcos }}</strong>
              <div class="small text-muted">
                {{ analiseArcos.arcos[arcoAtual]?.totalPendulos || 0 }} Pêndulos, 
                {{ analiseArcos.arcos[arcoAtual]?.totalSensores || 0 }} Sensores
              </div>
            </div>
            
            <button 
              @click="nextArco"
              :disabled="arcoAtual >= analiseArcos.totalArcos"
              class="btn btn-primary"
            >
              Próximo →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Armazem2D from '../Armazem2D.vue'
import LayoutManager from '../utils/layoutManager.js'

export default {
  name: 'ArmazemStandalone',
  components: {
    Armazem2D
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
    // Mostrar navegação
    showNavigation: {
      type: Boolean,
      default: true
    },
    // Arco inicial
    initialArco: {
      type: Number,
      default: 1
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
      // Configuração padrão do armazém
      config: {
        pb: 185,
        lb: 350,
        hb: 30,
        hf: 5,
        lf: 250,
        le: 15,
        ht: 50,
        tipo_telhado: 1,
        curvatura_topo: 30,
        pontas_redondas: false,
        raio_pontas: 15,
        estilo_laterais: 'reta',
        curvatura_laterais: 0,
        tipo_fundo: 0,
        altura_fundo_reto: 10,
        altura_funil_v: 18,
        posicao_ponta_v: 0,
        inclinacao_funil_v: 1,
        largura_abertura_v: 20,
        altura_duplo_v: 22,
        posicao_v_esquerdo: -1,
        posicao_v_direito: 1,
        largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3,
        largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0,
        deslocamento_vertical_fundo: -1,
        escala_sensores: 16,
        dist_y_sensores: 12,
        dist_x_sensores: 0,
        posicao_horizontal: 0,
        posicao_vertical: 0,
        afastamento_vertical_pendulo: 0
      },
      arcoAtual: 1,
      analiseArcos: null,
      layoutsAutomaticos: null,
      processedData: null
    }
  },
  computed: {
    finalConfig() {
      const merged = { ...this.config, ...this.customConfig }
      
      // Aplicar dimensões específicas se fornecidas
      if (this.width) merged.lb = this.width
      if (this.height) merged.pb = this.height
      
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
    this.arcoAtual = this.initialArco
    this.processData()
  },
  methods: {
    processData() {
      if (this.data) {
        // Processar dados do banco
        this.analiseArcos = this.analisarEstrutura(this.data)
        this.layoutsAutomaticos = LayoutManager.gerarLayoutAutomatico(this.analiseArcos)
        this.processedData = this.converterDados(this.data, this.arcoAtual)
      } else {
        // Criar dados exemplares
        this.criarDadosExemplares()
      }
    },
    
    analisarEstrutura(dados) {
      if (!dados.arcos) {
        return this.criarEstruturaMinima()
      }

      const estrutura = {
        totalArcos: 0,
        arcos: {},
        estatisticas: {
          totalPendulos: 0,
          totalSensores: 0
        }
      }

      Object.keys(dados.arcos).forEach(numeroArco => {
        const dadosArco = dados.arcos[numeroArco]
        const arcoNum = parseInt(numeroArco)

        estrutura.totalArcos = Math.max(estrutura.totalArcos, arcoNum)

        const infoArco = {
          numero: arcoNum,
          totalPendulos: 0,
          totalSensores: 0,
          pendulos: []
        }

        Object.keys(dadosArco).forEach(numeroPendulo => {
          const dadosPendulo = dadosArco[numeroPendulo]
          const penduloNum = parseInt(numeroPendulo)

          const infoPendulo = {
            numero: penduloNum,
            totalSensores: Object.keys(dadosPendulo).length
          }

          infoArco.pendulos.push(infoPendulo)
          infoArco.totalPendulos++
          infoArco.totalSensores += infoPendulo.totalSensores
        })

        infoArco.pendulos.sort((a, b) => a.numero - b.numero)
        estrutura.arcos[arcoNum] = infoArco
        estrutura.estatisticas.totalPendulos += infoArco.totalPendulos
        estrutura.estatisticas.totalSensores += infoArco.totalSensores
      })

      return estrutura
    },

    converterDados(dadosAPI, numeroArco) {
      if (!dadosAPI.arcos || !dadosAPI.arcos[numeroArco]) {
        return { leitura: {} }
      }

      const dadosArco = dadosAPI.arcos[numeroArco]
      const leituraConvertida = {}

      Object.keys(dadosArco).forEach(numeroPendulo => {
        const sensoresPendulo = dadosArco[numeroPendulo]
        leituraConvertida[numeroPendulo] = {}

        Object.keys(sensoresPendulo).forEach(numeroSensor => {
          const dadosSensor = sensoresPendulo[numeroSensor]
          leituraConvertida[numeroPendulo][numeroSensor] = dadosSensor
        })
      })

      return {
        leitura: leituraConvertida,
        arcoAtual: numeroArco,
        timestamp: new Date().toISOString()
      }
    },

    criarEstruturaMinima() {
      return {
        totalArcos: 3,
        arcos: {
          1: { numero: 1, totalPendulos: 3, totalSensores: 12, pendulos: [
            { numero: 1, totalSensores: 4 },
            { numero: 2, totalSensores: 4 },
            { numero: 3, totalSensores: 4 }
          ]},
          2: { numero: 2, totalPendulos: 3, totalSensores: 12, pendulos: [
            { numero: 1, totalSensores: 4 },
            { numero: 2, totalSensores: 4 },
            { numero: 3, totalSensores: 4 }
          ]},
          3: { numero: 3, totalPendulos: 3, totalSensores: 12, pendulos: [
            { numero: 1, totalSensores: 4 },
            { numero: 2, totalSensores: 4 },
            { numero: 3, totalSensores: 4 }
          ]}
        },
        estatisticas: {
          totalPendulos: 9,
          totalSensores: 36
        }
      }
    },

    criarDadosExemplares() {
      const estrutura = this.criarEstruturaMinima()
      this.analiseArcos = estrutura
      this.layoutsAutomaticos = LayoutManager.gerarLayoutAutomatico(estrutura)
      
      // Criar dados exemplares para o arco atual
      const dadosExemplo = { leitura: {} }
      
      const arcoInfo = estrutura.arcos[this.arcoAtual]
      if (arcoInfo) {
        arcoInfo.pendulos.forEach(pendulo => {
          dadosExemplo.leitura[pendulo.numero] = {}
          for (let s = 1; s <= pendulo.totalSensores; s++) {
            const temp = Math.random() * 30 + 10 // 10-40°C
            dadosExemplo.leitura[pendulo.numero][s] = [
              Math.round(temp * 10) / 10,
              false, false, false, true
            ]
          }
        })
      }
      
      this.processedData = dadosExemplo
    },

    updateConfig() {
      this.$emit('config-change', this.finalConfig)
      // Reprocessar dados se necessário
      this.$nextTick(() => {
        if (this.processedData) {
          this.processedData = this.converterDados(this.data || { arcos: {} }, this.arcoAtual)
        }
      })
    },

    nextArco() {
      if (this.analiseArcos && this.arcoAtual < this.analiseArcos.totalArcos) {
        this.arcoAtual++
        this.processedData = this.converterDados(this.data || { arcos: {} }, this.arcoAtual)
        this.$emit('arco-change', this.arcoAtual)
      }
    },

    previousArco() {
      if (this.arcoAtual > 1) {
        this.arcoAtual--
        this.processedData = this.converterDados(this.data || { arcos: {} }, this.arcoAtual)
        this.$emit('arco-change', this.arcoAtual)
      }
    },

    // Métodos públicos para uso externo
    setArco(numeroArco) {
      if (this.analiseArcos && numeroArco >= 1 && numeroArco <= this.analiseArcos.totalArcos) {
        this.arcoAtual = numeroArco
        this.processedData = this.converterDados(this.data || { arcos: {} }, this.arcoAtual)
        this.$emit('arco-change', this.arcoAtual)
      }
    },

    loadConfig(newConfig) {
      this.config = { ...this.config, ...newConfig }
      this.updateConfig()
    },

    loadData(newData) {
      this.data = newData
      this.processData()
    },

    exportConfig() {
      return this.finalConfig
    },

    exportData() {
      return {
        config: this.finalConfig,
        arcoAtual: this.arcoAtual,
        analiseArcos: this.analiseArcos,
        layoutsAutomaticos: this.layoutsAutomaticos,
        processedData: this.processedData
      }
    }
  }
}
</script>

<style scoped>
.armazem-standalone {
  width: 100%;
  min-height: 300px;
}

.controls-panel {
  background: #f8f9fa;
  border-radius: 8px;
}

.armazem-preview {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navigation-panel .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.arco-info {
  flex: 1;
  margin: 0 1rem;
}

@media (max-width: 768px) {
  .controls-panel .row > div {
    margin-bottom: 0.5rem;
  }
  
  .navigation-panel .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .arco-info {
    margin: 0;
  }
}
</style>
