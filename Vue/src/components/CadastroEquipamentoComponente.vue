<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Equipamentos componentes cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col md="4" class="mb-4">
                     <b-overlay :show="overlayEquipamentos" rounded="sm">
                        <v-select v-model="id_equipamento" :options="optionsEquipamentos" :reduce="(equipamento) => equipamento.value">
                           <template #no-options="">Nenhuma correspondência</template>
                        </v-select>
                     </b-overlay>
                  </b-col>
                  <b-col class="" md="2">
                     <b-button-group class="float-center">
                        <!-- <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button> -->
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                     </b-button-group>
                  </b-col>
                  <b-col class="" md="6">
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_equipamento_componente" hover selectable>
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
      <b-modal id="cadastro" ref="modal" :title="tituloModal" @ok="salvarEquipamentoComponente" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Número de Série">
               <b-form-input v-model="objNovoEquipamentoComponente.nr_serie_componente" :state="validate('nr_serie_componente')"></b-form-input>
               <b-form-invalid-feedback id="nr_serie_componente">{{ erros['nr_serie_componente'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Descrição">
               <b-form-input v-model="objNovoEquipamentoComponente.ds_equipamento_componente" :state="validate('ds_equipamento_componente')"></b-form-input>
               <b-form-invalid-feedback id="ds_equipamento_componente">{{ erros['ds_equipamento_componente'] | parseErros }}</b-form-invalid-feedback>
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
import { equipamentoComponenteService } from '../services'

export default {
   name: 'CadastroEquipamentoComponente',
   data() {
      return {
         id_equipamento: 'null',
         overlayEquipamentos: false,
         equipamento: [],
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoEquipamentoComponente: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         fields: [
            { key: 'componente.ds_componente', label: 'Componente' },
            { key: 'componente.fl_atualiza', label: 'Atlz. Software', formatter: 'formatarFlAtualiza' },
            { key: 'nr_serie_componente', label: 'Nr. Série' },
            { key: 'ds_equipamento_componente', label: 'Descrição' }
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
         return this.items.filter((item) => {
            const filterText = this.filter.toLowerCase()
            return Object.keys(item).some((key) => {
               if (key === 'cnpj') {
                  return this.cnpjFormatado[this.items.indexOf(item)].toLowerCase().includes(filterText)
               }
               return String(item[key]).toLowerCase().includes(filterText)
            })
         })
      },
      optionsEquipamentos() {
         const options = [
            {
               value: 'null',
               label: 'Selecione um equipamento'
            }
         ]
         return options.concat(
            this.equipamento
               .filter((equipamento) => equipamento.equipamento !== null)
               .map((equipamento) => ({
                  value: equipamento.equipamento.id_equipamento,
                  label: equipamento.equipamento.ds_equipamento
               }))
         )
      }
   },

   methods: {
      formatarFlAtualiza(value) {
         return value === 'S' ? 'Sim' : value === 'N' ? 'Não' : value
      },
      formNovo() {
         this.erros = []
         this.objNovoEquipamentoComponente = {}
         this.tituloModal = 'Cadastrar Equipamento Componente'
         this.$bvModal.show('cadastro')
      },
      async salvarEquipamentoComponente(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await equipamentoComponenteService.salvarEquipamentoComponente(this.objNovoEquipamentoComponente)
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
         const dados = await client.get(`/equipamento_componente/${this.id_equipamento}`).catch((err) => {
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
      async buscarEquipamentos() {
         this.overlayEquipamentos = true
         const dados = await client.get('/equipamento_componente/buscarequipamento').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamentos. ${err}`, {
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
         this.objNovoEquipamentoComponente = { ...this.itemSelecionado }
         this.erros = []
         this.tituloModal = 'Editar Equipamento Componente'
         this.$bvModal.show('cadastro')
      },
      resetModal() {
         this.objNovoEquipamentoComponente = {}
         this.erros = []
      },
      validate(prop) {
         const keys = Object.keys(this.erros)
         if (keys.includes(prop)) {
            return false
         }
      }
   },

   watch: {
      id_equipamento(newValue) {
         if (newValue && newValue != 'null') {
            this.buscar()
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