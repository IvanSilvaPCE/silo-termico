
<template>
  <div>
    <div class="card mb-3 border-primary">
      <div class="card-header bg-primary text-white">
        <h6 class="mb-0 text-white">🗄️ Gerenciar Configurações (Banco de Dados)</h6>
      </div>
      <div class="card-body p-3">
        <!-- Etapas de Salvamento -->
        <div v-if="tipoAtivo === 'armazem'" class="mb-3">
          <!-- Status dos Modelos -->
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <small class="fw-bold text-dark">Status dos Modelos:</small>
              <span class="badge" :class="podeSerSalvo ? 'bg-success' : 'bg-warning text-dark'">
                {{ Object.keys(modelosArcos).length }}/{{ quantidadeModelosArcos }} configurados
              </span>
            </div>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar" 
                   :class="podeSerSalvo ? 'bg-success' : 'bg-warning'" 
                   :style="{
                     width: quantidadeModelosArcos > 0
                       ? ((Object.keys(modelosArcos).length / quantidadeModelosArcos * 100) + '%')
                       : '0%'
                   }">
              </div>
            </div>
          </div>
        </div>

        <!-- Debug Info -->
        <div v-if="debugMode" class="alert alert-info p-2 mb-3">
          <small class="text-dark">
            <strong>Debug Info:</strong><br>
            Quantidade esperada: {{ quantidadeModelosArcos }}<br>
            Modelos configurados: {{ modelosValidosCount }}<br>
            Config Armazém existe: {{ !!configArmazem }}<br>
            Pode salvar: {{ podeSerSalvo }}
          </small>
        </div>

        <!-- Formulário de Salvamento -->
        <div class="mb-3">
          <label class="form-label small fw-bold text-dark">Nome da Configuração:</label>
          <input type="text" 
                 class="form-control form-control-sm" 
                 v-model="nomeModelo"
                 placeholder="Ex: Armazém Portal Principal" 
                 :disabled="isSalvando" 
                 maxlength="50" />
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold text-dark">Descrição (opcional):</label>
          <textarea class="form-control form-control-sm" 
                    v-model="descricaoModelo"
                    placeholder="Descrição da configuração..." 
                    rows="2" 
                    :disabled="isSalvando" 
                    maxlength="200"></textarea>
        </div>

        <div class="d-grid gap-2 mb-3">
          <button class="btn btn-success btn-sm" 
                  @click="salvarConfiguracaoCompleta"
                  :disabled="!nomeModelo.trim() || isSalvando || !podeSerSalvo">
            <span v-if="!isSalvando">💾 Salvar Configuração no Banco</span>
            <div v-else class="d-flex align-items-center justify-content-center">
              <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden"></span>
              </div>
              <span>Salvando no banco...</span>
            </div>
          </button>
        </div>

        <!-- Toggle Debug -->
        <div class="mb-3 d-flex gap-2 justify-content-center">
          <button class="btn btn-outline-primary btn-sm" @click="debugMode = !debugMode">
            {{ debugMode ? 'Ocultar' : 'Mostrar' }} Debug
          </button>
          <button v-if="isSalvando" class="btn btn-outline-secondary btn-sm" @click="resetarEstadoSalvamento">
            🔄 Reset
          </button>
        </div>

        <!-- Lista de Configurações Salvas -->
        <div v-if="configuracoesGerais.length === 0" class="alert alert-light border-primary p-3 text-center mt-3">
          <small class="text-muted">
            ℹ️
            Nenhuma configuração salva encontrada
          </small>
        </div>

        <div v-else class="mt-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0 fw-bold text-primary">
              🗄️
              Configurações Salvas ({{ configuracoesGerais.length }})
            </h6>
            <button class="btn btn-outline-primary btn-sm" 
                    @click="carregarConfiguracoesGerais" 
                    :disabled="isCarregando">
              🔄
              Atualizar
            </button>
          </div>

          <div v-if="isCarregando" class="text-center py-3">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden"></span>
            </div>
            <small class="d-block text-muted mt-2">Carregando configurações...</small>
          </div>

          <!-- Lista Ultra Compacta -->
          <div v-if="configuracoesGerais.length > 0" class="lista-compacta">
            <div v-for="config in configuracoesGerais" :key="config.id_svg" class="item-compacto">
              <div class="item-info">
                <div class="item-nome">
                  <span class="tipo-icon me-1">{{ config.tp_svg === 'S' ? '🏭' : '🏢' }}</span>
                  <span class="nome-config">{{ config.nm_modelo }}</span>
                </div>
                <div class="item-meta">
                  <span class="badge-mini" :class="config.tp_svg === 'S' ? 'badge-silo' : 'badge-armazem'">
                    {{ config.tp_svg === 'S' ? 'S' : (config.vista_svg === 'F' ? 'F' : 'T') }}
                  </span>
                  <span class="data-mini">{{ formatarDataCompacta(config.created_at) }}</span>
                </div>
              </div>
              <div class="item-acoes">
                <button class="btn-micro btn-carregar" 
                        @click="carregarConfiguracao(config)"
                        title="Carregar configuração">
                  📥
                </button>
                <button class="btn-micro btn-excluir" 
                        @click="confirmarExclusao(config)"
                        title="Excluir configuração">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Status de Validação -->
        <div v-if="!podeSerSalvo" class="alert alert-warning border-warning p-3 mt-3">
          <div class="d-flex align-items-start">
            ⚠️
            <small class="text-dark">
              <span v-if="tipoAtivo === 'armazem'">
                Configure todos os {{ quantidadeModelosArcos }} modelos de arcos antes de salvar no banco.
                <br><strong>Modelos configurados: {{ modelosValidosCount }}/{{ quantidadeModelosArcos }}</strong>
              </span>
              <span v-else>
                Configure o silo antes de salvar.
              </span>
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div v-show="showModalExclusao" class="modal-overlay" @click="fecharModal">
      <div class="modal-dialog modal-dialog-centered modal-sm" @click.stop>
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white border-0">
            <h6 class="modal-title mb-0">
              🗑️ Confirmar Exclusão
            </h6>
            <button type="button" class="btn-close btn-close-white" @click="fecharModal"></button>
          </div>
          <div class="modal-body p-4">
            <p class="mb-2 text-dark">Excluir configuração:</p>
            <strong class="text-primary">{{ modeloParaExcluir?.nm_modelo }}</strong>
            <p class="text-muted small mt-2 mb-0">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" 
                    class="btn btn-outline-secondary btn-sm" 
                    @click="fecharModal" 
                    :disabled="isExcluindo">
              Cancelar
            </button>
            <button type="button" 
                    class="btn btn-danger btn-sm" 
                    @click="excluirConfiguracao" 
                    :disabled="isExcluindo">
              <span v-if="isExcluindo" class="spinner-border spinner-border-sm me-1" role="status"></span>
              {{ isExcluindo ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { modeloSvgService } from '../services/modeloSvgService.js'

export default {
  name: 'GerenciadorModelosBanco',
  props: {
    tipoAtivo: String,
    quantidadeModelosArcos: Number,
    modelosArcos: Object,
    configSilo: Object,
    configArmazem: Object
  },
  emits: [
    'configuracao-carregada',
    'mostrar-toast',
    'modelo-deletado',
    'resetar-apos-salvamento-banco'
  ],
  data() {
    return {
      nomeModelo: '',
      descricaoModelo: '',
      configuracoesGerais: [],
      isSalvando: false,
      isCarregando: false,
      isExcluindo: false,
      modeloParaExcluir: null,
      debugMode: false,
      showModalExclusao: false
    }
  },
  computed: {
    tipoParaSalvar() {
      return this.tipoAtivo === 'silo' ? 'S' : 'A'
    },
    modelosValidosCount() {
      if (this.tipoAtivo === 'silo') return 0

      let count = 0
      for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
        const modelo = this.modelosArcos?.[i]
        if (modelo && modelo.nome &&
          ((modelo.config && Object.keys(modelo.config).length > 0) ||
            (modelo.configuracao && Object.keys(modelo.configuracao).length > 0))) {
          count++
        }
      }
      return count
    },
    podeSerSalvo() {
      if (this.tipoAtivo === 'silo') {
        return this.configSilo && Object.keys(this.configSilo).length > 0
      }

      const modelosConfigurados = this.modelosValidosCount
      const temConfigGlobal = this.configArmazem && Object.keys(this.configArmazem).length > 0

      return modelosConfigurados === this.quantidadeModelosArcos &&
        modelosConfigurados > 0 &&
        temConfigGlobal
    }
  },
  mounted() {
    this.carregarConfiguracoesGerais()
  },
  methods: {
    resetarTudoAposSalvamento() {
      try {
        this.$emit('resetar-apos-salvamento-banco')
        this.$emit('mostrar-toast',
          '✅ Sistema resetado para valores padrão!\n\n' +
          '🆕 Pronto para modelar uma nova configuração do zero',
          'info'
        )
      } catch (error) {
        this.$emit('mostrar-toast', 'Erro ao resetar sistema. Recarregue a página.', 'error')
      }
    },

    async carregarConfiguracoesGerais() {
      this.isCarregando = true
      try {
        const response = await modeloSvgService.buscarModelos(this.tipoParaSalvar)

        if (response.success && response.status === 200) {
          this.configuracoesGerais = (response.data || []).map(config => {
            try {
              const dadosParsed = JSON.parse(config.dado_svg || '{}')
              return {
                ...config,
                dados_parsed: dadosParsed
              }
            } catch (error) {
              return {
                ...config,
                dados_parsed: {}
              }
            }
          })
        } else {
          this.mostrarToast('Erro ao carregar configurações salvas', 'error')
        }
      } catch (error) {
        this.mostrarToast('Erro ao conectar com o servidor', 'error')
      } finally {
        this.isCarregando = false
      }
    },

    async salvarConfiguracaoCompleta() {
      if (!this.nomeModelo.trim()) {
        this.$emit('mostrar-toast', 'Digite um nome para a configuração!', 'warning')
        return
      }

      if (!this.podeSerSalvo) {
        if (this.tipoAtivo === 'armazem') {
          this.$emit('mostrar-toast', `Configure todos os ${this.quantidadeModelosArcos} modelos de arco antes de salvar!\n\nStatus: ${this.modelosValidosCount}/${this.quantidadeModelosArcos} configurados`, 'warning')
        } else {
          this.$emit('mostrar-toast', 'Configure o silo antes de salvar!', 'warning')
        }
        return
      }

      this.isSalvando = true

      try {
        if (this.tipoAtivo === 'armazem') {
          const { configuracaoService } = await import('../services/configuracaoService')
          const dadosConsolidados = configuracaoService.consolidarModelosParaBanco(
            this.quantidadeModelosArcos,
            this.nomeModelo
          )

          if (!dadosConsolidados.success) {
            this.$emit('mostrar-toast', dadosConsolidados.message || 'Erro ao consolidar configurações', 'error')
            return
          }

          const response = await modeloSvgService.salvarModelo(dadosConsolidados.dados)

          if (response.success) {
            await this.carregarConfiguracoesGerais()

            const idSalvo = response.data?.id_svg || response.data?.id || 'N/A'
            this.$emit('mostrar-toast',
              `🎉 Configuração "${this.nomeModelo}" salva no banco!\n\n` +
              `🆔 ID: ${idSalvo}\n` +
              `📊 ${this.quantidadeModelosArcos} modelo(s) de arco consolidado(s)\n` +
              `✅ Salvamento realizado com sucesso!\n\n` +
              `🔄 Sistema será resetado para valores padrão...`,
              'success'
            )

            this.nomeModelo = ''
            this.descricaoModelo = ''

            setTimeout(() => {
              this.resetarTudoAposSalvamento()
            }, 1500)

          } else {
            let mensagemErro = response.message || 'Erro desconhecido'
            if (response.error?.erros) {
              mensagemErro = response.error.erros.join('\n')
            }
            this.$emit('mostrar-toast', `❌ Erro ao salvar no banco:\n\n${mensagemErro}`, 'error')
          }

        } else {
          const dadosCompletos = this.prepararDadosParaSalvar()

          if (!dadosCompletos || Object.keys(dadosCompletos).length === 0) {
            this.$emit('mostrar-toast', 'Erro: Dados de configuração do silo estão vazios!', 'error')
            return
          }

          const dadosParaBanco = {
            nm_modelo: this.nomeModelo,
            tp_svg: 'S',
            vista_svg: 'F',
            ds_modelo: this.descricaoModelo || `Configuração de Silo - ${new Date().toLocaleDateString('pt-BR')}`,
            dado_svg: dadosCompletos
          }

          const response = await modeloSvgService.salvarModelo(dadosParaBanco)

          if (response.success) {
            await this.carregarConfiguracoesGerais()

            const idSalvo = response.data?.id_svg || response.data?.id || 'N/A'
            this.$emit('mostrar-toast',
              `🎉 Configuração do Silo "${this.nomeModelo}" salva!\n\n` +
              `🆔 ID: ${idSalvo}\n\n` +
              `🔄 Sistema será resetado para valores padrão...`,
              'success'
            )

            this.nomeModelo = ''
            this.descricaoModelo = ''

            setTimeout(() => {
              this.resetarTudoAposSalvamento()
            }, 1500)

          } else {
            this.$emit('mostrar-toast', `❌ Erro ao salvar silo:\n\n${response.message || 'Erro desconhecido'}`, 'error')
          }
        }

      } catch (error) {
        this.$emit('mostrar-toast', `❌ Erro inesperado:\n\n${error.message || error}`, 'error')
      } finally {
        this.isSalvando = false
      }
    },

    prepararDadosParaSalvar() {
      if (this.tipoAtivo === 'silo') {
        // 🔧 CORREÇÃO: Capturar dados dos pêndulos primeiro para garantir dados atualizados
        const dadosPendulos = this.capturarPendulosSilo()
        
        const dadosCompletos = {
          ...this.configSilo,
          // 🔧 CRÍTICO: Sobrescrever com dados atualizados dos pêndulos para evitar conflitos
          quantidadePendulos: dadosPendulos.quantidadePendulos,
          sensoresPorPendulo: dadosPendulos.sensoresPorPendulo,
          dimensoes: this.capturarDimensoesSilo(),
          controles: this.capturarControlesSilo(),
          sensores: this.capturarSensoresSilo(),
          cabos: this.capturarCabosSilo(),
          pendulos: dadosPendulos,
          estrutura: this.capturarEstruturaSilo(),
          posicionamento: this.capturarPosicionamentoSilo(),
          parametrosDesenho: this.capturarParametrosDesenhoSilo(),
          estadoModelagem: this.capturarEstadoModelagemSilo(),
          componentesSVG: this.capturarComponentesSVGSilo(),
          tipoEstrutura: 'silo',
          versaoConfiguracao: '5.0',
          timestampSalvamento: new Date().toISOString()
        }

        return dadosCompletos
      } else {
        const modelosCompletos = this.prepararModelosCompletos()

        const dadosCompletos = {
          quantidadeModelos: this.quantidadeModelosArcos,
          modelosArcos: modelosCompletos,
          configuracaoGlobal: { ...this.configArmazem },
          dimensoes: this.capturarDimensoesArmazem(),
          sensores: this.capturarSensoresArmazem(),
          cabos: this.capturarCabosArmazem(),
          telhado: this.capturarTelhadoArmazem(),
          fundo: this.capturarFundoArmazem(),
          pendulos: this.capturarPendulosArmazem(),
          estrutura: this.capturarEstruturaArmazem(),
          posicionamento: this.capturarPosicionamentoArmazem(),
          parametrosDesenho: this.capturarParametrosDesenho(),
          estadoModelagem: this.capturarEstadoModelagem(),
          dadosArcos: this.capturarDadosArcos(),
          posicoesCabos: this.capturarTodasPosicoesCabos(),
          configuracaoSensores: this.capturarConfiguracaoSensores(),
          layouts: this.capturarLayoutsArmazem(),
          mapeamentos: this.capturarMapeamentosArmazem(),
          componentesSVG: this.capturarComponentesSVGArmazem(),
          tipoEstrutura: 'armazem',
          versaoConfiguracao: '5.0',
          timestampSalvamento: new Date().toISOString()
        }

        return dadosCompletos
      }
    },

    prepararModelosCompletos() {
      const modelos = {}

      for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
        const modelo = this.modelosArcos[i]
        if (modelo && modelo.nome) {
          const configuracao = modelo.configuracao || modelo.config || {}

          const posicoesCabosOriginais = modelo.posicoesCabos || {}
          const dadosLocalStorage = this.carregarDadosCompletosDoLocalStorage(i)
          const posicoesCabosCompletas = { ...posicoesCabosOriginais, ...dadosLocalStorage.posicoesCabos }
          const sensoresCompletos = { ...modelo.sensoresPorPendulo, ...dadosLocalStorage.sensoresPorPendulo }
          const alturasCompletas = { ...dadosLocalStorage.alturasSensores }

          modelos[i] = {
            numero: i,
            nome: modelo.nome,
            posicao: modelo.posicao || this.determinarPosicaoModelo(i, this.quantidadeModelosArcos),
            configuracao: {
              ...configuracao,
              posicoesCabos: posicoesCabosCompletas,
              posicoesCabosPersonalizadas: posicoesCabosCompletas,
              sensoresPorPendulo: sensoresCompletos,
              alturasSensores: alturasCompletas,
              quantidadePendulos: dadosLocalStorage.quantidadePendulos
            },
            quantidadePendulos: dadosLocalStorage.quantidadePendulos,
            sensoresPorPendulo: { ...sensoresCompletos },
            alturasSensores: { ...alturasCompletas },
            posicoesCabos: { ...posicoesCabosCompletas },
            dimensoes: { ...(modelo.dimensoes || {}) },
            parametros: { ...(modelo.parametros || {}) },
            estados: { ...(modelo.estados || {}) },
            variaveis: { ...(modelo.variaveis || {}) },
            propriedades: { ...(modelo.propriedades || {}) },
            estrutura: modelo.estrutura || {},
            desenho: modelo.desenho || {},
            layout: modelo.layout || {},
            coordenadas: modelo.coordenadas || {},
            timestampCriacao: modelo.timestampCriacao || new Date().toISOString(),
            validado: Object.keys(configuracao).length > 0,
            versao: '2.0'
          }
        }
      }

      return modelos
    },

    async carregarConfiguracao(configuracao) {
      try {
        let dadosSvg
        if (configuracao.dados_parsed) {
          dadosSvg = configuracao.dados_parsed
        } else {
          dadosSvg = JSON.parse(configuracao.dado_svg)
        }

        this.$emit('configuracao-carregada', {
          nome: configuracao.nm_modelo,
          dados: dadosSvg,
          tipo: configuracao.tp_svg,
          origem: 'banco_dados',
          configuracaoId: configuracao.id_svg,
          tipoConfiguracao: dadosSvg.tipo || 'configuracao_completa',
          versao: dadosSvg.versao || '1.0',
          sistemaModelos: dadosSvg.sistemaModelos || dadosSvg.modelosDefinidos,
          configuracaoGlobal: dadosSvg.configuracaoGlobal,
          layoutsAutomaticos: dadosSvg.layoutsAutomaticos,
          dimensoesSVG: dadosSvg.dimensoesSVG,
          dadosOriginais: dadosSvg.dadosOriginais
        })

        this.mostrarToast(`Configuração "${configuracao.nm_modelo}" carregada com sucesso!`, 'success')
      } catch (error) {
        this.mostrarToast('Erro ao processar dados da configuração', 'error')
      }
    },

    confirmarExclusao(configuracao) {
      this.modeloParaExcluir = configuracao
      this.showModalExclusao = true
      document.body.classList.add('modal-open')
    },

    async excluirConfiguracao() {
      if (!this.modeloParaExcluir) return

      this.isExcluindo = true

      try {
        const response = await modeloSvgService.excluirModelo(this.modeloParaExcluir.id_svg)

        if (response && response.success) {
          this.configuracoesGerais = this.configuracoesGerais.filter(m => m.id_svg !== this.modeloParaExcluir.id_svg)
          this.$emit('modelo-deletado', this.modeloParaExcluir.id_svg)
          this.mostrarToast(`Configuração "${this.modeloParaExcluir.nm_modelo}" excluída com sucesso!`, 'success')

          setTimeout(() => {
            this.carregarConfiguracoesGerais()
          }, 500)
        } else {
          let mensagemErro = response?.message || 'Erro ao excluir configuração'

          if (response?.status === 401) {
            mensagemErro = 'Token de autenticação expirado. Faça login novamente.'
          } else if (response?.status === 403) {
            mensagemErro = 'Você não tem permissão para deletar esta configuração.'
          } else if (response?.status === 404) {
            mensagemErro = 'Configuração não encontrada. Pode já ter sido deletada.'
          }

          this.mostrarToast(mensagemErro, 'error')
        }
      } catch (error) {
        this.mostrarToast('Erro interno ao excluir configuração. Verifique sua conexão.', 'error')
      } finally {
        this.isExcluindo = false
        this.modeloParaExcluir = null
        this.fecharModal()
      }
    },

    fecharModal() {
      this.showModalExclusao = false
      this.modeloParaExcluir = null
      document.body.classList.remove('modal-open')
    },

    formatarData(dataString) {
      if (!dataString) return 'N/A'
      try {
        const data = new Date(dataString)
        return data.toLocaleDateString('pt-BR')
      } catch {
        return 'Data inválida'
      }
    },

    formatarDataCompacta(dataString) {
      if (!dataString) return 'N/A'
      try {
        const data = new Date(dataString)
        return data.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      } catch {
        return 'N/A'
      }
    },

    mostrarToast(mensagem, tipo = 'info') {
      this.$emit('mostrar-toast', { mensagem, tipo })
    },

    determinarPosicaoModelo(numeroModelo, quantidadeTotal) {
      switch (quantidadeTotal) {
        case 1: return 'todos'
        case 2: return numeroModelo === 1 ? 'impar' : 'par'
        case 3:
          if (numeroModelo === 1) return 'frente_fundo'
          else if (numeroModelo === 2) return 'par'
          else return 'impar'
        case 4:
          if (numeroModelo === 1) return 'frente'
          else if (numeroModelo === 2) return 'par'
          else if (numeroModelo === 3) return 'impar'
          else return 'fundo'
        default: return 'todos'
      }
    },

    carregarDadosCompletosDoLocalStorage(numeroModelo) {
      try {
        const chaveModelo = `modelo_${numeroModelo}`
        const dadosModelo = localStorage.getItem(chaveModelo)

        if (dadosModelo) {
          const modeloParsed = JSON.parse(dadosModelo)

          if (modeloParsed.configuracao) {
            const dadosCompletos = {
              posicoesCabos: modeloParsed.configuracao.posicoesCabos || {},
              sensoresPorPendulo: modeloParsed.configuracao.sensoresPorPendulo || {},
              alturasSensores: modeloParsed.configuracao.alturasSensores || {},
              quantidadePendulos: modeloParsed.configuracao.quantidadePendulos || 3
            }

            return dadosCompletos
          }
        }

        return {
          posicoesCabos: {},
          sensoresPorPendulo: {},
          alturasSensores: {},
          quantidadePendulos: 3
        }
      } catch (error) {
        return {
          posicoesCabos: {},
          sensoresPorPendulo: {},
          alturasSensores: {},
          quantidadePendulos: 3
        }
      }
    },

    resetarEstadoSalvamento() {
      this.isSalvando = false
      this.$emit('mostrar-toast', 'Estado de salvamento resetado. Tente novamente.', 'info')
    },

    // Métodos de captura de componentes simplificados
    capturarComponentesSVGSilo() {
      try {
        const componentesSilo = {}
        if (this.$parent && this.$parent.$refs) {
          const refs = this.$parent.$refs
          if (refs.controlesSilo) {
            componentesSilo.controles = refs.controlesSilo.obterDados ? refs.controlesSilo.obterDados() : {}
          }
          if (refs.dimensoesBasicas) {
            componentesSilo.dimensoes = refs.dimensoesBasicas.obterDados ? refs.dimensoesBasicas.obterDados() : {}
          }
          if (refs.configuracaoSensores) {
            componentesSilo.sensores = refs.configuracaoSensores.obterDados ? refs.configuracaoSensores.obterDados() : {}
          }
          if (refs.posicionamentoCabos) {
            componentesSilo.cabos = refs.posicionamentoCabos.obterDados ? refs.posicionamentoCabos.obterDados() : {}
          }
        }
        return componentesSilo
      } catch (error) {
        return {}
      }
    },

    capturarDimensoesSilo() {
      try {
        return {
          largura: this.configSilo?.largura || 350,
          altura: this.configSilo?.altura || 200,
          raio: this.configSilo?.raio || 100,
          alturaTotal: this.configSilo?.alturaTotal || 300
        }
      } catch (error) {
        return {}
      }
    },

    capturarPosicionamentoSilo() {
      try {
        return {
          // Este método pode ser usado para posicionamentos específicos do silo
          // Por enquanto retorna objeto vazio, mas mantém estrutura para expansão futura
        }
      } catch (error) {
        return {}
      }
    },

    capturarSensoresSilo() {
      try {
        return {
          escala_sensores: this.configSilo?.escala_sensores || 16,
          dist_y_sensores: this.configSilo?.dist_y_sensores || 12
        }
      } catch (error) {
        return {
          escala_sensores: 16,
          dist_y_sensores: 12
        }
      }
    },

    capturarEstruturaSilo() {
      try {
        return {
          // Aeradores
          na: this.configSilo?.na || 4,
          ds: this.configSilo?.ds || 30,
          dy: this.configSilo?.dy || 0,
          da: this.configSilo?.da || 35,
          aerador_rotacao: this.configSilo?.aerador_rotacao || 0,
          aerador_escala: this.configSilo?.aerador_escala || 1
        }
      } catch (error) {
        return {
          na: 4,
          ds: 30,
          dy: 0,
          da: 35,
          aerador_rotacao: 0,
          aerador_escala: 1
        }
      }
    },

    capturarComponentesSVGArmazem() {
      try {
        const componentesArmazem = {}
        if (this.$parent && this.$parent.$refs) {
          const refs = this.$parent.$refs
          if (refs.modelosArcos) {
            componentesArmazem.modelosArcos = refs.modelosArcos.obterDados ? refs.modelosArcos.obterDados() : {}
          }
          if (refs.dimensoesBasicas) {
            componentesArmazem.dimensoes = refs.dimensoesBasicas.obterDados ? refs.dimensoesBasicas.obterDados() : {}
          }
          if (refs.configuracaoSensores) {
            componentesArmazem.sensores = refs.configuracaoSensores.obterDados ? refs.configuracaoSensores.obterDados() : {}
          }
          if (refs.posicionamentoCabos) {
            componentesArmazem.cabos = refs.posicionamentoCabos.obterDados ? refs.posicionamentoCabos.obterDados() : {}
          }
          if (refs.configuracaoTelhado) {
            componentesArmazem.telhado = refs.configuracaoTelhado.obterDados ? refs.configuracaoTelhado.obterDados() : {}
          }
          if (refs.configuracaoFundo) {
            componentesArmazem.fundo = refs.configuracaoFundo.obterDados ? refs.configuracaoFundo.obterDados() : {}
          }
          if (refs.controleSensoresPendulo) {
            componentesArmazem.sensoresPendulo = refs.controleSensoresPendulo.obterDados ? refs.controleSensoresPendulo.obterDados() : {}
          }
          if (refs.inicializadorModelos) {
            componentesArmazem.inicializador = refs.inicializadorModelos.obterDados ? refs.inicializadorModelos.obterDados() : {}
          }
        }
        return componentesArmazem
      } catch (error) {
        return {}
      }
    },

    capturarDimensoesArmazem() {
      try {
        return {
          largura: this.configArmazem?.largura || 350,
          altura: this.configArmazem?.altura || 200,
          totalArcos: this.configArmazem?.totalArcos || this.quantidadeModelosArcos,
          larguraArco: this.configArmazem?.larguraArco || 50
        }
      } catch (error) {
        return {}
      }
    },

    // Métodos corrigidos para capturar dados reais do configSilo
    capturarControlesSilo() {
      return {
        aeradores_ativo: this.configSilo?.aeradores_ativo || false,
        animacao_aeradores: this.configSilo?.animacao_aeradores || false,
        velocidade_animacao: this.configSilo?.velocidade_animacao || 2,
        efeito_hover: this.configSilo?.efeito_hover || false,
        modo_responsivo: this.configSilo?.modo_responsivo || false,
        otimizar_performance: this.configSilo?.otimizar_performance || false
      }
    },
    capturarCabosSilo() {
      return {
        pos_x_cabos_uniforme: this.configSilo?.pos_x_cabos_uniforme || 1,
        pos_x_cabo: this.configSilo?.pos_x_cabo || [],
        pos_y_cabo: this.configSilo?.pos_y_cabo || [],
        distancia_cabos: this.configSilo?.distancia_cabos || 30,
        offset_cabos: this.configSilo?.offset_cabos || 9,
        altura_cabos: this.configSilo?.altura_cabos || 152
      }
    },
    capturarPendulosSilo() {
      return {
        quantidadePendulos: this.configSilo?.quantidadePendulos || 5,
        sensoresPorPendulo: this.configSilo?.sensoresPorPendulo || {}
      }
    },
    capturarParametrosDesenhoSilo() {
      return {
        largura_svg: this.configSilo?.largura_svg || 525,
        altura_svg: this.configSilo?.altura_svg || 188,
        margem_interna: this.configSilo?.margem_interna || 10,
        transparencia_fundo: this.configSilo?.transparencia_fundo || 1,
        espessura_borda: this.configSilo?.espessura_borda || 1.6,
        mostrar_sombra: this.configSilo?.mostrar_sombra || false,
        mostrar_grade: this.configSilo?.mostrar_grade || false,
        precisao_grid: this.configSilo?.precisao_grid || 1
      }
    },
    capturarEstadoModelagemSilo() { return { configurado: this.podeSerSalvo, timestamp: new Date().toISOString() } },
    capturarPosicionamentoArmazem() { return this.configArmazem?.posicionamento || {} },
    capturarSensoresArmazem() { return this.configArmazem?.sensores || {} },
    capturarEstruturaArmazem() { return this.configArmazem?.estrutura || {} },
    capturarCabosArmazem() { return this.configArmazem?.cabos || {} },
    capturarTelhadoArmazem() { return this.configArmazem?.telhado || {} },
    capturarFundoArmazem() { return this.configArmazem?.fundo || {} },
    capturarPendulosArmazem() { return {} },
    capturarLayoutsArmazem() { return this.configArmazem?.layouts || {} },
    capturarMapeamentosArmazem() { return this.configArmazem?.mapeamentos || {} },
    capturarDadosArcos() { return {} },
    capturarConfiguracaoSensores() { return this.configArmazem?.sensores || {} },
    capturarParametrosDesenho() { return this.configArmazem?.parametrosDesenho || {} },
    capturarEstadoModelagem() { return { configurado: this.podeSerSalvo, timestamp: new Date().toISOString() } },

    capturarTodasPosicoesCabos() {
      try {
        const posicoesCabos = {}

        for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
          const modelo = this.modelosArcos?.[i]

          if (!modelo) continue

          const posicoesLocalStorage = this.carregarPosicoesCabosDoLocalStorage(i)
          let posicoesDoCaboFinal = {}

          if (Object.keys(posicoesLocalStorage).length > 0) {
            posicoesDoCaboFinal = { ...posicoesLocalStorage }
          } else {
            const fontesPosicoes = [
              modelo.posicoesCabos,
              modelo.configuracao?.posicoesCabos,
              modelo.configuracao?.posicoesCabosIndividuais,
              modelo.configuracao?.posicoesCabosPersonalizadas
            ]

            fontesPosicoes.forEach((fonte) => {
              if (fonte && Object.keys(fonte).length > 0) {
                Object.assign(posicoesDoCaboFinal, fonte)
              }
            })
          }

          if (Object.keys(posicoesDoCaboFinal).length > 0) {
            const cabosPreservados = {}

            Object.keys(posicoesDoCaboFinal).forEach(cabo => {
              const posicao = posicoesDoCaboFinal[cabo]

              if (posicao && typeof posicao === 'object') {
                cabosPreservados[cabo] = {
                  x: posicao.x !== undefined ? posicao.x : 0,
                  y: posicao.y !== undefined ? posicao.y : 0,
                  dx: posicao.dx !== undefined ? posicao.dx : 0,
                  dy: posicao.dy !== undefined ? posicao.dy : 0,
                  offsetX: posicao.offsetX !== undefined ? posicao.offsetX : 0,
                  offsetY: posicao.offsetY !== undefined ? posicao.offsetY : 0,
                  altura: posicao.altura !== undefined ? posicao.altura : 0,
                  distanciaHorizontal: posicao.distanciaHorizontal !== undefined ? posicao.distanciaHorizontal : 0,
                  numeroSensores: posicao.numeroSensores !== undefined ? posicao.numeroSensores : 3,
                  timestampAlteracao: posicao.timestampAlteracao || Date.now()
                }
              }
            })

            if (Object.keys(cabosPreservados).length > 0) {
              posicoesCabos[i] = cabosPreservados
            }
          }
        }

        return posicoesCabos
      } catch (error) {
        return {}
      }
    },

    carregarPosicoesCabosDoLocalStorage(numeroModelo) {
      const dadosCompletos = this.carregarDadosCompletosDoLocalStorage(numeroModelo)
      return dadosCompletos.posicoesCabos
    }
  }
}
</script>

