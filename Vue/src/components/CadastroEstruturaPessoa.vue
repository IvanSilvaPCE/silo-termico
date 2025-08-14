<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Estruturas de pessoas cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-estrutura" variant="outline-warning" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-x-circle></b-icon-x-circle> Inativar </b-button>
                        <b-button variant="outline-success" @click="formNovaConexao" :disabled="!temAlgumSelecionado" id="cadastrar-conexao"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Conexão </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-estrutura" title="Inativar Estrutura?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_estrutura_pessoa }}) {{ itemSelecionado.nm_estrutura_pessoa }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_estrutura_pessoa" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(pessoa)="row">
                     <span>{{ row.item.pessoa.natureza == 'J' ? row.item.pessoa.nm_fantasia : row.item.pessoa.nm_pessoa }}</span>
                  </template>
                  <template #cell(conexao)="row">
                     <b-button variant="outline-primary" size="sm" title="Ver Conexão" @click="row.toggleDetails()" :disabled="!row.item.conexao"><b-icon-eye-fill></b-icon-eye-fill></b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <div v-if="row.item.conexao">
                           <b-row class="mt-2">
                              <b-col sm="12" md="6" lg="4">
                                 <h5>IP</h5>
                                 <p>{{ row.item.conexao?.ip }}</p>
                              </b-col>
                              <b-col sm="12" md="6" lg="4">
                                 <h5>Porta</h5>
                                 <p>{{ row.item.conexao?.porta }}</p>
                              </b-col>
                              <b-col sm="12" md="6" lg="4">
                                 <h5>Usuário</h5>
                                 <p>{{ row.item.conexao?.usuario }}</p>
                              </b-col>
                              <b-col sm="12" md="6" lg="4">
                                 <h5>Senha</h5>
                                 <p>{{ row.item.conexao?.senha }}</p>
                              </b-col>
                              <b-col sm="12" md="6" lg="4">
                                 <h5>Protocolo</h5>
                                 <p>{{ row.item.conexao?.protocolo }}</p>
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
      <b-modal id="cadastro-estrutura" ref="modal" :title="tituloModal" @ok="salvarEstruturaPessoa" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Nome da Estrutura">
               <b-form-input v-model="objNovaEstrutura.nm_estrutura_pessoa" :state="validate('nm_estrutura_pessoa')"></b-form-input>
               <b-form-invalid-feedback id="nm_estrutura_pessoa">{{ erros['nm_estrutura_pessoa'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Latitude">
               <b-form-input type="number" v-model="objNovaEstrutura.latitude" :state="validate('latitude')"></b-form-input>
               <b-form-invalid-feedback id="latitude">{{ erros['latitude'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Longitude">
               <b-form-input type="number" v-model="objNovaEstrutura.longitude" :state="validate('longitude')"></b-form-input>
               <b-form-invalid-feedback id="longitude">{{ erros['longitude'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Pessoa (Física/Jurídica)">
               <b-overlay :show="overlayPessoas" rounded="sm">
                  <v-select v-model="objNovaEstrutura.id_pessoa" :options="optionsPessoas" :state="validate('id_pessoa')" :reduce="(pessoa) => pessoa.value" :class="{ 'border-danger': validate('id_pessoa') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_pessoa'] | parseErros }}</small>
               </b-overlay>
            </b-form-group>
            <b-tooltip target="tooltip-estrutura">Preencha este campo caso essa estrutura pertença a outra</b-tooltip>
            <b-form-group>
               <label class="d-flex align-items-center" for="id_pessoa_pai">
                  Estrutura Pai
                  <b-icon icon="question-circle" font-scale="1.5" class="ml-2" id="tooltip-estrutura"></b-icon>
               </label>
               <b-overlay :show="isBusy" rounded="sm">
                  <v-select id="id_pessoa_pai" v-model="objNovaEstrutura.id_estrutura_pessoa_pai" :options="optionsEstruturasPessoas" :state="validate('id_estrutura_pessoa_pai')" :reduce="(e) => e.value" :class="{ 'border-danger': validate('id_estrutura_pessoa_pai') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_estrutura_pessoa_pai'] | parseErros }}</small>
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
      <modal-cadastro-conexao ref="modalConexao" :objNovaConexao="objNovaConexao" :tituloModal="tituloModalConexao"></modal-cadastro-conexao>
   </div>
</template>

<script>
import client from '@/api'
import { estruturaPessoaService } from '../services'
import ModalCadastroConexao from '@/components/ModalCadastroConexao.vue'

export default {
   name: 'CadastroEstruturaPessoa',
   components: {
      ModalCadastroConexao
   },
   data() {
      return {
         tituloModalConexao: null,
         objNovaConexao: {},
         overlayPessoas: false,
         pessoa: [],
         isExcluindo: false,
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovaEstrutura: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            // { key: 'id_estrutura_pessoa', label: 'ID', tdClass: 'text-center', class: 'text-center' },
            { key: 'nm_estrutura_pessoa', label: 'Nome' },
            { key: 'local_estrutura.latitude', label: 'Latitude' },
            { key: 'local_estrutura.longitude', label: 'Longitude' },
            { key: 'pessoa', label: 'Pessoa' },
            { key: 'estrutura_pai.nm_estrutura_pessoa', label: 'Estrutura Pai' },
            { key: 'conexao', label: 'Conexão' }
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
            const keys = Object.keys(i).filter((k) => !['id_estrutura_pessoa', 'id_pessoa', 'id_conexao'].includes(k))
            const verificaFiltro = (value) => String(value).toLowerCase().includes(this.filter)
            if (i.pessoa) {
               const campoPessoa = i.pessoa.natureza == 'J' ? i.pessoa.nm_fantasia : i.pessoa.nm_pessoa
               if (verificaFiltro(campoPessoa)) return true
            }
            if (i.local_estrutura && (verificaFiltro(i.local_estrutura.latitude) || verificaFiltro(i.local_estrutura.longitude))) {
               return true
            }
            if (i.estrutura_pai && verificaFiltro(i.estrutura_pai.nm_estrutura_pessoa)) {
               return true
            }
            return keys.some((k) => verificaFiltro(i[k]))
         })
      },
      optionsPessoas() {
         if (!this.pessoa.length) {
            return
         }
         return this.pessoa.map((pessoa) => ({
            value: pessoa.id_pessoa,
            label: pessoa.natureza == 'J' ? pessoa.nm_fantasia + ' | ' + pessoa.cnpj : pessoa.nm_pessoa + ' | ' + pessoa.cpf
         }))
      },
      optionsEstruturasPessoas() {
         if (!this.items.length) {
            return
         }
         return this.items.map((items) => ({
            value: items.id_estrutura_pessoa,
            label: items.nm_estrutura_pessoa + ' | ' + (items.pessoa.natureza == 'J' ? items.pessoa.nm_fantasia : items.pessoa.nm_pessoa)
         }))
      }
   },

   methods: {
      formNovaConexao() {
         this.objNovaConexao = {
            id_estrutura_pessoa: this.itemSelecionado.id_estrutura_pessoa
         }
         ;(this.tituloModalConexao = 'Cadastrar Conexão'), this.$bvModal.show('cadastro-conexao')
      },
      formNovo() {
         this.erros = []
         this.objNovaEstrutura = {}
         this.tituloModal = 'Cadastrar Estrutura'
         this.$bvModal.show('cadastro-estrutura')
      },
      async salvarEstruturaPessoa(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await estruturaPessoaService.salvarEstruturaPessoa(this.objNovaEstrutura)
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
               this.$bvModal.hide('cadastro-estrutura')
            })
         }
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/estrutura_pessoa').catch((err) => {
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
      async buscarPessoas() {
         this.overlayPessoas = true
         const dados = await client.get('/pessoa').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar pessoas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayPessoas = false
         this.pessoa = dados.data
      },
      editar() {
         const latitude = this.itemSelecionado.local_estrutura.latitude
         const longitude = this.itemSelecionado.local_estrutura.longitude
         this.objNovaEstrutura = { ...this.itemSelecionado, latitude, longitude }
         this.erros = []
         this.tituloModal = 'Editar Estrutura'
         this.$bvModal.show('cadastro-estrutura')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione uma estrutura na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_estrutura_pessoa
         const result = await client.delete(`/estrutura_pessoa/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Estrutura',
               msg: 'Inativada com sucesso',
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
         this.objNovaEstrutura = {}
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
      this.buscar()
      this.buscarPessoas()
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