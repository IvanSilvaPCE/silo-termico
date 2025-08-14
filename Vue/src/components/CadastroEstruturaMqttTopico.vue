<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Tópicos de estruturas MQTT cadastradas</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-estrutura" variant="outline-danger" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-trash></b-icon-trash>Excluir </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-estrutura" title="Excluir Tópico MQTT?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_estrutura_mqtt_topico }}) {{ itemSelecionado.nm_topico }}
                              <hr />
                              <b-button @click="popovers.excluir = false" variant="danger">Não</b-button>
                              <b-button class="ml-2" :disabled="isExcluindo" @click="excluir" variant="success">
                                 <b-spinner v-if="isExcluindo" small class="mr-1"></b-spinner>
                                 <span>Sim</span>
                              </b-button>
                           </div>
                        </b-popover>
                     </b-button-group>
                  </b-col>
                  <b-col class="my-1" md="6">
                     <b-form-group class="mb-0" label="Filtrar" label-for="filter-input" label-cols-sm="3" label-align-sm="right" label-size="">
                        <b-input-group size="">
                           <b-form-input id="filter-input" v-model="filter" type="search" placeholder="Digite para pesquisar"></b-form-input>
                           <b-input-group-append>
                              <b-button variant="outline-secondary" title="Limpar" :disabled="!filter" @click="filter = ''">
                                 <b-icon icon="x-circle"></b-icon>
                              </b-button>
                           </b-input-group-append>
                        </b-input-group>
                     </b-form-group>
                  </b-col>
               </div>
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_estrutura_mqtt_topico" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(detalhes)="row">
                     <b-button variant="outline-primary" size="sm" title="Ver Detalhes" @click="row.toggleDetails()" :disabled="!row.item.estruturas_mqtt_atus.length"><b-icon-eye-fill></b-icon-eye-fill></b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col sm="6" md="6" lg="3">
                              <h5>Tempo de Atualização Adicional</h5>
                              <span v-for="i in row.item.estruturas_mqtt_atus" :key="i.id_estrutura_mqtt_atu">{{ i.ds_estrutura_mqtt_atu }}</span>
                           </b-col>
                        </b-row>
                     </b-card>
                  </template>
               </b-table>
               <p class="text-center" v-if="!this.items.length && !isBusy">Nenhum resultado para listar</p>
               <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="right" class="my-0"></b-pagination>
            </div>
         </div>
      </div>
      <modal-cadastro-estrutura-mqtt-topico ref="modal" :objNovoTopico="objNovoTopico" :erros="erros" :tituloModal="tituloModal" @buscar="buscar"></modal-cadastro-estrutura-mqtt-topico>
   </div>
</template>

<script>
import client from '@/api'
import ModalCadastroEstruturaMqttTopico from './ModalCadastroEstruturaMqttTopico.vue'

export default {
   name: 'CadastroEstruturaMqttTopico',
   components: {
      ModalCadastroEstruturaMqttTopico
   },
   data() {
      return {
         isExcluindo: false,
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoTopico: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            { key: 'nr_topico', label: 'Nr.' },
            { key: 'nm_topico', label: 'Nome' },
            { key: 'nr_segundos_atu', label: 'Atualização', formatter: 'formatarNrSegundos' },
            { key: 'tp_topico', label: 'Tipo', formatter: 'formatarTpTopico' },
            { key: 'estrutura_mqtt.ds_estrutura_mqtt', label: 'Estrutura' },
            { key: 'ds_topico', label: 'Descrição' },
            { key: 'detalhes', label: 'Detalhes' }
         ]
      }
   },

   computed: {
      temAlgumSelecionado() {
         return this.selecionado.length > 0
      },
      itemSelecionado() {
         return this.selecionado[0] || {}
      },
      itemsFiltrados() {
         if (!this.filter) return this.items
         return this.items.filter((i) => {
            const keys = Object.keys(i)
            // keys.splice(keys.indexOf('id_estrutura_mqtt_topico'), 1)
            if (i.estrutura_mqtt && String(i.estrutura_mqtt.ds_estrutura_mqtt).toLowerCase().includes(this.filter)) {
               return true
            }
            return keys.find((k) => String(i[k]).toLowerCase().includes(this.filter))
         })
      }
   },

   methods: {
      formatarTpTopico(value) {
         if (value === 'C') return 'Configurações'
         if (value === 'P') return 'Parâmetros'
         if (value === 'D') return 'Dados'
         return value
      },
      formatarNrSegundos(value) {
         if (value >= 3600) {
            const horas = Math.floor(value / 3600)
            const minutos = Math.floor((value % 3600) / 60)
            if (minutos > 0) {
               return `${horas} h ${minutos} m`
            } else {
               return `${horas} h`
            }
         } else if (value >= 60) {
            const minutos = Math.floor(value / 60)
            return `${minutos} m`
         } else {
            return `${value} s`
         }
      },
      formNovo() {
         this.erros = []
         this.objNovoTopico = {}
         this.tituloModal = 'Cadastrar Tópico MQTT'
         this.$bvModal.show('cadastro')
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/estrutura_mqtt_topico').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.isBusy = false
         this.items = dados.data
         this.totalRows = this.items.length
      },
      async buscarEstruturasMqtt() {
         this.overlayEstruturasMqtt = true
         const dados = await client.get('/estrutura_mqtt').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar estruturas MQTT. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEstruturasMqtt = false
         this.estrutura = dados.data
      },
      async buscarTpTopicos() {
         this.overlayTpTopicos = true
         const dados = await client.get('/estrutura_mqtt_topico/tptopico').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tipos de tópicos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayTpTopicos = false
         this.topico = dados.data
      },
      async buscarEstruturasMqttAtu() {
         this.overlayEstruturaMqttAtu = true
         const dados = await client.get('/estrutura_mqtt_atu').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tempos de atualização. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEstruturaMqttAtu = false
         this.estruturaMqttAtu = dados.data
      },
      editar() {
         this.objNovoTopico = {
            ...this.itemSelecionado,
            id_estrutura_mqtt_atu: this.itemSelecionado.estruturas_mqtt_atus.map((item) => item.id_estrutura_mqtt_atu)
         }
         this.tituloModal = 'Editar Tópico MQTT'
         this.$bvModal.show('cadastro')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione um tópico MQTT na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_estrutura_mqtt_topico
         const result = await client.delete(`/estrutura_mqtt_topico/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Tópico MQTT',
               msg: 'Excluído com sucesso',
               variant: 'success'
            })
         }
         this.isExcluindo = false
         this.popovers.excluir = false
         this.buscar()
      },
      showMessage({ msg, title, variant }) {
         this.$bvToast.toast(msg, {
            title,
            toaster: 'b-toaster-bottom-right',
            variant,
            autoHideDelay: 3000,
            solid: false
         })
      }
   },

   mounted() {
      this.buscar()
      this.buscarEstruturasMqtt()
      this.buscarTpTopicos()
      this.buscarEstruturasMqttAtu()
      this.totalRows = this.items.length
   }
}
</script>

<style scoped>
.border-danger {
   border: 1.5px solid red;
   border-radius: 4px;
}
</style>