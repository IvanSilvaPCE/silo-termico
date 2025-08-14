<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Produtos Alarmes cadastrados</h2>
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_produto" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(alarmes)="row">
                     <b-button :disabled="!row.item.produtos_alarmes.length" variant="outline-primary" size="sm" title="Ver Alarmes" @click="row.toggleDetails()">
                        <b-icon-eye-fill class="mr-2"></b-icon-eye-fill><span>{{ row.item.produtos_alarmes.length }}</span>
                     </b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col md="12">
                              <b-table :fields="fieldsDetalhe" :items="row.item.produtos_alarmes">
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
      <b-modal id="cadastro" ref="modal" :title="tituloModal" @ok="salvarProdutoAlarme" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Produto">
               <b-overlay :show="isBusy" rounded="sm">
                  <v-select v-model="objNovoProdutoAlarme.id_produto" :options="optionsProdutos" :state="validate('id_produto')" :reduce="(produto) => produto.value" :class="{ 'border-danger': validate('id_produto') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_produto'] | parseErros }}</small>
               </b-overlay>
            </b-form-group>
            <b-form-group label="Alarmes">
               <b-overlay :show="overlayAlarmes" rounded="sm">
                  <v-select multiple v-model="objNovoProdutoAlarme.id_alarme" :options="optionsAlarmes" :state="validate('id_alarme')" :reduce="(alarme) => alarme.value" :class="{ 'border-danger': validate('id_alarme') == false }">
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
import { produtoAlarmeService } from '../services'

export default {
   name: 'CadastroProdutoAlarme',
   data() {
      return {
         overlayAlarmes: false,
         alarme: [],
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoProdutoAlarme: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         fields: [
            { key: 'nm_produto', label: 'Produto' },
            { key: 'alarmes', label: 'Alarmes' }
         ],
         fieldsDetalhe: [
            { key: 'cd_alarme', label: 'Cód.' },
            { key: 'ds_alarme', label: 'Descrição' },
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
         if (!this.items.length) {
            return
         }
         return this.items.map((items) => ({
            value: items.id_produto,
            label: items.nm_produto
         }))
      },
      optionsAlarmes() {
         if (!this.alarme.length) {
            return
         }
         return this.alarme.map((alarme) => ({
            value: alarme.id_alarme,
            label: alarme.cd_alarme + ' | ' + alarme.ds_alarme
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
      formNovo() {
         this.erros = []
         this.objNovoProdutoAlarme = {}
         this.tituloModal = 'Cadastrar Produto Alarme'
         this.$bvModal.show('cadastro')
      },
      async salvarProdutoAlarme(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await produtoAlarmeService.salvarProdutoAlarme(this.objNovoProdutoAlarme)
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
         const dados = await client.get('/produto/buscarproduto').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar produtos. ${err}`, {
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
         const id_alarme = this.itemSelecionado.produtos_alarmes.map((alarmes) => alarmes.id_alarme)
         this.objNovoProdutoAlarme = { ...this.itemSelecionado, id_alarme }
         this.erros = []
         this.tituloModal = 'Editar Produto Alarme'
         this.$bvModal.show('cadastro')
      },
      resetModal() {
         this.objNovoProdutoAlarme = {}
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