<style scoped>
/* Cores Padrão do Sistema */
.border-primary {
  border-color: #06335E !important;
}

.bg-primary {
  background-color: #06335E !important;
}

.text-primary {
  color: #06335E !important;
}

.btn-primary {
  background-color: #06335E;
  border-color: #06335E;
}

.btn-primary:hover {
  background-color: #04294a;
  border-color: #031f36;
}

.btn-outline-primary {
  color: #06335E;
  border-color: #06335E;
}

.btn-outline-primary:hover {
  background-color: #06335E;
  border-color: #06335E;
  color: white;
}

.progress-bar {
  background-color: #06335E;
}

.progress-bar.bg-success {
  background-color: #28a745 !important;
}

.progress-bar.bg-warning {
  background-color: #ffc107 !important;
}

.bg-secondary {
  background-color: #6c6c6c !important;
}

.badge-secondary {
  background-color: #e9ecef;
  color: #495057;
}

.badge-primary {
  background-color: #cfe2ff;
  color: #06335E;
}

/* Lista Ultra Compacta */
.lista-compacta {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
  background: white;
  max-height: 300px;
  overflow-y: auto;
}

.item-compacto {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.5rem;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s ease;
  min-height: 32px;
}

.item-compacto:last-child {
  border-bottom: none;
}

