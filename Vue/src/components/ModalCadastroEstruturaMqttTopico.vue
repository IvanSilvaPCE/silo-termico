<template>
   <b-modal id="cadastro" :title="tituloModal" @ok="salvarEstruturaMqttTopico" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
      <form>
         <b-form-group label="Estrutura">
            <b-overlay :show="overlayEstruturasMqtt" rounded="sm">
               <v-select v-model="objNovoTopicoLocal.id_estrutura_mqtt" :options="optionsEstruturasMqtt" :state="validate('id_estrutura_mqtt')" :reduce="(estrutura) => estrutura.value" :class="{ 'border-danger': validate('id_estrutura_mqtt') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_estrutura_mqtt'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Número">
            <b-form-input type="number" v-model="objNovoTopicoLocal.nr_topico" :state="validate('nr_topico')"></b-form-input>
            <b-form-invalid-feedback id="nr_topico">{{ erros['nr_topico'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Nome">
            <b-form-input v-model="objNovoTopicoLocal.nm_topico" :state="validate('nm_topico')"></b-form-input>
            <b-form-invalid-feedback id="nm_topico">{{ erros['nm_topico'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Tempo de Atualização">
            <b-form-input type="number" placeholder="Valor em segundos" v-model="objNovoTopicoLocal.nr_segundos_atu" :state="validate('nr_segundos_atu')"></b-form-input>
            <b-form-invalid-feedback id="nr_segundos_atu">{{ erros['nr_segundos_atu'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Descrição">
            <b-form-textarea v-model="objNovoTopicoLocal.ds_topico" :state="validate('ds_topico')"></b-form-textarea>
            <b-form-invalid-feedback id="ds_topico">{{ erros['ds_topico'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Tipo">
            <b-overlay :show="overlayTpTopicos" rounded="sm">
               <v-select v-model="objNovoTopicoLocal.tp_topico" :options="optionsTpTopicos" :state="validate('tp_topico')" :reduce="(topico) => topico.value" :class="{ 'border-danger': validate('tp_topico') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['tp_topico'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Tempos de Atualização Adicionais">
            <b-overlay :show="overlayEstruturaMqttAtu" rounded="sm">
               <v-select multiple v-model="objNovoTopicoLocal.id_estrutura_mqtt_atu" :options="optionsEstruturaMqttAtu" :state="validate('id_estrutura_mqtt_atu')" :reduce="(atualizacao) => atualizacao.value" :class="{ 'border-danger': validate('id_estrutura_mqtt_atu') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_estrutura_mqtt_atu'] | parseErros }}</small>
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
import { estruturaMqttTopicoService } from '../services'

export default {
   name: 'ModalCadastroEstruturaMqttTopico',
   props: {
      objNovoTopico: Object,
      tituloModal: String
   },
   data() {
      return {
         isSalvando: false,
         objNovoTopicoLocal: {},
         erros: [],
         overlayEstruturaMqttAtu: false,
         overlayEstruturasMqtt: false,
         overlayTpTopicos: false,
         estrutura: [],
         topico: [],
         estruturaMqttAtu: []
      }
   },

   computed: {
      optionsEstruturasMqtt() {
         if (!this.estrutura.length) {
            return
         }
         return this.estrutura.map((estrutura) => ({
            value: estrutura.id_estrutura_mqtt,
            label: estrutura.ds_estrutura_mqtt
         }))
      },
      optionsTpTopicos() {
         if (!this.topico.length) {
            return
         }
         return this.topico.map((topico) => ({
            value: topico.cd_dominio,
            label: topico.ds_dominio
         }))
      },
      optionsEstruturaMqttAtu() {
         if (!this.estruturaMqttAtu.length) {
            return
         }
         return this.estruturaMqttAtu.map((estruturaMqttAtu) => ({
            value: estruturaMqttAtu.id_estrutura_mqtt_atu,
            label: estruturaMqttAtu.ds_estrutura_mqtt_atu
         }))
      }
   },

   methods: {
      async salvarEstruturaMqttTopico(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await estruturaMqttTopicoService.salvarEstruturaMqttTopico(this.objNovoTopicoLocal)
         if (this.objNovoTopicoLocal.id_estrutura_mqtt_atu?.length) {
            const objEstruturaAtu = {
               id_estrutura_mqtt_topico: this.objNovoTopicoLocal.id_estrutura_mqtt_topico,
               id_estrutura_mqtt_atu: this.objNovoTopicoLocal.id_estrutura_mqtt_atu
            }
            await estruturaMqttTopicoService.salvarEstruturaMqttTopicoAtu(objEstruturaAtu)
         }
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
      async buscarEstruturasMqtt() {
         this.overlayEstruturasMqtt = true
         const dados = await client.get('/estrutura_mqtt').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar estruturas MQTT. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEstruturasMqtt = false
         this.estrutura = dados.data
      },
      async buscarTpTopicos() {
         this.overlayTpTopicos = true
         const dados = await client.get('/estrutura_mqtt_topico/tptopico').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tipos de tópicos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayTpTopicos = false
         this.topico = dados.data
      },
      async buscarEstruturasMqttAtu() {
         this.overlayEstruturaMqttAtu = true
         const dados = await client.get('/estrutura_mqtt_atu').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tempos de atualização. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEstruturaMqttAtu = false
         this.estruturaMqttAtu = dados.data
      },
      resetModal() {
         this.objNovoTopicoLocal = {}
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
      objNovoTopico: {
         handler(newVal) {
            this.objNovoTopicoLocal = { ...newVal }
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
      this.buscarEstruturasMqtt()
      this.buscarTpTopicos()
      this.buscarEstruturasMqttAtu()
   }
}
</script>

<style scoped>
.border-danger {
   border: 1.5px solid red;
   border-radius: 4px;
}
</style>