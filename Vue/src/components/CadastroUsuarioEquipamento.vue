<template>
   <div class="midde_cont">
      <div class="col-md-12">
         <div class="full">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <h2>Usuários equipamentos cadastrados</h2>
               </div>
            </div>
            <div class="table_section padding_infor_info">
               <div class="row">
                  <b-col md="4" class="mb-4">
                     <b-overlay :show="overlayUsuarios" rounded="sm">
                        <v-select v-model="id_usuario" :options="optionsUsuarios" :reduce="(usuario) => usuario.value">
                           <template #no-options="">Nenhuma correspondência</template>
                        </v-select>
                     </b-overlay>
                  </b-col>
                  <b-col class="" md="2">
                     <b-button-group class="float-center">
                        <b-button variant="outline-success" @click="formNovo"> <b-icon-file-earmark-plus></b-icon-file-earmark-plus> Cadastrar </b-button>
                        <!-- <b-button variant="outline-primary" @click="editar" :disabled="!temAlgumSelecionado"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button> -->
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
               <b-table :items="itemsFiltrados" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" @row-selected="selecionado = $event" select-mode="single" responsive="sm" sort-by="id_usuario" hover selectable>
                  <template #table-busy>
                     <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle mr-1"></b-spinner>
                        <strong>Carregando...</strong>
                     </div>
                  </template>
                  <template #cell(pessoa)="row">
                     {{ row.item.natureza == 'J' ? row.item.nm_fantasia : row.item.nm_pessoa }}
                  </template>
                  <template #cell(cnpj)="row">
                     {{ cnpjFormatado[row.index] }}
                  </template>
                  <template #cell(equipamentos)="row">
                     <b-button :disabled="!row.item.pessoas_equipamentos.length" variant="outline-primary" size="sm" title="Ver Equipamentos" @click="row.toggleDetails()">
                        <b-icon-eye-fill class="mr-2"></b-icon-eye-fill><span>{{ row.item.pessoas_equipamentos.length }}</span>
                     </b-button>
                  </template>
                  <template #cell(excluir)="row">
                     <!-- <p>{{ row }}</p> -->
                     <b-button variant="outline-danger" @click="confirmarExclusaoPessoa(row)" :id="'popover_pess' + row.item.id_pessoa"><b-icon-trash></b-icon-trash></b-button>
                     <b-popover variant="" triggers="manual" :show="row.item.popover" :target="'popover_pess' + row.item.id_pessoa" title="Excluir Pessoa?">
                        <div class="mt-2">
                           {{ row.item.natureza == 'J' ? row.item.nm_fantasia : row.item.nm_pessoa }}
                           <hr />
                           <b-button @click="confirmarExclusaoPessoa(row)" variant="danger">Não</b-button>
                           <b-button class="ml-2" :disabled="row.item.excluindo" @click="excluirPessoa(row)" variant="success">
                              <b-spinner v-if="row.item.excluindo" small class="mr-1"></b-spinner>
                              <span>Sim</span>
                           </b-button>
                        </div>
                     </b-popover>
                  </template>
                  <template #row-details="row">
                     <b-card>
                        <b-row>
                           <b-col md="12">
                              <b-table :fields="fieldsDetalhe" :items="row.item.pessoas_equipamentos">
                                 <template #cell(tp_equipamento)="row">
                                    {{ formatarTpEquipamento(row.item.tp_equipamento) }}
                                 </template>
                                 <template #cell(dt_fabricacao)="row">
                                    {{ formatarData(row.item.dt_fabricacao) }}
                                 </template>
                                 <template #cell(excluir)="row">
                                    <b-button variant="outline-danger" @click="confirmarExclusaoEquipamento(row)" :id="'popover_equip' + row.item.id_equipamento"><b-icon-trash></b-icon-trash></b-button>
                                    <b-popover variant="" triggers="manual" :show="row.item.popover" :target="'popover_equip' + row.item.id_equipamento" title="Excluir Equipamento?">
                                       <div class="mt-2">
                                          {{ row.item.ds_equipamento }}
                                          <hr />
                                          <b-button @click="confirmarExclusaoEquipamento(row)" variant="danger">Não</b-button>
                                          <b-button class="ml-2" :disabled="row.item.excluindo" @click="excluirEquipamento(row)" variant="success">
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
      <b-modal id="cadastro" ref="modal" :title="tituloModal" @ok="salvarUsuarioEquipamento" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Usuário">
               <b-overlay :show="overlayUsuariosCadastro" rounded="sm">
                  <v-select v-model="objNovoUsuarioEquipamento.id_usuario" :options="optionsUsuariosCadastro" :state="validate('id_usuario')" :reduce="(usuario) => usuario.value" :class="{ 'border-danger': validate('id_usuario') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_usuario'] | parseErros }}</small>
               </b-overlay>
            </b-form-group>
            <b-form-group label="Pessoa">
               <b-overlay :show="overlayPessoas" rounded="sm">
                  <v-select v-model="objNovoUsuarioEquipamento.id_pessoa" :options="optionsPessoas" :state="validate('id_pessoa')" :reduce="(pessoa) => pessoa.value" :class="{ 'border-danger': validate('id_pessoa') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['id_pessoa'] | parseErros }}</small>
               </b-overlay>
            </b-form-group>
            <b-form-group label="Equipamentos">
               <b-overlay :show="overlayEquipamentos" rounded="sm">
                  <v-select multiple v-model="objNovoUsuarioEquipamento.id_equipamento" :options="optionsEquipamentos" :state="validate('id_equipamento')" :reduce="(equipamento) => equipamento.value" :class="{ 'border-danger': validate('id_equipamento') == false }" :disabled="!this.optionsEquipamentos" v-b-tooltip.hover :title="titleEquipamento">
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
import { usuarioEquipamentoService } from '../services'

