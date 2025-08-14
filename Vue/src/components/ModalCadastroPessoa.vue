<template>
   <b-modal id="cadastroPessoa" size="xl" :title="tituloModal" @ok="salvarPessoa" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
      <form>
         <b-row>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Natureza">
                  <v-select v-model="objNovaPessoaLocal.natureza" :options="optionsNaturezas" :state="validate('natureza')" :reduce="(natureza) => natureza.value" :class="{ 'border-danger': validate('natureza') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['natureza'] | parseErros }}</small>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Tipo">
                  <b-overlay :show="overlayTpPessoas" rounded="sm">
                     <v-select v-model="objNovaPessoaLocal.tp_pessoa" :options="optionsTpPessoas" :state="validate('tp_pessoa')" :reduce="(tipo) => tipo.value" :class="{ 'border-danger': validate('tp_pessoa') == false }">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['tp_pessoa'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('J')">
               <b-form-group label="Nome Fantasia">
                  <b-form-input v-model="objNovaPessoaLocal.nm_fantasia" :state="validate('nm_fantasia')"></b-form-input>
                  <b-form-invalid-feedback id="nm_fantasia">{{ erros['nm_fantasia'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('J')">
               <b-form-group label="Razão Social">
                  <b-form-input v-model="objNovaPessoaLocal.razao_social" :state="validate('razao_social')"></b-form-input>
                  <b-form-invalid-feedback id="razao_social">{{ erros['razao_social'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('J')">
               <b-form-group label="CNPJ">
                  <b-form-input maxlength="18" v-mask="'##.###.###/####-##'" v-model="objNovaPessoaLocal.cnpj" :state="validate('cnpj')"></b-form-input>
                  <b-form-invalid-feedback id="cnpj">{{ erros['cnpj'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('J')">
               <b-form-group label="Inscrição Municipal">
                  <b-form-input type="number" v-model="objNovaPessoaLocal.inscricao_municipal" :state="validate('inscricao_municipal')"></b-form-input>
                  <b-form-invalid-feedback id="inscricao_municipal">{{ erros['inscricao_municipal'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('J')">
               <b-form-group label="Inscrição Estadual">
                  <b-input-group v-b-tooltip.hover :title="titleInscricao">
                     <b-form-select v-model="estado" :options="optionsEstados" style="max-width: 25%"></b-form-select>
                     <b-form-input :maxlength="mascaraEstado.tamanho" v-mask="mascaraEstado.mascara" v-model="objNovaPessoaLocal.inscricao_estadual" :state="validate('inscricao_estadual')" :disabled="!estado"></b-form-input>
                     <b-form-invalid-feedback id="inscricao_estadual">{{ erros['inscricao_estadual'] | parseErros }}</b-form-invalid-feedback>
                  </b-input-group>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('J')">
               <b-form-group label="Logotipo">
                  <b-form-file v-model="objNovaPessoaLocal.imagem" :state="validate('imagem')" accept="image/*" placeholder="Nenhum arquivo escolhido" browse-text="Escolher"></b-form-file>
                  <b-form-invalid-feedback id="imagem">{{ erros['imagem'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('J')">
               <b-form-group label="Tema">
                  <b-form-input type="color" placeholder="Cor no formato hexadecimal" v-model="objNovaPessoaLocal.tema" :state="validate('tema')"></b-form-input>
                  <b-form-invalid-feedback id="tema">{{ erros['tema'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('F')">
               <b-form-group label="Nome Completo">
                  <b-form-input v-model="objNovaPessoaLocal.nm_pessoa" :state="validate('nm_pessoa')"></b-form-input>
                  <b-form-invalid-feedback id="nm_pessoa">{{ erros['nm_pessoa'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('F')">
               <b-form-group label="Data de Nascimento">
                  <b-form-input maxlength="10" v-mask="'##/##/####'" v-model="objNovaPessoaLocal.dt_nascimento" :state="validate('dt_nascimento')"></b-form-input>
                  <b-form-invalid-feedback id="dt_nascimento">{{ erros['dt_nascimento'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('F')">
               <b-form-group label="Gênero">
                  <v-select v-model="objNovaPessoaLocal.genero" :options="optionsGeneros" :state="validate('genero')" :reduce="(genero) => genero.value" :class="{ 'border-danger': validate('genero') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['genero'] | parseErros }}</small>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('F')">
               <b-form-group label="RG">
                  <b-form-input maxlength="15" type="number" v-model="objNovaPessoaLocal.rg" :state="validate('rg')"></b-form-input>
                  <b-form-invalid-feedback id="rg">{{ erros['rg'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4" v-if="verificaNatureza('F')">
               <b-form-group label="CPF">
                  <b-form-input maxlength="14" v-mask="'###.###.###-##'" v-model="objNovaPessoaLocal.cpf" :state="validate('cpf')"></b-form-input>
                  <b-form-invalid-feedback id="cpf">{{ erros['cpf'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="6">
               <b-tooltip target="tooltip-pessoa">Preencha este campo caso essa pessoa seja uma filial</b-tooltip>
               <b-form-group>
                  <label class="d-flex align-items-center" for="id_pessoa_pai">
                     Matriz
                     <b-icon icon="question-circle" font-scale="1.5" class="ml-2" id="tooltip-pessoa"></b-icon>
                  </label>
                  <b-overlay :show="overlayPessoas" rounded="sm">
                     <v-select id="id_pessoa_pai" v-model="objNovaPessoaLocal.id_pessoa_pai" :options="optionsPessoas" :state="validate('id_pessoa_pai')" :reduce="(p) => p.value" :class="{ 'border-danger': validate('id_pessoa_pai') == false }">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['id_pessoa_pai'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
         </b-row>
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
</template>

<script>
import client from '@/api'
import { pessoaService } from '../services'

export default {
   name: 'ModalCadastroPessoa',
   props: {
      objNovaPessoa: Object,
      tituloModal: String
   },
   data() {
      return {
         estado: null,
         isSalvando: false,
         objNovaPessoaLocal: {},
         erros: [],
         overlayTpPessoas: false,
         overlayPessoas: false,
         tpPessoa: [],
         pessoa: [],
         optionsNaturezas: [
            { value: 'J', label: 'Jurídica' },
            { value: 'F', label: 'Física' }
         ],
         optionsGeneros: [
            { value: 'M', label: 'Masculino' },
            { value: 'F', label: 'Feminino' },
            { value: 'X', label: 'Não Informado' }
         ],
         optionsEstados: [
            { value: null, text: 'Estado' },
            { value: 'AC', text: 'AC' },
            { value: 'AL', text: 'AL' },
            { value: 'AP', text: 'AP' },
            { value: 'AM', text: 'AM' },
            { value: 'BA', text: 'BA' },
            { value: 'CE', text: 'CE' },
            { value: 'DF', text: 'DF' },
            { value: 'ES', text: 'ES' },
            { value: 'GO', text: 'GO' },
            { value: 'MA', text: 'MA' },
            { value: 'MT', text: 'MT' },
            { value: 'MS', text: 'MS' },
            { value: 'MG', text: 'MG' },
            { value: 'PA', text: 'PA' },
            { value: 'PB', text: 'PB' },
            { value: 'PR', text: 'PR' },
            { value: 'PE', text: 'PE' },
            { value: 'PI', text: 'PI' },
            { value: 'RJ', text: 'RJ' },
            { value: 'RN', text: 'RN' },
            { value: 'RS', text: 'RS' },
            { value: 'RO', text: 'RO' },
            { value: 'RR', text: 'RR' },
            { value: 'SP', text: 'SP' },
            { value: 'SC', text: 'SC' },
            { value: 'SE', text: 'SE' },
            { value: 'TO', text: 'TO' }
         ]
      }
   },

   computed: {
      titleInscricao() {
         return !this.estado ? 'Selecione um estado' : ''
      },
      mascaraEstado() {
         let mascara, tamanho
         if (this.estado === 'AC') {
            mascara = '##.###.###/###-##'
            tamanho = 17
         } else if (this.estado === 'AM') {
            mascara = '##.###.###-#'
            tamanho = 12
         } else if (this.estado === 'BA') {
            mascara = '#######-##'
            tamanho = 10
         } else if (this.estado === 'CE') {
            mascara = '########-#'
            tamanho = 10
         } else if (this.estado === 'DF') {
            mascara = '###########-##'
            tamanho = 14
         } else if (this.estado === 'ES') {
            mascara = '########-#'
            tamanho = 10
         } else if (this.estado === 'GO') {
            mascara = '##.###.###-#'
            tamanho = 12
         } else if (this.estado === 'MA') {
            mascara = '########-#'
            tamanho = 10
         } else if (this.estado === 'MT') {
            mascara = '##########-#'
            tamanho = 12
         } else if (this.estado === 'MS') {
            mascara = '########-#'
            tamanho = 10
         } else if (this.estado === 'MG') {
            mascara = '###.###.###/####'
            tamanho = 16
         } else if (this.estado === 'PA') {
            mascara = '##-######-#'
            tamanho = 11
         } else if (this.estado === 'PB') {
            mascara = '########-#'
            tamanho = 10
         } else if (this.estado === 'PR') {
            mascara = '###.#####-##'
            tamanho = 12
         } else if (this.estado === 'PE') {
            mascara = '#######-##'
            tamanho = 10
         } else if (this.estado === 'PI') {
            mascara = '########-#'
            tamanho = 10
         } else if (this.estado === 'RJ') {
            mascara = '##.###.##-#'
            tamanho = 11
         } else if (this.estado === 'RN') {
            mascara = '##.###.###-#'
            tamanho = 12
         } else if (this.estado === 'RS') {
            mascara = '###/#######'
            tamanho = 11
         } else if (this.estado === 'RO') {
            mascara = '#############-#'
            tamanho = 15
         } else if (this.estado === 'RR') {
            mascara = '########-#'
            tamanho = 10
         } else if (this.estado === 'SP') {
            mascara = '###.###.###.###'
            tamanho = 15
         } else if (this.estado === 'SC') {
            mascara = '###.###.###'
            tamanho = 11
         } else if (this.estado === 'SE') {
            mascara = '########-#'
            tamanho = 10
         }
         return { mascara, tamanho }
      },
      optionsTpPessoas() {
         if (!this.tpPessoa.length) {
            return
         }
         return this.tpPessoa.map((tpPessoa) => ({
            value: tpPessoa.cd_dominio,
            label: tpPessoa.ds_dominio
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
      }
   },

   methods: {
      removeFormatacao(value) {
         if (!value) return
         return value.replace(/\D/g, '')
      },
      verificaNatureza(natureza) {
         return this.objNovaPessoaLocal.natureza == natureza || this.objNovaPessoaLocal.natureza == null
      },
      async salvarPessoa(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         let dt_nascimento
         const cnpj = this.removeFormatacao(this.objNovaPessoaLocal.cnpj) || null
         const inscricao_estadual = this.removeFormatacao(this.objNovaPessoaLocal.inscricao_estadual)
         const cpf = this.removeFormatacao(this.objNovaPessoaLocal.cpf)
         let pessoaData = { ...this.objNovaPessoaLocal }
         if (cnpj) {
            pessoaData.cnpj = cnpj
         }
         if (cpf) {
            pessoaData.cpf = cpf
         }
         if (this.objNovaPessoaLocal.dt_nascimento) {
            dt_nascimento = this.$moment(this.objNovaPessoaLocal.dt_nascimento, 'DD/MM/YYYY')
            dt_nascimento = dt_nascimento.format('YYYY-MM-DD')
            pessoaData.dt_nascimento = dt_nascimento
         }
         if (inscricao_estadual) {
            pessoaData.inscricao_estadual = inscricao_estadual
         }
         if (pessoaData.natureza == 'F') {
            delete pessoaData.nm_fantasia
            delete pessoaData.razao_social
            delete pessoaData.cnpj
            delete pessoaData.inscricao_municipal
            delete pessoaData.inscricao_estadual
            delete pessoaData.logo
            delete pessoaData.tema
         }
         if (pessoaData.natureza == 'J') {
            delete pessoaData.nm_pessoa
            delete pessoaData.dt_nascimento
            delete pessoaData.genero
            delete pessoaData.rg
            delete pessoaData.cpf
         }
         const { status, data } = await pessoaService.salvarPessoa(pessoaData)
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
            this.$emit('buscar')
            this.$nextTick(() => {
               this.$bvModal.hide('cadastroPessoa')
            })
         }
      },
      resetModal() {
         this.objNovaPessoaLocal = {}
         this.erros = []
      },
      async buscarTpPessoas() {
         this.overlayTpPessoas = true
         const dados = await client.get('/pessoa/tppessoa').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tipos de pessoas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayTpPessoas = false
         this.tpPessoa = dados.data
      },
      async buscarPessoas() {
         this.overlayPessoas = true
         const dados = await client.get('/pessoa').catch((err) => {
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
      validate(prop) {
         const keys = Object.keys(this.erros)
         if (keys.includes(prop)) {
            return false
         }
      }
   },

   watch: {
      objNovaPessoa: {
         handler(newVal) {
            this.objNovaPessoaLocal = { ...newVal }
         },
         immediate: true
      }
   },

   filters: {
      parseErros(v) {
         if (!v) return
         return v.join(', ')
      }
   },

   mounted() {
      this.buscarTpPessoas()
      this.buscarPessoas()
   }
}
</script>

<style scoped>
.border-danger {
   border: 1.5px solid red;
   border-radius: 4px;
}
</style>