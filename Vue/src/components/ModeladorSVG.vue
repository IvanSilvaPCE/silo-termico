<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <!-- Painel de Controles -->
      <div
        class="col-xl-3 col-lg-4 col-md-5 col-sm-12 modelador-painel-controles"
        :style="{
          height: isMobile ? 'auto' : '100vh',
          overflowY: isMobile ? 'visible' : 'auto',
          position: 'relative',
          borderRight: '2px solid #dee2e6',
          backgroundColor: '#f8f9fa',
          zIndex: 1000,
          maxHeight: isMobile ? 'none' : '100vh'
        }"
      >
        <div class="p-3">
          <h4 class="text-center mb-4">Modelador de Layouts</h4>

          <!-- Seletor de Tipo -->
          <div class="mb-3">
            <label class="form-label fw-bold">Tipo de Estrutura:</label>
            <b-form-select v-model="tipoAtivo" @change="onTipoChange">
              <b-form-select-option value="silo">Silo</b-form-select-option>
              <b-form-select-option value="armazem">Armazém</b-form-select-option>
            </b-form-select>
          </div>

          <!-- Controles para Silo -->
          <template v-if="tipoAtivo === 'silo'">
            <h6 class="mt-3 text-primary">Dimensões do Silo</h6>

            <div class="mb-3">
              <label class="form-label">Largura Base: {{ configSilo.lb }}px</label>
              <div class="d-flex align-items-center">
                <b-form-input
                  v-model.number="configSilo.lb"
                  type="range"
                  min="100"
                  max="400"
                  class="me-2"
                  @input="onSiloChange"
                />
                <b-button
                  size="sm"
                  variant="outline-secondary"
                  @click="resetSiloField('lb', 200)"
                  title="Resetar para padrão (200)"
                >
                  ×
                </b-button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Altura Superior: {{ configSilo.hs }}px</label>
              <div class="d-flex align-items-center">
                <b-form-input
                  v-model.number="configSilo.hs"
                  type="range"
                  min="100"
                  max="300"
                  class="me-2"
                  @input="onSiloChange"
                />
                <b-button
                  size="sm"
                  variant="outline-secondary"
                  @click="resetSiloField('hs', 180)"
                  title="Resetar para padrão (180)"
                >
                  ×
                </b-button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Altura Base: {{ configSilo.hb }}px</label>
              <div class="d-flex align-items-center">
                <b-form-input
                  v-model.number="configSilo.hb"
                  type="range"
                  min="5"
                  max="30"
                  class="me-2"
                  @input="onSiloChange"
                />
                <b-button
                  size="sm"
                  variant="outline-secondary"
                  @click="resetSiloField('hb', 15)"
                  title="Resetar para padrão (15)"
                >
                  ×
                </b-button>
              </div>
            </div>

            <h6 class="mt-3 text-primary">Sensores</h6>
            <div class="mb-3">
              <label class="form-label">Escala Sensores: {{ configSilo.escala_sensores }}px</label>
              <div class="d-flex align-items-center">
                <b-form-input
                  v-model.number="configSilo.escala_sensores"
                  type="range"
                  min="10"
                  max="25"
                  class="me-2"
                  @input="onSiloChange"
                />
                <b-button
                  size="sm"
                  variant="outline-secondary"
                  @click="resetSiloField('escala_sensores', 16)"
                  title="Resetar para padrão (16)"
                >
                  ×
                </b-button>
              </div>
            </div>

            <h6 class="mt-3 text-primary">Aeradores</h6>
            <div class="mb-3">
              <b-form-checkbox v-model="configSilo.aeradores_ativo" @change="onSiloChange">
                Ativar Aeradores
              </b-form-checkbox>
            </div>

            <template v-if="configSilo.aeradores_ativo">
              <div class="mb-3">
                <label class="form-label">Número de Aeradores: {{ configSilo.na }}</label>
                <div class="d-flex align-items-center">
                  <b-form-input
                    v-model.number="configSilo.na"
                    type="range"
                    min="2"
                    max="6"
                    class="me-2"
                    @input="onSiloChange"
                  />
                  <b-button
                    size="sm"
                    variant="outline-secondary"
                    @click="resetSiloField('na', 4)"
                    title="Resetar para padrão (4)"
                  >
                    ×
                  </b-button>
                </div>
              </div>
            </template>
          </template>

          <!-- Controles para Armazém -->
          <template v-if="tipoAtivo === 'armazem'">
            <!-- Seção 0: Configuração de Modelos de Arcos -->
            <b-card class="mb-3">
              <template #header>
                <h6 class="mb-0 text-white">🏗️ Modelos de Arcos do Armazém</h6>
              </template>
              <div class="row mb-3">
                <div class="col-lg-6 col-md-12 mb-3">
                  <label class="form-label">Quantidade de Modelos:</label>
                  <b-form-select v-model="quantidadeModelosArcos" @change="onQuantidadeModelosChange">
                    <b-form-select-option :value="1">1 Modelo</b-form-select-option>
                    <b-form-select-option :value="2">2 Modelos</b-form-select-option>
                    <b-form-select-option :value="3">3 Modelos</b-form-select-option>
                    <b-form-select-option :value="4">4 Modelos</b-form-select-option>
                  </b-form-select>
                </div>
                <div class="col-lg-6 col-md-12 mb-3">
                  <label class="form-label">Modelo Atual:</label>
                  <b-form-select v-model="modeloArcoAtual" @change="onModeloArcoChange">
                    <b-form-select-option :value="null">Selecione Modelo</b-form-select-option>
                    <b-form-select-option 
                      v-for="i in quantidadeModelosArcos" 
                      :key="i" 
                      :value="i"
                    >
                      Modelo {{ i }} - {{ getDescricaoModelo(i) }}
                    </b-form-select-option>
                  </b-form-select>
                </div>
              </div>

              <div v-if="modeloArcoAtual" class="alert alert-info">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>EDITANDO:</strong> {{ modelosArcos[modeloArcoAtual]?.nome || `Modelo ${modeloArcoAtual}` }}
                    <b-badge variant="primary" class="ms-2">
                      {{ modelosArcos[modeloArcoAtual]?.posicao || '' }}
                    </b-badge>
                    <b-badge v-if="modelosSalvos[modeloArcoAtual]" variant="success" class="ms-2">
                      SALVO
                    </b-badge>
                  </div>
                  <b-button size="sm" variant="success" @click="salvarModeloAtual" title="Salvar este modelo">
                    💾 Salvar Modelo
                  </b-button>
                </div>
              </div>

              <div v-if="!modeloArcoAtual" class="alert alert-warning">
                <strong>⚠️ Nenhum modelo selecionado</strong>
              </div>
            </b-card>

            <!-- Seção 1: Dimensões Básicas -->
            <b-card class="mb-3">
              <template #header>
                <h6 class="mb-0 text-white">📐 Dimensões Básicas do Armazém</h6>
              </template>
              <div class="mb-2">
                <label class="small fw-bold">Profundidade Base (pb):</label>
                <div class="input-group input-group-sm">
                  <b-form-input
                    v-model.number="configArmazem.pb"
                    type="range"
                    min="100"
                    max="300"
                    @input="onArmazemChange"
                  />
                  <span class="input-group-text">{{ configArmazem.pb }}</span>
                  <b-button variant="outline-secondary" @click="resetArmazemField('pb', 185)" title="Reset">
                    ×
                  </b-button>
                </div>
              </div>
              <div class="mb-2">
                <label class="small fw-bold">Largura Base (lb):</label>
                <div class="input-group input-group-sm">
                  <b-form-input
                    v-model.number="configArmazem.lb"
                    type="range"
                    min="200"
                    max="500"
                    @input="onArmazemChange"
                  />
                  <span class="input-group-text">{{ configArmazem.lb }}</span>
                  <b-button variant="outline-secondary" @click="resetArmazemField('lb', 350)" title="Reset">
                    ×
                  </b-button>
                </div>
              </div>
            </b-card>

            <!-- Seção 2: Configuração do Telhado -->
            <b-card class="mb-3">
              <template #header>
                <h6 class="mb-0 text-white">🏠 Configuração do Telhado</h6>
              </template>
              <div class="mb-2">
                <label class="small fw-bold">Tipo do Telhado:</label>
                <div class="input-group input-group-sm">
                  <b-form-select v-model="configArmazem.tipo_telhado" @change="onArmazemChange">
                    <b-form-select-option :value="1">Pontudo</b-form-select-option>
                    <b-form-select-option :value="2">Arredondado</b-form-select-option>
                    <b-form-select-option :value="3">Arco</b-form-select-option>
                  </b-form-select>
                  <b-button variant="outline-secondary" @click="resetArmazemField('tipo_telhado', 1)" title="Reset">
                    ×
                  </b-button>
                </div>
              </div>
            </b-card>

            <!-- Seção 3: Configuração do Fundo -->
            <b-card class="mb-3">
              <template #header>
                <h6 class="mb-0 text-white">⬇️ Configuração do Fundo</h6>
              </template>
              <div class="mb-2">
                <label class="small fw-bold">Tipo do Fundo:</label>
                <div class="input-group input-group-sm">
                  <b-form-select v-model="configArmazem.tipo_fundo" @change="onArmazemChange">
                    <b-form-select-option :value="0">Reto</b-form-select-option>
                    <b-form-select-option :value="1">Funil/V</b-form-select-option>
                    <b-form-select-option :value="2">Duplo V</b-form-select-option>
                  </b-form-select>
                  <b-button variant="outline-secondary" @click="resetArmazemField('tipo_fundo', 0)" title="Reset">
                    ×
                  </b-button>
                </div>
              </div>
            </b-card>

            <!-- Seção 4: Configuração dos Sensores -->
            <b-card class="mb-3">
              <template #header>
                <h6 class="mb-0 text-white">🌡️ Configuração dos Sensores</h6>
              </template>
              <div class="mb-2">
                <label class="small fw-bold">Escala dos Sensores:</label>
                <div class="input-group input-group-sm">
                  <b-form-input
                    v-model.number="configArmazem.escala_sensores"
                    type="range"
                    min="10"
                    max="30"
                    @input="onArmazemChange"
                  />
                  <span class="input-group-text">{{ configArmazem.escala_sensores }}</span>
                  <b-button variant="outline-secondary" @click="resetArmazemField('escala_sensores', 16)" title="Reset">
                    ×
                  </b-button>
                </div>
              </div>
            </b-card>
          </template>

          <!-- Botões de Reset -->
          <div class="d-grid gap-2 mb-3">
            <b-button variant="warning" @click="resetarPadrao">
              🔄 Resetar para Padrão
            </b-button>
            <b-button v-if="tipoAtivo === 'armazem'" variant="outline-warning" @click="resetarModelosParaPadrao">
              🗑️ Limpar Todos os Modelos
            </b-button>
          </div>

          <!-- Gerenciador de Configurações -->
          <b-card class="mt-3">
            <template #header>
              <h6 class="mb-0 text-white">📋 Gerenciar Configurações</h6>
            </template>
            <div class="mb-3">
              <label class="form-label">Nome da Configuração:</label>
              <b-form-input
                v-model="nomeConfiguracao"
                placeholder="Digite o nome para salvar/carregar"
              />
            </div>

            <div class="d-grid gap-2 mb-3">
              <b-button
                variant="success"
                @click="salvarConfiguracao"
                :disabled="!nomeConfiguracao.trim()"
              >
                💾 Salvar {{ tipoAtivo === 'silo' ? 'Silo' : 'Armazém' }} Completo
              </b-button>
              <b-button
                variant="primary"
                @click="carregarConfiguracao"
                :disabled="!nomeConfiguracao.trim()"
              >
                📂 Carregar Configuração
              </b-button>
            </div>
          </b-card>
        </div>
      </div>

      <!-- Área de Visualização -->
      <div
        class="col-xl-9 col-lg-8 col-md-7 col-sm-12"
        :style="{
          padding: '10px',
          height: isMobile ? 'auto' : '100vh',
          overflow: isMobile ? 'visible' : 'hidden',
          minHeight: isMobile ? '400px' : '100vh'
        }"
      >
        <div class="d-flex justify-content-center align-items-center h-100" style="minHeight: 400px">
          <b-card 
            class="w-100"
            :style="{
              maxWidth: '100%',
              minHeight: '400px',
              maxHeight: 'calc(100vh - 60px)',
              height: 'calc(100vh - 60px)'
            }"
          >
            <template #header>
              <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between text-white">
                <h6 class="mb-1 mb-md-0">
                  Preview - {{ tipoAtivo === 'silo' ? 'Silo' : `${modeloArcoAtual ? `EDITANDO: ${modelosArcos[modeloArcoAtual]?.nome || 'Modelo ' + modeloArcoAtual}` : 'Visualização Geral'}` }}
                </h6>
              </div>
            </template>

            <div
              class="card-body text-center d-flex align-items-center justify-content-center p-2"
              :style="{
                height: 'calc(100vh - 250px)',
                overflow: 'auto',
                minHeight: '300px',
                maxHeight: 'calc(100vh - 250px)'
              }"
            >
              <svg
                :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`"
                :style="{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 320px)',
                  minHeight: '250px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                v-html="svgContent"
              >
              </svg>
            </div>
          </b-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModeladorSVG',
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
        tipo_fundo: 0,
        altura_fundo_reto: 10,
        altura_funil_v: 18,
        posicao_ponta_v: 0,
        inclinacao_funil_v: 1,
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
          nome: 'Modelo Único'
        }
      },
      modelosSalvos: {},

      tipoAtivo: 'silo',
      nomeConfiguracao: '',
      larguraSVG: 400,
      alturaSVG: 300,
      svgContent: ''
    }
  },
  computed: {
    isMobile() {
      return window.innerWidth <= 576
    }
  },
  mounted() {
    this.resetarModelosParaPadrao()
    this.updateSVG()
  },
  methods: {
    onTipoChange() {
      this.updateSVG()
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

    onQuantidadeModelosChange() {
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

        novosModelos[i] = this.modelosArcos[i] || {
          posicao,
          config: { ...this.configArmazem },
          nome
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

    onModeloArcoChange() {
      if (this.modeloArcoAtual) {
        this.configArmazem = { ...this.modelosArcos[this.modeloArcoAtual].config }
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

    salvarModeloAtual() {
      if (!this.modeloArcoAtual) {
        this.$bvToast.toast('Selecione um modelo para salvar!', {
          title: 'Atenção',
          variant: 'warning',
          autoHideDelay: 3000
        })
        return
      }

      const modeloParaSalvar = {
        ...this.modelosArcos[this.modeloArcoAtual],
        config: { ...this.configArmazem }
      }

      this.modelosArcos[this.modeloArcoAtual] = modeloParaSalvar
      this.modelosSalvos[this.modeloArcoAtual] = modeloParaSalvar

      this.salvarModelosAutomatico()

      this.$bvToast.toast(`Modelo ${this.modeloArcoAtual} (${modeloParaSalvar.nome}) salvo com sucesso!`, {
        title: 'Sucesso',
        variant: 'success',
        autoHideDelay: 3000
      })
    },

    salvarModelosAutomatico() {
      const configCompleta = {
        quantidadeModelos: this.quantidadeModelosArcos,
        modelosArcos: this.modelosArcos,
        modeloAtual: this.modeloArcoAtual,
        timestamp: new Date().toISOString(),
        versao: '2.0',
        tipo: 'configuracao_armazem_completa'
      }

      localStorage.setItem('configArmazem', JSON.stringify(configCompleta))
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
        tipo_fundo: 0,
        altura_fundo_reto: 10,
        altura_funil_v: 18,
        posicao_ponta_v: 0,
        inclinacao_funil_v: 1,
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
          nome: 'Modelo Único'
        }
      }
      this.modeloArcoAtual = null
      this.modelosSalvos = {}
    },

    salvarConfiguracao() {
      if (!this.nomeConfiguracao.trim()) {
        this.$bvToast.toast('Digite um nome para salvar a configuração!', {
          title: 'Atenção',
          variant: 'warning',
          autoHideDelay: 3000
        })
        return
      }

      if (this.tipoAtivo === 'silo') {
        localStorage.setItem('configSilo', JSON.stringify(this.configSilo))
        localStorage.setItem(`configSilo_${this.nomeConfiguracao}`, JSON.stringify(this.configSilo))
        this.$bvToast.toast(`Configuração Silo "${this.nomeConfiguracao}" salva com sucesso!`, {
          title: 'Sucesso',
          variant: 'success',
          autoHideDelay: 3000
        })
      } else {
        const configCompleta = {
          nome: this.nomeConfiguracao,
          quantidadeModelos: this.quantidadeModelosArcos,
          modelosArcos: this.modelosArcos,
          modeloAtual: null,
          timestamp: new Date().toISOString(),
          versao: '2.0',
          tipo: 'configuracao_armazem_completa'
        }

        localStorage.setItem('configArmazem', JSON.stringify(configCompleta))
        localStorage.setItem(`configArmazem_${this.nomeConfiguracao}`, JSON.stringify(configCompleta))

        this.$bvToast.toast(`Configuração completa do armazém "${this.nomeConfiguracao}" salva!`, {
          title: 'Sucesso',
          variant: 'success',
          autoHideDelay: 3000
        })

        this.resetarModelosParaPadrao()
        this.modelosSalvos = {}
        this.nomeConfiguracao = ''
      }
    },

    carregarConfiguracao() {
      if (!this.nomeConfiguracao) return

      const chave = `config${this.tipoAtivo === 'silo' ? 'Silo' : 'Armazem'}_${this.nomeConfiguracao}`
      const configSalva = localStorage.getItem(chave)

      if (configSalva) {
        const dadosCarregados = JSON.parse(configSalva)

        if (this.tipoAtivo === 'silo') {
          this.configSilo = dadosCarregados
          this.$bvToast.toast('Configuração do silo carregada com sucesso!', {
            title: 'Sucesso',
            variant: 'success',
            autoHideDelay: 3000
          })
        } else {
          if (dadosCarregados.modelosArcos && dadosCarregados.tipo === 'configuracao_armazem_completa') {
            this.quantidadeModelosArcos = dadosCarregados.quantidadeModelos
            this.modelosArcos = dadosCarregados.modelosArcos
            this.modelosSalvos = dadosCarregados.modelosArcos
            this.modeloArcoAtual = null

            const primeiroModelo = dadosCarregados.modelosArcos[1]
            if (primeiroModelo && primeiroModelo.config) {
              this.configArmazem = { ...primeiroModelo.config }
            }

            this.$bvToast.toast(`Configuração completa do armazém "${this.nomeConfiguracao}" carregada!`, {
              title: 'Sucesso',
              variant: 'success',
              autoHideDelay: 3000
            })
          } else {
            this.configArmazem = dadosCarregados
            this.$bvToast.toast('Configuração antiga convertida para o novo formato!', {
              title: 'Sucesso',
              variant: 'success',
              autoHideDelay: 3000
            })
          }
        }
        this.updateSVG()
      } else {
        this.$bvToast.toast('Configuração não encontrada!', {
          title: 'Erro',
          variant: 'danger',
          autoHideDelay: 3000
        })
      }
    },

    updateSVG() {
      this.calcularDimensoesSVG()
      this.generateSVG()
    },

    calcularDimensoesSVG() {
      if (this.tipoAtivo === 'silo') {
        this.larguraSVG = this.configSilo.lb + (this.configSilo.aeradores_ativo ? this.configSilo.ds * 2 + 68 : 0)
        this.alturaSVG = this.configSilo.hs + this.configSilo.hb * 1.75
      } else {
        this.larguraSVG = Math.max(this.configArmazem.lb, 300)
        this.alturaSVG = Math.max(this.configArmazem.pb + this.configArmazem.ht + 50, 200)
      }
    },

    generateSVG() {
      if (this.tipoAtivo === 'silo') {
        this.svgContent = this.renderSilo()
      } else {
        this.svgContent = this.renderArmazem()
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

      let svg = `
        <g id="g_des_fundo">
          <polygon fill="#E7E7E7" points="${points}" />
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
            ${angles.map(angle => 
              `<path d="${dBlade}" fill="white" ${angle === 0 ? '' : `transform="rotate(${angle},86.35,24.05)"`} />`
            ).join('')}
          </g>
        `
      }

      return aeradores
    },

    renderArmazem() {
      return this.renderTelhado() + this.renderFundoArmazem()
    },

    renderTelhado() {
      const { tipo_telhado, curvatura_topo, pb, lb, hb, hf, lf, le, ht, tipo_fundo } = this.configArmazem

      if (tipo_telhado === 1) {
        // Pontudo
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 7
        }

        const p1 = [(lb - lf) / 2, pb - hf + extensao]
        const p2 = [le, pb - hb + extensao]
        const p3 = [le, pb - ht]
        const p4 = [lb / 2, 1]
        const p5 = [lb - le, pb - ht]
        const p6 = [lb - le, pb - hb + extensao]
        const p7 = [lb - (lb - lf) / 2, pb - hf + extensao]

        const pathTelhado = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')}`

        return `<polygon fill="#E6E6E6" stroke="#999999" stroke-width="1.7" points="${pathTelhado}" />`
      }

      return ''
    },

    renderFundoArmazem() {
      const { tipo_fundo } = this.configArmazem

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
      const { pb, lb, hb, le, lf, altura_fundo_reto = 10, deslocamento_horizontal_fundo = 0, deslocamento_vertical_fundo = 0 } = this.configArmazem

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
      // Implementação básica do funil V
      const { pb, lb, hb, le } = this.configArmazem
      const pathBase = `${lb},${pb - hb} ${lb - le},${pb - hb} ${lb/2},${pb} ${le},${pb - hb} 0,${pb - hb} 0,${pb} ${lb},${pb}`
      return `<polygon fill="#999999" points="${pathBase}" />`
    },

    renderBaseDuploV() {
      // Implementação básica do duplo V
      const { pb, lb, hb, le } = this.configArmazem
      const pathBase = `${lb},${pb - hb} ${lb - le},${pb - hb} ${lb*0.75},${pb} ${lb*0.25},${pb} ${le},${pb - hb} 0,${pb - hb} 0,${pb} ${lb},${pb}`
      return `<polygon fill="#999999" points="${pathBase}" />`
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

.card-header {
  background-color: #007bff !important;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group-text {
  min-width: 60px;
  text-align: center;
}
</style>