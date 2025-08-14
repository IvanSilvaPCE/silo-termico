<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Pessoas físicas e jurídicas cadastradas</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-tooltip target="cadastrar">Cadastrar Pessoa</b-tooltip>
                     <b-tooltip target="popover-excluir-pessoa">Inativar Pessoa</b-tooltip>
                     <b-tooltip target="cadastrar-endereco">Cadastrar Endereço</b-tooltip>
                     <b-button-group class="mb-4">
                        <b-tooltip target="editar">Editar Pessoa</b-tooltip>
                        <b-button variant="outline-success" @click="formNovo" id="cadastrar"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Pessoa </b-button>
                        <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado" id="editar"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                        <b-button id="popover-excluir-pessoa" variant="outline-warning" @click="confirmarExclusao" :disabled="!temAlgumSelecionado" v-if="verificarPerfilOperacao(['EXCPESSOA']) || verificarPerfilOperacao(['ADMINPORTA'])"> <b-icon-x-circle></b-icon-x-circle> Inativar </b-button>
                        <b-button variant="outline-success" @click="formNovoEndereco" :disabled="!temAlgumSelecionado" id="cadastrar-endereco"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Endereço </b-button>
                        <b-popover variant="" triggers="manual" :show.sync="popovers.excluir" target="popover-excluir-pessoa" title="Inativar Pessoa?">
                           <div class="mt-2" v-if="selecionado.length > 0">
                              ({{ itemSelecionado.id_pessoa }}) {{ itemSelecionado.natureza == 'J' ? itemSelecionado.nm_fantasia : itemSelecionado.nm_pessoa }}
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_pessoa" hover selectable>
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
                           <b-col md="6" v-if="row.item.logo">
                              <b-overlay :show="!row.item.imagemCarregada" style="min-height: 100px">
                                 <div>
                                    <b-img v-if="row.item.imagemCarregada" :src="imagemCache[row.item.imagemUrl]" alt="Imagem Logomarca" fluid></b-img>
                                 </div>
                              </b-overlay>
                           </b-col>
                           <b-col md="6">
                              <div v-if="row.item.natureza == 'J'">
                                 <h5>Nome Fantasia</h5>
                                 <p>{{ row.item.nm_fantasia }}</p>
                                 <h5>Razão Social</h5>
                                 <p>{{ row.item.razao_social }}</p>
                                 <h5>CNPJ</h5>
                                 <p>{{ formatarCnpj(row.item.cnpj) }}</p>
                                 <h5>Inscrição Municipal</h5>
                                 <p>{{ row.item.inscricao_municipal }}</p>
                                 <h5>Inscrição Estadual</h5>
                                 <p>{{ row.item.inscricao_estadual }}</p>
                                 <h5>Tema</h5>
                                 <p>{{ row.item.tema }}</p>
                                 <h5 v-if="row.item.matriz">Matriz</h5>
                                 <p>{{ row.item.matriz?.nm_fantasia }}</p>
                                 <h5 v-if="row.item.matriz">CNPJ Matriz</h5>
                                 <p>{{ formatarCnpj(row.item.matriz?.cnpj) }}</p>
                              </div>
                              <div v-else>
                                 <h5>Nome</h5>
                                 <p>{{ row.item.nm_pessoa }}</p>
                                 <h5>Data de Nascimento</h5>
                                 <p>{{ formatarDtNascimento(row.item.dt_nascimento) }}</p>
                                 <h5>Gênero</h5>
                                 <p>{{ formatarGenero(row.item.genero) }}</p>
                                 <h5>RG</h5>
                                 <p>{{ row.item.rg }}</p>
                                 <h5>CPF</h5>
                                 <p>{{ formatarCpf(row.item.cpf) }}</p>
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
      <modal-cadastro-pessoa ref="modal" :objNovaPessoa="objNovaPessoa" :erros="erros" :tituloModal="tituloModal" @buscar="buscar"></modal-cadastro-pessoa>
      <modal-cadastro-endereco ref="modalEndereco" :objNovoEndereco="objNovoEndereco" :tituloModal="tituloModalEndereco"></modal-cadastro-endereco>
   </div>
</template>

