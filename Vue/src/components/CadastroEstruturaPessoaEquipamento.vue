<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Estruturas equipamentos cadastrados</h2>
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_estrutura_pessoa" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(estrutura_equipamentos)="row">
                     <b-button :disabled="!row.item.estrutura_equipamentos.length" variant="outline-primary" size="sm" title="Ver Estruturas" @click="row.toggleDetails()">
                        <b-icon-eye-fill class="mr-2"></b-icon-eye-fill><span>{{ row.item.estrutura_equipamentos.length }}</span>
                     </b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col md="12">
                              <b-table :fields="fieldsDetalhe" :items="row.item.estrutura_equipamentos">
                                 <template #cell(dt_fabricacao)="row">
                                    {{ formatarData(row.item.dt_fabricacao) }}
                                 </template>
                              </b-table>
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
      <b-modal id="cadastro" ref="modal" :title="tituloModal" @ok="salvarEstruturaPessoaEquipamento" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Estrutura">
               <b-overlay :show="overlayEstruturas" rounded="sm">
                  <v-select v-model="objNovaEstrutura.id_estrutura_pessoa" :options="optionsEstruturas" :state="validate('id_estrutura_pessoa')" :reduce="(estrutura) => estrutura.value" :class="{ 'border-danger': validate('id_estrutura_pessoa') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_estrutura_pessoa'] | parseErros }}</small>
               </b-overlay>
            </b-form-group>
            <b-form-group label="Equipamentos">
               <b-overlay :show="overlayEquipamentos" rounded="sm">
                  <v-select multiple v-model="objNovaEstrutura.id_equipamento" :options="optionsEquipamentos" :state="validate('id_equipamento')" :reduce="(equipamento) => equipamento.value" :class="{ 'border-danger': validate('id_equipamento') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_equipamento'] | parseErros }}</small>
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
import { estruturaPessoaEquipamentoService } from '../services'

export default {
   name: 'CadastroEstruturaPessoaEquipamento',
   data() {
      return {
         overlayEstruturas: false,
         overlayEquipamentos: false,
         estrutura: [],
         equipamento: [],
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
         fields: [
            { key: 'nm_estrutura_pessoa', label: 'Estrutura' },
            { key: 'estrutura_equipamentos', label: 'Equipamentos' }
         ],
         fieldsDetalhe: [
            { key: 'nco', label: 'NCO' },
            { key: 'nr_serie_equipamento', label: 'Nr. Série' },
            { key: 'ds_equipamento', label: 'Descrição' },
            { key: 'dt_fabricacao', label: 'Fabricação' },
            { key: 'categoria.ds_categoria_equipamento', label: 'Categoria' }
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
      optionsEstruturas() {
         if (!this.estrutura.length) {
            return
         }
         return this.estrutura.map((estrutura) => ({
            value: estrutura.id_estrutura_pessoa,
            label: estrutura.nm_estrutura_pessoa
         }))
      },
      optionsEquipamentos() {
         if (!this.equipamento.length) {
            return
         }
         return this.equipamento.map((equipamento) => ({
            value: equipamento.id_equipamento,
            label: equipamento.ds_equipamento + ' | ' + (equipamento?.cliente?.nm_fantasia != null ? equipamento?.cliente?.nm_fantasia : equipamento?.cliente?.nm_pessoa)
         }))
      }
   },

   methods: {
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD').format('DD/MM/YYYY')
      },
      formNovo() {
         this.erros = []
         this.objNovaEstrutura = {}
         this.tituloModal = 'Cadastrar Estrutura Equipamento'
         this.$bvModal.show('cadastro')
      },
      async salvarEstruturaPessoaEquipamento(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await estruturaPessoaEquipamentoService.salvarEstruturaPessoaEquipamento(this.objNovaEstrutura)
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
         const dados = await client.get('/estrutura_pessoa/buscarestrutura').catch((err) => {
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
      async buscarEstruturas() {
         this.overlayEstruturas = true
         const dados = await client.get('/estrutura_pessoa').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar perfis. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEstruturas = false
         this.estrutura = dados.data
      },
      async buscarEquipamentos() {
         this.overlayEquipamentos = true
         const dados = await client.get('/equipamento/buscarequipamento').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar transações operações. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEquipamentos = false
         this.equipamento = dados.data
      },
      editar() {
         const id_equipamento = this.itemSelecionado.estrutura_equipamentos.map((equipamentos) => equipamentos.id_equipamento)
         this.objNovaEstrutura = { ...this.itemSelecionado, id_equipamento }
         this.erros = []
         this.tituloModal = 'Editar Estrutura Equipamento'
         this.$bvModal.show('cadastro')
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
      this.buscarEstruturas()
      this.buscarEquipamentos()
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