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
                    <option v-for="numeroArco in analiseArcos.totalArcos" :key="numeroArco" :value="numeroArco">
                      {{ numeroArco }}
                    </option>
                  </select>
                  <button type="button" class="btn btn-outline-primary btn-sm nav-btn"
                    @click="mudarArco(Math.min(analiseArcos.totalArcos, arcoAtual + 1), false)"
                    :disabled="arcoAtual >= analiseArcos.totalArcos" title="Próximo arco">
                    →
                  </button>
                </div>

                <!-- Linha 2: Informações compactas -->
                <div class="text-center mobile-info">
                  <div class="mb-1">
                    <small><strong>{{ arcoAtual }}/{{ analiseArcos.totalArcos }}</strong></small>
                    <span v-if="modeloArcoAtual" class="badge bg-warning text-dark ms-1 mobile-badge">EDIT</span>
                    <span v-if="configuracaoPreviewSelecionada"
                      class="badge bg-success text-white ms-1 mobile-badge">BANCO</span>
                  </div>
                  <div class="mb-1 d-flex justify-content-center align-items-center flex-wrap gap-1 mobile-badges">
                    <span class="badge bg-info text-white mobile-badge">
                      {{ analiseArcos.arcos[arcoAtual]?.totalPendulos || 0 }}P
                    </span>
                    <span class="badge bg-secondary text-white mobile-badge">
                      {{ analiseArcos.arcos[arcoAtual]?.totalSensores || 0 }}S
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
                        <option v-for="numeroArco in analiseArcos.totalArcos" :key="numeroArco" :value="numeroArco">
                          Arco {{ numeroArco }}
                        </option>
                      </select>
                      <button type="button" class="btn btn-outline-primary btn-sm ms-1"
                        @click="mudarArco(Math.min(analiseArcos.totalArcos, arcoAtual + 1), false)"
                        :disabled="arcoAtual >= analiseArcos.totalArcos" title="Próximo arco">
                        Próximo →
                      </button>
                    </div>
                  </div>

                  <!-- Informações do Arco -->
                  <div class="col-md-4 col-lg-3 text-center">
                    <div>
                      <strong class="text-nowrap">Arco {{ arcoAtual }}/{{ analiseArcos.totalArcos }}</strong>
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
                        {{ analiseArcos.arcos[arcoAtual]?.totalPendulos || 0 }} Pêndulos
                      </span>
                      <span class="badge bg-secondary text-white">
                        {{ analiseArcos.arcos[arcoAtual]?.totalSensores || 0 }} Sensores
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

      // Estados para configurações do Armazém
      configArmazem: {
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

      // Estados para modelos de arcos
      quantidadeModelosArcos: 1,
      modeloArcoAtual: null,
      modelosArcos: {
        1: {
          posicao: 'todos',
          config: {},
          nome: 'Modelo Único',
          quantidadePendulos: 3, // Padrão alterado para 3 pêndulos
          sensoresPorPendulo: {
            1: 4, // Pêndulo 1 tem 4 sensores
            2: 3, // Pêndulo 2 tem 3 sensores
            3: 5  // Pêndulo 3 tem 5 sensores
          }
        }
      },
      modelosSalvos: {},

      // Novos estados para posicionamento de cabos
      caboSelecionadoPosicionamento: null,
      posicoesCabos: {},

      // Estados para dados do JSON
      dados: null,
      dadosPortal: null,
      arcoAtual: 1,
      analiseArcos: null,
      layoutsAutomaticos: null,

      tipoAtivo: 'silo',
      nomeConfiguracao: '',
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

      // NOVOS ESTADOS REATIVOS ADICIONADOS PARA CORREÇÃO DE ERRO
      modelosAtualizados: false, // Indica se houve alterações nos modelos que precisam ser salvas
      modelosConfigurados: {}, // Armazena configurações de modelos individuais
      quantidadeEsperada: 1, // Quantidade esperada de modelos
      temConfigGlobal: true, // Flag para indicar se há configuração global
      modelos: {} // Armazena os dados dos modelos
    }
  },
  computed: {
    isMobile() {
      return typeof window !== 'undefined' && window.innerWidth <= 576
    },
    configsDisponiveis() {
      // Retornar modelos do banco filtrados por tipo
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
  created() {
    // Inicialização sem debounce
  },

  async mounted() {
    await this.verificarDadosArcoRecebidos()
    await this.carregarDadosAPI()
    await this.carregarModelosDoBanco()

    // Tentar carregar estado dos modelos salvo anteriormente
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
    dados: {
      handler() {
        if (this.tipoAtivo === 'armazem' && this.dados) {
          // Aguardar um pouco mais para garantir que o SVG foi renderizado
          setTimeout(() => {
            this.atualizarSensores()
          }, 100)
        }
      },
      deep: true
    },
    arcoAtual() {
      if (this.tipoAtivo === 'armazem') {
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

          // Verificar se os dados são recentes (menos de 5 minutos)
          if (dadosArcoString && timestamp) {
            const agora = new Date().getTime()
            const timestampDados = parseInt(timestamp)
            const cincoMinutos = 5 * 60 * 1000

            if ((agora - timestampDados) < cincoMinutos) {
              const dadosArco = JSON.parse(dadosArcoString)

              // Usar os dados recebidos
              this.dadosPortal = dadosArco.dadosPortal
              this.analiseArcos = dadosArco.analiseArcos
              this.layoutsAutomaticos = dadosArco.layoutsAutomaticos
              this.dados = dadosArco.dadosConvertidos
              this.arcoAtual = dadosArco.numeroArco

              // Forçar tipo armazém
              this.tipoAtivo = 'armazem'

              // Marcar que os dados vieram do preview
              this.dadosVindosDoPreview = true

              // Limpar dados do localStorage após usar
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

    async carregarDadosAPI() {
      try {
        // Se já recebeu dados do preview, não precisar recarregar
        const dadosRecebidos = await this.verificarDadosArcoRecebidos()
        if (dadosRecebidos) {
          console.log('Usando dados recebidos do preview, pulando inicialização padrão')
          return
        }

        // Para o modelador de armazém, usar dados exemplares ao invés da API
        if (this.tipoAtivo === 'armazem') {
          this.criarDadosExemplaresArmazem()
          return
        }

        const response = await fetch('https://cloud.pce-eng.com.br/cloud/api/public/api/armazem/buscardado/130?celula=1&leitura=1&data=2025-08-13%2008:03:47', {
          headers: {
            'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0L2Nsb3VkL2FwaS9wdWJsaWMvYXBpL2xvZ2luIiwiaWF0IjoxNzU1NjAxOTM4LCJleHAiOjE3NTY4MTE1MzgsIm5iZiI6MTc1NTYwMTkzOCwianRpIjoid2xsMU1DQlV6ZUlPUjBpQSIsInN1YiI6IjEzIiwicHJ2IjoiNTg3MDg2M2Q0YTYyZDc5MTQ0M2ZhZjkzNmZjMzY4MDMxZDExMGM0ZiIsInVzZXIiOnsiaWRfdXN1YXJpbyI6MTMsIm5tX3VzdWFyaW8iOiJJdmFuIEphY3F1ZXMiLCJlbWFpbCI6Iml2YW4uc2lsdmFAcGNlLWVuZy5jb20uYnIiLCJ0ZWxlZm9uZSI6bnVsbCwiY2VsdWxhciI6bnVsbCwic3RfdXN1YXJpbyI6IkEiLCJpZF9pbWFnZW0iOjM4LCJsb2dhZG8iOiJTIiwidXN1YXJpb3NfcGVyZmlzIjpbeyJpZF9wZXJmaWwiOjEwLCJubV9wZXJmaWwiOiJBZG1pbmlzdHJhZG9yIGRvIFBvcnRhbCIsImNkX3BlcmZpbCI6IkFETUlOUE9SVEEiLCJ0cmFuc2Fjb2VzIjpbXX1dLCJpbWFnZW0iOnsiaWRfaW1hZ2VtIjozOCwidHBfaW1hZ2VtIjoiVSIsImRzX2ltYWdlbSI6bnVsbCwiY2FtaW5obyI6InVwbG9hZHMvdXN1YXJpb3MvMTcyOTc3MjA3OV9yYl80NzA3LnBuZyIsImV4dGVuc2FvIjoicG5nIn19fQ.17k5NPdmmKvNtUEJ1GmCNYuYSFtayYedzESRU-Vta50',
            'Content-Type': 'application/json'
          },
          timeout: 15000
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados da API: ${response.status} - ${response.statusText}`)
        }

        const data = await response.json()

        if (!data) {
          throw new Error('Resposta da API vazia')
        }

        // Armazenar dados originais da API
        this.dadosPortal = data

        // Analisar estrutura dos arcos baseada na nova estrutura da API
        const analise = this.analisarEstruturaArcos(data)
        this.analiseArcos = analise

        // Gerar layouts automaticos
        const layouts = LayoutManager.gerarLayoutAutomatico(analise)
        this.layoutsAutomaticos = layouts
        // Calcular dimensões ideais
        const dimensoes = this.calcularDimensoesIdeais(analise)
        this.dimensoesSVG = dimensoes
        // Converter dados para formato de renderização
        const dadosConvertidos = this.converterDadosParaRenderizacao(data, 1)
        this.dados = dadosConvertidos
      } catch (error) {
        console.error('Erro ao carregar dados da API:', error)
        this.error = this.tratarErroAPI(error)
      }
    },

    criarDadosExemplaresArmazem() {
      // Gerar dados exemplares baseados na configuração atual de modelos
      const dadosExemplo = { arcos: {} }

      // Determinar quantos arcos criar (padrão 3 se não há análise)
      const totalArcos = this.analiseArcos?.totalArcos || 3

      for (let arco = 1; arco <= totalArcos; arco++) {
        dadosExemplo.arcos[arco] = {}

        // Determinar modelo para este arco
        const modeloParaArco = this.determinarModeloParaArco(arco)

        // Usar configuração do modelo ou padrão
        let quantidadePendulos = 3
        let sensoresPorPendulo = { 1: 4, 2: 3, 3: 5 }

        if (modeloParaArco) {
          quantidadePendulos = modeloParaArco.quantidadePendulos || 3
          sensoresPorPendulo = modeloParaArco.sensoresPorPendulo || {}
        }

        // Gerar dados para cada pêndulo baseado na configuração
        for (let pendulo = 1; pendulo <= quantidadePendulos; pendulo++) {
          dadosExemplo.arcos[arco][pendulo] = {}

          // Determinar quantidade de sensores para este pêndulo
          const qtdSensores = sensoresPorPendulo[pendulo] || Math.floor(Math.random() * 4) + 2 // 2-5 sensores se não definido

          // Gerar temperaturas aleatórias entre 10°C e 40°C para cada sensor
          for (let sensor = 1; sensor <= qtdSensores; sensor++) {
            // Temperatura aleatória entre 10 e 40 graus Celsius
            const temperaturaAleatoria = Math.random() * 30 + 10 // 10 + (0 a 30)
            const temperaturaFormatada = Math.round(temperaturaAleatoria * 10) / 10 // Arredondar para 1 casa decimal

            // Formato: [temp, pontoQuente, preAlarme, falha, nivel]
            dadosExemplo.arcos[arco][pendulo][sensor] = [
              temperaturaFormatada,
              false, // pontoQuente
              false, // preAlarme
              false, // falha
              true   // nivel (sensor ativo)
            ]
          }
        }
      }

      // Armazenar dados originais
      this.dadosPortal = dadosExemplo

      // Analisar estrutura dos arcos
      const analise = this.analisarEstruturaArcos(dadosExemplo)
      this.analiseArcos = analise

      // Gerar layouts automaticos
      const layouts = LayoutManager.gerarLayoutAutomatico(analise)
      this.layoutsAutomaticos = layouts

      // Calcular dimensões ideais
      const dimensoes = this.calcularDimensoesIdeais(analise)
      this.dimensoesSVG = dimensoes

      // Converter dados para formato de renderização
      const dadosConvertidos = this.converterDadosParaRenderizacao(dadosExemplo, 1)
      this.dados = dadosConvertidos

      console.log('Dados exemplares criados para o armazém:', {
        analise,
        layouts,
        dimensoes,
        dadosConvertidos
      })
    },

    // Analisar estrutura dos arcos baseada na nova estrutura da API
    analisarEstruturaArcos(dados) {

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

      // Processar cada arco
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

        // Processar cada pêndulo no arco
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

        // Ordenar pêndulos por número
        infoArco.pendulos.sort((a, b) => a.numero - b.numero)

        estrutura.arcos[arcoNum] = infoArco
        estrutura.estatisticas.totalPendulos += infoArco.totalPendulos
        estrutura.estatisticas.totalSensores += infoArco.totalSensores
      })
      return estrutura
    },

    // Converter dados da API para formato de renderização
    converterDadosParaRenderizacao(dadosAPI, numeroArco) {

      if (!dadosAPI.arcos || !dadosAPI.arcos[numeroArco]) {
        return { leitura: {} }
      }

      const dadosArco = dadosAPI.arcos[numeroArco]
      const leituraConvertida = {}

      // Converter estrutura: arcos[numeroArco][pendulo][sensor] -> leitura[pendulo][sensor]
      Object.keys(dadosArco).forEach(numeroPendulo => {
        const sensoresPendulo = dadosArco[numeroPendulo]
        leituraConvertida[numeroPendulo] = {}

        Object.keys(sensoresPendulo).forEach(numeroSensor => {
          const dadosSensor = sensoresPendulo[numeroSensor]
          // Manter o formato original do sensor: [temp, pontoQuente, preAlarme, falha, nivel]
          leituraConvertida[numeroPendulo][numeroSensor] = dadosSensor
        })
      })

      const resultado = {
        leitura: leituraConvertida,
        arcoAtual: numeroArco,
        timestamp: new Date().toISOString()
      }

      return resultado
    },

    criarEstruturaMinima() {
      return {
        totalArcos: 1,
        arcos: {
          1: {
            numero: 1,
            totalPendulos: 1,
            totalSensores: 1,
            pendulos: [{ numero: 1, totalSensores: 1 }]
          }
        },
        estatisticas: {
          totalPendulos: 1,
          totalSensores: 1
        }
      }
    },

    tratarErroAPI(error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            return 'Token de autenticação inválido ou expirado. Verifique as credenciais.'
          case 403:
            return 'Acesso negado. Verifique as permissões do token.'
          case 404:
            return 'Endpoint da API não encontrado. Verifique a URL.'
          case 500:
            return 'Erro interno do servidor. Tente novamente mais tarde.'
          default:
            return `Erro HTTP ${error.response.status}: ${error.response.statusText}`
        }
      } else if (error.request) {
        return 'Erro de conectividade. Verifique sua conexão com a internet.'
      } else {
        return error.message || 'Erro desconhecido ao carregar dados.'
      }
    },

    // Calcular dimensões ideais do SVG baseado na análise de todos os arcos
    calcularDimensoesIdeais(analiseArcos) {
      if (!analiseArcos) return { largura: 350, altura: 200 }

      let maxSensores = 0
      let maxPendulos = 0

      // Encontrar o máximo de sensores e pêndulos em todos os arcos
      Object.values(analiseArcos.arcos).forEach(arco => {
        maxPendulos = Math.max(maxPendulos, arco.totalPendulos)
        arco.pendulos.forEach(pendulo => {
          maxSensores = Math.max(maxSensores, pendulo.totalSensores)
        })
      })

      const escala_sensores = 16
      const dist_y_sensores = 12
      const margemSuperior = 30
      const margemInferior = 50
      const margemPendulo = 20

      const alturaBaseTelhado = 185
      const alturaSensores = maxSensores * dist_y_sensores + escala_sensores
      const alturaTotal = Math.max(
        alturaBaseTelhado,
        margemSuperior + alturaSensores + margemInferior + margemPendulo
      )

      const larguraMinima = 350
      const espacamentoPendulo = 50
      const larguraCalculada = Math.max(larguraMinima, (maxPendulos * espacamentoPendulo) + 100)

      return {
        largura: larguraCalculada,
        altura: Math.max(alturaTotal, 250)
      }
    },

    onTipoChange() {
      console.log('🔄 [onTipoChange] Mudando tipo para:', this.tipoAtivo)

      // Recarregar modelos do banco quando mudar o tipo
      this.carregarModelosDoBanco()
      // Limpar configuração preview se aplicada
      this.limparConfiguracaoPreview()

      // Se mudou para armazém e não tem dados, criar dados exemplares
      if (this.tipoAtivo === 'armazem') {
        if (!this.dadosPortal || !this.analiseArcos || !this.layoutsAutomaticos) {
          console.log('📊 [onTipoChange] Criando dados exemplares para armazém')
          this.criarDadosExemplaresArmazem()
        }
        // Garantir que o modelo padrão esteja configurado
        if (!this.modelosArcos || Object.keys(this.modelosArcos).length === 0) {
          this.resetarModelosParaPadrao()
        }
      }

      // Forçar atualização do SVG
      this.$nextTick(() => {
        this.updateSVG()
        console.log('✅ [onTipoChange] SVG atualizado para tipo:', this.tipoAtivo)
      })
    },

    onSiloChange() {
      this.updateSVG()
    },

    onArmazemChange() {
      this.updateSVG()
      // Atualizar modelo atual se estiver selecionado
      if (this.modeloArcoAtual) {
        this.modelosArcos[this.modeloArcoAtual].config = { ...this.configArmazem }
        this.salvarModelosAutomatico()
      }
    },

    onQuantidadeModelosChange(event) {
      this.quantidadeModelosArcos = parseInt(event.target.value)
      const qtd = parseInt(this.quantidadeModelosArcos)
      const novosModelos = {}

      for (let i = 1; i <= qtd; i++) {
        let posicao, nome

        if (qtd === 1) {
          posicao = 'todos'
          nome = 'Modelo Único'
        } else if (qtd === 2) {
          if (i === 1) {
            posicao = 'par'
            nome = 'Modelo Par'
          } else {
            posicao = 'impar'
            nome = 'Modelo Ímpar'
          }
        } else if (qtd === 3) {
          if (i === 1) {
            posicao = 'frente_fundo'
            nome = 'Modelo Frente/Fundo'
          } else if (i === 2) {
            posicao = 'par'
            nome = 'Modelo Par'
          } else {
            posicao = 'impar'
            nome = 'Modelo Ímpar'
          }
        } else if (qtd === 4) {
          if (i === 1) {
            posicao = 'frente'
            nome = 'Modelo Frente'
          } else if (i === 2) {
            posicao = 'par'
            nome = 'Modelo Par'
          } else if (i === 3) {
            posicao = 'impar'
            nome = 'Modelo Ímpar'
          } else {
            posicao = 'fundo'
            nome = 'Modelo Fundo'
          }
        }

        const quantidadePendulos = this.analiseArcos?.arcos[i]?.totalPendulos || 3
        // Criar configuração padrão de sensores por pêndulo se não existir
        let sensoresPorPendulo = {}
        if (this.modelosArcos[i]?.sensoresPorPendulo) {
          sensoresPorPendulo = { ...this.modelosArcos[i].sensoresPorPendulo }
        } else {
          // Criar configuração baseada nos dados exemplares se disponível
          for (let p = 1; p <= quantidadePendulos; p++) {
            const sensoresDoArco = this.analiseArcos?.arcos[i]?.pendulos?.find(pend => pend.numero === p)?.totalSensores
            sensoresPorPendulo[p] = sensoresDoArco || Math.floor(Math.random() * 4) + 2 // 2-5 sensores aleatório
          }
        }

        novosModelos[i] = this.modelosArcos[i] || {
          posicao,
          config: { ...this.configArmazem },
          nome,
          quantidadePendulos,
          sensoresPorPendulo
        }
      }

      this.modelosArcos = novosModelos

      // Se o modelo atual não existe mais, voltar para o primeiro
      if (this.modeloArcoAtual > qtd) {
        this.modeloArcoAtual = 1
        this.configArmazem = { ...this.modelosArcos[1].config }
      }

      this.salvarModelosAutomatico()
    },

    onModeloArcoChange(event) {
      const novoModelo = parseInt(event.target.value) || null

      // Se estava editando um modelo antes, salvar as alterações
      if (this.modeloArcoAtual && this.modeloArcoAtual !== novoModelo) {
        this.salvarModeloAtualCompleto()
      }

      this.modeloArcoAtual = novoModelo

      if (this.modeloArcoAtual) {
        // Limpar todas as variáveis para começar do zero
        this.limparVariaveisParaNovoModelo()

        // Carregar configuração do modelo selecionado
        this.carregarConfiguracaoModelo(this.modeloArcoAtual)

        // Inicializar posições dos cabos para o modelo selecionado
        this.inicializarPosicoesCabos()

        this.salvarModelosAutomatico()

        // Automação: navegar para arco representativo do modelo selecionado
        if (this.analiseArcos && this.modelosArcos[this.modeloArcoAtual]) {
          const posicaoModelo = this.modelosArcos[this.modeloArcoAtual].posicao
          const totalArcos = this.analiseArcos.totalArcos
          let arcoRepresentativo = 1

          if (this.quantidadeModelosArcos === 1) {
            arcoRepresentativo = this.arcoAtual
          } else if (this.quantidadeModelosArcos === 2) {
            if (posicaoModelo === 'impar') {
              arcoRepresentativo = 1
            } else if (posicaoModelo === 'par') {
              arcoRepresentativo = 2
            }
          } else if (this.quantidadeModelosArcos === 3) {
            if (posicaoModelo === 'frente_fundo') {
              arcoRepresentativo = 1
            } else if (posicaoModelo === 'par') {
              arcoRepresentativo = 2
            } else if (posicaoModelo === 'impar') {
              arcoRepresentativo = 3
            }
          } else if (this.quantidadeModelosArcos === 4) {
            if (posicaoModelo === 'frente') {
              arcoRepresentativo = 1
            } else if (posicaoModelo === 'par') {
              arcoRepresentativo = 2
            } else if (posicaoModelo === 'impar') {
              arcoRepresentativo = 3
            } else if (posicaoModelo === 'fundo') {
              arcoRepresentativo = totalArcos
            }
          }

          arcoRepresentativo = Math.max(1, Math.min(totalArcos, arcoRepresentativo))

          if (arcoRepresentativo !== this.arcoAtual) {
            this.mudarArco(arcoRepresentativo)
          }
        }

        // Mostrar feedback visual sobre o modelo sendo editado
        this.mostrarToast(`Editando ${this.modelosArcos[this.modeloArcoAtual]?.nome || `Modelo ${this.modeloArcoAtual}`}`, 'info')
      } else {
        // Se desmarcou modelo, voltar ao estado geral
        this.limparVariaveisParaNovoModelo()
        this.aplicarConfiguracaoGeralArmazem()
      }
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

    getDescricaoModelo(modeloNum) {
      if (this.quantidadeModelosArcos === 1) {
        return 'todos'
      } else if (this.quantidadeModelosArcos === 2) {
        return modeloNum === 1 ? 'par' : 'impar'
      } else if (this.quantidadeModelosArcos === 3) {
        if (modeloNum === 1) return 'frente/fundo'
        else if (modeloNum === 2) return 'par'
        else return 'impar'
      } else if (this.quantidadeModelosArcos === 4) {
        if (modeloNum === 1) return 'frente'
        else if (modeloNum === 2) return 'par'
        else if (modeloNum === 3) return 'impar'
        else return 'fundo'
      }
      return ''
    },

    determinarPosicaoDoModelo(numeroModelo, quantidadeModelos) {
      if (quantidadeModelos === 1) {
        return 'todos'
      } else if (quantidadeModelos === 2) {
        return numeroModelo === 1 ? 'par' : 'impar'
      } else if (quantidadeModelos === 3) {
        if (numeroModelo === 1) return 'frente_fundo'
        else if (numeroModelo === 2) return 'par'
        else return 'impar'
      } else if (quantidadeModelos === 4) {
        if (numeroModelo === 1) return 'frente'
        else if (numeroModelo === 2) return 'par'
        else if (numeroModelo === 3) return 'impar'
        else return 'fundo'
      }
      return 'todos'
    },

    determinarModeloParaArco(numeroArco) {
      const totalArcos = this.analiseArcos?.totalArcos || 1
      const quantidadeModelos = Object.keys(this.modelosArcos || {}).length

      if (!this.modelosArcos || quantidadeModelos === 0) {
        return null
      }

      // 1 modelo: todos os arcos usam o mesmo modelo
      if (quantidadeModelos === 1) {
        return this.modelosArcos[1] || null
      }

      // 2 modelos: começa com ímpar (1º, 3º, 5º...), depois par (2º, 4º, 6º...)
      if (quantidadeModelos === 2) {
        const isImpar = numeroArco % 2 === 1
        const posicaoProcurada = isImpar ? 'impar' : 'par'
        return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || this.modelosArcos[1] || null
      }

      // 3 modelos: 1º e último = frente_fundo, depois par e ímpar intercalados
      if (quantidadeModelos === 3) {
        if (numeroArco === 1 || numeroArco === totalArcos) {
          return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === 'frente_fundo') || this.modelosArcos[1] || null
        }
        // Para arcos intermediários: a partir do 2º arco, par primeiro, depois ímpar
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || this.modelosArcos[1] || null
      }

      // 4 modelos: 1º = frente, último = fundo, intermediários par e ímpar intercalados
      if (quantidadeModelos === 4) {
        if (numeroArco === 1) {
          return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === 'frente') || this.modelosArcos[1] || null
        }
        if (numeroArco === totalArcos) {
          return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === 'fundo') || this.modelosArcos[1] || null
        }
        // Para arcos intermediários: par primeiro, depois ímpar
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || this.modelosArcos[1] || null
      }

      return this.modelosArcos[1] || null
    },

    getBadgeClass() {
      if (!this.analiseArcos) return 'badge bg-info'

      const classes = ['badge']

      if (this.quantidadeModelosArcos === 1) {
        classes.push('bg-info')
      } else if (this.quantidadeModelosArcos === 2) {
        classes.push(this.arcoAtual % 2 === 1 ? 'bg-warning' : 'bg-primary')
      } else if (this.quantidadeModelosArcos === 3) {
        if (this.arcoAtual === 1 || this.arcoAtual === this.analiseArcos.totalArcos) {
          classes.push('bg-success')
        } else {
          classes.push(this.arcoAtual % 2 === 0 ? 'bg-primary' : 'bg-warning')
        }
      } else if (this.quantidadeModelosArcos === 4) {
        if (this.arcoAtual === 1) {
          classes.push('bg-success')
        } else if (this.arcoAtual === this.analiseArcos.totalArcos) {
          classes.push('bg-danger')
        } else {
          classes.push(this.arcoAtual % 2 === 0 ? 'bg-primary' : 'bg-warning')
        }
      }

      return classes.join(' ')
    },

    getBadgeText() {
      if (!this.analiseArcos) return 'TODOS'

      if (this.quantidadeModelosArcos === 1) {
        return 'TODOS'
      } else if (this.quantidadeModelosArcos === 2) {
        return this.arcoAtual % 2 === 1 ? 'ÍMPAR' : 'PAR'
      } else if (this.quantidadeModelosArcos === 3) {
        if (this.arcoAtual === 1 || this.arcoAtual === this.analiseArcos.totalArcos) {
          return 'F/F'
        } else {
          return this.arcoAtual % 2 === 0 ? 'PAR' : 'ÍMPAR'
        }
      } else if (this.quantidadeModelosArcos === 4) {
        if (this.arcoAtual === 1) {
          return 'FRENTE'
        } else if (this.arcoAtual === this.analiseArcos.totalArcos) {
          return 'FUNDO'
        } else {
          return this.arcoAtual % 2 === 0 ? 'PAR' : 'ÍMPAR'
        }
      }

      return 'TODOS'
    },

    mudarArco(novoArco, forcarAplicarConfiguracao = true) {
      this.arcoAtual = novoArco

      // Se estiver editando um modelo específico, não aplicar configuração automática
      if (forcarAplicarConfiguracao && !this.modeloArcoAtual) {
        const modeloParaArco = this.determinarModeloParaArco(novoArco)
        if (modeloParaArco && modeloParaArco.config) {
          this.configArmazem = { ...modeloParaArco.config }
        }
      }

      if (this.dadosPortal) {
        const dadosConvertidos = this.converterDadosParaRenderizacao(this.dadosPortal, novoArco)
        this.dados = dadosConvertidos
      }

      // Atualizar o SVG com o novo arco
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

    obterLogicaDistribuicao() {
      const logicas = {
        1: {
          nome: 'Modelo Único',
          descricao: 'Todos os arcos utilizam o mesmo modelo',
          aplicacao: 'todos_arcos'
        },
        2: {
          nome: 'Par/Ímpar',
          descricao: 'Arcos pares (2º, 4º, 6º...) e ímpares (1º, 3º, 5º...)',
          aplicacao: 'par_impar'
        },
        3: {
          nome: 'Frente/Fundo + Par/Ímpar',
          descricao: 'Frente e fundo iguais, meio alternado par/ímpar',
          aplicacao: 'frente_fundo_par_impar'
        },
        4: {
          nome: 'Frente/Par/Ímpar/Fundo',
          descricao: 'Primeiro único, último único, meio alternado',
          aplicacao: 'frente_par_impar_fundo'
        }
      }
      return logicas[this.quantidadeModelosArcos] || logicas[1]
    },

    prepararModelosParaSalvar() {
      const modelosPreparados = {}

      for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
        const modelo = this.modelosArcos[i]
        if (modelo) {
          const configCompleta = modelo.config || this.configArmazem
          modelosPreparados[i] = {
            numero: i,
            nome: modelo.nome || `Modelo ${i}`,
            posicao: modelo.posicao || this.determinarPosicaoDoModelo(i, this.quantidadeModelosArcos),
            configuracao: {
              // Garantir que TODAS as propriedades sejam salvas, mesmo as não alteradas
              pb: configCompleta.pb || 185,
              lb: configCompleta.lb || 350,
              hb: configCompleta.hb || 30,
              hf: configCompleta.hf || 5,
              lf: configCompleta.lf || 250,
              le: configCompleta.le || 15,
              ht: configCompleta.ht || 50,
              tipo_telhado: configCompleta.tipo_telhado || 1,
              curvatura_topo: configCompleta.curvatura_topo || 30,
              pontas_redondas: configCompleta.pontas_redondas || false,
              raio_pontas: configCompleta.raio_pontas || 15,
              estilo_laterais: configCompleta.estilo_laterais || 'reta',
              curvatura_laterais: configCompleta.curvatura_laterais || 0,
              tipo_fundo: configCompleta.tipo_fundo || 0,
              altura_fundo_reto: configCompleta.altura_fundo_reto || 10,
              altura_funil_v: configCompleta.altura_funil_v || 18,
              posicao_ponta_v: configCompleta.posicao_ponta_v || 0,
              inclinacao_funil_v: configCompleta.inclinacao_funil_v || 1,
              largura_abertura_v: configCompleta.largura_abertura_v || 20,
              altura_duplo_v: configCompleta.altura_duplo_v || 22,
              posicao_v_esquerdo: configCompleta.posicao_v_esquerdo || -1,
              posicao_v_direito: configCompleta.posicao_v_direito || 1,
              largura_abertura_duplo_v: configCompleta.largura_abertura_duplo_v || 2,
              altura_plataforma_duplo_v: configCompleta.altura_plataforma_duplo_v || 0.3,
              largura_plataforma_duplo_v: configCompleta.largura_plataforma_duplo_v || 10,
              deslocamento_horizontal_fundo: configCompleta.deslocamento_horizontal_fundo || 0,
              deslocamento_vertical_fundo: configCompleta.deslocamento_vertical_fundo || -1,
              escala_sensores: configCompleta.escala_sensores || 16,
              dist_y_sensores: configCompleta.dist_y_sensores || 12,
              dist_x_sensores: configCompleta.dist_x_sensores || 0,
              posicao_horizontal: configCompleta.posicao_horizontal || 0,
              posicao_vertical: configCompleta.posicao_vertical || 0,
              afastamento_vertical_pendulo: configCompleta.afastamento_vertical_pendulo || 0
            },
            status: this.modelosSalvos[i] ? 'salvo' : 'pendente',
            timestampUltimaEdicao: new Date().toISOString(),
            // Incluir informações adicionais do modelo
            metadados: {
              criadoEm: modelo.criadoEm || new Date().toISOString(),
              ultimaModificacao: new Date().toISOString(),
              versaoModelo: '4.0'
            },
            quantidadePendulos: modelo.quantidadePendulos || 3,
            sensoresPorPendulo: modelo.sensoresPorPendulo || {},
            posicoesCabos: modelo.posicoesCabos || {},
            // Incluir estado completo do modelo se disponível
            estadoCompleto: modelo.estadoCompleto || null
          }
        }
      }

      return modelosPreparados
    },

    prepararDadosParaBanco() {
      console.log('🔄 [prepararDadosParaBanco] Preparando dados para salvar no banco')

      if (this.modeloArcoAtual) {
        this.salvarModeloAtualCompleto()
      }

      // Estrutura simples conforme especificação
      const dadosCompletos = {
        quantidadeModelos: this.quantidadeModelosArcos,
        modelos: {},
        configuracaoGlobal: { ...this.configArmazem },
        dimensoesSVG: {
          largura: this.larguraSVG,
          altura: this.alturaSVG
        }
      }

      // Preparar modelos individuais
      for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
        const modelo = this.modelosArcos[i]
        if (modelo) {
          dadosCompletos.modelos[i] = {
            nome: modelo.nome,
            posicao: modelo.posicao,
            config: modelo.config || this.configArmazem,
            quantidadePendulos: modelo.quantidadePendulos || 3,
            sensoresPorPendulo: modelo.sensoresPorPendulo || {}
          }
        }
      }

      return dadosCompletos
    },

    gerarMapeamentoArcos() {
      const mapeamento = {}
      const totalArcos = this.analiseArcos?.totalArcos || 1

      for (let arco = 1; arco <= totalArcos; arco++) {
        const modeloParaArco = this.determinarModeloParaArco(arco)
        mapeamento[arco] = {
          numeroArco: arco,
          modeloUtilizado: modeloParaArco ? {
            numero: Object.keys(this.modelosArcos).find(key =>
              this.modelosArcos[key] === modeloParaArco
            ),
            nome: modeloParaArco.nome,
            posicao: modeloParaArco.posicao
          } : null,
          pendulos: this.analiseArcos?.arcos[arco]?.totalPendulos || 0,
          sensores: this.analiseArcos?.arcos[arco]?.totalSensores || 0
        }
      }

      return mapeamento
    },

    gerarResumoConfiguracao(config) {
      const totalArcos = config.estruturaArmazem.totalArcos
      const totalModelos = config.configModelos.quantidadeModelos
      const logica = config.configModelos.logicaDistribuicao.nome

      return `Armazém "${config.nome}" salvo!\n\n` +
        `📊 Estrutura: ${totalArcos} arcos, ${totalModelos} modelo(s)\n` +
        `🎯 Lógica: ${logica}\n` +
        `⚙️ Mapeamento completo gerado para todos os arcos`
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

      // Criar configuração consolidada do modelo atual
      const configuracaoModelo = {
        // Dados básicos do modelo
        nome: this.modelosArcos[this.modeloArcoAtual]?.nome || `Modelo ${this.modeloArcoAtual}`,
        posicao: this.modelosArcos[this.modeloArcoAtual]?.posicao || 'todos',
        quantidadePendulos: this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3,
        sensoresPorPendulo: { ...this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {} },

        // Posição dos cabos separados
        posicoesCabos: { ...this.posicoesCabos },

        // Todas as configurações do armazém (inclui dimensões, telhado, fundo, sensores)
        ...this.configArmazem,

        // Estado adicional se necessário
        caboSelecionadoPosicionamento: this.caboSelecionadoPosicionamento,
        timestampSalvamento: new Date().toISOString()
      }

      // Salvar usando o serviço simplificado
      const { configuracaoService } = require('./services/configuracaoService')
      const resultado = configuracaoService.salvarModeloIndividual(this.modeloArcoAtual, configuracaoModelo)

      if (resultado.success) {
        this.modelosSalvos[this.modeloArcoAtual] = true
        console.log(`✅ Modelo ${this.modeloArcoAtual} salvo no localStorage`)
      } else {
        console.error(`❌ Erro ao salvar modelo ${this.modeloArcoAtual}:`, resultado.message)
      }
    },

    limparVariaveisParaNovoModelo() {
      console.log('🧹 [limparVariaveisParaNovoModelo] Limpando variáveis para começar novo modelo')

      // Resetar configuração do armazém para padrão
      this.configArmazem = {
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
      }

      // Limpar posições de cabos
      this.posicoesCabos = {}
      this.caboSelecionadoPosicionamento = null

      // Limpar modelagem individual
      this.modelagemIndividualAtiva = false
      this.penduloSelecionado = 1
      this.posicoesPendulosIndividuais = {}
      this.posicoesSensoresIndividuais = {}
      this.ajustesGlobaisSensores = { horizontal: 0, vertical: 0 }
      this.dadosPreviewDesvinculados = null

      // Limpar configurações de preview aplicadas
      this.configPreviewAplicada = null
      this.configuracaoAplicada = null

      console.log('✅ [limparVariaveisParaNovoModelo] Variáveis limpas - pronto para novo modelo')
    },

    carregarConfiguracaoModelo(numeroModelo) {
      console.log(`🔄 [carregarConfiguracaoModelo] Carregando modelo ${numeroModelo}`)

      const modelo = this.modelosArcos[numeroModelo]
      if (!modelo) {
        console.warn(`⚠️ [carregarConfiguracaoModelo] Modelo ${numeroModelo} não encontrado`)
        return
      }

      // Carregar configuração básica do modelo
      if (modelo.config) {
        this.configArmazem = { ...modelo.config }
      }

      // Carregar estado completo se disponível
      if (modelo.estadoCompleto) {
        console.log(`📊 [carregarConfiguracaoModelo] Restaurando estado completo do modelo ${numeroModelo}`)

        // Restaurar configuração do armazém
        if (modelo.estadoCompleto.configArmazem) {
          this.configArmazem = { ...modelo.estadoCompleto.configArmazem }
        }

        // Restaurar posições de cabos
        if (modelo.estadoCompleto.posicoesCabos) {
          this.posicoesCabos = { ...modelo.estadoCompleto.posicoesCabos }
        }

        // Restaurar cabo selecionado
        this.caboSelecionadoPosicionamento = modelo.estadoCompleto.caboSelecionadoPosicionamento || null

        // Restaurar modelagem individual se estava ativa
        if (modelo.estadoCompleto.modelagemIndividualAtiva) {
          this.modelagemIndividualAtiva = modelo.estadoCompleto.modelagemIndividualAtiva
          this.posicoesPendulosIndividuais = { ...modelo.estadoCompleto.posicoesPendulosIndividuais || {} }
          this.posicoesSensoresIndividuais = { ...modelo.estadoCompleto.posicoesSensoresIndividuais || {} }
          this.ajustesGlobaisSensores = { ...modelo.estadoCompleto.ajustesGlobaisSensores || { horizontal: 0, vertical: 0 } }
        }
      } else {
        // Fallback para modelos sem estado completo
        if (modelo.posicoesCabos) {
          this.posicoesCabos = { ...modelo.posicoesCabos }
        }
      }

      console.log(`✅ [carregarConfiguracaoModelo] Modelo ${numeroModelo} carregado com sucesso`)
    },

    aplicarConfiguracaoGeralArmazem() {
      // Quando não há modelo selecionado, usar configuração geral
      const primeiroModelo = this.modelosArcos[1]
      if (primeiroModelo?.config) {
        this.configArmazem = { ...primeiroModelo.config }
      }
    },

    salvarModeloNoLocalStorage(numeroModelo, dadosModelo) {
      if (typeof localStorage !== 'undefined') {
        try {
          const chave = `modelo_arco_${numeroModelo}_${Date.now()}`
          localStorage.setItem(chave, JSON.stringify({
            numeroModelo,
            dados: dadosModelo,
            timestamp: new Date().toISOString(),
            tipo: 'modelo_individual'
          }))
          console.log(`💾 [salvarModeloNoLocalStorage] Modelo ${numeroModelo} salvo individualmente no localStorage`)
        } catch (error) {
          console.error(`❌ [salvarModeloNoLocalStorage] Erro ao salvar modelo ${numeroModelo}:`, error)
        }
      }
    },

    salvarModelosAutomatico() {
      try {
        if (typeof localStorage !== 'undefined') {
          const estadoModelos = {
            quantidadeModelos: this.quantidadeModelosArcos,
            modelosArcos: this.modelosArcos,
            modelosSalvos: this.modelosSalvos,
            modeloAtual: this.modeloArcoAtual,
            posicoesCabos: this.posicoesCabos,
            timestamp: new Date().toISOString(),
            versao: '3.0',
            tipo: 'estado_modelos_arcos'
          }

          localStorage.setItem('estadoModelosArcos', JSON.stringify(estadoModelos))
        }
      } catch (error) {
        console.error('Erro ao salvar modelos automaticamente:', error)
      }
    },

    // Sistema de validação antes de salvar configuração final
    validarModelosParaSalvar() {
      const modelosValidados = {}
      let todosValidados = true

      for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
        const modelo = this.modelosArcos[i]
        if (!modelo || !this.modelosSalvos[i]) {
          todosValidados = false
          this.mostrarToast(`Modelo ${i} não foi salvo ainda! Salve todos os modelos antes de salvar a configuração.`, 'warning')
          break
        }

        // Validar se o modelo tem configuração completa
        if (!modelo.config || !modelo.nome || !modelo.posicao) {
          todosValidados = false
          this.mostrarToast(`Modelo ${i} está incompleto! Configure nome, posição e configurações.`, 'warning')
          break
        }

        modelosValidados[i] = {
          numero: i,
          nome: modelo.nome,
          posicao: modelo.posicao,
          quantidadePendulos: modelo.quantidadePendulos || 3,
          sensoresPorPendulo: modelo.sensoresPorPendulo || {},
          posicoesCabos: modelo.posicoesCabos || {},
          configuracao: { ...modelo.config },
          timestampSalvamento: modelo.timestampSalvamento || new Date().toISOString()
        }
      }

      return todosValidados ? modelosValidados : null
    },

    resetSiloField(campo, valor) {
      this.configSilo[campo] = valor
      this.updateSVG()
    },

    resetArmazemField(campo, valor) {
      this.configArmazem[campo] = valor
      this.updateSVG()
      this.onArmazemChange()
    },

    resetarPadrao() {
      if (this.tipoAtivo === 'silo') {
        this.configSilo = {
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
        }
      } else {
        this.resetarModelosParaPadrao()
      }
      this.updateSVG()
    },

    resetarModelosParaPadrao() {
      const configPadrao = {
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
      }

      this.configArmazem = { ...configPadrao }
      this.quantidadeModelosArcos = 1
      this.modelosArcos = {
        1: {
          posicao: 'todos',
          config: { ...configPadrao },
          nome: 'Modelo Único',
          quantidadePendulos: 3,
          sensoresPorPendulo: {
            1: 3, 2: 3, 3: 3 // Configuração padrão uniforme de 3 sensores para 3 pêndulos
          }
        }
      }
      this.modeloArcoAtual = null
      this.modelosSalvos = {}
      this.caboSelecionadoPosicionamento = null
      this.posicoesCabos = {}
    },

    salvarConfiguracao() {
      if (!this.nomeConfiguracao.trim()) {
        this.mostrarToast('Digite um nome para salvar a configuração!', 'warning')
        return
      }

      if (typeof localStorage !== 'undefined') {
        if (this.tipoAtivo === 'silo') {
          // Para silo, incluir todas as configurações e dimensões SVG
          const configCompletaSilo = {
            // Configurações básicas do silo
            ...this.configSilo,

            // Dimensões calculadas do SVG
            dimensoesSVG: {
              largura: this.larguraSVG,
              altura: this.alturaSVG
            },

            // Metadados
            nome: this.nomeConfiguracao,
            timestamp: new Date().toISOString(),
            versao: '3.0',
            tipo: 'configuracao_silo_completa'
          }

          localStorage.setItem('configSilo', JSON.stringify(configCompletaSilo))
          localStorage.setItem(`configSilo_${this.nomeConfiguracao}`, JSON.stringify(configCompletaSilo))
          this.mostrarToast(`Configuração Silo "${this.nomeConfiguracao}" salva com sucesso!`, 'success')
        } else {
          // ETAPA 2: Validar se todos os modelos estão salvos antes de salvar configuração
          const modelosValidados = this.validarModelosParaSalvar()
          if (!modelosValidados) {
            return // Mensagem de erro já foi mostrada na validação
          }

          // Criar configuração completa do armazém
          const configCompleta = {
            // Metadados
            nome: this.nomeConfiguracao,
            timestamp: new Date().toISOString(),
            versao: '4.0',
            tipo: 'configuracao_armazem_completa',

            // SISTEMA DE MODELOS - Informações essenciais para recriação
            sistemaModelos: {
              quantidadeModelos: this.quantidadeModelosArcos,
              logicaDistribuicao: this.obterLogicaDistribuicaoCompleta(),
              modelosDefinidos: modelosValidados
            },

            // Informações da estrutura (para referência)
            estruturaReferencia: {
              totalArcos: this.analiseArcos?.totalArcos || 1,
              estatisticas: this.analiseArcos?.estatisticas || { totalPendulos: 0, totalSensores: 0 }
            },

            // Configurações globais padrão
            configuracaoGlobal: { ...this.configArmazem },

            // Dimensões SVG
            dimensoesSVG: {
              largura: this.larguraSVG,
              altura: this.alturaSVG
            },

            // Layouts automáticos
            layoutsAutomaticos: this.layoutsAutomaticos || {},

            // Dados originais (se disponíveis)
            dadosOriginais: {
              dadosPortal: this.dadosPortal,
              analiseArcos: this.analiseArcos
            }
          }

          // Salvar configuração
          localStorage.setItem('configArmazem', JSON.stringify(configCompleta))
          localStorage.setItem(`configArmazem_${this.nomeConfiguracao}`, JSON.stringify(configCompleta))

          // Gerar preview do mapeamento
          const mapeamento = this.gerarMapeamentoDistribuicao()

          this.mostrarToast(
            `✅ Configuração "${this.nomeConfiguracao}" salva!\n\n` +
            `📊 ${this.quantidadeModelosArcos} modelo(s) de arco configurado(s)\n` +
            `🎯 Lógica: ${this.obterLogicaDistribuicao().nome}\n` +
            `📐 Total de ${this.analiseArcos?.totalArcos || 1} arcos no armazém\n\n` +
            `${mapeamento}`,
            'success'
          )

          // Manter o nome da configuração para referência
          // this.nomeConfiguracao = ''
        }

        this.forceUpdateLista++
      }
    },

    // Nova função para gerar lógica de distribuição completa
    obterLogicaDistribuicaoCompleta() {
      const logica = this.obterLogicaDistribuicao()

      return {
        ...logica,
        mapeamentoDetalhado: {
          1: this.quantidadeModelosArcos === 1 ? 'todos' :
            this.quantidadeModelosArcos === 2 ? 'impar' :
              this.quantidadeModelosArcos === 3 ? 'frente_fundo' :
                'frente',
          2: this.quantidadeModelosArcos <= 1 ? 'todos' :
            this.quantidadeModelosArcos === 2 ? 'par' :
              this.quantidadeModelosArcos === 3 ? 'par' :
                'par',
          3: this.quantidadeModelosArcos <= 2 ? null :
            this.quantidadeModelosArcos === 3 ? 'impar' :
              'impar',
          4: this.quantidadeModelosArcos <= 3 ? null : 'fundo'
        }
      }
    },

    // Gerar preview do mapeamento
    gerarMapeamentoDistribuicao() {
      const totalArcos = this.analiseArcos?.totalArcos || 1
      let preview = "📋Distribuição dos modelos:\n"

      for (let arco = 1; arco <= Math.min(totalArcos, 10); arco++) {
        const modelo = this.determinarModeloParaArco(arco)
        preview += `   Arco ${arco}: ${modelo?.nome || 'Padrão'}\n`
      }

      if (totalArcos > 10) {
        preview += `   ... e mais ${totalArcos - 10} arcos seguindo o padrão`
      }

      return preview
    },

    carregarConfiguracao(nome = null) {
      const nomeConfig = nome || this.nomeConfiguracao
      if (!nomeConfig) return

      if (typeof localStorage !== 'undefined') {
        const chave = `config${this.tipoAtivo === 'silo' ? 'Silo' : 'Armazem'}_${nomeConfig}`
        const configSalva = localStorage.getItem(chave)

        if (configSalva) {
          const dadosCarregados = JSON.parse(configSalva)

          if (this.tipoAtivo === 'silo') {
            this.carregarConfiguracaoV4(dadosCarregados, nomeConfig) // Usando v4 para carregar silo também
            this.mostrarToast('Configuração do silo carregada com sucesso!', 'success')
          } else {
            // Sistema de carregamento baseado na versão
            if (dadosCarregados.versao === '4.0' && dadosCarregados.tipo === 'configuracao_armazem_completa') {
              // Nova versão v4.0 - sistema completo de modelos
              this.carregarConfiguracaoV4(dadosCarregados, nomeConfig)
            } else if (dadosCarregados.tipo === 'configuracao_armazem_hierarquica') {
              // Configuração hierárquica v3.0
              this.carregarConfiguracaoHierarquica(dadosCarregados, nomeConfig)
            } else if (dadosCarregados.modelosArcos && dadosCarregados.tipo === 'configuracao_armazem_completa') {
              // Configuração completa v2.0
              this.carregarConfiguracaoCompleta(dadosCarregados, nomeConfig)
            } else {
              // Configuração simples v1.0
              this.carregarConfiguracaoSimples(dadosCarregados, nomeConfig)
            }
          }

          if (!nome) {
            this.nomeConfiguracao = nomeConfig
          }
          this.updateSVG()
        } else {
          this.mostrarToast('Configuração não encontrada!', 'error')
        }
      }
    },

    // Nova função para carregar configurações v4.0
    carregarConfiguracaoV4(dados, nomeConfig) {
      console.log('Carregando configuração v4.0:', dados)

      // Limpar estado atual
      this.resetarEstadoModelos()

      // Restaurar sistema de modelos
      const sistemaModelos = dados.sistemaModelos
      this.quantidadeModelosArcos = sistemaModelos.quantidadeModelos

      // Recriar modelos baseado na configuração salva
      const novosModelos = {}
      const novosSalvos = {}

      Object.keys(sistemaModelos.modelosDefinidos).forEach(numeroModelo => {
        const modeloSalvo = sistemaModelos.modelosDefinidos[numeroModelo]

        const modelo = {
          numero: parseInt(numeroModelo),
          nome: modeloSalvo.nome,
          posicao: modeloSalvo.posicao,
          quantidadePendulos: modeloSalvo.quantidadePendulos || 3,
          sensoresPorPendulo: { ...modeloSalvo.sensoresPorPendulo },
          posicoesCabos: { ...modeloSalvo.posicoesCabos },
          config: { ...modeloSalvo.configuracao }
        }

        novosModelos[numeroModelo] = modelo
        novosSalvos[numeroModelo] = true
      })

      this.modelosArcos = novosModelos
      this.modelosSalvos = novosSalvos

      // Restaurar modelo selecionado se disponível
      this.modeloArcoAtual = sistemaModelos.modeloAtualSelecionado || null

      // Restaurar layouts se disponível
      if (dados.layoutsAutomaticos) {
        this.layoutsAutomaticos = dados.layoutsAutomaticos
      }

      // Restaurar dados originais se disponíveis
      if (dados.dadosOriginais) {
        if (dados.dadosOriginais.dadosPortal) {
          this.dadosPortal = dados.dadosOriginais.dadosPortal
        }
        if (dados.dadosOriginais.analiseArcos) {
          this.analiseArcos = dados.dadosOriginais.analiseArcos
        }
        if (dados.dadosOriginais.dados) {
          this.dados = dados.dadosOriginais.dados
        }
      }

      // Restaurar dimensões SVG se disponíveis
      if (dados.dimensoesSVG) {
        this.larguraSVG = dados.dimensoesSVG.largura
        this.alturaSVG = dados.dimensoesSVG.altura
      }

      // Restaurar estado da aplicação se disponível
      if (dados.estadoAtual) {
        this.arcoAtual = dados.estadoAtual.arcoAtual || this.arcoAtual
        this.dadosVindosDoPreview = dados.estadoAtual.dadosVindosDoPreview || false
        this.configuracaoPreviewSelecionada = dados.estadoAtual.configuracaoPreviewSelecionada || ''
      }

      // Aplicar configuração do primeiro modelo no preview
      setTimeout(() => {
        const primeiroModelo = novosModelos[1]
        if (primeiroModelo) {
          this.configArmazem = { ...primeiroModelo.config }
          this.inicializarPosicoesCabos()
        }
      }, 100)

      const logica = sistemaModelos.logicaDistribuicao?.nome || 'Personalizada'
      this.mostrarToast(
        `✅ Configuração v4.0 "${nomeConfig}" carregada!\n\n` +
        `📊 ${this.quantidadeModelosArcos} modelo(s) restaurado(s) com estado completo\n` +
        `🎯 Lógica: ${logica}\n` +
        `📐 Dimensões: ${dados.dimensoesSVG?.largura || 'N/A'} x ${dados.dimensoesSVG?.altura || 'N/A'}\n\n` +
        `💡 Cada modelo foi restaurado com todas as configurações originais!`,
        'success'
      )
    },

    // Função para resetar estado dos modelos
    resetarEstadoModelos() {
      this.modelosArcos = {}
      this.modelosSalvos = {}
      this.modeloArcoAtual = null
      this.posicoesCabos = {}
      this.caboSelecionadoPosicionamento = null
    },

    // Carregar estado dos modelos salvos automaticamente
    carregarEstadoModelosSalvo() {
      if (typeof localStorage !== 'undefined') {
        const estadoSalvo = localStorage.getItem('estadoModelosArcos')
        if (estadoSalvo) {
          try {
            const estado = JSON.parse(estadoSalvo)

            // Verificar se é uma sessão recente (menos de 1 hora)
            const agora = new Date().getTime()
            const timestampEstado = new Date(estado.timestamp).getTime()
            const umaHora = 60 * 60 * 1000

            if ((agora - timestampEstado) < umaHora) {
              this.quantidadeModelosArcos = estado.quantidadeModelos || 1
              this.modelosArcos = estado.modelosArcos || {}
              this.modelosSalvos = estado.modelosSalvos || {}
              this.modeloArcoAtual = estado.modeloAtual || null
              this.posicoesCabos = estado.posicoesCabos || {}

              console.log('Estado dos modelos restaurado da sessão anterior')
              return true
            }
          } catch (error) {
            console.warn('Erro ao carregar estado dos modelos:', error)
          }
        }
      }
      return false
    },

    // Carregar configuração hierárquica v3.0
    carregarConfiguracaoHierarquica(dados, nomeConfig) {

      // Restaurar configuração dos modelos
      const configModelos = dados.configModelos
      this.quantidadeModelosArcos = configModelos.quantidadeModelos || 1

      // Converter modelos do formato hierárquico para o formato de trabalho
      const modelosConvertidos = {}
      const modelosSalvosConvertidos = {}

      Object.keys(configModelos.modelosDefinidos || {}).forEach(key => {
        const modeloHierarquico = configModelos.modelosDefinidos[key]
        const modeloConvertido = {
          nome: modeloHierarquico.nome,
          posicao: modeloHierarquico.posicao,
          config: { ...modeloHierarquico.configuracao }, // Deep copy para preservar todas as propriedades
          criadoEm: modeloHierarquico.metadados?.criadoEm,
          ultimaModificacao: modeloHierarquico.metadados?.ultimaModificacao,
          quantidadePendulos: modeloHierarquico.quantidadePendulos || 5 // Garantir que quantidadePendulos seja carregado
        }
        modelosConvertidos[key] = modeloConvertido

        if (modeloHierarquico.status === 'salvo') {
          modelosSalvosConvertidos[key] = modeloConvertido
        }
      })

      this.modelosArcos = modelosConvertidos
      this.modelosSalvos = modelosSalvosConvertidos

      // Restaurar modelo selecionado se disponível
      this.modeloArcoAtual = configModelos.modeloAtualSelecionado || null

      // Restaurar layouts se disponível
      if (dados.layoutsAutomaticos) {
        this.layoutsAutomaticos = dados.layoutsAutomaticos
      }

      // Restaurar dados originais se disponíveis
      if (dados.dadosOriginais) {
        if (dados.dadosOriginais.dadosPortal) {
          this.dadosPortal = dados.dadosOriginais.dadosPortal
        }
        if (dados.dadosOriginais.analiseArcos) {
          this.analiseArcos = dados.dadosOriginais.analiseArcos
        }
        if (dados.dadosOriginais.dados) {
          this.dados = dados.dadosOriginais.dados
        }
      }

      // Restaurar dimensões SVG se disponíveis
      if (dados.dimensoesSVG) {
        this.larguraSVG = dados.dimensoesSVG.largura
        this.alturaSVG = dados.dimensoesSVG.altura
      }

      // Restaurar estado da aplicação se disponível
      if (dados.estadoAtual) {
        this.arcoAtual = dados.estadoAtual.arcoAtual || this.arcoAtual
        this.dadosVindosDoPreview = dados.estadoAtual.dadosVindosDoPreview || false
        this.configuracaoPreviewSelecionada = dados.estadoAtual.configuracaoPreviewSelecionada || ''
      }

      // Aplicar configuração para o arco atual - com todas as propriedades
      setTimeout(() => {
        const modeloParaArcoAtual = this.determinarModeloParaArco(this.arcoAtual)
        if (modeloParaArcoAtual && modeloParaArcoAtual.config) {
          // Garantir que todas as propriedades sejam restauradas
          this.configArmazem = {
            // Valores padrão primeiro
            pb: 185, lb: 350, hb: 30, hf: 5, lf: 250, le: 15, ht: 50,
            tipo_telhado: 1, curvatura_topo: 30, pontas_redondas: false, raio_pontas: 15,
            estilo_laterais: 'reta', curvatura_laterais: 0, tipo_fundo: 0,
            altura_fundo_reto: 10, altura_funil_v: 18, posicao_ponta_v: 0,
            inclinacao_funil_v: 1, largura_abertura_v: 20, altura_duplo_v: 22,
            posicao_v_esquerdo: -1, posicao_v_direito: 1, largura_abertura_duplo_v: 2,
            altura_plataforma_duplo_v: 0.3, largura_plataforma_duplo_v: 10,
            deslocamento_horizontal_fundo: 0, deslocamento_vertical_fundo: -1,
            escala_sensores: 16, dist_y_sensores: 12, dist_x_sensores: 0,
            posicao_horizontal: 0, posicao_vertical: 0, afastamento_vertical_pendulo: 0,
            // Depois sobrescrever com valores salvos
            ...modeloParaArcoAtual.config
          }
        } else if (dados.configuracaoPadrao) {
          this.configArmazem = {
            // Valores padrão primeiro
            pb: 185, lb: 350, hb: 30, hf: 5, lf: 250, le: 15, ht: 50,
            tipo_telhado: 1, curvatura_topo: 30, pontas_redondas: false, raio_pontas: 15,
            estilo_laterais: 'reta', curvatura_laterais: 0, tipo_fundo: 0,
            altura_fundo_reto: 10, altura_funil_v: 18, posicao_ponta_v: 0,
            inclinacao_funil_v: 1, largura_abertura_v: 20, altura_duplo_v: 22,
            posicao_v_esquerdo: -1, posicao_v_direito: 1, largura_abertura_duplo_v: 2,
            altura_plataforma_duplo_v: 0.3, largura_plataforma_duplo_v: 10,
            deslocamento_horizontal_fundo: 0, deslocamento_vertical_fundo: -1,
            escala_sensores: 16, dist_y_sensores: 12, dist_x_sensores: 0,
            posicao_horizontal: 0, posicao_vertical: 0, afastamento_vertical_pendulo: 0,
            // Depois sobrescrever com valores salvos
            ...dados.configuracaoPadrao
          }
        }
      }, 100)

      const totalArcos = dados.estruturaArmazem?.totalArcos || 'N/A'
      const logica = configModelos.logicaDistribuicao?.nome || 'Padrão'

      this.mostrarToast(
        `Configuração hierárquica "${nomeConfig}" carregada!\n` +
        `📊 ${totalArcos} arcos, ${this.quantidadeModelosArcos} modelo(s)\n` +
        `🎯 Lógica: ${logica}\n` +
        `📐 Dimensões SVG: ${dados.dimensoesSVG?.largura || 'N/A'} x ${dados.dimensoesSVG?.altura || 'N/A'}`,
        'success'
      )
    },

    carregarConfiguracaoCompleta(dadosCarregados, nomeConfig) {
      // Carregamento de configuração completa com modelos (v2.0)
      this.quantidadeModelosArcos = dadosCarregados.quantidadeModelos || 1
      this.modelosArcos = dadosCarregados.modelosArcos || {}
      this.modelosSalvos = dadosCarregados.modelosArcos || {}
      this.modeloArcoAtual = null

      // Validar e corrigir posições dos modelos se necessário
      Object.keys(this.modelosArcos).forEach(key => {
        const numeroModelo = parseInt(key)
        const posicaoCorreta = this.determinarPosicaoDoModelo(numeroModelo, this.quantidadeModelosArcos)
        if (this.modelosArcos[key].posicao !== posicaoCorreta) {
          this.modelosArcos[key].posicao = posicaoCorreta
        }
      })

      setTimeout(() => {
        const modeloParaArcoAtual = this.determinarModeloParaArco(this.arcoAtual)
        if (modeloParaArcoAtual && modeloParaArcoAtual.config) {
          this.configArmazem = { ...modeloParaArcoAtual.config }
        } else {
          const primeiroModelo = dadosCarregados.modelosArcos[1]
          if (primeiroModelo && primeiroModelo.config) {
            this.configArmazem = { ...primeiroModelo.config }
          }
        }
      }, 100)

      this.mostrarToast(`Configuração "${nomeConfig}" carregada com ${this.quantidadeModelosArcos} modelo(s)!`, 'success')
    },

    carregarConfiguracaoSimples(dadosCarregados, nomeConfig) {
      // Configuração simples (formato antigo) - converter para novo formato
      this.configArmazem = dadosCarregados
      this.quantidadeModelosArcos = 1
      const modeloUnico = {
        posicao: 'todos',
        config: dadosCarregados,
        nome: 'Modelo Único'
      }
      this.modelosArcos = { 1: modeloUnico }
      this.modelosSalvos = { 1: modeloUnico }
      this.modeloArcoAtual = null
      this.mostrarToast(`Configuração "${nomeConfig}" convertida para o novo formato hierárquico!`, 'info')
    },

    deletarConfiguracao(nome) {
      if (typeof localStorage !== 'undefined') {
        const chave = `config${this.tipoAtivo === 'silo' ? 'Silo' : 'Armazem'}_${nome}`
        localStorage.removeItem(chave)
        this.mostrarToast(`Configuração "${nome}" removida com sucesso!`, 'success')
        this.forceUpdateLista++
        if (this.nomeConfiguracao === nome) {
          this.nomeConfiguracao = ''
        }
      }
    },

    // Sistema de Toast Notifications
    mostrarToast(mensagem, tipo = 'info') {
      const toast = document.createElement('div')
      const icones = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      const cores = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
      }

      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cores[tipo] || cores.info};
        color: ${tipo === 'warning' ? '#000' : '#fff'};
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 99999;
        font-size: 14px;
        max-width: 350px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
      `

      toast.innerHTML = `
        ${icones[tipo] || icones.info} ${mensagem}
      `

      // Adicionar animação CSS
      const style = document.createElement('style')
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `
      document.head.appendChild(style)

      document.body.appendChild(toast)

      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse'
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove()
          }
          if (style.parentNode) {
            style.remove()
          }
        }, 300)
      }, 4000)
    },

    // Método para carregar modelos do banco
    async carregarModelosDoBanco() {
      if (this.carregandoModelosBanco) return

      this.carregandoModelosBanco = true
      try {
        const response = await modeloSvgService.buscarModelos()

        if (response && response.data) {
          this.modelosBanco = Array.isArray(response.data) ? response.data : []
          console.log('Modelos carregados do banco:', this.modelosBanco)
        } else {
          this.modelosBanco = []
          console.warn('Resposta inválida da API:', response)
        }
      } catch (error) {
        console.error('Erro ao carregar modelos do banco:', error)
        this.mostrarToast('Erro ao carregar modelos do banco', 'error')
        this.modelosBanco = []
      } finally {
        this.carregandoModelosBanco = false
      }
    },

    // Método para aplicar modelo do banco no preview
    async aplicarModeloBancoNoPreview() {
      if (!this.configuracaoPreviewSelecionada) {
        this.limparConfiguracaoPreview()
        return
      }

      console.log('🔄 [aplicarModeloBancoNoPreview] ID selecionado:', this.configuracaoPreviewSelecionada)

      try {
        const response = await modeloSvgService.buscarModeloPorId(this.configuracaoPreviewSelecionada)

        if (response && response.data) {
          const modeloCarregado = response.data

          console.log('📊 [aplicarModeloBancoNoPreview] Modelo carregado:', {
            nome: modeloCarregado.nm_modelo,
            tipo: modeloCarregado.tp_svg
          })

          // Verificar se tem dados SVG válidos
          if (modeloCarregado.dado_svg) {
            let dadosSVG
            try {
              dadosSVG = typeof modeloCarregado.dado_svg === 'string'
                ? JSON.parse(modeloCarregado.dado_svg)
                : modeloCarregado.dado_svg
            } catch (parseError) {
              console.error('❌ [aplicarModeloBancoNoPreview] Erro ao fazer parse dos dados SVG:', parseError)
              this.mostrarToast('Dados SVG inválidos no modelo', 'error')
              return
            }

            console.log('📦 [aplicarModeloBancoNoPreview] Dados SVG parseados:', dadosSVG)

            // Aplicar configuração mesclando com valores padrão
            if (this.tipoAtivo === 'silo') {
              // Para silo, mesclar configuração salva com configuração padrão
              const configPadrao = { ...this.configSilo }
              const configSalva = dadosSVG.configuracao || dadosSVG

              this.configPreviewAplicada = this.mesclarConfiguracaoComPadrao(configPadrao, configSalva)

              console.log('🎨 [aplicarModeloBancoNoPreview] Configuração silo aplicada:', {
                configPadrao: Object.keys(configPadrao).length,
                configSalva: Object.keys(configSalva).length,
                configFinal: Object.keys(this.configPreviewAplicada).length
              })

            } else {
              // Para armazém, determinar modelo para o arco atual e mesclar configurações
              const modeloParaArco = this.determinarModeloParaArcoAtual(dadosSVG)
              const configPadrao = { ...this.configArmazem }

              if (modeloParaArco && (modeloParaArco.config || modeloParaArco.configuracao)) {
                const configSalva = modeloParaArco.config || modeloParaArco.configuracao
                this.configPreviewAplicada = this.mesclarConfiguracaoComPadrao(configPadrao, configSalva)

                console.log('🎨 [aplicarModeloBancoNoPreview] Configuração armazém aplicada:', {
                  modeloUtilizado: modeloParaArco.nome || 'Sem nome',
                  arcoAtual: this.arcoAtual,
                  configPadrao: Object.keys(configPadrao).length,
                  configSalva: Object.keys(configSalva).length,
                  configFinal: Object.keys(this.configPreviewAplicada).length
                })
              } else {
                // Fallback para configuração global se disponível
                const configGlobal = dadosSVG.configuracaoGlobal || dadosSVG
                this.configPreviewAplicada = this.mesclarConfiguracaoComPadrao(configPadrao, configGlobal)

                console.log('🎨 [aplicarModeloBancoNoPreview] Configuração global aplicada (fallback)')
              }
            }

            this.mostrarToast(`Preview: ${modeloCarregado.nm_modelo} aplicado`, 'info')
            this.updateSVG()

          } else {
            console.warn('⚠️ [aplicarModeloBancoNoPreview] Modelo não possui dados SVG')
            this.mostrarToast('Modelo não possui dados SVG', 'warning')
          }
        } else {
          console.error('❌ [aplicarModeloBancoNoPreview] Resposta inválida da API:', response)
          this.mostrarToast('Erro ao carregar modelo do banco', 'error')
        }
      } catch (error) {
        console.error('❌ [aplicarModeloBancoNoPreview] Erro ao aplicar modelo do banco no preview:', error)
        this.mostrarToast('Erro ao carregar modelo do banco', 'error')
      }
    },

    // Métodos para configuração do preview (mantendo compatibilidade)
    aplicarConfiguracaoNoPreview() {
      // Método mantido para compatibilidade, mas agora usa aplicarModeloBancoNoPreview
      this.aplicarModeloBancoNoPreview()
    },

    limparConfiguracaoPreview() {
      this.configuracaoPreviewSelecionada = ''
      this.configPreviewAplicada = null
      this.updateSVG()
      this.mostrarToast('Preview voltou ao padrão', 'info')
    },

    // Método para mesclar configuração salva com configuração padrão
    mesclarConfiguracaoComPadrao(configPadrao, configSalva) {
      console.log('🔄 [mesclarConfiguracaoComPadrao] Mesclando configurações:', {
        configPadrao: Object.keys(configPadrao || {}).length + ' chaves',
        configSalva: Object.keys(configSalva || {}).length + ' chaves'
      })

      if (!configSalva || typeof configSalva !== 'object') {
        console.warn('⚠️ [mesclarConfiguracaoComPadrao] Configuração salva inválida, usando padrão')
        return { ...configPadrao }
      }

      // Começar com configuração padrão
      const configMesclada = { ...configPadrao }

      // Aplicar apenas as variáveis que foram especificamente salvas no modelo
      Object.keys(configSalva).forEach(chave => {
        const valorSalvo = configSalva[chave]

        // Aplicar valor salvo apenas se for diferente de undefined/null e se a chave existe no padrão
        if (valorSalvo !== undefined && valorSalvo !== null && configPadrao.hasOwnProperty(chave)) {
          // Verificar se o valor salvo é realmente diferente do padrão
          if (valorSalvo !== configPadrao[chave]) {
            configMesclada[chave] = valorSalvo
            console.log(`✅ [mesclarConfiguracaoComPadrao] Aplicando ${chave}: ${configPadrao[chave]} → ${valorSalvo}`)
          } else {
            console.log(`➡️ [mesclarConfiguracaoComPadrao] Mantendo ${chave}: ${valorSalvo} (igual ao padrão)`)
          }
        } else if (!configPadrao.hasOwnProperty(chave)) {
          // Se a chave não existe no padrão, adicionar mesmo assim (nova funcionalidade)
          configMesclada[chave] = valorSalvo
          console.log(`🆕 [mesclarConfiguracaoComPadrao] Nova variável ${chave}: ${valorSalvo}`)
        }
      })

      console.log('✅ [mesclarConfiguracaoComPadrao] Configuração mesclada criada:', {
        totalChaves: Object.keys(configMesclada).length,
        chavesAlteradas: Object.keys(configSalva).filter(k =>
          configSalva[k] !== undefined &&
          configSalva[k] !== null &&
          configPadrao[k] !== configSalva[k]
        ).length
      })

      return configMesclada
    },

    determinarModeloParaArcoAtual(dadosProcessados) {
      console.log('🔍 [determinarModeloParaArcoAtual] Dados recebidos:', {
        dadosProcessados: !!dadosProcessados,
        tiposDados: dadosProcessados ? Object.keys(dadosProcessados) : 'null'
      })

      if (!dadosProcessados) {
        console.warn('⚠️ [determinarModeloParaArcoAtual] Dados processados não fornecidos')
        return null
      }

      // Verificar diferentes estruturas possíveis
      let modelos = null
      let quantidadeModelos = 1

      // Estrutura v5.0 (nova)
      if (dadosProcessados.modelosDefinidos) {
        modelos = dadosProcessados.modelosDefinidos
        quantidadeModelos = dadosProcessados.quantidadeModelos || Object.keys(modelos).length
        console.log('📦 [determinarModeloParaArcoAtual] Usando estrutura v5.0')
      }
      // Estrutura v4.0 (sistemaModelos)
      else if (dadosProcessados.sistemaModelos && dadosProcessados.sistemaModelos.modelosDefinidos) {
        modelos = dadosProcessados.sistemaModelos.modelosDefinidos
        quantidadeModelos = dadosProcessados.sistemaModelos.quantidadeModelos || Object.keys(modelos).length
        console.log('📦 [determinarModeloParaArcoAtual] Usando estrutura v4.0 (sistemaModelos)')
      }
      // Estrutura v3.0 (modelos)
      else if (dadosProcessados.modelos) {
        modelos = dadosProcessados.modelos
        quantidadeModelos = dadosProcessados.quantidadeModelos || Object.keys(modelos).length
        console.log('📦 [determinarModeloParaArcoAtual] Usando estrutura v3.0 (modelos)')
      }
      // Estrutura v2.0 (modelosArcos)
      else if (dadosProcessados.modelosArcos) {
        modelos = dadosProcessados.modelosArcos
        quantidadeModelos = dadosProcessados.quantidadeModelos || Object.keys(modelos).length
        console.log('📦 [determinarModeloParaArcoAtual] Usando estrutura v2.0 (modelosArcos)')
      }

      if (!modelos || Object.keys(modelos).length === 0) {
        console.warn('⚠️ [determinarModeloParaArcoAtual] Nenhum modelo encontrado')
        return null
      }

      const numeroArco = this.arcoAtual
      const totalArcos = this.analiseArcos?.totalArcos || 1

      console.log('🔍 [determinarModeloParaArcoAtual] Parâmetros:', {
        numeroArco,
        quantidadeModelos,
        totalArcos,
        modelosDisponiveis: Object.keys(modelos)
      })

      // Aplicar mesma lógica de distribuição de modelos
      if (quantidadeModelos === 1) {
        const modelo = modelos[1] || modelos['1'] || Object.values(modelos)[0]
        console.log('✅ [determinarModeloParaArcoAtual] Modelo único selecionado:', modelo?.nome || 'Sem nome')
        return modelo
      }

      if (quantidadeModelos === 2) {
        const isImpar = numeroArco % 2 === 1
        const posicaoProcurada = isImpar ? 'impar' : 'par'

        // Procurar por posição primeiro
        let modeloEncontrado = Object.values(modelos).find(modelo => {
          return modelo.posicao === posicaoProcurada
        })

        if (!modeloEncontrado) {
          // Fallback por número
          modeloEncontrado = modelos[isImpar ? 1 : 2] || Object.values(modelos)[0]
        }

        console.log('✅ [determinarModeloParaArcoAtual] Modelo 2x selecionado:', {
          posicaoProcurada,
          modeloNome: modeloEncontrado?.nome || 'Sem nome'
        })
        return modeloEncontrado
      }

      if (quantidadeModelos === 3) {
        if (numeroArco === 1 || numeroArco === totalArcos) {
          const modeloEncontrado = Object.values(modelos).find(modelo =>
            modelo.posicao === 'frente_fundo'
          ) || modelos[1] || Object.values(modelos)[0]

          console.log('✅ [determinarModeloParaArcoAtual] Modelo 3x frente/fundo selecionado:', modeloEncontrado?.nome || 'Sem nome')
          return modeloEncontrado
        } else {
          const isParIntermediario = numeroArco % 2 === 0
          const posicaoProcurada = isParIntermediario ? 'par' : 'impar'

          const modeloEncontrado = Object.values(modelos).find(modelo =>
            modelo.posicao === posicaoProcurada
          ) || modelos[isParIntermediario ? 2 : 3] || Object.values(modelos)[0]

          console.log('✅ [determinarModeloParaArcoAtual] Modelo 3x intermediário selecionado:', {
            posicaoProcurada,
            modeloNome: modeloEncontrado?.nome || 'Sem nome'
          })
          return modeloEncontrado
        }
      }

      if (quantidadeModelos === 4) {
        if (numeroArco === 1) {
          const modeloEncontrado = Object.values(modelos).find(modelo =>
            modelo.posicao === 'frente'
          ) || modelos[1] || Object.values(modelos)[0]

          console.log('✅ [determinarModeloParaArcoAtual] Modelo 4x frente selecionado:', modeloEncontrado?.nome || 'Sem nome')
          return modeloEncontrado
        }
        if (numeroArco === totalArcos) {
          const modeloEncontrado = Object.values(modelos).find(modelo =>
            modelo.posicao === 'fundo'
          ) || modelos[4] || Object.values(modelos)[0]

          console.log('✅ [determinarModeloParaArcoAtual] Modelo 4x fundo selecionado:', modeloEncontrado?.nome || 'Sem nome')
          return modeloEncontrado
        }
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'

        const modeloEncontrado = Object.values(modelos).find(modelo =>
          modelo.posicao === posicaoProcurada
        ) || modelos[isParIntermediario ? 2 : 3] || Object.values(modelos)[0]

        console.log('✅ [determinarModeloParaArcoAtual] Modelo 4x intermediário selecionado:', {
          posicaoProcurada,
          modeloNome: modeloEncontrado?.nome || 'Sem nome'
        })
        return modeloEncontrado
      }

      const modeloPadrao = modelos[1] || Object.values(modelos)[0]
      console.log('✅ [determinarModeloParaArcoAtual] Modelo padrão selecionado:', modeloPadrao?.nome || 'Sem nome')
      return modeloPadrao
    },

    corFaixaExata(t) {
      if (t === -1000) return '#ff0000'
      if (t < 12) return '#0384fc'
      else if (t < 15) return '#03e8fc'
      else if (t < 17) return '#03fcbe'
      else if (t < 21) return '#07fc03'
      else if (t < 25) return '#c3ff00'
      else if (t < 27) return '#fcf803'
      else if (t < 30) return '#ffb300'
      else if (t < 35) return '#ff2200'
      else if (t < 50) return '#ff0090'
      else return '#f700ff'
    },

    renderSensoresArmazem() {
      if (!this.layoutsAutomaticos || !this.analiseArcos) return ''

      let elementos = ''

      // Determinar estrutura dos pêndulos baseada no modelo atual
      let arcoInfo
      const modeloAtual = this.determinarModeloParaArco(this.arcoAtual)

      if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
        // Quando editando um modelo específico, usar configuração do modelo
        const quantidade = this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3
        const sensoresPorPendulo = this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {}

        arcoInfo = {
          pendulos: Array.from({ length: quantidade }, (_, i) => ({
            numero: i + 1,
            totalSensores: sensoresPorPendulo[i + 1] || 1
          }))
        }
      } else if (modeloAtual?.quantidadePendulos || modeloAtual?.sensoresPorPendulo) {
        // Usar configuração do modelo para o arco
        const quantidade = modeloAtual.quantidadePendulos || 3
        const sensoresPorPendulo = modeloAtual.sensoresPorPendulo || {}

        arcoInfo = {
          pendulos: Array.from({ length: quantidade }, (_, i) => ({
            numero: i + 1,
            totalSensores: sensoresPorPendulo[i + 1] || 1
          }))
        }
      } else {
        // Usar dados originais da análise
        arcoInfo = this.analiseArcos.arcos[this.arcoAtual]
      }

      if (!arcoInfo) return ''

      // Garantir que o layout seja atualizado com a quantidade correta
      const layoutArco = this.layoutsAutomaticos[`arco_${this.arcoAtual}`] || LayoutManager.gerarLayoutParaArco(arcoInfo)

      // Forçar atualização do layout se a quantidade de pêndulos mudou
      if (!layoutArco || layoutArco.configuracao?.totalPendulos !== arcoInfo.pendulos.length) {
        const novoLayout = LayoutManager.gerarLayoutParaArco(arcoInfo)
        this.layoutsAutomaticos[`arco_${this.arcoAtual}`] = novoLayout
      }

      // Garantir que o layout está atualizado com a quantidade correta
      const layoutAtualizado = this.layoutsAutomaticos[`arco_${this.arcoAtual}`] || LayoutManager.gerarLayoutParaArco(arcoInfo)

      // Usar configuração aplicada se disponível, senão usar valores padrão
      const config = this.configPreviewAplicada || this.configuracaoAplicada || this.configArmazem
      const escala_sensores = config.escala_sensores || 16
      const dist_y_sensores = config.dist_y_sensores || 12
      const dist_x_sensores = config.dist_x_sensores || 0
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      const pb = (config.pb || this.alturaSVG - 50) + (this.alturaSVG < 300 ? 0 : 50)
      const yPendulo = pb + 15 + posicao_vertical

      const totalCabos = arcoInfo.pendulos.length
      const indiceCentral = Math.floor((totalCabos - 1) / 2)

      // Sempre gerar posições para o número correto de cabos
      const larguraTotal = config.lb || 350
      const margemLateral = 35
      const larguraUtilizavel = larguraTotal - (2 * margemLateral)
      const posicoesCabos = []

      if (totalCabos === 1) {
        posicoesCabos.push(larguraTotal / 2)
      } else {
        const espacamento = larguraUtilizavel / (totalCabos - 1)
        for (let i = 0; i < totalCabos; i++) {
          posicoesCabos.push(margemLateral + (i * espacamento))
        }
      }

      // Forçar atualização das posições
      if (!layoutAtualizado.desenho_sensores) {
        layoutAtualizado.desenho_sensores = {}
      }
      layoutAtualizado.desenho_sensores.pos_x_cabo = posicoesCabos

      arcoInfo.pendulos.forEach((pendulo, index) => {
        // Usar posições do layout atualizado ou calcular dinamicamente
        let xCaboBase
        if (layoutAtualizado.desenho_sensores.pos_x_cabo && layoutAtualizado.desenho_sensores.pos_x_cabo[index] !== undefined) {
          xCaboBase = layoutAtualizado.desenho_sensores.pos_x_cabo[index]
        } else {
          // Calcular posição dinamicamente se não existir no layout
          const larguraTotal = config.lb || 350
          const margemLateral = 35
          const larguraUtilizavel = larguraTotal - (2 * margemLateral)

          if (totalCabos === 1) {
            xCaboBase = larguraTotal / 2
          } else {
            const espacamento = larguraUtilizavel / (totalCabos - 1)
            xCaboBase = margemLateral + (index * espacamento)
          }
        }

        const distanciaDoMeio = index - indiceCentral
        const deslocamentoX = distanciaDoMeio * dist_x_sensores

        // Aplicar offset individual (seja de modelagem individual ou posicionamento de cabos)
        let offsetIndividualX = 0
        let offsetIndividualY = 0

        if (this.modelagemIndividualAtiva && this.posicoesPendulosIndividuais[pendulo.numero]) {
          offsetIndividualX = this.posicoesPendulosIndividuais[pendulo.numero].x || 0
          offsetIndividualY = this.posicoesPendulosIndividuais[pendulo.numero].y || 0
        } else if (this.posicoesCabos && this.posicoesCabos[pendulo.numero]) {
          // Usar posições dos cabos - garantir que sejam números
          offsetIndividualX = parseFloat(this.posicoesCabos[pendulo.numero].x) || 0
          offsetIndividualY = parseFloat(this.posicoesCabos[pendulo.numero].y) || 0
        }

        const xCabo = xCaboBase + posicao_horizontal + deslocamentoX + offsetIndividualX
        const yPenduloFinal = yPendulo + offsetIndividualY
        const numSensores = pendulo.totalSensores

        // Determinar cor do pêndulo (destacar se selecionado)
        const isPenduloSelecionado = this.modelagemIndividualAtiva && this.penduloSelecionado === pendulo.numero
        const isCaboSelecionado = this.caboSelecionadoPosicionamento === pendulo.numero
        const corPendulo = (isPenduloSelecionado || isCaboSelecionado) ? "#FF6B35" : "#3A78FD"
        const strokePendulo = (isPenduloSelecionado || isCaboSelecionado) ? "#FF6B35" : "none"
        const strokeWidth = (isPenduloSelecionado || isCaboSelecionado) ? "4" : "0"

        // Retângulo do nome do pêndulo
        elementos += `
          <rect
            id="C${index + 1}"
            x="${xCabo - escala_sensores / 2}"
            y="${yPenduloFinal}"
            width="${escala_sensores}"
            height="${escala_sensores / 2}"
            rx="2"
            ry="2"
            fill="${corPendulo}"
            stroke="${strokePendulo}"
            stroke-width="${strokeWidth}"
          />
        `

        // Texto do nome do pêndulo
        elementos += `
          <text
            id="TC${index + 1}"
            x="${xCabo}"
            y="${yPenduloFinal + escala_sensores / 4}"
            text-anchor="middle"
            dominant-baseline="central"
            font-weight="bold"
            font-size="${escala_sensores * 0.4 - 0.5}"
            font-family="Arial"
            fill="white"
          >
            P${pendulo.numero}
          </text>
        `

        // Sensores
        for (let s = 1; s <= numSensores; s++) {
          const ySensorBase = yPenduloFinal - dist_y_sensores * s - 25 - afastamento_vertical_pendulo

          // Aplicar offset individual se em modo de modelagem individual
          let offsetSensorX = 0
          let offsetSensorY = 0

          if (this.modelagemIndividualAtiva) {
            const chaveSensor = `${pendulo.numero}-${s}`
            if (this.posicoesSensoresIndividuais[chaveSensor]) {
              offsetSensorX = this.posicoesSensoresIndividuais[chaveSensor].x || 0
              offsetSensorY = this.posicoesSensoresIndividuais[chaveSensor].y || 0
            }
          }

          const xSensorFinal = xCabo + offsetSensorX
          const ySensorFinal = ySensorBase + offsetSensorY

          if (ySensorFinal > 10 && ySensorFinal < (this.alturaSVG - 60)) {
            // Determinar cor do sensor (para dados desvinculados)
            let corSensor = "#ccc"
            let valorSensor = "0"

            if (this.modelagemIndividualAtiva && this.dadosPreviewDesvinculados?.leitura?.[pendulo.numero]?.[s]) {
              const dadosSensor = this.dadosPreviewDesvinculados.leitura[pendulo.numero][s]
              const temp = parseFloat(dadosSensor[0])
              corSensor = this.corFaixaExata(temp)
              valorSensor = temp.toFixed(1)
            }

            // Destacar sensor se for do pêndulo selecionado
            const isSensorDestacado = this.modelagemIndividualAtiva && this.penduloSelecionado === pendulo.numero
            const strokeSensor = isSensorDestacado ? "#FF6B35" : "black"
            const strokeWidthSensor = isSensorDestacado ? "2" : "1"

            // Retângulo do sensor
            elementos += `
              <rect
                id="C${index + 1}S${s}"
                x="${xSensorFinal - escala_sensores / 2}"
                y="${ySensorFinal}"
                width="${escala_sensores}"
                height="${escala_sensores / 2}"
                rx="2"
                ry="2"
                fill="${corSensor}"
                stroke="${strokeSensor}"
                stroke-width="${strokeWidthSensor}"
              />
            `

            // Texto do valor do sensor
            elementos += `
              <text
                id="TC${index + 1}S${s}"
                x="${xSensorFinal}"
                y="${ySensorFinal + escala_sensores / 4}"
                text-anchor="middle"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 0.5}"
                font-family="Arial"
                fill="${corSensor === "#ff2200" ? "white" : "black"}"
              >
                ${valorSensor}
              </text>
            `

            // Nome do sensor
            elementos += `
              <text
                id="TIND${index + 1}S${s}"
                x="${xSensorFinal - escala_sensores / 2 - 2}"
                y="${ySensorFinal + escala_sensores / 4}"
                text-anchor="end"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 1.5}"
                font-family="Arial"
                fill="black"
              >
                S${s}
              </text>
            `
          }
        }
      })

      return elementos
    },

    atualizarSensores() {
      if (!this.dados?.leitura || !this.analiseArcos || !this.layoutsAutomaticos) return

      const layoutArco = this.layoutsAutomaticos[`arco_${this.arcoAtual}`]
      if (!layoutArco) return

      // Usar configuração aplicada se disponível
      const config = this.configPreviewAplicada || this.configuracaoAplicada || this.configArmazem
      const escala_sensores = config.escala_sensores || 16
      const dist_y_sensores = config.dist_y_sensores || 12
      const dist_x_sensores = config.dist_x_sensores || 0
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      const pb = (config.pb || this.alturaSVG - 50) + (this.alturaSVG < 300 ? 0 : 50)
      const yPendulo = pb + 15 + posicao_vertical

      const totalCabos = Object.keys(this.dados.leitura).length
      const indiceCentral = Math.floor((totalCabos - 1) / 2)

      // Aguardar um pouco para garantir que o DOM foi renderizado
      this.$nextTick(() => {
        Object.entries(this.dados.leitura).forEach(([numeroPendulo, sensores], penduloIndex) => {
          const xCaboBase = layoutArco.desenho_sensores.pos_x_cabo[penduloIndex]
          const distanciaDoMeio = penduloIndex - indiceCentral
          const deslocamentoX = distanciaDoMeio * dist_x_sensores

          // Aplicar offset dos cabos se existir
          let offsetCaboX = 0
          let offsetCaboY = 0
          const numeroPenduloInt = parseInt(numeroPendulo)
          if (this.posicoesCabos && this.posicoesCabos[numeroPenduloInt]) {
            offsetCaboX = parseFloat(this.posicoesCabos[numeroPenduloInt].x) || 0
            offsetCaboY = parseFloat(this.posicoesCabos[numeroPenduloInt].y) || 0
          }

          const xCabo = xCaboBase + posicao_horizontal + deslocamentoX + offsetCaboX
          const yPenduloFinal = yPendulo + offsetCaboY
          const numSensores = Object.keys(sensores).length

          // Atualizar posição do pêndulo
          const pendulo = document.getElementById(`C${penduloIndex + 1}`)
          const textoPendulo = document.getElementById(`TC${penduloIndex + 1}`)
          if (pendulo && textoPendulo) {
            pendulo.setAttribute('x', xCabo - escala_sensores / 2)
            pendulo.setAttribute('y', yPenduloFinal)
            textoPendulo.setAttribute('x', xCabo)
            textoPendulo.setAttribute('y', yPenduloFinal + escala_sensores / 4)
            textoPendulo.setAttribute('font-size', escala_sensores * 0.4 - 0.5)
          }

          Object.entries(sensores).forEach(([numeroSensor, dadosSensor]) => {
            if (!Array.isArray(dadosSensor) || dadosSensor.length < 5) return

            const s = parseInt(numeroSensor)
            const [temp, , , falha, nivel] = dadosSensor
            const ySensor = yPenduloFinal - dist_y_sensores * s - 25 - afastamento_vertical_pendulo

            const rec = document.getElementById(`C${penduloIndex + 1}S${numeroSensor}`)
            const txt = document.getElementById(`TC${penduloIndex + 1}S${numeroSensor}`)
            const nomeTexto = document.getElementById(`TIND${penduloIndex + 1}S${numeroSensor}`)

            if (!rec || !txt || !nomeTexto) return

            // Atualizar posicionamento
            rec.setAttribute('x', xCabo - escala_sensores / 2)
            rec.setAttribute('y', ySensor)
            rec.setAttribute('width', escala_sensores)
            rec.setAttribute('height', escala_sensores / 2)

            txt.setAttribute('x', xCabo)
            txt.setAttribute('y', ySensor + escala_sensores / 4)
            txt.setAttribute('font-size', escala_sensores * 0.4 - 0.5)

            nomeTexto.setAttribute('x', xCabo - escala_sensores / 2 - 2)
            nomeTexto.setAttribute('y', ySensor + escala_sensores / 4)
            nomeTexto.setAttribute('font-size', escala_sensores * 0.4 - 1.5)

            // Atualizar dados com verificação de nível
            txt.textContent = falha ? "ERRO" : (parseFloat(temp) || 0).toFixed(1)
            if (!nivel || temp == 0) {
              rec.setAttribute("fill", "#e6e6e6")
              txt.setAttribute("fill", "black")
            } else {
              const cor = this.corFaixaExata(parseFloat(temp) || 0)
              rec.setAttribute("fill", cor)
              txt.setAttribute("fill", cor === "#ff2200" ? "white" : "black")
            }
          })
        })
      })
    },

    updateSVG() {
      this.calcularDimensoesSVG()
      this.generateSVG()

      // Se há dados de sensores, atualizar após renderização
      if (this.tipoAtivo === 'armazem' && this.dados) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.atualizarSensores()
          }, 100)
        })
      }
    },

    calcularDimensoesSVG() {
      if (this.tipoAtivo === 'silo') {
        this.larguraSVG = this.configSilo.lb + (this.configSilo.aeradores_ativo ? this.configSilo.ds * 2 + 68 : 0)
        this.alturaSVG = this.configSilo.hs + this.configSilo.hb * 1.75
      } else {
        // Para armazém, calcular dimensões adequadas incluindo espaço para o topo
        const config = this.configPreviewAplicada || this.configArmazem
        const larguraBase = Math.max(config.lb, 300)

        // Calcular altura necessária considerando todos os elementos
        const alturaFundo = config.pb + 20  // Altura base + margem
        const alturaTopoNecessaria = 80     // Espaço adequado para o topo
        const alturaTotal = alturaFundo + alturaTopoNecessaria

        // Para diferentes tipos de fundo, ajustar altura
        let extensaoFundo = 0
        if (config.tipo_fundo === 1) {
          extensaoFundo = config.altura_funil_v || 40
        } else if (config.tipo_fundo === 2) {
          extensaoFundo = config.altura_duplo_v || 35
        }

        const alturaFinal = Math.max(alturaTotal + extensaoFundo, 280)

        // Ajustar para mobile se necessário
        if (this.isMobile) {
          const aspectRatio = larguraBase / alturaFinal
          if (aspectRatio > 2) {
            this.larguraSVG = larguraBase
            this.alturaSVG = Math.max(alturaFinal, larguraBase / 1.8)
          } else {
            this.larguraSVG = larguraBase
            this.alturaSVG = alturaFinal
          }
        } else {
          this.larguraSVG = larguraBase
          this.alturaSVG = alturaFinal
        }
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
      const p1 = [0, hs]
      const p2 = [lb, hs]
      const p3 = [lb, hb * 1.75]
      const p4 = [lb / 2, 0]
      const p5 = [0, hb * 1.75]
      const points = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`

      const transformSilo = this.configSilo.aeradores_ativo ? `translate(${this.configSilo.ds + 34}, 0)` : ""

      let svg = `
        <style>
          .sensor-element, .pendulo-element, text, rect {
            transition: all 0.15s ease-out;
          }
        </style>
        <g transform="${transformSilo}">
          <polygon fill="#E7E7E7" points="${points}" />
          <path
            fill="#999999"
            d="M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z"
            transform="scale(${lb / 152}, ${hb / 15})"
          />
          <ellipse fill="#999999" cx="${lb / 2}" cy="${hs}" rx="${lb / 2}" ry="${hb}" />
          <ellipse fill="#CCCCCC" cx="${lb / 2}" cy="${hs - eb}" rx="${lb / 2}" ry="${hb}" />
        </g>
      `

      if (this.configSilo.aeradores_ativo) {
        svg += this.renderAeradoresSilo()
      }

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
            <g>
              ${angles.map(angle =>
          `<path d="${dBlade}" fill="white" ${angle === 0 ? '' : `transform="rotate(${angle},86.35,24.05)"`} />`
        ).join('')}
            </g>
          </g>
        `
      }

      return aeradores
    },

    renderArmazem() {
      return `
        <style>
          .sensor-element, .pendulo-element, text, rect {
            transition: all 0.15s ease-out;
          }
        </style>
      ` + this.renderTelhado() + this.renderFundoArmazem()
    },

    renderTelhado() {
      const config = this.configPreviewAplicada || this.configArmazem
      const {
        tipo_telhado,
        curvatura_topo,
        pb,
        lb,
        hb,
        hf,
        lf,
        le,
        ht,
        tipo_fundo,
        pontas_redondas,
        raio_pontas,
        estilo_laterais,
        curvatura_laterais
      } = config

      if (tipo_telhado === 1) {
        // Telhado Pontudo - aplicar modificações de curvatura lateral
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 7
        }

        // Pontos base do modelo padrão - ajustar altura do topo
        const alturaTopo = Math.max(10, 50 - (curvatura_topo || 30))
        const p1 = [(lb - lf) / 2, pb - hf + extensao]
        const p2 = [le, pb - hb + extensao]
        const p3 = [le, pb - ht]
        const p4 = [lb / 2, alturaTopo]
        const p5 = [lb - le, pb - ht]
        const p6 = [lb - le, pb - hb + extensao]
        const p7 = [lb - (lb - lf) / 2, pb - hf + extensao]

        // Aplicar modificações baseadas no modelo padrão
        if (pontas_redondas || estilo_laterais !== 'reta') {
          const raio = raio_pontas || 15
          const curvaLateral = curvatura_laterais || 0

          let pathTelhado = `M ${p1[0]} ${p1[1]}`

          // Lateral esquerda - seguir exatamente o modelo padrão
          pathTelhado += ` L ${p2[0]} ${p2[1]}`

          // Aplicar curvatura lateral esquerda - começar sempre reto como no modelo padrão
          pathTelhado += ` L ${p3[0]} ${p3[1]}`

          // Aplicar curvatura apenas na linha do topo para o ponto central
          if (estilo_laterais === 'curvatura_lateral') {
            if (curvaLateral === 0) {
              // Valor 0 = reto
              pathTelhado += ` L ${p4[0]} ${p4[1]}`
            } else if (curvaLateral < 0) {
              // Negativo = barriga para dentro
              pathTelhado += ` Q ${p3[0] + Math.abs(curvaLateral)} ${(p3[1] + p4[1]) / 2} ${p4[0]} ${p4[1]}`
            } else {
              // Positivo = barriga para fora
              pathTelhado += ` Q ${p3[0] - curvaLateral} ${(p3[1] + p4[1]) / 2} ${p4[0]} ${p4[1]}`
            }
          } else {
            pathTelhado += ` L ${p4[0]} ${p4[1]}`
          }

          // Aplicar ponta arredondada apenas no topo (p4 -> p5) se habilitado
          if (pontas_redondas) {
            // Criar arco suave no topo do telhado
            const pontoControle1X = p4[0] - raio
            const pontoControle2X = p4[0] + raio
            pathTelhado += ` Q ${pontoControle1X} ${p4[1] - raio} ${p4[0]} ${p4[1]}`
            pathTelhado += ` Q ${pontoControle2X} ${p4[1] - raio} ${p5[0]} ${p5[1]}`
          } else {
            // Aplicar curvatura lateral direita - do ponto central para baixo
            if (estilo_laterais === 'curvatura_lateral') {
              if (curvaLateral === 0) {
                // Valor 0 = reto
                pathTelhado += ` L ${p5[0]} ${p5[1]}`
              } else if (curvaLateral < 0) {
                // Negativo = barriga para dentro
                pathTelhado += ` Q ${p5[0] - Math.abs(curvaLateral)} ${(p5[1] + p4[1]) / 2} ${p5[0]} ${p5[1]}`
              } else {
                // Positivo = barriga para fora
                pathTelhado += ` Q ${p5[0] + curvaLateral} ${(p5[1] + p4[1]) / 2} ${p5[0]} ${p5[1]}`
              }
            } else {
              pathTelhado += ` L ${p5[0]} ${p5[1]}`
            }
          }

          // Lateral direita - seguir exatamente o modelo padrão
          pathTelhado += ` L ${p6[0]} ${p6[1]}`

          // Lateral inferior direita - sempre reta
          pathTelhado += ` L ${p7[0]} ${p7[1]}`

          pathTelhado += ` Z`

          return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" d="${pathTelhado}" />`
        } else {
          // Modelo padrão sem modificações
          const pathTelhado = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')}`
          return `<polygon fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" points="${pathTelhado}" />`
        }
      } else if (tipo_telhado === 2) {
        // Telhado Arredondado - aplicar curvatura do topo
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        // Calcular altura da curva baseada na configuração de curvatura
        const alturaCurva = Math.max(10, 60 - (curvatura_topo || 30))

        // Formato arredondado com curvatura configurável
        let pathTelhado = `M ${(lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` L ${le} ${pb - hb + extensao}`
        pathTelhado += ` L ${le} ${pb - ht}`
        pathTelhado += ` Q ${lb / 2} ${alturaCurva} ${lb - le} ${pb - ht}`
        pathTelhado += ` L ${lb - le} ${pb - hb + extensao}`
        pathTelhado += ` L ${lb - (lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` Z`

        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" d="${pathTelhado}" />`
      } else if (tipo_telhado === 3) {
        // Telhado em Arco - aplicar curvatura do topo
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        // Calcular raio do arco baseado na configuração de curvatura
        const raioArco = Math.max(20, curvatura_topo || 30)

        // Formato arco com curvatura configurável
        let pathTelhado = `M ${(lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` L ${le} ${pb - hb + extensao}`
        pathTelhado += ` L ${le} ${pb - ht}`
        pathTelhado += ` A ${(lb - le * 2) / 2} ${raioArco} 0 0 1 ${lb - le} ${pb - ht}`
        pathTelhado += ` L ${lb - le} ${pb - hb + extensao}`
        pathTelhado += ` L ${lb - (lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` Z`

        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" d="${pathTelhado}" />`
      }

      return ''
    },

    renderFundoArmazem() {
      const config = this.configPreviewAplicada || this.configArmazem
      const { tipo_fundo } = config

      if (tipo_fundo === 0) {
        return this.renderBaseNormal()
      } else if (tipo_fundo === 1) {
        return this.renderBaseFunilV()
      } else if (tipo_fundo === 2) {
        return this.renderBaseDuploV()
      }

      return ''
    },

    renderBaseNormal() {
      const config = this.configPreviewAplicada || this.configArmazem
      const {
        pb, lb, hb, le, lf,
        altura_fundo_reto = 10,
        deslocamento_horizontal_fundo = 0,
        deslocamento_vertical_fundo = 0
      } = config

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo
      const altura_fundo_aplicada = altura_fundo_reto || 10

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]
      const p3 = [lb - (lb - lf) / 2 + ajuste_horizontal, pb - altura_fundo_aplicada + ajuste_base]
      const p4 = [(lb - lf) / 2 + ajuste_horizontal, pb - altura_fundo_aplicada + ajuste_base]
      const p5 = [le + ajuste_horizontal, pb - hb + ajuste_base]
      const p6 = [0 + ajuste_horizontal, pb - hb + ajuste_base]
      const p7 = [0 + ajuste_horizontal, pb + ajuste_base]
      const p8 = [lb + ajuste_horizontal, pb + ajuste_base]

      const pathBase = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')} ${p8.join(',')}`

      return `<polygon fill="#999999" points="${pathBase}" />`
    },

    renderBaseFunilV() {
      const config = this.configPreviewAplicada || this.configArmazem
      const {
        pb, lb, hb, le,
        altura_funil_v = 40,
        posicao_ponta_v = 0,
        largura_abertura_v = 20,
        inclinacao_funil_v = 1,
        deslocamento_horizontal_fundo = 0,
        deslocamento_vertical_fundo = 0
      } = config

      const centroBase = lb / 2
      const deslocamentoPonta = lb * 0.1 * posicao_ponta_v
      const pontaX = centroBase + deslocamentoPonta

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo

      const inclinacao_direita = altura_funil_v * inclinacao_funil_v
      const inclinacao_esquerda = altura_funil_v * inclinacao_funil_v

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]
      const p3 = [pontaX + largura_abertura_v / 2 + inclinacao_direita + ajuste_horizontal, pb - hb + ajuste_base + altura_funil_v]
      const p4 = [pontaX - largura_abertura_v / 2 - inclinacao_esquerda + ajuste_horizontal, pb - hb + ajuste_base + altura_funil_v]
      const p5 = [le + ajuste_horizontal, pb - hb + ajuste_base]
      const p6 = [0 + ajuste_horizontal, pb - hb + ajuste_base]
      const p7 = [0 + ajuste_horizontal, pb + ajuste_base]
      const p8 = [lb + ajuste_horizontal, pb + ajuste_base]

      const pontos = [p1, p2, p3, p4, p5, p6, p7, p8]
      const pathBase = pontos.map(p => p.join(',')).join(' ')

      return `<polygon fill="#999999" points="${pathBase}" />`
    },

    voltarParaPreview() {
      if (this.$router) {
        this.$router.push({
          name: 'Armazem',
          query: {
            arco: this.arcoAtual
          }
        });
      } else {
        // Fallback se não há roteamento
        this.dadosVindosDoPreview = false;
        alert('Navegação de volta ao preview não disponível. Dados do preview foram limpos.');
      }
    },

    irParaArmazem() {
      if (!this.dadosPortal || !this.analiseArcos || !this.layoutsAutomaticos) {
        alert('Dados não carregados completamente. Aguarde a inicialização.');
        return;
      }

      try {
        // Preparar dados para o preview do armazém
        const dadosParaArmazem = {
          dadosPortal: this.dadosPortal,
          analiseArcos: this.analiseArcos,
          layoutsAutomaticos: this.layoutsAutomaticos,
          dadosConvertidos: this.dados,
          numeroArco: this.arcoAtual,
          timestamp: new Date().getTime()
        };

        // Salvar dados no localStorage para o Armazem pegar
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('dadosArcoParaArmazem', JSON.stringify(dadosParaArmazem));
          localStorage.setItem('timestampArcoArmazem', dadosParaArmazem.timestamp.toString());
        }

        console.log(`Enviando dados do arco ${this.arcoAtual} para o preview do armazém:`, dadosParaArmazem);

        // Navegar para o Armazem
        if (this.$router) {
          this.$router.push({
            name: 'Armazem',
            query: {
              arco: this.arcoAtual,
              origem: 'modelador'
            }
          });
        } else {
          // Fallback se não há roteamento Vue
          alert(`Dados do arco ${this.arcoAtual} preparados para o preview do armazém. Navegue manualmente para a página do Armazém.`);
        }

      } catch (error) {
        console.error('Erro ao preparar dados para o preview do armazém:', error);
        alert('Erro ao preparar dados para o preview. Verifique o console.');
      }
    },

    renderBaseDuploV() {
      const config = this.configPreviewAplicada || this.configArmazem
      const {
        pb, lb, hb, le,
        altura_duplo_v = 35,
        posicao_v_esquerdo = -0.5,
        posicao_v_direito = 0.5,
        largura_abertura_duplo_v = 15,
        altura_plataforma_duplo_v = 0.3,
        largura_plataforma_duplo_v = 40,
        deslocamento_horizontal_fundo = 0,
        deslocamento_vertical_fundo = 0
      } = config

      const centroBase = lb / 2
      const pontaEsquerdaX = centroBase + lb * 0.2 * posicao_v_esquerdo
      const pontaDireitaX = centroBase + lb * 0.2 * posicao_v_direito

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo

      const alturaPlataforma = altura_plataforma_duplo_v || 0.3
      const larguraPlataforma = largura_plataforma_duplo_v || 40

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]
      const p3 = [pontaDireitaX + largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p4 = [pontaDireitaX - largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p5 = [centroBase + larguraPlataforma / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v * alturaPlataforma]
      const p6 = [centroBase - larguraPlataforma / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v * alturaPlataforma]
      const p7 = [pontaEsquerdaX + largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p8 = [pontaEsquerdaX - largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p9 = [le + ajuste_horizontal, pb - hb + ajuste_base]
      const p10 = [0 + ajuste_horizontal, pb - hb + ajuste_base]
      const p11 = [0 + ajuste_horizontal, pb + ajuste_base]
      const p12 = [lb + ajuste_horizontal, pb + ajuste_base]

      const pontos = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]
      const pathBase = pontos.map(p => p.join(',')).join(' ')

      return `<polygon fill="#999999" points="${pathBase}" />`
    },

    // Funções para lidar com a quantidade de pêndulos
    alterarQuantidadePendulos(data) {
      if (data.modeloArcoAtual && this.modelosArcos[data.modeloArcoAtual]) {
        this.modelosArcos[data.modeloArcoAtual].quantidadePendulos = data.novaQuantidade

        // Criar evento fake para manter compatibilidade
        const fakeEvent = { target: { value: data.novaQuantidade } }
        this.onQuantidadePendulosChange(fakeEvent)
      }
    },

    onQuantidadePendulosChange(event) {
      const modeloAtual = event.modeloArcoAtual || this.modeloArcoAtual
      if (modeloAtual) {
        const novaQuantidade = parseInt(event.target.value) || 3
        this.modelosArcos[modeloAtual].quantidadePendulos = novaQuantidade

        // Atualizar configuração de sensores por pêndulo para a nova quantidade
        const sensoresPorPendulo = {}
        for (let i = 1; i <= novaQuantidade; i++) {
          // Manter sensores existentes se já configurados, senão usar 3 como padrão
          const sensoresExistentes = this.modelosArcos[modeloAtual].sensoresPorPendulo?.[i]
          sensoresPorPendulo[i] = sensoresExistentes || 3
        }
        this.modelosArcos[modeloAtual].sensoresPorPendulo = sensoresPorPendulo

        // Regenerar dados de exemplo com nova quantidade
        this.criarDadosExemplaresComNovaQuantidadeSensores()
        // Regenerar layouts automáticos com nova quantidade
        this.regenerarLayoutsAutomaticos()
        // Inicializar posições dos cabos
        this.inicializarPosicoesCabos()
        // Salvar modelo completo imediatamente
        this.salvarModeloAtualCompleto()
        // Atualizar preview automaticamente
        this.updateSVG()
      }
    },

    onModeloDadosAtualizados(dados) {
      console.log('📊 [ModeladorSVG] onModeloDadosAtualizados recebido:', dados)

      if (dados.modeloAtual && this.modelosArcos[dados.modeloAtual]) {
        // Atualizar modelo com novos dados
        this.modelosArcos[dados.modeloAtual] = {
          ...this.modelosArcos[dados.modeloAtual],
          ...dados.dadosModelo
        }

        // Salvar automaticamente
        this.salvarModelosAutomatico()

        // Atualizar preview se necessário
        if (this.modeloArcoAtual === dados.modeloAtual) {
          this.updateSVG()
        }
      }
    },

    // Métodos para controle de cabos
    inicializarPosicoesCabos() {
      if (!this.modeloArcoAtual) return

      const quantidade = this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3
      const posicoes = {}

      // Tentar carregar posições salvas do modelo
      const posicoesSalvas = this.modelosArcos[this.modeloArcoAtual]?.posicoesCabos || {}

      // Inicializar posições baseadas no modelo salvo ou criar novas
      for (let i = 1; i <= quantidade; i++) {
        if (posicoesSalvas[i]) {
          // Usar posições salvas do modelo - garantir que sejam números
          posicoes[i] = {
            x: parseFloat(posicoesSalvas[i].x) || 0,
            y: parseFloat(posicoesSalvas[i].y) || 0
          }
        } else if (this.posicoesCabos[i]) {
          // Preservar posições existentes na sessão atual
          posicoes[i] = {
            x: parseFloat(this.posicoesCabos[i].x) || 0,
            y: parseFloat(this.posicoesCabos[i].y) || 0
          }
        } else {
          // Criar nova posição
          posicoes[i] = {
            x: 0, // Offset horizontal
            y: 0  // Offset vertical
          }
        }
      }

      this.posicoesCabos = posicoes

      // Garantir que o cabo selecionado seja válido
      if (this.caboSelecionadoPosicionamento > quantidade) {
        this.caboSelecionadoPosicionamento = null
      }
    },

    onPosicaoCaboChange() {
      // Garantir que a mudança seja salva no modelo atual
      if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
        // Salvar as posições dos cabos no modelo
        this.modelosArcos[this.modeloArcoAtual].posicoesCabos = { ...this.posicoesCabos }
        this.salvarModelosAutomatico()
      }
      // Atualizar preview em tempo real
      this.$nextTick(() => {
        this.updateSVG()
      })
    },

    moverCabo(direcao) {
      if (!this.caboSelecionadoPosicionamento || !this.posicoesCabos[this.caboSelecionadoPosicionamento]) return

      const posicao = this.posicoesCabos[this.caboSelecionadoPosicionamento]
      const passo = 5 // Pixels por movimento

      switch (direcao) {
        case 'left':
          posicao.x -= passo
          break
        case 'right':
          posicao.x += passo
          break
        case 'up':
          posicao.y -= passo
          break
        case 'down':
          posicao.y += passo
          break
      }

      this.updateSVG()
    },

    resetarPosicoesCabos() {
      this.inicializarPosicoesCabos()
      this.updateSVG()
    },

    criarDadosExemplaresComNovaQuantidadeSensores() {
      if (!this.modeloArcoAtual) return

      const novaQuantidade = this.modelosArcos[this.modeloArcoAtual].quantidadePendulos || 3
      const sensoresPorPendulo = this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo || {}

      // Atualizar dados do portal com nova quantidade para o arco atual
      if (!this.dadosPortal.arcos[this.arcoAtual]) {
        this.dadosPortal.arcos[this.arcoAtual] = {}
      }

      // Limpar dados antigos
      this.dadosPortal.arcos[this.arcoAtual] = {}

      // Criar novos dados baseados na quantidade configurada
      for (let p = 1; p <= novaQuantidade; p++) {
        const numSensores = sensoresPorPendulo[p] || Math.floor(Math.random() * 4) + 2 // 2-5 sensores
        this.dadosPortal.arcos[this.arcoAtual][p] = {}

        for (let s = 1; s <= numSensores; s++) {
          // Gerar temperatura aleatória entre 10°C e 40°C
          const temperaturaAleatoria = Math.random() * 30 + 10 // 10 + (0 a 30)
          const temp = Math.round(temperaturaAleatoria * 10) / 10 // Arredondar para 1 casa decimal

          this.dadosPortal.arcos[this.arcoAtual][p][s] = [temp, false, false, false, true]
        }

        // Atualizar configuração de sensores se não existir
        if (!sensoresPorPendulo[p]) {
          this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo[p] = numSensores
        }
      }

      // Reanalisar estrutura
      const novaAnalise = this.analisarEstruturaArcos(this.dadosPortal)
      this.analiseArcos = novaAnalise

      // Regenerar layouts com a nova estrutura
      const layoutsAtualizados = LayoutManager.gerarLayoutAutomatico(novaAnalise)
      this.layoutsAutomaticos = layoutsAtualizados

      // Converter dados para renderização
      const dadosConvertidos = this.converterDadosParaRenderizacao(this.dadosPortal, this.arcoAtual)
      this.dados = dadosConvertidos
    },

    regenerarLayoutsAutomaticos() {
      if (!this.analiseArcos || !this.modeloArcoAtual) return

      // Criar nova estrutura de análise baseada nos modelos configurados
      const analiseAtualizada = JSON.parse(JSON.stringify(this.analiseArcos))

      // Atualizar informações do arco atual com base no modelo
      const modeloAtual = this.modelosArcos[this.modeloArcoAtual]
      if (modeloAtual) {
        const novaQuantidade = modeloAtual.quantidadePendulos || 3
        const sensoresPorPendulo = modeloAtual.sensoresPorPendulo || {}

        // Atualizar ou criar informações do arco
        if (!analiseAtualizada.arcos[this.arcoAtual]) {
          analiseAtualizada.arcos[this.arcoAtual] = {
            numero: this.arcoAtual,
            totalPendulos: 0,
            totalSensores: 0,
            pendulos: []
          }
        }

        // Atualizar pendulos do arco
        const novosPendulos = []
        let totalSensores = 0

        for (let i = 1; i <= novaQuantidade; i++) {
          const numSensores = sensoresPorPendulo[i] || 1
          novosPendulos.push({
            numero: i,
            totalSensores: numSensores
          })
          totalSensores += numSensores
        }

        analiseAtualizada.arcos[this.arcoAtual].pendulos = novosPendulos
        analiseAtualizada.arcos[this.arcoAtual].totalPendulos = novaQuantidade
        analiseAtualizada.arcos[this.arcoAtual].totalSensores = totalSensores

        // Atualizar análise global
        this.analiseArcos = analiseAtualizada

        // Regenerar layout específico para este arco FORÇANDO nova criação
        const layoutArco = LayoutManager.gerarLayoutParaArco(analiseAtualizada.arcos[this.arcoAtual])
        if (!this.layoutsAutomaticos) {
          this.layoutsAutomaticos = {}
        }

        // Forçar nova criação do layout com as dimensões corretas
        delete this.layoutsAutomaticos[`arco_${this.arcoAtual}`]
        this.layoutsAutomaticos[`arco_${this.arcoAtual}`] = layoutArco

        console.log(`Layout regenerado para ${novaQuantidade} pêndulos:`, layoutArco)

        // Recalcular dimensões do SVG se necessário
        this.calcularDimensoesSVG()
      }
    },

    // Métodos para Modelagem Individual
    onToggleModelagemIndividual() {
      if (this.modelagemIndividualAtiva) {
        // Ativar modelagem individual
        this.inicializarPosicoesPendulos()
        this.inicializarPosicoesSensores()
        this.desvincularDadosParaModelagem()
      } else {
        // Voltar para modelagem geral
        this.posicoesPendulosIndividuais = {}
        this.posicoesSensoresIndividuais = {}
        this.ajustesGlobaisSensores = { horizontal: 0, vertical: 0 }
        this.dadosPreviewDesvinculados = null
        this.penduloSelecionado = 1
      }
      this.updateSVG()
    },

    inicializarPosicoesPendulos() {
      if (!this.modeloArcoAtual) return

      const quantidade = this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3
      const posicoes = {}

      // Inicializar posições baseadas no layout atual
      for (let i = 1; i <= quantidade; i++) {
        posicoes[i] = {
          x: 0, // Offset horizontal
          y: 0  // Offset vertical
        }
      }

      this.posicoesPendulosIndividuais = posicoes

      // Garantir que o pêndulo selecionado seja válido
      if (this.penduloSelecionado > quantidade) {
        this.penduloSelecionado = 1
      }
    },

    desvincularDadosParaModelagem() {
      if (!this.dados) return

      // Criar cópia dos dados atuais para manipulação independente
      this.dadosPreviewDesvinculados = JSON.parse(JSON.stringify(this.dados))

      // Gerar dados de preview baseados na quantidade selecionada
      const quantidade = this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 5
      const sensoresPorPendulo = this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {}
      const leituraFake = {}

      for (let p = 1; p <= quantidade; p++) {
        const numSensores = sensoresPorPendulo[p] || 1
        leituraFake[p] = {}

        for (let s = 1; s <= numSensores; s++) {
          // Gerar dados de exemplo
          leituraFake[p][s] = [25, false, false, false, true] // Temperatura padrão, sem alertas, sensor ativo
        }
      }

      this.dadosPreviewDesvinculados.leitura = leituraFake
    },

    onPenduloSelecionadoChange() {
      // Atualizar SVG para destacar pêndulo selecionado
      this.updateSVG()
    },

    onPosicaoPenduloChange() {
      // Atualizar preview em tempo real
      this.updateSVG()
    },

    moverPendulo(direcao) {
      if (!this.penduloSelecionado || !this.posicoesPendulosIndividuais[this.penduloSelecionado]) return

      const posicao = this.posicoesPendulosIndividuais[this.penduloSelecionado]
      const passo = 5 // Pixels por movimento

      switch (direcao) {
        case 'left':
          posicao.x -= passo
          break
        case 'right':
          posicao.x += passo
          break
        case 'up':
          posicao.y -= passo
          break
        case 'down':
          posicao.y += passo
          break
      }

      this.updateSVG()
    },

    resetarPosicoesPendulos() {
      this.inicializarPosicoesPendulos()
      this.updateSVG()
    },

    // Métodos para controle de sensores por pêndulo
    onSensoresCaboChange(data) {
      console.log('🔧 [ModeladorSVG] onSensoresCaboChange:', data)

      if (!this.modeloArcoAtual || !this.modelosArcos[this.modeloArcoAtual]) {
        console.warn('⚠️ [ModeladorSVG] Nenhum modelo selecionado')
        return
      }

      const { numeroPendulo, quantidade } = data

      // Garantir que existe a estrutura de sensores por pêndulo
      if (!this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo) {
        this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo = {}
      }

      // Atualizar quantidade de sensores para o pêndulo específico
      this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo[numeroPendulo] = quantidade

      console.log('✅ [ModeladorSVG] Sensores atualizados:', this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo)

      // Regenerar dados exemplares com nova configuração
      this.criarDadosExemplaresComNovaQuantidadeSensores()

      // Regenerar layouts automáticos
      this.regenerarLayoutsAutomaticos()

      // Salvar modelo automaticamente
      this.salvarModelosAutomatico()

      // Atualizar visualização
      this.updateSVG()
    },

    onAplicarSensoresUniformes(dados) {
      console.log('🔧 [ModeladorSVG] onAplicarSensoresUniformes recebido:', dados)

      if (!this.modeloArcoAtual) {
        this.mostrarToast('Selecione um modelo primeiro!', 'warning')
        return
      }

      const { quantidade, totalPendulos } = dados
      const numero = parseInt(quantidade)

      if (isNaN(numero) || numero < 1 || numero > 32) {
        this.mostrarToast('Número inválido! Digite um valor entre 1 e 32.', 'error')
        return
      }

      // Aplicar mesmo número de sensores para todos os pêndulos
      const sensoresUniformes = {}
      for (let i = 1; i <= totalPendulos; i++) {
        sensoresUniformes[i] = numero
      }

      // Garantir que a atualização seja aplicada corretamente
      this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo = sensoresUniformes

      console.log('✅ [ModeladorSVG] Sensores uniformizados:', sensoresUniformes)

      // Forçar atualização dos dados exemplares com a nova configuração
      this.atualizarDadosExemplaresComNovaSensorConfig(numero, totalPendulos)

      // Regenerar layouts
      this.regenerarLayoutsAutomaticos()

      // Salvar e atualizar
      this.salvarModelosAutomatico()
      this.updateSVG()

      this.mostrarToast(`Aplicado ${numero} sensores uniformemente para todos os ${totalPendulos} pêndulos!`, 'success')
    },

    // Métodos para controle de sensores por pêndulo (compatibilidade)
    alterarSensoresPendulo(numeroPendulo, incremento) {
      if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
        if (!this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo) {
          this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo = {}
        }

        const qtdAtual = this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo[numeroPendulo] || 1
        let novaQtd = qtdAtual + incremento

        // Validar limites
        if (novaQtd < 1) novaQtd = 1
        if (novaQtd > 32) novaQtd = 32

        // Usar o novo método de controle
        this.onSensoresCaboChange({ numeroPendulo, quantidade: novaQtd })
      }
    },

    onSensoresPenduloChange() {
      // Método mantido para compatibilidade - redireciona para updateSVG
      this.updateSVG()
    },

    aplicarSensoresUniformes() {
      // Método mantido para compatibilidade - redireciona para o novo método
      this.onAplicarSensoresUniformes()
    },

    atualizarDadosComNovosSensores() {
      if (!this.modeloArcoAtual || !this.dadosPreviewDesvinculados) return

      const sensoresPorPendulo = this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo || {}
      const quantidadePendulos = this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3
      const leituraAtualizada = {}

      for (let p = 1; p <= quantidadePendulos; p++) {
        const numSensores = sensoresPorPendulo[p] || 1
        leituraAtualizada[p] = {}

        for (let s = 1; s <= numSensores; s++) {
          // Gerar temperatura aleatória entre 10°C e 40°C
          const temperaturaAleatoria = Math.random() * 30 + 10 // 10 + (0 a 30)
          const tempBase = Math.round(temperaturaAleatoria * 10) / 10 // Arredondar para 1 casa decimal

          leituraAtualizada[p][s] = [tempBase, false, false, false, true]
        }
      }

      this.dadosPreviewDesvinculados.leitura = leituraAtualizada
    },

    // Métodos para controle individual de sensores
    inicializarPosicoesSensores() {
      if (!this.modeloArcoAtual) return

      const quantidadePendulos = this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3
      const sensoresPorPendulo = this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {}
      const posicoes = {}

      for (let p = 1; p <= quantidadePendulos; p++) {
        const numSensores = sensoresPorPendulo[p] || 1
        for (let s = 1; s <= numSensores; s++) {
          const chave = `${p}-${s}`
          posicoes[chave] = {
            x: 0, // Offset horizontal individual
            y: 0  // Offset vertical individual
          }
        }
      }

      this.posicoesSensoresIndividuais = posicoes
    },

    moverSensorIndividual(pendulo, sensor, direcao) {
      const chave = `${pendulo}-${sensor}`
      if (!this.posicoesSensoresIndividuais[chave]) {
        this.posicoesSensoresIndividuais[chave] = { x: 0, y: 0 }
      }

      const posicao = this.posicoesSensoresIndividuais[chave]
      const passo = 2 // Pixels por movimento para sensores (mais preciso)

      switch (direcao) {
        case 'left':
          posicao.x -= passo
          break
        case 'right':
          posicao.x += passo
          break
        case 'up':
          posicao.y -= passo
          break
        case 'down':
          posicao.y += passo
          break
      }

      this.updateSVG()
    },

    moverSensoresGlobal(direcao) {
      const passo = 2

      switch (direcao) {
        case 'left':
          this.ajustesGlobaisSensores.horizontal -= passo
          break
        case 'right':
          this.ajustesGlobaisSensores.horizontal += passo
          break
        case 'up':
          this.ajustesGlobaisSensores.vertical -= passo
          break
        case 'down':
          this.ajustesGlobaisSensores.vertical += passo
          break
      }

      this.aplicarAjusteGlobalSensores()
    },

    aplicarAjusteGlobalSensores() {
      if (!this.penduloSelecionado) return

      const numSensores = this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo?.[this.penduloSelecionado] || 1

      for (let s = 1; s <= numSensores; s++) {
        const chave = `${this.penduloSelecionado}-${s}`
        if (!this.posicoesSensoresIndividuais[chave]) {
          this.posicoesSensoresIndividuais[chave] = { x: 0, y: 0 }
        }

        this.posicoesSensoresIndividuais[chave].x = this.ajustesGlobaisSensores.horizontal
        this.posicoesSensoresIndividuais[chave].y = this.ajustesGlobaisSensores.vertical
      }

      this.updateSVG()
    },

    resetarPosicaoSensor(pendulo, sensor) {
      const chave = `${pendulo}-${sensor}`
      if (this.posicoesSensoresIndividuais[chave]) {
        this.posicoesSensoresIndividuais[chave] = { x: 0, y: 0 }
        this.updateSVG()
      }
    },

    resetarTodasPosicoesSensores() {
      this.posicoesSensoresIndividuais = {}
      this.ajustesGlobaisSensores = { horizontal: 0, vertical: 0 }
      this.inicializarPosicoesSensores()
      this.updateSVG()
    },

    // Método específico para atualizar dados exemplares com nova configuração de sensores
    atualizarDadosExemplaresComNovaSensorConfig(numeroSensores, quantidadePendulos) {
      console.log('🔄 [atualizarDadosExemplaresComNovaSensorConfig] Atualizando com:', { numeroSensores, quantidadePendulos })

      if (!this.dadosPortal.arcos[this.arcoAtual]) {
        this.dadosPortal.arcos[this.arcoAtual] = {}
      }

      // Limpar dados antigos
      this.dadosPortal.arcos[this.arcoAtual] = {}

      // Criar novos dados baseados na quantidade configurada
      for (let p = 1; p <= quantidadePendulos; p++) {
        this.dadosPortal.arcos[this.arcoAtual][p] = {}

        for (let s = 1; s <= numeroSensores; s++) {
          // Gerar temperatura aleatória entre 10°C e 40°C
          const temperaturaAleatoria = Math.random() * 30 + 10 // 10 + (0 a 30)
          const temp = Math.round(temperaturaAleatoria * 10) / 10 // Arredondar para 1 casa decimal

          this.dadosPortal.arcos[this.arcoAtual][p][s] = [temp, false, false, false, true]
        }
      }

      // Reanalisar estrutura
      const novaAnalise = this.analisarEstruturaArcos(this.dadosPortal)
      this.analiseArcos = novaAnalise

      // Regenerar layouts com a nova estrutura
      const layoutsAtualizados = LayoutManager.gerarLayoutAutomatico(novaAnalise)
      this.layoutsAutomaticos = layoutsAtualizados

      // Converter dados para renderização
      const dadosConvertidos = this.converterDadosParaRenderizacao(this.dadosPortal, this.arcoAtual)
      this.dados = dadosConvertidos

      console.log('✅ [atualizarDadosExemplaresComNovaSensorConfig] Dados atualizados:', {
        novaAnalise: novaAnalise.arcos[this.arcoAtual],
        dadosConvertidos: dadosConvertidos.leitura
      })
    },

    onPosicaoSensorChange() {
      // Atualizar preview em tempo real quando posição de sensor mudar
      this.updateSVG()
    },

    // Métodos para carregar configuração do banco
    carregarConfiguracaoDoBanco(configuracaoCarregada) {
      console.log('🔄 [ModeladorSVG] Carregando configuração do banco:', configuracaoCarregada)

      const { nome, dados, tipo, tipoConfiguracao } = configuracaoCarregada

      if (tipo === 'S') {
        // Carregar configuração de Silo
        this.tipoAtivo = 'silo'
        if (dados.configuracao) {
          this.configSilo = { ...dados.configuracao }
        }
        this.mostrarToast(`Silo "${nome}" carregado do banco!`, 'success')
        this.updateSVG()
      } else if (tipo === 'A') {
        // Carregar configuração de Armazém
        this.tipoAtivo = 'armazem'

        // Verificar tipo de configuração
        if (dados.tipoConfiguracao === 'armazem_completo_v4' || dados.versao === '4.0') {
          // Nova estrutura v4.0 com sistema completo de modelos
          this.carregarConfiguracaoCompletaV4(dados, nome)
        } else if (tipoConfiguracao === 'configuracao_armazem_completa' && dados.quantidadeModelos) {
          // Estrutura v3.0 com sistema de modelos
          this.carregarConfiguracaoCompletaV3(dados, nome)
        } else {
          // Configuração simples (compatibilidade)
          this.carregarConfiguracaoSimplesCompatibilidade(dados, nome)
        }

        // Resetar estado de edição
        this.modeloArcoAtual = null
        this.limparVariaveisParaNovoModelo()

        // Inicializar posições dos cabos
        this.inicializarPosicoesCabos()

        // Atualizar preview
        this.updateSVG()

        console.log(`✅ [ModeladorSVG] Configuração "${nome}" carregada com sucesso`)
      }
    },

    carregarConfiguracaoCompletaV4(dados, nome) {
      console.log('📦 [carregarConfiguracaoCompletaV4] Carregando configuração v4.0 completa')

      // Restaurar sistema de modelos
      if (dados.sistemaModelos) {
        this.quantidadeModelosArcos = dados.sistemaModelos.quantidadeModelos

        // Restaurar modelos de arcos com estado completo
        const novosModelos = {}
        const novosSalvos = {}

        if (dados.sistemaModelos.modelosDefinidos) {
          Object.keys(dados.sistemaModelos.modelosDefinidos).forEach(key => {
            const modelo = dados.sistemaModelos.modelosDefinidos[key]
            novosModelos[key] = {
              ...modelo,
              config: modelo.configuracao || {}, // Usar 'configuracao' da v4.0
              quantidadePendulos: modelo.quantidadePendulos || 3,
              sensoresPorPendulo: modelo.sensoresPorPendulo || {},
              posicoesCabos: modelo.posicoesCabos || {},
              // Restaurar estado completo se disponível
              estadoCompleto: modelo.estadoCompleto || null,
              timestampSalvamento: modelo.timestampUltimaEdicao || new Date().toISOString(),
              versaoModelo: modelo.metadados?.versaoModelo || '4.0'
            }
            novosSalvos[key] = modelo.status === 'salvo'
          })

          this.modelosArcos = novosModelos
          this.modelosSalvos = novosSalvos
        }
      }

      // Restaurar configuração global
      if (dados.configuracaoGlobal) {
        this.configArmazem = { ...dados.configuracaoGlobal }
      }

      // Restaurar layouts automáticos
      if (dados.layoutsAutomaticos) {
        this.layoutsAutomaticos = dados.layoutsAutomaticos
      }

      // Restaurar dados originais se disponíveis
      if (dados.dadosOriginais?.dadosPortal) {
        this.dadosPortal = dados.dadosOriginais.dadosPortal
        this.analiseArcos = dados.dadosOriginais.analiseArcos || this.analisarEstruturaArcos(dados.dadosOriginais.dadosPortal)
      }

      // Restaurar dimensões SVG
      if (dados.dimensoesSVG) {
        this.larguraSVG = dados.dimensoesSVG.largura || 350
        this.alturaSVG = dados.dimensoesSVG.altura || 200
      }

      // Restaurar estado da aplicação se disponível
      if (dados.estadoAtual) {
        this.arcoAtual = dados.estadoAtual.arcoAtual || this.arcoAtual
        this.dadosVindosDoPreview = dados.estadoAtual.dadosVindosDoPreview || false
        this.configuracaoPreviewSelecionada = dados.estadoAtual.configuracaoPreviewSelecionada || ''
      }

      // Aplicar configuração do primeiro modelo no preview
      setTimeout(() => {
        const primeiroModelo = Object.values(this.modelosArcos)[0]
        if (primeiroModelo) {
          this.configArmazem = { ...primeiroModelo.config }
          this.inicializarPosicoesCabos()
        }
      }, 100)

      const logica = dados.sistemaModelos?.logicaDistribuicao?.nome || 'Personalizada'
      this.mostrarToast(
        `✅ Configuração v4.0 "${nome}" carregada!\n\n` +
        `📊 ${this.quantidadeModelosArcos} modelo(s) restaurado(s) com estado completo\n` +
        `🎯 Lógica: ${logica}\n` +
        `📐 Dimensões: ${dados.dimensoesSVG?.largura || 'N/A'} x ${dados.dimensoesSVG?.altura || 'N/A'}\n\n` +
        `💡 Cada modelo foi restaurado com todas as configurações originais!`,
        'success'
      )
    },

    carregarConfiguracaoCompletaV3(dados, nome) {
      console.log('📦 [carregarConfiguracaoCompletaV3] Carregando configuração v3.0')

      this.quantidadeModelosArcos = dados.quantidadeModelos || 1

      // Restaurar modelos de arcos (compatibilidade v3.0)
      const novosModelos = {}
      const novosSalvos = {}

      if (dados.modelosArcos) {
        Object.keys(dados.modelosArcos).forEach(key => {
          const modelo = dados.modelosArcos[key]
          novosModelos[key] = {
            posicao: modelo.posicao || this.determinarPosicaoDoModelo(parseInt(key), dados.quantidadeModelos),
            config: { ...modelo.config },
            nome: modelo.nome || `Modelo ${key}`,
            quantidadePendulos: modelo.quantidadePendulos || 3,
            sensoresPorPendulo: modelo.sensoresPorPendulo || {},
            posicoesCabos: modelo.posicoesCabos || {}
          }
          novosSalvos[key] = true
        })

        this.modelosArcos = novosModelos
        this.modelosSalvos = novosSalvos
      }

      // Restaurar configuração global
      if (dados.configuracaoGlobal) {
        this.configArmazem = { ...dados.configuracaoGlobal }
      }

      // Restaurar dados originais se disponíveis
      if (dados.dadosOriginais?.dadosPortal) {
        this.dadosPortal = dados.dadosOriginais.dadosPortal
        this.analiseArcos = this.analisarEstruturaArcos(dados.dadosOriginais.dadosPortal)
      }

      // Restaurar dimensões SVG se disponíveis
      if (dados.dimensoesSVG) {
        this.larguraSVG = dados.dimensoesSVG.largura
        this.alturaSVG = dados.dimensoesSVG.altura
      }

      // Restaurar estado da aplicação se disponível
      if (dados.estadoAtual) {
        this.arcoAtual = dados.estadoAtual.arcoAtual || this.arcoAtual
        this.dadosVindosDoPreview = dados.estadoAtual.dadosVindosDoPreview || false
        this.configuracaoPreviewSelecionada = dados.estadoAtual.configuracaoPreviewSelecionada || ''
      }

      // Aplicar configuração inicial (geralmente do primeiro modelo)
      setTimeout(() => {
        const primeiroModelo = Object.values(this.modelosArcos)[0]
        if (primeiroModelo) {
          this.configArmazem = { ...primeiroModelo.config }
          this.inicializarPosicoesCabos() // Re-inicializar cabos com base no modelo carregado
        }
      }, 100)

      const totalArcos = dados.estruturaArmazem?.totalArcos || 'N/A'
      const logica = dados.configModelos?.logicaDistribuicao?.nome || 'Padrão'

      this.mostrarToast(
        `Configuração hierárquica "${nome}" carregada!\n` +
        `📊 ${totalArcos} arcos, ${this.quantidadeModelosArcos} modelo(s)\n` +
        `🎯 Lógica: ${logica}\n` +
        `📐 Dimensões SVG: ${dados.dimensoesSVG?.largura || 'N/A'} x ${dados.dimensoesSVG?.altura || 'N/A'}`,
        'success'
      )
    },

    carregarConfiguracaoSimplesCompatibilidade(dados, nome) {
      console.log('📦 [carregarConfiguracaoSimplesCompatibilidade] Carregando configuração simples')

      this.quantidadeModelosArcos = 1
      this.modelosArcos = {
        1: {
          posicao: 'todos',
          config: { ...dados },
          nome: 'Modelo Único',
          quantidadePendulos: 3,
          sensoresPorPendulo: { 1: 4, 2: 3, 3: 5 }
        }
      }
      this.modelosSalvos = { 1: true }
      this.configArmazem = { ...dados }

      this.mostrarToast(`Configuração simples "${nome}" convertida para novo formato!`, 'info')
    },

    // Métodos do Gerenciador de Configurações
    handleModeloSalvo(modelo) {
      // Este método é chamado quando um modelo é salvo através do Gerenciador de Modelos do Banco
      // A lógica para atualizar `modelosArcos` já deve estar sendo tratada dentro de GerenciadorModelosBanco
      console.log('Modelo salvo via Gerenciador de Modelos do Banco:', modelo);
    },

    handleModelosSalvos(modelos) {
      console.log('Modelos de arcos atualizados:', modelos);
      // Poderia ser usado para atualizar o estado global se necessário
    },

    handleConfiguracaoSalva(dadosConfig) {
      console.log('Configuração salva via Gerenciador de Configurações:', dadosConfig);
      // Lógica para salvar a configuração no localStorage ou API
      // A função `salvarConfiguracao` já faz isso, então aqui podemos apenas confirmar
      this.mostrarToast(`Configuração "${dadosConfig.nome}" salva!`, 'success');
    },

    handleConfiguracaoCarregada(dadosConfig) {
      console.log('Configuração carregada via Gerenciador de Configurações:', dadosConfig);
      // Aqui, vamos restaurar o estado da aplicação com base nos dados carregados

      if (!dadosConfig) return;

      // Restaurar Configurações Globais
      if (dadosConfig.configuracaoGlobal) {
        this.configArmazem = { ...dadosConfig.configuracaoGlobal };
      }

      // Restaurar Modelos de Arcos
      if (dadosConfig.sistemaModelos && dadosConfig.sistemaModelos.modelosDefinidos) {
        this.quantidadeModelosArcos = dadosConfig.sistemaModelos.quantidadeModelos || 1;
        const novosModelos = {};
        const novosSalvos = {};

        Object.keys(dadosConfig.sistemaModelos.modelosDefinidos).forEach(key => {
          const modeloSalvo = dadosConfig.sistemaModelos.modelosDefinidos[key];
          novosModelos[key] = {
            ...modeloSalvo,
            config: modeloSalvo.configuracao || {}, // Usar 'configuracao' da v4.0
            quantidadePendulos: modeloSalvo.quantidadePendulos || 3,
            sensoresPorPendulo: modeloSalvo.sensoresPorPendulo || {},
            posicoesCabos: modeloSalvo.posicoesCabos || {}
          };
          novosSalvos[key] = true; // Assumir que os modelos carregados estão salvos
        });

        this.modelosArcos = novosModelos;
        this.modelosSalvos = novosSalvos;
      }

      // Restaurar Layouts Automáticos
      if (dadosConfig.layoutsAutomaticos) {
        this.layoutsAutomaticos = dadosConfig.layoutsAutomaticos;
      }

      // Restaurar Dados Originais (se disponíveis)
      if (dadosConfig.dadosOriginais?.dadosPortal) {
        this.dadosPortal = dadosConfig.dadosOriginais.dadosPortal;
      }
      if (dadosConfig.dadosOriginais?.analiseArcos) {
        this.analiseArcos = dadosConfig.dadosOriginais.analiseArcos;
      }

      // Restaurar Dimensões SVG
      if (dadosConfig.dimensoesSVG) {
        this.larguraSVG = dadosConfig.dimensoesSVG.largura;
        this.alturaSVG = dadosConfig.dimensoesSVG.altura;
      }

      // Aplicar configuração inicial (geralmente do primeiro modelo)
      setTimeout(() => {
        const primeiroModelo = Object.values(this.modelosArcos)[0];
        if (primeiroModelo) {
          this.configArmazem = { ...primeiroModelo.config };
          this.inicializarPosicoesCabos(); // Re-inicializar cabos com base no modelo carregado
        }
        this.updateSVG(); // Atualizar visualização
      }, 100);

      this.mostrarToast(`Configuração "${dadosConfig.nome}" carregada!`, 'success');
    },

    handleConfiguracaoLegadoCarregada(dadosLegado) {
      console.log('Configuração Legado carregada:', dadosLegado);
      // Para configurações legadas, apenas carregamos a configuração base,
      // e resetamos os modelos para o estado padrão.
      this.configArmazem = { ...dadosLegado.configuracao };
      this.resetarModelosParaPadrao();
      this.mostrarToast('Configuração Legado carregada. Modelos resetados para o padrão.', 'info');
    }
  }
}
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa !important;
}

.border-end {
  border-right: 1px solid #dee2e6 !important;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group-text {
  min-width: 60px;
  text-align: center;
}

.badge-sm {
  font-size: 0.75em;
}

/* Melhor visualização em mobile */
@media (max-width: 576px) {
  .modelador-painel-controles {
    height: auto !important;
    overflow-y: visible !important;
    max-height: none !important;
  }

  .form-control,
  .form-select {
    font-size: 14px;
    min-height: 32px;
  }

  .btn-sm {
    font-size: 12px;
    padding: 0.25rem 0.5rem;
    min-height: 32px;
  }

  .input-group-sm .form-control,
  .input-group-sm .btn {
    min-height: 28px;
  }

  .row.g-1>* {
    padding-right: 0.125rem;
    padding-left: 0.125rem;
  }

  .row.g-2>* {
    padding-right: 0.25rem;
    padding-left: 0.25rem;
  }
}

/* Estilos adicionais para cards compactos */
.card-sm {
  min-height: unset;
}

.card-sm .card-body {
  padding: 0.5rem;
}

/* Garantir que selects não transbordem */
.form-select,
.form-control {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.form-select option {
  padding: 0.25rem;
  font-size: 0.875rem;
}

/* Melhor espaçamento em telas pequenas */
@media (max-width: 768px) {
  .card-body {
    padding: 0.75rem !important;
  }

  .alert {
    padding: 0.5rem !important;
  }

  .badge {
    font-size: 0.65rem;
  }

  .input-group-text {
    min-width: 50px;
    font-size: 0.8rem;
  }
}

/* Ajustes para dispositivos muito pequenos */
@media (max-width: 480px) {
  .form-label {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .btn-sm {
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
  }

  .small {
    font-size: 0.8rem !important;
  }

  /* Controles de movimentação individual em mobile */
  .input-group-sm .btn {
    min-width: 28px;
    padding: 0.2rem;
  }

  .input-group-sm .form-control {
    min-width: 40px;
  }

  /* Compactar controles de posicionamento */
  .row.g-1 .col-6 {
    padding: 0.1rem;
  }
}

/* Estilos específicos para modelagem individual */
.form-check-input:checked {
  background-color: #FF6B35;
  border-color: #FF6B35;
}

.bg-light {
  background-color: #f8f9fa !important;
  border: 1px solid #dee2e6;
}

/* Botões de movimentação */
.btn-outline-secondary:hover {
  background-color: #FF6B35;
  border-color: #FF6B35;
  color: white;
}

/* Responsivo para controles complexos */
@media (max-width: 768px) {
  .row.g-2 .col-12.col-md-6 {
    margin-bottom: 0.5rem;
  }

  .d-flex.align-items-center.justify-content-center {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .input-group.input-group-sm {
    flex-wrap: nowrap;
  }

  .form-control.text-center {
    text-align: center !important;
  }
}

/* Estilos para SVG */
.svg-container-responsive {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* Estilos específicos para navegação mobile */
.mobile-navigation {
  background: rgba(248, 249, 250, 0.95);
  border-radius: 6px;
  padding: 8px;
  margin: 4px 0;
  border: 1px solid #dee2e6;
}

.mobile-nav-buttons {
  background: white;
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-btn {
  min-width: 36px !important;
  height: 32px;
  font-weight: bold;
  font-size: 14px;
  padding: 4px 8px;
}

.mobile-select {
  max-width: 90px !important;
  min-width: 75px !important;
  height: 32px;
  font-size: 13px;
}

.mobile-info {
  background: white;
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mobile-badge {
  font-size: 0.65rem !important;
  padding: 2px 4px !important;
}

.mobile-badges {
  margin-bottom: 4px;
}

.mobile-model-name {
  font-size: 0.7rem !important;
  line-height: 1.2;
}

@media (max-width: 767.98px) {
  .svg-container-responsive {
    min-height: 180px;
    padding: 0.5rem;
  }

  .card-body {
    padding: 0.5rem !important;
  }

  .card-footer {
    padding: 0.5rem !important;
    position: relative;
    z-index: 100;
    background: #f8f9fa !important;
    border-top: 2px solid #dee2e6;
  }
}

@media (max-width: 575.98px) {
  .svg-container-responsive {
    min-height: 150px;
    padding: 0.25rem;
  }

  .mobile-navigation {
    margin: 2px -2px;
    padding: 6px;
  }

  .mobile-nav-buttons {
    gap: 2px !important;
    justify-content: space-between;
  }

  .nav-btn {
    min-width: 32px !important;
    height: 26px;
    font-size: 11px;
    padding: 1px 4px;
  }

  .mobile-select {
    max-width: 70px !important;
    min-width: 60px !important;
    height: 26px;
    font-size: 11px;
    margin: 0 4px !important;
  }

  .mobile-info {
    padding: 4px;
  }

  .mobile-badge {
    font-size: 0.6rem !important;
    padding: 1px 3px !important;
  }

  .mobile-model-name {
    font-size: 0.65rem !important;
  }

  .card-footer {
    padding: 0.25rem !important;
    position: sticky;
    bottom: 0;
    z-index: 150;
    background: rgba(248, 249, 250, 0.98) !important;
    backdrop-filter: blur(4px);
    border-top: 2px solid #007bff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* Ajustes para telas muito pequenas */
@media (max-width: 420px) {
  .mobile-nav-buttons {
    gap: 2px !important;
  }

  .nav-btn {
    min-width: 28px !important;
    height: 26px;
    font-size: 11px;
    padding: 1px 4px;
  }

  .mobile-select {
    max-width: 55px !important;
    min-width: 50px !important;
    height: 26px;
    font-size: 11px;
    margin: 0 2px !important;
  }

  .mobile-badge {
    font-size: 0.55rem !important;
    padding: 1px 2px !important;
  }

  .mobile-model-name {
    font-size: 0.6rem !important;
  }
}

/* Estilos para SVG */
.svg-container-responsive {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* Estilos específicos para navegação mobile */
.mobile-navigation {
  background: rgba(248, 249, 250, 0.95);
  border-radius: 6px;
  padding: 8px;
  margin: 4px 0;
  border: 1px solid #dee2e6;
}

.mobile-nav-buttons {
  background: white;
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-btn {
  min-width: 36px !important;
  height: 32px;
  font-weight: bold;
  font-size: 14px;
  padding: 4px 8px;
}

.mobile-select {
  max-width: 90px !important;
  min-width: 75px !important;
  height: 32px;
  font-size: 13px;
}

.mobile-info {
  background: white;
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mobile-badge {
  font-size: 0.65rem !important;
  padding: 2px 4px !important;
}

.mobile-badges {
  margin-bottom: 4px;
}

.mobile-model-name {
  font-size: 0.7rem !important;
  line-height: 1.2;
}

@media (max-width: 767.98px) {
  .svg-container-responsive {
    min-height: 180px;
    padding: 0.5rem;
  }

  .card-body {
    padding: 0.5rem !important;
  }

  .card-footer {
    padding: 0.5rem !important;
    position: relative;
    z-index: 100;
    background: #f8f9fa !important;
    border-top: 2px solid #dee2e6;
  }
}

@media (max-width: 575.98px) {
  .svg-container-responsive {
    min-height: 150px;
    padding: 0.25rem;
  }

  .mobile-navigation {
    margin: 2px -2px;
    padding: 6px;
  }

  .mobile-nav-buttons {
    gap: 2px !important;
    justify-content: space-between;
  }

  .nav-btn {
    min-width: 32px !important;
    height: 26px;
    font-size: 11px;
    padding: 1px 4px;
  }

  .mobile-select {
    max-width: 70px !important;
    min-width: 60px !important;
    height: 26px;
    font-size: 11px;
    margin: 0 4px !important;
  }

  .mobile-info {
    padding: 4px;
  }

  .mobile-badge {
    font-size: 0.6rem !important;
    padding: 1px 3px !important;
  }

  .mobile-model-name {
    font-size: 0.65rem !important;
  }

  .card-footer {
    padding: 0.25rem !important;
    position: sticky;
    bottom: 0;
    z-index: 150;
    background: rgba(248, 249, 250, 0.98) !important;
    backdrop-filter: blur(4px);
    border-top: 2px solid #007bff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* Ajustes para telas muito pequenas */
@media (max-width: 420px) {
  .mobile-nav-buttons {
    gap: 2px !important;
  }

  .nav-btn {
    min-width: 28px !important;
    height: 26px;
    font-size: 11px;
    padding: 1px 4px;
  }

  .mobile-select {
    max-width: 55px !important;
    min-width: 50px !important;
    height: 26px;
    font-size: 11px;
    margin: 0 2px !important;
  }

  .mobile-badge {
    font-size: 0.55rem !important;
    padding: 1px 2px !important;
  }

  .mobile-model-name {
    font-size: 0.6rem !important;
  }
}

/* Estilos para SVG */
.svg-container-responsive {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* Estilos específicos para navegação mobile */
.mobile-navigation {
  background: rgba(248, 249, 250, 0.95);
  border-radius: 6px;
  padding: 8px;
  margin: 4px 0;
  border: 1px solid #dee2e6;
}

.mobile-nav-buttons {
  background: white;
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-btn {
  min-width: 36px !important;
  height: 32px;
  font-weight: bold;
  font-size: 14px;
  padding: 4px 8px;
}

.mobile-select {
  max-width: 90px !important;
  min-width: 75px !important;
  height: 32px;
  font-size: 13px;
}

.mobile-info {
  background: white;
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mobile-badge {
  font-size: 0.65rem !important;
  padding: 2px 4px !important;
}

.mobile-badges {
  margin-bottom: 4px;
}

.mobile-model-name {
  font-size: 0.7rem !important;
  line-height: 1.2;
}

@media (max-width: 767.98px) {
  .svg-container-responsive {
    min-height: 180px;
    padding: 0.5rem;
  }

  .card-body {
    padding: 0.5rem !important;
  }

  .card-footer {
    padding: 0.5rem !important;
    position: relative;
    z-index: 100;
    background: #f8f9fa !important;
    border-top: 2px solid #dee2e6;
  }
}

@media (max-width: 575.98px) {
  .svg-container-responsive {
    min-height: 150px;
    padding: 0.25rem;
  }

  .mobile-navigation {
    margin: 2px -2px;
    padding: 6px;
  }

  .mobile-nav-buttons {
    gap: 2px !important;
    justify-content: space-between;
  }

  .nav-btn {
    min-width: 32px !important;
    height: 26px;
    font-size: 11px;
    padding: 1px 4px;
  }

  .mobile-select {
    max-width: 70px !important;
    min-width: 60px !important;
    height: 26px;
    font-size: 11px;
    margin: 0 4px !important;
  }

  .mobile-info {
    padding: 4px;
  }

  .mobile-badge {
    font-size: 0.6rem !important;
    padding: 1px 3px !important;
  }

  .mobile-model-name {
    font-size: 0.65rem !important;
  }

  .card-footer {
    padding: 0.25rem !important;
    position: sticky;
    bottom: 0;
    z-index: 150;
    background: rgba(248, 249, 250, 0.98) !important;
    backdrop-filter: blur(4px);
    border-top: 2px solid #007bff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* Ajustes para telas muito pequenas */
@media (max-width: 420px) {
  .mobile-nav-buttons {
    gap: 2px !important;
  }

  .nav-btn {
    min-width: 28px !important;
    height: 26px;
    font-size: 11px;
    padding: 1px 4px;
  }

  .mobile-select {
    max-width: 55px !important;
    min-width: 50px !important;
    height: 26px;
    font-size: 11px;
    margin: 0 2px !important;
  }

  .mobile-badge {
    font-size: 0.55rem !important;
    padding: 1px 2px !important;
  }

  .mobile-model-name {
    font-size: 0.6rem !important;
  }
}
</style>