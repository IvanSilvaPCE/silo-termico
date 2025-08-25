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
          Modelos configurados: {{ Object.keys(modelosArcos || {}).length }}<br>
          Modelos válidos: {{ modelosValidosCount }}<br>
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
        <div class="mb-2">
          <button class="btn btn-outline-secondary btn-sm" @click="debugMode = !debugMode">
            {{ debugMode ? 'Ocultar' : 'Mostrar' }} Debug
          </button>
        </div>

        <!-- Lista de Configurações Salvas -->
        <div class="mb-3">
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

          <div v-else-if="configuracoesGerais.length === 0" class="alert alert-info p-2 text-center">
            <small>Nenhuma configuração salva encontrada</small>
          </div>

          <div v-else class="list-group">
            <div v-for="config in configuracoesGerais" :key="config.id_svg" class="list-group-item p-2">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <h6 class="mb-1 text-truncate">{{ config.nm_modelo }}</h6>
                  <small class="text-muted d-block text-truncate">
                    {{ config.ds_modelo || 'Sem descrição' }}
                  </small>
                  <small class="text-muted">
                    Tipo: {{ config.tp_svg === 'A' ? 'Armazém' : 'Silo' }} |
                    Criado: {{ formatarData(config.created_at) }} |
                    <span v-if="config.dados_parsed?.quantidadeModelos" class="text-success">
                      {{ config.dados_parsed.quantidadeModelos }} modelo(s) de arcos
                    </span>
                  </small>
                </div>
                <div class="btn-group btn-group-sm ms-2">
                  <button class="btn btn-outline-primary btn-sm" @click="carregarConfiguracao(config)"
                    :disabled="isCarregando" title="Carregar configuração">
                    📥
                  </button>
                  <button class="btn btn-outline-danger btn-sm" @click="confirmarExclusao(config)"
                    :disabled="isExcluindo" title="Excluir configuração">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Status -->
        <div v-if="!podeSerSalvo" class="alert alert-warning p-2">
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
    <div class="modal fade" id="modalExclusao" tabindex="-1" ref="modalExclusao">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="mb-2">Deseja excluir a configuração:</p>
            <strong>{{ modeloParaExcluir?.nm_modelo }}</strong>
            <p class="text-muted small mt-2">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal" :disabled="isExcluindo">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger btn-sm" @click="excluirConfiguracao" :disabled="isExcluindo">
              <span v-if="!isExcluindo">Excluir</span>
              <div v-else class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-1" role="status"></div>
                <span>Excluindo...</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { modeloSvgService } from '../services/modeloSvgService'

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
    'mostrar-toast'
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
      debugMode: false
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
        if (modelo && modelo.nome && modelo.configuracao && Object.keys(modelo.configuracao).length > 0) {
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
      if (!this.nomeModelo.trim()) {
        this.mostrarToast('Digite um nome para a configuração', 'warning')
        return
      }

      if (!this.podeSerSalvo) {
        if (this.tipoAtivo === 'armazem') {
          this.mostrarToast(`Configure todos os ${this.quantidadeModelosArcos} modelos de arcos antes de salvar. Configurados: ${this.modelosValidosCount}/${this.quantidadeModelosArcos}`, 'warning')
        } else {
          this.mostrarToast('Configure o silo antes de salvar', 'warning')
        }
        return
      }

      this.isSalvando = true

      try {
        console.log('🔄 [GerenciadorModelosBanco] Iniciando salvamento:', {
          nome: this.nomeModelo,
          tipo: this.tipoAtivo,
          quantidadeModelos: this.quantidadeModelosArcos,
          modelosConfigurados: this.modelosValidosCount,
          dadosCompletos: this.dadosParaSalvar
        })

        const configuracaoParaSalvar = {
          nm_modelo: this.nomeModelo.trim(),
          dado_svg: JSON.stringify(this.dadosParaSalvar),
          ds_modelo: this.descricaoModelo.trim() || '',
          tp_svg: this.tipoParaSalvar,
          vista_svg: 'F'
        }

        console.log('📝 [GerenciadorModelosBanco] Dados para API:', {
          nm_modelo: configuracaoParaSalvar.nm_modelo,
          tp_svg: configuracaoParaSalvar.tp_svg,
          vista_svg: configuracaoParaSalvar.vista_svg,
          ds_modelo: configuracaoParaSalvar.ds_modelo,
          dado_svg_length: configuracaoParaSalvar.dado_svg.length,
          dado_svg_preview: configuracaoParaSalvar.dado_svg.substring(0, 200) + '...'
        })

        const response = await modeloSvgService.salvarModelo(configuracaoParaSalvar)

        console.log('📋 [GerenciadorModelosBanco] Resposta da API:', response)

        if (response.success) {
          console.log('✅ [GerenciadorModelosBanco] Configuração salva com sucesso!')
          this.mostrarToast(`Configuração "${this.nomeModelo}" salva com sucesso no banco!`, 'success')
          this.nomeModelo = ''
          this.descricaoModelo = ''
          await this.carregarConfiguracoesGerais()
        } else {
          console.error('❌ [GerenciadorModelosBanco] Erro no salvamento:', response)
          this.mostrarToast(response.message || 'Erro ao salvar configuração', 'error')
        }
      } catch (error) {
        console.error('❌ [GerenciadorModelosBanco] Erro ao salvar configuração:', error)
        this.mostrarToast('Erro ao conectar com o servidor', 'error')
      } finally {
        this.isSalvando = false
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

        this.$emit('configuracao-carregada', {
          nome: configuracao.nm_modelo,
          dados: dadosSvg,
          tipo: configuracao.tp_svg,
          origem: 'banco_dados',
          configuracaoId: configuracao.id_svg
        })

        this.mostrarToast(`Configuração "${configuracao.nm_modelo}" carregada com sucesso!`, 'success')
      } catch (error) {
        console.error('❌ [GerenciadorModelosBanco] Erro ao carregar configuração:', error)
        this.mostrarToast('Erro ao processar dados da configuração', 'error')
      }
    },

    confirmarExclusao(configuracao) {
      this.modeloParaExcluir = configuracao
      const modal = new bootstrap.Modal(this.$refs.modalExclusao)
      modal.show()
    },

    async excluirConfiguracao() {
      if (!this.modeloParaExcluir) return

      this.isExcluindo = true

      try {
        const response = await modeloSvgService.excluirModelo(this.modeloParaExcluir.id_svg)

        if (response.success) {
          console.log('🗑️ [GerenciadorModelosBanco] Configuração excluída:', this.modeloParaExcluir.nm_modelo)
          this.mostrarToast(`Configuração "${this.modeloParaExcluir.nm_modelo}" excluída com sucesso!`, 'success')
          await this.carregarConfiguracoesGerais()

          const modal = bootstrap.Modal.getInstance(this.$refs.modalExclusao)
          modal.hide()
        } else {
          this.mostrarToast('Erro ao excluir configuração', 'error')
        }
      } catch (error) {
        console.error('❌ [GerenciadorModelosBanco] Erro ao excluir configuração:', error)
        this.mostrarToast('Erro ao conectar com o servidor', 'error')
      } finally {
        this.isExcluindo = false
        this.modeloParaExcluir = null
      }
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
    }
  }
}
</script>

<style scoped>
.list-group-item {
  border: 1px solid #dee2e6;
  margin-bottom: 2px;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-sm {
  height: 0.375rem;
}

@media (max-width: 576px) {
  .btn-group {
    flex-direction: column;
  }

  .btn-group .btn {
    margin-bottom: 2px;
  }
}
</style>
