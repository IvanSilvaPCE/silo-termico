<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Modelos de componentes cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-modelo" variant="outline-danger" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-trash></b-icon-trash>Excluir </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-modelo" title="Excluir Modelo?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_modelo_componente }}) {{ itemSelecionado.ds_modelo_componente }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_modelo_componente" hover selectable>
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
      <b-modal id="cadastro" ref="modal" :title="tituloModal" @ok="salvarModelo" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Descrição">
               <b-form-input v-model="objNovoModelo.ds_modelo_componente" :state="validate('ds_modelo_componente')"></b-form-input>
               <b-form-invalid-feedback id="ds_modelo_componente">{{ erros['ds_modelo_componente'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Tipo">
               <b-overlay :show="overlayTipoComponente" rounded="sm">
                  <v-select v-model="objNovoModelo.id_tipo_componente" :options="optionsTiposComponentes" :state="validate('id_tipo_componente')" :reduce="(tipo) => tipo.value" :class="{ 'border-danger': validate('id_tipo_componente') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_tipo_componente'] | parseErros }}</small>
               </b-overlay>
            </b-form-group>
            <b-form-group label="Marca">
               <b-overlay :show="overlayTipoComponente" rounded="sm">
                  <v-select v-model="objNovoModelo.id_marca" :options="optionsMarcas" :state="validate('id_marca')" :reduce="(marca) => marca.value" :class="{ 'border-danger': validate('id_marca') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_marca'] | parseErros }}</small>
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
import { modeloService } from '../services'

export default {
   name: 'CadastroModelo',
   data() {
      return {
         overlayTipoComponente: false,
         overlayMarcas: false,
         tipoComponente: [],
         marca: [],
         isExcluindo: false,
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoModelo: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            { key: 'id_modelo_componente', label: 'ID', tdClass: 'text-center', class: 'text-center' },
            { key: 'ds_modelo_componente', label: 'Descrição' }
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
            keys.splice(keys.indexOf('id_modelo_componente'), 1)
            return keys.find((k) => String(i[k]).toLowerCase().includes(this.filter))
         })
      },
      optionsTiposComponentes() {
         if (!this.tipoComponente.length) {
            return
         }
         return this.tipoComponente.map((tipoComponente) => ({
            value: tipoComponente.id_tipo_componente,
            label: tipoComponente.ds_tipo_componente
         }))
      },
      optionsMarcas() {
         if (!this.marca.length) {
            return
         }
         return this.marca.map((marca) => ({
            value: marca.id_marca,
            label: marca.ds_marca
         }))
      }
   },

   methods: {
      formNovo() {
         if (!this.tipoComponente.length) {
            this.buscarTipoComponentes()
         }
         if (!this.marca.length) {
            this.buscarMarcas()
         }
         this.erros = []
         this.objNovoModelo = {}
         this.tituloModal = 'Cadastrar Modelo'
         this.$bvModal.show('cadastro')
      },
      async salvarModelo(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await modeloService.salvarModelo(this.objNovoModelo)
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
         const dados = await client.get('/modelo_componente').catch((err) => {
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
      async buscarTipoComponentes() {
         this.overlayTipoComponente = true
         const dados = await client.get('/tipo_componente').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tipos de componentes. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayTipoComponente = false
         this.tipoComponente = dados.data
      },
      async buscarMarcas() {
         this.overlayMarcas = true
         const dados = await client.get('/marca').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar marcas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayMarcas = false
         this.marca = dados.data
      },
      editar() {
         if (!this.tipoComponente.length) {
            this.buscarTipoComponentes()
         }
         if (!this.marca.length) {
            this.buscarMarcas()
         }
         this.objNovoModelo = { ...this.itemSelecionado }
         this.erros = []
         this.tituloModal = 'Editar Modelo'
         this.$bvModal.show('cadastro')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione um modelo na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_modelo_componente
         const result = await client.delete(`/modelo_componente/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Modelo',
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
      },
      resetModal() {
         this.objNovoModelo = {}
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
      this.buscar(), (this.totalRows = this.items.length)
   }
}
</script>

<style scoped>
.border-danger {
   border: 1.5px solid red;
   border-radius: 4px;
}
.text-danger {
   color: red;
}
</style>