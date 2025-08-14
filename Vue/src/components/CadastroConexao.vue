<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Conexões cadastradas</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-conexao" variant="outline-danger" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-trash></b-icon-trash>Excluir </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-conexao" title="Excluir Conexão?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_conexao }}) {{ itemSelecionado.ip }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_conexao" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template v-slot:cell(chave_compartilhada)="row">
                     <span v-if="mostrarSenhaItem(row.item)" class="mr-1">{{ row.item.chave_compartilhada }}</span>
                     <span v-else class="mr-1">******</span>
                     <b-button @click="toggleMostrarSenha(row.item)" variant="light" size="sm">
                        <b-icon-lock v-if="!mostrarSenhaItem(row.item)"></b-icon-lock>
                        <b-icon-unlock v-else></b-icon-unlock>
                     </b-button>
                  </template>
                  <template #cell(detalhes)="row">
                     <b-button variant="outline-primary" size="sm" title="Ver Detalhes" @click="row.toggleDetails()"><b-icon-eye-fill></b-icon-eye-fill></b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col sm="6" md="6" lg="3">
                              <h5>Porta</h5>
                              <p>{{ row.item.porta }}</p>
                           </b-col>
                           <b-col sm="6" md="6" lg="3">
                              <h5>Usuario</h5>
                              <p>{{ row.item.usuario }}</p>
                           </b-col>
                           <b-col sm="6" md="6" lg="3">
                              <h5>Senha</h5>
                              <p>{{ row.item.senha }}</p>
                           </b-col>
                           <b-col sm="6" md="6" lg="3">
                              <h5>Protocolo</h5>
                              <p>{{ row.item.protocolo }}</p>
                           </b-col>
                        </b-row>
                        <hr />
                        <div v-if="row.item.equipamento">
                           <b-row>
                              <b-col sm="6" md="6" lg="3">
                                 <h5>Equipamento</h5>
                              </b-col>
                           </b-row>
                           <hr />
                           <b-row class="mt-2">
                              <b-col sm="6" md="6" lg="3">
                                 <h5>NCO</h5>
                                 <p>{{ row.item.equipamento?.nco }}</p>
                              </b-col>
                              <b-col sm="6" md="6" lg="4">
                                 <h5>Nr. Série</h5>
                                 <p>{{ row.item.equipamento?.nr_serie_equipamento }}</p>
                              </b-col>
                              <b-col sm="6" md="6" lg="4">
                                 <h5>Descrição</h5>
                                 <p>{{ row.item.equipamento?.ds_equipamento }}</p>
                              </b-col>
                           </b-row>
                        </div>
                        <div v-if="row.item.estrutura_pessoa">
                           <b-row>
                              <b-col sm="6" md="6" lg="3">
                                 <h5>Estrutura</h5>
                              </b-col>
                           </b-row>
                           <hr />
                           <b-row class="mt-2">
                              <b-col sm="6" md="6" lg="3">
                                 <h5>Descrição</h5>
                                 <p>{{ row.item.estrutura_pessoa?.nm_estrutura_pessoa }}</p>
                              </b-col>
                              <b-col sm="6" md="6" lg="3">
                                 <h5>Pessoa</h5>
                                 <p>{{ row.item.estrutura_pessoa?.pessoa.natureza == 'J' ? row.item.estrutura_pessoa?.pessoa.nm_fantasia : row.item.estrutura_pessoa?.pessoa.nm_pessoa }}</p>
                              </b-col>
                              <b-col sm="6" md="6" lg="3">
                                 <h5>Tipo Pessoa</h5>
                                 <p>{{ formatarTpPessoa(row.item.estrutura_pessoa?.pessoa.tp_pessoa) }}</p>
                              </b-col>
                           </b-row>
                        </div>
                     </b-card>
                  </template>
               </b-table>
               <p class="text-center" v-if="!this.items.length && !isBusy">Nenhum resultado para listar</p>
               <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="right" class="my-0"></b-pagination>
            </div>
         </div>
      </div>
      <modal-cadastro-conexao ref="modal" :objNovaConexao="objNovaConexao" :erros="erros" :tituloModal="tituloModal" @buscar="buscar"></modal-cadastro-conexao>
   </div>
</template>

<script>
import client from '@/api'
import ModalCadastroConexao from './ModalCadastroConexao.vue'

export default {
   name: 'CadastroConexao',
   components: {
      ModalCadastroConexao
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
         objNovaConexao: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            { key: 'nm_conexao', label: 'Nome' },
            { key: 'identificador', label: 'My Identifier' },
            { key: 'par_identificador', label: 'Peer Identifier' },
            { key: 'chave_compartilhada', label: 'Pre-Shared Key' },
            { key: 'ip', label: 'IP' },
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
         const filterLower = this.filter.toLowerCase()
         return this.items.filter((i) => {
            const keys = Object.keys(i)
            keys.splice(keys.indexOf('id_conexao'), 1)
            return keys.find((k) => String(i[k]).toLowerCase().includes(filterLower))
         })
      }
   },

   methods: {
      formatarTpPessoa(value) {
         if (value === 'FA') return 'Fabricante'
         if (value === 'PR') return 'Produtor'
         if (value === 'MA') return 'Matriz'
         if (value === 'UN') return 'Unidade'
         return value
      },
      toggleMostrarSenha(item) {
         if (this.mostrarSenhaItem(item)) {
            this.$set(item, 'mostrarSenha', false)
         } else {
            this.$set(item, 'mostrarSenha', true)
         }
      },
      mostrarSenhaItem(item) {
         return item.mostrarSenha || false
      },
      formNovo() {
         this.$refs.modal.erros = []
         this.objNovaConexao = {}
         this.tituloModal = 'Cadastrar Conexão'
         this.$bvModal.show('cadastro-conexao')
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/conexao').catch((err) => {
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
         const id_equipamento = this.itemSelecionado.equipamento?.id_equipamento
         const id_estrutura_pessoa = this.itemSelecionado.estrutura_pessoa?.id_estrutura_pessoa
         this.objNovaConexao = { ...this.itemSelecionado, id_equipamento, id_estrutura_pessoa }
         this.$refs.modal.erros = []
         this.tituloModal = 'Editar Conexão'
         this.$bvModal.show('cadastro-conexao')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione uma conexão na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_conexao
         const result = await client.delete(`/conexao/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Conexão',
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