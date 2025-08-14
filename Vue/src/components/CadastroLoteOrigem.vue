<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Lotes de origem cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-lote" variant="outline-danger" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-trash></b-icon-trash>Excluir </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-lote" title="Excluir Lote de Origem?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_lote_origem }}) {{ itemSelecionado.descricao }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_familia" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
               </b-table>
               <p class="text-center" v-if="!this.items.length && !isBusy">Nenhum resultado para listar</p>
               <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="right" class="my-0"></b-pagination>
            </div>
         </div>
      </div>
      <b-modal id="cadastro" ref="modal" :title="tituloModal" @ok="salvarLote" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Código">
               <b-form-input v-model="objNovoLote.codigo" :state="validate('codigo')"></b-form-input>
               <b-form-invalid-feedback id="codigo">{{ erros['codigo'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Descrição">
               <b-form-input v-model="objNovoLote.descricao" :state="validate('descricao')"></b-form-input>
               <b-form-invalid-feedback id="descricao">{{ erros['descricao'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
         </form>
         <template #modal-footer="{ cancel, ok }">
            <b-button size="lg" variant="secondary" @click="cancel()"> Cancelar </b-button>
            <b-button :disabled="isSalvando" size="lg" variant="primary" @click="ok()">
               <span v-if="!isSalvando">Salvar</span>
               <div v-else>
                  <b-spinner small></b-spinner>
                  <span class="ml-1">Salvando...</span>
               </div>
            </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import client from '@/api'
import { loteOrigemService } from '../services'

export default {
   name: 'CadastroLoteOrigem',
   data() {
      return {
         idSecador: localStorage.getItem('sec'),
         isExcluindo: false,
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoLote: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            { key: 'codigo', label: 'Código', tdClass: 'text-center', class: 'text-center' },
            { key: 'descricao', label: 'Descrição' }
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
         const filterLower = this.filter.toLowerCase()
         return this.items.filter((item) => {
            const keys = Object.keys(item).filter((key) => key !== 'id_lote_origem')
            if (String(item.codigo).toLowerCase().includes(filterLower)) {
               return true
            }
            if (String(item.descricao).toLowerCase().includes(filterLower)) {
               return true
            }
            return keys.some((key) => String(item[key]).toLowerCase().includes(filterLower))
         })
      }
   },

   methods: {
      formNovo() {
         this.erros = []
         this.objNovoLote = {}
         this.tituloModal = 'Cadastrar Lote de Origem'
         this.$bvModal.show('cadastro')
      },
      async salvarLote(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await loteOrigemService.salvarLote(this.objNovoLote)
         switch (status) {
            case 200:
               msg = 'Registro editado com sucesso!'
               break
            case 201:
               msg = 'Registro criado com sucesso!'
               break
            case 422:
               msg = 'Por favor corrija os erros apresentados'
               this.erros = data
               break
            default:
               msg = 'Erro desconhecido'
         }
         this.isSalvando = false
         const deuErro = ![201].includes(status) && ![200].includes(status)

         this.erros = deuErro ? data : []

         this.$bvToast.toast(msg, {
            title: 'Resultado da ação',
            variant: deuErro ? 'danger' : 'success',
            autoHideDelay: 5000,
            solid: true,
            toaster: 'b-toaster-bottom-right'
         })

         if (!deuErro) {
            this.buscar()
            this.$nextTick(() => {
               this.$bvModal.hide('cadastro')
            })
         }
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get(`/lote_origem/buscarlote?equipamento=${this.idSecador}`).catch((err) => {
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
         this.objNovoLote = { ...this.itemSelecionado }
         this.erros = []
         this.tituloModal = 'Editar Lote de Origem'
         this.$bvModal.show('cadastro')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione um lote de origem',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_lote_origem
         const result = await client.delete(`/lote_origem/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Lote de Origem',
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
      },
      resetModal() {
         this.objNovoLote = {}
         this.erros = []
      },
      validate(prop) {
         const keys = Object.keys(this.erros)
         if (keys.includes(prop)) {
            return false
         }
      }
   },

   filters: {
      parseErros(v) {
         if (!v) return
         return v.join(', ')
      }
   },

   mounted() {
      this.buscar(), (this.totalRows = this.items.length)
   }
}
</script>

<style>
</style>