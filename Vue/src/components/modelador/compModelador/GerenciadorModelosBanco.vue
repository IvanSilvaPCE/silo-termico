<template>
  <div>
    <div class="card mb-3">
      <div class="card-header bg-success text-white">
        <h6 class="mb-0">💾 Gerenciar Configurações (Banco de Dados)</h6>
      </div>
      <div class="card-body p-2">
        <!-- Etapas de Salvamento -->
        <div v-if="tipoAtivo === 'armazem'" class="mb-3">
          <!-- Status dos Modelos -->
          <div class="mb-2">
            <div class="d-flex justify-content-between align-items-center">
              <small class="fw-bold">Status dos Modelos:</small>
              <span class="badge text-white" :class="podeSerSalvo ? 'bg-success' : 'bg-warning'">
                {{ Object.keys(modelosArcos).length }}/{{ quantidadeModelosArcos }} configurados
              </span>
            </div>
            <div class="progress progress-sm mt-1 border border-dark">
              <div class="progress-bar" :class="podeSerSalvo ? 'bg-success' : 'bg-warning'" :style="{
                width: quantidadeModelosArcos > 0
                  ? ((Object.keys(modelosArcos).length / quantidadeModelosArcos * 100) + '%')
                  : '0%'
              }">
              </div>
            </div>
          </div>
        </div>

        <!-- Debug Info -->
        <div v-if="debugMode" class="alert alert-secondary p-2 small">
          <strong>Debug Info:</strong><br>
          Quantidade esperada: {{ quantidadeModelosArcos }}<br>
          Modelos configurados: {{ modelosValidosCount }}<br>
          Config Armazém existe: {{ !!configArmazem }}<br>
          Pode salvar: {{ podeSerSalvo }}
        </div>
      </div>

      <!-- Formulário de Salvamento -->
      <div class="p-2">
        <div class="mb-3">
          <label class="form-label small fw-bold">Nome da Configuração:</label>
          <input type="text" class="form-control form-control-sm" v-model="nomeModelo"
            placeholder="Ex: Armazém Portal Principal" :disabled="isSalvando" maxlength="50" />
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold">Descrição (opcional):</label>
          <textarea class="form-control form-control-sm" v-model="descricaoModelo"
            placeholder="Descrição da configuração..." rows="2" :disabled="isSalvando" maxlength="200"></textarea>
        </div>

        <div class="d-grid gap-2 mb-3">
          <button class="btn btn-success btn-sm" @click="salvarConfiguracaoCompleta"
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
        <div class="mb-2 d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" @click="debugMode = !debugMode">
            {{ debugMode ? 'Ocultar' : 'Mostrar' }} Debug
          </button>
          <button v-if="isSalvando" class="btn btn-outline-danger btn-sm" @click="resetarEstadoSalvamento">
            🔄 Reset
          </button>
        </div>

        <!-- Lista de Configurações Salvas -->
        <div v-if="configuracoesGerais.length === 0" class="alert alert-info p-2 text-center mt-3">
          <small>Nenhuma configuração salva encontrada</small>
        </div>

        <div v-else class="mt-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label small fw-bold mb-0" style="color: white;">Configurações Salvas:</label>
            <button class="btn btn-outline-primary btn-sm" @click="carregarConfiguracoesGerais"
              :disabled="isCarregando">
              🔄 Atualizar
            </button>
          </div>

          <div v-if="isCarregando" class="text-center py-2">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden"></span>
            </div>
            <small class="d-block text-muted">Carregando configurações...</small>
          </div>

          <!-- Lista de Modelos Salvos -->
          <div v-if="configuracoesGerais.length > 0" class="mt-3">
            <h6 class="small fw-bold text-success mb-3">
              📋 Modelos Salvos no Banco ({{ configuracoesGerais.length }})
            </h6>

            <div class="modelos-grid-compact">
              <div v-for="config in configuracoesGerais" :key="config.id_svg" 
                   class="modelo-item-compact">
                <div class="modelo-header" :class="config.tp_svg === 'S' ? 'bg-primary' : 'bg-success'">
                  <span class="modelo-nome">
                    {{ config.tp_svg === 'S' ? '🏢' : '🏭' }} {{ config.nm_modelo }}
                  </span>
                  <button type="button" 
                          class="btn-delete" 
                          @click="confirmarExclusao(config)"
                          title="Excluir">
                    ×
                  </button>
                </div>

                <div class="modelo-body">
                  <div class="modelo-details">
                    <small class="tipo">{{ config.tp_svg === 'S' ? 'Silo' : 'Armazém' }}</small>
                    <small class="data">{{ formatarData(config.created_at) }}</small>
                  </div>

                  <button class="btn-carregar" @click="carregarConfiguracao(config)">
                    📝 Carregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Status -->
        <div v-if="!podeSerSalvo" class="alert alert-warning p-2 mt-3">
          <small>
            ⚠️
            <span v-if="tipoAtivo === 'armazem'">
              Configure todos os {{ quantidadeModelosArcos }} modelos de arcos antes de salvar no banco.
              <br>Modelos configurados: {{ modelosValidosCount }}/{{ quantidadeModelosArcos }}
            </span>
            <span v-else>
              Configure o silo antes de salvar.
            </span>
          </small>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div v-show="showModalExclusao" class="modal-overlay" @click="fecharModal">
      <div class="modal-dialog modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button type="button" class="btn-close" @click="fecharModal" aria-label="Close">×</button>
          </div>
          <div class="modal-body">
            <p class="mb-2">Deseja excluir a configuração:</p>
            <strong>{{ modeloParaExcluir?.nm_modelo }}</strong>
            <p class="text-muted small mt-2">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" @click="fecharModal" :disabled="isExcluindo">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger btn-sm" @click="excluirConfiguracao" :disabled="isExcluindo">
              <span v-if="isExcluindo" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <span>{{ isExcluindo ? 'Excluindo...' : 'Excluir' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop do Modal -->
    <div class="modal-backdrop fade" v-show="showModalExclusao" :class="{ 'show': showModalExclusao }" @click="fecharModal"></div>
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
      carregandoModelos: false, // Adicionado para indicar carregamento na exclusão
      showModalExclusao: false // Controle do modal sem jQuery
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
        // Verificar se o modelo existe E tem configuração válida (seja 'config' ou 'configuracao')
        if (modelo && modelo.nome &&
            ((modelo.config && Object.keys(modelo.config).length > 0) ||
             (modelo.configuracao && Object.keys(modelo.configuracao).length > 0))) {
          count++
        }
      }
      return count
    },
    modelosSalvosCount() {
      return this.modelosValidosCount
    },
    podeSerSalvo() {
      if (this.tipoAtivo === 'silo') {
        return this.configSilo && Object.keys(this.configSilo).length > 0
      }

      // Para armazém, verificar se todos os modelos estão configurados
      const modelosConfigurados = this.modelosValidosCount
      const temConfigGlobal = this.configArmazem && Object.keys(this.configArmazem).length > 0

      console.log('🔍 [podeSerSalvo] Debug:', {
        modelosConfigurados,
        quantidadeEsperada: this.quantidadeModelosArcos,
        temConfigGlobal,
        modelos: this.modelosArcos
      })

      return modelosConfigurados === this.quantidadeModelosArcos &&
        modelosConfigurados > 0 &&
        temConfigGlobal
    },
    dadosParaSalvar() {
      if (this.tipoAtivo === 'silo') {
        return {
          tipo: 'configuracao_silo',
          configuracao: this.configSilo,
          timestamp: new Date().toISOString(),
          versao: '2.0'
        }
      } else {
        // Preparar dados dos modelos com validação
        const modelosValidados = {}
        for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
          const modelo = this.modelosArcos?.[i]
          if (modelo && modelo.nome && modelo.configuracao) {
            modelosValidados[i] = {
              numero: i,
              nome: modelo.nome,
              posicao: modelo.posicao || this.determinarPosicaoModelo(i, this.quantidadeModelosArcos),
              configuracao: modelo.configuracao,
              quantidadePendulos: modelo.quantidadePendulos || 0,
              sensoresPorPendulo: modelo.sensoresPorPendulo || {},
              posicoesCabos: modelo.posicoesCabos || {},
              timestampCriacao: modelo.timestampCriacao || new Date().toISOString(),
              validado: true
            }
          }
        }

        return {
          tipo: 'configuracao_armazem_completa',
          versao: '4.0',
          quantidadeModelos: this.quantidadeModelosArcos,
          tipoDistribuicao: this.obterTipoDistribuicao(this.quantidadeModelosArcos),
          modelosArcos: modelosValidados,
          configuracaoGlobal: this.configArmazem,
          mapeamentoModelos: this.gerarMapeamentoModelos(this.quantidadeModelosArcos),
          timestamp: new Date().toISOString(),
          metadados: {
            totalModelos: Object.keys(modelosValidados).length,
            modelosValidos: Object.values(modelosValidados).filter(m => m.validado).length,
            sistemaCompleto: Object.keys(modelosValidados).length === this.quantidadeModelosArcos
          }
        }
      }
    }
  },
  mounted() {
    this.carregarConfiguracoesGerais()
  },
  methods: {
    // Método para resetar tudo após salvamento no banco
    resetarTudoAposSalvamento() {
      console.log('🔄 [GerenciadorModelosBanco] Iniciando reset completo após salvamento no banco')

      try {
        // Emitir evento para o componente pai resetar
        this.$emit('resetar-apos-salvamento-banco')

        // Mostrar toast de confirmação
        this.$emit('mostrar-toast', 
          '✅ Sistema resetado para valores padrão!\n\n' +
          '🆕 Pronto para modelar uma nova configuração do zero',
          'info'
        )

        console.log('✅ [GerenciadorModelosBanco] Reset completo emitido com sucesso')
      } catch (error) {
        console.error('❌ [GerenciadorModelosBanco] Erro ao resetar após salvamento:', error)
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
              console.warn('Erro ao fazer parse dos dados da configuração:', config.id_svg)
              return {
                ...config,
                dados_parsed: {}
              }
            }
          })

          console.log('🔄 [GerenciadorModelosBanco] Configurações carregadas:', {
            total: this.configuracoesGerais.length,
            tipo: this.tipoParaSalvar
          })
        } else {
          this.mostrarToast('Erro ao carregar configurações salvas', 'error')
        }
      } catch (error) {
        console.error('❌ [GerenciadorModelosBanco] Erro ao carregar configurações:', error)
        this.mostrarToast('Erro ao conectar com o servidor', 'error')
      } finally {
        this.isCarregando = false
      }
    },

    async salvarConfiguracaoCompleta() {
      console.log('🚀 [GerenciadorModelosBanco] Iniciando salvamento no banco:', {
        nome: this.nomeModelo,
        tipo: this.tipoAtivo,
        quantidadeModelos: this.quantidadeModelosArcos,
        podeSerSalvo: this.podeSerSalvo,
        modelosValidos: this.modelosValidosCount
      })

      // Validações básicas
      if (!this.nomeModelo.trim()) {
        this.$emit('mostrar-toast', 'Digite um nome para a configuração!', 'warning')
        return
      }

      // Validar se pode salvar baseado nas regras de negócio
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
        // Para armazém, usar consolidação baseada no localStorage
        if (this.tipoAtivo === 'armazem') {
          console.log('🔄 [GerenciadorModelosBanco] Consolidando modelos do localStorage...')

          // Consolidar todos os modelos salvos no localStorage para o formato do banco
          const { configuracaoService } = await import('../services/configuracaoService')
          const dadosConsolidados = configuracaoService.consolidarModelosParaBanco(
            this.quantidadeModelosArcos,
            this.nomeModelo
          )

          console.log('📦 [GerenciadorModelosBanco] Resultado da consolidação:', dadosConsolidados)

          if (!dadosConsolidados.success) {
            this.$emit('mostrar-toast', dadosConsolidados.message || 'Erro ao consolidar configurações', 'error')
            return
          }

          // Salvar no banco de dados usando dados consolidados
          const response = await modeloSvgService.salvarModelo(dadosConsolidados.dados)

          if (response.success) {
            console.log('✅ [GerenciadorModelosBanco] Configuração salva com sucesso')

            // Recarregar lista de modelos
            await this.carregarConfiguracoesGerais()

            // Notificar sucesso
            const idSalvo = response.data?.id_svg || response.data?.id || 'N/A'
            this.$emit('mostrar-toast',
              `🎉 Configuração "${this.nomeModelo}" salva no banco!\n\n` +
              `🆔 ID: ${idSalvo}\n` +
              `📊 ${this.quantidadeModelosArcos} modelo(s) de arco consolidado(s)\n` +
              `✅ Salvamento realizado com sucesso!\n\n` +
              `🔄 Sistema será resetado para valores padrão...`,
              'success'
            )

            // Limpar campos
            this.nomeModelo = ''
            this.descricaoModelo = ''

            // NOVO: Resetar tudo para valores padrão após salvar no banco
            setTimeout(() => {
              this.resetarTudoAposSalvamento()
            }, 1500) // Delay para mostrar mensagem de sucesso

          } else {
            console.error('❌ [GerenciadorModelosBanco] Erro ao salvar:', response)

            let mensagemErro = response.message || 'Erro desconhecido'
            if (response.error?.erros) {
              mensagemErro = response.error.erros.join('\n')
            }

            this.$emit('mostrar-toast', `❌ Erro ao salvar no banco:\n\n${mensagemErro}`, 'error')
          }

        } else {
          // Para silo, usar dados diretos
          console.log('🔄 [GerenciadorModelosBanco] Preparando dados do silo...')

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
            console.log('✅ [GerenciadorModelosBanco] Silo salvo com sucesso')

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

            // NOVO: Resetar tudo para valores padrão após salvar silo no banco
            setTimeout(() => {
              this.resetarTudoAposSalvamento()
            }, 1500) // Delay para mostrar mensagem de sucesso

          } else {
            console.error('❌ [GerenciadorModelosBanco] Erro ao salvar silo:', response)
            this.$emit('mostrar-toast', `❌ Erro ao salvar silo:\n\n${response.message || 'Erro desconhecido'}`, 'error')
          }
        }

      } catch (error) {
        console.error('❌ [GerenciadorModelosBanco] Erro inesperado:', error)
        this.$emit('mostrar-toast', `❌ Erro inesperado:\n\n${error.message || error}`, 'error')
      } finally {
        this.isSalvando = false
      }
    },

    prepararDadosParaSalvar() {
      if (this.tipoAtivo === 'silo') {
        // Capturar TODAS as variáveis de configuração do silo
        const dadosCompletos = {
          // Configuração básica
          ...this.configSilo,

          // Componentes específicos do silo
          dimensoes: this.capturarDimensoesSilo(),
          controles: this.capturarControlesSilo(),
          sensores: this.capturarSensoresSilo(),
          cabos: this.capturarCabosSilo(),
          pendulos: this.capturarPendulosSilo(),
          estrutura: this.capturarEstruturaSilo(),
          posicionamento: this.capturarPosicionamentoSilo(),
          parametrosDesenho: this.capturarParametrosDesenhoSilo(),
          estadoModelagem: this.capturarEstadoModelagemSilo(),

          // Dados adicionais dos componentes SVG
          componentesSVG: this.capturarComponentesSVGSilo(),

          // Metadados para controle
          tipoEstrutura: 'silo',
          versaoConfiguracao: '5.0',
          timestampSalvamento: new Date().toISOString()
        }

        console.log('📦 [prepararDadosParaSalvar] Dados completos do silo:', dadosCompletos)
        return dadosCompletos
      } else {
        // Capturar TODAS as variáveis de configuração do armazém
        const modelosCompletos = this.prepararModelosCompletos()

        const dadosCompletos = {
          // Configuração básica
          quantidadeModelos: this.quantidadeModelosArcos,
          modelosArcos: modelosCompletos,
          configuracaoGlobal: { ...this.configArmazem },

          // Componentes específicos do armazém
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

          // Dados específicos dos arcos
          dadosArcos: this.capturarDadosArcos(),
          posicoesCabos: this.capturarTodasPosicoesCabos(),
          configuracaoSensores: this.capturarConfiguracaoSensores(),
          layouts: this.capturarLayoutsArmazem(),
          mapeamentos: this.capturarMapeamentosArmazem(),

          // Dados adicionais dos componentes SVG
          componentesSVG: this.capturarComponentesSVGArmazem(),

          // Metadados para controle
          tipoEstrutura: 'armazem',
          versaoConfiguracao: '5.0',
          timestampSalvamento: new Date().toISOString()
        }

        console.log('📦 [prepararDadosParaSalvar] Dados completos do armazém:', {
          quantidadeModelos: dadosCompletos.quantidadeModelos,
          modelosConfigurados: Object.keys(dadosCompletos.modelosArcos || {}).length,
          temConfigGlobal: !!dadosCompletos.configuracaoGlobal,
          componentes: Object.keys(dadosCompletos).length
        })

        return dadosCompletos
      }
    },

    prepararModelosCompletos() {
      const modelos = {}

      for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
        const modelo = this.modelosArcos[i]
        if (modelo && modelo.nome) {
          // Capturar TODAS as configurações do modelo
          const configuracao = modelo.configuracao || modelo.config || {}

          // CORREÇÃO: Garantir que posições dos cabos sejam preservadas
          const posicoesCabosOriginais = modelo.posicoesCabos || {}

          // CORREÇÃO: Carregar TODOS os dados do localStorage (posições E sensores)
          const dadosLocalStorage = this.carregarDadosCompletosDoLocalStorage(i)
          const posicoesCabosCompletas = { ...posicoesCabosOriginais, ...dadosLocalStorage.posicoesCabos }
          const sensoresCompletos = { ...modelo.sensoresPorPendulo, ...dadosLocalStorage.sensoresPorPendulo }
          const alturasCompletas = { ...dadosLocalStorage.alturasSensores }

          console.log(`📦 [prepararModelosCompletos] Modelo ${i} - Dados completos integrados:`, {
            posicoesCabos: Object.keys(posicoesCabosCompletas).length,
            sensoresPorPendulo: sensoresCompletos,
            alturasSensores: alturasCompletas,
            quantidadePendulos: dadosLocalStorage.quantidadePendulos
          })

          modelos[i] = {
            numero: i,
            nome: modelo.nome,
            posicao: modelo.posicao || this.determinarPosicaoModelo(i, this.quantidadeModelosArcos),

            // Todas as configurações possíveis
            configuracao: { 
              ...configuracao,
              // CORREÇÃO: Incluir TODOS os dados na configuração principal
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

            // Dados adicionais se existirem
            dimensoes: { ...(modelo.dimensoes || {}) },
            parametros: { ...(modelo.parametros || {}) },
            estados: { ...(modelo.estados || {}) },
            variaveis: { ...(modelo.variaveis || {}) },
            propriedades: { ...(modelo.propriedades || {}) },

            // Dados de componentes específicos
            estrutura: modelo.estrutura || {},
            desenho: modelo.desenho || {},
            layout: modelo.layout || {},
            coordenadas: modelo.coordenadas || {},

            // Metadados
            timestampCriacao: modelo.timestampCriacao || new Date().toISOString(),
            validado: Object.keys(configuracao).length > 0,
            versao: '2.0'
          }

          console.log(`📦 Modelo ${i} capturado:`, {
            nome: modelos[i].nome,
            configKeys: Object.keys(configuracao).length,
            pendulos: modelos[i].quantidadePendulos,
            sensores: Object.keys(modelos[i].sensoresPorPendulo).length,
            cabos: Object.keys(modelos[i].posicoesCabos).length
          })
        } else {
          console.warn(`⚠️ Modelo ${i} não existe ou não tem nome:`, modelo)
        }
      }

      console.log('📦 TODOS os modelos preparados:', {
        total: Object.keys(modelos).length,
        esperado: this.quantidadeModelosArcos,
        modelosEncontrados: Object.keys(modelos),
        dadosDetalhados: modelos
      })

      return modelos
    },

    obterLogicaDistribuicao() {
      const logicas = {
        1: { nome: 'Modelo Único', aplicacao: 'todos_arcos' },
        2: { nome: 'Par/Ímpar', aplicacao: 'par_impar' },
        3: { nome: 'Frente/Fundo + Par/Ímpar', aplicacao: 'frente_fundo_par_impar' },
        4: { nome: 'Frente/Par/Ímpar/Fundo', aplicacao: 'frente_par_impar_fundo' }
      }
      return logicas[this.quantidadeModelosArcos] || logicas[1]
    },

    gerarDescricaoConfiguracao() {
      const tipo = this.tipoAtivo === 'silo' ? 'Silo' : 'Armazém'
      const data = new Date().toLocaleDateString('pt-BR')
      const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      if (this.tipoAtivo === 'silo') {
        return `Configuração de ${tipo} criada em ${data} às ${hora}`
      } else {
        const logica = this.obterLogicaDistribuicao().nome
        return `Configuração de ${tipo} com ${this.quantidadeModelosArcos} modelo(s) - ${logica} - ${data} ${hora}`
      }
    },

    async carregarConfiguracao(configuracao) {
      try {
        let dadosSvg
        if (configuracao.dados_parsed) {
          dadosSvg = configuracao.dados_parsed
        } else {
          dadosSvg = JSON.parse(configuracao.dado_svg)
        }

        console.log('🔄 [GerenciadorModelosBanco] Carregando configuração:', {
          nome: configuracao.nm_modelo,
          id: configuracao.id_svg,
          dados: dadosSvg
        })

        // Emitir evento com estrutura completa para garantir reprodução correta dos desenhos
        this.$emit('configuracao-carregada', {
          nome: configuracao.nm_modelo,
          dados: dadosSvg,
          tipo: configuracao.tp_svg,
          origem: 'banco_dados',
          configuracaoId: configuracao.id_svg,
          tipoConfiguracao: dadosSvg.tipo || 'configuracao_completa',
          versao: dadosSvg.versao || '1.0',
          // Dados adicionais para garantir reprodução
          sistemaModelos: dadosSvg.sistemaModelos || dadosSvg.modelosDefinidos,
          configuracaoGlobal: dadosSvg.configuracaoGlobal,
          layoutsAutomaticos: dadosSvg.layoutsAutomaticos,
          dimensoesSVG: dadosSvg.dimensoesSVG,
          dadosOriginais: dadosSvg.dadosOriginais
        })

        this.mostrarToast(`Configuração "${configuracao.nm_modelo}" carregada com sucesso!`, 'success')
      } catch (error) {
        console.error('❌ [GerenciadorModelosBanco] Erro ao carregar configuração:', error)
        this.mostrarToast('Erro ao processar dados da configuração', 'error')
      }
    },

    confirmarExclusao(configuracao) {
      this.modeloParaExcluir = configuracao
      this.showModalExclusao = true
      // Adicionar classe ao body para evitar scroll
      document.body.classList.add('modal-open')
    },

    async excluirConfiguracao() {
      if (!this.modeloParaExcluir) return

      this.isExcluindo = true

      try {
        console.log('🗑️ [GerenciadorModelosBanco] Iniciando exclusão do modelo:', this.modeloParaExcluir.id_svg)

        const response = await modeloSvgService.excluirModelo(this.modeloParaExcluir.id_svg)

        console.log('📝 [GerenciadorModelosBanco] Resposta da exclusão:', response)

        if (response && response.success) {
          // Remover da lista local imediatamente
          this.configuracoesGerais = this.configuracoesGerais.filter(m => m.id_svg !== this.modeloParaExcluir.id_svg)

          // Emitir evento para o componente pai
          this.$emit('modelo-deletado', this.modeloParaExcluir.id_svg)
          this.mostrarToast(`Configuração "${this.modeloParaExcluir.nm_modelo}" excluída com sucesso!`, 'success')

          console.log('✅ [GerenciadorModelosBanco] Modelo deletado com sucesso')

          // Recarregar lista para garantir sincronização
          // Adicionado um pequeno delay para dar tempo para a UI atualizar antes do reload.
          setTimeout(() => {
            this.carregarConfiguracoesGerais()
          }, 500)
        } else {
          console.error('❌ [GerenciadorModelosBanco] Erro na resposta do serviço:', response)

          let mensagemErro = response?.message || 'Erro ao excluir configuração'

          // Tratar erros específicos
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
        console.error('❌ [GerenciadorModelosBanco] Erro interno ao excluir configuração:', error)
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
      // Remover classe do body
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

    obterTipoDistribuicao(quantidade) {
      const tipos = {
        1: { nome: 'Modelo Único', descricao: 'Todos os arcos usam o mesmo modelo' },
        2: { nome: 'Par/Ímpar', descricao: 'Arcos pares e ímpares com modelos diferentes' },
        3: { nome: 'Frente/Fundo + Par/Ímpar', descricao: 'Primeiro e último iguais, meio alternado' },
        4: { nome: 'Frente/Par/Ímpar/Fundo', descricao: 'Cada posição com modelo específico' }
      }
      return tipos[quantidade] || tipos[1]
    },

    gerarMapeamentoModelos(quantidadeModelos) {
      const mapeamento = {}
      for (let i = 1; i <= quantidadeModelos; i++) {
        mapeamento[i] = {
          numero: i,
          tipo: this.determinarPosicaoModelo(i, quantidadeModelos),
          nome: this.gerarNomeModelo(i, quantidadeModelos)
        }
      }
      return mapeamento
    },

    gerarNomeModelo(numeroModelo, quantidadeTotal) {
      switch (quantidadeTotal) {
        case 1: return 'Modelo Único'
        case 2: return numeroModelo === 1 ? 'Modelo Ímpar' : 'Modelo Par'
        case 3:
          if (numeroModelo === 1) return 'Modelo Frente/Fundo'
          else if (numeroModelo === 2) return 'Modelo Par'
          else return 'Modelo Ímpar'
        case 4:
          if (numeroModelo === 1) return 'Modelo Frente'
          else if (numeroModelo === 2) return 'Modelo Par'
          else if (numeroModelo === 3) return 'Modelo Ímpar'
          else return 'Modelo Fundo'
        default: return `Modelo ${numeroModelo}`
      }
    },

    // CORREÇÃO: Método para carregar TODOS os dados do localStorage (posições E sensores)
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

            console.log(`🎯 [carregarDadosCompletosDoLocalStorage] Modelo ${numeroModelo} - Dados completos:`, {
              posicoesCabos: Object.keys(dadosCompletos.posicoesCabos).length,
              sensoresPorPendulo: dadosCompletos.sensoresPorPendulo,
              alturasSensores: dadosCompletos.alturasSensores,
              quantidadePendulos: dadosCompletos.quantidadePendulos
            })

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
        console.warn(`⚠️ [carregarDadosCompletosDoLocalStorage] Erro ao carregar dados do modelo ${numeroModelo}:`, error)
        return {
          posicoesCabos: {},
          sensoresPorPendulo: {},
          alturasSensores: {},
          quantidadePendulos: 3
        }
      }
    },

    // MANTÉM compatibilidade com método antigo
    carregarPosicoesCabosDoLocalStorage(numeroModelo) {
      const dadosCompletos = this.carregarDadosCompletosDoLocalStorage(numeroModelo)
      return dadosCompletos.posicoesCabos
    },

    resetarEstadoSalvamento() {
      this.isSalvando = false
      this.$emit('mostrar-toast', 'Estado de salvamento resetado. Tente novamente.', 'info')
      console.log('🔄 [GerenciadorModelosBanco] Estado de salvamento resetado manualmente')
    },

    // Métodos para capturar TODOS os componentes do SILO
    capturarComponentesSVGSilo() {
      try {
        const componentesSilo = {}

        // Tentar capturar dados de todos os componentes possíveis do silo
        if (this.$parent && this.$parent.$refs) {
          const refs = this.$parent.$refs

          // Controles do silo
          if (refs.controlesSilo) {
            componentesSilo.controles = refs.controlesSilo.obterDados ? refs.controlesSilo.obterDados() : {}
          }

          // Dimensões básicas
          if (refs.dimensoesBasicas) {
            componentesSilo.dimensoes = refs.dimensoesBasicas.obterDados ? refs.dimensoesBasicas.obterDados() : {}
          }

          // Configuração de sensores
          if (refs.configuracaoSensores) {
            componentesSilo.sensores = refs.configuracaoSensores.obterDados ? refs.configuracaoSensores.obterDados() : {}
          }

          // Posicionamento de cabos
          if (refs.posicionamentoCabos) {
            componentesSilo.cabos = refs.posicionamentoCabos.obterDados ? refs.posicionamentoCabos.obterDados() : {}
          }
        }

        console.log('🎯 [capturarComponentesSVGSilo] Componentes capturados:', componentesSilo)
        return componentesSilo
      } catch (error) {
        console.warn('⚠️ [capturarComponentesSVGSilo] Erro ao capturar componentes:', error)
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
        console.warn('⚠️ Erro ao capturar dimensões do silo:', error)
        return {}
      }
    },

    capturarPosicionamentoSilo() {
      try {
        return this.configSilo?.posicionamento || {}
      } catch (error) {
        return {}
      }
    },

    capturarSensoresSilo() {
      try {
        return this.configSilo?.sensores || {}
      } catch (error) {
        return {}
      }
    },

    capturarEstruturaSilo() {
      try {
        return this.configSilo?.estrutura || {}
      } catch (error) {
        return {}
      }
    },

    // Métodos para capturar TODOS os componentes do ARMAZÉM
    capturarComponentesSVGArmazem() {
      try {
        const componentesArmazem = {}

        // Tentar capturar dados de todos os componentes possíveis do armazém
        if (this.$parent && this.$parent.$refs) {
          const refs = this.$parent.$refs

          // Modelos de arcos
          if (refs.modelosArcos) {
            componentesArmazem.modelosArcos = refs.modelosArcos.obterDados ? refs.modelosArcos.obterDados() : {}
          }

          // Dimensões básicas
          if (refs.dimensoesBasicas) {
            componentesArmazem.dimensoes = refs.dimensoesBasicas.obterDados ? refs.dimensoesBasicas.obterDados() : {}
          }

          // Configuração de sensores
          if (refs.configuracaoSensores) {
            componentesArmazem.sensores = refs.configuracaoSensores.obterDados ? refs.configuracaoSensores.obterDados() : {}
          }

          // Posicionamento de cabos
          if (refs.posicionamentoCabos) {
            componentesArmazem.cabos = refs.posicionamentoCabos.obterDados ? refs.posicionamentoCabos.obterDados() : {}
          }

          // Configuração do telhado
          if (refs.configuracaoTelhado) {
            componentesArmazem.telhado = refs.configuracaoTelhado.obterDados ? refs.configuracaoTelhado.obterDados() : {}
          }

          // Configuração do fundo
          if (refs.configuracaoFundo) {
            componentesArmazem.fundo = refs.configuracaoFundo.obterDados ? refs.configuracaoFundo.obterDados() : {}
          }

          // Controle de sensores por pêndulo
          if (refs.controleSensoresPendulo) {
            componentesArmazem.sensoresPendulo = refs.controleSensoresPendulo.obterDados ? refs.controleSensoresPendulo.obterDados() : {}
          }

          // Inicializador de modelos
          if (refs.inicializadorModelos) {
            componentesArmazem.inicializador = refs.inicializadorModelos.obterDados ? refs.inicializadorModelos.obterDados() : {}
          }
        }

        console.log('🎯 [capturarComponentesSVGArmazem] Componentes capturados:', componentesArmazem)
        return componentesArmazem
      } catch (error) {
        console.warn('⚠️ [capturarComponentesSVGArmazem] Erro ao capturar componentes:', error)
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

    capturarPosicionamentoArmazem() {
      try {
        return this.configArmazem?.posicionamento || {}
      } catch (error) {
        return {}
      }
    },

    capturarSensoresArmazem() {
      try {
        return this.configArmazem?.sensores || {}
      } catch (error) {
        return {}
      }
    },

    capturarEstruturaArmazem() {
      try {
        return this.configArmazem?.estrutura || {}
      } catch (error) {
        return {}
      }
    },

    capturarCabosArmazem() {
      try {
        return this.configArmazem?.cabos || {}
      } catch (error) {
        return {}
      }
    },

    capturarTelhadoArmazem() {
      try {
        return this.configArmazem?.telhado || {}
      } catch (error) {
        return {}
      }
    },

    capturarFundoArmazem() {
      try {
        return this.configArmazem?.fundo || {}
      } catch (error) {
        return {}
      }
    },

    capturarPendulosArmazem() {
      try {
        const pendulos = {}
        for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
          const modelo = this.modelosArcos?.[i]
          if (modelo && modelo.pendulos) {
            pendulos[i] = modelo.pendulos
          }
        }
        return pendulos
      } catch (error) {
        return {}
      }
    },

    capturarLayoutsArmazem() {
      try {
        return this.configArmazem?.layouts || {}
      } catch (error) {
        return {}
      }
    },

    capturarMapeamentosArmazem() {
      try {
        return this.configArmazem?.mapeamentos || {}
      } catch (error) {
        return {}
      }
    },

    // Métodos para capturar TODOS os dados de modelagem do SILO
    capturarControlesSilo() {
      try {
        return this.configSilo?.controles || this.configSilo?.configControles || {}
      } catch (error) {
        return {}
      }
    },

    capturarCabosSilo() {
      try {
        return this.configSilo?.cabos || this.configSilo?.posicoesCabos || {}
      } catch (error) {
        return {}
      }
    },

    capturarPendulosSilo() {
      try {
        return this.configSilo?.pendulos || this.configSilo?.quantidadePendulos || {}
      } catch (error) {
        return {}
      }
    },

    capturarParametrosDesenhoSilo() {
      try {
        return this.configSilo?.parametrosDesenho || this.configSilo?.desenho || {}
      } catch (error) {
        return {}
      }
    },

    capturarEstadoModelagemSilo() {
      try {
        return {
          configurado: this.podeSerSalvo,
          timestamp: new Date().toISOString(),
          configCompleta: !!this.configSilo,
          tamanhoConfig: Object.keys(this.configSilo || {}).length
        }
      } catch (error) {
        return {}
      }
    },

    // Métodos para capturar TODOS os dados de modelagem do ARMAZÉM
    capturarDadosArcos() {
      try {
        const dadosArcos = {}
        for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
          const modelo = this.modelosArcos?.[i]
          if (modelo) {
            dadosArcos[i] = {
              numero: i,
              nome: modelo.nome,
              configuracao: modelo.configuracao || modelo.config || {},
              posicao: modelo.posicao,
              quantidadePendulos: modelo.quantidadePendulos || 3,
              sensoresPorPendulo: modelo.sensoresPorPendulo || {},
              posicoesCabos: modelo.posicoesCabos || {},
              dimensoes: modelo.dimensoes || {},
              parametros: modelo.parametros || {},
              validado: true
            }
          }
        }
        return dadosArcos
      } catch (error) {
        return {}
      }
    },

    capturarTodasPosicoesCabos() {
      try {
        const posicoesCabos = {}

        console.log('🔍 [capturarTodasPosicoesCabos] Iniciando captura EXATA das posições dos cabos...')

        for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
          const modelo = this.modelosArcos?.[i]

          if (!modelo) {
            console.warn(`⚠️ [capturarTodasPosicoesCabos] Modelo ${i} não encontrado`)
            continue
          }

          // CORREÇÃO CRÍTICA: Priorizar localStorage para capturar posições EXATAS
          const posicoesLocalStorage = this.carregarPosicoesCabosDoLocalStorage(i)
          let posicoesDoCaboFinal = {}

          if (Object.keys(posicoesLocalStorage).length > 0) {
            // PRIORIDADE 1: localStorage tem as posições mais atualizadas e exatas
            posicoesDoCaboFinal = { ...posicoesLocalStorage }
            console.log(`🎯 [capturarTodasPosicoesCabos] Modelo ${i} - Usando posições EXATAS do localStorage:`, posicoesLocalStorage)
          } else {
            // PRIORIDADE 2: Buscar nas configurações do modelo
            const fontesPosicoes = [
              modelo.posicoesCabos,
              modelo.configuracao?.posicoesCabos,
              modelo.configuracao?.posicoesCabosIndividuais,
              modelo.configuracao?.posicoesCabosPersonalizadas
            ]

            fontesPosicoes.forEach((fonte, index) => {
              if (fonte && Object.keys(fonte).length > 0) {
                Object.assign(posicoesDoCaboFinal, fonte)
                console.log(`📍 [capturarTodasPosicoesCabos] Modelo ${i} - Fonte ${index + 1}:`, fonte)
              }
            })
          }

          // Validar e preservar EXATAMENTE as coordenadas
          if (Object.keys(posicoesDoCaboFinal).length > 0) {
            const cabosPreservados = {}

            Object.keys(posicoesDoCaboFinal).forEach(cabo => {
              const posicao = posicoesDoCaboFinal[cabo]

              if (posicao && typeof posicao === 'object') {
                // PRESERVAR EXATAMENTE todos os valores de posição sem alteração
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

                console.log(`🎯 [capturarTodasPosicoesCabos] Modelo ${i} - Cabo ${cabo} preservado EXATO:`, cabosPreservados[cabo])
              }
            })

            if (Object.keys(cabosPreservados).length > 0) {
              posicoesCabos[i] = cabosPreservados

              console.log(`✅ [capturarTodasPosicoesCabos] Modelo ${i} - Posições EXATAS capturadas:`, {
                quantidadeCabos: Object.keys(cabosPreservados).length,
                cabos: Object.keys(cabosPreservados),
                coordenadasExatas: cabosPreservados
              })
            }
          } else {
            console.warn(`⚠️ [capturarTodasPosicoesCabos] Modelo ${i} - Nenhuma posição encontrada`)
          }
        }

        console.log('🎯 [capturarTodasPosicoesCabos] RESULTADO FINAL - Posições EXATAS capturadas:', {
          totalModelos: Object.keys(posicoesCabos).length,
          modelosComPosicoes: Object.keys(posicoesCabos),
          resumoDetalhado: Object.keys(posicoesCabos).reduce((acc, modelo) => {
            const cabosDoModelo = posicoesCabos[modelo]
            acc[`modelo_${modelo}`] = {
              totalCabos: Object.keys(cabosDoModelo).length,
              cabos: Object.keys(cabosDoModelo),
              coordenadas: cabosDoModelo
            }
            return acc
          }, {}),
          dadosCompletos: posicoesCabos
        })

        return posicoesCabos
      } catch (error) {
        console.error('❌ [capturarTodasPosicoesCabos] Erro:', error)
        return {}
      }
    },

    capturarConfiguracaoSensores() {
      try {
        return this.configArmazem?.sensores || this.configArmazem?.configuracaoSensores || {}
      } catch (error) {
        return {}
      }
    },

    capturarParametrosDesenho() {
      try {
        return this.configArmazem?.parametrosDesenho || this.configArmazem?.desenho || {}
      } catch (error) {
        return {}
      }
    },

    capturarEstadoModelagem() {
      try {
        return {
          configurado: this.podeSerSalvo,
          timestamp: new Date().toISOString(),
          quantidadeModelos: this.quantidadeModelosArcos,
          modelosConfigurados: this.modelosValidosCount,
          configCompleta: !!this.configArmazem,
          modelosCompletos: Object.keys(this.modelosArcos || {}).length,
          podeSerSalvo: this.podeSerSalvo
        }
      } catch (error) {
        return {}
      }
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

.progress-sm {
  height: 0.5rem;
}

/* Grid de Modelos Ultra Compacto */
.modelos-grid-compact {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.15rem;
  margin-top: 0.15rem;
}

.modelo-item-compact {
  border: 1px solid #dee2e6;
  border-radius: 2px;
  overflow: hidden;
  transition: transform 0.1s ease-in-out;
  background: white;
}

.modelo-item-compact:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.modelo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.15rem 0.3rem;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.2;
}

