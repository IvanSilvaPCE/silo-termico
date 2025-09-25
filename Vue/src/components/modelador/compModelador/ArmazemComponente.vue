<template>
  <div class="container-fluid p-0" :style="{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  }">
    <div class="card" :style="{
      maxWidth: '90vw',
      maxHeight: '90vh',
      minHeight: '500px',
      width: '100%'
    }">
      <!-- Header com controles -->
      <div class="card-header text-white text-center" style="background-color: #06335E;">
        <h4 class="mb-0">Preview - Armazém</h4>
        <div class="row align-items-center mt-2">
          <div class="col-md-4">
            <small class="text-white-50">
              {{ getDescricaoConfiguracaoAtual() }}
            </small>
          </div>
          <div class="col-md-8">
            <div class="d-flex align-items-center">
              <select
                v-model="modeloSelecionado"
                @change="carregarModeloSelecionado"
                class="form-control form-control-sm me-2"
                :disabled="carregandoModelos"
                style="font-size: 0.8rem;">
                <option value="">{{ carregandoModelos ? 'Carregando...' : 'Selecione um modelo salvo' }}</option>
                <option v-for="modelo in modelosDisponiveis" :key="modelo.id_svg" :value="modelo.id_svg">
                  {{ modelo.nm_modelo }} - {{ getDescricaoModelo(modelo) }}
                </option>
              </select>
              <button
                @click="buscarModelosSalvos"
                class="btn btn-sm btn-outline-light me-2"
                :disabled="carregandoModelos"
                title="Atualizar lista">
                <i class="fa fa-refresh" :class="{ 'fa-spin': carregandoModelos }"></i>
              </button>
              <button
                v-if="modeloSelecionado"
                @click="limparModelo"
                class="btn btn-sm btn-outline-light me-2"
                title="Limpar seleção">
                ×
              </button>
              <button
                v-if="modeloCarregado"
                @click="salvarModeloNoServidor"
                class="btn btn-sm" style="background-color: #06335E; color: white;"
                title="Salvar alterações no servidor">
                <i class="fa fa-save"></i> Salvar
              </button>
            </div>
          </div>
        </div>

        <!-- Informações do modelo carregado -->
        <div v-if="modeloCarregado" class="row mt-2">
          <div class="col-12">
            <div class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
              <span class="badge text-white" style="background-color: #06335E;">
                {{ modeloCarregado.quantidadeModelos || 1 }} Modelo{{ (modeloCarregado.quantidadeModelos || 1) > 1 ? 's' : '' }}
              </span>
              <span class="badge bg-secondary text-white">
                {{ modeloCarregado.logica || 'Modelo Único' }}
              </span>
              <span v-if="modeloSincronizado" class="badge bg-success">
                Sincronizado: {{ modeloSincronizado.nome || 'Modelo' }}
              </span>
              <span v-else-if="modeloAtual" class="badge bg-warning">
                Editando: {{ modeloAtual.nome || 'Modelo' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 🎯 NOVA SEÇÃO: Informações dos dados reais da API -->
        <div v-if="analiseArcos" class="row mt-2">
          <div class="col-12">
            <div class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
              <span class="badge bg-info text-white">
                📊 Dados Reais: {{ analiseArcos.totalArcos }} Arcos
              </span>
              <span class="badge bg-primary text-white">
                Arco {{ arcoAtual }}: {{ analiseArcos.arcos[arcoAtual]?.totalPendulos || 0 }} Pêndulos
              </span>
              <span class="badge bg-dark text-white">
                {{ analiseArcos.arcos[arcoAtual]?.totalSensores || 0 }} Sensores
              </span>
            </div>
          </div>
        </div>

        <!-- 🎯 NOVA SEÇÃO: Status da sincronização -->
        <div v-if="carregandoDadosAPI || errorAPI" class="row mt-2">
          <div class="col-12">
            <div class="d-flex justify-content-center align-items-center">
              <span v-if="carregandoDadosAPI" class="badge bg-warning text-dark">
                🔄 Carregando dados da API...
              </span>
              <span v-else-if="errorAPI" class="badge bg-danger text-white">
                ❌ Erro API: {{ errorAPI }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Área do SVG (Componente Filho) -->
      <div class="card-body text-center d-flex align-items-center justify-content-center p-3" :style="{
        height: 'calc(90vh - 120px)',
        minHeight: '400px'
      }">
        <ArmazemSvg
          :config="configArmazemParaComponente"
          :dados-sensores="dadosSensoresSincronizados || dadosSensores"
          :modelo-atual="modeloAtualParaComponente"
          :dimensoes-personalizadas="dimensoesPersonalizadasParaComponente"
        />
      </div>

      <!-- 🎯 NOVA NAVEGAÇÃO: Navegação entre Arcos Reais -->
      <div v-if="analiseArcos && analiseArcos.totalArcos > 1" class="card-footer bg-info text-white p-2">
        <div class="row align-items-center">
          <div class="col-md-8">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start">
              <span class="me-2">📊 Dados Reais:</span>
              <button type="button" class="btn btn-outline-light btn-sm me-2"
                @click="mudarArco(arcoAtual - 1)" :disabled="arcoAtual <= 1"
                title="Arco anterior">
                ← Anterior
              </button>
              <select class="form-select form-select-sm mx-2" style="min-width: 150px; max-width: 200px;"
                v-model.number="arcoAtual" @change="mudarArco(arcoAtual)">
                <option v-for="numeroArco in analiseArcos.totalArcos" :key="numeroArco" :value="numeroArco">
                  Arco {{ numeroArco }} - {{ analiseArcos.arcos[numeroArco]?.totalPendulos || 0 }} pêndulos, {{ analiseArcos.arcos[numeroArco]?.totalSensores || 0 }} sensores
                </option>
              </select>
              <button type="button" class="btn btn-outline-light btn-sm ms-2"
                @click="mudarArco(arcoAtual + 1)" :disabled="arcoAtual >= analiseArcos.totalArcos"
                title="Próximo arco">
                Próximo →
              </button>
            </div>
          </div>
          <div class="col-md-4 text-center text-md-end">
            <div class="d-flex flex-wrap justify-content-center justify-content-md-end align-items-center gap-1">
              <span class="badge bg-light text-dark">
                {{ modeloCarregado?.quantidadeModelos === 1 ? 'Modelo Único' : `Modelo ${determinarIndiceModeloPara4Modelos(arcoAtual) + 1}/4` }}
              </span>
              <span class="badge bg-dark text-white">
                {{ dadosSensoresSincronizados ? 'Sincronizado' : 'Não Sincronizado' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navegação de Modelos -->
      <div v-if="modeloCarregado && modeloCarregado.quantidadeModelos > 1 && !analiseArcos" class="card-footer bg-light p-2">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start">
              <button type="button" class="btn btn-outline-primary btn-sm me-2"
                @click="navegarModelo(-1)" :disabled="modeloAtualIndex <= 0"
                title="Modelo anterior">
                ← Anterior
              </button>
              <select class="form-select form-select-sm mx-2" style="min-width: 120px; max-width: 180px;"
                v-model="modeloAtualIndex" @change="navegarParaModelo">
                <option v-for="(modelo, index) in modelosCarregados" :key="index" :value="index">
                  {{ modelo.nome || `Modelo ${index + 1}` }}
                </option>
              </select>
              <button type="button" class="btn btn-outline-primary btn-sm ms-2"
                @click="navegarModelo(1)" :disabled="modeloAtualIndex >= modelosCarregados.length - 1"
                title="Próximo modelo">
                Próximo →
              </button>
            </div>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <div class="d-flex flex-wrap justify-content-center justify-content-md-end align-items-center gap-1">
              <span class="badge bg-info text-white">
                {{ modeloAtual?.quantidadePendulos || 0 }} Pêndulos
              </span>
              <span class="badge bg-secondary text-white">
                {{ calcularTotalSensores() }} Sensores
              </span>
              <span :class="getBadgeClassModelo()" style="color: white;">
                {{ modeloAtual?.posicao || 'N/A' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { modeloSvgService } from '../services/modeloSvgService.js'
import ArmazemSvg from './ArmazemSvg.vue'
import axios from 'axios'

export default {
  name: 'ArmazemView',
  components: {
    ArmazemSvg
  },
  data() {
    return {
      modeloSelecionado: '',
      modelosDisponiveis: [],
      carregandoModelos: false,

      // Dados do modelo carregado
      modeloCarregado: null,
      modelosCarregados: [],
      modeloAtualIndex: 0,
      modeloAtual: null,

      // Dimensões SVG removidas - deixar ArmazemSvg calcular dinamicamente

      // Configuração base padrão
      configPadrao: {
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
        afastamento_vertical_pendulo: 0,
        posicoesCabos: {}, // Inicializar como objeto vazio
        distancia_entre_cabos: [0] // Inicializar com um array padrão
      },

      // Dados para renderização de sensores (simulados)
      dadosSensores: null,

      // Variáveis para controle de modelos em v4.0 (para futuro uso, se necessário)
      quantidadeModelosArcos: 0,
      modelosArcos: {},
      modelosSalvos: {},
      tipoAtivo: 'armazem',
      
      // Estados para posições manuais de drag and drop (igual ModeladorSVG)
      posicoesManualPendulos: {},
      posicoesManualSensores: {},
      posicoesCabos: {},

      // 🎯 NOVOS DADOS PARA SINCRONIZAÇÃO COM API REAL
      dadosPortal: null, // Dados brutos da API
      analiseArcos: null, // Análise da estrutura dos arcos reais
      arcoAtual: 1, // Arco atualmente sendo visualizado
      carregandoDadosAPI: false,
      errorAPI: null,
      apiConfig: {
        url: process.env.VUE_APP_API_URL || 'https://cloud.pce-eng.com.br/cloud/api/public/api/armazem/buscardado/130?celula=1&leitura=1&data=2025-08-13%2008:03:47',
        get token() {
          const token = localStorage.getItem('token') || ''
          return token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : 'Bearer [TOKEN_REQUIRED]'
        }
      },

      // 🎯 DADOS SINCRONIZADOS - modelo aplicado ao arco atual baseado na API
      modeloSincronizado: null,
      dadosSensoresSincronizados: null
    }
  },
  computed: {
    // Configuração preparada para o componente ArmazemSvg (igual ModeladorSVG)
    configArmazemParaComponente() {
      if (this.modeloAtual?.configuracao) {
        const config = this.modeloAtual.configuracao

        // 🎯 ESTRUTURA V6.0: Passar modeloEspecifico diretamente para ArmazemSvg
        if (config.modeloEspecifico) {

          const configComV6 = {
            ...this.configPadrao,
            ...config,
            // 🎯 MANTER modeloEspecifico intacto para ArmazemSvg processar
            modeloEspecifico: config.modeloEspecifico,
            // 🎯 PRESERVAR: Posições existentes do modelo + posições locais sobrescritas
            posicoesManualPendulos: { ...(config.posicoesManualPendulos || {}), ...(this.posicoesManualPendulos || {}) },
            posicoesManualSensores: { ...(config.posicoesManualSensores || {}), ...(this.posicoesManualSensores || {}) },
            // Posições dos cabos (preservar existentes, permitir sobrescrita local)
            posicoesCabos: { ...(config.posicoesCabos || {}), ...(this.posicoesCabos || {}) }
          }

          return configComV6
        }

        // Estrutura legado
        
        const configComCabos = {
          ...this.configPadrao,
          ...config,
          distancia_entre_cabos: config.distancia_entre_cabos ?? this.configPadrao.distancia_entre_cabos,
          // 🎯 PRESERVAR: Posições existentes do modelo + posições locais sobrescritas
          posicoesManualPendulos: { ...(config.posicoesManualPendulos || {}), ...(this.posicoesManualPendulos || {}) },
          posicoesManualSensores: { ...(config.posicoesManualSensores || {}), ...(this.posicoesManualSensores || {}) },
          // Posições dos cabos: preferir do config, fallback para local/padrão
          posicoesCabos: { ...(config.posicoesCabos || this.configPadrao.posicoesCabos || {}), ...(this.posicoesCabos || {}) }
        }

        return configComCabos
      }
      
      const configPadraoComPosicoes = {
        ...this.configPadrao,
        // 🎯 PADRÃO: Apenas posições locais (sem modelo carregado)
        posicoesManualPendulos: { ...this.posicoesManualPendulos },
        posicoesManualSensores: { ...this.posicoesManualSensores },
        posicoesCabos: { ...this.posicoesCabos }
      }
      
      return configPadraoComPosicoes
    },

    // Modelo atual preparado para o componente - agora usa dados sincronizados
    modeloAtualParaComponente() {
      // 🎯 USAR MODELO SINCRONIZADO se disponível (baseado na API)
      if (this.modeloSincronizado) {
        return {
          quantidadePendulos: this.modeloSincronizado.quantidadePendulos || 3,
          sensoresPorPendulo: this.modeloSincronizado.sensoresPorPendulo || {},
          configuracao: this.modeloSincronizado.configuracao || {}
        }
      }
      
      // Fallback para modelo tradicional
      if (this.modeloAtual) {
        return {
          quantidadePendulos: this.modeloAtual.quantidadePendulos || 3,
          sensoresPorPendulo: this.modeloAtual.sensoresPorPendulo || {},
          configuracao: this.modeloAtual.configuracao || {}
        }
      }
      
      return {
        quantidadePendulos: 3,
        sensoresPorPendulo: {},
        configuracao: {}
      }
    },

    // Dimensões personalizadas se necessário (igual ModeladorSVG)
    dimensoesPersonalizadasParaComponente() {
      // Sempre retornar null para deixar o ArmazemSvg calcular suas próprias dimensões
      return null
    },

    // Configuração atual - agora aponta para a versão alinhada com ModeladorSVG
    configAtual() {
      return this.configArmazemParaComponente
    }
  },
  mounted() {
    this.buscarModelosSalvos()
    this.gerarDadosSensoresSimulados()
    // Chamada para inicializar posições dos cabos com base na configuração padrão
    // Isso garante que as propriedades existam desde o início
    this.inicializarPosicoesCabos()
    
    // 🎯 NOVA FUNCIONALIDADE: Carregar dados reais da API
    this.carregarDadosAPI()
  },
  methods: {
    async buscarModelosSalvos() {
      this.carregandoModelos = true
      try {
        const resultado = await modeloSvgService.buscarModelos('A')

        if (resultado.success && Array.isArray(resultado.data)) {
          this.modelosDisponiveis = resultado.data.filter(modelo =>
            modelo.tp_svg === 'A' && modelo.nm_modelo && modelo.dado_svg
          )

          if (this.modelosDisponiveis.length === 0) {
            this.mostrarToast('Nenhum modelo de armazém encontrado', 'info')
          }
        } else {
          this.mostrarToast(`Erro ao carregar modelos: ${resultado.error}`, 'error')
          this.modelosDisponiveis = []
        }
      } catch (error) {
        this.mostrarToast('Erro ao conectar com o servidor', 'error')
        this.modelosDisponiveis = []
      } finally {
        this.carregandoModelos = false
      }
    },

    async carregarModeloSelecionado() {
      if (!this.modeloSelecionado) {
        this.limparModelo()
        return
      }

      try {
        const resultado = await modeloSvgService.buscarModeloPorId(this.modeloSelecionado)

        if (resultado.success && resultado.data) {
          const modelo = resultado.data
          await this.processarModeloCarregado(modelo)
        } else {
          this.mostrarToast(`Erro ao carregar modelo: ${resultado.error}`, 'error')
        }
      } catch (error) {
        this.mostrarToast('Erro ao carregar modelo selecionado', 'error')
      }
    },

    async processarModeloCarregado(modelo) {
      try {
        let dadosSvg
        if (typeof modelo.dado_svg === 'string') {
          dadosSvg = JSON.parse(modelo.dado_svg)
        } else {
          dadosSvg = modelo.dado_svg
        }

        // Processar dados baseado na estrutura
        this.modeloCarregado = {
          nome: modelo.nm_modelo,
          descricao: modelo.ds_modelo,
          versao: dadosSvg.versao || '1.0',
          tipo: dadosSvg.tipo || 'modelo_basico',
          quantidadeModelos: dadosSvg.quantidadeModelos || 1,
          logica: this.extrairLogicaDistribuicao(dadosSvg),
          dimensoesSVG: dadosSvg.dimensoesSVG || { largura: 350, altura: 300 }
        }

        // Extrair modelos individuais
        this.modelosCarregados = this.extrairModelosIndividuais(dadosSvg)

        // Inicializar com primeiro modelo
        this.modeloAtualIndex = 0
        this.aplicarModeloAtual()

        // Gerar dados de sensores simulados
        this.gerarDadosSensoresSimulados()

        this.mostrarToast(`Modelo "${modelo.nm_modelo}" carregado com sucesso!`, 'success')

      } catch (error) {
        this.mostrarToast(`Erro ao processar modelo: ${error.message}`, 'error')
      }
    },

    extrairLogicaDistribuicao(dadosSvg) {
      if (dadosSvg.sistemaModelos?.logicaDistribuicao?.nome) {
        return dadosSvg.sistemaModelos.logicaDistribuicao.nome
      }
      if (dadosSvg.logicaDistribuicao?.nome) {
        return dadosSvg.logicaDistribuicao.nome
      }

      const qtd = dadosSvg.quantidadeModelos || 1
      const logicas = {
        1: 'Modelo Único',
        2: 'Par/Ímpar',
        3: 'Frente/Fundo + Par/Ímpar',
        4: 'Frente/Par/Ímpar/Fundo'
      }
      return logicas[qtd] || 'Personalizada'
    },

    extrairModelosIndividuais(dadosSvg) {
      const modelos = []


      // 🎯 DETECTAR E PROCESSAR ESTRUTURAS V6.0 E V6.1 CORRETAMENTE
      if ((dadosSvg.versao === '6.0' || dadosSvg.versao === '6.1') && 
          (dadosSvg.tipo === 'armazem_completo_otimizado' || dadosSvg.tipoConfiguracao === 'armazem_completo_v6') && 
          (dadosSvg.modelos || dadosSvg.modelosDefinidos)) {


        // Suportar tanto 'modelos' (v6.0) quanto 'modelosDefinidos' (v6.1+)
        const modelosData = dadosSvg.modelos || dadosSvg.modelosDefinidos || {}

        Object.keys(modelosData).forEach(key => {
          const modeloV6 = modelosData[key]


          // 🎯 CONSTRUIR configuração compatível - priorizar dados salvos do ModeladorSVG
          let configuracao = { ...this.configPadrao }

          // Verificar se é v6.1+ com configuração direta (dados do ModeladorSVG)
          if (modeloV6.configuracao) {
            configuracao = {
              ...configuracao,
              ...modeloV6.configuracao // Preservar TODAS as configurações salvas
            }
          } else if (modeloV6.dimensoes || modeloV6.telhado || modeloV6.fundo) {
            // Estrutura v6.0 separada - mapear corretamente
            configuracao = {
              ...configuracao,
              // Dimensões básicas
              pb: modeloV6.dimensoes?.pb || configuracao.pb,
              lb: modeloV6.dimensoes?.lb || configuracao.lb,
              hb: modeloV6.dimensoes?.hb || configuracao.hb,
              hf: modeloV6.dimensoes?.hf || configuracao.hf,
              lf: modeloV6.dimensoes?.lf || configuracao.lf,
              le: modeloV6.dimensoes?.le || configuracao.le,
              ht: modeloV6.dimensoes?.ht || configuracao.ht,

              // Telhado
              tipo_telhado: modeloV6.telhado?.tipo !== undefined ? modeloV6.telhado.tipo : configuracao.tipo_telhado,
              curvatura_topo: modeloV6.telhado?.curvatura_topo ?? configuracao.curvatura_topo,
              pontas_redondas: modeloV6.telhado?.pontas_redondas !== undefined ? modeloV6.telhado.pontas_redondas : configuracao.pontas_redondas,
              raio_pontas: modeloV6.telhado?.raio_pontas || configuracao.raio_pontas,
              estilo_laterais: modeloV6.telhado?.estilo_laterais || configuracao.estilo_laterais,
              curvatura_laterais: modeloV6.telhado?.curvatura_laterais ?? configuracao.curvatura_laterais,

              // Fundo
              tipo_fundo: modeloV6.fundo?.tipo !== undefined ? modeloV6.fundo.tipo : configuracao.tipo_fundo,
              altura_fundo_reto: modeloV6.fundo?.altura_fundo_reto || configuracao.altura_fundo_reto,
              altura_funil_v: modeloV6.fundo?.altura_funil_v || configuracao.altura_funil_v,
              posicao_ponta_v: modeloV6.fundo?.posicao_ponta_v !== undefined ? modeloV6.fundo.posicao_ponta_v : configuracao.posicao_ponta_v,
              inclinacao_funil_v: modeloV6.fundo?.inclinacao_funil_v !== undefined ? modeloV6.fundo.inclinacao_funil_v : configuracao.inclinacao_funil_v,
              largura_abertura_v: modeloV6.fundo?.largura_abertura_v ?? configuracao.largura_abertura_v,
              altura_duplo_v: modeloV6.fundo?.altura_duplo_v || configuracao.altura_duplo_v,
              posicao_v_esquerdo: modeloV6.fundo?.posicao_v_esquerdo !== undefined ? modeloV6.fundo.posicao_v_esquerdo : configuracao.posicao_v_esquerdo,
              posicao_v_direito: modeloV6.fundo?.posicao_v_direito !== undefined ? modeloV6.fundo.posicao_v_direito : configuracao.posicao_v_direito,
              largura_abertura_duplo_v: modeloV6.fundo?.largura_abertura_duplo_v ?? configuracao.largura_abertura_duplo_v,
              altura_plataforma_duplo_v: modeloV6.fundo?.altura_plataforma_duplo_v ?? configuracao.altura_plataforma_duplo_v,
              largura_plataforma_duplo_v: modeloV6.fundo?.largura_plataforma_duplo_v ?? configuracao.largura_plataforma_duplo_v,
              deslocamento_horizontal_fundo: modeloV6.fundo?.deslocamento_horizontal_fundo !== undefined ? modeloV6.fundo.deslocamento_horizontal_fundo : configuracao.deslocamento_horizontal_fundo,
              deslocamento_vertical_fundo: modeloV6.fundo?.deslocamento_vertical_fundo !== undefined ? modeloV6.fundo.deslocamento_vertical_fundo : configuracao.deslocamento_vertical_fundo
            }

            // 🎯 MAPEAR configuração global de sensores se existir
            if (modeloV6.modeloEspecifico?.configuracaoGlobal) {
              const configGlobal = modeloV6.modeloEspecifico.configuracaoGlobal
              configuracao.escala_sensores = configGlobal.escala_sensores || configuracao.escala_sensores
              configuracao.dist_y_sensores = configGlobal.dist_y_sensores || configuracao.dist_y_sensores
              configuracao.dist_x_sensores = configGlobal.dist_x_sensores || configuracao.dist_x_sensores
              configuracao.posicao_horizontal = configGlobal.posicao_horizontal || configuracao.posicao_horizontal
              configuracao.posicao_vertical = configGlobal.posicao_vertical || configuracao.posicao_vertical
              configuracao.afastamento_vertical_pendulo = configGlobal.afastamento_vertical_pendulo || configuracao.afastamento_vertical_pendulo
            }
          }

          // 🎯 PRESERVAR modeloEspecifico se existir
          if (modeloV6.modeloEspecifico) {
            configuracao.modeloEspecifico = { ...modeloV6.modeloEspecifico }
          }

          // 🎯 PRESERVAR posições manuais se existirem
          if (modeloV6.posicoesManualPendulos) {
            configuracao.posicoesManualPendulos = { ...modeloV6.posicoesManualPendulos }
          }
          if (modeloV6.posicoesManualSensores) {
            configuracao.posicoesManualSensores = { ...modeloV6.posicoesManualSensores }
          }

          // 🎯 EXTRAIR dados finais com compatibilidade total
          const quantidadePendulos = modeloV6.modeloEspecifico?.quantidadePendulos || 
                                     modeloV6.quantidadePendulos || 3
          const sensoresPorPendulo = modeloV6.modeloEspecifico?.sensoresPorPendulo || 
                                     modeloV6.sensoresPorPendulo || {}
          const posicoesPendulos = modeloV6.modeloEspecifico?.posicoesPendulos || 
                                   modeloV6.posicoesManualPendulos || {}

          // 🎯 CONVERTER posições de pêndulos para formato compatível com pos_x_cabo
          if (Object.keys(posicoesPendulos).length > 0) {
            configuracao.pos_x_cabo = []
            configuracao.posicoesCabos = {}
            
            Object.keys(posicoesPendulos).forEach(pendId => {
              const posicao = posicoesPendulos[pendId]
              const index = parseInt(pendId) - 1
              
              // Mapear para array pos_x_cabo
              configuracao.pos_x_cabo[index] = posicao.x || 0
              
              // Mapear para objeto posicoesCabos
              configuracao.posicoesCabos[pendId] = {
                x: posicao.x || 0,
                y: posicao.y || 0,
                altura: posicao.altura || 0,
                offsetX: posicao.offsetX || 0,
                offsetY: posicao.offsetY || 0,
                distanciaHorizontal: posicao.distanciaHorizontal || 0,
                timestampAlteracao: posicao.timestampAlteracao || Date.now()
              }
            })

          }


          modelos.push({
            numero: parseInt(key),
            nome: modeloV6.nome || `Modelo ${key}`,
            posicao: modeloV6.posicao || 'todos',
            configuracao: configuracao,
            quantidadePendulos: quantidadePendulos,
            sensoresPorPendulo: sensoresPorPendulo,
            timestampSalvamento: modeloV6.timestamp || modeloV6.timestampSalvamento || Date.now()
          })
        })
      }
      // Estruturas legado (v4.0, v3.0, etc.)
      else {
        let modelosDefinidos = null

        if (dadosSvg.modelosDefinidos) {
          modelosDefinidos = dadosSvg.modelosDefinidos
        } else if (dadosSvg.sistemaModelos?.modelosDefinidos) {
          modelosDefinidos = dadosSvg.sistemaModelos.modelosDefinidos
        } else if (dadosSvg.modelosArcos) {
          modelosDefinidos = dadosSvg.modelosArcos
        }

        if (modelosDefinidos) {
          Object.keys(modelosDefinidos).forEach(key => {
            const modelo = modelosDefinidos[key]
            const configuracao = modelo.configuracao || modelo.config || {}

            if (!configuracao.posicoesCabos || typeof configuracao.posicoesCabos !== 'object') {
              configuracao.posicoesCabos = {}
            }

            modelos.push({
              numero: parseInt(key),
              nome: modelo.nome || `Modelo ${key}`,
              posicao: modelo.posicao || 'todos',
              configuracao: configuracao,
              quantidadePendulos: modelo.quantidadePendulos ?? 3,
              sensoresPorPendulo: modelo.sensoresPorPendulo || {},
              timestampSalvamento: modelo.timestampSalvamento || configuracao.timestampPosicoesCabos || null
            })
          })
        } else {
          // Para modelo único legado
          const configuracao = dadosSvg.configuracao || dadosSvg

          if (!configuracao.posicoesCabos || typeof configuracao.posicoesCabos !== 'object') {
            configuracao.posicoesCabos = {}
          }

          modelos.push({
            numero: 1,
            nome: 'Modelo Único',
            posicao: 'todos',
            configuracao: configuracao,
            quantidadePendulos: 3,
            sensoresPorPendulo: { 1: 4, 2: 3, 3: 5 },
            timestampSalvamento: configuracao.timestampPosicoesCabos || null
          })
        }
      }

      modelos.sort((a, b) => a.numero - b.numero)
      return modelos
    },

    aplicarModeloAtual() {
      if (!this.modelosCarregados || this.modelosCarregados.length === 0) {
        this.modeloAtual = null
        return
      }

      const modeloAnterior = this.modeloAtual
      this.modeloAtual = this.modelosCarregados[this.modeloAtualIndex] || this.modelosCarregados[0]

      const numeroModelo = this.modeloAtual.numero || (this.modeloAtualIndex + 1)

      // Aplicar dimensões SVG baseadas na configuração específica deste modelo
      if (this.modeloAtual.configuracao && (this.modeloAtual.configuracao.lb || this.modeloAtual.configuracao.largura)) {
        // Usar dimensões específicas deste modelo
        const larguraModelo = this.modeloAtual.configuracao.lb || this.modeloAtual.configuracao.largura
        this.larguraSVG = larguraModelo
      } else if (this.modeloCarregado.dimensoesSVG) {
        // Fallback para dimensões globais
        this.larguraSVG = this.modeloCarregado.dimensoesSVG.largura || 350
        this.alturaSVG = this.modeloCarregado.dimensoesSVG.altura || 300
      } else {
        this.calcularDimensoesSVG()
      }

      // Sempre preservar posições salvas sem validação/correção
      this.preservarPosicoesCabos()

      // Gerar dados de sensores simulados para o modelo atual
      this.gerarDadosSensoresSimulados()
    },

    gerarDadosSensoresSimulados() {
      if (!this.modeloAtual) return

      const dadosSimulados = {}
      let quantidadePendulos = this.modeloAtual.quantidadePendulos || 3
      let sensoresPorPendulo = this.modeloAtual.sensoresPorPendulo || {}

      // 🎯 ESTRUTURA V6.0: Usar dados do modeloEspecifico se disponível
      if (this.modeloAtual.configuracao?.modeloEspecifico) {
        const modeloEspec = this.modeloAtual.configuracao.modeloEspecifico
        quantidadePendulos = modeloEspec.quantidadePendulos || 3
        sensoresPorPendulo = modeloEspec.sensoresPorPendulo || {}

      }

      for (let p = 1; p <= quantidadePendulos; p++) {
        dadosSimulados[p] = {}

        // 🎯 USAR quantidade correta salva para cada pêndulo
        let numSensores = 3 // padrão
        if (sensoresPorPendulo[p]) {
          numSensores = parseInt(sensoresPorPendulo[p]) || 3
        } else if (sensoresPorPendulo[p.toString()]) {
          numSensores = parseInt(sensoresPorPendulo[p.toString()]) || 3
        }


        for (let s = 1; s <= numSensores; s++) {
          const temp = Math.round((Math.random() * 20 + 15) * 10) / 10
          dadosSimulados[p][s] = [temp, false, false, false, true]
        }
      }

      this.dadosSensores = { leitura: dadosSimulados }

    },

    navegarModelo(direcao) {
      const novoIndex = this.modeloAtualIndex + direcao
      if (novoIndex >= 0 && novoIndex < this.modelosCarregados.length) {
        this.modeloAtualIndex = novoIndex
        this.navegarParaModelo()
      }
    },

    navegarParaModelo() {
      this.aplicarModeloAtual()
    },

    limparModelo() {
      this.modeloSelecionado = ''
      this.modeloCarregado = null
      this.modelosCarregados = []
      this.modeloAtual = null
      this.modeloAtualIndex = 0
      this.dadosSensores = null
      this.calcularDimensoesSVG()
      this.mostrarToast('Modelo limpo - voltou ao padrão', 'info')
    },

    calcularDimensoesSVG() {
      // 🎯 USAR EXATAMENTE A MESMA LÓGICA DO ModeladorSVG.vue calcularDimensoesSVG()
      const config = this.configArmazemParaComponente
      const larguraBase = Math.max(config.lb, 300)

      // Calcular altura necessária considerando todos os elementos (igual ModeladorSVG)
      const alturaFundo = config.pb + 20  // Altura base + margem
      const alturaTopoNecessaria = 80     // Espaço adequado para o topo
      const alturaTotal = alturaFundo + alturaTopoNecessaria

      // Para diferentes tipos de fundo, ajustar altura (igual ModeladorSVG)
      let extensaoFundo = 0
      if (config.tipo_fundo === 1) {
        extensaoFundo = config.altura_funil_v || 40
      } else if (config.tipo_fundo === 2) {
        extensaoFundo = config.altura_duplo_v || 35
      }

      const alturaFinal = Math.max(alturaTotal + extensaoFundo, 280)

      // Ajustar para mobile se necessário (igual ModeladorSVG)
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 576
      if (isMobile) {
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

    },

    recalcularPosicoesCabos() {
      if (!this.modeloAtual || !this.modeloAtual.configuracao) return

      const config = this.modeloAtual.configuracao
      const quantidadePendulos = this.modeloAtual.quantidadePendulos || 3
      const numeroModelo = this.modeloAtual.numero || (this.modeloAtualIndex + 1)


      // Preservar posições mantendo proporções e offsets personalizados
      this.preservarPosicoesCabos()

      // Forçar atualização do SVG
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },

    preservarPosicoesCabos() {
      if (!this.modeloAtual || !this.modeloAtual.configuracao) return

      const config = this.modeloAtual.configuracao
      const quantidadePendulos = this.modeloAtual.quantidadePendulos || 3
      const numeroModelo = this.modeloAtual.numero || (this.modeloAtualIndex + 1)


      // 🎯 APLICAR EXATAMENTE A MESMA LÓGICA DE DISTRIBUIÇÃO DO ModeladorSVG.vue
      const larguraTotal = config.lb || 350
      const margemLateral = 35  // EXATAMENTE igual ModeladorSVG
      const larguraUtilizavel = larguraTotal - (2 * margemLateral)

      // Garantir estrutura de posições individuais
      if (!config.posicoesCabos) {
        config.posicoesCabos = {}
      }

      // 📐 CALCULAR POSIÇÕES BASE EXATAMENTE IGUAL ModeladorSVG
      const posicoesCabosCalculadas = []

      if (quantidadePendulos === 1) {
        posicoesCabosCalculadas.push(larguraTotal / 2)
      } else {
        const espacamento = larguraUtilizavel / (quantidadePendulos - 1)
        for (let i = 0; i < quantidadePendulos; i++) {
          posicoesCabosCalculadas.push(margemLateral + (i * espacamento))
        }
      }


      // 🎯 PRESERVAR/CRIAR posições individuais mantendo a estrutura EXATA do ModeladorSVG
      for (let i = 1; i <= quantidadePendulos; i++) {
        const xBaseCalculado = posicoesCabosCalculadas[i - 1]

        if (!config.posicoesCabos[i]) {
          // Criar nova posição usando posição base calculada
          config.posicoesCabos[i] = {
            x: Math.round(xBaseCalculado * 10) / 10,
            y: 0,
            offsetX: 0,
            offsetY: 0,
            altura: 0,
            distanciaHorizontal: 0,
            numeroSensores: 3,
            timestampAlteracao: Date.now()
          }

        } else {
          // 🔧 PRESERVAR posições personalizadas EXATAMENTE como salvas (igual ModeladorSVG)
          const posicaoExistente = config.posicoesCabos[i]

          // NÃO alterar posições customizadas - apenas garantir campos obrigatórios
          if (posicaoExistente.y === undefined) posicaoExistente.y = 0
          if (posicaoExistente.offsetX === undefined) posicaoExistente.offsetX = 0
          if (posicaoExistente.offsetY === undefined) posicaoExistente.offsetY = 0
          if (posicaoExistente.altura === undefined) posicaoExistente.altura = 0
          if (posicaoExistente.distanciaHorizontal === undefined) posicaoExistente.distanciaHorizontal = 0
          if (posicaoExistente.numeroSensores === undefined) posicaoExistente.numeroSensores = 3
          if (!posicaoExistente.timestampAlteracao) posicaoExistente.timestampAlteracao = Date.now()

        }
      }

      // 🎯 CONSTRUIR ARRAY pos_x_cabo baseado nas posições finais EXATAMENTE igual ModeladorSVG
      const posicoesArray = []
      for (let i = 1; i <= quantidadePendulos; i++) {
        if (config.posicoesCabos[i]) {
          const posicaoFinal = (config.posicoesCabos[i].x || 0) + (config.posicoesCabos[i].offsetX || 0)
          posicoesArray.push(Math.round(posicaoFinal * 10) / 10)
        } else {
          posicoesArray.push(posicoesCabosCalculadas[i - 1] || 0)
        }
      }
      config.pos_x_cabo = posicoesArray

      // 🎯 RECALCULAR distâncias entre cabos EXATAMENTE igual ModeladorSVG
      if (posicoesArray.length > 1) {
        const distancias = []
        for (let i = 1; i < posicoesArray.length; i++) {
          const distancia = Math.abs(posicoesArray[i] - posicoesArray[i-1])
          distancias.push(Math.round(distancia * 10) / 10)
        }
        config.distancia_entre_cabos = distancias
      } else {
        config.distancia_entre_cabos = [0]
      }

    },



    // Método para garantir a existência da estrutura de posições individuais dos cabos
    inicializarPosicoesCabos() {
      // Verifica se já estamos em um modelo carregado
      if (!this.modeloAtual) {
        // Se não houver modelo atual, usa a configuração padrão
        const config = this.configPadrao;
        if (!config.posicoesCabos || typeof config.posicoesCabos !== 'object') {
          config.posicoesCabos = {};
        }
        // Define uma quantidade padrão de pêndulos se não houver modelos carregados
        const quantidadePendulos = 3;
        for (let i = 1; i <= quantidadePendulos; i++) {
          if (!config.posicoesCabos[i]) {
            config.posicoesCabos[i] = {
              x: 0, y: 0, offsetX: 0, offsetY: 0, timestampAlteracao: Date.now()
            };
          }
        }
        return;
      }

      // Se há um modelo atual, garante a estrutura para ele
      const config = this.modeloAtual.configuracao
      const quantidadePendulos = this.modeloAtual.quantidadePendulos || 3
      const numeroModelo = this.modeloAtual.numero || (this.modeloAtualIndex + 1)

      if (!config.posicoesCabos || typeof config.posicoesCabos !== 'object') {
        config.posicoesCabos = {}
      }

      const posicoesCabosExistentes = config.posicoesCabos

      for (let i = 1; i <= quantidadePendulos; i++) {
        if (!posicoesCabosExistentes[i]) {
          // Se a posição individual não existe, cria com base na posição X do array
          // ou usa um valor padrão se o array também não existir ou for inválido
          const posXBase = (config.pos_x_cabo && config.pos_x_cabo[i - 1]) ? config.pos_x_cabo[i - 1] : 0;
          config.posicoesCabos[i] = {
            x: posXBase, // Posição horizontal base
            y: 0, // Posição vertical (altura do cabo)
            offsetX: 0, // Ajuste fino horizontal
            offsetY: 0, // Ajuste fino vertical
            timestampAlteracao: Date.now()
          };
        } else {
          // Se a posição individual já existe, garante que os campos obrigatórios estejam presentes
          if (posicoesCabosExistentes[i].y === undefined) posicoesCabosExistentes[i].y = 0
          if (posicoesCabosExistentes[i].offsetX === undefined) posicoesCabosExistentes[i].offsetX = 0
          if (posicoesCabosExistentes[i].offsetY === undefined) posicoesCabosExistentes[i].offsetY = 0
          if (!posicoesCabosExistentes[i].timestampAlteracao) posicoesCabosExistentes[i].timestampAlteracao = Date.now()

          // Garante que a posição X individual esteja sincronizada com o array pos_x_cabo se existir
          if (config.pos_x_cabo && config.pos_x_cabo[i - 1] !== undefined) {
            posicoesCabosExistentes[i].x = config.pos_x_cabo[i - 1];
          }
        }
      }
    },


    garantirPosicoesCabosIndividuais() {
      if (!this.modeloAtual || !this.modeloAtual.configuracao) return

      const config = this.modeloAtual.configuracao
      const quantidadePendulos = this.modeloAtual.quantidadePendulos || 3
      const numeroModelo = this.modeloAtual.numero || (this.modeloAtualIndex + 1)

      // Garantir que posições individuais dos cabos existam
      if (!config.posicoesCabos) {
        config.posicoesCabos = {};
      }

      // Sincronizar posições individuais com o array pos_x_cabo APENAS se não existirem
      const posicoesCabos = config.pos_x_cabo || []

      for (let i = 1; i <= quantidadePendulos; i++) {
        if (!config.posicoesCabos[i]) {
          // Criar nova posição individual apenas se não existir
          config.posicoesCabos[i] = {
            x: posicoesCabos[i-1] || 0, // Posição horizontal base
            y: 0, // Posição vertical (altura do cabo)
            offsetX: 0, // Ajuste fino horizontal
            offsetY: 0, // Ajuste fino vertical
            timestampAlteracao: Date.now()
          };
        } else {
          // Se já existe, PRESERVAR as posições salvas e apenas garantir campos
          if (config.posicoesCabos[i].y === undefined) config.posicoesCabos[i].y = 0
          if (config.posicoesCabos[i].offsetX === undefined) config.posicoesCabos[i].offsetX = 0
          if (config.posicoesCabos[i].offsetY === undefined) config.posicoesCabos[i].offsetY = 0
          if (!config.posicoesCabos[i].timestampAlteracao) config.posicoesCabos[i].timestampAlteracao = Date.now()

          // IMPORTANTE: NÃO sobrescrever a posição X se já foi customizada
        }
      }

    },

    calcularTotalSensores() {
      if (!this.modeloAtual) return 0

      let sensoresPorPendulo = this.modeloAtual.sensoresPorPendulo || {}

      // 🎯 ESTRUTURA V6.0: Usar dados do modeloEspecifico se disponível
      if (this.modeloAtual.configuracao?.modeloEspecifico) {
        sensoresPorPendulo = this.modeloAtual.configuracao.modeloEspecifico.sensoresPorPendulo || {}
      }

      const total = Object.values(sensoresPorPendulo).reduce((sum, num) => sum + (parseInt(num) || 0), 0)


      return total
    },

    getDescricaoConfiguracaoAtual() {
      if (this.modeloAtual) {
        const config = this.configArmazemParaComponente
        return `Tipo: ${this.getTipoTelhado(config.tipo_telhado)} | Fundo: ${this.getTipoFundo(config.tipo_fundo)}`
      }
      return 'Configuração padrão'
    },

    getDescricaoModelo(modelo) {
      try {
        const dados = typeof modelo.dado_svg === 'string' ? JSON.parse(modelo.dado_svg) : modelo.dado_svg
        const qtd = dados.quantidadeModelos || 1
        return `${qtd} modelo${qtd > 1 ? 's' : ''}`
      } catch {
        return 'Modelo simples'
      }
    },

    getTipoTelhado(tipo) {
      const tipos = { 1: 'Pontudo', 2: 'Arredondado', 3: 'Arco' }
      return tipos[tipo] || 'Padrão'
    },

    getTipoFundo(tipo) {
      const tipos = { 0: 'Reto', 1: 'Funil V', 2: 'Duplo V' }
      return tipos[tipo] || 'Reto'
    },

    getBadgeClassModelo() {
      if (!this.modeloAtual) return 'badge bg-secondary'

      const posicao = this.modeloAtual.posicao
      const classes = {
        'todos': 'badge bg-secondary',
        'par': 'badge bg-secondary',
        'impar': 'badge bg-warning',
        'frente': 'badge bg-secondary',
        'fundo': 'badge bg-secondary',
        'frente_fundo': 'badge bg-secondary'
      }
      return classes[posicao] || 'badge bg-secondary'
    },

    atualizarPosicaoIndividualCabo(numeroCabo, propriedade, valor) {
      if (!this.modeloAtual || !this.modeloAtual.configuracao) return

      const config = this.modeloAtual.configuracao
      const numeroModelo = this.modeloAtual.numero || (this.modeloAtualIndex + 1)

      // Garantir que estrutura existe
      if (!config.posicoesCabos) {
        config.posicoesCabos = {}
      }

      if (!config.posicoesCabos[numeroCabo]) {
        config.posicoesCabos[numeroCabo] = {
          x: 0, // Posição horizontal personalizada
          y: 0, // Posição vertical personalizada  
          offsetX: 0,
          offsetY: 0,
          altura: 0,
          distanciaHorizontal: 0,
          numeroSensores: 3,
          timestampAlteracao: Date.now()
        }
      }

      // Converter valor para número
      const valorNumerico = parseFloat(valor) || 0

      // Atualizar propriedade específica EXATAMENTE como definido pelo usuário
      config.posicoesCabos[numeroCabo][propriedade] = valorNumerico
      config.posicoesCabos[numeroCabo].timestampAlteracao = Date.now()

      // Sempre atualizar o array pos_x_cabo com as posições personalizadas
      if (!config.pos_x_cabo) config.pos_x_cabo = []

      // Usar posições individuais como fonte de verdade
      const quantidadePendulos = this.modeloAtual.quantidadePendulos || 3
      for (let i = 1; i <= quantidadePendulos; i++) {
        if (config.posicoesCabos[i]) {
          const posicaoFinal = (config.posicoesCabos[i].x || 0) + (config.posicoesCabos[i].offsetX || 0)
          config.pos_x_cabo[i - 1] = posicaoFinal
        }
      }

      // Recalcular distâncias entre cabos baseadas nas posições reais
      if (config.pos_x_cabo.length > 1) {
        const distancias = []
        for (let i = 1; i < config.pos_x_cabo.length; i++) {
          distancias.push(Math.round((config.pos_x_cabo[i] - config.pos_x_cabo[i-1]) * 10) / 10)
        }
        config.distancia_entre_cabos = distancias
      }

      // Marcar timestamp de alteração
      config.timestampPosicoesCabos = Date.now()
      config.posicionamentoPersonalizado = true // Flag para indicar que foi personalizado

      // Salvar no servidor após cada alteração (com fallback para localStorage)
      this.salvarModeloNoServidor()


      // Forçar atualização reativa do Vue
      this.$forceUpdate()
    },

    async salvarModeloNoServidor() {
      if (!this.modeloCarregado || !this.modelosCarregados) return

      try {
        const dadosCompletos = this.construirDadosCompletos()

        // Estrutura para salvar no servidor
        const modeloParaSalvar = {
          nm_modelo: this.modeloCarregado.nome,
          tp_svg: 'A', // Armazém
          vista_svg: 'F', // Frontal
          ds_modelo: `Modelo atualizado em ${new Date().toLocaleDateString('pt-BR')}`,
          dado_svg: JSON.stringify(dadosCompletos)
        }

        // Se já temos um ID do modelo selecionado, incluir para forçar atualização
        if (this.modeloSelecionado) {
          modeloParaSalvar.id_svg = this.modeloSelecionado
        }


        const resultado = await modeloSvgService.salvarModelo(modeloParaSalvar)

        if (resultado.success) {
          this.mostrarToast(`Modelo "${this.modeloCarregado.nome}" salvo com sucesso no servidor!`, 'success')
        } else {
          throw new Error(resultado.message || 'Erro desconhecido ao salvar')
        }

      } catch (error) {
        console.error('❌ [SERVIDOR] Erro ao salvar modelo:', error)
        this.mostrarToast(`Erro ao salvar no servidor: ${error.message}`, 'error')
        // Fallback para localStorage
        this.salvarPosicionamentoLocalStorage()
      }
    },

    construirDadosCompletos() {
      // 🎯 ESTRUTURA V6.0 COMPATÍVEL com o formato original
      const dadosCompletos = {
        tipo: 'armazem_completo_otimizado',
        versao: '6.0',
        modelos: {},
        controle: {
          ordemModelos: [],
          modelosEncontrados: this.modelosCarregados.length,
          quantidadeEsperada: this.modelosCarregados.length,
          verificacaoIntegridade: {
            totalModelos: this.modelosCarregados.length,
            detalhesModelos: {},
            modelosComSensores: 0,
            modelosComPosicoesCabos: 0,
            modelosComAlturasSensores: 0
          }
        },
        otimizado: true,
        timestamp: Date.now(),
        distribuicao: {
          nome: this.modeloCarregado.logica || 'Modelo Único',
          aplicacao: 'todos_arcos'
        },
        reducaoTamanho: '60-80%',
        tipoConfiguracao: 'armazem_completo_v6',
        quantidadeModelos: this.modelosCarregados.length
      }

      // Construir modelos no formato v6.0
      this.modelosCarregados.forEach((modelo, index) => {
        const id = (index + 1).toString()
        dadosCompletos.controle.ordemModelos.push(id)

        const modeloV6 = {
          id: index + 1,
          nome: modelo.nome || `Modelo ${index + 1}`,
          versao: '6.1',
          posicao: modelo.posicao || 'todos',
          validado: true,
          timestamp: Date.now()
        }

        // Mapear dimensões
        if (modelo.configuracao) {
          const config = modelo.configuracao
          
          modeloV6.dimensoes = {
            hb: config.hb ?? 30,
            hf: config.hf ?? 6,
            ht: config.ht ?? 50,
            lb: config.lb ?? 350,
            le: config.le ?? 15,
            lf: config.lf ?? 250,
            pb: config.pb ?? 185
          }

          modeloV6.telhado = {
            tipo: config.tipo_telhado !== undefined ? config.tipo_telhado : 1,
            raio_pontas: config.raio_pontas ?? 15,
            curvatura_topo: config.curvatura_topo !== undefined ? config.curvatura_topo : 30,
            estilo_laterais: config.estilo_laterais ?? 'reta',
            pontas_redondas: config.pontas_redondas !== undefined ? config.pontas_redondas : false,
            curvatura_laterais: config.curvatura_laterais !== undefined ? config.curvatura_laterais : 0
          }

          modeloV6.fundo = {
            tipo: config.tipo_fundo !== undefined ? config.tipo_fundo : 0,
            altura_duplo_v: config.altura_duplo_v ?? 22,
            altura_funil_v: config.altura_funil_v ?? 18,
            posicao_ponta_v: config.posicao_ponta_v !== undefined ? config.posicao_ponta_v : 0,
            altura_fundo_reto: config.altura_fundo_reto ?? 10,
            posicao_v_direito: config.posicao_v_direito !== undefined ? config.posicao_v_direito : 1,
            inclinacao_funil_v: config.inclinacao_funil_v !== undefined ? config.inclinacao_funil_v : 1,
            largura_abertura_v: config.largura_abertura_v ?? 20,
            posicao_v_esquerdo: config.posicao_v_esquerdo !== undefined ? config.posicao_v_esquerdo : -1,
            largura_abertura_duplo_v: config.largura_abertura_duplo_v !== undefined ? config.largura_abertura_duplo_v : 2,
            altura_plataforma_duplo_v: config.altura_plataforma_duplo_v !== undefined ? config.altura_plataforma_duplo_v : 0.3,
            largura_plataforma_duplo_v: config.largura_plataforma_duplo_v ?? 10,
            deslocamento_vertical_fundo: config.deslocamento_vertical_fundo !== undefined ? config.deslocamento_vertical_fundo : -1,
            deslocamento_horizontal_fundo: config.deslocamento_horizontal_fundo !== undefined ? config.deslocamento_horizontal_fundo : 0
          }

          // 🎯 PRESERVAR ou CONSTRUIR modeloEspecifico
          if (config.modeloEspecifico) {
            // Usar modeloEspecifico existente
            modeloV6.modeloEspecifico = { ...config.modeloEspecifico }
          } else {
            // Construir modeloEspecifico baseado nos dados atuais
            const posicoesPendulos = {}
            const sensoresPorPendulo = {}
            
            if (config.posicoesCabos) {
              Object.keys(config.posicoesCabos).forEach(cabId => {
                const cabo = config.posicoesCabos[cabId]
                posicoesPendulos[cabId] = {
                  x: cabo.x ?? 0,
                  y: cabo.y ?? 0,
                  altura: cabo.altura ?? 0,
                  offsetX: cabo.offsetX ?? 0,
                  offsetY: cabo.offsetY ?? 0,
                  timestampAlteracao: cabo.timestampAlteracao ?? Date.now(),
                  distanciaHorizontal: cabo.distanciaHorizontal ?? 0
                }
              })
            }

            if (modelo.sensoresPorPendulo) {
              Object.assign(sensoresPorPendulo, modelo.sensoresPorPendulo)
            }

            modeloV6.modeloEspecifico = {
              quantidadePendulos: modelo.quantidadePendulos ?? 3,
              sensoresPorPendulo: sensoresPorPendulo,
              posicoesPendulos: posicoesPendulos,
              configuracaoGlobal: {
                dist_x_sensores: config.dist_x_sensores ?? 0,
                dist_y_sensores: config.dist_y_sensores ?? 12,
                escala_sensores: config.escala_sensores ?? 16,
                posicao_vertical: config.posicao_vertical ?? 0,
                posicao_horizontal: config.posicao_horizontal ?? 0,
                afastamento_vertical_pendulo: config.afastamento_vertical_pendulo ?? 0
              },
              posicoesManualPendulos: config.posicoesManualPendulos ?? {},
              posicoesManualSensores: config.posicoesManualSensores ?? {}
            }
          }
        }

        dadosCompletos.modelos[id] = modeloV6
      })

      return dadosCompletos
    },

    salvarPosicionamentoLocalStorage() {
      if (!this.modeloCarregado || !this.modelosCarregados) return

      try {
        const dadosCompletos = {
          nomeConfiguracao: this.modeloCarregado.nome,
          quantidadeModelos: this.modeloCarregado.quantidadeModelos,
          logica: this.modeloCarregado.logica,
          modelos: this.modelosCarregados.map(modelo => ({
            numero: modelo.numero,
            nome: modelo.nome,
            posicao: modelo.posicao,
            quantidadePendulos: modelo.quantidadePendulos,
            configuracao: modelo.configuracao,
            posicoesCabosDetalhadas: modelo.configuracao?.posicoesCabos || {},
            sensoresPorPendulo: modelo.sensoresPorPendulo || {},
            timestampSalvamento: Date.now()
          })),
          timestamp: Date.now(),
          versao: '5.1',
          tipo: 'configuracao_completa_com_posicionamento'
        }

        const chave = `config_posicionamento_${this.modeloCarregado.nome}_${Date.now()}`
        localStorage.setItem(chave, JSON.stringify(dadosCompletos))


      } catch (error) {
        console.error('❌ [LOCALSTORAGE] Erro ao salvar posicionamento:', error)
      }
    },

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
      `

      toast.innerHTML = `${icones[tipo] || icones.info} ${mensagem}`
      document.body.appendChild(toast)

      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove()
        }
      }, 4000)
    },

    // Método auxiliar para determinar a posição do modelo (par/ímpar, etc.)
    determinarPosicaoDoModelo(numeroModelo, quantidadeTotal) {
      if (quantidadeTotal === 1) return 'todos';
      if (quantidadeTotal % 2 === 0) {
        if (numeroModelo % 2 === 0) return 'par';
        else return 'impar';
      } else {
        // Lógica mais complexa para quantidades ímpares se necessário
        // Por enquanto, um fallback genérico
        return 'todos';
      }
    },

    // Métodos de carregamento de configuração (mantidos para referência, mas não chamados diretamente aqui)
    carregarConfiguracaoCompletaV4(dados, nome) {

      // Restaurar sistema de modelos
      if (dados.sistemaModelos || dados.modelosDefinidos) {
        const modelosDefinidos = dados.sistemaModelos?.modelosDefinidos || dados.modelosDefinidos
        this.quantidadeModelosArcos = dados.sistemaModelos?.quantidadeModelos || dados.quantidadeModelos || Object.keys(modelosDefinidos).length

        // Restaurar modelos de arcos com estado completo
        const novosModelos = {}
        const novosSalvos = {}

        if (modelosDefinidos) {
          Object.keys(modelosDefinidos).forEach(key => {
            const modelo = modelosDefinidos[key]
            const numeroModelo = parseInt(key)

            // Construir configuração completa preservando posições dos cabos
            const configuracaoModelo = {
              ...this.configPadrao, // Começar com valores padrão
              ...modelo.configuracao // Sobrescrever com valores salvos
            }

            // IMPORTANTE: Preservar posições individuais dos cabos se existirem
            if (modelo.configuracao?.posicoesCabos && typeof modelo.configuracao.posicoesCabos === 'object') {
              configuracaoModelo.posicoesCabos = { ...modelo.configuracao.posicoesCabos }
            } else {
              // Se não existem posições salvas, inicializa com base nas posições do array pos_x_cabo (se houver)
              configuracaoModelo.posicoesCabos = {}
              if (configuracaoModelo.pos_x_cabo && Array.isArray(configuracaoModelo.pos_x_cabo)) {
                configuracaoModelo.pos_x_cabo.forEach((posX, index) => {
                  configuracaoModelo.posicoesCabos[index + 1] = {
                    x: posX,
                    y: 0,
                    offsetX: 0,
                    offsetY: 0,
                    timestampAlteracao: Date.now()
                  };
                });
              }
            }
            // Garantir que a propriedade distancia_entre_cabos também exista
            if (!configuracaoModelo.distancia_entre_cabos) {
              configuracaoModelo.distancia_entre_cabos = this.configPadrao.distancia_entre_cabos;
            }

            novosModelos[key] = {
              numero: numeroModelo,
              nome: modelo.nome || `Modelo ${key}`,
              posicao: modelo.posicao || this.determinarPosicaoDoModelo(numeroModelo, this.quantidadeModelosArcos),
              configuracao: configuracaoModelo,
              quantidadePendulos: modelo.quantidadePendulos ?? 3,
              sensoresPorPendulo: modelo.sensoresPorPendulo || {},
              timestampSalvamento: modelo.timestampSalvamento || modelo.timestampUltimaEdicao || new Date().toISOString()
            }
            novosSalvos[key] = true
          })

          this.modelosCarregados = Object.values(novosModelos)
          this.modeloCarregado = {
            nome: nome,
            quantidadeModelos: this.quantidadeModelosArcos,
            logica: dados.sistemaModelos?.logicaDistribuicao?.nome || 'Personalizada'
          }
        }
      }
    },

    carregarConfiguracaoCompletaV3(dados, nome) {
      this.modeloCarregado = {
        nome: nome,
        quantidadeModelos: dados.quantidadeModelos || 1,
        logica: this.extrairLogicaDistribuicao(dados),
        dimensoesSVG: dados.dimensoesSVG || { largura: 350, altura: 300 }
      }

      this.modelosCarregados = this.extrairModelosIndividuais(dados)

      // Inicializar com o primeiro modelo
      this.modeloAtualIndex = 0
      this.aplicarModeloAtual()

      this.gerarDadosSensoresSimulados()
    },

    carregarConfiguracaoSimplesCompatibilidade(dados, nome) {
      this.modeloCarregado = {
        nome: nome,
        quantidadeModelos: 1,
        logica: 'Modelo Único',
        dimensoesSVG: dados.dimensoesSVG || { largura: 350, altura: 300 }
      }

      // Criar um único modelo com a configuração fornecida
      const configuracaoUnica = {
        ...this.configPadrao,
        ...dados
      }

      // Garantir que posicoesCabos exista e seja um objeto
      if (!configuracaoUnica.posicoesCabos || typeof configuracaoUnica.posicoesCabos !== 'object') {
        configuracaoUnica.posicoesCabos = {}
      }

      // Se pos_x_cabo existe, usa para popular posicoesCabos
      if (configuracaoUnica.pos_x_cabo && Array.isArray(configuracaoUnica.pos_x_cabo)) {
        configuracaoUnica.pos_x_cabo.forEach((posX, index) => {
          configuracaoUnica.posicoesCabos[index + 1] = {
            x: posX,
            y: 0,
            offsetX: 0,
            offsetY: 0,
            timestampAlteracao: Date.now()
          };
        });
      }
      // Garantir que a propriedade distancia_entre_cabos também exista
      if (!configuracaoUnica.distancia_entre_cabos) {
        configuracaoUnica.distancia_entre_cabos = this.configPadrao.distancia_entre_cabos;
      }


      this.modelosCarregados = [{
        numero: 1,
        nome: 'Modelo Padrão',
        posicao: 'todos',
        configuracao: configuracaoUnica,
        quantidadePendulos: 3,
        sensoresPorPendulo: {}, // Sem informação específica para modelo simples
        timestampSalvamento: null
      }]

      // Inicializar com o modelo único
      this.modeloAtualIndex = 0
      this.aplicarModeloAtual()
      this.gerarDadosSensoresSimulados()
    },

    // 🎯 NOVOS MÉTODOS PARA SINCRONIZAÇÃO COM API REAL
    async carregarDadosAPI() {
      try {
        this.carregandoDadosAPI = true
        this.errorAPI = null

        // Obter token dinâmico do localStorage
        const token = localStorage.getItem('token') || ''
        const authToken = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''

        if (!authToken || authToken === 'Bearer ') {
          throw new Error('Token de autenticação não encontrado no localStorage')
        }

        const response = await axios.get(this.apiConfig.url, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        })

        if (!response.data) {
          throw new Error('Resposta da API vazia')
        }

        // Armazenar dados originais da API
        this.dadosPortal = response.data

        // Analisar estrutura dos arcos baseada na estrutura da API
        const analise = this.analisarEstruturaArcos(response.data)
        this.analiseArcos = analise

        // Gerar dados de sensores baseados na API
        this.gerarDadosSensoresReais()

        // Sincronizar com modelos carregados
        this.sincronizarModelosComDados()

        console.log('✅ Dados da API carregados com sucesso:', {
          totalArcos: analise.totalArcos,
          analise: analise
        })

      } catch (error) {
        console.error('❌ Erro ao carregar dados da API:', error)
        this.errorAPI = this.tratarErroAPI(error)
      } finally {
        this.carregandoDadosAPI = false
      }
    },

    // Analisar estrutura dos arcos baseada na estrutura da API (adaptado do Armazem2D)
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
            return 'Token de autenticação inválido ou expirado'
          case 403:
            return 'Acesso negado'
          case 404:
            return 'Endpoint da API não encontrado'
          case 500:
            return 'Erro interno do servidor'
          default:
            return `Erro HTTP ${error.response.status}: ${error.response.statusText}`
        }
      } else if (error.request) {
        return 'Erro de conectividade'
      } else {
        return error.message || 'Erro desconhecido ao carregar dados'
      }
    },

    // Sincronizar modelos carregados com os dados reais da API
    sincronizarModelosComDados() {
      if (!this.analiseArcos || !this.modeloCarregado) {
        console.log('⚠️  Sem dados ou modelo para sincronizar')
        return
      }

      console.log('🔄 Sincronizando modelos com dados reais:', {
        totalArcos: this.analiseArcos.totalArcos,
        quantidadeModelos: this.modeloCarregado.quantidadeModelos,
        arcoAtual: this.arcoAtual
      })

      // Aplicar modelo baseado na lógica de distribuição
      this.aplicarModeloParaArco(this.arcoAtual)
    },

    // Aplicar modelo específico para um arco baseado na lógica de distribuição
    aplicarModeloParaArco(numeroArco) {
      if (!this.modeloCarregado || !this.modelosCarregados.length) {
        console.log('⚠️  Sem modelo carregado para aplicar')
        return
      }

      const quantidadeModelos = this.modeloCarregado.quantidadeModelos
      let modeloParaAplicar

      if (quantidadeModelos === 1) {
        // 🎯 1 MODELO = APLICAR A TODOS OS ARCOS
        modeloParaAplicar = this.modelosCarregados[0]
        console.log(`📋 Aplicando modelo único a todos os arcos: ${modeloParaAplicar.nome}`)
      } else if (quantidadeModelos === 4) {
        // 🎯 4 MODELOS = DISTRIBUIÇÃO ESPECÍFICA POR ARCO
        const indiceModelo = this.determinarIndiceModeloPara4Modelos(numeroArco)
        modeloParaAplicar = this.modelosCarregados[indiceModelo] || this.modelosCarregados[0]
        console.log(`📋 Aplicando modelo ${indiceModelo + 1}/4 para arco ${numeroArco}: ${modeloParaAplicar.nome}`)
      } else {
        // Outras quantidades: usar o primeiro modelo ou implementar lógica específica
        modeloParaAplicar = this.modelosCarregados[0]
        console.log(`📋 Aplicando primeiro modelo para arco ${numeroArco}: ${modeloParaAplicar.nome}`)
      }

      // Atualizar modelo sincronizado
      this.modeloSincronizado = { ...modeloParaAplicar }
      
      // Sincronizar dados de sensores para o arco atual
      this.sincronizarDadosSensoresParaArco(numeroArco)
    },

    // Determinar qual índice de modelo usar para 4 modelos
    determinarIndiceModeloPara4Modelos(numeroArco) {
      // Lógica Frente/Par/Ímpar/Fundo baseada na posição do arco
      const modelos = this.modelosCarregados
      
      for (let i = 0; i < modelos.length; i++) {
        const modelo = modelos[i]
        const posicao = modelo.posicao?.toLowerCase() || ''
        
        if (posicao.includes('frente') && numeroArco === 1) return i
        if (posicao.includes('par') && numeroArco % 2 === 0) return i
        if (posicao.includes('ímpar') && numeroArco % 2 === 1 && numeroArco > 1) return i
        if (posicao.includes('fundo') && numeroArco === this.analiseArcos?.totalArcos) return i
      }
      
      // Fallback: usar modelo baseado no índice do arco
      return Math.min(numeroArco - 1, modelos.length - 1)
    },

    // Gerar dados de sensores baseados nos dados reais da API
    gerarDadosSensoresReais() {
      if (!this.dadosPortal?.arcos || !this.analiseArcos) {
        this.dadosSensoresSincronizados = null
        return
      }

      // Converter dados da API para formato compatível com ArmazemSvg
      this.dadosSensoresSincronizados = this.converterDadosParaRenderizacao(this.dadosPortal, this.arcoAtual)
    },

    // Converter dados da API para formato de renderização (adaptado do Armazem2D)
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

      return {
        leitura: leituraConvertida,
        arcoAtual: numeroArco,
        timestamp: new Date().toISOString()
      }
    },

    // Sincronizar dados de sensores para o arco específico
    sincronizarDadosSensoresParaArco(numeroArco) {
      if (!this.dadosPortal) return
      
      this.dadosSensoresSincronizados = this.converterDadosParaRenderizacao(this.dadosPortal, numeroArco)
      
      console.log(`🔄 Dados de sensores sincronizados para arco ${numeroArco}:`, {
        totalPendulos: Object.keys(this.dadosSensoresSincronizados.leitura || {}).length,
        timestamp: this.dadosSensoresSincronizados.timestamp
      })
    },

    // 🎯 NOVOS MÉTODOS DE NAVEGAÇÃO ENTRE ARCOS REAIS
    mudarArco(novoArco) {
      if (!this.analiseArcos || novoArco < 1 || novoArco > this.analiseArcos.totalArcos) {
        return
      }

      this.arcoAtual = novoArco
      
      // Aplicar modelo para o novo arco
      this.aplicarModeloParaArco(novoArco)
      
      console.log(`🔄 Navegado para arco ${novoArco}`)
    },
  }
}
</script>

<style scoped>
.badge {
  font-size: 0.75rem;
  margin: 0 2px;
}

@media (max-width: 768px) {
  .card-header .row {
    flex-direction: column;
  }

  .card-header .col-md-4,
  .card-header .col-md-8 {
    margin-bottom: 0.5rem;
  }

  .card-footer .row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .badge {
    font-size: 0.65rem;
    margin: 1px;
  }
}
</style>