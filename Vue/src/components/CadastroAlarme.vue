<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Alarmes cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-alarme" variant="outline-danger" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-trash></b-icon-trash>Excluir </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-alarme" title="Excluir Alarme?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_alarme }}) {{ itemSelecionado.ds_alarme }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_alarme" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(detalhes)="row">
                     <b-button variant="outline-primary" size="sm" title="Ver Detalhes" @click="row.toggleDetails()"><b-icon-eye-fill></b-icon-eye-fill></b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col sm="6" md="6" lg="3">
                              <h5>Gera Assistência</h5>
                              <p>{{ formatarAssistencia(row.item.fl_assistencia) }}</p>
                           </b-col>
                           <b-col sm="6" md="6" lg="4">
                              <h5>Prioridade da Assistência</h5>
                              <p>{{ formatarPrioridade(row.item.fl_prioridade) }}</p>
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
      <modal-cadastro-alarme ref="modal" :objNovoAlarme="objNovoAlarme" :erros="erros" :tituloModal="tituloModal" @buscar="buscar"></modal-cadastro-alarme>
   </div>
</template>

<script>
import client from '@/api'
import ModalCadastroAlarme from './ModalCadastroAlarme.vue'

export default {
   name: 'CadastroAlarme',
   components: {
      ModalCadastroAlarme
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
         objNovoAlarme: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            { key: 'cd_alarme', label: 'Cód.', tdClass: 'text-center', class: 'text-center' },
            { key: 'ds_alarme', label: 'Descrição' },
            { key: 'tp_criticidade', label: 'Criticidade', formatter: 'formatarCriticidade' },
            { key: 'causa.ds_causa', label: 'Causa' },
            { key: 'risco.nm_risco', label: 'Risco' },
            { key: 'tipo_alarme.nm_tipo_alarme', label: 'Tipo' },
            { key: 'grupo_alarme.nm_grupo_alarme', label: 'Grupo' },
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
            keys.splice(keys.indexOf('id_alarme'), 1)
            keys.splice(keys.indexOf('cd_alarme'), 1)
            keys.splice(keys.indexOf('id_causa'), 1)
            keys.splice(keys.indexOf('id_risco'), 1)
            keys.splice(keys.indexOf('id_tipo_alarme'), 1)
            keys.splice(keys.indexOf('id_grupo_alarme'), 1)
            const criticidadeFormatada = this.formatarCriticidade(i.tp_criticidade)
            if (criticidadeFormatada.toLowerCase().includes(this.filter)) {
               return true
            }
            if (i.causa && String(i.causa.ds_causa).toLowerCase().includes(this.filter)) {
               return true
            }
            if (i.risco && String(i.risco.nm_risco).toLowerCase().includes(this.filter)) {
               return true
            }
            if (i.tipo_alarme && String(i.tipo_alarme.nm_tipo_alarme).toLowerCase().includes(this.filter)) {
               return true
            }
            if (i.grupo_alarme && String(i.grupo_alarme.nm_grupo_alarme).toLowerCase().includes(this.filter)) {
               return true
            }
            return keys.find((k) => String(i[k]).toLowerCase().includes(this.filter))
         })
      }
   },

   methods: {
      formatarCriticidade(value) {
         if (value === 0) return 'Alerta'
         if (value === 10) return 'Baixo'
         if (value === 25) return 'Alto'
         if (value === 50) return 'Crítico'
         return value
      },
      formatarAssistencia(value) {
         return value === 'S' ? 'Sim' : value === 'N' ? 'Não' : value
      },
      formatarPrioridade(value) {
         if (value === 'B') return 'Baixa'
         if (value === 'N') return 'Normal'
         if (value === 'A') return 'Alta'
         if (value === null) return '-'
         return value
      },
      formNovo() {
         this.$refs.modal.erros = []
         this.objNovoAlarme = {}
         this.tituloModal = 'Cadastrar Alarme'
         this.$bvModal.show('cadastro-alarme')
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/alarme').catch((err) => {
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
         this.objNovoAlarme = { ...this.itemSelecionado }
         this.$refs.modal.erros = []
         this.tituloModal = 'Editar Alarme'
         this.$bvModal.show('cadastro-alarme')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione um alarme na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_alarme
         const result = await client.delete(`/alarme/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Alarme',
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
      this.totalRows = this.items.length
   }
}
</script>

<style>
</style>