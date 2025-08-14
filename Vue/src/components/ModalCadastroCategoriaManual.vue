<template>
   <b-modal size="xl" id="cadastro-categoria" title="Categorias cadastradas" ok-title="Fechar" ok-only>
      <b-collapse v-model="showCollapse" class="mt-2">
         <b-card class="mb-3">
            <b-row>
               <b-col sm="12" md="6" lg="6">
                  <b-form-group label="Descrição da Categoria">
                     <b-form-input v-model="objNovaCategoria.ds_categoria_manual" :state="validate('ds_categoria_manual')"></b-form-input>
                     <b-form-invalid-feedback id="ds_categoria_manual">{{ erros['ds_categoria_manual'] | parseErros }}</b-form-invalid-feedback>
                  </b-form-group>
               </b-col>
               <b-col sm="12" md="6" lg="6">
                  <b-form-group label="Visível">
                     <v-select v-model="objNovaCategoria.fl_visivel" :options="optionsVisivel" :state="validate('fl_visivel')" :reduce="(visivel) => visivel.value" :class="{ 'border-danger': validate('fl_visivel') == false }">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['fl_visivel'] | parseErros }}</small>
                  </b-form-group>
               </b-col>
            </b-row>
            <b-row>
               <b-col>
                  <b-button :disabled="isSalvando" variant="primary" class="mr-1" @click="salvarCategoria()">
                     <span v-if="!isSalvando">Salvar</span>
                     <div v-else>
                        <b-spinner small></b-spinner>
                        <span class="ml-1">Salvando...</span>
                     </div>
                  </b-button>
                  <b-button variant="secondary" @click="limpar()">Cancelar</b-button>
               </b-col>
            </b-row>
         </b-card>
      </b-collapse>
      <b-row>
         <b-col class="my-1" md="6">
            <b-button-group class="mb-4">
               <b-button variant="outline-success" @click="cadastrar"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
               <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
               <b-button id="popover-excluir-categoria" variant="outline-danger" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-trash></b-icon-trash>Excluir </b-button>
               <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-categoria" title="Excluir Categoria?">
                  <div class="mt-2" v-if="selecionado.length > 0">
                     ({{ itemSelecionado.id_categoria_manual }}) {{ itemSelecionado.ds_categoria_manual }}
                     <hr />
                     <b-button @click="popovers.excluir = false" variant="danger">Não</b-button>
                     <b-button class="ml-2" :disabled="isExcluindo" variant="success">
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
      </b-row>
      <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_familia" hover selectable>
         <template #table-busy>
            <div class="text-center text-danger my-2">
               <b-spinner class="align-middle mr-1"></b-spinner>
               <strong>Carregando...</strong>
            </div>
         </template>
         <template #cell(fl_visivel)="row">
            <span>{{ formatarVisivel(row.item.fl_visivel) }}</span>
         </template>
      </b-table>
      <p class="text-center" v-if="!this.items.length && !isBusy">Nenhum resultado para listar</p>
      <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="right" class="my-0"></b-pagination>
   </b-modal>
</template>

<script>
import client from '@/api'
import { categoriaManualService } from '../services'

export default {
   name: 'ModalCadastroCategoriaManual',
   data() {
      return {
         isExcluindo: false,
         filter: null,
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovaCategoria: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         showCollapse: false,
         popovers: {
            excluir: false
         },
         fields: [
            { key: 'id_categoria_manual', label: 'ID', tdClass: 'text-center', class: 'text-center' },
            { key: 'ds_categoria_manual', label: 'Descrição' },
            { key: 'fl_visivel', label: 'Visível' }
         ],
         optionsVisivel: [
            { value: 'S', label: 'Sim' },
            { value: 'N', label: 'Não' }
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
            keys.splice(keys.indexOf('id_categoria_manual'), 1)
            return keys.find((k) => String(i[k]).toLowerCase().includes(this.filter))
         })
      }
   },

   methods: {
      cadastrar() {
         this.erros = []
         this.objNovaCategoria = {}
         this.showCollapse = true
      },
      formatarVisivel(value) {
         return value === 'S' ? 'Sim' : value === 'N' ? 'Não' : value
      },
      async salvarCategoria() {
         this.isSalvando = true
         let msg = ''
         const { status, data } = await categoriaManualService.salvarCategoria(this.objNovaCategoria)
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
               this.showCollapse = false
            })
         }
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/categoria_manual').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar categorias. ${err}`, {
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
         this.erros = []
         this.objNovaCategoria = { ...this.itemSelecionado }
         this.showCollapse = true
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione uma categoria de manual na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_categoria_manual
         const result = await client.delete(`/categoria_manual/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Categoria de Manual',
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
      },
      limpar() {
         this.showCollapse = false
         this.erros = []
         this.objNovaCategoria = {}
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