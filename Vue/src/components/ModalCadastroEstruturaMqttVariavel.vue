<template>
   <b-modal id="cadastro" :title="tituloModal" @ok="salvarEstruturaMqttVariavel" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
      <form>
         <b-form-group label="Tópico">
            <b-overlay :show="overlayEstruturasMqttTopicos" rounded="sm">
               <v-select v-model="objNovaVariavelLocal.id_estrutura_mqtt_topico" :options="optionsEstruturasMqttTopicos" :state="validate('id_estrutura_mqtt_topico')" :reduce="(topico) => topico.value" :class="{ 'border-danger': validate('id_estrutura_mqtt_topico') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_estrutura_mqtt_topico'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Nome da Variável">
            <b-form-input v-model="objNovaVariavelLocal.nm_variavel" :state="validate('nm_variavel')"></b-form-input>
            <b-form-invalid-feedback id="nm_variavel">{{ erros['nm_variavel'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Tag">
            <b-form-input v-model="objNovaVariavelLocal.tag_variavel" :state="validate('tag_variavel')"></b-form-input>
            <b-form-invalid-feedback id="tag_variavel">{{ erros['tag_variavel'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Tipo">
            <b-overlay :show="overlayTpVariavel" rounded="sm">
               <v-select v-model="objNovaVariavelLocal.tp_variavel" :options="optionsTpVariavel" :state="validate('tp_variavel')" :reduce="(tipo) => tipo.value" :class="{ 'border-danger': validate('tp_variavel') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_estrutura_mqtt'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Tamanho">
            <b-form-input type="number" v-model="objNovaVariavelLocal.tamanho" :state="validate('tamanho')"></b-form-input>
            <b-form-invalid-feedback id="tamanho">{{ erros['tamanho'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Valor Mínimo">
            <b-form-input type="number" v-model="objNovaVariavelLocal.vl_min" :state="validate('vl_min')"></b-form-input>
            <b-form-invalid-feedback id="vl_min">{{ erros['vl_min'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Valor Máximo">
            <b-form-input type="number" v-model="objNovaVariavelLocal.vl_max" :state="validate('vl_max')"></b-form-input>
            <b-form-invalid-feedback id="vl_max">{{ erros['vl_max'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Escala">
            <b-form-input placeholder="Formatos: /100 *100 +100 -100" v-model="objNovaVariavelLocal.escala" :state="validate('escala')"></b-form-input>
            <b-form-invalid-feedback id="escala">{{ erros['escala'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Descrição">
            <b-form-textarea v-model="objNovaVariavelLocal.ds_variavel" :state="validate('ds_variavel')"></b-form-textarea>
            <b-form-invalid-feedback id="ds_variavel">{{ erros['ds_variavel'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Gera Alarme">
            <v-select v-model="objNovaVariavelLocal.fl_alarme" :options="optionsFlAlarme" :state="validate('fl_alarme')" :reduce="(alarme) => alarme.value" :class="{ 'border-danger': validate('fl_alarme') == false }">
               <template #no-options="">Nenhuma correspondência</template>
            </v-select>
            <small class="text-danger">{{ erros['fl_alarme'] | parseErros }}</small>
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
import { estruturaMqttVariavelService } from '../services'

export default {
   name: 'ModalCadastroEstruturaMqttVariavel',
   props: {
      objNovaVariavel: Object,
      tituloModal: String
   },
   data() {
      return {
         isSalvando: false,
         objNovaVariavelLocal: {},
         erros: [],
         overlayEstruturasMqttTopicos: false,
         overlayTpVariavel: false,
         topico: [],
         tpVariavel: [],
         optionsFlAlarme: [
            { value: 'S', label: 'Sim' },
            { value: 'N', label: 'Não' }
         ]
      }
   },

   computed: {
      optionsEstruturasMqttTopicos() {
         if (!this.topico.length) {
            return
         }
         return this.topico.map((topico) => ({
            value: topico.id_estrutura_mqtt_topico,
            label: topico.nm_topico + ' | ' + topico.estrutura_mqtt.ds_estrutura_mqtt
         }))
      },
      optionsTpVariavel() {
         if (!this.tpVariavel.length) {
            return
         }
         return this.tpVariavel.map((tpVariavel) => ({
            value: tpVariavel.cd_dominio,
            label: tpVariavel.ds_dominio
         }))
      }
   },

   methods: {
      async salvarEstruturaMqttVariavel(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await estruturaMqttVariavelService.salvarEstruturaMqttVariavel(this.objNovaVariavelLocal)
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
      async buscarEstruturasMqttTopicos() {
         this.overlayEstruturasMqttTopicos = true
         const dados = await client.get('/estrutura_mqtt_topico').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar estruturas MQTT. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEstruturasMqttTopicos = false
         this.topico = dados.data
      },
      async buscarTpVariavel() {
         this.overlayTpVariavel = true
         const dados = await client.get('/estrutura_mqtt_variavel/tpvariavel').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tipos de variáveis. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayTpVariavel = false
         this.tpVariavel = dados.data
      },
      resetModal() {
         this.objNovaVariavelLocal = {}
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
      objNovaVariavel: {
         handler(newValue) {
            this.objNovaVariavelLocal = { ...newValue }
         },
         immediate: true
      },
      'objNovaVariavelLocal.tag_variavel'(newValue) {
         if (newValue) {
            this.objNovaVariavelLocal.tag_variavel = newValue.replace(/\s/g, '').toUpperCase()
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
      this.buscarEstruturasMqttTopicos()
      this.buscarTpVariavel()
   }
}
</script>

<style scoped>
.border-danger {
   border: 1.5px solid red;
   border-radius: 4px;
}
</style>