.item-compacto:hover {
  background-color: rgba(6, 51, 94, 0.05);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.item-nome {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 500;
  color: #212529;
}

.tipo-icon {
  font-size: 0.7rem;
  flex-shrink: 0;
}

.nome-config {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.badge-mini {
  font-size: 0.6rem;
  padding: 0.1rem 0.25rem;
  border-radius: 3px;
  font-weight: 500;
  line-height: 1;
}

.badge-silo {
  background-color: #e9ecef;
  color: #495057;
}

.badge-armazem {
  background-color: #cfe2ff;
  color: #06335E;
}

.data-mini {
  font-size: 0.6rem;
  color: #6c757d;
}

.item-acoes {
  display: flex;
  gap: 0.2rem;
  flex-shrink: 0;
}

.btn-micro {
  background: none;
  border: none;
  padding: 0.2rem;
  cursor: pointer;
  border-radius: 3px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.65rem;
}

.btn-carregar {
  color: #06335E;
}

.btn-carregar:hover {
  background-color: rgba(6, 51, 94, 0.1);
  color: #04294a;
}

.btn-excluir {
  color: #dc3545;
}

.btn-excluir:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: #a71e2a;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1055;
}

.modal-dialog {
  max-width: 400px;
  width: 90%;
  margin: 0 auto;
}

.modal-content {
  border-radius: 8px;
  overflow: hidden;
}

.modal-header {
  border-bottom: none;
  padding: 1rem;
}

.modal-title {
  font-size: 1rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  opacity: 0.8;
  font-size: 1.2rem;
  cursor: pointer;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 0 1rem;
}

.modal-footer {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Responsividade para Lista Compacta */
@media (max-width: 768px) {
  .lista-compacta {
    max-height: 250px;
  }

  .item-compacto {
    padding: 0.25rem 0.4rem;
    min-height: 28px;
  }

  .item-nome {
    font-size: 0.7rem;
  }

  .tipo-icon {
    font-size: 0.65rem;
  }

  .badge-mini {
    font-size: 0.55rem;
    padding: 0.05rem 0.2rem;
  }

  .data-mini {
    font-size: 0.55rem;
  }

  .btn-micro {
    width: 18px;
    height: 18px;
    font-size: 0.6rem;
  }

  .modal-dialog {
    width: 95%;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }
}

@media (max-width: 576px) {
  .card-body {
    padding: 0.75rem !important;
  }

  .lista-compacta {
    max-height: 200px;
  }

  .item-compacto {
    padding: 0.2rem 0.3rem;
    min-height: 26px;
  }

  .item-info {
    gap: 0.05rem;
  }

  .item-nome {
    font-size: 0.65rem;
  }

  .tipo-icon {
    font-size: 0.6rem;
  }

  .badge-mini {
    font-size: 0.5rem;
    padding: 0.05rem 0.15rem;
  }

  .data-mini {
    font-size: 0.5rem;
  }

  .btn-micro {
    width: 16px;
    height: 16px;
    font-size: 0.55rem;
  }

  .item-acoes {
    gap: 0.1rem;
  }

  .btn-sm {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  .form-control-sm {
    font-size: 0.8rem;
  }

  .small {
    font-size: 0.8rem !important;
  }
}

@media (max-width: 360px) {
  .lista-compacta {
    max-height: 180px;
  }

  .item-compacto {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    padding: 0.2rem;
    min-height: auto;
  }

  .item-acoes {
    align-self: flex-end;
    margin-top: -18px;
  }
}

.alert-light {
  background-color: rgba(248, 249, 250, 0.8);
  border-color: rgba(6, 51, 94, 0.2);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.text-dark {
  color: #212529 !important;
}

.text-muted {
  color: #6c757d !important;
}

.fw-bold {
  font-weight: 700 !important;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

.bg-warning {
  background-color: #ffc107 !important;
}

.bg-success {
  background-color: #28a745 !important;
}

.border-warning {
  border-color: #ffc107 !important;
}

.text-warning {
  color: #ffc107 !important;
}
</style>
