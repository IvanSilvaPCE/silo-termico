<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Usuários cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-usuario" variant="outline-warning" @click="confirmarExclusao" :disabled="!temAlgumSelecionado"> <b-icon-x-circle></b-icon-x-circle> Inativar </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-usuario" title="Inativar Usuário?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_usuario }}) {{ itemSelecionado.nm_usuario }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="nm_usuario" hover selectable>
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
                        :disabled="!row.item.imagem"
                        ><b-icon-eye-fill></b-icon-eye-fill
                     ></b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col sm="6" md="6">
                              <b-overlay :show="!row.item.imagemCarregada" style="min-height: 100px">
                                 <div>
                                    <b-img v-if="row.item.imagemCarregada" :src="imagemCache[row.item.imagemUrl]" :title="row.item.imagem.ds_imagem" :alt="row.item.nm_produto" fluid></b-img>
                                 </div>
                              </b-overlay>
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

      <b-modal id="cadastro-usuario" ref="modal" :title="tituloModal" @ok="salvarUsuario" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Nome">
               <b-form-input v-model="objNovoUsuario.nm_usuario" :state="validate('nm_usuario')"></b-form-input>
               <b-form-invalid-feedback id="nm_usuario">{{ erros['nm_usuario'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Email">
               <b-form-input v-model="objNovoUsuario.email" :state="validate('email')"></b-form-input>
               <b-form-invalid-feedback id="email">{{ erros['email'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Telefone">
               <b-form-input v-model="objNovoUsuario.telefone" :state="validate('telefone')"></b-form-input>
               <b-form-invalid-feedback id="telefone">{{ erros['telefone'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Celular">
               <b-form-input v-model="objNovoUsuario.celular" :state="validate('celular')"></b-form-input>
               <b-form-invalid-feedback id="celular">{{ erros['celular'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Imagem">
               <b-form-file v-model="objNovoUsuario.imagem" :state="validate('imagem')" accept="image/*" placeholder="Nenhum arquivo escolhido" browse-text="Escolher"></b-form-file>
               <b-form-invalid-feedback id="imagem">{{ erros['imagem'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Senha">
               <b-form-input type="password" v-model="objNovoUsuario.password" :state="validate('password')"></b-form-input>
               <b-form-invalid-feedback id="password">{{ erros['password'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Confirmação da Senha">
               <b-form-input type="password" v-model="objNovoUsuario.password_conf" :state="validate('password_conf')"></b-form-input>
               <b-form-invalid-feedback id="password_conf">{{ erros['password_conf'] | parseErros }}</b-form-invalid-feedback>
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
import { usuarioService } from '../services'

export default {
   name: 'CadastroUsuario',
   data() {
      return {
         imagemCache: {},
         imagemUrl: null,
         filter: null,
         isExcluindo: false,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoUsuario: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            // { key: 'id_usuario', label: 'ID', tdClass: 'text-center', class: 'text-center' },
            { key: 'nm_usuario', label: 'Nome' },
            { key: 'email', label: 'Email' },
            { key: 'telefone', label: 'Telefone' },
            { key: 'celular', label: 'Celular' },
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
            keys.splice(keys.indexOf('id_usuario'), 1)
            keys.splice(keys.indexOf('usuarios_perfis'), 1)
            return keys.find((k) => String(i[k]).toLowerCase().includes(this.filter))
         })
      }
   },

   methods: {
      formNovo() {
         this.erros = []
         this.objNovoUsuario = {}
         this.tituloModal = 'Cadastrar Usuário'
         this.$bvModal.show('cadastro-usuario')
         // this.$root.$emit('bv::show::modal', 'cadastro')
      },
      async salvarUsuario(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await usuarioService.salvarUsuario(this.objNovoUsuario)
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
               this.$bvModal.hide('cadastro-usuario')
            })
         }
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/usuario').catch((err) => {
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
         this.objNovoUsuario = { ...this.itemSelecionado }
         delete this.objNovoUsuario.imagem
         this.erros = []
         this.tituloModal = 'Editar Usuário'
         this.$bvModal.show('cadastro-usuario')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione um usuário na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_usuario
         const result = await client.delete(`/usuario/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Usuário',
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
         this.objNovoUsuario = {}
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
      this.buscar()
      this.totalRows = this.items.length
   }
}
</script>

<style>
</style>