<script>
import client from '@/api'
import ModalCadastroPessoa from './ModalCadastroPessoa.vue'
import ModalCadastroEndereco from '@/components/ModalCadastroEndereco.vue'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'CadastroPessoa',
   components: {
      ModalCadastroPessoa,
      ModalCadastroEndereco
   },
   data() {
      return {
         tituloModalEndereco: null,
         objNovoEndereco: {},
         imagemCache: {},
         isExcluindo: false,
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovaPessoa: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         popovers: {
            excluir: false
         },
         fields: [
            // { key: 'id_pessoa', label: 'ID', tdClass: 'text-center', class: 'text-center' },
            { key: 'natureza', label: 'Natureza', formatter: 'formatarNatureza' },
            { key: 'tp_pessoa', label: 'Tipo', formatter: 'formatarTpPessoa' },
            { key: 'nm_fantasia', label: 'Nome Fantasia', formatter: (value) => value || '—' },
            { key: 'cnpj', label: 'CNPJ', formatter: 'formatarCnpj' },
            { key: 'nm_pessoa', label: 'Nome', formatter: (value) => value || '—' },
            { key: 'cpf', label: 'CPF', formatter: 'formatarCpf' },
            { key: 'dt_nascimento', label: 'Data Nasc.', formatter: 'formatarDtNascimento' },
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
         const filtroLower = this.filter.toLowerCase()
         return this.items.filter((i) => {
            const keysToCheck = ['natureza', 'tp_pessoa', 'cnpj', 'cpf', 'dt_nascimento']
            for (const key of keysToCheck) {
               const formattedValue = this.valorFormatado(key, i[key])
               if (formattedValue.toLowerCase().includes(filtroLower)) {
                  return true
               }
            }
            const keys = Object.keys(i).filter((k) => k !== 'id_pessoa')
            return keys.find((k) => String(i[k]).toLowerCase().includes(filtroLower))
         })
      }
   },

   methods: {
      valorFormatado(key, value) {
         switch (key) {
            case 'natureza':
               return this.formatarNatureza(value)
            case 'tp_pessoa':
               return this.formatarTpPessoa(value)
            case 'cnpj':
               return this.formatarCnpj(value)
            case 'cpf':
               return this.formatarCpf(value)
            case 'dt_nascimento':
               return this.formatarDtNascimento(value)
            default:
               return value
         }
      },
      formatarCnpj(value) {
         if (!value) return '—'
         return this.$options.filters.VMask(value, '##.###.###/####-##')
      },
      formatarCpf(value) {
         if (!value) return '—'
         return this.$options.filters.VMask(value, '###.###.###-##')
      },
      formatarDtNascimento(value) {
         if (!value) return '—'
         return this.$moment(value, 'YYYY/MM/DD').format('DD/MM/YYYY')
      },
      formatarNatureza(value) {
         return value === 'J' ? 'Jurídica' : value === 'F' ? 'Física' : value
      },
      formatarTpPessoa(value) {
         if (value === 'FA') return 'Fabricante'
         if (value === 'PR') return 'Produtor'
         if (value === 'MA') return 'Matriz'
         if (value === 'UN') return 'Unidade'
         return value
      },
      formatarGenero(value) {
         if (value === 'M') return 'Masculino'
         if (value === 'F') return 'Feminino'
         if (value === 'X') return 'Não Informado'
         return value
      },
      formNovo() {
         this.$refs.modal.erros = []
         this.objNovaPessoa = {}
         this.tituloModal = 'Cadastrar Pessoa'
         this.$bvModal.show('cadastroPessoa')
      },
      formNovoEndereco() {
         this.objNovoEndereco = {
            id_pessoa: this.itemSelecionado.id_pessoa
         }
         ;(this.tituloModalEndereco = 'Cadastrar Endereço'), this.$bvModal.show('cadastro')
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get('/pessoa').catch((err) => {
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
         if (!this.itemSelecionado.id_pessoa_pai) {
            delete this.itemSelecionado.id_pessoa_pai
         }
         const dt_nascimento = this.formatarDtNascimento(this.itemSelecionado.dt_nascimento)
         this.objNovaPessoa = { ...this.itemSelecionado, dt_nascimento }
         this.$refs.modal.erros = []
         this.tituloModal = 'Editar Pessoa'
         this.$bvModal.show('cadastroPessoa')
      },
      confirmarExclusao() {
         if (this.temAlgumSelecionado) {
            this.popovers.excluir = true
         } else {
            this.showMessage({
               title: 'Erro!',
               msg: 'Primeiro selecione uma pessoa na lista',
               variant: 'warning'
            })
         }
      },
      async excluir() {
         this.isExcluindo = true
         const id = this.itemSelecionado.id_pessoa
         const result = await client.delete(`/pessoa/${id}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Pessoa',
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
         if (!row.item.logo) {
            return
         }
         const imagem = row.item.logo
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