<template>
   <div class="midde_cont">
      <div>
         <div class="white_shd full margem">
            <div class="map_section padding_infor_info p-3">
               <b-row class="mt-3">
                  <b-col sm="12" md="12" lg="7" class="d-flex align-items-center text-nowrap">
                     <h1 class="fonte mb-0">Mapa de gerenciamento</h1>
                     <span class="ml-1 fonte2">/ Filtrando {{ filtro }}s</span>
                  </b-col>
                  <b-col sm="12" md="12" lg="5" class="text-right">
                     <span class="mr-1 text-right">Filtrar:</span>
                     <b-button-group class="mb-2 mb-md-0">
                        <b-button variant="outline-info" class="" :class="{ active: filtro === 'unidade' }" @click="filtro = 'unidade'" :disabled="overlayEstruturas"> <b-icon icon="building"></b-icon> Unidades </b-button>
                        <b-button variant="outline-info" class="" :class="{ active: filtro === 'equipamento' }" @click="filtro = 'equipamento'" :disabled="overlayEstruturas"> <b-icon icon="eject"></b-icon> Equipamentos </b-button>
                     </b-button-group>
                     <b-button variant="outline-primary" class="ml-2" @click="resetModal()">Limpar Filtros</b-button>
                     <b-icon-question-circle @click="ajuda" scale="1.8" class="mouse ml-3"></b-icon-question-circle>
                  </b-col>
               </b-row>
               <hr class="mb-0" />
            </div>
            <div class="map_section padding_infor_info p-0">
               <b-overlay :show="overlayEstruturas" rounded="sm">
                  <b-row class="">
                     <b-col lg="8" class="pr-lg-0">
                        <mapa-tabela ref="tabelaRef" :estrutura="!estruturaTabela.length ? estrutura : estruturaTabela" :filtro="filtro" @imagens="receberImagens" @acionarBusca="acionarBusca"></mapa-tabela>
                     </b-col>
                     <b-col lg="4" class="altura">
                        <mapa-leaflet :estrutura="estrutura" :filtro="filtro" :imagens="imagemCache" @equipamentosFiltrados="receberEquipamentos"></mapa-leaflet>
                     </b-col>
                  </b-row>
               </b-overlay>
            </div>
         </div>
      </div>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p>
            O que é uma unidade? <br />
            É um local físico que possui um ou mais equipamentos instalados, podendo ser uma cooperativa, uma fazenda ou um pequeno produtor
         </p>
         <p>
            O que é um equipamento? <br />
            É um produto instalado em uma unidade, categorizado por sua finalidade como termometria, secador, máquina de limpeza. Cuja operação gera dados que são exibidos no Portal PCE DEEPCE
         </p>
         <p>A cor da situação da unidade ou equipamento é uma forma visual de representar um resumo do estado, considerando os dados recebidos pelo Portal PCE DEEPCE. Existem três possíveis estados (cores):</p>
         <div class="d-flex">
            <b-badge class="pr-4 pb-3 mr-1" style="background-color: #28a745">&nbsp;</b-badge>
            <p class="m-0 mr-1">Online</p>
         </div>
         <p class="m-0">Recebendo dados. Funcionamento normal</p>
         <hr />
         <div class="d-flex">
            <b-badge class="pr-4 pb-3 mr-1" style="background-color: #dc3545">&nbsp;</b-badge>
            <p class="m-0 mr-1">Alerta</p>
         </div>
         <p class="m-0">Os dados recebidos indicam alguma condição que merece atenção. Recomendado acessar a página da unidade ou equipamento para visualizar o que está acontecendo</p>
         <hr />
         <div class="d-flex">
            <b-badge class="pr-4 pb-3 mr-1" style="background-color: #6c757d">&nbsp;</b-badge>
            <p class="m-0 mr-1">Offline</p>
         </div>
         <p class="m-0">Não recebeu dados nos últimos 30 minutos. Pode ocorrer por instabilidade da conexão com a internet no local onde o equipamento está instalado ou o próprio equipamento pode estar desligado</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import MapaLeaflet from '../components/MapaLeaflet.vue'
