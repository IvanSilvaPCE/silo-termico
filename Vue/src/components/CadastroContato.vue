<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Contatos cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-contato" variant="outline-warning" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-x-circle></b-icon-x-circle> Inativar </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-contato" title="Inativar Contato?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_contato }}) {{ itemSelecionado.nm_contato }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_contato" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(telefone)="row">
                     {{ row.item.telefone | VMask('(##) ####-####') }}
                  </template>
                  <template #cell(celular)="row">
                     {{ row.item.celular | VMask('(##) #####-####') }}
                  </template>
                  <template #cell(pessoa)="row">
                     {{ exibirPessoa(row.item) }}
                  </template>
               </b-table>
               <p class="text-center" v-if="!this.items.length && !isBusy">Nenhum resultado para listar</p>
               <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="right" class="my-0"></b-pagination>
            </div>
         </div>
      </div>
      <modal-cadastro-contato ref="modal" :objNovoContato="objNovoContato" :erros="erros" :tituloModal="tituloModal" @buscar="buscar"></modal-cadastro-contato>
   </div>
</template>

<script>
import client from '@/api'
import ModalCadastroContato from './ModalCadastroContato.vue'

export default {
   name: 'CadastroContato',
   components: {
      ModalCadastroContato
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
         objNovoContato: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            // { key: 'id_contato', label: 'ID', tdClass: 'text-center', class: 'text-center' },
            { key: 'nm_contato', label: 'Nome' },
            { key: 'vinculo', label: 'Vínculo' },
            { key: 'telefone', label: 'Telefone' },
            { key: 'ramal', label: 'Ramal' },
            { key: 'celular', label: 'Celular' },
            { key: 'email', label: 'Email' },
            { key: 'tp_contato', label: 'Tipo', formatter: 'formatarTpContato' },
            { key: 'pessoa', label: 'Pessoa' }
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
            keys.splice(keys.indexOf('id_contato'), 1)
            keys.splice(keys.indexOf('pessoa'), 1)
            if (i.pessoa) {
               const campoPessoa = i.pessoa.natureza == 'J' ? i.pessoa.nm_fantasia : i.pessoa.nm_pessoa
               if (String(campoPessoa).toLowerCase().includes(this.filter)) {
                  return true
               }
            }
            const tipoFormatado = this.formatarTpContato(i.tp_contato)
            if (tipoFormatado.toLowerCase().includes(this.filter)) {
               return true
            }
            return keys.find((k) => String(i[k]).toLowerCase().includes(this.filter))
         })
      }
   },

   methods: {
      formatarTpContato(value) {
         return value === 'P' ? 'Principal' : value === 'S' ? 'Secundário' : value
      },
      exibirPessoa(item) {
         return item.pessoa.natureza == 'J' ? item.pessoa.nm_fantasia : item.pessoa.nm_pessoa
      },
      formNovo() {
         this.$refs.modal.erros = []
         this.objNovoContato = {}
         this.tituloModal = 'Cadastrar Contato'
         this.$bvModal.show('cadastro-contato')
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/contato').catch((err) => {
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
         this.objNovoContato = { ...this.itemSelecionado }
         this.$refs.modal.erros = []
         this.tituloModal = 'Editar Contato'
         this.$bvModal.show('cadastro-contato')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione um contato na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_contato
         const result = await client.delete(`/contato/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Contato',
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