.modelo-nome {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-delete {
  background: none;
  border: none;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  line-height: 1;
}

.btn-delete:hover {
  opacity: 1;
}

.modelo-body {
  padding: 0.15rem 0.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.modelo-details {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}

.modelo-details small {
  font-size: 0.65rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.1;
}

.btn-carregar {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 2px;
  padding: 0.1rem 0.25rem;
  font-size: 0.6rem;
  cursor: pointer;
  transition: all 0.1s;
  text-align: center;
  line-height: 1.2;
}

.btn-carregar:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

/* Modal de Exclusão - Corrigido */
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
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  margin: 0 auto;
}

.modal-content {
  border: none;
  border-radius: 6px;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-backdrop.show {
  opacity: 1;
}

.modal-backdrop.fade {
  opacity: 0;
  transition: opacity 0.15s linear;
}

/* Responsivo */
@media (max-width: 576px) {
  .modelos-grid-compact {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }

  .modelo-header {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
  }

  .modelo-body {
    padding: 0.2rem 0.4rem;
  }

  .modelo-details small {
    font-size: 0.65rem;
  }

  .btn-carregar {
    font-size: 0.6rem;
    padding: 0.1rem 0.25rem;
  }

  .card-body {
    padding: 0.75rem !important;
  }

  .btn-sm {
    font-size: 11px;
    padding: 0.2rem 0.4rem;
    margin: 0.1rem;
  }

  .form-control,
  .form-select,
  .form-control-sm {
    font-size: 13px;
    min-height: 32px;
  }

  .row.g-2 {
    --bs-gutter-x: 0.5rem;
    --bs-gutter-y: 0.5rem;
  }

  .alert {
    padding: 0.5rem !important;
    margin-bottom: 0.75rem !important;
  }

  .d-flex.flex-wrap.gap-2 {
    gap: 0.25rem !important;
    justify-content: center;
  }

  .small {
    font-size: 0.75rem !important;
  }
}

@media (max-width: 768px) {
  .modelos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .d-flex.gap-1 {
    gap: 0.5rem !important;
  }

  .btn-outline-light {
    min-width: auto;
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 992px) {
  .modelos-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>