<template>
   <b-modal id="cadastro-equipamento" size="xl" :title="tituloModal" @ok="salvarEquipamento" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
      <form>
         <b-row>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="NCO *">
                  <b-input-group prepend="NCO">
                     <b-form-input type="number" v-model="objNovoEquipamentoLocal.nco" :state="validate('nco')" :disabled="!verificarPerfilOperacao(['ADMINPORTA'])"></b-form-input>
                     <b-form-invalid-feedback id="nco">{{ erros['nco'] | parseErros }}</b-form-invalid-feedback>
                  </b-input-group>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Descrição *">
                  <b-form-input v-model="objNovoEquipamentoLocal.ds_equipamento" :state="validate('ds_equipamento')"></b-form-input>
                  <b-form-invalid-feedback id="ds_equipamento">{{ erros['ds_equipamento'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Número de Série *">
                  <b-form-input v-model="objNovoEquipamentoLocal.nr_serie_equipamento" :state="validate('nr_serie_equipamento')" :disabled="!verificarPerfilOperacao(['ADMINPORTA'])"></b-form-input>
                  <b-form-invalid-feedback id="nr_serie_equipamento">{{ erros['nr_serie_equipamento'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Categoria *">
                  <b-overlay :show="overlayCategorias" rounded="sm">
                     <v-select v-model="objNovoEquipamentoLocal.id_categoria_equipamento" :options="optionsCategorias" :state="validate('id_categoria_equipamento')" :reduce="(categoria) => categoria.value" :class="{ 'border-danger': validate('id_categoria_equipamento') == false }" :disabled="!verificarPerfilOperacao(['ADMINPORTA'])">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['id_categoria_equipamento'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Data de Fabricação *">
                  <b-form-datepicker :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" v-model="objNovoEquipamentoLocal.dt_fabricacao" :state="validate('dt_fabricacao')" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada" :disabled="!verificarPerfilOperacao(['ADMINPORTA'])"></b-form-datepicker>
                  <b-form-invalid-feedback id="dt_fabricacao">{{ erros['dt_fabricacao'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Data de Garantia">
                  <b-form-datepicker :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" v-model="objNovoEquipamentoLocal.dt_garantia_pce" :state="validate('dt_garantia_pce')" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada" :disabled="!verificarPerfilOperacao(['ADMINPORTA'])"></b-form-datepicker>
                  <b-form-invalid-feedback id="dt_garantia_pce">{{ erros['dt_garantia_pce'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Status *">
                  <b-overlay :show="overlayStOperacoes" rounded="sm">
                     <v-select v-model="objNovoEquipamentoLocal.st_operacao" :options="optionsStOperacoes" :state="validate('st_operacao')" :reduce="(status) => status.value" :class="{ 'border-danger': validate('st_operacao') == false }">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['st_operacao'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Tipo *">
                  <v-select v-model="objNovoEquipamentoLocal.tp_equipamento" :options="optionsTpEquipamento" :state="validate('tp_equipamento')" :reduce="(tipo) => tipo.value" :class="{ 'border-danger': validate('tp_equipamento') == false }" :disabled="!verificarPerfilOperacao(['ADMINPORTA'])">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['tp_equipamento'] | parseErros }}</small>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="objNovoEquipamentoLocal.tp_equipamento == 'SL' || objNovoEquipamentoLocal.tp_equipamento == 'MS'">
               <b-form-group label="Equipamento Master">
                  <b-overlay :show="overlayEquipamentos" rounded="sm">
                     <v-select v-model="objNovoEquipamentoLocal.id_equipamento_pai" :options="optionsEquipamentos" :state="validate('id_equipamento_pai')" :reduce="(equipamento) => equipamento.value" :class="{ 'border-danger': validate('id_equipamento_pai') == false }" :disabled="!verificarPerfilOperacao(['ADMINPORTA'])">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['id_equipamento_pai'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Produto">
                  <b-overlay :show="overlayProdutos" rounded="sm">
                     <v-select v-model="objNovoEquipamentoLocal.id_produto" :options="optionsProdutos" :state="validate('id_produto')" :reduce="(produto) => produto.value" :class="{ 'border-danger': validate('id_produto') == false }" :disabled="!verificarPerfilOperacao(['ADMINPORTA'])">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['id_produto'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Fabricante">
                  <b-overlay :show="overlayPessoas" rounded="sm">
                     <v-select v-model="objNovoEquipamentoLocal.id_fabricante" :options="optionsFabricantes" :state="validate('id_fabricante')" :reduce="(fabricante) => fabricante.value" :class="{ 'border-danger': validate('id_fabricante') == false }" :disabled="!verificarPerfilOperacao(['ADMINPORTA'])">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['id_fabricante'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Cliente">
                  <b-overlay :show="overlayPessoas" rounded="sm">
                     <v-select v-model="objNovoEquipamentoLocal.id_pessoa" :options="optionsClientes" :state="validate('id_pessoa')" :reduce="(cliente) => cliente.value" :class="{ 'border-danger': validate('id_pessoa') == false }">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['id_pessoa'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Equipamento de Terceiro *">
                  <v-select v-model="objNovoEquipamentoLocal.fl_terceiro" :options="optionsFlTerceiro" :state="validate('fl_terceiro')" :reduce="(terceiro) => terceiro.value" :class="{ 'border-danger': validate('fl_terceiro') == false }" :disabled="!verificarPerfilOperacao(['ADMINPORTA'])">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['fl_terceiro'] | parseErros }}</small>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Responsável">
                  <b-overlay :show="overlayUsuarios" rounded="sm">
                     <v-select v-model="objNovoEquipamentoLocal.id_usuario_resp" :options="optionsUsuarios" :state="validate('id_usuario_resp')" :reduce="(usuario) => usuario.value" :class="{ 'border-danger': validate('id_usuario_resp') == false }">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['id_usuario_resp'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
         </b-row>
      </form>
      <b-row>
         <b-col cols="12">
            <p>* campos obrigatórios</p>
         </b-col>
      </b-row>
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
</template>

<script>
import client from '@/api'
import { equipamentoService } from '../services'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'ModalCadastroEquipamento',
   props: {
      objNovoEquipamento: Object,
      tituloModal: String
   },
   data() {
      return {
         isSalvando: false,
         objNovoEquipamentoLocal: {},
         erros: [],
         overlayCategorias: false,
         overlayStOperacoes: false,
         overlayEquipamentos: false,
         overlayProdutos: false,
         overlayPessoas: false,
         overlayUsuarios: false,
         categoria: [],
         stOperacao: [],
         equipamento: [],
         produto: [],
         pessoa: [],
         usuario: [],
         optionsTpEquipamento: [
            { value: 'MA', label: 'Master' },
            { value: 'SL', label: 'Slave' },
            { value: 'MS', label: 'Master/Slave' }
         ],
         optionsFlTerceiro: [
            { value: 'S', label: 'Sim' },
            { value: 'N', label: 'Não' }
         ]
      }
   },

   computed: {
      optionsCategorias() {
         if (!this.categoria.length) {
            return
         }
         return this.categoria.map((categoria) => ({
            value: categoria.id_categoria_equipamento,
            label: categoria.ds_categoria_equipamento
         }))
      },
      optionsStOperacoes() {
         if (!this.stOperacao.length) {
            return
         }
         return this.stOperacao.map((stOperacao) => ({
            value: stOperacao.cd_dominio,
            label: stOperacao.ds_dominio
         }))
      },
      optionsEquipamentos() {
         if (!this.equipamento.length) {
            return
         }
         return this.equipamento
            .filter((equipamento) => equipamento.tp_equipamento === 'MA' || equipamento.tp_equipamento === 'MS')
            .map((equipamento) => ({
               value: equipamento.id_equipamento,
               label: equipamento.ds_equipamento + ' | ' + (equipamento?.cliente?.natureza == 'J' ? equipamento?.cliente?.nm_fantasia : equipamento?.cliente?.nm_pessoa)
            }))
      },
      optionsProdutos() {
         if (!this.produto.length) {
            return
         }
         return this.produto.map((produto) => ({
            value: produto.id_produto,
            label: produto.nm_produto
         }))
      },
      optionsFabricantes() {
         return this.pessoa
            .filter((pessoa) => pessoa.tp_pessoa === 'FA')
            .map((pessoa) => ({
               value: pessoa.id_pessoa,
               label: pessoa.nm_fantasia + ' | ' + pessoa.cnpj
            }))
      },
      optionsClientes() {
         return this.pessoa
            .filter((pessoa) => pessoa.tp_pessoa === 'MA' || pessoa.tp_pessoa === 'UN' || pessoa.tp_pessoa === 'PR')
            .map((pessoa) => ({
               value: pessoa.id_pessoa,
               label: pessoa.natureza == 'J' ? pessoa.nm_fantasia + ' | ' + pessoa.cnpj : pessoa.nm_pessoa + ' | ' + pessoa.cpf
            }))
      },
      optionsUsuarios() {
         if (!this.usuario.length) {
            return
         }
         return this.usuario.map((usuario) => ({
            value: usuario.id_usuario,
            label: usuario.nm_usuario
         }))
      }
   },

   methods: {
      async salvarEquipamento(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         this.objNovoEquipamentoLocal.st_equipamento = 'A'
         if (this.objNovoEquipamentoLocal.st_operacao == 'EC') {
            this.objNovoEquipamentoLocal.st_equipamento = 'C'
         }
         const { status, data } = await equipamentoService.salvarEquipamento(this.objNovoEquipamentoLocal)
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
            this.buscarEquipamentos()
            this.$emit('buscar')
            this.$nextTick(() => {
               this.$bvModal.hide('cadastro-equipamento')
            })
         }
      },
      resetModal() {
         this.objNovoEquipamentoLocal = {}
         this.erros = []
      },
      async buscarStOperacoes() {
         this.overlayStOperacoes = true
         const dados = await client.get('/equipamento/stoperacao').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar criticidades. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayStOperacoes = false
         this.stOperacao = dados.data
      },
      async buscarCategorias() {
         this.overlayCategorias = true
         const dados = await client.get('/categoria_equipamento').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar categorias de equipamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayCategorias = false
         this.categoria = dados.data
      },
      async buscarEquipamentos() {
         this.overlayEquipamentos = true
         const dados = await client.get('/equipamento/buscarequipamento').catch((err) => {
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
      async buscarProdutos() {
         this.overlayProdutos = true
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
         this.overlayProdutos = false
         this.produto = dados.data
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
      async buscarUsuarios() {
         this.overlayUsuarios = true
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
         this.overlayUsuarios = false
         this.usuario = dados.data
      },
      validate(prop) {
         const keys = Object.keys(this.erros)
         if (keys.includes(prop)) {
            return false
         }
      },
      verificarPerfilOperacao
   },

   watch: {
      objNovoEquipamento: {
         handler(newVal) {
            this.objNovoEquipamentoLocal = { ...newVal }
         },
         immediate: true
      },
      'objNovoEquipamentoLocal.id_fabricante'(newValue) {
         if (newValue) {
            const currentDateTime = this.$moment().format('YYYY-MM-DD HH:mm:ss')
            this.objNovoEquipamentoLocal.dt_vinculo_fabricante = currentDateTime
         }
      },
      'objNovoEquipamentoLocal.id_pessoa'(newValue) {
         if (newValue) {
            const currentDateTime = this.$moment().format('YYYY-MM-DD HH:mm:ss')
            this.objNovoEquipamentoLocal.dt_vinculo_pessoa = currentDateTime
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
      this.buscarCategorias()
      this.buscarStOperacoes()
      this.buscarEquipamentos()
      this.buscarProdutos()
      this.buscarPessoas()
      this.buscarUsuarios()
   }
}
</script>

<style scoped>
.border-danger {
   border: 1.5px solid red;
   border-radius: 4px;
}
</style>