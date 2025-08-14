<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Variáveis de tópicos MQTT cadastradas</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-variavel" variant="outline-danger" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-trash></b-icon-trash>Excluir </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-variavel" title="Excluir Variável MQTT?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_estrutura_mqtt_variavel }}) {{ itemSelecionado.nm_variavel }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_estrutura_mqtt_variavel" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(detalhes)="row">
                     <b-button variant="outline-primary" size="sm" title="Ver Detalhes" @click="row.toggleDetails()" :disabled="!row.item.ds_variavel?.length"><b-icon-eye-fill></b-icon-eye-fill></b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col sm="6" md="6" lg="3">
                              <h5>Descrição</h5>
                              <span>{{ row.item.ds_variavel }}</span>
                           </b-col>
                           <b-col sm="6" md="6" lg="3">
                              <h5>Gera Alarme</h5>
                              <span>{{ formatarFlAlarme(row.item.fl_alarme) }}</span>
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
      <modal-cadastro-estrutura-mqtt-variavel ref="modal" :objNovaVariavel="objNovaVariavel" :erros="erros" :tituloModal="tituloModal" @buscar="buscar"></modal-cadastro-estrutura-mqtt-variavel>
   </div>
</template>

<script>
import client from '@/api'
import ModalCadastroEstruturaMqttVariavel from './ModalCadastroEstruturaMqttVariavel.vue'

export default {
   name: 'CadastroEstruturaMqttVariavel',
   components: {
      ModalCadastroEstruturaMqttVariavel
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
         objNovaVariavel: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            { key: 'nm_variavel', label: 'Nome' },
            { key: 'tag_variavel', label: 'Tag' },
            { key: 'tp_variavel', label: 'Tipo', formatter: 'formatarTpVariavel' },
            { key: 'tamanho', label: 'Tamanho' },
            { key: 'vl_min', label: 'Mín.' },
            { key: 'vl_max', label: 'Máx.' },
            { key: 'escala', label: 'Escala' },
            { key: 'estrutura_mqtt_topico.nm_topico', label: 'Tópico' },
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
            keys.splice(keys.indexOf('id_estrutura_mqtt_variavel'), 1)
            keys.splice(keys.indexOf('estrutura_mqtt_topico'), 1)
            const variavelFormatada = this.formatarTpVariavel(i.tp_variavel)
            if (variavelFormatada.toLowerCase().includes(this.filter)) {
               return true
            }
            if (i.estrutura_mqtt_topico && String(i.estrutura_mqtt_topico.nm_topico).toLowerCase().includes(this.filter)) {
               return true
            }
            return keys.find((k) => String(i[k]).toLowerCase().includes(this.filter))
         })
      }
   },

   methods: {
      formatarTpVariavel(value) {
         if (value === 'C') return 'Caracter'
         if (value === 'N') return 'Numérico'
         if (value === 'B') return 'Booleano'
         if (value === 'A') return 'Binário'
         return value
      },
      formatarFlAlarme(value) {
         return value === 'S' ? 'Sim' : value === 'N' ? 'Não' : value
      },
      formNovo() {
         this.erros = []
         this.objNovaVariavel = {
            fl_alarme: 'N'
         }
         this.tituloModal = 'Cadastrar Variável MQTT'
         this.$bvModal.show('cadastro')
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/estrutura_mqtt_variavel').catch((err) => {
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
      editar() {
         this.objNovaVariavel = { ...this.itemSelecionado }
         this.tituloModal = 'Editar Variável MQTT'
         this.$bvModal.show('cadastro')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione uma variável MQTT na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_estrutura_mqtt_variavel
         const result = await client.delete(`/estrutura_mqtt_variavel/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Variável MQTT',
               msg: 'Excluída com sucesso',
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
      this.totalRows = this.items.length
   }
}
</script>

<style>
</style>