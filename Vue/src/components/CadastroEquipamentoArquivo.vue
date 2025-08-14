<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Arquivos de equipamentos cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col class="my-1" md="6">
                     <b-button-group class="mb-4">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
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
                  <template #cell(pessoa)="row">
                     <span>{{ row.item.pessoa?.natureza == 'J' ? row.item.pessoa?.nm_fantasia : row.item.pessoa?.nm_pessoa }}</span>
                  </template>
                  <template #cell(equipamento_arquivos)="row">
                     <b-button :disabled="!row.item.equipamento_arquivos.length" variant="outline-primary" size="sm" title="Ver Arquivos" @click="row.toggleDetails()">
                        <b-icon-eye-fill class="mr-2"></b-icon-eye-fill>
                        <span>{{ row.item.equipamento_arquivos.length }}</span>
                     </b-button>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col md="12">
                              <b-table :fields="fieldsDetalhe" :items="row.item.equipamento_arquivos">
                                 <template #cell(tp_arquivo)="row">
                                    <span>{{ formatarTipo(row.item.tp_arquivo) }}</span>
                                 </template>
                                 <template #cell(nm_original)="row">
                                    <span class="link" @click="downloadArquivo(row)">{{ row.item.nm_original }}</span>
                                    <b-spinner v-if="row.item.download" small class="ml-1"></b-spinner>
                                 </template>
                                 <template #cell(excluir)="row">
                                    <b-button variant="outline-danger" @click="confirmarExclusaoArquivo(row)" :id="'popover_pess' + row.item.id_arquivo"><b-icon-trash></b-icon-trash></b-button>
                                    <b-popover variant="" triggers="manual" :show="row.item.popover" :target="'popover_pess' + row.item.id_arquivo" title="Excluir Arquivo?">
                                       <div class="mt-2">
                                          {{ row.item.nm_original }}
                                          <hr />
                                          <b-button @click="confirmarExclusaoArquivo(row)" variant="danger">Não</b-button>
                                          <b-button class="ml-2" :disabled="row.item.excluindo" @click="excluirArquivo(row)" variant="success">
                                             <b-spinner v-if="row.item.excluindo" small class="mr-1"></b-spinner>
                                             <span>Sim</span>
                                          </b-button>
                                       </div>
                                    </b-popover>
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
      <b-modal id="cadastro" ref="modal" :title="tituloModal" @ok="salvarEquipamentoArquivo" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Arquivo">
               <b-form-file v-model="objNovoEquipamentoArquivo.arquivo" :state="validate('arquivo')" accept=".pem,.crt,.key" placeholder="Nenhum arquivo escolhido" browse-text="Escolher"></b-form-file>
               <b-form-invalid-feedback id="arquivo">{{ erros['arquivo'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Descrição">
               <b-form-input v-model="objNovoEquipamentoArquivo.ds_arquivo" :state="validate('ds_arquivo')"></b-form-input>
               <b-form-invalid-feedback id="ds_arquivo">{{ erros['ds_arquivo'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Tipo">
               <v-select v-model="objNovoEquipamentoArquivo.tp_arquivo" :options="optionsTipo" :state="validate('tp_arquivo')" :reduce="(tipo) => tipo.value" :class="{ 'border-danger': validate('tp_arquivo') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['tp_arquivo'] | parseErros }}</small>
            </b-form-group>
            <b-form-group label="Equipamento">
               <b-overlay :show="overlayEquipamentos" rounded="sm">
                  <v-select v-model="objNovoEquipamentoArquivo.id_equipamento" :options="optionsEquipamentos" :state="validate('id_equipamento')" :reduce="(equipamento) => equipamento.value" :class="{ 'border-danger': validate('id_equipamento') == false }">
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
import { equipamentoArquivoService } from '../services'

export default {
   name: 'CadastroEquipamentoArquivo',
   data() {
      return {
         overlayEquipamentos: false,
         equipamento: [],
         isExcluindo: false,
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoEquipamentoArquivo: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         fields: [
            { key: 'nco', label: 'NCO' },
            { key: 'ds_equipamento', label: 'Descrição' },
            { key: 'chave', label: 'Chave' },
            { key: 'pessoa', label: 'Pessoa' },
            { key: 'equipamento_arquivos', label: 'Arquivos' }
         ],
         fieldsDetalhe: [
            { key: 'ds_arquivo', label: 'Descrição' },
            { key: 'tp_arquivo', label: 'Tipo', formatter: 'formatarTipo' },
            { key: 'nm_original', label: 'Arquivo' },
            { key: 'excluir', label: 'Excluir' }
         ],
         optionsTipo: [
            { value: 'CRT', label: 'Certificado' },
            { value: 'CPU', label: 'Chave pública' },
            { value: 'CPR', label: 'Chave privada' }
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
         return this.items.filter((i) => {
            const keys = Object.keys(i)
            if (i.pessoa && String(i.pessoa.nm_fantasia).toLowerCase().includes(filterLower)) {
               return true
            }
            if (i.pessoa && String(i.pessoa.nm_pessoa).toLowerCase().includes(filterLower)) {
               return true
            }
            return keys.find((k) => String(i[k]).toLowerCase().includes(filterLower))
         })
      },
      optionsEquipamentos() {
         if (!this.equipamento.length) {
            return
         }
         return this.equipamento.map((equipamento) => ({
            value: equipamento.id_equipamento,
            label: equipamento.ds_equipamento + ' | ' + equipamento.chave
         }))
      }
   },

   methods: {
      formatarTipo(value) {
         const tipo = {
            CRT: 'Certificado',
            CPU: 'Chave pública',
            CPR: 'Chave privada'
         }
         return tipo[value]
      },
      formNovo() {
         this.erros = []
         this.objNovoEquipamentoArquivo = {}
         this.tituloModal = 'Cadastrar Equipamento Arquivo'
         this.$bvModal.show('cadastro')
      },
      async salvarEquipamentoArquivo(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await equipamentoArquivoService.salvarEquipamentoArquivo(this.objNovoEquipamentoArquivo)
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
         const dados = await client.get('/equipamento_arquivo').catch((err) => {
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
         const dados = await client.get('/equipamento').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar perfis. ${err}`, {
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
      async downloadArquivo(row) {
         if (row.item.download) return
         const caminho = row.item.caminho
         const nome = row.item.nm_original
         this.$set(row.item, 'download', true)
         const dados = await client.get(`/equipamento_arquivo/download?caminho=${caminho}`).catch((err) => {
            this.$bvToast.toast(`Erro ao fazer download do arquivo. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.$set(row.item, 'download', false)
         })
         const url = window.URL.createObjectURL(new Blob([dados.data]))
         const link = document.createElement('a')
         link.href = url
         link.setAttribute('download', nome)
         document.body.appendChild(link)
         link.click()
         document.body.removeChild(link)
         this.$set(row.item, 'download', false)
      },
      async excluirArquivo(row) {
         this.$set(row.item, 'excluindo', true)
         const id_arquivo = row.item.id_arquivo
         const result = await client.delete(`/equipamento_arquivo/${id_arquivo}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Arquivo',
               msg: 'Excluído com sucesso',
               variant: 'success'
            })
         }
         this.$set(row.item, 'excluindo', false)
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
      confirmarExclusaoArquivo(row) {
         this.$set(row.item, 'popover', !row.item.popover)
      },
      resetModal() {
         this.objNovoEquipamentoArquivo = {}
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

.link {
   color: #007bff;
}
</style>