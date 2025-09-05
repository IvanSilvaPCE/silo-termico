
<template>
  <div class="card mt-3">
    <div class="card-header bg-info text-white">
      <h6 class="mb-0">
        <i class="fa fa-arrows"></i> Posições Manuais
        <span v-if="totalElementosMovidos > 0" class="badge bg-warning text-dark ms-2">
          {{ totalElementosMovidos }} movidos
        </span>
      </h6>
    </div>
    <div class="card-body">
      <!-- Status das posições -->
      <div class="row mb-3">
        <div class="col-6">
          <div class="text-center">
            <div class="badge bg-primary">{{ totalPendulosComPosicao }} Pêndulos</div>
            <div class="small text-muted">movidos manualmente</div>
          </div>
        </div>
        <div class="col-6">
          <div class="text-center">
            <div class="badge bg-secondary">{{ totalSensoresComPosicao }} Sensores</div>
            <div class="small text-muted">movidos individualmente</div>
          </div>
        </div>
      </div>

      <!-- Botões de ação -->
      <div class="row g-2">
        <div class="col-6">
          <button type="button" class="btn btn-success btn-sm w-100" 
                  @click="salvarPosicoesCompletas" 
                  :disabled="!temPosicoesParaSalvar">
            <i class="fa fa-save"></i> Salvar Posições
          </button>
        </div>
        <div class="col-6">
          <button type="button" class="btn btn-warning btn-sm w-100" 
                  @click="resetarPosicoes">
            <i class="fa fa-undo"></i> Resetar Tudo
          </button>
        </div>
      </div>

      <!-- Preview das posições (modo debug) -->
      <div v-if="modoDebug" class="mt-3">
        <button type="button" class="btn btn-outline-info btn-sm" 
                @click="mostrarDetalhes = !mostrarDetalhes">
          <i class="fa fa-eye"></i> {{ mostrarDetalhes ? 'Ocultar' : 'Ver' }} Detalhes JSON
        </button>
        
        <div v-if="mostrarDetalhes" class="mt-2">
          <pre class="bg-light p-2 small" style="max-height: 200px; overflow-y: auto;">{{ jsonPosicoes }}</pre>
        </div>
      </div>

      <!-- Últimas posições salvas -->
      <div v-if="ultimoSalvamento" class="mt-2">
        <small class="text-muted">
          <i class="fa fa-clock-o"></i> Último salvamento: {{ formatarData(ultimoSalvamento) }}
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GerenciadorPosicoesManual',
  props: {
    posicoesManualPendulos: {
      type: Object,
      default: () => ({})
    },
    posicoesManualSensores: {
      type: Object,
      default: () => ({})
    },
    modeloAtual: {
      type: [String, Number],
      default: null
    },
    quantidadePendulos: {
      type: Number,
      default: 3
    },
    sensoresPorPendulo: {
      type: Object,
      default: () => ({})
    },
    modoDebug: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      mostrarDetalhes: false,
      ultimoSalvamento: null,
      salvandoBanco: false
    }
  },
  computed: {
    totalPendulosComPosicao() {
      return Object.keys(this.posicoesManualPendulos || {}).length
    },
    totalSensoresComPosicao() {
      return Object.keys(this.posicoesManualSensores || {}).length
    },
    totalElementosMovidos() {
      return this.totalPendulosComPosicao + this.totalSensoresComPosicao
    },
    temPosicoesParaSalvar() {
      return this.totalElementosMovidos > 0 && this.modeloAtual
    },
    jsonPosicoes() {
      return JSON.stringify(this.gerarEstruturaPosicoes(), null, 2)
    }
  },
  mounted() {
    this.carregarUltimoSalvamento()
  },
  methods: {
    gerarEstruturaPosicoes() {
      const estrutura = {
        modelo: this.modeloAtual,
        timestamp: new Date().toISOString(),
        configuracao: {
          quantidadePendulos: this.quantidadePendulos,
          sensoresPorPendulo: { ...this.sensoresPorPendulo }
        },
        posicoes: {
          pendulos: {},
          sensores: {}
        },
        estatisticas: {
          totalPendulos: this.quantidadePendulos,
          pendulosMovidos: this.totalPendulosComPosicao,
          totalSensores: this.calcularTotalSensores(),
          sensoresMovidosIndividualmente: this.totalSensoresComPosicao
        }
      }

      // Mapear posições dos pêndulos
      Object.keys(this.posicoesManualPendulos || {}).forEach(numeroPendulo => {
        const posicao = this.posicoesManualPendulos[numeroPendulo]
        estrutura.posicoes.pendulos[`P${numeroPendulo}`] = {
          numero: parseInt(numeroPendulo),
          x: Math.round(posicao.x * 100) / 100, // Arredondar para 2 casas decimais
          y: Math.round(posicao.y * 100) / 100,
          offsetX: Math.round((posicao.offsetX || 0) * 100) / 100,
          offsetY: Math.round((posicao.offsetY || 0) * 100) / 100,
          timestampAlteracao: posicao.timestampAlteracao || Date.now(),
          quantidadeSensores: this.sensoresPorPendulo[numeroPendulo] || 0
        }
      })

      // Mapear posições dos sensores
      Object.keys(this.posicoesManualSensores || {}).forEach(chaveSensor => {
        const [numeroPendulo, numeroSensor] = chaveSensor.split('-')
        const posicao = this.posicoesManualSensores[chaveSensor]
        
        const chaveJson = `P${numeroPendulo}S${numeroSensor}`
        estrutura.posicoes.sensores[chaveJson] = {
          pendulo: parseInt(numeroPendulo),
          sensor: parseInt(numeroSensor),
          x: Math.round(posicao.x * 100) / 100,
          y: Math.round(posicao.y * 100) / 100,
          offsetX: Math.round((posicao.offsetX || 0) * 100) / 100,
          offsetY: Math.round((posicao.offsetY || 0) * 100) / 100,
          timestampAlteracao: posicao.timestampAlteracao || Date.now()
        }
      })

      return estrutura
    },

    async salvarPosicoesCompletas() {
      if (!this.temPosicoesParaSalvar) {
        this.$emit('mostrar-toast', 'Nenhuma posição para salvar!', 'warning')
        return
      }

      try {
        const estruturaPosicoes = this.gerarEstruturaPosicoes()
        
        // 1. Salvar no localStorage por modelo
        this.salvarNoLocalStorage(estruturaPosicoes)
        
        // 2. Emitir evento para salvar no banco
        this.$emit('salvar-posicoes-banco', estruturaPosicoes)
        
        // 3. Atualizar timestamp do último salvamento
        this.ultimoSalvamento = new Date().toISOString()
        this.salvarUltimoSalvamento()
        
        this.$emit('mostrar-toast', 
          `✅ Posições salvas!\n` +
          `📊 ${this.totalPendulosComPosicao} pêndulos e ${this.totalSensoresComPosicao} sensores\n` +
          `💾 Salvo no localStorage e enviado para o banco`, 
          'success'
        )

      } catch (error) {
        console.error('❌ [GerenciadorPosicoesManual] Erro ao salvar posições:', error)
        this.$emit('mostrar-toast', 'Erro ao salvar posições!', 'error')
      }
    },

    salvarNoLocalStorage(estruturaPosicoes) {
      if (typeof localStorage === 'undefined') return

      try {
        const chaveModelo = `posicoes_modelo_${this.modeloAtual}`
        const dadosParaSalvar = {
          ...estruturaPosicoes,
          versao: '1.0',
          tipoSalvamento: 'posicoes_manuais_completo'
        }

        localStorage.setItem(chaveModelo, JSON.stringify(dadosParaSalvar))
        console.log(`💾 [GerenciadorPosicoesManual] Posições salvas no localStorage para modelo ${this.modeloAtual}`)

        // Também salvar um histórico das últimas 5 posições
        this.salvarHistoricoLocalStorage(dadosParaSalvar)

      } catch (error) {
        console.error('❌ [GerenciadorPosicoesManual] Erro ao salvar no localStorage:', error)
        throw error
      }
    },

    salvarHistoricoLocalStorage(dadosPosicoes) {
      try {
        const chaveHistorico = 'historico_posicoes_manuais'
        let historico = []

        const historicoExistente = localStorage.getItem(chaveHistorico)
        if (historicoExistente) {
          historico = JSON.parse(historicoExistente)
        }

        // Adicionar nova entrada
        historico.unshift({
          timestamp: new Date().toISOString(),
          modelo: this.modeloAtual,
          dados: dadosPosicoes,
          resumo: `${this.totalPendulosComPosicao}P + ${this.totalSensoresComPosicao}S`
        })

        // Manter apenas as últimas 5 entradas
        if (historico.length > 5) {
          historico = historico.slice(0, 5)
        }

        localStorage.setItem(chaveHistorico, JSON.stringify(historico))

      } catch (error) {
        console.warn('⚠️ [GerenciadorPosicoesManual] Erro ao salvar histórico:', error)
      }
    },

    carregarPosicoesDoLocalStorage(numeroModelo) {
      if (typeof localStorage === 'undefined') return null

      try {
        const chaveModelo = `posicoes_modelo_${numeroModelo}`
        const dados = localStorage.getItem(chaveModelo)
        
        if (dados) {
          const posicoesCarregadas = JSON.parse(dados)
          console.log(`📂 [GerenciadorPosicoesManual] Posições carregadas do localStorage para modelo ${numeroModelo}`)
          return posicoesCarregadas
        }
        
        return null
      } catch (error) {
        console.error('❌ [GerenciadorPosicoesManual] Erro ao carregar do localStorage:', error)
        return null
      }
    },

    resetarPosicoes() {
      this.$emit('resetar-posicoes')
      
      // Limpar localStorage do modelo atual se existir
      if (this.modeloAtual && typeof localStorage !== 'undefined') {
        try {
          const chaveModelo = `posicoes_modelo_${this.modeloAtual}`
          localStorage.removeItem(chaveModelo)
          console.log(`🗑️ [GerenciadorPosicoesManual] Posições removidas do localStorage para modelo ${this.modeloAtual}`)
        } catch (error) {
          console.warn('⚠️ [GerenciadorPosicoesManual] Erro ao limpar localStorage:', error)
        }
      }

      this.$emit('mostrar-toast', 'Todas as posições foram resetadas!', 'success')
    },

    calcularTotalSensores() {
      let total = 0
      Object.values(this.sensoresPorPendulo || {}).forEach(quantidade => {
        total += parseInt(quantidade) || 0
      })
      return total
    },

    formatarData(isoString) {
      if (!isoString) return 'Nunca'
      
      try {
        const data = new Date(isoString)
        return data.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'Data inválida'
      }
    },

    salvarUltimoSalvamento() {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('ultimo_salvamento_posicoes', this.ultimoSalvamento)
        } catch (error) {
          console.warn('⚠️ [GerenciadorPosicoesManual] Erro ao salvar timestamp:', error)
        }
      }
    },

    carregarUltimoSalvamento() {
      if (typeof localStorage !== 'undefined') {
        try {
          this.ultimoSalvamento = localStorage.getItem('ultimo_salvamento_posicoes')
        } catch (error) {
          console.warn('⚠️ [GerenciadorPosicoesManual] Erro ao carregar timestamp:', error)
        }
      }
    },

    // Método público para ser chamado pelo componente pai
    carregarPosicoesModelo(numeroModelo) {
      return this.carregarPosicoesDoLocalStorage(numeroModelo)
    }
  }
}
</script>

<style scoped>
.badge {
  font-size: 0.8rem;
}

.btn-sm {
  font-size: 0.8rem;
}

pre {
  font-size: 0.7rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.text-muted {
  font-size: 0.75rem;
}
</style>
