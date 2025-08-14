<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Equipamentos cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo" v-if="verificarPerfilOperacao(['CADEQUIPA']) || verificarPerfilOperacao(['ADMINPORTA'])"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-equipamento" variant="outline-warning" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-x-circle></b-icon-x-circle> Inativar </b-button>
                        <b-button variant="outline-success" @click="formNovaConexao" :disabled="!temAlgumSelecionado" id="cadastrar-conexao"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Conexão </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-equipamento" title="Inativar Equipamento?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_equipamento }}) {{ itemSelecionado.ds_equipamento }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_equipamento" hover selectable>
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
                           <b-col sm="12" md="6" lg="4">
                              <h5>Chave</h5>
                              <p>{{ row.item.chave }}</p>
                           </b-col>
                           <b-col sm="12" md="6" lg="4">
                              <h5>Data de Garantia</h5>
                              <p>{{ formatarData(row.item.dt_garantia_pce) }}</p>
                           </b-col>
                           <b-col sm="12" md="6" lg="4">
                              <h5>Tipo</h5>
                              <p>{{ formatarTpEquipamento(row.item.tp_equipamento) }}</p>
                           </b-col>
                           <b-col sm="12" md="6" lg="4">
                              <h5>Equipamento Master</h5>
                              <p>{{ row.item.master?.ds_equipamento }}</p>
                           </b-col>
                           <b-col sm="12" md="6" lg="4">
                              <h5>Produto</h5>
                              <p>{{ row.item.produto?.nm_produto }}</p>
                           </b-col>
                           <b-col sm="12" md="6" lg="4">
                              <h5>Cliente</h5>
                              <p>{{ row.item.pessoa?.natureza == 'J' ? row.item.pessoa?.nm_fantasia : row.item.pessoa?.nm_pessoa }}</p>
                           </b-col>
                           <b-col sm="12" md="6" lg="4">
                              <h5>Responsável</h5>
                              <p>{{ row.item.usuario?.nm_usuario }}</p>
                           </b-col>
                           <b-col sm="12" md="6" lg="4">
                              <h5>Equipamento de Terceiro</h5>
                              <p>{{ formatarFlTerceiro(row.item.fl_terceiro) }}</p>
                           </b-col>
                        </b-row>
                        <div v-if="row.item.conexao">
                           <hr />
                           <b-row>
                              <b-col sm="12" md="6" lg="4">
                                 <h5>Conexão</h5>
                              </b-col>
                           </b-row>
                           <hr />
                           <b-row class="mt-2">
                              <b-col sm="12" md="6" lg="4">
                                 <h5>Nome</h5>
                                 <p>{{ row.item.conexao?.nm_conexao }}</p>
                              </b-col>
                              <b-col sm="12" md="6" lg="4">
                                 <h5>My Identifier</h5>
                                 <p>{{ row.item.conexao?.identificador }}</p>
                              </b-col>
                              <b-col sm="12" md="6" lg="4">
                                 <h5>Peer Identifier</h5>
                                 <p>{{ row.item.conexao?.par_identificador }}</p>
                              </b-col>
                              <b-col sm="12" md="6" lg="4">
                                 <h5>Pre-shared Key</h5>
                                 <p>{{ row.item.conexao?.chave_compartilhada }}</p>
                              </b-col>
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
      <modal-cadastro-equipamento ref="modal" :objNovoEquipamento="objNovoEquipamento" :erros="erros" :tituloModal="tituloModal" @buscar="buscar"></modal-cadastro-equipamento>
      <modal-cadastro-conexao ref="modalConexao" :objNovaConexao="objNovaConexao" :tituloModal="tituloModalConexao"></modal-cadastro-conexao>
   </div>
</template>

<script>
import client from '@/api'
import ModalCadastroEquipamento from './ModalCadastroEquipamento.vue'
import ModalCadastroConexao from '@/components/ModalCadastroConexao.vue'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'CadastroEquipamento',
   components: {
      ModalCadastroEquipamento,
      ModalCadastroConexao
   },
   data() {
      return {
         tituloModalConexao: null,
         objNovaConexao: {},
         isExcluindo: false,
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoEquipamento: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            { key: 'nco', label: 'NCO' },
            { key: 'nr_serie_equipamento', label: 'Nr. Série' },
            { key: 'ds_equipamento', label: 'Descrição' },
            { key: 'dt_fabricacao', label: 'Fabricação', formatter: 'formatarData' },
            { key: 'st_operacao', label: 'Status', formatter: 'formatarStatus' },
            { key: 'categoria.ds_categoria_equipamento', label: 'Categoria' },
            { key: 'fabricante.nm_fantasia', label: 'Fabricante' },
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
         return this.items.filter((item) => {
            const keys = Object.keys(item).filter((key) => key !== 'id_equipamento')
            if (this.formatarStatus(item.st_operacao).toLowerCase().includes(filterLower)) {
               return true
            }
            if (this.formatarData(item.dt_fabricacao).toLowerCase().includes(filterLower)) {
               return true
            }
            if (item.categoria && String(item.categoria.ds_categoria_equipamento).toLowerCase().includes(filterLower)) {
               return true
            }
            if (item.fabricante && String(item.fabricante.nm_fantasia).toLowerCase().includes(filterLower)) {
               return true
            }
            if (item.conexao && String(item.conexao.identificador).toLowerCase().includes(filterLower)) {
               return true
            }
            if (item.conexao && String(item.conexao.par_identificador).toLowerCase().includes(filterLower)) {
               return true
            }
            if (item.conexao && String(item.conexao.chave_compartilhada).toLowerCase().includes(filterLower)) {
               return true
            }
            if (item.pessoa && String(item.pessoa.nm_fantasia).toLowerCase().includes(filterLower)) {
               return true
            }
            if (item.pessoa && String(item.pessoa.nm_pessoa).toLowerCase().includes(filterLower)) {
               return true
            }
            return keys.some((key) => String(item[key]).toLowerCase().includes(filterLower))
         })
      }
   },

   methods: {
      formNovaConexao() {
         this.objNovaConexao = {
            id_equipamento: this.itemSelecionado.id_equipamento
         }
         ;(this.tituloModalConexao = 'Cadastrar Conexão'), this.$bvModal.show('cadastro-conexao')
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD').format('DD/MM/YYYY')
      },
      formatarStatus(value) {
         if (value === 'OF') return 'Offline'
         if (value === 'EF') return 'Alerta'
         if (value === 'EC') return 'Em configuração'
         if (value === 'EM') return 'Em manutenção'
         if (value === 'CM') return 'Com mensagem'
         if (value === 'ON') return 'Online'
         return value
      },
      formatarTpEquipamento(value) {
         if (value === 'MA') return 'Master'
         if (value === 'SL') return 'Slave'
         if (value === 'MS') return 'Master/Slave'
         return value
      },
      formatarFlTerceiro(value) {
         return value === 'S' ? 'Sim' : value === 'N' ? 'Não' : value
      },
      formNovo() {
         this.$refs.modal.erros = []
         this.objNovoEquipamento = {}
         if (!this.objNovoEquipamento.st_operacao) {
            this.objNovoEquipamento.st_operacao = 'EC'
         }
         this.objNovoEquipamento.fl_terceiro = 'N'
         this.tituloModal = 'Cadastrar Equipamento'
         this.$bvModal.show('cadastro-equipamento')
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/equipamento').catch((err) => {
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
         if (!this.itemSelecionado.st_operacao) {
            this.itemSelecionado.st_operacao = 'EC'
         }
         this.objNovoEquipamento = { ...this.itemSelecionado }
         this.$refs.modal.erros = []
         this.tituloModal = 'Editar Equipamento'
         this.$bvModal.show('cadastro-equipamento')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione um equipamento na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_equipamento
         const result = await client.delete(`/equipamento/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Equipamento',
               msg: 'Inativado com sucesso',
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
      verificarPerfilOperacao
   },

   mounted() {
      this.buscar()
      this.totalRows = this.items.length
   }
}
</script>

<style>
</style>