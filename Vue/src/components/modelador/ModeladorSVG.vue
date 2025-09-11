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
            <DimensoesBasicas
              :config-armazem="configArmazem"
              @armazem-change="onArmazemChange"
              @dimensoes-alteradas="onDimensoesAlteradas" />

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
            @voltar-preview="voltarParaPreview" @resetar-posicoes-manual="resetarPosicoesManual" />



          <!-- Gerenciador de Configurações (Banco de Dados) -->
          <GerenciadorModelosBanco :tipo-ativo="tipoAtivo" :quantidade-modelos-arcos="quantidadeModelosArcos"
            :modelos-arcos="modelosArcos" :modelos-salvos="modelosSalvos" :config-silo="configSilo"
            :config-armazem="configArmazem" @configuracao-carregada="carregarConfiguracaoDoBanco"
            @mostrar-toast="mostrarToast" @resetar-apos-salvamento-banco="resetarTudoAposSalvamentoBanco" />

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
                <h6 class="mb-2 mb-md-1">
                  Preview - {{ tipoAtivo === 'silo' ? 'Silo' : `${modeloArcoAtual ? `EDITANDO:
                  ${modelosArcos[modeloArcoAtual]?.nome || 'Modelo ' + modeloArcoAtual}` : 'Visualização Geral'}` }}
                  <span v-if="dadosVindosDoPreview" class="badge bg-success ms-2"
                    title="Dados carregados do preview do Armazém">
                    📊 PREVIEW
                  </span>
                </h6>
                <div class="d-flex align-items-center">
                  <small v-if="tipoAtivo === 'armazem'" class="text-white-50 me-3">
                    {{ modeloArcoAtual ?
                      `${quantidadeModelosArcos === 1 ? 'Modelo Único' : modelosArcos[modeloArcoAtual]?.posicao || ''} |
                    ${modeloArcoAtual}/${quantidadeModelosArcos}` :
                      `${determinarModeloParaArco(arcoAtual)?.nome || 'Padrão'} | ${quantidadeModelosArcos}
                    modelo${quantidadeModelosArcos > 1 ? 's' : ''}`
                    }}
                  </small>
                  <!-- Componente de Imagem de Fundo -->
                  <ImagemFundo
                    :container-dimensions="containerDimensions"
                    :imagem-inicial="imagemFundoData"
                    :tipo-ativo="tipoAtivo"
                    @imagem-mudou="onImagemFundoMudou"
                    @mostrar-toast="mostrarToast"
                  />
                </div>
              </div>
            </div>

            <div class="card-body text-center d-flex align-items-center justify-content-center p-1 p-md-2" :style="{
              height: isMobile ? 'auto' : 'calc(100vh - 280px)',
              overflow: isMobile ? 'visible' : 'auto',
              minHeight: isMobile ? '300px' : '350px',
              maxHeight: isMobile ? 'none' : 'calc(100vh - 280px)',
              paddingTop: '30px'
            }">
              <div class="svg-container-responsive w-100 position-relative">
                <!-- Renderização condicional baseada no tipo -->
                <template v-if="tipoAtivo === 'silo'">
                  <!-- Container da imagem de fundo para Silo -->
                  <div v-if="imagemFundoData.url"
                       class="position-absolute d-flex align-items-center justify-content-center"
                       :style="{
                         top: '0',
                         left: '0',
                         width: '100%',
                         height: '100%',
                         zIndex: 1,
                         overflow: 'hidden',
                         borderRadius: '4px'
                       }">
                    <img
                      :src="imagemFundoData.url"
                      :style="{
                        position: 'relative',
                        left: imagemFundoData.x + 'px',
                        top: imagemFundoData.y + 'px',
                        transform: `scale(${imagemFundoData.scale})`,
                        transformOrigin: 'center center',
                        opacity: imagemFundoData.opacity,
                        maxWidth: 'none',
                        maxHeight: 'none',
                        userSelect: 'none',
                        pointerEvents: 'none',
                        transition: 'all 0.3s ease-in-out'
                      }">
                  </div>

                  <!-- SVG Silo com transparência se houver imagem de fundo -->
                  <svg :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`" :style="{
                    width: '100%',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: isMobile ? '60vh' : 'calc(100vh - 320px)',
                    minHeight: isMobile ? '200px' : '250px',
                    border: '1px solid #ddd',
                    backgroundColor: imagemFundoData.url ? 'transparent' : '#f8f9fa',
                    borderRadius: '4px',
                    shapeRendering: 'geometricPrecision',
                    textRendering: 'geometricPrecision',
                    imageRendering: 'optimizeQuality',
                    position: 'relative',
                    zIndex: 2,
                    opacity: imagemFundoData.url ? 0.85 : 1
                  }" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" v-html="svgContentComFundo">
                  </svg>
                </template>

                <!-- Componente Armazem para Armazém -->
                <template v-else>
                  <!-- Container da imagem de fundo para Armazém -->
                  <div v-if="imagemFundoData.url"
                       class="position-absolute d-flex align-items-center justify-content-center"
                       :style="{
                         top: '0',
                         left: '0',
                         width: '100%',
                         height: '100%',
                         zIndex: 1,
                         overflow: 'hidden',
                         borderRadius: '4px'
                       }">
                    <img
                      :src="imagemFundoData.url"
                      :style="{
                        position: 'relative',
                        left: imagemFundoData.x + 'px',
                        top: imagemFundoData.y + 'px',
                        transform: `scale(${imagemFundoData.scale})`,
                        transformOrigin: 'center center',
                        opacity: imagemFundoData.opacity,
                        maxWidth: 'none',
                        maxHeight: 'none',
                        userSelect: 'none',
                        pointerEvents: 'none',
                        transition: 'all 0.3s ease-in-out'
                      }">
                  </div>

                  <!-- ArmazemSvg com transparência se houver imagem de fundo -->
                  <div :style="{
                    position: 'relative',
                    zIndex: 2,
                    opacity: imagemFundoData.url ? imagemFundoData.opacity : 1,
                    transition: 'opacity 0.3s ease-in-out',
                    width: '100%',
                    height: '100%',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }">
                    <Armazem
                      :config="configArmazemParaComponente"
                      :dados-sensores="dados"
                      :modelo-atual="modeloAtualParaComponente"
                      :dimensoes-personalizadas="dimensoesPersonalizadasParaComponente"
                      :imagem-fundo="imagemFundoData"
                      @dimensoes-atualizadas="onDimensoesAtualizadas"
                      @dimensoes-aplicadas="onDimensoesAplicadas"
                      @salvar-dimensoes-modelo="onSalvarDimensoesModelo"
                      @posicao-pendulo-alterada="onPosicaoPenduloAlterada"
                      @posicao-sensor-alterada="onPosicaoSensorAlterada"
                      style="width: 100%; height: 100%; min-height: 400px;"
                    />
                  </div>
                </template>
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

import ImagemFundo from './compModelador/ImagemFundo.vue'
import Armazem from './compModelador/ArmazemSvg.vue'
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
    GerenciadorConfiguracoes,

    ImagemFundo,
    Armazem
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
        hf: 6,
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

      // Variáveis de modelagem individual removidas - não utilizadas

      // Estados para drag and drop
      isDragging: false,
      dragElement: null,
      dragType: null, // 'pendulo' ou 'sensor'
      dragOffset: { x: 0, y: 0 },
      posicoesManualPendulos: {},
      posicoesManualSensores: {},
      saveTimeout: null, // Para debounce do salvamento

      // NOVOS ESTADOS REATIVOS ADICIONADOS PARA CORREÇÃO DE ERRO
      modelosAtualizados: false, // Indica se houve alterações nos modelos que precisam ser salvas
      modelosConfigurados: {}, // Armazena configurações de modelos individuais
      quantidadeEsperada: 1, // Quantidade esperada de modelos
      temConfigGlobal: true, // Flag para indicar se há configuração global
      modelos: {}, // Armazena os dados dos modelos

      // Dados da imagem de fundo gerenciados pelo componente filho
      imagemFundoData: {
        url: null,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0.3
      },
      // Armazenar dados de imagem separados por tipo
      imagensFundoPorTipo: {
        silo: {
          url: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.3
        },
        armazem: {
          url: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.3
        }
      },

      // Estados para edição de modelos do banco
      modoEdicaoModeloBanco: false,
      modeloBancoEmEdicao: null
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
    },
    svgContentComFundo() {
      // Se há imagem de fundo, adicionar fundo transparente ao SVG
      if (this.imagemFundoData.url && this.svgContent) {
        // Adicionar retângulo de fundo semi-transparente para melhor visualização
        const fundoTransparente = `<rect x="0" y="0" width="${this.larguraSVG}" height="${this.alturaSVG}" fill="rgba(248, 249, 250, 0.1)" />`
        return fundoTransparente + this.svgContent
      }
      return this.svgContent
    },
    containerDimensions() {
      return {
        width: '100%',
        height: '100%'
      }
    },

    // Configuração preparada para o componente ArmazemSvg
    configArmazemParaComponente() {
      const config = this.configPreviewAplicada || this.configArmazem

      // Preparar configuração completa incluindo dados do modelo atual
      const configCompleta = {
        ...config,
        // Dados específicos do modelo se estiver editando
        quantidadePendulos: this.modeloArcoAtual ?
          (this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3) : 3,
        sensoresPorPendulo: this.modeloArcoAtual ?
          (this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {}) : {},

        // Posições manuais dos pêndulos e sensores (drag and drop)
        posicoesManualPendulos: { ...this.posicoesManualPendulos },
        posicoesManualSensores: { ...this.posicoesManualSensores },

        // Posições dos cabos (sistema antigo de compatibilidade)
        posicoesCabos: { ...this.posicoesCabos },

        // Dados do modelo específico se disponível
        modeloEspecifico: this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual] ? {
          quantidadePendulos: this.modelosArcos[this.modeloArcoAtual].quantidadePendulos || 3,
          sensoresPorPendulo: this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo || {},
          posicoesPendulos: this.posicoesManualPendulos,
          alturasSensores: this.construirAlturasSensores(this.posicoesManualPendulos, this.posicoesManualSensores, this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo), // Chamada para o novo método
          configuracaoGlobal: {
            escala_sensores: config.escala_sensores || 16,
            dist_y_sensores: config.dist_y_sensores || 12,
            dist_x_sensores: config.dist_x_sensores || 0,
            posicao_horizontal: config.posicao_horizontal || 0,
            posicao_vertical: config.posicao_vertical || 0,
            afastamento_vertical_pendulo: config.afastamento_vertical_pendulo || 0
          }
        } : null
      }

      return configCompleta
    },

    // Modelo atual preparado para o componente
    modeloAtualParaComponente() {
      if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
        return {
          quantidadePendulos: this.modelosArcos[this.modeloArcoAtual].quantidadePendulos || 3,
          sensoresPorPendulo: this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo || {},
          configuracao: this.modelosArcos[this.modeloArcoAtual].config || {}
        }
      }

      // Usar modelo determinado para o arco atual
      const modeloParaArco = this.determinarModeloParaArco(this.arcoAtual)
      if (modeloParaArco) {
        return {
          quantidadePendulos: modeloParaArco.quantidadePendulos || 3,
          sensoresPorPendulo: modeloParaArco.sensoresPorPendulo || {},
          configuracao: modeloParaArco.config || {}
        }
      }

      return {
        quantidadePendulos: 3,
        sensoresPorPendulo: { 1: 4, 2: 3, 3: 5 },
        configuracao: {}
      }
    },

    // Dimensões personalizadas se necessário
    dimensoesPersonalizadasParaComponente() {
      // Sempre retornar null para deixar o ArmazemSvg calcular suas próprias dimensões
      return null
    }
  },
  created() {
    // Inicialização sem debounce
  },

  mounted() {
    // LIMPEZA AUTOMÁTICA NA INICIALIZAÇÃO - Remove posições salvas para começar limpo
    this.limparPosicoesInicializacao()

    this.resetarModelosParaPadrao()

    // Verificar se dados vieram do preview antes de carregar da API
    this.verificarDadosArcoRecebidos()

    // Carregar dados apenas se não vieram do preview
    if (!this.dadosVindosDoPreview) {
      this.carregarDadosAPI()
    }

    this.carregarModelosDoBanco()

    // NÃO carregar posições temporárias na inicialização - sempre começar limpo
    // this.carregarPosicoesTemporarias()

    this.inicializarPosicoesCabos()
    this.updateSVG()

    // Adicionar event listeners para drag and drop
    this.$nextTick(() => {
      this.adicionarEventListeners()
    })
  },

  beforeDestroy() {
    // Cleanup dos event listeners
    this.removerEventListeners()

    // Limpar timeout de salvamento se existir
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
  },
  watch: {
    'configArmazem.tipo_fundo': {
      handler(novoTipo) {
        this.configArmazem.deslocamento_vertical_fundo = this.obterDeslocamentoVerticalPadrao(novoTipo)
      }
    },
    tipoAtivo: {
      handler(novoTipo, tipoAnterior) {
        // Salvar imagem do tipo anterior
        if (tipoAnterior && this.imagemFundoData.url) {
          this.imagensFundoPorTipo[tipoAnterior] = { ...this.imagemFundoData }
        }
        // Carregar imagem do novo tipo
        this.imagemFundoData = { ...this.imagensFundoPorTipo[novoTipo] }
      }
    },
    dados: {
      handler() {
        if (this.tipoAtivo === 'armazem' && this.dados) {
          // Aguardar um pouco mais para garantir que o SVG foi renderizado
          setTimeout(() => {
            this.adicionarEventListeners()
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

              console.log('Dados recebidos do preview do armazém foram carregados com sucesso.')
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

        // Implementação da API para Silo (exemplo)
        const response = await fetch('URL_DA_SUA_API_AQUI', {
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_AQUI',
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

    onDimensoesAlteradas(data) {
      console.log('📐 [ModeladorSVG] Dimensões alteradas:', data)

      // Forçar atualização do SVG
      this.updateSVG()

      // Se estiver editando um modelo, salvar as alterações
      if (this.modeloArcoAtual) {
        // Garantir que as dimensões sejam salvas no modelo
        this.modelosArcos[this.modeloArcoAtual].config = { ...this.configArmazem }

        // Salvar modelo completo para persistir as dimensões
        this.salvarModeloAtualCompleto()

        console.log('💾 [ModeladorSVG] Dimensões salvas no modelo:', {
          modelo: this.modeloArcoAtual,
          dimensoes: {
            pb: this.configArmazem.pb,
            lb: this.configArmazem.lb,
            hb: this.configArmazem.hb,
            hf: this.configArmazem.hf,
            lf: this.configArmazem.lf,
            le: this.configArmazem.le,
            ht: this.configArmazem.ht
          }
        })
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
        // Carregar configuração do modelo selecionado (sem resetar para padrão)
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



    salvarModeloAtual() {
      if (!this.modeloArcoAtual) {
        this.mostrarToast('Selecione um modelo para salvar!', 'warning')
        return
      }

      this.salvarModeloAtualCompleto()

      // FIXO: NÃO resetar configurações após salvar para preservar dimensões do usuário
      // Comentado para preservar dimensões configuradas pelo usuário
      // this.resetarConfigArmParaPadrao()

      this.mostrarToast(`Modelo ${this.modeloArcoAtual} (${this.modelosArcos[this.modeloArcoAtual]?.nome}) salvo com sucesso!`, 'success')
    },

    // Método para resetar apenas as posições visuais após salvamento no banco
    resetarTudoAposSalvamentoBanco() {
      console.log('🔄 [resetarTudoAposSalvamentoBanco] Iniciando reset visual após salvamento no banco')

      // FIXO CRÍTICO: NÃO resetar as dimensões configuradas pelo usuário
      // Preservar as dimensões atuais do armazém que foram configuradas pelo usuário
      const dimensoesPreservadas = {
        pb: this.configArmazem.pb, // Preservar Profundidade Base
        lb: this.configArmazem.lb, // CRÍTICO: Preservar LarguraBase configurada pelo usuário
        hb: this.configArmazem.hb, // Preservar Altura Base
        hf: this.configArmazem.hf, // Preservar Altura Fundo
        lf: this.configArmazem.lf, // Preservar Largura Fundo
        le: this.configArmazem.le, // Preservar Largura Entre
        ht: this.configArmazem.ht, // Preservar Altura Topo - alturaTopo
        // Preservar também outras configurações importantes do telhado
        tipo_telhado: this.configArmazem.tipo_telhado,
        curvatura_topo: this.configArmazem.curvatura_topo,
        pontas_redondas: this.configArmazem.pontas_redondas,
        raio_pontas: this.configArmazem.raio_pontas,
        estilo_laterais: this.configArmazem.estilo_laterais,
        curvatura_laterais: this.configArmazem.curvatura_laterais,
        tipo_fundo: this.configArmazem.tipo_fundo
      }

      console.log('💾 [resetarTudoAposSalvamentoBanco] Preservando dimensões configuradas:', dimensoesPreservadas)

      // 1. Resetar configuração do armazém MANTENDO as dimensões configuradas pelo usuário
      this.configArmazem = {
        // Preservar dimensões configuradas pelo usuário
        ...dimensoesPreservadas,
        // Resetar apenas configurações que podem ser restauradas para padrão sem impactar o salvamento
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

      // 2. Resetar modelos de arcos VISUAL para padrão (mantendo dados salvos no localStorage)
      // IMPORTANTE: Usar as dimensões preservadas para criar o modelo visual
      this.quantidadeModelosArcos = 1
      this.modelosArcos = {
        1: {
          posicao: 'todos',
          config: { ...this.configArmazem }, // Agora contém as dimensões preservadas
          nome: 'Modelo Único',
          quantidadePendulos: 3,
          sensoresPorPendulo: {
            1: 4, 2: 3, 3: 5
          }
        }
      }

      // 3. Limpar apenas estado de edição VISUAL
      this.modeloArcoAtual = null
      this.modelosSalvos = {}

      // 4. Limpar posições e configurações personalizadas VISUAIS
      this.posicoesCabos = {}
      this.caboSelecionadoPosicionamento = null
      this.modelagemIndividualAtiva = false
      this.penduloSelecionado = 1
      this.posicoesPendulosIndividuais = {}
      this.posicoesSensoresIndividuais = {}
      this.ajustesGlobaisSensores = { horizontal: 0, vertical: 0 }
      this.dadosPreviewDesvinculados = null

      // 5. Limpar posições manuais de drag and drop VISUAIS
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}

      // 6. Limpar configurações de preview VISUAIS
      this.configuracaoPreviewSelecionada = ''
      this.configPreviewAplicada = null
      this.configuracaoAplicada = null

      // 7. IMPORTANTE: NÃO limpar localStorage - manter dados dos modelos salvos para o banco
      console.log('💾 [resetarTudoAposSalvamentoBanco] PRESERVANDO localStorage com dados dos modelos para banco')

      // 8. Regenerar dados exemplares com configuração padrão
      this.criarDadosExemplaresArmazem()

      // 9. Atualizar SVG
      this.updateSVG()

      console.log('✅ [resetarTudoAposSalvamentoBanco] Reset visual finalizado - DIMENSÕES PRESERVADAS:', {
        'LarguraBase (lb)': this.configArmazem.lb,
        'AlturaTopo (ht)': this.configArmazem.ht,
        'dimensões completas': dimensoesPreservadas
      })
    },

    salvarModeloAtualCompleto() {
      if (!this.modeloArcoAtual) return

      console.log(`💾 [salvarModeloAtualCompleto] Salvando modelo ${this.modeloArcoAtual} COM posições manuais`)

      // Criar configuração consolidada do modelo atual com todas as configurações preservadas
      const configuracaoModelo = {
        // Dados básicos do modelo
        nome: this.modelosArcos[this.modeloArcoAtual]?.nome || `Modelo ${this.modeloArcoAtual}`,
        posicao: this.modelosArcos[this.modeloArcoAtual]?.posicao || 'todos',
        quantidadePendulos: this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3,
        sensoresPorPendulo: { ...this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {} },

        // IMPORTANTE: Preservar TODAS as configurações do armazém incluindo telhado e dimensões
        // Dimensões básicas - GARANTIR que sejam preservadas
        pb: this.configArmazem.pb || 185,
        lb: this.configArmazem.lb || 350, // CRÍTICO: Largura base deve ser preservada
        hb: this.configArmazem.hb || 30,
        hf: this.configArmazem.hf || 6,
        lf: this.configArmazem.lf || 250,
        le: this.configArmazem.le || 15,
        ht: this.configArmazem.ht || 50,

        // 🎯 CRÍTICO: Preservar dimensões calculadas se existirem
        dimensoesSvgFundo: this.configArmazem.dimensoesSvgFundo ? {
          largura: this.configArmazem.dimensoesSvgFundo.largura || this.configArmazem.lb || 350,
          altura: this.configArmazem.dimensoesSvgFundo.altura || 300,
          baseadoEm: this.configArmazem.dimensoesSvgFundo.baseadoEm || 'calculo_otimizado',
          calculadoEm: this.configArmazem.dimensoesSvgFundo.calculadoEm || new Date().toISOString()
        } : {
          largura: this.configArmazem.lb || 350,
          altura: 300,
          baseadoEm: 'config_padrao',
          calculadoEm: new Date().toISOString()
        },

        // CRÍTICO: Configurações do telhado devem ser preservadas
        tipo_telhado: this.configArmazem.tipo_telhado,
        curvatura_topo: this.configArmazem.curvatura_topo,
        pontas_redondas: this.configArmazem.pontas_redondas,
        raio_pontas: this.configArmazem.raio_pontas,
        estilo_laterais: this.configArmazem.estilo_laterais,
        curvatura_laterais: this.configArmazem.curvatura_laterais,

        // Configurações do fundo
        tipo_fundo: this.configArmazem.tipo_fundo,
        altura_fundo_reto: this.configArmazem.altura_fundo_reto,
        altura_funil_v: this.configArmazem.altura_funil_v,
        posicao_ponta_v: this.configArmazem.posicao_ponta_v,
        inclinacao_funil_v: this.configArmazem.inclinacao_funil_v,
        largura_abertura_v: this.configArmazem.largura_abertura_v,
        altura_duplo_v: this.configArmazem.altura_duplo_v,
        posicao_v_esquerdo: this.configArmazem.posicao_v_esquerdo,
        posicao_v_direito: this.configArmazem.posicao_v_direito,
        largura_abertura_duplo_v: this.configArmazem.largura_abertura_duplo_v,
        altura_plataforma_duplo_v: this.configArmazem.altura_plataforma_duplo_v,
        largura_plataforma_duplo_v: this.configArmazem.largura_plataforma_duplo_v,
        deslocamento_horizontal_fundo: this.configArmazem.deslocamento_horizontal_fundo,
        deslocamento_vertical_fundo: this.configArmazem.deslocamento_vertical_fundo,

        // Configurações dos sensores
        escala_sensores: this.configArmazem.escala_sensores,
        dist_y_sensores: this.configArmazem.dist_y_sensores,
        dist_x_sensores: this.configArmazem.dist_x_sensores,
        posicao_horizontal: this.configArmazem.posicao_horizontal,
        posicao_vertical: this.configArmazem.posicao_vertical,
        afastamento_vertical_pendulo: this.configArmazem.afastamento_vertical_pendulo,

        // CRÍTICO: Sistema de posições completo para compatibilidade com ArmazemComponente
        // Posição dos cabos separados (sistema antigo - compatibilidade)
        posicoesCabos: { ...this.posicoesCabos },

        // NOVO: Posições manuais dos pêndulos e sensores via drag and drop
        posicoesManualPendulos: { ...this.posicoesManualPendulos },
        posicoesManualSensores: { ...this.posicoesManualSensores },

        // CRÍTICO: Estrutura v6.1 compatível com exemplo fornecido
        modeloEspecifico: {
          quantidadePendulos: this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3,
          sensoresPorPendulo: { ...this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {} },

          // Posições dos pêndulos seguindo formato do exemplo fornecido
          posicoesPendulos: Object.keys(this.posicoesManualPendulos || {}).length > 0
            ? Object.keys(this.posicoesManualPendulos).reduce((acc, penduloNum) => {
                const pos = this.posicoesManualPendulos[penduloNum]
                acc[penduloNum] = {
                  x: pos.x || 0,
                  y: pos.y || 0,
                  altura: 0,
                  offsetX: pos.offsetX || 0,
                  offsetY: pos.offsetY || 0,
                  timestampAlteracao: pos.timestampAlteracao || Date.now()
                }
                return acc
              }, {})
            : {},

          // CRÍTICO: Salvar posições manuais dos sensores
          posicoesManualSensores: { ...this.posicoesManualSensores },

          // Alturas dos sensores com posições detalhadas
          alturasSensores: (() => {
            const resultado = this.construirAlturasSensores(
              this.posicoesManualPendulos,
              this.posicoesManualSensores,
              this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo
            )
            return resultado.alturasSensores || {}
          })(),

          // Configuração global
          configuracaoGlobal: {
            escala_sensores: this.configArmazem.escala_sensores || 16,
            dist_y_sensores: this.configArmazem.dist_y_sensores || 12,
            dist_x_sensores: this.configArmazem.dist_x_sensores || 0,
            posicao_horizontal: this.configArmazem.posicao_horizontal || 0,
            posicao_vertical: this.configArmazem.posicao_vertical || 0,
            afastamento_vertical_pendulo: this.configArmazem.afastamento_vertical_pendulo || 0
          }
        },

        // Estado adicional
        caboSelecionadoPosicionamento: this.caboSelecionadoPosicionamento,
        timestampSalvamento: new Date().toISOString(),
        versaoModelo: '6.1', // Compatível com formato do exemplo fornecido
        validado: true
      }

      console.log(`📊 [salvarModeloAtualCompleto] Configuração completa sendo salva:`, {
        dimensoesBasicas: {
          pb: configuracaoModelo.pb,
          lb: configuracaoModelo.lb,
          hb: configuracaoModelo.hb,
          hf: configuracaoModelo.hf,
          lf: configuracaoModelo.lf,
          le: configuracaoModelo.le,
          ht: configuracaoModelo.ht
        },
        telhado: {
          tipo: configuracaoModelo.tipo_telhado,
          curvatura: configuracaoModelo.curvatura_topo,
          pontas_redondas: configuracaoModelo.pontas_redondas,
          raio_pontas: configuracaoModelo.raio_pontas,
          estilo_laterais: configuracaoModelo.estilo_laterais,
          curvatura_laterais: configuracaoModelo.curvatura_laterais
        },
        fundo: {
          tipo: configuracaoModelo.tipo_fundo,
          altura_fundo_reto: configuracaoModelo.altura_fundo_reto,
          altura_funil_v: configuracaoModelo.altura_funil_v,
          altura_duplo_v: configuracaoModelo.altura_duplo_v
        },
        posicoesManuais: {
          pendulos: Object.keys(configuracaoModelo.posicoesManualPendulos || {}).length,
          sensores: Object.keys(configuracaoModelo.posicoesManualSensores || {}).length
        }
      })

      // Atualizar o modelo local com as posições manuais
      if (!this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos) {
        this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos = {}
      }
      if (!this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores) {
        this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores = {}
      }

      this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos = { ...this.posicoesManualPendulos }
      this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores = { ...this.posicoesManualSensores }
      this.modelosArcos[this.modeloArcoAtual].timestampSalvamento = configuracaoModelo.timestampSalvamento

      // Salvar usando o serviço simplificado
      const { configuracaoService } = require('./services/configuracaoService')
      const resultado = configuracaoService.salvarModeloIndividual(this.modeloArcoAtual, configuracaoModelo)

      if (resultado.success) {
        this.modelosSalvos[this.modeloArcoAtual] = true
        console.log(`✅ [salvarModeloAtualCompleto] Modelo ${this.modeloArcoAtual} salvo no localStorage COM posições manuais:`, {
          pendulosComPosicao: Object.keys(this.posicoesManualPendulos).length,
          sensoresComPosicao: Object.keys(this.posicoesManualSensores).length
        })
      } else {
        console.error(`❌ [salvarModeloAtualCompleto] Erro ao salvar modelo ${this.modeloArcoAtual}:`, resultado.message)
      }
    },

    limparVariaveisParaNovoModelo() {
      console.log('🧹 [limparVariaveisParaNovoModelo] Limpando variáveis para começar novo modelo')

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

      // Limpar posições manuais de drag and drop
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}

      // Limpar configurações de preview aplicadas
      this.configPreviewAplicada = null
      this.configuracaoAplicada = null

      console.log('✅ [limparVariaveisParaNovoModelo] Variáveis limpas - pronto para novo modelo')
    },

    // Método para limpar apenas dados temporários do localStorage (OPCIONAL - apenas se necessário)
    limparLocalStorageTemporario() {
      try {
        console.log('🧹 [limparLocalStorageTemporario] Limpando apenas dados temporários')

        // Limpar apenas configurações temporárias - NÃO tocar nos modelos salvos
        const chavesTempParaLimpar = [
          'posicoesManualTemp',
          'configuracaoTemporaria',
          'estadoModeloAtivo',
          'alteracoesPendentes'
        ]

        chavesTempParaLimpar.forEach(chave => {
          if (localStorage.getItem(chave)) {
            localStorage.removeItem(chave)
            console.log(`🗑️ [limparLocalStorageTemporario] Removido temporário: ${chave}`)
          }
        })

        // Limpar apenas chaves que começam com prefixos temporários
        const prefixosTemporarios = ['temp_', 'preview_']
        const todasChaves = Object.keys(localStorage)

        todasChaves.forEach(chave => {
          prefixosTemporarios.forEach(prefixo => {
            if (chave.startsWith(prefixo)) {
              localStorage.removeItem(chave)
              console.log(`🗑️ [limparLocalStorageTemporario] Removido prefixo temporário ${prefixo}: ${chave}`)
            }
          })
        })

        console.log('✅ [limparLocalStorageTemporario] Limpeza temporária concluída - modelos preservados')
      } catch (error) {
        console.error('❌ [limparLocalStorageTemporario] Erro ao limpar temporários:', error)
      }
    },

    resetarConfigArmParaPadrao() {
      console.log('🔄 [resetarConfigArmParaPadrao] PRESERVANDO dimensões configuradas pelo usuário')

      // FIXO CRÍTICO: Preservar as dimensões atuais configuradas pelo usuário
      const dimensoesAtuaisPreservadas = {
        pb: this.configArmazem.pb, // Preservar Profundidade Base
        lb: this.configArmazem.lb, // CRÍTICO: Preservar LarguraBase
        hb: this.configArmazem.hb, // Preservar Altura Base
        hf: this.configArmazem.hf, // Preservar Altura Fundo
        lf: this.configArmazem.lf, // Preservar Largura Fundo
        le: this.configArmazem.le, // Preservar Largura Entre
        ht: this.configArmazem.ht, // Preservar Altura Topo
        // Preservar configurações do telhado também
        tipo_telhado: this.configArmazem.tipo_telhado,
        curvatura_topo: this.configArmazem.curvatura_topo,
        pontas_redondas: this.configArmazem.pontas_redondas,
        raio_pontas: this.configArmazem.raio_pontas,
        estilo_laterais: this.configArmazem.estilo_laterais,
        curvatura_laterais: this.configArmazem.curvatura_laterais,
        tipo_fundo: this.configArmazem.tipo_fundo
      }

      // Resetar configuração do armazém MANTENDO as dimensões principais
      this.configArmazem = {
        // Preservar dimensões configuradas pelo usuário
        ...dimensoesAtuaisPreservadas,
        // Resetar apenas configurações secundárias
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

      // Atualizar SVG com valores atualizados (mas dimensões preservadas)
      this.updateSVG()

      console.log('✅ [resetarConfigArmParaPadrao] Configuração resetada PRESERVANDO dimensões:', {
        'LarguraBase (lb)': this.configArmazem.lb,
        'AlturaTopo (ht)': this.configArmazem.ht,
        'dimensões preservadas': dimensoesAtuaisPreservadas
      })
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

      // NOVO: Carregar posições manuais dos pêndulos e sensores
      this.posicoesManualPendulos = { ...modelo.posicoesManualPendulos || {} }
      this.posicoesManualSensores = { ...modelo.posicoesManualSensores || {} }

      console.log(`📍 [carregarConfiguracaoModelo] Posições manuais carregadas:`, {
        pendulos: Object.keys(this.posicoesManualPendulos).length,
        sensores: Object.keys(this.posicoesManualSensores).length
      })

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

        // NOVO: Restaurar posições manuais do estado completo (prioridade sobre modelo base)
        if (modelo.estadoCompleto.posicoesManualPendulos) {
          this.posicoesManualPendulos = { ...modelo.estadoCompleto.posicoesManualPendulos }
        }
        if (modelo.estadoCompleto.posicoesManualSensores) {
          this.posicoesManualSensores = { ...modelo.estadoCompleto.posicoesManualSensores }
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
      if (typeof localStorage !== 'undefined') {
        try {
          const estadoModelos = {
            quantidadeModelos: this.quantidadeModelosArcos,
            modelosArcos: this.modelosArcos,
            modelosSalvos: this.modelosSalvos,
            modeloAtual: this.modeloArcoAtual,
            posicoesCabos: this.posicoesCabos,
            timestamp: new Date().toISOString()
          }
          localStorage.setItem('estadoModelosArcos', JSON.stringify(estadoModelos))
        } catch (error) {
          console.error('Erro ao salvar modelos:', error)
        }
      }
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
        hf: 6,
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
          },
          // GARANTIR que posições estejam limpas
          posicoesManualPendulos: {},
          posicoesManualSensores: {},
          posicoesCabos: {}
        }
      }
      this.modeloArcoAtual = null
      this.modelosSalvos = {}
      this.caboSelecionadoPosicionamento = null
      this.posicoesCabos = {}

      // GARANTIR que variáveis globais estejam limpas
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}
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
        `💡 Cada modelofoi restaurado com todas as configurações originais!`,
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

    // Método mantido para compatibilidade com o silo, mas agora apenas para silo
    // Método removido - funcionalidade migrada para ArmazemSvg.vue

    updateSVG() {
      // Não atualizar SVG durante drag para evitar sobrescrever posições
      if (this.isDragging) {
        console.log('⚠️ updateSVG bloqueado durante drag para preservar posições')
        return
      }

      this.calcularDimensoesSVG()
      this.generateSVG()

      // Se há dados de sensores, readicionar event listeners após renderização
      if (this.tipoAtivo === 'armazem' && this.dados) {
        this.$nextTick(() => {
          setTimeout(() => {
            // Readicionar event listeners após regeneração do SVG
            this.adicionarEventListeners()
          }, 100)
        })
      }
    },

    calcularDimensoesSVG() {
      if (this.tipoAtivo === 'silo') {
        this.larguraSVG = this.configSilo.lb + (this.configSilo.aeradores_ativo ? this.configSilo.ds * 2 + 68 : 0)
        this.alturaSVG = this.configSilo.hs + this.configSilo.hb * 1.75
      } else {
        // Para armazém, não calcular dimensões aqui - deixar o ArmazemSvg gerenciar completamente
        // Apenas manter valores padrão mínimos para compatibilidade
        this.larguraSVG = 400
        this.alturaSVG = 300
      }
    },

    generateSVG() {
      if (this.tipoAtivo === 'silo') {
        this.svgContent = this.renderSilo()
      }
      // Para armazém, o SVG é renderizado inteiramente pelo componente ArmazemSvg
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

    // Métodos de renderização removidos - funcionalidade migrada para ArmazemSvg.vue

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

    // Método removido - funcionalidade migrada para ArmazemSvg.vue

    // Funções para controle de pêndulos
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
          sensoresPorPendulo[i] = sensoresExistentes ||3
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

      // Regenerar layouts automáticos com a nova estrutura
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

      // Forçar atualização dos dados exemplares com a nova configuração de sensores
      this.atualizarDadosExemplaresComNovaSensorConfig(numero, totalPendulos)

      // Regenerar layouts
      this.regenerarLayoutsAutomaticos()

      // Salvar e atualizar
      this.salvarModelosAutomatico()
      this.updateSVG()

      this.mostrarToast(`Aplicado ${numero} sensores uniformemente para todos os ${totalPendulos} pêndulos!`, 'success')
    },

    // Métodos para controle de sensores por pêndulo (compatibilidade)
    // Métodos de controle de sensores não utilizados removidos

    // Métodos de controle individual de sensores removidos - não utilizados

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

        Object.keys(dados.sistemaModelos.modelosDefinidos).forEach(key => {
          const modeloSalvo = dados.sistemaModelos.modelosDefinidos[key]
          novosModelos[key] = {
            ...modeloSalvo,
            config: modeloSalvo.configuracao || {}, // Usar 'configuracao' da v4.0
            quantidadePendulos: modeloSalvo.quantidadePendulos || 3,
            sensoresPorPendulo: modeloSalvo.sensoresPorPendulo || {},
            posicoesCabos: modeloSalvo.posicoesCabos || {},
            // NOVO: Restaurar posições manuais dos pêndulos e sensores
            posicoesManualPendulos: modeloSalvo.posicoesManualPendulos || {},
            posicoesManualSensores: modeloSalvo.posicoesManualSensores || {},
            // Restaurar estado completo se disponível
            estadoCompleto: modeloSalvo.estadoCompleto || null,
            timestampSalvamento: modeloSalvo.timestampUltimaEdicao || new Date().toISOString(),
            versaoModelo: modeloSalvo.metadados?.versaoModelo || '4.0'
          }
          novosSalvos[key] = modeloSalvo.status === 'salvo'
        })

        this.modelosArcos = novosModelos
        this.modelosSalvos = novosSalvos
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
        `💡 Cada modelofoi restaurado com todas as configurações originais!`,
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
            posicoesCabos: modelo.posicoesCabos || {},
            // NOVO: Restaurar posições manuais se existirem
            posicoesManualPendulos: modelo.posicoesManualPendulos || {},
            posicoesManualSensores: modelo.posicoesManualSensores || {}
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
    },

    // MÉTODOS PARA COMUNICAÇÃO COM COMPONENTE IMAGEM DE FUNDO
    onImagemFundoMudou(novaImagemData) {
      // Atualizar dados locais quando o componente filho emitir mudanças
      this.imagemFundoData = { ...novaImagemData }
      // Salvar também na storage por tipo
      this.imagensFundoPorTipo[this.tipoAtivo] = { ...novaImagemData }
      console.log(`Dados da imagem de fundo atualizados para ${this.tipoAtivo}:`, this.imagemFundoData)
    },

    // MÉTODOS PARA COMUNICAÇÃO COM COMPONENTE ARMAZEM SVG
    onDimensoesAtualizadas(novasDimensoes) {
      console.log('📐 [ModeladorSVG] Dimensões atualizadas pelo ArmazemSvg:', novasDimensoes)
      // Não interferir - deixar o ArmazemSvg gerenciar suas próprias dimensões
    },

    onDimensoesAplicadas(dimensoesAplicadas) {
      console.log('📐 [ModeladorSVG] Dimensões aplicadas pelo ArmazemSvg:', dimensoesAplicadas)

      // Se as dimensões vieram do banco de dados, salvar na configuração
      if (dimensoesAplicadas.origem === 'banco_dados') {
        this.larguraSVG = dimensoesAplicadas.largura
        this.alturaSVG = dimensoesAplicadas.altura

        // Salvar na configuração atual se estiver editando um modelo
        if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
          this.modelosArcos[this.modeloArcoAtual].config.dimensoesSvgFundo = {
            largura: dimensoesAplicadas.largura,
            altura: dimensoesAplicadas.altura,
            baseadoEm: 'banco_dados'
          }
          this.salvarModelosAutomatico()
        }
      }
    },

    // 🎯 NOVO MÉTODO: Handler para salvar dimensões calculadas no modelo com sincronização garantida
    onSalvarDimensoesModelo(dimensoesCalculadas) {
      console.log('📐 [ModeladorSVG] Salvando dimensões calculadas no modelo (SINCRONIZADO):', dimensoesCalculadas)

      // 🔒 ORDEM CRÍTICA: Atualizar dimensões locais PRIMEIRO
      const larguraAnterior = this.larguraSVG
      const alturaAnterior = this.alturaSVG
      const lbAnterior = this.configArmazem.lb

      this.larguraSVG = dimensoesCalculadas.largura
      this.alturaSVG = dimensoesCalculadas.altura

      // 🎯 CRÍTICO: Sincronizar lb imediatamente
      if (dimensoesCalculadas.largura && dimensoesCalculadas.largura !== this.configArmazem.lb) {
        console.log(`🔧 [SINCRONIZAÇÃO CRÍTICA] Atualizando lb: ${this.configArmazem.lb} → ${dimensoesCalculadas.largura}`)
        this.configArmazem.lb = dimensoesCalculadas.largura
      }

      // 🔒 Salvar na configuração global com marcação de sincronização
      this.configArmazem.dimensoesSvgFundo = {
        largura: dimensoesCalculadas.largura,
        altura: dimensoesCalculadas.altura,
        baseadoEm: dimensoesCalculadas.baseadoEm || 'calculo_sincronizado',
        calculadoEm: dimensoesCalculadas.calculadoEm || new Date().toISOString(),
        sincronizadoEm: new Date().toISOString(),
        configLbAtualizado: dimensoesCalculadas.configLbAtualizado || false
      }

      // 🎯 CRÍTICO: Se estiver editando um modelo específico, garantir sincronização completa
      if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
        // Atualizar TODAS as dimensões no modelo de forma sincronizada
        this.modelosArcos[this.modeloArcoAtual].config = {
          ...this.modelosArcos[this.modeloArcoAtual].config,
          lb: dimensoesCalculadas.largura, // CRÍTICO: Sincronizar lb
          dimensoesSvgFundo: {
            largura: dimensoesCalculadas.largura,
            altura: dimensoesCalculadas.altura,
            baseadoEm: dimensoesCalculadas.baseadoEm || 'calculo_sincronizado',
            calculadoEm: dimensoesCalculadas.calculadoEm || new Date().toISOString(),
            sincronizadoEm: new Date().toISOString()
          }
        }

        console.log('💾 [SINCRONIZAÇÃO MODELO] Salvando com dimensões sincronizadas:', {
          modelo: this.modeloArcoAtual,
          alteracoes: {
            larguraSVG: `${larguraAnterior} → ${this.larguraSVG}`,
            alturaSVG: `${alturaAnterior} → ${this.alturaSVG}`,
            configLb: `${lbAnterior} → ${this.configArmazem.lb}`,
            modeloLb: this.modelosArcos[this.modeloArcoAtual].config.lb
          },
          dimensoesSalvas: this.modelosArcos[this.modeloArcoAtual].config.dimensoesSvgFundo
        })

        // Salvar modelo completo para persistir as dimensões sincronizadas
        this.salvarModeloAtualCompleto()
      }

      // Salvar automaticamente com dados sincronizados
      this.salvarModelosAutomatico()

      console.log('✅ [SINCRONIZAÇÃO COMPLETA] Dimensões salvas e sincronizadas:', {
        dimensoes: {
          largura: dimensoesCalculadas.largura,
          altura: dimensoesCalculadas.altura
        },
        sincronizacao: {
          larguraSVG: this.larguraSVG,
          alturaSVG: this.alturaSVG,
          configLb: this.configArmazem.lb,
          modeloLb: this.modeloArcoAtual ? this.modelosArcos[this.modeloArcoAtual].config.lb : 'N/A'
        },
        modeloAtual: this.modeloArcoAtual
      })
    },



    // MÉTODOS PARA DRAG AND DROP
    adicionarEventListeners() {
      if (this.tipoAtivo !== 'armazem') return

      this.$nextTick(() => {
        // Remover listeners existentes primeiro
        this.removerEventListeners()

        // Aguardar um pouco para garantir que o SVG foi completamente renderizado
        setTimeout(() => {
          // Adicionar listeners para TODOS os elementos dos pêndulos (fundo + texto)
          this.adicionarListenersPendulos()

          // Adicionar listeners para TODOS os elementos dos sensores (fundo + texto + nome)
          this.adicionarListenersSensores()

          // Listeners globais para movimento e release (apenas se não existirem)
          if (!document.dragListenersAdded) {
            document.addEventListener('mousemove', this.continuarDrag)
            document.addEventListener('mouseup', this.finalizarDrag)
            document.dragListenersAdded = true
          }

          console.log('🎯 Event listeners adicionados com sucesso')
        }, 50)
      })
    },

    adicionarListenersPendulos() {
      // Capturar tanto o fundo (rect) quanto o texto dos pêndulos
      const elementosPendulos = document.querySelectorAll('[id^="C"]:not([id*="S"]), [id^="TC"]:not([id*="S"])')

      elementosPendulos.forEach(elemento => {
        const id = elemento.id

        // Verificar se é elemento de pêndulo (C1, C2... ou TC1, TC2...)
        const matchPendulo = id.match(/^(T?C)(\d+)$/)
        if (matchPendulo) {
          const numeroPendulo = parseInt(matchPendulo[2])

          elemento.style.cursor = 'grab'
          elemento.addEventListener('mousedown', (e) => this.iniciarDragPendulo(e, numeroPendulo))
          elemento.setAttribute('title', `Clique e arraste para mover o pêndulo ${numeroPendulo} inteiro`)

          // Adicionar classe para identificação
          elemento.classList.add('pendulo-draggable')
        }
      })
    },

    adicionarListenersSensores() {
      // Capturar fundo, texto e nome dos sensores
      const elementosSensores = document.querySelectorAll('[id^="C"][id*="S"], [id^="TC"][id*="S"], [id^="TIND"][id*="S"]')

      elementosSensores.forEach(elemento => {
        const id = elemento.id
        let numeroPendulo, numeroSensor

        // Identificar pêndulo e sensor dos diferentes elementos
        let matchSensor = id.match(/^C(\d+)S(\d+)$/)  // C1S2 (fundo)
        if (!matchSensor) {
          matchSensor = id.match(/^TC(\d+)S(\d+)$/)   // TC1S2 (texto valor)
        }
        if (!matchSensor) {
          matchSensor = id.match(/^TIND(\d+)S(\d+)$/) // TIND1S2 (texto nome)
        }

        if (matchSensor) {
          numeroPendulo = parseInt(matchSensor[1])
          numeroSensor = parseInt(matchSensor[2])

          elemento.style.cursor = 'grab'
          elemento.addEventListener('mousedown', (e) => this.iniciarDragSensor(e, numeroPendulo, numeroSensor))
          elemento.setAttribute('title', `Clique e arraste para mover apenas o sensor ${numeroSensor} do pêndulo ${numeroPendulo}`)

          // Adicionar classe para identificação
          elemento.classList.add('sensor-draggable')
        }
      })
    },

    removerEventListeners() {
      // Remover listeners de todos os elementos arrastáveis
      const elementosArrastaveis = document.querySelectorAll('.pendulo-draggable, .sensor-draggable')
      elementosArrastaveis.forEach(elemento => {
        // Remover todos os event listeners mousedown
        const novoElemento = elemento.cloneNode(true)
        if (elemento.parentNode) {
          elemento.parentNode.replaceChild(novoElemento, elemento)
        }
      })

      // Remover classes antigas
      const elementosComClasse = document.querySelectorAll('.pendulo-draggable, .sensor-draggable')
      elementosComClasse.forEach(elemento => {
        elemento.classList.remove('pendulo-draggable', 'sensor-draggable')
      })

      // Remover listeners globais apenas uma vez
      if (document.dragListenersAdded) {
        document.removeEventListener('mousemove', this.continuarDrag)
        document.removeEventListener('mouseup', this.finalizarDrag)
        document.dragListenersAdded = false
      }
    },

    iniciarDragPendulo(event, numeroPendulo) {
      event.preventDefault()
      event.stopPropagation()

      console.log(`🎯 Iniciando drag do pêndulo ${numeroPendulo}`)

      this.isDragging = true
      this.dragType = 'pendulo'
      this.dragElement = numeroPendulo

      // Calcular offset do mouse em relação ao SVG
      const svg = event.target.closest('svg')
      const svgRect = svg.getBoundingClientRect()
      const mouseX = event.clientX - svgRect.left
      const mouseY = event.clientY - svgRect.top

      // Converter para coordenadas do SVG
      const svgPoint = this.converterParaCoordenadaSVG(svg, mouseX, mouseY)

      // Encontrar elemento principal do pêndulo (rect) para pegar posição
      const elementoPrincipal = document.getElementById(`C${numeroPendulo}`)
      if (elementoPrincipal) {
        const penduloX = parseFloat(elementoPrincipal.getAttribute('x')) || 0
        const penduloY = parseFloat(elementoPrincipal.getAttribute('y')) || 0

        this.dragOffset = {
          x: svgPoint.x - (penduloX + (parseFloat(elementoPrincipal.getAttribute('width')) || 0) / 2),
          y: svgPoint.y - (penduloY + (parseFloat(elementoPrincipal.getAttribute('height')) || 0) / 2)
        }
      } else {
        this.dragOffset = { x: 0, y: 0 }
      }

      // Alterar cursor de todos os elementos do pêndulo
      const elementosPendulo = document.querySelectorAll(`[id^="C${numeroPendulo}"], [id^="TC${numeroPendulo}"]`)
      elementosPendulo.forEach(el => {
        if (!el.id.includes('S')) { // Apenas elementos do pêndulo, não sensores
          el.style.cursor = 'grabbing'
        }
      })
    },

    iniciarDragSensor(event, numeroPendulo, numeroSensor) {
      event.preventDefault()
      event.stopPropagation()

      console.log(`🎯 Iniciando drag do sensor ${numeroSensor} do pêndulo ${numeroPendulo}`)

      this.isDragging = true
      this.dragType = 'sensor'
      this.dragElement = { pendulo: numeroPendulo, sensor: numeroSensor }

      // Calcular offset do mouse em relação ao SVG
      const svg = event.target.closest('svg')
      const svgRect = svg.getBoundingClientRect()
      const mouseX = event.clientX - svgRect.left
      const mouseY = event.clientY - svgRect.top

      // Converter para coordenadas do SVG
      const svgPoint = this.converterParaCoordenadaSVG(svg, mouseX, mouseY)

      // Encontrar elemento principal do sensor (rect) para pegar posição
      const elementoPrincipal = document.getElementById(`C${numeroPendulo}S${numeroSensor}`)
      if (elementoPrincipal) {
        const sensorX = parseFloat(elementoPrincipal.getAttribute('x')) || 0
        const sensorY = parseFloat(elementoPrincipal.getAttribute('y')) || 0

        this.dragOffset = {
          x: svgPoint.x - (sensorX + (parseFloat(elementoPrincipal.getAttribute('width')) || 0) / 2),
          y: svgPoint.y - (sensorY + (parseFloat(elementoPrincipal.getAttribute('height')) || 0) / 2)
        }
      } else {
        this.dragOffset = { x: 0, y: 0 }
      }

      // Alterar cursor de todos os elementos do sensor
      const elementosSensor = document.querySelectorAll(`[id*="C${numeroPendulo}S${numeroSensor}"], [id*="TC${numeroPendulo}S${numeroSensor}"], [id*="TIND${numeroPendulo}S${numeroSensor}"]`)
      elementosSensor.forEach(el => {
        el.style.cursor = 'grabbing'
      })
    },

    continuarDrag(event) {
      if (!this.isDragging) return

      event.preventDefault()

      // Encontrar o SVG correto dentro do container do preview
      const previewContainer = document.querySelector('.svg-container-responsive')
      if (!previewContainer) return

      const svg = previewContainer.querySelector('svg')
      if (!svg) return

      const svgRect = svg.getBoundingClientRect()
      const mouseX = event.clientX - svgRect.left
      const mouseY = event.clientY - svgRect.top

      // Converter para coordenadas do SVG
      const svgPoint = this.converterParaCoordenadaSVG(svg, mouseX, mouseY)

      // Calcular nova posição
      const novaX = svgPoint.x - this.dragOffset.x
      const novaY = svgPoint.y - this.dragOffset.y

      if (this.dragType === 'pendulo') {
        this.moverPenduloCompletoSemUpdate(this.dragElement, novaX, novaY)
      } else if (this.dragType === 'sensor') {
        this.moverSensorIndividualSemUpdate(this.dragElement.pendulo, this.dragElement.sensor, novaX, novaY)
      }
    },

    finalizarDrag(event) {
      if (!this.isDragging) return

      console.log(`✅ Finalizando drag do ${this.dragType}`)

      const elementoMovido = this.dragElement
      const tipoMovido = this.dragType

      this.isDragging = false
      this.dragType = null
      this.dragElement = null
      this.dragOffset = { x: 0, y: 0 }

      // Restaurar cursor para todos os elementos arrastáveis
      const elementosArrastaveis = document.querySelectorAll('.pendulo-draggable, .sensor-draggable')
      elementosArrastaveis.forEach(el => {
        el.style.cursor = 'grab'
      })

      // REMOVIDO: updateSVG() aqui - estava causando o bug de voltar ao padrão
      // As posições já foram aplicadas diretamente no DOM durante o movimento

      // IMPORTANTE: Readicionar event listeners após finalizar drag
      this.$nextTick(() => {
        setTimeout(() => {
          this.adicionarEventListeners()
        }, 100)
      })

      // Debounced save - salvar apenas após parar de mover por um tempo
      this.debouncedSalvarPosicoes(elementoMovido, tipoMovido)
    },

    // Implementar debounce para salvamento
    debouncedSalvarPosicoes(elementoMovido, tipoMovido) {
      // Cancelar salvamento anterior se existir
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout)
      }

      // Agendar novo salvamento após 300ms de inatividade
      this.saveTimeout = setTimeout(() => {
        console.log(`💾 Salvando posições após movimento de ${tipoMovido}:`, elementoMovido)

        // Salvar posições no modelo atual se estiver editando
        if (this.modeloArcoAtual) {
          this.salvarPosicoesNoModelo()
        }

        // IMPORTANTE: Não chamar updateSVG() aqui para preservar as posições
        // As posições já foram aplicadas no DOM e salvas nos dados

        this.saveTimeout = null
      }, 300)
    },

    converterParaCoordenadaSVG(svg, mouseX, mouseY) {
      const viewBox = svg.getAttribute('viewBox')
      if (!viewBox) return { x: mouseX, y: mouseY }

      const [minX, minY, width, height] = viewBox.split(' ').map(Number)
      const svgRect = svg.getBoundingClientRect()

      const scaleX = width / svgRect.width
      const scaleY = height / svgRect.height

      return {
        x: minX + mouseX * scaleX,
        y: minY + mouseY * scaleY
      }
    },

    moverPenduloCompleto(numeroPendulo, novaX, novaY) {
      this.moverPenduloCompletoSemUpdate(numeroPendulo, novaX, novaY)
      // Não chamar updateSVG() aqui - as posições já foram aplicadas no DOM
      // updateSVG() será chamado apenas quando necessário (ex: reset, mudança de configuração)
    },

    moverPenduloCompletoSemUpdate(numeroPendulo, novaX, novaY) {
      // Salvar posição manual do pêndulo
      if (!this.posicoesManualPendulos[numeroPendulo]) {
        this.posicoesManualPendulos[numeroPendulo] = { x: 0, y: 0 }
      }

      // Calcular diferença da posição original
      const posicaoOriginal = this.calcularPosicaoOriginalPendulo(numeroPendulo)
      this.posicoesManualPendulos[numeroPendulo].x = novaX - posicaoOriginal.x
      this.posicoesManualPendulos[numeroPendulo].y = novaY - posicaoOriginal.y

      // Atualizar posições de todos os sensores deste pêndulo junto
      const sensoresCount = this.obterQuantidadeSensoresPendulo(numeroPendulo)
      for (let s = 1; s <= sensoresCount; s++) {
        const chaveSensor = `${numeroPendulo}-${s}`
        if (!this.posicoesManualSensores[chaveSensor]) {
          this.posicoesManualSensores[chaveSensor] = { x: 0, y: 0 }
        }
        // Mover sensores junto com o pêndulo
        this.posicoesManualSensores[chaveSensor].x = this.posicoesManualPendulos[numeroPendulo].x
        this.posicoesManualSensores[chaveSensor].y = this.posicoesManualPendulos[numeroPendulo].y
      }

      // Atualizar elementos DOM diretamente para feedback visual imediato
      this.atualizarElementosDOMDiretamente(numeroPendulo)
    },

    moverSensorIndividual(numeroPendulo, numeroSensor, novaX, novaY) {
      this.moverSensorIndividualSemUpdate(numeroPendulo, numeroSensor, novaX, novaY)
      // Não chamar updateSVG() aqui - as posições já foram aplicadas no DOM
      // updateSVG() será chamado apenas quando necessário (ex: reset, mudança de configuração)
    },

    moverSensorIndividualSemUpdate(numeroPendulo, numeroSensor, novaX, novaY) {
      const chaveSensor = `${numeroPendulo}-${numeroSensor}`

      if (!this.posicoesManualSensores[chaveSensor]) {
        this.posicoesManualSensores[chaveSensor] = { x: 0, y: 0 }
      }

      // Calcular diferença da posição original
      const posicaoOriginal = this.calcularPosicaoOriginalSensor(numeroPendulo, numeroSensor)
      this.posicoesManualSensores[chaveSensor].x = novaX - posicaoOriginal.x
      this.posicoesManualSensores[chaveSensor].y = novaY - posicaoOriginal.y
      this.posicoesManualSensores[chaveSensor].timestampAlteracao = Date.now()

      console.log(`📍 [moverSensorIndividual] Sensor ${chaveSensor} movido:`, {
        novaX,
        novaY,
        offsetX: this.posicoesManualSensores[chaveSensor].x,
        offsetY: this.posicoesManualSensores[chaveSensor].y,
        posicaoOriginal
      })

      // Atualizar elemento DOM diretamente para feedback visual imediato
      this.atualizarSensorDOMDiretamente(numeroPendulo, numeroSensor)
    },

    atualizarElementosDOMDiretamente(numeroPendulo) {
      // Atualizar posição do pêndulo diretamente no DOM para feedback visual
      const posicaoOriginal = this.calcularPosicaoOriginalPendulo(numeroPendulo)
      const offsetX = this.posicoesManualPendulos[numeroPendulo]?.x || 0
      const offsetY = this.posicoesManualPendulos[numeroPendulo]?.y || 0

      const novaX = posicaoOriginal.x + offsetX
      const novaY = posicaoOriginal.y + offsetY

      // Encontrar índice do pêndulo (começa em 1, mas DOM usa índice baseado em 0)
      const indicePendulo = numeroPendulo
      const escala_sensores = (this.configPreviewAplicada || this.configArmazem).escala_sensores || 16

      // Atualizar pêndulo principal
      const elementoPendulo = document.getElementById(`C${indicePendulo}`)
      const textoElementoPendulo = document.getElementById(`TC${indicePendulo}`)

      if (elementoPendulo) {
        elementoPendulo.setAttribute('x', novaX - escala_sensores / 2)
        elementoPendulo.setAttribute('y', novaY)
      }
      if (textoElementoPendulo) {
        textoElementoPendulo.setAttribute('x', novaX)
        textoElementoPendulo.setAttribute('y', novaY + escala_sensores / 4)
      }

      // Atualizar sensores deste pêndulo
      const sensoresCount = this.obterQuantidadeSensoresPendulo(numeroPendulo)
      for (let s = 1; s <= sensoresCount; s++) {
        this.atualizarSensorDOMDiretamente(numeroPendulo, s)
      }
    },

    atualizarSensorDOMDiretamente(numeroPendulo, numeroSensor) {
      const posicaoOriginalSensor = this.calcularPosicaoOriginalSensor(numeroPendulo, numeroSensor)
      const chaveSensor = `${numeroPendulo}-${numeroSensor}`
      const offsetX = this.posicoesManualSensores[chaveSensor]?.x || 0
      const offsetY = this.posicoesManualSensores[chaveSensor]?.y || 0

      const novaX = posicaoOriginalSensor.x + offsetX
      const novaY = posicaoOriginalSensor.y + offsetY

      const indicePendulo = numeroPendulo
      const escala_sensores = (this.configPreviewAplicada || this.configArmazem).escala_sensores || 16

      // Atualizar elementos do sensor
      const elementoSensor = document.getElementById(`C${indicePendulo}S${numeroSensor}`)
      const textoSensor = document.getElementById(`TC${indicePendulo}S${numeroSensor}`)
      const nomeSensor = document.getElementById(`TIND${indicePendulo}S${numeroSensor}`)

      if (elementoSensor) {
        elementoSensor.setAttribute('x', novaX - escala_sensores / 2)
        elementoSensor.setAttribute('y', novaY)
      }
      if (textoSensor) {
        textoSensor.setAttribute('x', novaX)
        textoSensor.setAttribute('y', novaY + escala_sensores / 4)
      }
      if (nomeSensor) {
        nomeSensor.setAttribute('x', novaX - escala_sensores / 2 - 2)
        nomeSensor.setAttribute('y', novaY + escala_sensores / 4)
      }
    },

    calcularPosicaoOriginalPendulo(numeroPendulo) {
      // 🎯 USAR MESMA LÓGICA DE DISTRIBUIÇÃO DO ArmazemSvg.vue
      const config = this.configPreviewAplicada || this.configuracaoAplicada || this.configArmazem
      const pb = (config.pb || this.alturaSVG - 50) + (this.alturaSVG < 300 ? 0 : 50)
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0

      const yPendulo = pb + 15 + posicao_vertical

      // 🎯 DISTRIBUIÇÃO DINÂMICA IGUAL ArmazemSvg.vue
      const arcoInfo = this.analiseArcos?.arcos[this.arcoAtual]
      if (!arcoInfo) return { x: 0, y: yPendulo }

      const totalCabos = arcoInfo.pendulos.length
      const larguraTotal = config.lb || this.larguraSVG || 350
      const margemLateral = 35  // EXATAMENTE igual ArmazemSvg
      const larguraUtilizavel = larguraTotal - (2 * margemLateral)

      let xCabo
      if (totalCabos === 1) {
        xCabo = larguraTotal / 2
      } else {
        const espacamento = larguraUtilizavel / (totalCabos - 1)
        xCabo = margemLateral + ((numeroPendulo - 1) * espacamento)
      }

      return { x: xCabo + posicao_horizontal, y: yPendulo }
    },

    calcularPosicaoOriginalSensor(numeroPendulo, numeroSensor) {
      const posicaoPendulo = this.calcularPosicaoOriginalPendulo(numeroPendulo)
      const config = this.configPreviewAplicada || this.configuracaoAplicada || this.configArmazem
      const dist_y_sensores = config.dist_y_sensores || 12
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      const ySensor = posicaoPendulo.y - dist_y_sensores * numeroSensor - 25 - afastamento_vertical_pendulo

      return { x: posicaoPendulo.x, y: ySensor }
    },

    obterQuantidadeSensoresPendulo(numeroPendulo) {
      const modeloAtual = this.determinarModeloParaArco(this.arcoAtual)
      if (modeloAtual?.sensoresPorPendulo) {
        return modeloAtual.sensoresPorPendulo[numeroPendulo] || 1
      }

      // Fallback: tentar obter dos dados atuais
      if (this.dados?.leitura?.[numeroPendulo]) {
        return Object.keys(this.dados.leitura[numeroPendulo]).length
      }

      return 1
    },

    salvarPosicoesNoModelo() {
      if (!this.modeloArcoAtual) {
        console.warn('⚠️ Nenhum modelo selecionado para salvar posições')
        return
      }

      console.log('💾 [salvarPosicoesNoModelo] Iniciando salvamento das posições', {
        modelo: this.modeloArcoAtual,
        posicoesManualPendulos: this.posicoesManualPendulos,
        posicoesManualSensores: this.posicoesManualSensores,
        totalSensores: Object.keys(this.posicoesManualSensores).length
      })

      // Salvar posições manuais no modelo atual
      if (!this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos) {
        this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos = {}
      }
      if (!this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores) {
        this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores = {}
      }

      this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos = { ...this.posicoesManualPendulos }
      this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores = { ...this.posicoesManualSensores }

      console.log('📊 [salvarPosicoesNoModelo] Posições salvas no modelo:', {
        pendulosNoModelo: Object.keys(this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos).length,
        sensoresNoModelo: Object.keys(this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores).length
      })

      // 1. Salvar no preview local (estado atual)
      this.salvarNoPreviewLocal()

      // 2. Salvar no localStorage
      this.salvarModelosAutomatico()

      // 3. Salvar no banco de dados
      this.salvarModeloAtualCompleto()

      console.log('💾 Posições manuais salvas em todas as camadas:', {
        modelo: this.modeloArcoAtual,
        pendulos: this.posicoesManualPendulos,
        sensores: this.posicoesManualSensores,
        totalPendulos: Object.keys(this.posicoesManualPendulos).length,
        totalSensores: Object.keys(this.posicoesManualSensores).length
      })
    },

    salvarNoPreviewLocal() {
      // Salvar estado atual no componente para uso imediato
      const estadoAtual = {
        posicoesManualPendulos: { ...this.posicoesManualPendulos },
        posicoesManualSensores: { ...this.posicoesManualSensores },
        modeloArcoAtual: this.modeloArcoAtual,
        timestamp: Date.now()
      }

      // Salvar temporariamente no localStorage para persistir entre recarregamentos
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('posicoesManualTemp', JSON.stringify(estadoAtual))
          console.log('💾 [salvarNoPreviewLocal] Posições salvas temporariamente no localStorage')
        } catch (error) {
          console.error('❌ Erro ao salvar posições temporariamente:', error)
        }
      }
    },

    resetarPosicoesManual() {
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}

      if (this.modeloArcoAtual) {
        this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos = {}
        this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores = {}
        this.salvarModelosAutomatico()
      }

      // Limpar localStorage temporário
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('posicoesManualTemp')
      }

      // Regenerar SVG para aplicar o reset
      this.updateSVG()
      this.mostrarToast('Posições manuais resetadas!', 'success')
    },

    // 🎯 NOVO MÉTODO: Limpeza automática apenas na inicialização
    limparPosicoesInicializacao() {
      console.log('🧹 [limparPosicoesInicializacao] Limpando posições para inicialização limpa')

      // Limpar posições manuais de drag and drop
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}

      // Limpar localStorage de posições temporárias
      if (typeof localStorage !== 'undefined') {
        try {
          // Remover apenas dados de posições temporárias - preservar outros dados importantes
          localStorage.removeItem('posicoesManualTemp')

          // Limpar posições salvas nos modelos (apenas para inicialização limpa)
          Object.keys(this.modelosArcos || {}).forEach(modeloKey => {
            if (this.modelosArcos[modeloKey]) {
              this.modelosArcos[modeloKey].posicoesManualPendulos = {}
              this.modelosArcos[modeloKey].posicoesManualSensores = {}
            }
          })

          console.log('✅ [limparPosicoesInicializacao] Posições limpas - ModeladorSVG iniciará organizado')
        } catch (error) {
          console.error('❌ Erro ao limpar posições na inicialização:', error)
        }
      }
    },

    carregarPosicoesTemporarias() {
      if (typeof localStorage === 'undefined') return

      try {
        const posicoesTemp = localStorage.getItem('posicoesManualTemp')
        if (posicoesTemp) {
          const estadoSalvo = JSON.parse(posicoesTemp)

          // Verificar se o estado é recente (menos de 1 hora)
          const agora = Date.now()
          const umaHora = 60 * 60 * 1000

          if (agora - estadoSalvo.timestamp < umaHora) {
            this.posicoesManualPendulos = { ...estadoSalvo.posicoesManualPendulos }
            this.posicoesManualSensores = { ...estadoSalvo.posicoesManualSensores }

            console.log('💾 [carregarPosicoesTemporarias] Posições temporárias carregadas:', {
              pendulos: Object.keys(this.posicoesManualPendulos).length,
              sensores: Object.keys(this.posicoesManualSensores).length
            })
          } else {
            // Limpar dados antigos
            localStorage.removeItem('posicoesManualTemp')
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar posições temporárias:', error)
        localStorage.removeItem('posicoesManualTemp')
      }
    },

    // 🎯 NOVO MÉTODO: Construir alturas dos sensores para o modelo
    construirAlturasSensores(posicoesPendulos, posicoesSensores, sensoresPorPenduloConfig) {
      const alturasSensores = {}
      const posicoesManualSensores = {}
      const config = this.configPreviewAplicada || this.configuracaoAplicada || this.configArmazem
      const dist_y_sensores = config.dist_y_sensores || 12
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      if (!sensoresPorPenduloConfig) {
        console.warn('⚠️ [construirAlturasSensores] Configuração de sensores por pêndulo não encontrada.')
        return { alturasSensores, posicoesManualSensores }
      }

      // Iterar sobre cada pêndulo configurado
      Object.keys(sensoresPorPenduloConfig).forEach(penduloNum => {
        const numSensores = sensoresPorPenduloConfig[penduloNum] || 1
        const offsetPendulo = posicoesPendulos[penduloNum] || { x: 0, y: 0 }
        const offsetPenduloY = offsetPendulo.y || 0
        const offsetPenduloX = offsetPendulo.x || 0

        // Calcular altura de cada sensor dentro do pêndulo
        for (let s = 1; s <= numSensores; s++) {
          const chaveSensor = `${penduloNum}-${s}`
          const offsetSensor = posicoesSensores[chaveSensor] || { x: 0, y: 0 }

          // 🔧 CORRIGIDO: Manter espaçamento adequado entre sensores
          // Usar posição absoluta baseada na configuração visual, não compactar
          const yBasePendulo = config.pb + 10 + config.posicao_vertical || 0
          const ySensorBase = yBasePendulo - dist_y_sensores * s - 25 - afastamento_vertical_pendulo

          // Aplicar offsets manuais se existirem
          const alturaSensor = ySensorBase + offsetPenduloY + offsetSensor.y

          // Salvar altura do sensor
          alturasSensores[chaveSensor] = {
            altura: alturaSensor,
            posicaoX: offsetPenduloX + offsetSensor.x,
            posicaoY: ySensorBase + offsetSensor.y,
            pendulo: parseInt(penduloNum),
            sensor: s,
            timestampAlteracao: Date.now(),
            // 🎯 CRÍTICO: Manter referência do espaçamento original
            espacamentoOriginal: dist_y_sensores,
            yBase: ySensorBase
          }

          // CRÍTICO: Salvar posições manuais dos sensores no formato correto
          posicoesManualSensores[chaveSensor] = {
            x: offsetSensor.x,
            y: offsetSensor.y,
            pendulo: parseInt(penduloNum),
            sensor: s,
            timestampAlteracao: Date.now(),
            // Preservar informações de espaçamento
            espacamentoVertical: dist_y_sensores,
            posicaoRelativa: s
          }
        }
      })

      console.log('📊 [construirAlturasSensores] Dados construídos com espaçamento preservado:', {
        alturasSensores,
        posicoesManualSensores,
        totalSensores: Object.keys(alturasSensores).length,
        espacamentoUsado: dist_y_sensores
      })

      return { alturasSensores, posicoesManualSensores }
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