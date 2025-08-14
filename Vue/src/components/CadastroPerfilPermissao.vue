<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Perfis Permissões cadastradas</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_perfil" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(perfis_permissoes)="row">
                     <b-button :disabled="!row.item.perfis_permissoes.length" variant="outline-primary" size="sm" title="Ver Permissões" @click="row.toggleDetails()"
                        ><b-icon-eye-fill class="mr-2"></b-icon-eye-fill><span>{{ row.item.perfis_permissoes.length }}</span></b-button
                     >
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col md="12">
                              <b-table :fields="fieldsDetalhe" :items="row.item.perfis_permissoes"></b-table>
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
      <b-modal id="cadastro" ref="modal" :title="tituloModal" @ok="salvarPerfilPermissao" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Perfil">
               <b-overlay :show="overlayPerfis" rounded="sm">
                  <v-select v-model="objNovoPerfilPermissao.id_perfil" :options="optionsPerfis" :state="validate('id_perfil')" :reduce="(perfil) => perfil.value" :class="{ 'border-danger': validate('id_perfil') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_perfil'] | parseErros }}</small>
               </b-overlay>
            </b-form-group>
            <b-form-group label="Transações Operações">
               <b-overlay :show="overlayTransacoesOperacoes" rounded="sm">
                  <v-select multiple v-model="objNovoPerfilPermissao.id_transacao_operacao" :options="optionsTransacoesOperacoes" :state="validate('id_transacao_operacao')" :reduce="(transacao) => transacao.value" :class="{ 'border-danger': validate('id_transacao_operacao') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_transacao_operacao'] | parseErros }}</small>
               </b-overlay>
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
import { perfilPermissaoService } from '../services'

export default {
   name: 'CadastroPerfilPermissao',
   data() {
      return {
         overlayTransacoesOperacoes: false,
         overlayPerfis: false,
         transacaoOperacao: [],
         perfil: [],
         isExcluindo: false,
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoPerfilPermissao: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            { key: 'nm_perfil', label: 'Perfil' },
            { key: 'perfis_permissoes', label: 'Permissões' }
         ],
         fieldsDetalhe: [
            { key: 'nm_transacao_operacao', label: 'Permissão' },
            { key: 'transacao.nm_transacao', label: 'Transação' },
            { key: 'cd_transacao_operacao', label: 'Cód. Permissão' }
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
            return keys.find((k) => String(i[k]).toLowerCase().includes(this.filter))
         })
      },
      optionsPerfis() {
         if (!this.perfil.length) {
            return
         }
         return this.perfil.map((perfil) => ({
            value: perfil.id_perfil,
            label: perfil.nm_perfil
         }))
      },
      optionsTransacoesOperacoes() {
         if (!this.transacaoOperacao.length) {
            return
         }
         return this.transacaoOperacao.map((transacaoOperacao) => ({
            value: transacaoOperacao.id_transacao_operacao,
            label: transacaoOperacao.nm_transacao_operacao + ' | ' + transacaoOperacao.transacao.nm_transacao
         }))
      }
   },

   methods: {
      formNovo() {
         this.erros = []
         this.objNovoPerfilPermissao = {}
         this.tituloModal = 'Cadastrar Perfil Permissão'
         this.$bvModal.show('cadastro')
      },
      async salvarPerfilPermissao(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await perfilPermissaoService.salvarPerfilPermissao(this.objNovoPerfilPermissao)
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
         const dados = await client.get('/perfil').catch((err) => {
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
      async buscarPerfis() {
         this.overlayPerfis = true
         const dados = await client.get('/perfil').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar perfis. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayPerfis = false
         this.perfil = dados.data
      },
      async buscarTransacoesOperacoes() {
         this.overlayTransacoesOperacoes = true
         const dados = await client.get('/transacao_operacao').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar transações operações. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayTransacoesOperacoes = false
         this.transacaoOperacao = dados.data
      },
      editar() {
         const id_transacao_operacao = this.itemSelecionado.perfis_permissoes.map((permissoes) => permissoes.id_transacao_operacao)
         this.objNovoPerfilPermissao = { ...this.itemSelecionado, id_transacao_operacao }
         this.erros = []
         this.tituloModal = 'Editar PerfilPermissão'
         this.$bvModal.show('cadastro')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione um perfil na lista',
               variant: 'warning'
            })
         }
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
         this.objNovoPerfilPermissao = {}
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
      this.buscar(), this.buscarPerfis(), this.buscarTransacoesOperacoes(), (this.totalRows = this.items.length)
   }
}
</script>

<style scoped>
.border-danger {
   border: 1.5px solid red;
   border-radius: 4px;
}
</style>