import MapaTabela from '../components/MapaTabela.vue'
import client from '@/api'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'MapaGerenciaView',
   components: {
      MapaLeaflet,
      MapaTabela
   },
   data() {
      return {
         filtroFabricante: '',
         filtroEmpresa: '',
         filtroUnidade: '',
         filtroCategoria: [1, 2, 7],
         filtroStatus: '',
         imagemCache: {},
         filtro: localStorage.getItem('filtro') || 'unidade',
         overlayEstruturas: false,
         estrutura: [],
         estruturaTabela: []
      }
   },

   methods: {
      async buscarEstruturas() {
         this.salvarFiltros()
         this.filtroFabricante = this.filtroFabricante ?? ''
         this.filtroEmpresa = this.filtroEmpresa ?? ''
         this.filtroUnidade = this.filtroUnidade ?? ''
         this.filtroCategoria = this.filtroCategoria ?? ''
         this.filtroStatus = this.filtroStatus ?? ''
         this.overlayEstruturas = true
         const dados = await client.get(`/estrutura_pessoa/estruturamapa?filtro=${this.filtro}&fabricante=${this.filtroFabricante}&empresa=${this.filtroEmpresa}&unidade=${this.filtroUnidade}&categoria=${this.filtroCategoria}&status=${this.filtroStatus}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEstruturas = false
         if (this.filtro == 'unidade') {
            this.estrutura = dados.data.filter((estrutura) => estrutura.estrutura_equipamentos && estrutura.estrutura_equipamentos.length > 0)
         } else {
            this.estrutura = dados.data
         }
      },
      receberImagens(newValue) {
         this.imagemCache = newValue
      },
      resetModal() {
         this.$refs.tabelaRef.limparFiltros()
         this.filtroFabricante = ''
         this.filtroEmpresa = ''
         this.filtroUnidade = ''
         this.filtroCategoria = [1, 2, 7]
         this.filtroStatus = ''
         this.filtro = 'unidade'
         this.buscarEstruturas()
      },
      receberEquipamentos(equipamentos) {
         this.estruturaTabela = equipamentos
      },
      verificarPerfilOperacao,
      salvarFiltros() {
         localStorage.setItem('filtro', this.filtro)
         localStorage.setItem('filtroFabricante', this.filtroFabricante)
         localStorage.setItem('filtroEmpresa', this.filtroEmpresa)
         localStorage.setItem('filtroUnidade', this.filtroUnidade)
         localStorage.setItem('filtroCategoria', this.filtroCategoria)
         localStorage.setItem('filtroStatus', this.filtroStatus)
      },
      buscarFiltros() {
         this.filtro = localStorage.getItem('filtro') || 'unidade'
         this.filtroFabricante = localStorage.getItem('filtroFabricante')
            ? localStorage
                 .getItem('filtroFabricante')
                 .split(',')
                 .filter((item) => item.trim() !== '')
                 .map((item) => parseInt(item.trim()))
            : ''
         this.filtroEmpresa = localStorage.getItem('filtroEmpresa')
            ? localStorage
                 .getItem('filtroEmpresa')
                 .split(',')
                 .filter((item) => item.trim() !== '')
                 .map((item) => parseInt(item.trim()))
            : ''
         this.filtroUnidade = localStorage.getItem('filtroUnidade')
            ? localStorage
                 .getItem('filtroUnidade')
                 .split(',')
                 .filter((item) => item.trim() !== '')
                 .map((item) => parseInt(item.trim()))
            : ''
         this.filtroCategoria = localStorage
            .getItem('filtroCategoria')
            ?.split(',')
            .map((item) => parseInt(item.trim())) || [1, 2, 7]
         this.filtroStatus = localStorage.getItem('filtroStatus')
            ? localStorage
                 .getItem('filtroStatus')
                 .split(',')
                 .filter((item) => item.trim() !== '')
                 .map((item) => item.trim())
            : ''
      },
      acionarBusca() {
         this.buscarFiltros()
         this.buscarEstruturas()
      },
      ajuda() {
         this.$bvModal.show('ajuda')
      }
   },

   mounted() {
      this.buscarFiltros()
      this.buscarEstruturas()
   },

   watch: {
      filtro(newVal) {
         if (newVal) {
            this.$refs.tabelaRef.limparFiltros()
            this.filtroFabricante = ''
            this.filtroEmpresa = ''
            this.filtroUnidade = ''
            this.filtroCategoria = [1, 2, 7]
            this.filtroStatus = ''
            this.salvarFiltros()
            this.buscarFiltros()
            this.buscarEstruturas()
         }
      }
   }
}
</script>

<style scoped>
.margem {
   margin-top: 30px;
}

.altura {
   height: 65vh;
}

.mouse {
   cursor: pointer;
}

.fonte {
   font-size: 15px;
   letter-spacing: -0.5px;
}

.fonte2 {
   font-size: 12px;
   letter-spacing: -0.5px;
}

.fonte3 {
   font-size: 12px;
}

@media (min-height: 600px) and (max-height: 699px) {
   .altura {
      height: 65vh;
   }
}

@media (min-height: 700px) and (max-height: 768px) {
   .altura {
      height: 70vh;
   }
   .fonte {
      font-size: 24px;
      letter-spacing: normal;
   }

   .fonte2 {
      font-size: 14px;
      letter-spacing: normal;
   }
}

@media (min-height: 768px) and (max-height: 799px) {
   .altura {
      height: 73vh;
   }
   .fonte {
      font-size: 24px;
      letter-spacing: normal;
   }

   .fonte2 {
      font-size: 14px;
      letter-spacing: normal;
   }
}

@media (min-height: 900px) and (max-height: 1080px) {
   .altura {
      height: 77vh;
   }
   .fonte {
      font-size: 24px;
      letter-spacing: normal;
   }

   .fonte2 {
      font-size: 14px;
      letter-spacing: normal;
   }
}

@media (min-height: 1080px) and (max-height: 1300px) {
   .altura {
      height: 77vh;
   }
   .fonte {
      font-size: 24px;
      letter-spacing: normal;
   }

   .fonte2 {
      font-size: 14px;
      letter-spacing: normal;
   }
}

@media (min-height: 1301px) and (max-height: 1900px) {
   .altura {
      height: 85vh;
   }
   .fonte {
      font-size: 24px;
      letter-spacing: normal;
   }

   .fonte2 {
      font-size: 14px;
      letter-spacing: normal;
   }
}

@media (min-height: 1901px) and (max-height: 2160px) {
   .altura {
      height: 90vh;
   }
   .fonte {
      font-size: 24px;
      letter-spacing: normal;
   }

   .fonte2 {
      font-size: 14px;
      letter-spacing: normal;
   }
}
</style>