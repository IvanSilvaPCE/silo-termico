<template>
   <b-modal id="cadastro" size="xl" :title="tituloModal" @ok="salvarEndereco" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
      <form>
         <b-row>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Tipo do Endereço">
                  <b-overlay :show="overlayTpEnderecos" rounded="sm">
                     <v-select v-model="objNovoEnderecoLocal.tp_endereco" :options="optionsTpEnderecos" :state="validate('tp_endereco')" :reduce="(tpendereco) => tpendereco.value" :class="{ 'border-danger': validate('tp_endereco') == false }">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['tp_endereco'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Logradouro">
                  <b-form-input v-model="objNovoEnderecoLocal.logradouro" :state="validate('logradouro')"></b-form-input>
                  <b-form-invalid-feedback id="logradouro">{{ erros['logradouro'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Número">
                  <b-form-input type="number" v-model="objNovoEnderecoLocal.numero" :state="validate('numero')"></b-form-input>
                  <b-form-invalid-feedback id="numero">{{ erros['numero'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Complemento">
                  <b-form-input v-model="objNovoEnderecoLocal.complemento" :state="validate('complemento')"></b-form-input>
                  <b-form-invalid-feedback id="complemento">{{ erros['complemento'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Bairro">
                  <b-form-input v-model="objNovoEnderecoLocal.bairro" :state="validate('bairro')"></b-form-input>
                  <b-form-invalid-feedback id="bairro">{{ erros['bairro'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="CEP">
                  <b-form-input maxlength="9" v-mask="'#####-###'" v-model="objNovoEnderecoLocal.cep" :state="validate('cep')"></b-form-input>
                  <b-form-invalid-feedback id="cep">{{ erros['cep'] | parseErros }}</b-form-invalid-feedback>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="UF">
                  <b-overlay :show="overlayUfs" rounded="sm">
                     <v-select v-model="objNovoEnderecoLocal.id_uf" :options="optionsUfs" :state="validate('id_uf')" :reduce="(uf) => uf.value" :class="{ 'border-danger': validate('id_uf') == false }">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['id_uf'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="Cidade">
                  <b-overlay :show="overlayCidades" rounded="sm">
                     <v-select v-model="objNovoEnderecoLocal.id_cidade" :options="optionsCidades" :state="validate('id_cidade')" :reduce="(cidade) => cidade.value" :class="{ 'border-danger': validate('id_cidade') == false }" :disabled="!objNovoEnderecoLocal.id_uf" v-b-tooltip.hover :title="titleCidade">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['id_cidade'] | parseErros }}</small>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="4">
               <b-form-group label="País">
                  <v-select disabled v-model="objNovoEnderecoLocal.nm_pais" :state="validate('nm_pais')" :class="{ 'border-danger': validate('nm_pais') == false }">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
                  <small class="text-danger">{{ erros['nm_pais'] | parseErros }}</small>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="6">
               <b-form-group label="Pessoa (Física/Jurídica)">
                  <b-overlay :show="overlayPessoas" rounded="sm">
                     <v-select v-model="objNovoEnderecoLocal.id_pessoa" :options="optionsPessoas" :state="validate('id_pessoa')" :reduce="(p) => p.value" :class="{ 'border-danger': validate('id_pessoa') == false }">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                     <small class="text-danger">{{ erros['id_pessoa'] | parseErros }}</small>
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
import { enderecoService } from '../services'

export default {
   name: 'ModalCadastroEndereco',
   props: {
      objNovoEndereco: Object,
      tituloModal: String
   },
   data() {
      return {
         isSalvando: false,
         objNovoEnderecoLocal: {},
         erros: [],
         overlayTpEnderecos: false,
         overlayUfs: false,
         overlayCidades: false,
         overlayPessoas: false,
         tpEndereco: [],
         uf: [],
         cidade: [],
         pessoa: []
      }
   },

   computed: {
      titleCidade() {
         return !this.objNovoEnderecoLocal.id_uf ? 'Selecione uma UF' : ''
      },
      optionsTpEnderecos() {
         if (!this.tpEndereco.length) {
            return
         }
         return this.tpEndereco.map((tpEndereco) => ({
            value: tpEndereco.cd_dominio,
            label: tpEndereco.ds_dominio
         }))
      },
      optionsUfs() {
         if (!this.uf.length) {
            return
         }
         return this.uf.map((uf) => ({
            value: uf.id_uf,
            label: uf.nm_uf + ' | ' + uf.pais.nm_pais,
            sigla_uf: uf.sigla_uf,
            id_pais: uf.pais.id_pais,
            nm_pais: uf.pais.nm_pais
         }))
      },
      optionsCidades() {
         if (!this.cidade.length) {
            return
         }
         return this.cidade.map((cidade) => ({
            value: cidade.id_cidade,
            label: cidade.nm_cidade
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
      async salvarEndereco(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const cep = this.removeFormatacao(this.objNovoEnderecoLocal.cep)
         const { status, data } = await enderecoService.salvarEndereco({ ...this.objNovoEnderecoLocal, cep })
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
               this.$bvModal.hide('cadastro')
            })
         }
      },
      resetModal() {
         this.objNovoEnderecoLocal = {}
         this.erros = []
      },
      async buscarTpEnderecos() {
         this.overlayTpEnderecos = true
         const dados = await client.get('/endereco/tpendereco').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tipos de endereços. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayTpEnderecos = false
         this.tpEndereco = dados.data
      },
      async buscarUfs() {
         this.overlayUfs = true
         const dados = await client.get('/uf').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar UFs. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayUfs = false
         this.uf = dados.data
      },
      async buscarCidades(pais) {
         this.overlayCidades = true
         const dados = await client.get(`/cidade/buscarcidade?uf=${pais}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar cidades. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayCidades = false
         this.cidade = dados.data
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
      objNovoEndereco: {
         handler(newVal) {
            this.objNovoEnderecoLocal = { ...newVal }
         },
         immediate: true
      },
      'objNovoEnderecoLocal.id_uf'(newValue) {
         if (newValue) {
            this.buscarCidades(newValue)
            if (this.optionsUfs) {
               const selectedOption = this.optionsUfs.find((option) => option.value === newValue)
               if (selectedOption) {
                  this.objNovoEnderecoLocal.sigla_uf = selectedOption.sigla_uf
                  this.objNovoEnderecoLocal.id_pais = selectedOption.id_pais
                  this.objNovoEnderecoLocal.nm_pais = selectedOption.nm_pais
               }
            }
         }
      },
      'objNovoEnderecoLocal.id_cidade'(newValue) {
         if (this.optionsCidades) {
            const selectedOption = this.optionsCidades.find((option) => option.value === newValue)
            if (selectedOption) {
               this.objNovoEnderecoLocal.nm_cidade = selectedOption.label
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
      this.buscarTpEnderecos()
      this.buscarUfs()
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