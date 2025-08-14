<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Componentes cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-componente" variant="outline-warning" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-x-circle></b-icon-x-circle> Inativar </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-componente" title="Inativar Componente?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_componente }}) {{ itemSelecionado.ds_componente }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_componente" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(detalhes)="row">
                     <b-button
                        variant="outline-primary"
                        size="sm"
                        title="Ver Detalhes"
                        @click="
                           row.toggleDetails()
                           buscarImagem(row)
                        "
                        ><b-icon-eye-fill></b-icon-eye-fill
                     ></b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col md="6">
                              <b-overlay :show="!row.item.imagemCarregada" style="min-height: 100px">
                                 <div>
                                    <b-img v-if="row.item.imagemCarregada" :src="imagemCache[row.item.imagemUrl]" :title="row.item.imagem.ds_imagem" :alt="row.item.ds_componente" fluid></b-img>
                                 </div>
                              </b-overlay>
                           </b-col>
                           <b-col md="6">
                              <div>
                                 <h5>Modelo do Componente</h5>
                                 <p>{{ row.item.modelo_componente.ds_modelo_componente }}</p>
                                 <h5>Atualiza Software</h5>
                                 <p>{{ row.item.fl_atualiza == 'S' ? 'Sim' : 'Não' }}</p>
                              </div>
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
      <b-modal id="cadastro-componente" ref="modal" :title="tituloModal" @ok="salvarComponente" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Nome do Componente">
               <b-form-input v-model="objNovoComponente.ds_componente" :state="validate('ds_componente')"></b-form-input>
               <b-form-invalid-feedback id="ds_componente">{{ erros['ds_componente'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Atualiza Software">
               <b-overlay :show="overlayModelosComponentes" rounded="sm">
                  <v-select v-model="objNovoComponente.fl_atualiza" :options="optionsFlAtualiza" :state="validate('fl_atualiza')" :reduce="(tipo) => tipo.value" :class="{ 'border-danger': validate('fl_atualiza') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['fl_atualiza'] | parseErros }}</small>
               </b-overlay>
            </b-form-group>
            <b-form-group label="Modelo Componente">
               <b-overlay :show="overlayModelosComponentes" rounded="sm">
                  <v-select v-model="objNovoComponente.id_modelo_componente" :options="optionsModelosComponentes" :state="validate('id_modelo_componente')" :reduce="(tipo) => tipo.value" :class="{ 'border-danger': validate('id_modelo_componente') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_modelo_componente'] | parseErros }}</small>
               </b-overlay>
            </b-form-group>
            <b-form-group label="Imagem">
               <b-form-file v-model="objNovoComponente.imagem" :state="validate('imagem')" accept="image/*" placeholder="Nenhum arquivo escolhido" browse-text="Escolher"></b-form-file>
               <b-form-invalid-feedback id="imagem">{{ erros['imagem'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Descrição da Imagem">
               <b-form-input v-model="objNovoComponente.ds_imagem" :state="validate('ds_imagem')"></b-form-input>
               <b-form-invalid-feedback id="ds_imagem">{{ erros['ds_imagem'] | parseErros }}</b-form-invalid-feedback>
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
import { componenteService } from '../services'

export default {
   name: 'CadastroComponente',
   data() {
      return {
         modelosComponentes: [],
         flAtualiza: [],
         imagemCache: {},
         imagemUrl: null,
         overlayModelosComponentes: false,
         overlayFlAtualiza: false,
         isExcluindo: false,
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoComponente: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            { key: 'id_componente', label: 'ID', tdClass: 'text-center', class: 'text-center' },
            { key: 'ds_componente', label: 'Descrição' },
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
         return this.items.filter((i) => {
            const keys = Object.keys(i)
            keys.splice(keys.indexOf('id_componente'), 1)
            return keys.find((k) => String(i[k]).toLowerCase().includes(this.filter))
         })
      },
      optionsModelosComponentes() {
         if (!this.modelosComponentes.length) {
            return
         }
         return this.modelosComponentes.map((modelosComponentes) => ({
            value: modelosComponentes.id_modelo_componente,
            label: modelosComponentes.ds_modelo_componente
         }))
      },
      optionsFlAtualiza() {
         if (!this.flAtualiza.length) {
            return
         }
         return this.flAtualiza.map((flAtualiza) => ({
            value: flAtualiza.cd_dominio,
            label: flAtualiza.ds_dominio
         }))
      }
   },

   methods: {
      formNovo() {
         this.erros = []
         this.objNovoComponente = {}
         this.tituloModal = 'Cadastrar Componente'
         this.$bvModal.show('cadastro-componente')
      },
      async salvarComponente(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await componenteService.salvarComponente(this.objNovoComponente)
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
            this.$nextTick(() => {
               this.$bvModal.hide('cadastro-componente')
            })
            this.buscar()
         }
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/componente').catch((err) => {
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
      async buscarModelosComponentes() {
         this.overlayModelosComponentes = true
         const dados = await client.get('/modelo_componente').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar famílias. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayModelosComponentes = false
         this.modelosComponentes = dados.data
      },
      async buscarFlAtualiza() {
         this.overlayFlAtualiza = true
         const dados = await client.get('/componente/flatualiza').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar famílias. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayFlAtualiza = false
         this.flAtualiza = dados.data
      },
      editar() {
         this.objNovoComponente = { ...this.itemSelecionado, ds_imagem: this.itemSelecionado.imagem.ds_imagem }
         delete this.objNovoComponente.imagem
         this.erros = []
         this.tituloModal = 'Editar Produto'
         this.$bvModal.show('cadastro-componente')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione um componente na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_componente
         const result = await client.delete(`/componente/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Componente',
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
      resetModal() {
         this.objNovoComponente = {}
         this.erros = []
      },
      validate(prop) {
         const keys = Object.keys(this.erros)
         if (keys.includes(prop)) {
            return false
         }
      },
      buscarImagemDoCache(imagem) {
         const chaveCache = imagem
         if (this.imagemCache[chaveCache]) {
            return this.imagemCache[chaveCache]
         } else {
            return null
         }
      },
      async buscarImagem(row) {
         if (row.item.imagemCarregada) {
            return
         }
         const imagem = row.item.imagem.caminho
         const imagemNoCache = this.buscarImagemDoCache(imagem)
         if (imagemNoCache) {
            this.$set(row.item, 'imagemUrl', imagemNoCache)
            this.$set(row.item, 'imagemCarregada', true)
         } else {
            const dados = await client.get(`/imagem?caminho=${imagem}`).catch((err) => {
               this.$bvToast.toast(`Erro ao buscar a imagem. ${err}`, {
                  title: 'Erro',
                  variant: 'warning',
                  autoHideDelay: 5000,
                  solid: true,
                  toaster: 'b-toaster-bottom-right'
               })
               this.$set(row.item, 'imagemCarregada', true)
            })
            if (dados && dados.data) {
               this.imagemCache[imagem] = dados.data
               this.$set(row.item, 'imagemUrl', imagem)
               this.$set(row.item, 'imagemCarregada', true)
            }
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
      if (!this.modelosComponentes.length) {
         this.buscarModelosComponentes()
      }
      if (!this.flAtualiza.length) {
         this.buscarFlAtualiza()
      }
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
.text-danger {
   color: red;
}
</style>