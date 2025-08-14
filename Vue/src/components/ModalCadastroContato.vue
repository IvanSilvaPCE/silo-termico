<template>
   <b-modal id="cadastro-contato" :title="tituloModal" @ok="salvarContato" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
      <form>
         <b-form-group label="Tipo do Contato">
            <v-select v-model="objNovoContatoLocal.tp_contato" :options="optionsTpContato" :state="validate('tp_contato')" :reduce="(tipo) => tipo.value" :class="{ 'border-danger': validate('tp_contato') == false }">
               <template #no-options="">Nenhuma correspondência</template>
            </v-select>
            <small class="text-danger">{{ erros['tp_contato'] | parseErros }}</small>
         </b-form-group>
         <b-form-group label="Nome">
            <b-form-input v-model="objNovoContatoLocal.nm_contato" :state="validate('nm_contato')"></b-form-input>
            <b-form-invalid-feedback id="nm_contato">{{ erros['nm_contato'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Vínculo">
            <b-form-input placeholder="Ex.: Gerente" v-model="objNovoContatoLocal.vinculo" :state="validate('vinculo')"></b-form-input>
            <b-form-invalid-feedback id="vinculo">{{ erros['vinculo'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Telefone">
            <b-form-input v-mask="'(##) ####-####'" maxlength="14" placeholder="(##) ####-####" v-model="objNovoContatoLocal.telefone" :state="validate('telefone')"></b-form-input>
            <b-form-invalid-feedback id="telefone">{{ erros['telefone'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Ramal">
            <b-form-input type="number" v-model="objNovoContatoLocal.ramal" :state="validate('ramal')"></b-form-input>
            <b-form-invalid-feedback id="ramal">{{ erros['ramal'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Celular">
            <b-form-input v-mask="'(##) #####-####'" maxlength="15" placeholder="(##) #####-####" v-model="objNovoContatoLocal.celular" :state="validate('celular')"></b-form-input>
            <b-form-invalid-feedback id="celular">{{ erros['celular'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="E-mail">
            <b-form-input v-model="objNovoContatoLocal.email" :state="validate('email')"></b-form-input>
            <b-form-invalid-feedback id="email">{{ erros['email'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Pessoa (Física/Jurídica)">
            <b-overlay :show="overlayPessoas" rounded="sm">
               <v-select v-model="objNovoContatoLocal.id_pessoa" :options="optionsPessoas" :state="validate('id_pessoa')" :reduce="(pessoa) => pessoa.value" :class="{ 'border-danger': validate('id_pessoa') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_pessoa'] | parseErros }}</small>
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
</template>

<script>
import client from '@/api'
import { contatoService } from '../services'

export default {
   name: 'ModalCadastroContato',
   props: {
      objNovoContato: Object,
      tituloModal: String
   },
   data() {
      return {
         isSalvando: false,
         objNovoContatoLocal: {},
         erros: [],
         overlayPessoas: false,
         pessoa: [],
         optionsTpContato: [
            { value: 'P', label: 'Principal' },
            { value: 'S', label: 'Secundário' }
         ]
      }
   },

   computed: {
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
      async salvarContato(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const telefone = this.removeFormatacao(this.objNovoContatoLocal.telefone)
         const celular = this.removeFormatacao(this.objNovoContatoLocal.celular)
         const { status, data } = await contatoService.salvarContato({ ...this.objNovoContatoLocal, telefone, celular })
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
         this.objNovoContatoLocal = {}
         this.erros = []
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
      objNovoContato: {
         handler(newVal) {
            this.objNovoContatoLocal = { ...newVal }
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