
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

      <div class="card-body text-center d-flex align-items-center justify-content-center p-3" :style="{
        height: 'calc(90vh - 120px)',
        minHeight: '400px'
      }">
        <div class="svg-container-responsive w-100 h-100">
          <svg :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`" :style="{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
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

export default {
  name: 'ArmazemComponente',
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
      
      // Configuração base padrão
      configPadrao: {
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
      
      // Configuração ativa aplicada
      config: {},
      
      // Dimensões SVG
      larguraSVG: 350,
      alturaSVG: 300,
      svgContent: '',
      
      // Dados para renderização de sensores (simulados)
      dadosSensores: null
    }
  },
  computed: {
    isMobile() {
      return typeof window !== 'undefined' && window.innerWidth <= 576
    }
  },
  mounted() {
    this.config = { ...this.configPadrao }
    this.updateSVG()
    this.buscarModelosSalvos()
  },
  methods: {
    async buscarModelosSalvos() {
      this.carregandoModelos = true
      try {
        console.log('🔄 [ArmazemComponente] Buscando modelos de armazém...')
        
        const resultado = await modeloSvgService.buscarModelos('A')
        
        if (resultado.success && Array.isArray(resultado.data)) {
          this.modelosDisponiveis = resultado.data.filter(modelo => 
            modelo.tp_svg === 'A' && modelo.nm_modelo && modelo.dado_svg
          )
          
          console.log('✅ [ArmazemComponente] Modelos encontrados:', this.modelosDisponiveis.length)
          
          if (this.modelosDisponiveis.length === 0) {
            this.mostrarToast('Nenhum modelo de armazém encontrado', 'info')
          }
        } else {
          console.error('❌ [ArmazemComponente] Erro ao buscar modelos:', resultado.error)
          this.mostrarToast(`Erro ao carregar modelos: ${resultado.error}`, 'error')
          this.modelosDisponiveis = []
        }
      } catch (error) {
        console.error('❌ [ArmazemComponente] Erro na busca:', error)
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
        console.log('🔄 [ArmazemComponente] Carregando modelo ID:', this.modeloSelecionado)
        
        const resultado = await modeloSvgService.buscarModeloPorId(this.modeloSelecionado)
        
        if (resultado.success && resultado.data) {
          const modelo = resultado.data
          console.log('📄 [ArmazemComponente] Modelo carregado:', modelo)
          
          await this.processarModeloCarregado(modelo)
          
        } else {
          console.error('❌ [ArmazemComponente] Erro ao carregar modelo:', resultado.error)
          this.mostrarToast(`Erro ao carregar modelo: ${resultado.error}`, 'error')
        }
      } catch (error) {
        console.error('❌ [ArmazemComponente] Erro no carregamento:', error)
        this.mostrarToast('Erro ao carregar modelo selecionado', 'error')
      }
    },

    async processarModeloCarregado(modelo) {
      try {
        console.log('🔄 [processarModeloCarregado] Processando:', modelo.nm_modelo)
        
        let dadosSvg
        if (typeof modelo.dado_svg === 'string') {
          dadosSvg = JSON.parse(modelo.dado_svg)
        } else {
          dadosSvg = modelo.dado_svg
        }

        console.log('📦 [processarModeloCarregado] Estrutura dos dados:', {
          versao: dadosSvg.versao,
          tipo: dadosSvg.tipo,
          tipoConfiguracao: dadosSvg.tipoConfiguracao,
          quantidadeModelos: dadosSvg.quantidadeModelos,
          temModelosDefinidos: !!dadosSvg.modelosDefinidos,
          temSistemaModelos: !!dadosSvg.sistemaModelos
        })

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
        console.error('❌ [processarModeloCarregado] Erro ao processar modelo:', error)
        this.mostrarToast(`Erro ao processar modelo: ${error.message}`, 'error')
      }
    },

    extrairLogicaDistribuicao(dadosSvg) {
      // Tentar extrair lógica de diferentes estruturas
      if (dadosSvg.sistemaModelos?.logicaDistribuicao?.nome) {
        return dadosSvg.sistemaModelos.logicaDistribuicao.nome
      }
      if (dadosSvg.logicaDistribuicao?.nome) {
        return dadosSvg.logicaDistribuicao.nome
      }
      
      // Determinar logica baseada na quantidade
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
      
      // Tentar diferentes estruturas de dados
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
        // Processar modelos encontrados
        Object.keys(modelosDefinidos).forEach(key => {
          const modelo = modelosDefinidos[key]
          modelos.push({
            numero: parseInt(key),
            nome: modelo.nome || `Modelo ${key}`,
            posicao: modelo.posicao || 'todos',
            configuracao: modelo.configuracao || modelo.config || {},
            quantidadePendulos: modelo.quantidadePendulos || 3,
            sensoresPorPendulo: modelo.sensoresPorPendulo || {},
            posicoesCabos: modelo.posicoesCabos || {},
            timestampSalvamento: modelo.timestampSalvamento || null
          })
        })
      } else {
        // Fallback para configuração simples
        modelos.push({
          numero: 1,
          nome: 'Modelo Único',
          posicao: 'todos',
          configuracao: dadosSvg.configuracao || dadosSvg,
          quantidadePendulos: 3,
          sensoresPorPendulo: { 1: 4, 2: 3, 3: 5 },
          posicoesCabos: {},
          timestampSalvamento: null
        })
      }

      // Ordenar modelos por número
      modelos.sort((a, b) => a.numero - b.numero)

      console.log('📋 [extrairModelosIndividuais] Modelos extraídos:', modelos)
      return modelos
    },

    aplicarModeloAtual() {
      if (!this.modelosCarregados || this.modelosCarregados.length === 0) {
        this.modeloAtual = null
        this.config = { ...this.configPadrao }
        this.updateSVG()
        return
      }

      this.modeloAtual = this.modelosCarregados[this.modeloAtualIndex] || this.modelosCarregados[0]
      
      // Mesclar configuração do modelo com configuração padrão
      this.config = this.mesclarConfiguracoes(this.configPadrao, this.modeloAtual.configuracao)
      
      // Aplicar dimensões SVG se disponíveis
      if (this.modeloCarregado.dimensoesSVG) {
        this.larguraSVG = this.modeloCarregado.dimensoesSVG.largura || 350
        this.alturaSVG = this.modeloCarregado.dimensoesSVG.altura || 300
      } else {
        this.calcularDimensoesSVG()
      }

      console.log('✅ [aplicarModeloAtual] Modelo aplicado:', {
        nome: this.modeloAtual.nome,
        configuracao: Object.keys(this.config).length,
        dimensoes: `${this.larguraSVG}x${this.alturaSVG}`
      })

      this.updateSVG()
    },

    mesclarConfiguracoes(configPadrao, configModelo) {
      const configMesclada = { ...configPadrao }
      
      if (!configModelo || typeof configModelo !== 'object') {
        return configMesclada
      }

      // Aplicar apenas valores definidos no modelo
      Object.keys(configModelo).forEach(chave => {
        if (configModelo[chave] !== undefined && configModelo[chave] !== null) {
          configMesclada[chave] = configModelo[chave]
        }
      })

      return configMesclada
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
          // Temperatura aleatória entre 15°C e 35°C
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
      this.gerarDadosSensoresSimulados()
    },

    limparModelo() {
      this.modeloSelecionado = ''
      this.modeloCarregado = null
      this.modelosCarregados = []
      this.modeloAtual = null
      this.modeloAtualIndex = 0
      this.config = { ...this.configPadrao }
      this.dadosSensores = null
      this.calcularDimensoesSVG()
      this.updateSVG()
      this.mostrarToast('Modelo limpo - voltou ao padrão', 'info')
    },

    // Métodos de descrição e informação
    getDescricaoConfiguracaoAtual() {
      if (this.modeloAtual) {
        const config = this.config
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

    calcularTotalSensores() {
      if (!this.modeloAtual || !this.modeloAtual.sensoresPorPendulo) return 0
      
      return Object.values(this.modeloAtual.sensoresPorPendulo).reduce((total, num) => total + (num || 0), 0)
    },

    // Métodos de renderização SVG
    updateSVG() {
      this.calcularDimensoesSVG()
      this.generateSVG()
    },

    calcularDimensoesSVG() {
      if (this.modeloCarregado?.dimensoesSVG) {
        // Usar dimensões salvas do modelo
        this.larguraSVG = this.modeloCarregado.dimensoesSVG.largura || 350
        this.alturaSVG = this.modeloCarregado.dimensoesSVG.altura || 300
        return
      }

      // Calcular dimensões baseadas na configuração
      const larguraBase = Math.max(this.config.lb || 350, 300)
      const alturaFundo = (this.config.pb || 185) + 20
      const alturaTopoNecessaria = 80
      const alturaTotal = alturaFundo + alturaTopoNecessaria

      let extensaoFundo = 0
      if (this.config.tipo_fundo === 1) {
        extensaoFundo = this.config.altura_funil_v || 40
      } else if (this.config.tipo_fundo === 2) {
        extensaoFundo = this.config.altura_duplo_v || 35
      }

      this.larguraSVG = larguraBase
      this.alturaSVG = Math.max(alturaTotal + extensaoFundo, 280)
    },

    generateSVG() {
      this.svgContent = this.renderArmazem() + this.renderSensores()
    },

    renderArmazem() {
      return `
        <style>
          .sensor-element, .pendulo-element, text, rect {
            transition: all 0.15s ease-out;
          }
        </style>
      ` + this.renderTelhado() + this.renderFundo()
    },

    renderTelhado() {
      const config = this.config
      const {
        tipo_telhado, curvatura_topo, pb, lb, hb, hf, lf, le, ht, tipo_fundo,
        pontas_redondas, raio_pontas, estilo_laterais, curvatura_laterais
      } = config

      if (tipo_telhado === 1) {
        // Telhado Pontudo
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 7
        }

        const alturaTopo = Math.max(10, 50 - (curvatura_topo || 30))
        const p1 = [(lb - lf) / 2, pb - hf + extensao]
        const p2 = [le, pb - hb + extensao]
        const p3 = [le, pb - ht]
        const p4 = [lb / 2, alturaTopo]
        const p5 = [lb - le, pb - ht]
        const p6 = [lb - le, pb - hb + extensao]
        const p7 = [lb - (lb - lf) / 2, pb - hf + extensao]

        if (pontas_redondas || estilo_laterais !== 'reta') {
          // Implementar modificações
          let pathTelhado = `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]}`
          
          if (estilo_laterais === 'curvatura_lateral' && curvatura_laterais !== 0) {
            if (curvatura_laterais < 0) {
              pathTelhado += ` Q ${p3[0] + Math.abs(curvatura_laterais)} ${(p3[1] + p4[1]) / 2} ${p4[0]} ${p4[1]}`
            } else {
              pathTelhado += ` Q ${p3[0] - curvatura_laterais} ${(p3[1] + p4[1]) / 2} ${p4[0]} ${p4[1]}`
            }
          } else {
            pathTelhado += ` L ${p4[0]} ${p4[1]}`
          }

          if (pontas_redondas) {
            const pontoControle1X = p4[0] - (raio_pontas || 15)
            const pontoControle2X = p4[0] + (raio_pontas || 15)
            pathTelhado = pathTelhado.replace(`L ${p4[0]} ${p4[1]}`, 
              `Q ${pontoControle1X} ${p4[1] - (raio_pontas || 15)} ${p4[0]} ${p4[1]} Q ${pontoControle2X} ${p4[1] - (raio_pontas || 15)} ${p5[0]} ${p5[1]}`)
          } else {
            if (estilo_laterais === 'curvatura_lateral' && curvatura_laterais !== 0) {
              if (curvatura_laterais < 0) {
                pathTelhado += ` Q ${p5[0] - Math.abs(curvatura_laterais)} ${(p5[1] + p4[1]) / 2} ${p5[0]} ${p5[1]}`
              } else {
                pathTelhado += ` Q ${p5[0] + curvatura_laterais} ${(p5[1] + p4[1]) / 2} ${p5[0]} ${p5[1]}`
              }
            } else {
              pathTelhado += ` L ${p5[0]} ${p5[1]}`
            }
          }

          pathTelhado += ` L ${p6[0]} ${p6[1]} L ${p7[0]} ${p7[1]} Z`
          return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="${pathTelhado}" />`
        } else {
          const pathTelhado = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')}`
          return `<polygon fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" points="${pathTelhado}" />`
        }
      } else if (tipo_telhado === 2) {
        // Telhado Arredondado
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        const alturaCurva = Math.max(10, 60 - (curvatura_topo || 30))
        let pathTelhado = `M ${(lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` L ${le} ${pb - hb + extensao}`
        pathTelhado += ` L ${le} ${pb - ht}`
        pathTelhado += ` Q ${lb / 2} ${alturaCurva} ${lb - le} ${pb - ht}`
        pathTelhado += ` L ${lb - le} ${pb - hb + extensao}`
        pathTelhado += ` L ${lb - (lb - lf) / 2} ${pb - hf + extensao} Z`

        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="${pathTelhado}" />`
      } else if (tipo_telhado === 3) {
        // Telhado em Arco
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        const raioArco = Math.max(20, curvatura_topo || 30)
        let pathTelhado = `M ${(lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` L ${le} ${pb - hb + extensao}`
        pathTelhado += ` L ${le} ${pb - ht}`
        pathTelhado += ` A ${(lb - le * 2) / 2} ${raioArco} 0 0 1 ${lb - le} ${pb - ht}`
        pathTelhado += ` L ${lb - le} ${pb - hb + extensao}`
        pathTelhado += ` L ${lb - (lb - lf) / 2} ${pb - hf + extensao} Z`

        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="${pathTelhado}" />`
      }

      return ''
    },

    renderFundo() {
      const { tipo_fundo } = this.config

      if (tipo_fundo === 0) {
        return this.renderFundoReto()
      } else if (tipo_fundo === 1) {
        return this.renderFundoFunilV()
      } else if (tipo_fundo === 2) {
        return this.renderFundoDuploV()
      }

      return ''
    },

    renderFundoReto() {
      const config = this.config
      const {
        pb, lb, hb, le, lf, altura_fundo_reto = 10,
        deslocamento_horizontal_fundo = 0, deslocamento_vertical_fundo = 0
      } = config

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]  
      const p3 = [lb - (lb - lf) / 2 + ajuste_horizontal, pb - altura_fundo_reto + ajuste_base]
      const p4 = [(lb - lf) / 2 + ajuste_horizontal, pb - altura_fundo_reto + ajuste_base]
      const p5 = [le + ajuste_horizontal, pb - hb + ajuste_base]
      const p6 = [0 + ajuste_horizontal, pb - hb + ajuste_base]
      const p7 = [0 + ajuste_horizontal, pb + ajuste_base]
      const p8 = [lb + ajuste_horizontal, pb + ajuste_base]

      const pathBase = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')} ${p8.join(',')}`
      return `<polygon fill="#999999" points="${pathBase}" />`
    },

    renderFundoFunilV() {
      const config = this.config
      const {
        pb, lb, hb, le, altura_funil_v = 40, posicao_ponta_v = 0,
        largura_abertura_v = 20, inclinacao_funil_v = 1,
        deslocamento_horizontal_fundo = 0, deslocamento_vertical_fundo = 0
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

    renderFundoDuploV() {
      const config = this.config
      const {
        pb, lb, hb, le, altura_duplo_v = 35,
        posicao_v_esquerdo = -0.5, posicao_v_direito = 0.5,
        largura_abertura_duplo_v = 15, altura_plataforma_duplo_v = 0.3,
        largura_plataforma_duplo_v = 40,
        deslocamento_horizontal_fundo = 0, deslocamento_vertical_fundo = 0
      } = config

      const centroBase = lb / 2
      const pontaEsquerdaX = centroBase + lb * 0.2 * posicao_v_esquerdo
      const pontaDireitaX = centroBase + lb * 0.2 * posicao_v_direito

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]
      const p3 = [pontaDireitaX + largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p4 = [pontaDireitaX - largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p5 = [centroBase + largura_plataforma_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v * altura_plataforma_duplo_v]
      const p6 = [centroBase - largura_plataforma_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v * altura_plataforma_duplo_v]
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

    renderSensores() {
      if (!this.dadosSensores || !this.modeloAtual) return ''

      const config = this.config
      const escala_sensores = config.escala_sensores || 16
      const dist_y_sensores = config.dist_y_sensores || 12
      const dist_x_sensores = config.dist_x_sensores || 0
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      const pb = config.pb || 185
      const yPendulo = pb + 15 + posicao_vertical

      let elementos = ''
      const quantidadePendulos = this.modeloAtual.quantidadePendulos || 3
      const posicoesCabos = this.calcularPosicoesCabos()

      Object.entries(this.dadosSensores.leitura).forEach(([numeroPendulo, sensores], index) => {
        const xCabo = posicoesCabos[index] + posicao_horizontal
        const numSensores = Object.keys(sensores).length

        // Retângulo do pêndulo
        elementos += `
          <rect
            x="${xCabo - escala_sensores / 2}"
            y="${yPendulo}"
            width="${escala_sensores}"
            height="${escala_sensores / 2}"
            rx="2" ry="2"
            fill="#3A78FD"
            stroke="none"
          />
        `

        // Texto do pêndulo
        elementos += `
          <text
            x="${xCabo}"
            y="${yPendulo + escala_sensores / 4}"
            text-anchor="middle"
            dominant-baseline="central"
            font-weight="bold"
            font-size="${escala_sensores * 0.4 - 0.5}"
            font-family="Arial"
            fill="white"
          >
            P${numeroPendulo}
          </text>
        `

        // Sensores
        Object.entries(sensores).forEach(([numeroSensor, dadosSensor]) => {
          const s = parseInt(numeroSensor)
          const ySensor = yPendulo - dist_y_sensores * s - 25 - afastamento_vertical_pendulo
          
          if (ySensor > 10 && ySensor < (this.alturaSVG - 60)) {
            const [temp] = dadosSensor
            const cor = this.corFaixaExata(temp)

            // Retângulo do sensor
            elementos += `
              <rect
                x="${xCabo - escala_sensores / 2}"
                y="${ySensor}"
                width="${escala_sensores}"
                height="${escala_sensores / 2}"
                rx="2" ry="2"
                fill="${cor}"
                stroke="black"
                stroke-width="1"
              />
            `

            // Texto do valor
            elementos += `
              <text
                x="${xCabo}"
                y="${ySensor + escala_sensores / 4}"
                text-anchor="middle"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 0.5}"
                font-family="Arial"
                fill="${cor === "#ff2200" ? "white" : "black"}"
              >
                ${temp.toFixed(1)}
              </text>
            `

            // Nome do sensor
            elementos += `
              <text
                x="${xCabo - escala_sensores / 2 - 2}"
                y="${ySensor + escala_sensores / 4}"
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
        })
      })

      return elementos
    },

    calcularPosicoesCabos() {
      const quantidadePendulos = this.modeloAtual?.quantidadePendulos || 3
      const larguraTotal = this.config.lb || 350
      const margemLateral = 35
      const larguraUtilizavel = larguraTotal - (2 * margemLateral)
      const posicoes = []

      if (quantidadePendulos === 1) {
        posicoes.push(larguraTotal / 2)
      } else {
        const espacamento = larguraUtilizavel / (quantidadePendulos - 1)
        for (let i = 0; i < quantidadePendulos; i++) {
          posicoes.push(margemLateral + (i * espacamento))
        }
      }

      // Aplicar posições personalizadas dos cabos se existirem
      if (this.modeloAtual.posicoesCabos) {
        Object.keys(this.modeloAtual.posicoesCabos).forEach(pendulo => {
          const index = parseInt(pendulo) - 1
          if (index >= 0 && index < posicoes.length) {
            const offset = this.modeloAtual.posicoesCabos[pendulo]
            posicoes[index] += parseFloat(offset.x) || 0
          }
        })
      }

      return posicoes
    },

    corFaixaExata(temp) {
      if (temp < 12) return '#0384fc'
      else if (temp < 15) return '#03e8fc'
      else if (temp < 17) return '#03fcbe'
      else if (temp < 21) return '#07fc03'
      else if (temp < 25) return '#c3ff00'
      else if (temp < 27) return '#fcf803'
      else if (temp < 30) return '#ffb300'
      else if (temp < 35) return '#ff2200'
      else if (temp < 50) return '#ff0090'
      else return '#f700ff'
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
    }
  }
}
</script>

<style scoped>
.svg-container-responsive {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

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
