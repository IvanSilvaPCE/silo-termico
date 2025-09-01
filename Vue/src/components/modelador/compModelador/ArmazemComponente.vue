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
      <div class="card-header bg-primary text-white text-center">
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
                class="btn btn-sm btn-outline-light"
                title="Limpar seleção">
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Informações do modelo carregado -->
        <div v-if="modeloCarregado" class="row mt-2">
          <div class="col-12">
            <div class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
              <span class="badge bg-success">
                {{ modeloCarregado.quantidadeModelos || 1 }} Modelo{{ (modeloCarregado.quantidadeModelos || 1) > 1 ? 's' : '' }}
              </span>
              <span class="badge bg-info">
                {{ modeloCarregado.logica || 'Modelo Único' }}
              </span>
              <span v-if="modeloAtual" class="badge bg-warning">
                Editando: {{ modeloAtual.nome || 'Modelo' }}
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
          :config="configAtual"
          :dados-sensores="dadosSensores"
          :modelo-atual="modeloAtual"
          :largura-svg="larguraSVG"
          :altura-svg="alturaSVG"
        />
      </div>

      <!-- Navegação de Modelos -->
      <div v-if="modeloCarregado && modeloCarregado.quantidadeModelos > 1" class="card-footer bg-light p-2">
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

      // Dimensões SVG
      larguraSVG: 350,
      alturaSVG: 300,

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
      tipoAtivo: 'armazem'
    }
  },
  computed: {
    configAtual() {
      if (this.modeloAtual?.configuracao) {
        // Garante que as propriedades padrão sejam mescladas corretamente
        // e que as posições dos cabos sejam tratadas
        const configComCabos = {
          ...this.configPadrao,
          ...this.modeloAtual.configuracao,
          posicoesCabos: this.modeloAtual.configuracao.posicoesCabos || this.configPadrao.posicoesCabos,
          distancia_entre_cabos: this.modeloAtual.configuracao.distancia_entre_cabos || this.configPadrao.distancia_entre_cabos
        }
        return configComCabos
      }
      return this.configPadrao
    }
  },
  mounted() {
    this.buscarModelosSalvos()
    this.gerarDadosSensoresSimulados()
    // Chamada para inicializar posições dos cabos com base na configuração padrão
    // Isso garante que as propriedades existam desde o início
    this.inicializarPosicoesCabos()
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

      let modelosDefinidos = null

      if (dadosSvg.modelosDefinidos) {
        modelosDefinidos = dadosSvg.modelosDefinidos
      } else if (dadosSvg.sistemaModelos?.modelosDefinidos) {
        modelosDefinidos = dadosSvg.sistemaModelos.modelosDefinidos
      } else if (dadosSvg.modelos) {
        modelosDefinidos = dadosSvg.modelos
      } else if (dadosSvg.modelosArcos) {
        modelosDefinidos = dadosSvg.modelosArcos
      }

      if (modelosDefinidos) {
        Object.keys(modelosDefinidos).forEach(key => {
          const modelo = modelosDefinidos[key]
          // Garantir que configuração existe e tem estrutura correta
          const configuracao = modelo.configuracao || modelo.config || {}

          // Certificar que posicoesCabos exista e seja um objeto
          if (!configuracao.posicoesCabos || typeof configuracao.posicoesCabos !== 'object') {
            configuracao.posicoesCabos = {}
          }

          modelos.push({
            numero: parseInt(key),
            nome: modelo.nome || `Modelo ${key}`,
            posicao: modelo.posicao || 'todos',
            configuracao: configuracao,
            quantidadePendulos: modelo.quantidadePendulos || 3,
            sensoresPorPendulo: modelo.sensoresPorPendulo || {},
            timestampSalvamento: modelo.timestampSalvamento || configuracao.timestampPosicoesCabos || null
          })
        })
      } else {
        // Para modelo único, garantir estrutura de configuração
        const configuracao = dadosSvg.configuracao || dadosSvg

        // Garantir que posicoesCabos exista e seja um objeto
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
      console.log(`🔄 [APLICAR] Aplicando Modelo ${numeroModelo}:`, {
        anteriorIndex: modeloAnterior ? (this.modelosCarregados.findIndex(m => m.numero === modeloAnterior.numero) + 1) : 'nenhum',
        novoIndex: this.modeloAtualIndex + 1,
        quantidadePendulos: this.modeloAtual.quantidadePendulos,
        configLargura: this.modeloAtual.configuracao?.lb,
        posicoesExistentes: this.modeloAtual.configuracao?.pos_x_cabo
      })

      // Aplicar dimensões SVG baseadas na configuração específica deste modelo
      if (this.modeloAtual.configuracao && (this.modeloAtual.configuracao.lb || this.modeloAtual.configuracao.largura)) {
        // Usar dimensões específicas deste modelo
        const larguraModelo = this.modeloAtual.configuracao.lb || this.modeloAtual.configuracao.largura
        this.larguraSVG = larguraModelo
        console.log(`📐 [APLICAR] Modelo ${numeroModelo} - Usando largura específica: ${larguraModelo}`)
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
      const quantidadePendulos = this.modeloAtual.quantidadePendulos || 3
      const sensoresPorPendulo = this.modeloAtual.sensoresPorPendulo || {}

      for (let p = 1; p <= quantidadePendulos; p++) {
        dadosSimulados[p] = {}
        const numSensores = sensoresPorPendulo[p] || Math.floor(Math.random() * 4) + 2

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
      const larguraBase = Math.max(this.configAtual.lb || 350, 300)
      const pb = this.configAtual.pb || 185
      const alturaTopoNecessaria = 80

      // Calcular extensão do fundo baseado no tipo
      let extensaoFundo = 0
      if (this.configAtual.tipo_fundo === 1) {
        extensaoFundo = this.configAtual.altura_funil_v || 40
      } else if (this.configAtual.tipo_fundo === 2) {
        extensaoFundo = this.configAtual.altura_duplo_v || 35
      }

      // Altura mínima para sensores (considerando pêndulos e sensores)
      const alturaMinimaSensores = 60

      // Altura total ajustada para remover espaço desnecessário
      const alturaTotal = pb + extensaoFundo + alturaMinimaSensores

      this.larguraSVG = larguraBase
      this.alturaSVG = Math.max(alturaTotal, 250)

      // Recalcular posições dos cabos quando as dimensões mudam
      this.recalcularPosicoesCabos()
    },

    preservarPosicoesCabos() {
      if (!this.modeloAtual || !this.modeloAtual.configuracao) return

      const config = this.modeloAtual.configuracao
      const quantidadePendulos = this.modeloAtual.quantidadePendulos || 3
      const numeroModelo = this.modeloAtual.numero || (this.modeloAtualIndex + 1)

      console.log(`💾 [PRESERVAÇÃO] Preservando posições exatas do Modelo ${numeroModelo}:`, {
        quantidadePendulos,
        posicoesCabosIndividuais: config.posicoesCabos
      })

      // Garantir estrutura de posições individuais sem alterá-las
      if (!config.posicoesCabos) {
        config.posicoesCabos = {}
      }

      // Apenas garantir que a estrutura existe para cada cabo
      for (let i = 1; i <= quantidadePendulos; i++) {
        if (!config.posicoesCabos[i]) {
          config.posicoesCabos[i] = {
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
      }

      // Construir array pos_x_cabo baseado nas posições individuais PRESERVADAS
      const posicoesArray = []
      for (let i = 1; i <= quantidadePendulos; i++) {
        if (config.posicoesCabos[i]) {
          const posicaoFinal = (config.posicoesCabos[i].x || 0) + (config.posicoesCabos[i].offsetX || 0)
          posicoesArray.push(posicaoFinal)
        } else {
          posicoesArray.push(0)
        }
      }
      config.pos_x_cabo = posicoesArray

      console.log(`✅ [PRESERVAÇÃO] Modelo ${numeroModelo} - Posições preservadas:`, {
        pos_x_cabo: config.pos_x_cabo,
        posicoesCabos: config.posicoesCabos
      })
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
        console.log("✅ [Inicialização] Posições de cabos inicializadas na configuração padrão.");
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
          console.log(`🆕 [Inicialização] Modelo ${numeroModelo} - Criada posição para Cabo ${i}:`, config.posicoesCabos[i]);
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
          console.log(`✅ [Inicialização] Modelo ${numeroModelo} - Posição preservada para Cabo ${i}:`, posicoesCabosExistentes[i]);
        }
      }
      console.log(`✅ [Inicialização] Modelo ${numeroModelo} - Estrutura de posições de cabos garantida.`);
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
          console.log(`🆕 [CABOS] Modelo ${numeroModelo} - Criada nova posição para Cabo ${i}:`, config.posicoesCabos[i])
        } else {
          // Se já existe, PRESERVAR as posições salvas e apenas garantir campos
          if (config.posicoesCabos[i].y === undefined) config.posicoesCabos[i].y = 0
          if (config.posicoesCabos[i].offsetX === undefined) config.posicoesCabos[i].offsetX = 0
          if (config.posicoesCabos[i].offsetY === undefined) config.posicoesCabos[i].offsetY = 0
          if (!config.posicoesCabos[i].timestampAlteracao) config.posicoesCabos[i].timestampAlteracao = Date.now()

          // IMPORTANTE: NÃO sobrescrever a posição X se já foi customizada
          console.log(`✅ [CABOS] Modelo ${numeroModelo} - Posição preservada para Cabo ${i}:`, config.posicoesCabos[i])
        }
      }

      console.log(`🎯 [CABOS] Modelo ${numeroModelo} - Estrutura final garantida:`, {
        pos_x_cabo: config.pos_x_cabo,
        posicoesCabos: config.posicoesCabos
      });
    },

    calcularTotalSensores() {
      if (!this.modeloAtual || !this.modeloAtual.sensoresPorPendulo) return 0

      return Object.values(this.modeloAtual.sensoresPorPendulo).reduce((total, num) => total + (num || 0), 0)
    },

    getDescricaoConfiguracaoAtual() {
      if (this.modeloAtual) {
        const config = this.configAtual
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
        'todos': 'badge bg-info',
        'par': 'badge bg-primary',
        'impar': 'badge bg-warning',
        'frente': 'badge bg-success',
        'fundo': 'badge bg-danger',
        'frente_fundo': 'badge bg-success'
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

      // Salvar no localStorage após cada alteração
      this.salvarPosicionamentoLocalStorage()

      console.log(`🎯 [POSIÇÃO EXATA] Modelo ${numeroModelo} - Cabo ${numeroCabo} - ${propriedade}: ${valorNumerico}`, {
        posicaoCompleta: config.posicoesCabos[numeroCabo],
        arrayPosicoes: config.pos_x_cabo,
        personalizado: true
      })

      // Forçar atualização reativa do Vue
      this.$forceUpdate()
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
        
        console.log('💾 [LOCALSTORAGE] Posicionamento salvo:', chave, dadosCompletos)
        
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
      console.log('📦 [carregarConfiguracaoCompletaV4] Carregando configuração v4.0 completa')

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
              console.log(`🎯 [carregarConfiguracaoCompletaV4] Modelo ${key} - Posições dos cabos preservadas:`, configuracaoModelo.posicoesCabos)
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
              quantidadePendulos: modelo.quantidadePendulos || 3,
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
      console.log('📦 [carregarConfiguracaoCompletaV3] Carregando configuração v3.0 completa')
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
      console.log('📦 [carregarConfiguracaoSimplesCompatibilidade] Carregando configuração simples')
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