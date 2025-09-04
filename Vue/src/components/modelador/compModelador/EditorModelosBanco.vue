
<template>
  <div class="card mb-3">
    <div class="card-header bg-success text-white">
      <h6 class="mb-0">✏️ Editor de Modelos do Banco</h6>
    </div>

    <div class="card-body p-2">
      <!-- Seletor de Modelo para Editar -->
      <div class="row g-2 mb-3">
        <div class="col-12">
          <label class="form-label small fw-bold">Selecionar Modelo para Editar:</label>
          <select
            class="form-select form-select-sm"
            v-model="modeloSelecionadoParaEdicao"
            @change="carregarModeloParaEdicao"
            :disabled="carregandoModelos"
          >
            <option value="">Selecione um modelo</option>
            <option v-for="modelo in modelosDisponiveis" :key="modelo.id_svg" :value="modelo.id_svg">
              {{ modelo.nm_modelo }} ({{ modelo.tp_svg === 'S' ? 'Silo' : 'Armazém' }})
            </option>
          </select>
          <small v-if="carregandoModelos" class="text-muted">Carregando modelos...</small>
        </div>
      </div>

      <!-- Informações do Modelo Carregado -->
      <div v-if="modeloCarregado" class="alert alert-info p-2 mb-3">
        <div class="row g-2">
          <div class="col-12 col-md-6">
            <strong class="small">Modelo:</strong>
            <span class="small d-block">{{ modeloCarregado.nm_modelo }}</span>
          </div>
          <div class="col-12 col-md-6">
            <strong class="small">Tipo:</strong>
            <span class="small d-block">{{ modeloCarregado.tp_svg === 'S' ? 'Silo' : 'Armazém' }}</span>
          </div>
          <div class="col-12" v-if="modeloCarregado.tp_svg === 'A' && estruturaModelo">
            <strong class="small">Estrutura:</strong>
            <span class="small d-block">
              {{ estruturaModelo.quantidadeModelos }} modelo(s) de arco,
              {{ estruturaModelo.totalArcos }} arcos no armazém
            </span>
          </div>
        </div>
      </div>

      <!-- Seletor de Arco (apenas para armazéns com múltiplos arcos) -->
      <div v-if="modeloCarregado && modeloCarregado.tp_svg === 'A' && estruturaModelo && estruturaModelo.totalArcos > 1" class="row g-2 mb-3">
        <div class="col-12">
          <label class="form-label small fw-bold">Arco para Editar:</label>
          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              @click="mudarArcoEdicao(arcoAtualEdicao - 1)"
              :disabled="arcoAtualEdicao <= 1"
            >
              ←
            </button>
            <select
              class="form-select form-select-sm"
              style="max-width: 120px;"
              v-model.number="arcoAtualEdicao"
              @change="aplicarModeloParaArco"
            >
              <option v-for="arco in estruturaModelo.totalArcos" :key="arco" :value="arco">
                Arco {{ arco }}
              </option>
            </select>
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              @click="mudarArcoEdicao(arcoAtualEdicao + 1)"
              :disabled="arcoAtualEdicao >= estruturaModelo.totalArcos"
            >
              →
            </button>
          </div>
          <small class="text-muted d-block mt-1">
            Modelo aplicado: {{ determinarModeloParaArcoAtual()?.nome || 'Padrão' }}
          </small>
        </div>
      </div>

      <!-- Controles de Edição -->
      <div v-if="modeloCarregado" class="mb-3">
        <div class="d-flex flex-wrap gap-2 justify-content-center">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click="aplicarNoModelador"
            :disabled="!modeloCarregado"
          >
            📝 Aplicar no Modelador
          </button>
          <button
            type="button"
            class="btn btn-warning btn-sm"
            @click="resetarEdicao"
            :disabled="!modoEdicaoAtivo"
          >
            🔄 Resetar Edições
          </button>
          <button
            type="button"
            class="btn btn-success btn-sm"
            @click="salvarAlteracoes"
            :disabled="!modoEdicaoAtivo || !possuiAlteracoes"
          >
            💾 Salvar Alterações
          </button>
        </div>
      </div>

      <!-- Status da Edição -->
      <div v-if="modoEdicaoAtivo" class="alert alert-warning p-2">
        <div class="text-center">
          <strong class="small d-block">🔧 MODO EDIÇÃO ATIVO</strong>
          <span class="small">Editando: {{ modeloCarregado.nm_modelo }}</span>
          <div v-if="modeloCarregado.tp_svg === 'A'" class="small">
            Arco: {{ arcoAtualEdicao }}/{{ estruturaModelo?.totalArcos || 1 }}
          </div>
          <div v-if="possuiAlteracoes" class="badge bg-info mt-1">
            ⚠️ Alterações não salvas
          </div>
        </div>
      </div>

      <!-- Log de Alterações -->
      <div v-if="logAlteracoes.length > 0" class="mt-3">
        <h6 class="small fw-bold">📋 Log de Alterações:</h6>
        <div class="bg-light p-2 rounded" style="max-height: 150px; overflow-y: auto;">
          <div v-for="(log, index) in logAlteracoes" :key="index" class="small mb-1">
            <span class="text-muted">{{ formatarTempo(log.timestamp) }}</span>
            - {{ log.descricao }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { modeloSvgService } from '../services/modeloSvgService.js'

export default {
  name: 'EditorModelosBanco',
  
  props: {
    tipoAtivo: String,
    configSilo: Object,
    configArmazem: Object,
    modelosArcos: Object,
    quantidadeModelosArcos: Number,
    arcoAtual: Number
  },

  data() {
    return {
      // Estado de carregamento
      carregandoModelos: false,
      modelosDisponiveis: [],
      
      // Modelo selecionado para edição
      modeloSelecionadoParaEdicao: '',
      modeloCarregado: null,
      
      // Estrutura do modelo carregado
      estruturaModelo: null,
      arcoAtualEdicao: 1,
      
      // Estado de edição
      modoEdicaoAtivo: false,
      configuracaoOriginal: null,
      configuracaoAtual: null,
      possuiAlteracoes: false,
      
      // Log de alterações
      logAlteracoes: []
    }
  },

  async mounted() {
    await this.carregarModelosDoBanco()
  },

  watch: {
    // Monitorar mudanças no arco atual do ModeladorSVG
    arcoAtual: {
      handler(novoArco) {
        if (this.modeloCarregado && !this.modoEdicaoAtivo) {
          // Sincronizar arco atual com o ModeladorSVG
          this.arcoAtualEdicao = novoArco
        }
      }
    },

    // Monitorar alterações no modelador para detectar edições
    configSilo: {
      deep: true,
      handler() {
        if (this.modoEdicaoAtivo && this.modeloCarregado?.tp_svg === 'S') {
          this.detectarAlteracoes()
        }
      }
    },
    
    configArmazem: {
      deep: true,
      handler() {
        if (this.modoEdicaoAtivo && this.modeloCarregado?.tp_svg === 'A') {
          this.detectarAlteracoes()
        }
      }
    },
    
    modelosArcos: {
      deep: true,
      handler() {
        if (this.modoEdicaoAtivo && this.modeloCarregado?.tp_svg === 'A') {
          this.detectarAlteracoes()
        }
      }
    }
  },

  methods: {
    async carregarModelosDoBanco() {
      this.carregandoModelos = true
      try {
        const response = await modeloSvgService.buscarModelos()
        if (response && response.data) {
          this.modelosDisponiveis = Array.isArray(response.data) ? response.data : []
        } else {
          this.modelosDisponiveis = []
        }
      } catch (error) {
        console.error('Erro ao carregar modelos do banco:', error)
        this.$emit('mostrar-toast', 'Erro ao carregar modelos do banco', 'error')
        this.modelosDisponiveis = []
      } finally {
        this.carregandoModelos = false
      }
    },

    async carregarModeloParaEdicao() {
      if (!this.modeloSelecionadoParaEdicao) {
        this.limparEdicao()
        return
      }

      try {
        const response = await modeloSvgService.buscarModeloPorId(this.modeloSelecionadoParaEdicao)
        
        if (response && response.data) {
          this.modeloCarregado = response.data
          
          // Analisar estrutura do modelo
          this.analisarEstruturaModelo()
          
          // Resetar arco atual
          this.arcoAtualEdicao = 1
          
          // IMPORTANTE: Carregar dados no preview automaticamente
          this.carregarDadosNoPreview()
          
          this.$emit('mostrar-toast', `Modelo "${this.modeloCarregado.nm_modelo}" carregado no preview`, 'success')
        }
      } catch (error) {
        console.error('Erro ao carregar modelo:', error)
        this.$emit('mostrar-toast', 'Erro ao carregar modelo', 'error')
      }
    },

    carregarDadosNoPreview() {
      if (!this.modeloCarregado) return

      try {
        const dadosSVG = typeof this.modeloCarregado.dado_svg === 'string'
          ? JSON.parse(this.modeloCarregado.dado_svg)
          : this.modeloCarregado.dado_svg

        console.log('🔄 [EditorModelosBanco] Carregando dados no preview:', {
          nome: this.modeloCarregado.nm_modelo,
          tipo: this.modeloCarregado.tp_svg,
          arco: this.arcoAtualEdicao
        })

        // Emitir evento para carregar no ModeladorSVG
        this.$emit('aplicar-modelo-edicao', {
          modelo: this.modeloCarregado,
          arcoAtual: this.arcoAtualEdicao,
          dadosProcessados: dadosSVG
        })

      } catch (error) {
        console.error('❌ [EditorModelosBanco] Erro ao carregar dados no preview:', error)
        this.$emit('mostrar-toast', 'Erro ao carregar dados no preview', 'error')
      }
    },

    analisarEstruturaModelo() {
      if (!this.modeloCarregado || !this.modeloCarregado.dado_svg) return

      try {
        const dadosSVG = typeof this.modeloCarregado.dado_svg === 'string'
          ? JSON.parse(this.modeloCarregado.dado_svg)
          : this.modeloCarregado.dado_svg

        if (this.modeloCarregado.tp_svg === 'A') {
          // Analisar estrutura do armazém
          this.estruturaModelo = {
            quantidadeModelos: dadosSVG.sistemaModelos?.quantidadeModelos || 
                              dadosSVG.quantidadeModelos || 
                              Object.keys(dadosSVG.modelosDefinidos || dadosSVG.modelos || {}).length || 1,
            totalArcos: dadosSVG.estruturaReferencia?.totalArcos || 
                       dadosSVG.dadosOriginais?.analiseArcos?.totalArcos || 1,
            modelos: dadosSVG.sistemaModelos?.modelosDefinidos || 
                    dadosSVG.modelosDefinidos || 
                    dadosSVG.modelos || {}
          }
        } else {
          // Para silo, estrutura simples
          this.estruturaModelo = {
            quantidadeModelos: 1,
            totalArcos: 1,
            modelos: { 1: dadosSVG }
          }
        }
      } catch (error) {
        console.error('Erro ao analisar estrutura do modelo:', error)
        this.estruturaModelo = { quantidadeModelos: 1, totalArcos: 1, modelos: {} }
      }
    },

    determinarModeloParaArcoAtual() {
      if (!this.estruturaModelo || !this.estruturaModelo.modelos) return null

      const { quantidadeModelos, totalArcos, modelos } = this.estruturaModelo
      const numeroArco = this.arcoAtualEdicao

      // Aplicar mesma lógica do ModeladorSVG
      if (quantidadeModelos === 1) {
        return Object.values(modelos)[0] || null
      }

      if (quantidadeModelos === 2) {
        const isImpar = numeroArco % 2 === 1
        const posicaoProcurada = isImpar ? 'impar' : 'par'
        return Object.values(modelos).find(modelo => modelo?.posicao === posicaoProcurada) || Object.values(modelos)[0]
      }

      if (quantidadeModelos === 3) {
        if (numeroArco === 1 || numeroArco === totalArcos) {
          return Object.values(modelos).find(modelo => modelo?.posicao === 'frente_fundo') || Object.values(modelos)[0]
        } else {
          const isParIntermediario = numeroArco % 2 === 0
          const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
          return Object.values(modelos).find(modelo => modelo?.posicao === posicaoProcurada) || Object.values(modelos)[0]
        }
      }

      if (quantidadeModelos === 4) {
        if (numeroArco === 1) {
          return Object.values(modelos).find(modelo => modelo?.posicao === 'frente') || Object.values(modelos)[0]
        }
        if (numeroArco === totalArcos) {
          return Object.values(modelos).find(modelo => modelo?.posicao === 'fundo') || Object.values(modelos)[0]
        }
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        return Object.values(modelos).find(modelo => modelo?.posicao === posicaoProcurada) || Object.values(modelos)[0]
      }

      return Object.values(modelos)[0] || null
    },

    mudarArcoEdicao(novoArco) {
      if (novoArco >= 1 && novoArco <= (this.estruturaModelo?.totalArcos || 1)) {
        this.arcoAtualEdicao = novoArco
        this.aplicarModeloParaArco()
      }
    },

    aplicarModeloParaArco() {
      if (!this.modeloCarregado) return

      console.log('🔄 [EditorModelosBanco] Aplicando modelo para arco:', this.arcoAtualEdicao)

      // Recarregar dados no preview para o novo arco
      this.carregarDadosNoPreview()

      // Se estiver em modo de edição, também emitir evento de mudança de arco
      if (this.modoEdicaoAtivo) {
        this.$emit('mudar-arco-edicao', this.arcoAtualEdicao)
      }
    },

    aplicarNoModelador() {
      if (!this.modeloCarregado) return

      try {
        // Salvar configuração original para comparação
        this.salvarConfiguracaoOriginal()

        // Aplicar configuração no modelador
        this.$emit('aplicar-modelo-edicao', {
          modelo: this.modeloCarregado,
          arcoAtual: this.arcoAtualEdicao
        })

        // Ativar modo de edição
        this.modoEdicaoAtivo = true
        this.possuiAlteracoes = false
        
        this.adicionarLog('Modelo aplicado no modelador')
        this.$emit('mostrar-toast', 'Modelo aplicado! Você pode editá-lo agora.', 'info')
      } catch (error) {
        console.error('Erro ao aplicar modelo no modelador:', error)
        this.$emit('mostrar-toast', 'Erro ao aplicar modelo', 'error')
      }
    },

    salvarConfiguracaoOriginal() {
      if (this.modeloCarregado.tp_svg === 'S') {
        this.configuracaoOriginal = { ...this.configSilo }
      } else {
        this.configuracaoOriginal = {
          configArmazem: { ...this.configArmazem },
          modelosArcos: JSON.parse(JSON.stringify(this.modelosArcos)),
          quantidadeModelos: this.quantidadeModelosArcos
        }
      }
    },

    detectarAlteracoes() {
      if (!this.configuracaoOriginal || !this.modoEdicaoAtivo) return

      let temAlteracoes = false

      if (this.modeloCarregado.tp_svg === 'S') {
        // Comparar configuração do silo
        const chavesConfig = Object.keys(this.configuracaoOriginal)
        temAlteracoes = chavesConfig.some(chave => 
          this.configuracaoOriginal[chave] !== this.configSilo[chave]
        )
      } else {
        // Comparar configuração do armazém
        const chavesConfig = Object.keys(this.configuracaoOriginal.configArmazem)
        const configMudou = chavesConfig.some(chave => 
          this.configuracaoOriginal.configArmazem[chave] !== this.configArmazem[chave]
        )
        
        const modelosMudaram = JSON.stringify(this.configuracaoOriginal.modelosArcos) !== 
                              JSON.stringify(this.modelosArcos)
        
        temAlteracoes = configMudou || modelosMudaram
      }

      if (temAlteracoes !== this.possuiAlteracoes) {
        this.possuiAlteracoes = temAlteracoes
        if (temAlteracoes) {
          this.adicionarLog('Alterações detectadas')
        }
      }
    },

    async salvarAlteracoes() {
      if (!this.modoEdicaoAtivo || !this.possuiAlteracoes) return

      try {
        // Preparar dados para salvamento
        const dadosParaSalvar = this.prepararDadosParaSalvamento()
        
        // Salvar no banco
        const response = await modeloSvgService.atualizarModelo(
          this.modeloCarregado.id_svg,
          dadosParaSalvar
        )

        if (response.success) {
          this.adicionarLog('Alterações salvas no banco de dados')
          this.$emit('mostrar-toast', 'Alterações salvas com sucesso!', 'success')
          
          // Atualizar configuração original
          this.salvarConfiguracaoOriginal()
          this.possuiAlteracoes = false
        } else {
          throw new Error(response.message || 'Erro ao salvar')
        }
      } catch (error) {
        console.error('Erro ao salvar alterações:', error)
        this.$emit('mostrar-toast', 'Erro ao salvar alterações', 'error')
      }
    },

    prepararDadosParaSalvamento() {
      if (this.modeloCarregado.tp_svg === 'S') {
        // Para silo, salvar configuração direta
        return {
          nm_modelo: this.modeloCarregado.nm_modelo,
          tp_svg: 'S',
          dado_svg: JSON.stringify({
            configuracao: { ...this.configSilo },
            timestamp: new Date().toISOString(),
            versao: '6.1'
          })
        }
      } else {
        // Para armazém, manter estrutura e atualizar apenas o que foi editado
        const dadosOriginais = typeof this.modeloCarregado.dado_svg === 'string'
          ? JSON.parse(this.modeloCarregado.dado_svg)
          : this.modeloCarregado.dado_svg

        // Atualizar configuração global
        if (dadosOriginais.configuracaoGlobal) {
          dadosOriginais.configuracaoGlobal = { ...this.configArmazem }
        }

        // Atualizar sistema de modelos
        if (dadosOriginais.sistemaModelos) {
          dadosOriginais.sistemaModelos.quantidadeModelos = this.quantidadeModelosArcos
          dadosOriginais.sistemaModelos.modelosDefinidos = JSON.parse(JSON.stringify(this.modelosArcos))
        }

        // Atualizar timestamp
        dadosOriginais.timestamp = new Date().toISOString()
        dadosOriginais.versao = '6.1'

        return {
          nm_modelo: this.modeloCarregado.nm_modelo,
          tp_svg: 'A',
          dado_svg: JSON.stringify(dadosOriginais)
        }
      }
    },

    resetarEdicao() {
      if (!this.modoEdicaoAtivo) return

      // Restaurar configuração original
      if (this.modeloCarregado.tp_svg === 'S') {
        this.$emit('restaurar-configuracao', {
          tipo: 'silo',
          configuracao: { ...this.configuracaoOriginal }
        })
      } else {
        this.$emit('restaurar-configuracao', {
          tipo: 'armazem',
          configuracao: this.configuracaoOriginal
        })
      }

      this.possuiAlteracoes = false
      this.adicionarLog('Edições resetadas para configuração original')
      this.$emit('mostrar-toast', 'Edições resetadas', 'info')
    },

    limparEdicao() {
      this.modeloCarregado = null
      this.estruturaModelo = null
      this.modoEdicaoAtivo = false
      this.configuracaoOriginal = null
      this.possuiAlteracoes = false
      this.arcoAtualEdicao = 1
      this.logAlteracoes = []
    },

    adicionarLog(descricao) {
      this.logAlteracoes.unshift({
        timestamp: new Date(),
        descricao
      })
      
      // Manter apenas os últimos 10 logs
      if (this.logAlteracoes.length > 10) {
        this.logAlteracoes = this.logAlteracoes.slice(0, 10)
      }
    },

    formatarTempo(timestamp) {
      return timestamp.toLocaleTimeString()
    }
  }
}
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa !important;
}

.badge-sm {
  font-size: 0.75em;
}

/* Responsivo */
@media (max-width: 576px) {
  .btn-sm {
    font-size: 12px;
    padding: 0.25rem 0.5rem;
  }
  
  .form-control,
  .form-select {
    font-size: 14px;
  }
}
</style>
