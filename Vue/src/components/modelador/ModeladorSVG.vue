<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <!-- Painel de Controles -->
      <div class="col-xl-3 col-lg-4 col-md-5 col-sm-12 modelador-painel-controles" :style="{
        height: isMobile ? 'auto' : '100vh',
        overflowY: isMobile ? 'visible' : 'auto',
        position: 'relative',
        borderRight: '2px solid #dee2e6',
        backgroundColor: '#f8f9fa',
        zIndex: 1000,
        maxHeight: isMobile ? 'none' : '100vh'
      }">
        <div class="p-3">
          <h4 class="text-center mb-4">Modelador de Layouts</h4>

          <!-- Seletor de Tipo -->
          <SeletorTipo v-model="tipoAtivo" @input="onTipoChange" />

          <!-- Controles para Silo -->
          <ControlesSilo :tipo-ativo="tipoAtivo" :config-silo="configSilo" @silo-change="onSiloChange"
            @reset-field="resetSiloField" />

          <!-- Controles para Armazém -->
          <template v-if="tipoAtivo === 'armazem'">
            <!-- Seção 0: Configuração de Modelos de Arcos -->
            <ModelosArcos :quantidade-modelos-arcos="quantidadeModelosArcos" :modelo-arco-atual="modeloArcoAtual"
              :modelos-arcos="modelosArcos" :modelos-salvos="modelosSalvos" :modelo-nome="modeloNome"
              :modelo-posicao="modeloPosicao" :cabo-selecionado-posicionamento="caboSelecionadoPosicionamento"
              :posicoes-cabos="posicoesCabos" @quantidade-modelos-change="onQuantidadeModelosChange"
              @modelo-arco-change="onModeloArcoChange" @nome-modelo-change="onNomeModeloChange"
              @posicao-arco-change="onPosicaoArcoChange" @alterar-quantidade-pendulos="alterarQuantidadePendulos"
              @quantidade-pendulos-change="onQuantidadePendulosChange"
              @update:cabo-selecionado-posicionamento="caboSelecionadoPosicionamento = $event"
              @posicao-cabo-change="onPosicaoCaboChange" @resetar-posicoes-cabos="resetarPosicoesCabos"
              @salvar-modelo-atual="salvarModeloAtual" @modelo-dados-atualizados="onModeloDadosAtualizados" />

            <!-- Seção 1: Dimensões Básicas -->
            <DimensoesBasicas :config-armazem="configArmazem" @armazem-change="onArmazemChange" />

            <!-- Seção 2: Configuração do Telhado -->
            <ConfiguracaoTelhado :config-armazem="configArmazem" @armazem-change="onArmazemChange" />

            <!-- Seção 3: Configuração do Fundo -->
            <ConfiguracaoFundo :config-armazem="configArmazem" @armazem-change="onArmazemChange" />

            <!-- Seção 4: Configuração dos Sensores -->
            <ConfiguracaoSensores :config-armazem="configArmazem" :modelo-arco-atual="modeloArcoAtual"
              :quantidade-pendulos="modeloArcoAtual ? (modelosArcos[modeloArcoAtual]?.quantidadePendulos || 0) : 0"
              :sensores-por-pendulo="modeloArcoAtual ? (modelosArcos[modeloArcoAtual]?.sensoresPorPendulo || {}) : {}"
              @armazem-change="onArmazemChange" @sensores-cabo-change="onSensoresCaboChange"
              @aplicar-sensores-uniformes="onAplicarSensoresUniformes" />
          </template>

          <!-- Botões de Reset -->
          <BotoesControle :tipo-ativo="tipoAtivo" :dados-vindos-do-preview="dadosVindosDoPreview"
            @resetar-padrao="resetarPadrao" @resetar-modelos-padrao="resetarModelosParaPadrao"
            @voltar-preview="voltarParaPreview" />

          <!-- Gerenciador de Configurações (Banco de Dados) -->
          <GerenciadorModelosBanco :tipo-ativo="tipoAtivo" :quantidade-modelos-arcos="quantidadeModelosArcos"
            :modelos-arcos="modelosArcos" :modelos-salvos="modelosSalvos" :config-silo="configSilo"
            :config-armazem="configArmazem" @configuracao-carregada="carregarConfiguracaoDoBanco"
            @mostrar-toast="mostrarToast" />

          <!-- Gerenciador de Configurações (Backup Local) -->
          <GerenciadorConfiguracoes />
        </div>
      </div>

      <!-- Área de Visualização -->
      <div class="col-xl-9 col-lg-8 col-md-7 col-sm-12" :style="{
        padding: '10px',
        height: isMobile ? 'auto' : '100vh',
        overflow: isMobile ? 'visible' : 'hidden',
        minHeight: isMobile ? '400px' : '100vh'
      }">
        <div class="d-flex justify-content-center align-items-center h-100" style="minHeight: 400px">
          <div class="card w-100" :style="{
            maxWidth: '100%',
            minHeight: '400px',
            maxHeight: 'calc(100vh - 60px)',
            height: 'calc(100vh - 60px)'
          }">
            <div class="card-header bg-primary text-white">
              <div
                class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
                <h6 class="mb-1 mb-md-0">
                  Preview - {{ tipoAtivo === 'silo' ? 'Silo' : `${modeloArcoAtual ? `EDITANDO:
                  ${modelosArcos[modeloArcoAtual]?.nome || 'Modelo ' + modeloArcoAtual}` : 'Visualização Geral'}` }}
                  <span v-if="dadosVindosDoPreview" class="badge bg-success ms-2"
                    title="Dados carregados do preview do Armazém">
                    📊 PREVIEW
                  </span>
                </h6>
                <small v-if="tipoAtivo === 'armazem'" class="text-white-50">
                  {{ modeloArcoAtual ?
                    `${quantidadeModelosArcos === 1 ? 'Modelo Único' : modelosArcos[modeloArcoAtual]?.posicao || ''} |
                  ${modeloArcoAtual}/${quantidadeModelosArcos}` :
                    `${determinarModeloParaArco(arcoAtual)?.nome || 'Padrão'} | ${quantidadeModelosArcos}
                  modelo${quantidadeModelosArcos > 1 ? 's' : ''}`
                  }}
                </small>
              </div>
            </div>

            <div class="card-body text-center d-flex align-items-center justify-content-center p-1 p-md-2" :style="{
              height: isMobile ? 'auto' : 'calc(100vh - 250px)',
              overflow: isMobile ? 'visible' : 'auto',
              minHeight: isMobile ? '250px' : '300px',
              maxHeight: isMobile ? 'none' : 'calc(100vh - 250px)'
            }">
              <div class="svg-container-responsive w-100">
                <svg :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`" :style="{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: isMobile ? '60vh' : 'calc(100vh - 320px)',
                  minHeight: isMobile ? '200px' : '250px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  shapeRendering: 'geometricPrecision',
                  textRendering: 'geometricPrecision',
                  imageRendering: 'optimizeQuality'
                }" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" v-html="svgContent">
                </svg>
              </div>
            </div>

            <!-- Navegação de Arcos para Armazém -->
            <div v-if="tipoAtivo === 'armazem'" class="card-footer bg-light p-1"
              style="position: relative; z-index: 10;">
              <!-- Seletor de Configuração Salva no Preview -->
              <div class="row mb-2">
                <div class="col-12">
                  <label class="form-label small">⚙️ Modelo do Banco:</label>
                  <div class="d-flex gap-2 align-items-center">
                    <select class="form-select form-select-sm" v-model="configuracaoPreviewSelecionada"
                      @change="aplicarModeloBancoNoPreview" :disabled="carregandoModelosBanco">
                      <option value="">Configuração Padrão</option>
                      <option v-for="modelo in configsDisponiveis" :key="modelo.id_svg" :value="modelo.id_svg">
                        {{ modelo.nm_modelo }}
                      </option>
                    </select>
                    <button v-if="configuracaoPreviewSelecionada" type="button" class="btn btn-outline-secondary btn-sm"
                      @click="limparConfiguracaoPreview" title="Voltar ao padrão">
                      ×
                    </button>
                  </div>
                  <small v-if="carregandoModelosBanco" class="text-muted">Carregando modelos...</small>
                </div>
              </div>

              <!-- Mobile First: Layout para pequenas telas -->
              <div class="d-block d-md-none mobile-navigation">
                <!-- Linha 1: Navegação compacta -->
                <div class="d-flex align-items-center justify-content-center mb-2 flex-wrap gap-1 mobile-nav-buttons">
                  <button type="button" class="btn btn-outline-primary btn-sm nav-btn"
                    @click="mudarArco(Math.max(1, arcoAtual - 1), false)" :disabled="arcoAtual <= 1"
                    title="Arco anterior">
                    ←
                  </button>
                  <select class="form-select form-select-sm text-center mx-1 mobile-select" v-model.number="arcoAtual"
                    @change="mudarArco(arcoAtual, false)">
                    <option v-for="numeroArco in totalArcos" :key="numeroArco" :value="numeroArco">
                      {{ numeroArco }}
                    </option>
                  </select>
                  <button type="button" class="btn btn-outline-primary btn-sm nav-btn"
                    @click="mudarArco(Math.min(totalArcos, arcoAtual + 1), false)"
                    :disabled="arcoAtual >= totalArcos" title="Próximo arco">
                    →
                  </button>
                </div>

                <!-- Linha 2: Informações compactas -->
                <div class="text-center mobile-info">
                  <div class="mb-1">
                    <small><strong>{{ arcoAtual }}/{{ totalArcos }}</strong></small>
                    <span v-if="modeloArcoAtual" class="badge bg-warning text-dark ms-1 mobile-badge">EDIT</span>
                    <span v-if="configuracaoPreviewSelecionada"
                      class="badge bg-success text-white ms-1 mobile-badge">BANCO</span>
                  </div>
                  <div class="mb-1 d-flex justify-content-center align-items-center flex-wrap gap-1 mobile-badges">
                    <span class="badge bg-info text-white mobile-badge">
                      {{ pendulosArcoAtual }}P
                    </span>
                    <span class="badge bg-secondary text-white mobile-badge">
                      {{ sensoresArcoAtual }}S
                    </span>
                    <span :class="getBadgeClass()" style="color: white;" class="mobile-badge">
                      {{ getBadgeText() }}
                    </span>
                  </div>
                  <small class="text-muted d-block mobile-model-name">{{
                    determinarModeloParaArco(arcoAtual)?.nome || 'Modelo Padrão' }}</small>
                </div>
              </div>

              <!-- Desktop: Layout para telas médias e grandes -->
              <div class="d-none d-md-block">
                <div class="row g-1 align-items-center">
                  <!-- Navegação -->
                  <div class="col-md-4 col-lg-3">
                    <div class="d-flex align-items-center justify-content-center justify-content-lg-start">
                      <button type="button" class="btn btn-outline-primary btn-sm me-1"
                        @click="mudarArco(Math.max(1, arcoAtual - 1), false)" :disabled="arcoAtual <= 1"
                        title="Arco anterior">
                        ← Anterior
                      </button>
                      <select class="form-select form-select-sm mx-1" style="min-width: 100px; max-width: 120px;"
                        v-model.number="arcoAtual" @change="mudarArco(arcoAtual, false)">
                        <option v-for="numeroArco in totalArcos" :key="numeroArco" :value="numeroArco">
                          Arco {{ numeroArco }}
                        </option>
                      </select>
                      <button type="button" class="btn btn-outline-primary btn-sm ms-1"
                        @click="mudarArco(Math.min(totalArcos, arcoAtual + 1), false)"
                        :disabled="arcoAtual >= totalArcos" title="Próximo arco">
                        Próximo →
                      </button>
                    </div>
                  </div>

                  <!-- Informações do Arco -->
                  <div class="col-md-4 col-lg-3 text-center">
                    <div>
                      <strong class="text-nowrap">Arco {{ arcoAtual }}/{{ totalArcos }}</strong>
                      <span v-if="modeloArcoAtual" class="badge bg-warning text-dark ms-1">EDITANDO</span>
                      <span v-if="configuracaoPreviewSelecionada" class="badge bg-success text-white ms-1">BANCO</span>
                    </div>
                    <small class="text-muted d-block">{{ determinarModeloParaArco(arcoAtual)?.nome || 'Modelo Padrão'
                    }}</small>
                  </div>

                  <!-- Badges de Contadores -->
                  <div class="col-md-4 col-lg-6 text-center text-md-end">
                    <div
                      class="d-flex flex-wrap justify-content-center justify-content-md-end align-items-center gap-1">
                      <span class="badge bg-info text-white">
                        {{ pendulosArcoAtual }} Pêndulos
                      </span>
                      <span class="badge bg-secondary text-white">
                        {{ sensoresArcoAtual }} Sensores
                      </span>
                      <span :class="getBadgeClass()" style="color: white;">
                        {{ getBadgeText() }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LayoutManager from './utils/layoutManager.js'
import SeletorTipo from './compModelador/SeletorTipo.vue'
import ControlesSilo from './compModelador/ControlesSilo.vue'
import ModelosArcos from './compModelador/ModelosArcos.vue'
import PosicionamentoCabos from './compModelador/PosicionamentoCabos.vue'
import DimensoesBasicas from './compModelador/DimensoesBasicas.vue'
import ConfiguracaoTelhado from './compModelador/ConfiguracaoTelhado.vue'
import ConfiguracaoFundo from './compModelador/ConfiguracaoFundo.vue'
import ConfiguracaoSensores from './compModelador/ConfiguracaoSensores.vue'
import BotoesControle from './compModelador/BotoesControle.vue'
import GerenciadorModelosBanco from './compModelador/GerenciadorModelosBanco.vue'
import GerenciadorConfiguracoes from './compModelador/GerenciadorConfiguracoes.vue'
import { modeloSvgService } from './services/modeloSvgService.js'

export default {
  name: 'ModeladorSVG',
  components: {
    SeletorTipo,
    ControlesSilo,
    ModelosArcos,
    PosicionamentoCabos,
    DimensoesBasicas,
    ConfiguracaoTelhado,
    ConfiguracaoFundo,
    ConfiguracaoSensores,
    BotoesControle,
    GerenciadorModelosBanco,
    GerenciadorConfiguracoes
  },
  data() {
    return {
      // Estados para configurações do Silo
      configSilo: {
        lb: 200, hs: 180, hb: 15, eb: 5, escala_sensores: 16, dist_y_sensores: 12,
        pos_x_cabos_uniforme: 1, pos_x_cabo: [50, 25], pos_y_cabo: [160, 160, 160, 160, 160],
        aeradores_ativo: false, na: 4, ds: 30, dy: 0, da: 35
      },

      // Estados para configurações do Armazém
      configArmazem: {
        pb: 185, lb: 350, hb: 30, hf: 5, lf: 250, le: 15, ht: 50,
        tipo_telhado: 1, curvatura_topo: 30, pontas_redondas: false, raio_pontas: 15,
        estilo_laterais: 'reta', curvatura_laterais: 0, tipo_fundo: 0,
        altura_fundo_reto: 10, altura_funil_v: 18, posicao_ponta_v: 0,
        inclinacao_funil_v: 1, largura_abertura_v: 20, altura_duplo_v: 22,
        posicao_v_esquerdo: -1, posicao_v_direito: 1, largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3, largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0, deslocamento_vertical_fundo: -1,
        escala_sensores: 16, dist_y_sensores: 12, dist_x_sensores: 0,
        posicao_horizontal: 0, posicao_vertical: 0, afastamento_vertical_pendulo: 0
      },

      // Estados para modelos de arcos
      quantidadeModelosArcos: 1,
      modeloArcoAtual: null,
      modelosArcos: {
        1: {
          posicao: 'todos', config: {}, nome: 'Modelo Único',
          quantidadePendulos: 3, sensoresPorPendulo: { 1: 4, 2: 3, 3: 5 }
        }
      },
      modelosSalvos: {},

      // Novos estados para posicionamento de cabos
      caboSelecionadoPosicionamento: null,
      posicoesCabos: {},

      // Estados básicos sem dados de API
      arcoAtual: 1,
      totalArcos: 3,

      tipoAtivo: 'silo',
      larguraSVG: 400,
      alturaSVG: 300,
      svgContent: '',
      forceUpdateLista: 0,
      dadosVindosDoPreview: false,
      configuracaoPreviewSelecionada: '',
      configPreviewAplicada: null,
      configuracaoAplicada: null,
      modelosBanco: [],
      carregandoModelosBanco: false,

      // Modelagem Individual de Pêndulos
      modelagemIndividualAtiva: false,
      penduloSelecionado: 1,
      posicoesPendulosIndividuais: {},
      dadosPreviewDesvinculados: null,

      // Modelagem Individual de Sensores
      posicoesSensoresIndividuais: {},
      ajustesGlobaisSensores: {
        horizontal: 0,
        vertical: 0
      },

      // Estados básicos para contadores
      pendulosArcoAtual: 3,
      sensoresArcoAtual: 12
    }
  },
  computed: {
    isMobile() {
      return typeof window !== 'undefined' && window.innerWidth <= 576
    },
    configsDisponiveis() {
      return this.modelosBanco.filter(modelo => {
        if (this.tipoAtivo === 'silo') {
          return modelo.tp_svg === 'S'
        } else {
          return modelo.tp_svg === 'A'
        }
      })
    },
    modeloNome: {
      get() {
        return this.modeloArcoAtual ? this.modelosArcos[this.modeloArcoAtual]?.nome || '' : ''
      },
      set(value) {
        if (this.modeloArcoAtual) {
          this.modelosArcos[this.modeloArcoAtual].nome = value
          this.salvarModelosAutomatico()
        }
      }
    },
    modeloPosicao: {
      get() {
        return this.modeloArcoAtual ? this.modelosArcos[this.modeloArcoAtual]?.posicao || '' : ''
      },
      set(value) {
        if (this.modeloArcoAtual) {
          this.modelosArcos[this.modeloArcoAtual].posicao = value
          this.salvarModelosAutomatico()
        }
      }
    }
  },

  async mounted() {
    await this.verificarDadosArcoRecebidos()
    await this.carregarModelosDoBanco()
    if (!this.carregarEstadoModelosSalvo()) {
      this.resetarModelosParaPadrao()
    }
    this.inicializarPosicoesCabos()
    this.updateSVG()
  },

  watch: {
    'configArmazem.tipo_fundo': {
      handler(novoTipo) {
        this.configArmazem.deslocamento_vertical_fundo = this.obterDeslocamentoVerticalPadrao(novoTipo)
      }
    },
    arcoAtual() {
      if (this.tipoAtivo === 'armazem') {
        this.atualizarContadoresArco()
        this.updateSVG()
      }
    }
  },

  methods: {
    async verificarDadosArcoRecebidos() {
      try {
        if (typeof localStorage !== 'undefined') {
          const dadosArcoString = localStorage.getItem('dadosArcoParaModelador')
          const timestamp = localStorage.getItem('timestampArcoModelador')

          if (dadosArcoString && timestamp) {
            const agora = new Date().getTime()
            const timestampDados = parseInt(timestamp)
            const cincoMinutos = 5 * 60 * 1000

            if ((agora - timestampDados) < cincoMinutos) {
              const dadosArco = JSON.parse(dadosArcoString)
              this.arcoAtual = dadosArco.numeroArco || 1
              this.totalArcos = dadosArco.analiseArcos?.totalArcos || 3
              this.tipoAtivo = 'armazem'
              this.dadosVindosDoPreview = true

              localStorage.removeItem('dadosArcoParaModelador')
              localStorage.removeItem('timestampArcoModelador')
              return true
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar dados do arco recebidos:', error)
      }
      return false
    },

    onTipoChange() {
      this.limparConfiguracaoPreview()
      if (this.tipoAtivo === 'armazem' && (!this.modelosArcos || Object.keys(this.modelosArcos).length === 0)) {
        this.resetarModelosParaPadrao()
      }
      this.updateSVG()
    },

    onSiloChange() {
      this.updateSVG()
    },

    onArmazemChange() {
      this.updateSVG()
      if (this.modeloArcoAtual) {
        this.modelosArcos[this.modeloArcoAtual].config = { ...this.configArmazem }
        this.salvarModelosAutomatico()
      }
    },

    atualizarContadoresArco() {
      const modelo = this.determinarModeloParaArco(this.arcoAtual)
      if (modelo) {
        this.pendulosArcoAtual = modelo.quantidadePendulos || 3
        this.sensoresArcoAtual = Object.values(modelo.sensoresPorPendulo || {}).reduce((sum, val) => sum + val, 0) || 12
      } else {
        this.pendulosArcoAtual = 3
        this.sensoresArcoAtual = 12
      }
    },

    onQuantidadeModelosChange(event) {
      this.quantidadeModelosArcos = parseInt(event.target.value)
      const qtd = parseInt(this.quantidadeModelosArcos)
      const novosModelos = {}

      for (let i = 1; i <= qtd; i++) {
        let posicao, nome
        if (qtd === 1) { posicao = 'todos'; nome = 'Modelo Único' }
        else if (qtd === 2) { posicao = i === 1 ? 'par' : 'impar'; nome = i === 1 ? 'Modelo Par' : 'Modelo Ímpar' }
        else if (qtd === 3) {
          if (i === 1) { posicao = 'frente_fundo'; nome = 'Modelo Frente/Fundo' }
          else if (i === 2) { posicao = 'par'; nome = 'Modelo Par' }
          else { posicao = 'impar'; nome = 'Modelo Ímpar' }
        } else if (qtd === 4) {
          if (i === 1) { posicao = 'frente'; nome = 'Modelo Frente' }
          else if (i === 2) { posicao = 'par'; nome = 'Modelo Par' }
          else if (i === 3) { posicao = 'impar'; nome = 'Modelo Ímpar' }
          else { posicao = 'fundo'; nome = 'Modelo Fundo' }
        }

        const quantidadePendulos = 3 + (i % 2)
        let sensoresPorPendulo = {}
        if (this.modelosArcos[i]?.sensoresPorPendulo) {
          sensoresPorPendulo = { ...this.modelosArcos[i].sensoresPorPendulo }
        } else {
          for (let p = 1; p <= quantidadePendulos; p++) {
            sensoresPorPendulo[p] = Math.floor(Math.random() * 4) + 2
          }
        }

        novosModelos[i] = this.modelosArcos[i] || {
          posicao, config: { ...this.configArmazem }, nome,
          quantidadePendulos, sensoresPorPendulo
        }
      }

      this.modelosArcos = novosModelos
      if (this.modeloArcoAtual > qtd) {
        this.modeloArcoAtual = 1
        this.configArmazem = { ...this.modelosArcos[1].config }
      }

      this.salvarModelosAutomatico()
      this.atualizarContadoresArco()
    },

    onModeloArcoChange(event) {
      const novoModelo = parseInt(event.target.value) || null
      if (this.modeloArcoAtual && this.modeloArcoAtual !== novoModelo) {
        this.salvarModeloAtualCompleto()
      }
      this.modeloArcoAtual = novoModelo
      if (this.modeloArcoAtual) {
        this.limparVariaveisParaNovoModelo()
        this.carregarConfiguracaoModelo(this.modeloArcoAtual)
        this.inicializarPosicoesCabos()
        this.salvarModelosAutomatico()
        this.mostrarToast(`Editando ${this.modelosArcos[this.modeloArcoAtual]?.nome || `Modelo ${this.modeloArcoAtual}`}`, 'info')
      } else {
        this.limparVariaveisParaNovoModelo()
        this.aplicarConfiguracaoGeralArmazem()
      }
      this.atualizarContadoresArco()
    },

    onNomeModeloChange(event) {
      if (this.modeloArcoAtual) {
        this.modelosArcos[this.modeloArcoAtual].nome = event.target.value
        this.salvarModelosAutomatico()
      }
    },

    onPosicaoArcoChange(event) {
      if (this.modeloArcoAtual) {
        this.modelosArcos[this.modeloArcoAtual].posicao = event.target.value
        this.salvarModelosAutomatico()
      }
    },

    determinarModeloParaArco(numeroArco) {
      const totalArcos = this.totalArcos
      const quantidadeModelos = Object.keys(this.modelosArcos || {}).length

      if (!this.modelosArcos || quantidadeModelos === 0) return null

      if (quantidadeModelos === 1) return this.modelosArcos[1] || null
      if (quantidadeModelos === 2) {
        const isImpar = numeroArco % 2 === 1
        const posicaoProcurada = isImpar ? 'impar' : 'par'
        return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || this.modelosArcos[1] || null
      }
      if (quantidadeModelos === 3) {
        if (numeroArco === 1 || numeroArco === totalArcos) {
          return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === 'frente_fundo') || this.modelosArcos[1] || null
        }
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || this.modelosArcos[1] || null
      }
      if (quantidadeModelos === 4) {
        if (numeroArco === 1) return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === 'frente') || this.modelosArcos[1] || null
        if (numeroArco === totalArcos) return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === 'fundo') || this.modelosArcos[1] || null
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || this.modelosArcos[1] || null
      }
      return this.modelosArcos[1] || null
    },

    getBadgeClass() {
      const classes = ['badge']
      if (this.quantidadeModelosArcos === 1) classes.push('bg-info')
      else if (this.quantidadeModelosArcos === 2) classes.push(this.arcoAtual % 2 === 1 ? 'bg-warning' : 'bg-primary')
      else if (this.quantidadeModelosArcos === 3) {
        if (this.arcoAtual === 1 || this.arcoAtual === this.totalArcos) classes.push('bg-success')
        else classes.push(this.arcoAtual % 2 === 0 ? 'bg-primary' : 'bg-warning')
      } else if (this.quantidadeModelosArcos === 4) {
        if (this.arcoAtual === 1) classes.push('bg-success')
        else if (this.arcoAtual === this.totalArcos) classes.push('bg-danger')
        else classes.push(this.arcoAtual % 2 === 0 ? 'bg-primary' : 'bg-warning')
      }
      return classes.join(' ')
    },

    getBadgeText() {
      if (this.quantidadeModelosArcos === 1) return 'TODOS'
      else if (this.quantidadeModelosArcos === 2) return this.arcoAtual % 2 === 1 ? 'ÍMPAR' : 'PAR'
      else if (this.quantidadeModelosArcos === 3) {
        if (this.arcoAtual === 1 || this.arcoAtual === this.totalArcos) return 'F/F'
        else return this.arcoAtual % 2 === 0 ? 'PAR' : 'ÍMPAR'
      } else if (this.quantidadeModelosArcos === 4) {
        if (this.arcoAtual === 1) return 'FRENTE'
        else if (this.arcoAtual === this.totalArcos) return 'FUNDO'
        else return this.arcoAtual % 2 === 0 ? 'PAR' : 'ÍMPAR'
      }
      return 'TODOS'
    },

    mudarArco(novoArco, forcarAplicarConfiguracao = true) {
      this.arcoAtual = novoArco
      if (forcarAplicarConfiguracao && !this.modeloArcoAtual) {
        const modeloParaArco = this.determinarModeloParaArco(novoArco)
        if (modeloParaArco && modeloParaArco.config) {
          this.configArmazem = { ...modeloParaArco.config }
        }
      }
      this.atualizarContadoresArco()
      this.updateSVG()
    },

    obterDeslocamentoVerticalPadrao(tipoFundo) {
      switch (tipoFundo) {
        case 0: return 0  // Reto
        case 1: return 7  // Funil V
        case 2: return 10 // Duplo V
        default: return 0
      }
    },

    salvarModeloAtual() {
      if (!this.modeloArcoAtual) {
        this.mostrarToast('Selecione um modelo para salvar!', 'warning')
        return
      }
      this.salvarModeloAtualCompleto()
      this.mostrarToast(`Modelo ${this.modeloArcoAtual} (${this.modelosArcos[this.modeloArcoAtual]?.nome}) salvo com sucesso!`, 'success')
    },

    salvarModeloAtualCompleto() {
      if (!this.modeloArcoAtual) return
      const configuracaoModelo = {
        nome: this.modelosArcos[this.modeloArcoAtual]?.nome || `Modelo ${this.modeloArcoAtual}`,
        posicao: this.modelosArcos[this.modeloArcoAtual]?.posicao || 'todos',
        quantidadePendulos: this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3,
        sensoresPorPendulo: { ...this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {} },
        posicoesCabos: { ...this.posicoesCabos },
        ...this.configArmazem,
        caboSelecionadoPosicionamento: this.caboSelecionadoPosicionamento,
        timestampSalvamento: new Date().toISOString()
      }
      this.modelosSalvos[this.modeloArcoAtual] = true
    },

    limparVariaveisParaNovoModelo() {
      this.configArmazem = {
        pb: 185, lb: 350, hb: 30, hf: 5, lf: 250, le: 15, ht: 50,
        tipo_telhado: 1, curvatura_topo: 30, pontas_redondas: false, raio_pontas: 15,
        estilo_laterais: 'reta', curvatura_laterais: 0, tipo_fundo: 0,
        altura_fundo_reto: 10, altura_funil_v: 18, posicao_ponta_v: 0,
        inclinacao_funil_v: 1, largura_abertura_v: 20, altura_duplo_v: 22,
        posicao_v_esquerdo: -1, posicao_v_direito: 1, largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3, largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0, deslocamento_vertical_fundo: -1,
        escala_sensores: 16, dist_y_sensores: 12, dist_x_sensores: 0,
        posicao_horizontal: 0, posicao_vertical: 0, afastamento_vertical_pendulo: 0
      }
      this.posicoesCabos = {}
      this.caboSelecionadoPosicionamento = null
      this.modelagemIndividualAtiva = false
      this.penduloSelecionado = 1
      this.posicoesPendulosIndividuais = {}
      this.posicoesSensoresIndividuais = {}
      this.ajustesGlobaisSensores = { horizontal: 0, vertical: 0 }
      this.dadosPreviewDesvinculados = null
      this.configPreviewAplicada = null
      this.configuracaoAplicada = null
    },

    carregarConfiguracaoModelo(numeroModelo) {
      const modelo = this.modelosArcos[numeroModelo]
      if (!modelo) return
      if (modelo.config) this.configArmazem = { ...modelo.config }
      if (modelo.posicoesCabos) this.posicoesCabos = { ...modelo.posicoesCabos }
    },

    aplicarConfiguracaoGeralArmazem() {
      const primeiroModelo = this.modelosArcos[1]
      if (primeiroModelo?.config) {
        this.configArmazem = { ...primeiroModelo.config }
      }
    },

    resetSiloField(campo, valor) {
      this.configSilo[campo] = valor
      this.updateSVG()
    },

    resetarPadrao() {
      if (this.tipoAtivo === 'silo') {
        this.configSilo = {
          lb: 200, hs: 180, hb: 15, eb: 5, escala_sensores: 16, dist_y_sensores: 12,
          pos_x_cabos_uniforme: 1, pos_x_cabo: [50, 25], pos_y_cabo: [160, 160, 160, 160, 160],
          aeradores_ativo: false, na: 4, ds: 30, dy: 0, da: 35
        }
      } else {
        this.resetarModelosParaPadrao()
      }
      this.updateSVG()
    },

    resetarModelosParaPadrao() {
      const configPadrao = {
        pb: 185, lb: 350, hb: 30, hf: 5, lf: 250, le: 15, ht: 50,
        tipo_telhado: 1, curvatura_topo: 30, pontas_redondas: false, raio_pontas: 15,
        estilo_laterais: 'reta', curvatura_laterais: 0, tipo_fundo: 0,
        altura_fundo_reto: 10, altura_funil_v: 18, posicao_ponta_v: 0,
        inclinacao_funil_v: 1, largura_abertura_v: 20, altura_duplo_v: 22,
        posicao_v_esquerdo: -1, posicao_v_direito: 1, largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3, largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0, deslocamento_vertical_fundo: -1,
        escala_sensores: 16, dist_y_sensores: 12, dist_x_sensores: 0,
        posicao_horizontal: 0, posicao_vertical: 0, afastamento_vertical_pendulo: 0
      }
      this.configArmazem = { ...configPadrao }
      this.quantidadeModelosArcos = 1
      this.modelosArcos = {
        1: {
          posicao: 'todos', config: { ...configPadrao }, nome: 'Modelo Único',
          quantidadePendulos: 3, sensoresPorPendulo: { 1: 3, 2: 3, 3: 3 }
        }
      }
      this.modeloArcoAtual = null
      this.modelosSalvos = {}
      this.caboSelecionadoPosicionamento = null
      this.posicoesCabos = {}
      this.atualizarContadoresArco()
    },

    mostrarToast(mensagem, tipo = 'info') {
      const toast = document.createElement('div')
      const icones = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
      const cores = { success: '#28a745', error: '#dc3545', warning: '#ffc107', info: '#17a2b8' }
      toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: ${cores[tipo] || cores.info};
        color: ${tipo === 'warning' ? '#000' : '#fff'}; padding: 12px 16px; border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 99999; font-size: 14px;
        max-width: 350px; word-wrap: break-word; animation: slideIn 0.3s ease-out;
      `
      toast.innerHTML = `${icones[tipo] || icones.info} ${mensagem}`
      const style = document.createElement('style')
      style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }'
      document.head.appendChild(style)
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse'
        setTimeout(() => {
          if (toast.parentNode) toast.remove()
          if (style.parentNode) style.remove()
        }, 300)
      }, 4000)
    },

    async carregarModelosDoBanco() {
      if (this.carregandoModelosBanco) return
      this.carregandoModelosBanco = true
      try {
        const response = await modeloSvgService.buscarModelos()
        if (response && response.data) {
          this.modelosBanco = Array.isArray(response.data) ? response.data : []
        } else {
          this.modelosBanco = []
        }
      } catch (error) {
        console.error('Erro ao carregar modelos do banco:', error)
        this.modelosBanco = []
      } finally {
        this.carregandoModelosBanco = false
      }
    },

    async aplicarModeloBancoNoPreview() {
      this.limparConfiguracaoPreview()
    },

    limparConfiguracaoPreview() {
      this.configuracaoPreviewSelecionada = ''
      this.configPreviewAplicada = null
      this.updateSVG()
    },

    calcularDimensoesSVG() {
      if (this.tipoAtivo === 'silo') {
        this.larguraSVG = this.configSilo.lb + (this.configSilo.aeradores_ativo ? this.configSilo.ds * 2 + 68 : 0)
        this.alturaSVG = this.configSilo.hs + this.configSilo.hb * 1.75
      } else {
        const config = this.configPreviewAplicada || this.configArmazem
        const larguraBase = Math.max(config.lb, 300)
        const alturaFundo = config.pb + 20
        const alturaTopoNecessaria = 80
        const alturaTotal = alturaFundo + alturaTopoNecessaria
        let extensaoFundo = 0
        if (config.tipo_fundo === 1) extensaoFundo = config.altura_funil_v || 40
        else if (config.tipo_fundo === 2) extensaoFundo = config.altura_duplo_v || 35
        const alturaFinal = Math.max(alturaTotal + extensaoFundo, 280)
        this.larguraSVG = larguraBase
        this.alturaSVG = alturaFinal
      }
    },

    generateSVG() {
      if (this.tipoAtivo === 'silo') {
        this.svgContent = this.renderSilo()
      } else {
        this.svgContent = this.renderArmazem() + this.renderSensoresArmazem()
      }
    },

    renderSilo() {
      const { lb, hs, hb, eb } = this.configSilo
      const p1 = [0, hs], p2 = [lb, hs], p3 = [lb, hb * 1.75], p4 = [lb / 2, 0], p5 = [0, hb * 1.75]
      const points = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`
      const transformSilo = this.configSilo.aeradores_ativo ? `translate(${this.configSilo.ds + 34}, 0)` : ""
      let svg = `
        <style>.sensor-element, .pendulo-element, text, rect { transition: all 0.15s ease-out; }</style>
        <g transform="${transformSilo}">
          <polygon fill="#E7E7E7" points="${points}" />
          <path fill="#999999" d="M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z" transform="scale(${lb / 152}, ${hb / 15})" />
          <ellipse fill="#999999" cx="${lb / 2}" cy="${hs}" rx="${lb / 2}" ry="${hb}" />
          <ellipse fill="#CCCCCC" cx="${lb / 2}" cy="${hs - eb}" rx="${lb / 2}" ry="${hb}" />
        </g>
      `
      if (this.configSilo.aeradores_ativo) svg += this.renderAeradoresSilo()
      return svg
    },

    renderAeradoresSilo() {
      const { na, ds, dy, da, lb, hs } = this.configSilo
      const posY = hs + dy - 30
      const posX = lb + ds * 2 - 31
      let aeradores = ''
      const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
      const angles = [0, 60, 120, 180, 240, 300]
      for (let id = 1; id <= na; id++) {
        let transform = ""
        if (id === 1) transform = `translate(-73, ${posY})`
        else if (id === 2) transform = `translate(${posX}, ${posY})`
        else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`
        else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`
        else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`
        else if (id === 6) transform = `translate(${posX}, ${posY - 70 - da * 2})`
        aeradores += `
          <g transform="${transform}">
            <circle cx="${70 + 12.5 + 3.5}" cy="24" r="10" fill="#c5c5c5" />
            <rect x="${70 + 3.5}" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
            <text x="${70 + 12.5 + 3.5}" y="7" text-anchor="middle" dominant-baseline="central" font-weight="bold" font-size="6.5" font-family="Arial" fill="white">AE-${id}</text>
            <g>${angles.map(angle => `<path d="${dBlade}" fill="white" ${angle === 0 ? '' : `transform="rotate(${angle},86.35,24.05)"`}/>`).join('')}</g>
          </g>`
      }
      return aeradores
    },

    renderArmazem() {
      return `<style>.sensor-element, .pendulo-element, text, rect { transition: all 0.15s ease-out; }</style>` + this.renderTelhado() + this.renderFundoArmazem()
    },

    renderTelhado() {
      const config = this.configPreviewAplicada || this.configArmazem
      const { tipo_telhado, curvatura_topo, pb, lb, hb, hf, lf, le, ht, tipo_fundo, pontas_redondas, raio_pontas, estilo_laterais, curvatura_laterais } = config
      if (tipo_telhado === 1) {
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) extensao = 7
        const alturaTopo = Math.max(10, 50 - (curvatura_topo || 30))
        const p1 = [(lb - lf) / 2, pb - hf + extensao], p2 = [le, pb - hb + extensao], p3 = [le, pb - ht], p4 = [lb / 2, alturaTopo], p5 = [lb - le, pb - ht], p6 = [lb - le, pb - hb + extensao], p7 = [lb - (lb - lf) / 2, pb - hf + extensao]
        const pathTelhado = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')}`
        return `<polygon fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" points="${pathTelhado}" />`
      }
      return ''
    },

    renderFundoArmazem() {
      const config = this.configPreviewAplicada || this.configArmazem
      const { tipo_fundo, pb, lb, lf, altura_fundo_reto } = config
      if (tipo_fundo === 0) {
        const p1 = [(lb - lf) / 2, pb], p2 = [(lb - lf) / 2, pb + altura_fundo_reto], p3 = [lb - (lb - lf) / 2, pb + altura_fundo_reto], p4 = [lb - (lb - lf) / 2, pb]
        const pathFundo = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')}`
        return `<polygon fill="#D0D0D0" stroke="#999999" stroke-width="1.5" points="${pathFundo}" />`
      }
      return ''
    },

    renderSensoresArmazem() {
      const modelo = this.determinarModeloParaArco(this.arcoAtual)
      if (!modelo) return ''
      const config = this.configPreviewAplicada || this.configArmazem
      const escala_sensores = config.escala_sensores || 16
      const dist_y_sensores = config.dist_y_sensores || 12
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0
      const pb = config.pb || 185
      const yPendulo = pb + 15 + posicao_vertical
      let elementos = ''
      const quantidadePendulos = modelo.quantidadePendulos || 3
      const sensoresPorPendulo = modelo.sensoresPorPendulo || {}
      const larguraTotal = config.lb || 350
      const margemLateral = 35
      const larguraUtilizavel = larguraTotal - (2 * margemLateral)

      for (let i = 0; i < quantidadePendulos; i++) {
        const numeroPendulo = i + 1
        let xCabo
        if (quantidadePendulos === 1) {
          xCabo = larguraTotal / 2
        } else {
          const espacamento = larguraUtilizavel / (quantidadePendulos - 1)
          xCabo = margemLateral + (i * espacamento)
        }
        xCabo += posicao_horizontal

        // Retângulo do pêndulo
        elementos += `
          <rect x="${xCabo - escala_sensores / 2}" y="${yPendulo}" width="${escala_sensores}" height="${escala_sensores / 2}" rx="2" ry="2" fill="#3A78FD" />
          <text x="${xCabo}" y="${yPendulo + escala_sensores / 4}" text-anchor="middle" dominant-baseline="central" font-weight="bold" font-size="${escala_sensores * 0.4 - 0.5}" font-family="Arial" fill="white">P${numeroPendulo}</text>
        `
        // Sensores do pêndulo
        const qtdSensores = sensoresPorPendulo[numeroPendulo] || 3
        for (let s = 1; s <= qtdSensores; s++) {
          const ySensor = yPendulo - dist_y_sensores * s - 25
          const temp = 20 + Math.random() * 10
          elementos += `
            <rect x="${xCabo - escala_sensores / 2}" y="${ySensor}" width="${escala_sensores}" height="${escala_sensores / 2}" rx="2" ry="2" fill="#07fc03" stroke="black" stroke-width="1" />
            <text x="${xCabo}" y="${ySensor + escala_sensores / 4}" text-anchor="middle" dominant-baseline="central" font-size="${escala_sensores * 0.4 - 0.5}" font-family="Arial" fill="black">${temp.toFixed(1)}</text>
            <text x="${xCabo - escala_sensores / 2 - 2}" y="${ySensor + escala_sensores / 4}" text-anchor="end" dominant-baseline="central" font-size="${escala_sensores * 0.4 - 1.5}" font-family="Arial" fill="black">S${s}</text>
          `
        }
      }
      return elementos
    }
  }
}
</script>

<style>
/* Mobile navigation styles */
.mobile-navigation .mobile-nav-buttons .nav-btn {
  min-width: 35px;
  padding: 0.25rem 0.5rem;
}

.mobile-navigation .mobile-select {
  max-width: 80px;
}

.mobile-navigation .mobile-info .mobile-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
}

.mobile-navigation .mobile-model-name {
  font-size: 0.75rem;
}

/* Responsive improvements */
@media (max-width: 576px) {
  .modelador-painel-controles {
    border-right: none !important;
    border-bottom: 2px solid #dee2e6;
  }
}

.svg-container-responsive {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
