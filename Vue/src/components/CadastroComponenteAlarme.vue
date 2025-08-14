<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Alarmes de componentes cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col md="4">
                     <b-overlay :show="overlayProdutos" rounded="sm">
                        <v-select v-model="id_produto" :options="optionsProdutos" :reduce="(produto) => produto.value">
                           <template #no-options="">Nenhuma correspondência</template>
                        </v-select>
                     </b-overlay>
                  </b-col>
                  <b-col class="" md="2">
                     <b-button-group class="mb-4 float-right">
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar Alarmes </b-button>
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_produto" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(alarmes)="row">
                     <b-button :disabled="!row.item.componentes_alarmes.length" variant="outline-primary" size="sm" title="Ver Componentes" @click="row.toggleDetails()">
                        <b-icon-eye-fill class="mr-2"></b-icon-eye-fill><span>{{ row.item.componentes_alarmes.length }}</span>
                     </b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col md="12">
                              <b-table :fields="fieldsDetalhe" :items="row.item.componentes_alarmes">
                                 <template #cell(tp_criticidade)="row">
                                    {{ formatarCriticidade(row.item.tp_criticidade) }}
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
      <b-modal id="cadastro" ref="modal" :title="tituloModal" @ok="salvarComponenteAlarme" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Alarmes">
               <b-overlay :show="overlayAlarmes" rounded="sm">
                  <v-select multiple v-model="objNovoComponenteAlarme.id_alarme" :options="optionsAlarmes" :state="validate('id_alarme')" :reduce="(alarme) => alarme.value" :class="{ 'border-danger': validate('id_alarme') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_alarme'] | parseErros }}</small>
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
import { produtoComponenteAlarmeService } from '../services'

export default {
   name: 'CadastroComponenteAlarme',
   data() {
      return {
         id_produto: 'null',
         overlayProdutos: false,
         overlayAlarmes: false,
         produto: [],
         alarme: [],
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoComponenteAlarme: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         fields: [
            { key: 'ds_componente', label: 'Componente' },
            { key: 'modelo_componente.ds_modelo_componente', label: 'Modelo' },
            { key: 'alarmes', label: 'Alarmes' }
         ],
         fieldsDetalhe: [
            { key: 'cd_alarme', label: 'Cód.' },
            { key: 'ds_alarme', label: 'Alarme' },
            { key: 'tp_criticidade', label: 'Criticidade' }
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
      optionsProdutos() {
         if (!this.produto.length) {
            return []
         }
         const options = [
            {
               value: 'null',
               label: 'Selecione um produto'
            }
         ]
         return options.concat(
            this.produto.map((produto) => ({
               value: produto.produto.id_produto,
               label: produto.produto.nm_produto
            }))
         )
      },
      optionsAlarmes() {
         if (!this.alarme.length) {
            return
         }
         return this.alarme.map((alarme) => ({
            value: alarme.id_alarme,
            label: alarme.ds_alarme
         }))
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
      async salvarComponenteAlarme(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await produtoComponenteAlarmeService.salvarComponenteAlarme(this.objNovoComponenteAlarme)
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
         const dados = await client.get(`/produto/componentealarme/${this.id_produto}`).catch((err) => {
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
         this.items = dados.data.produtos_componentes
         this.totalRows = this.items.length
      },
      async buscarProdutos() {
         this.overlayProdutos = true
         const dados = await client.get('/produto_componente').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar produtos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayProdutos = false
         this.produto = dados.data
      },
      async buscarAlarmes() {
         this.overlayAlarmes = true
         const dados = await client.get('/alarme').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar alarmes. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayAlarmes = false
         this.alarme = dados.data
      },
      editar() {
         const id_alarme = this.itemSelecionado.componentes_alarmes.map((alarmes) => alarmes.id_alarme)
         const id_produto = this.itemSelecionado.pivot.id_produto
         const id_componente = this.itemSelecionado.pivot.id_componente
         this.objNovoComponenteAlarme = { ...this.itemSelecionado, id_alarme, id_produto, id_componente }
         this.erros = []
         this.tituloModal = 'Editar Alarmes do Componente'
         this.$bvModal.show('cadastro')
      },
      resetModal() {
         this.objNovoComponenteAlarme = {}
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
      id_produto(newValue) {
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
      this.buscarProdutos()
      this.buscarAlarmes()
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