export default {
   name: 'CadastroUsuarioEquipamento',
   data() {
      return {
         id_usuario: 'null',
         overlayUsuarios: false,
         overlayUsuariosCadastro: false,
         overlayPessoas: false,
         overlayEquipamentos: false,
         usuario: [],
         usuarioCadastro: [],
         pessoa: [],
         equipamento: [],
         filter: null,
         tituloModal: '',
         selecionado: [],
         isBusy: false,
         isSalvando: false,
         items: [],
         objNovoUsuarioEquipamento: {},
         erros: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         fields: [
            { key: 'pessoa', label: 'Pessoa (Física/Jurídica)' },
            { key: 'cnpj', label: 'CPF/CNPJ' },
            { key: 'equipamentos', label: 'Equipamentos' },
            { key: 'excluir', label: 'Excluir' }
         ],
         fieldsDetalhe: [
            { key: 'nco', label: 'NCO' },
            { key: 'nr_serie_equipamento', label: 'Nr. Série' },
            { key: 'ds_equipamento', label: 'Descrição' },
            { key: 'tp_equipamento', label: 'Tipo' },
            { key: 'dt_fabricacao', label: 'Fabricação', formatter: 'formatarData' },
            { key: 'excluir', label: 'Excluir' }
         ]
      }
   },

   computed: {
      cnpjFormatado() {
         return this.items.map((item) => {
            return item.natureza === 'J' ? this.formatarCnpj(item.cnpj) : this.formatarCpf(item.cpf)
         })
      },
      titleEquipamento() {
         if (!this.objNovoUsuarioEquipamento.id_pessoa) {
            return 'Selecione uma pessoa'
         } else if (!this.optionsEquipamentos) {
            return 'A pessoa selecionada não possui equipamentos associados'
         }
         return ''
      },
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
      optionsUsuarios() {
         const options = [
            {
               value: 'null',
               label: 'Selecione um usuário'
            }
         ]
         return options.concat(
            this.usuario.map((usuario) => ({
               value: usuario.usuario.id_usuario,
               label: usuario.usuario.nm_usuario + ' | ' + usuario.usuario.email
            }))
         )
      },
      optionsUsuariosCadastro() {
         if (!this.usuarioCadastro.length) {
            return
         }
         return this.usuarioCadastro.map((usuarioCadastro) => ({
            value: usuarioCadastro.id_usuario,
            label: usuarioCadastro.nm_usuario + ' | ' + usuarioCadastro.email
         }))
      },
      optionsPessoas() {
         if (!this.pessoa.length) {
            return
         }
         return this.pessoa.map((pessoa) => ({
            value: pessoa.id_pessoa,
            label: pessoa.natureza == 'J' ? pessoa.nm_fantasia + ' | ' + pessoa.cnpj : pessoa.nm_pessoa + ' | ' + pessoa.cpf
         }))
      },
      optionsEquipamentos() {
         if (!this.equipamento.length) {
            return
         }
         return this.equipamento.map((equipamento) => ({
            value: equipamento.id_equipamento,
            label: equipamento.ds_equipamento
         }))
      }
   },

   methods: {
      formatarCnpj(value) {
         if (!value) return '—'
         return this.$options.filters.VMask(value, '##.###.###/####-##')
      },
      formatarCpf(value) {
         if (!value) return '—'
         return this.$options.filters.VMask(value, '###.###.###-##')
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD').format('DD/MM/YYYY')
      },
      formatarTpEquipamento(value) {
         if (value === 'MA') return 'Master'
         if (value === 'SL') return 'Slave'
         if (value === 'MS') return 'Master/Slave'
         return value
      },
      formNovo() {
         this.erros = []
         this.objNovoUsuarioEquipamento = {
            id_usuario: this.id_usuario
         }
         this.tituloModal = 'Cadastrar Usuário Equipamento'
         this.$bvModal.show('cadastro')
      },
      async salvarUsuarioEquipamento(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await usuarioEquipamentoService.salvarUsuarioEquipamento(this.objNovoUsuarioEquipamento)
         switch (status) {
            case 200:
               msg = 'Registro editado com sucesso!'
               break
            case 201:
               msg = 'Registro criado com sucesso!'
               break
            case 204:
               msg = 'Registro já associado!'
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
            this.id_usuario = data.id_usuario
            this.buscarUsuarios()
            this.buscar()
            this.$nextTick(() => {
               this.$bvModal.hide('cadastro')
            })
         }
      },
      async buscar() {
         this.isBusy = true
         const dados = await client.get(`/usuario_equipamento/${this.id_usuario}`).catch((err) => {
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
         this.items = dados.data.pessoas
         this.totalRows = this.items.length
      },
      async buscarUsuarios() {
         this.overlayUsuarios = true
         const dados = await client.get('/usuario_equipamento/buscarusuario').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar usuários. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayUsuarios = false
         this.usuario = dados.data
      },
      async buscarUsuariosCadastro() {
         this.overlayUsuariosCadastro = true
         const dados = await client.get('/usuario/buscarusuario').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar usuários. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayUsuariosCadastro = false
         this.usuarioCadastro = dados.data
      },
      async buscarPessoas() {
         this.overlayPessoas = true
         const dados = await client.get('/pessoa/buscarpessoa').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar pessoas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayPessoas = false
         this.pessoa = dados.data
      },
      async buscarEquipamentos() {
         this.overlayEquipamentos = true
         const dados = await client.get(`/equipamento/buscarequipamento?id_pessoa=${this.objNovoUsuarioEquipamento.id_pessoa}`).catch((err) => {
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
         const id_equipamento = this.itemSelecionado.pessoas_equipamentos.map((alarmes) => alarmes.id_equipamento)
         const id_usuario = this.itemSelecionado.pivot.id_usuario
         this.objNovoUsuarioEquipamento = { ...this.itemSelecionado, id_equipamento, id_usuario }
         this.erros = []
         this.tituloModal = 'Editar Usuário Equipamento'
         this.$bvModal.show('cadastro')
      },
      async excluirEquipamento(row) {
         this.$set(row.item, 'excluindo', true)
         const id_usuario = this.id_usuario
         let payload = {
            id_usuario: id_usuario,
            id_pessoa: row.item.id_pessoa,
            id_equipamento: row.item.id_equipamento
         }
         payload = JSON.stringify(payload)
         const result = await client.post('/usuario_equipamento/excluir_equipamento', payload)

         if (result.data == true) {
            this.showMessage({
               title: 'Equipamento',
               msg: 'Excluído com sucesso',
               variant: 'success'
            })
         }
         this.$set(row.item, 'excluindo', false)
         this.buscar()
      },
      async excluirPessoa(row) {
         this.$set(row.item, 'excluindo', true)
         const id_usuario = this.id_usuario
         let payload = {
            id_usuario: id_usuario,
            id_pessoa: row.item.id_pessoa
         }
         payload = JSON.stringify(payload)
         const result = await client.post('/usuario_equipamento/excluir_pessoa', payload)

         if (result.data == true) {
            this.showMessage({
               title: 'Pessoa',
               msg: 'Excluída com sucesso',
               variant: 'success'
            })
         } else if (result.status == 204) {
            this.showMessage({
               title: 'Pessoa',
               msg: 'Não é possível excluir esta pessoa, há equipamentos associados',
               variant: 'danger'
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
      confirmarExclusaoEquipamento(row) {
         this.$set(row.item, 'popover', !row.item.popover)
      },
      confirmarExclusaoPessoa(row) {
         this.$set(row.item, 'popover', !row.item.popover)
      },
      resetModal() {
         this.objNovoUsuarioEquipamento = {}
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
      id_usuario(newValue) {
         if (newValue && newValue != 'null') {
            this.objNovoUsuarioEquipamento.id_usuario = newValue
            this.buscar()
         }
      },
      'objNovoUsuarioEquipamento.id_pessoa'(newValue) {
         if (newValue) {
            this.buscarEquipamentos()
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
      this.buscarUsuarios()
      this.buscarUsuariosCadastro()
      this.buscarPessoas()
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