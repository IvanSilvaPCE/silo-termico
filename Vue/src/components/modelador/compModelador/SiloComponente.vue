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
        <h4 class="mb-0">Preview - Silo</h4>
        <div class="row align-items-center mt-2">
          <div class="col-md-4">
            <small class="text-white-50">
              {{ getDescricaoConfiguracaoAtual() }}
            </small>
          </div>
          <div class="col-md-8">
            <div class="d-flex align-items-center flex-wrap gap-2 justify-content-center justify-content-md-end">
              
              <select
                v-model="modeloSelecionadoId"
                @change="carregarModeloSelecionado"
                class="form-select form-select-sm"
                style="min-width: 180px; font-size: 0.8rem;"
                title="Selecionar modelo de silo salvo"
                :disabled="carregandoModelos">
                <option value="">-- Selecionar Modelo --</option>
                <option v-for="modelo in modelosSilo" :key="modelo.id_svg" :value="modelo.id_svg">
                  {{ modelo.nm_modelo }}
                </option>
              </select>
              
              <button
                @click="carregarModelosSilo"
                class="btn btn-sm btn-outline-light"
                :disabled="carregandoModelos"
                title="Atualizar lista de modelos">
                <i class="fa fa-refresh" :class="{ 'fa-spin': carregandoModelos }"></i>
              </button>
              
            </div>
          </div>
        </div>

        <!-- Informações do modelo carregado -->
        <div v-if="modeloCarregado" class="row mt-2">
          <div class="col-12">
            <div class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
              <span class="badge text-white" style="background-color: #06335E;">
                {{ modeloCarregado.nome || 'Modelo Silo' }}
              </span>
              <span class="badge bg-secondary text-white">
                {{ modeloCarregado.versao || '5.0' }}
              </span>
              <span class="badge bg-success">
                Aeradores: {{ configSiloParaComponente.aeradores_ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Status de carregamento -->
        <div v-if="carregandoModelos || errorModelos" class="row mt-2">
          <div class="col-12">
            <div class="d-flex justify-content-center align-items-center">
              <span v-if="carregandoModelos" class="badge bg-warning text-dark">
                🔄 Carregando modelos...
              </span>
              <span v-else-if="errorModelos" class="badge bg-danger text-white">
                ❌ Erro: {{ errorModelos }}
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
        <SiloSvg
          :config="configSiloParaComponente"
          :dados-sensores="dadosSensores"
          :modelo-atual="modeloAtualParaComponente"
        />
      </div>

      <!-- Footer com informações adicionais -->
      <div v-if="modeloCarregado" class="card-footer bg-light p-2">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start">
              <span class="me-2">📊 Configuração:</span>
              <span class="badge bg-info text-white">
                {{ configSiloParaComponente.quantidadePendulos || 5 }} Pêndulos
              </span>
              <span class="badge bg-secondary text-white ms-1">
                Sensores: {{ calcularTotalSensores() }}
              </span>
            </div>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <div class="d-flex flex-wrap justify-content-center justify-content-md-end align-items-center gap-1">
              <span class="badge bg-primary text-white">
                {{ modeloCarregado.descricao || 'Sem descrição' }}
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
import SiloSvg from './SiloSvg.vue'

export default {
  name: 'SiloComponente',
  components: {
    SiloSvg
  },
  data() {
    return {
      // Dados dos modelos carregados
      modelosSilo: [],
      modeloCarregado: null,
      modeloSelecionadoId: '',
      carregandoModelos: false,
      errorModelos: null,
      
      // Configuração padrão do silo
      configPadrao: {
        lb: 200,
        hs: 180,
        hb: 15,
        eb: 5,
        aeradores_ativo: false,
        na: 4,
        ds: 30,
        dy: 0,
        da: 35,
        escala_sensores: 16,
        dist_y_sensores: 12,
        quantidadePendulos: 5,
        sensoresPorPendulo: {
          1: 5, 2: 5, 3: 5, 4: 5, 5: 5
        }
      },
      
      // Dados para renderização de sensores (simulados)
      dadosSensores: null
    }
  },
  computed: {
    // Configuração preparada para o componente SiloSvg
    configSiloParaComponente() {
      if (this.modeloCarregado?.configuracao) {
        return {
          ...this.configPadrao,
          ...this.modeloCarregado.configuracao
        }
      }
      return this.configPadrao
    },
    
    // Modelo atual preparado para o componente
    modeloAtualParaComponente() {
      if (this.modeloCarregado) {
        return {
          quantidadePendulos: this.modeloCarregado.quantidadePendulos || 5,
          sensoresPorPendulo: this.modeloCarregado.sensoresPorPendulo || {},
          configuracao: this.modeloCarregado.configuracao || {}
        }
      }
      return {
        quantidadePendulos: 5,
        sensoresPorPendulo: {},
        configuracao: {}
      }
    }
  },
  mounted() {
    this.carregarModelosSilo()
    this.gerarDadosSensoresSimulados()
  },
  methods: {
    async carregarModelosSilo() {
      this.carregandoModelos = true
      this.errorModelos = null
      
      try {
        const response = await modeloSvgService.buscarModelos('S') // Filtrar apenas Silos
        
        if (response.success && response.status === 200) {
          this.modelosSilo = response.data || []
          
          if (this.modelosSilo.length === 0) {
            this.errorModelos = 'Nenhum modelo de silo encontrado'
          }
        } else {
          this.errorModelos = response.error || 'Erro ao carregar modelos'
        }
      } catch (error) {
        this.errorModelos = 'Erro ao conectar com o servidor'
      } finally {
        this.carregandoModelos = false
      }
    },
    
    async carregarModeloSelecionado() {
      if (!this.modeloSelecionadoId) {
        this.modeloCarregado = null
        return
      }
      
      const modeloSelecionado = this.modelosSilo.find(m => m.id_svg == this.modeloSelecionadoId)
      if (!modeloSelecionado) {
        this.mostrarToast('Modelo não encontrado!', 'error')
        return
      }
      
      try {
        await this.processarModeloCarregado(modeloSelecionado)
      } catch (error) {
        this.mostrarToast(`Erro ao carregar modelo: ${error.message}`, 'error')
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
        
        // Processar dados do silo com estrutura v6.0
        this.modeloCarregado = {
          nome: modelo.nm_modelo,
          descricao: modelo.ds_modelo,
          versao: dadosSvg.versaoConfiguracao || dadosSvg.versao || '6.0',
          tipo: dadosSvg.tipoEstrutura || 'silo',
          quantidadePendulos: dadosSvg.quantidadePendulos || dadosSvg.pendulos?.quantidadePendulos || 5,
          sensoresPorPendulo: dadosSvg.sensoresPorPendulo || dadosSvg.pendulos?.sensoresPorPendulo || {},
          configuracao: {
            ...this.configPadrao,
            // Aplicar dimensões se existirem
            lb: dadosSvg.lb || dadosSvg.dimensoes?.lb || this.configPadrao.lb,
            hs: dadosSvg.hs || dadosSvg.dimensoes?.hs || this.configPadrao.hs,
            hb: dadosSvg.hb || dadosSvg.dimensoes?.hb || this.configPadrao.hb,
            eb: dadosSvg.eb || dadosSvg.dimensoes?.eb || this.configPadrao.eb,
            // Aplicar configurações de aeradores
            aeradores_ativo: dadosSvg.aeradores_ativo || dadosSvg.aeradores?.ativo || false,
            na: dadosSvg.na || dadosSvg.aeradores?.quantidade || 4,
            ds: dadosSvg.ds || dadosSvg.aeradores?.deslocamento_superior || 30,
            dy: dadosSvg.dy || dadosSvg.aeradores?.deslocamento_y || 0,
            da: dadosSvg.da || dadosSvg.aeradores?.distancia_aeradores || 35,
            aerador_rotacao: dadosSvg.aerador_rotacao || dadosSvg.aeradores?.rotacao || 0,
            aerador_escala: dadosSvg.aerador_escala || dadosSvg.aeradores?.escala || 1,
            // Aplicar configurações de sensores
            escala_sensores: dadosSvg.escala_sensores || dadosSvg.sensores?.escala_sensores || 16,
            dist_y_sensores: dadosSvg.dist_y_sensores || dadosSvg.sensores?.dist_y_sensores || 12,
            posicao_horizontal: dadosSvg.posicao_horizontal || dadosSvg.sensores?.posicao_horizontal || 0,
            posicao_vertical: dadosSvg.posicao_vertical || dadosSvg.sensores?.posicao_vertical || 0,
            // Aplicar quantidade de pêndulos e sensores
            quantidadePendulos: dadosSvg.quantidadePendulos || dadosSvg.pendulos?.quantidadePendulos || 5,
            sensoresPorPendulo: dadosSvg.sensoresPorPendulo || dadosSvg.pendulos?.sensoresPorPendulo || {},
            // Aplicar posições manuais se existirem
            posicoesManualPendulos: dadosSvg.posicoesManualPendulos || {},
            posicoesManualSensores: dadosSvg.posicoesManualSensores || {},
            // Aplicar estrutura de posições do modelador se existir
            pendulos: dadosSvg.pendulos || null,
            modeloEspecifico: {
              quantidadePendulos: dadosSvg.quantidadePendulos || dadosSvg.pendulos?.quantidadePendulos || 5,
              sensoresPorPendulo: dadosSvg.sensoresPorPendulo || dadosSvg.pendulos?.sensoresPorPendulo || {},
              posicoesManualPendulos: dadosSvg.posicoesManualPendulos || {},
              posicoesManualSensores: dadosSvg.posicoesManualSensores || {}
            }
          }
        }
        
        // Gerar dados de sensores simulados para o modelo carregado
        this.gerarDadosSensoresSimulados()
        
        this.mostrarToast(`Modelo "${modelo.nm_modelo}" carregado com sucesso!`, 'success')
        
      } catch (error) {
        console.error('Erro ao processar modelo:', error)
        this.mostrarToast(`Erro ao processar modelo: ${error.message}`, 'error')
      }
    },
    
    gerarDadosSensoresSimulados() {
      const quantidadePendulos = this.modeloCarregado?.quantidadePendulos || this.configPadrao.quantidadePendulos
      const sensoresPorPendulo = this.modeloCarregado?.sensoresPorPendulo || this.configPadrao.sensoresPorPendulo
      
      const dadosSimulados = {}
      
      for (let p = 1; p <= quantidadePendulos; p++) {
        const numSensores = sensoresPorPendulo[p] || 5
        dadosSimulados[`P${p}`] = {}
        
        for (let s = 1; s <= numSensores; s++) {
          // Simular leitura de temperatura entre 20-35°C
          const temperatura = (20 + Math.random() * 15).toFixed(1)
          dadosSimulados[`P${p}`][s] = {
            temperatura: parseFloat(temperatura),
            status: 'ok',
            timestamp: new Date().toISOString()
          }
        }
      }
      
      this.dadosSensores = dadosSimulados
    },
    
    getDescricaoConfiguracaoAtual() {
      if (this.modeloCarregado) {
        return `${this.modeloCarregado.nome} - ${this.modeloCarregado.versao}`
      }
      return 'Configuração Padrão'
    },
    
    calcularTotalSensores() {
      const sensoresPorPendulo = this.modeloCarregado?.sensoresPorPendulo || this.configPadrao.sensoresPorPendulo
      return Object.values(sensoresPorPendulo).reduce((total, sensores) => total + (sensores || 0), 0)
    },
    
    resetarPadrao() {
      this.modeloCarregado = null
      this.modeloSelecionadoId = ''
      this.gerarDadosSensoresSimulados()
      this.mostrarToast('Voltou para configuração padrão!', 'success')
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
</style>