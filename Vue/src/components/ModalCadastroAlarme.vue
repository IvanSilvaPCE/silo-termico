<template>
   <b-modal id="cadastro-alarme" :title="tituloModal" @ok="salvarAlarme" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
      <form>
         <b-form-group label="Código">
            <b-form-input type="number" v-model="objNovoAlarmeLocal.cd_alarme" :state="validate('cd_alarme')"></b-form-input>
            <b-form-invalid-feedback id="cd_alarme">{{ erros['cd_alarme'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Descrição">
            <b-form-input v-model="objNovoAlarmeLocal.ds_alarme" :state="validate('ds_alarme')"></b-form-input>
            <b-form-invalid-feedback id="ds_alarme">{{ erros['ds_alarme'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Criticidade">
            <b-overlay :show="overlayTpCriticidades" rounded="sm">
               <v-select v-model="objNovoAlarmeLocal.tp_criticidade" :options="optionsTpCriticidades" :state="validate('tp_criticidade')" :reduce="(criticidade) => criticidade.value" :class="{ 'border-danger': validate('tp_criticidade') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['tp_criticidade'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Risco">
            <b-overlay :show="overlayRiscos" rounded="sm">
               <v-select v-model="objNovoAlarmeLocal.id_risco" :options="optionsRiscos" :state="validate('id_risco')" :reduce="(risco) => risco.value" :class="{ 'border-danger': validate('id_risco') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_risco'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Causa">
            <b-overlay :show="overlayCausas" rounded="sm">
               <v-select v-model="objNovoAlarmeLocal.id_causa" :options="optionsCausas" :state="validate('id_causa')" :reduce="(causa) => causa.value" :class="{ 'border-danger': validate('id_causa') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_causa'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Tipo">
            <b-overlay :show="overlayCausas" rounded="sm">
               <v-select v-model="objNovoAlarmeLocal.id_tipo_alarme" :options="optionsTipoAlarmes" :state="validate('id_tipo_alarme')" :reduce="(tipo) => tipo.value" :class="{ 'border-danger': validate('id_tipo_alarme') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_tipo_alarme'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Grupo">
            <b-overlay :show="overlayGrupoAlarmes" rounded="sm">
               <v-select v-model="objNovoAlarmeLocal.id_grupo_alarme" :options="optionsGrupoAlarmes" :state="validate('id_grupo_alarme')" :reduce="(grupo) => grupo.value" :class="{ 'border-danger': validate('id_grupo_alarme') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_grupo_alarme'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Gera Assistência">
            <b-overlay :show="overlayCausas" rounded="sm">
               <v-select v-model="objNovoAlarmeLocal.fl_assistencia" :options="optionsFlAssistencia" :state="validate('fl_assistencia')" :reduce="(assistencia) => assistencia.value" :class="{ 'border-danger': validate('fl_assistencia') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['fl_assistencia'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Prioridade da Assistência">
            <b-overlay :show="overlayFlPrioridade" rounded="sm">
               <v-select v-model="objNovoAlarmeLocal.fl_prioridade" :options="optionsFlPrioridade" :state="validate('fl_prioridade')" :reduce="(prioridade) => prioridade.value" :class="{ 'border-danger': validate('fl_prioridade') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['fl_prioridade'] | parseErros }}</small>
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
import { alarmeService } from '../services'

export default {
   name: 'ModalCadastroAlarme',
   props: {
      objNovoAlarme: Object,
      tituloModal: String
   },
   data() {
      return {
         isSalvando: false,
         objNovoAlarmeLocal: {},
         erros: [],
         overlayTpCriticidades: false,
         overlayRiscos: false,
         overlayCausas: false,
         overlayTipoAlarmes: false,
         overlayFlPrioridade: false,
         overlayGrupoAlarmes: false,
         criticidade: [],
         risco: [],
         causa: [],
         tipoAlarme: [],
         prioridade: [],
         grupoAlarme: [],
         optionsFlAssistencia: [
            { value: 'S', label: 'Gera assistência' },
            { value: 'N', label: 'Não gera assistência' }
         ]
      }
   },

   computed: {
      optionsTpCriticidades() {
         if (!this.criticidade.length) {
            return
         }
         return this.criticidade.map((criticidade) => ({
            value: parseInt(criticidade.cd_dominio),
            label: criticidade.ds_dominio
         }))
      },
      optionsRiscos() {
         if (!this.risco.length) {
            return
         }
         return this.risco.map((risco) => ({
            value: risco.id_risco,
            label: risco.nm_risco
         }))
      },
      optionsCausas() {
         if (!this.causa.length) {
            return
         }
         return this.causa.map((causa) => ({
            value: causa.id_causa,
            label: causa.ds_causa
         }))
      },
      optionsTipoAlarmes() {
         if (!this.tipoAlarme.length) {
            return
         }
         return this.tipoAlarme.map((tipoAlarme) => ({
            value: tipoAlarme.id_tipo_alarme,
            label: tipoAlarme.nm_tipo_alarme
         }))
      },
      optionsFlPrioridade() {
         if (!this.prioridade.length) {
            return
         }
         return this.prioridade.map((prioridade) => ({
            value: prioridade.cd_dominio,
            label: prioridade.ds_dominio
         }))
      },
      optionsGrupoAlarmes() {
         if (!this.grupoAlarme.length) {
            return
         }
         return this.grupoAlarme.map((grupoAlarme) => ({
            value: grupoAlarme.id_grupo_alarme,
            label: grupoAlarme.nm_grupo_alarme
         }))
      },
   },

   methods: {
      async salvarAlarme(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await alarmeService.salvarAlarme(this.objNovoAlarmeLocal)
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
               this.$bvModal.hide('cadastro-alarme')
            })
         }
      },
      resetModal() {
         this.objNovoAlarmeLocal = {}
         this.erros = []
      },
      async buscarTpCriticidades() {
         this.overlayTpCriticidades = true
         const dados = await client.get('/alarme/tpcriticidade').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar criticidades. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayTpCriticidades = false
         this.criticidade = dados.data
      },
      async buscarRiscos() {
         this.overlayRiscos = true
         const dados = await client.get('/risco').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar riscos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayRiscos = false
         this.risco = dados.data
      },
      async buscarCausas() {
         this.overlayCausas = true
         const dados = await client.get('/causa').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar causas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayCausas = false
         this.causa = dados.data
      },
      async buscarTiposAlarmes() {
         this.overlayTipoAlarmes = true
         const dados = await client.get('/tipo_alarme').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tipos de alarmes. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayTipoAlarmes = false
         this.tipoAlarme = dados.data
      },
      async buscarFlPrioridades() {
         this.overlayFlPrioridade = true
         const dados = await client.get('/alarme/flprioridade').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tipos de alarmes. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayFlPrioridade = false
         this.prioridade = dados.data
      },
      async buscarGruposAlarmes() {
         this.overlayGrupoAlarmes = true
         const dados = await client.get('/grupo_alarme').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar grupos de alarmes. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayGrupoAlarmes = false
         this.grupoAlarme = dados.data
      },
      validate(prop) {
         const keys = Object.keys(this.erros)
         if (keys.includes(prop)) {
            return false
         }
      }
   },

   watch: {
      objNovoAlarme: {
         handler(newVal) {
            this.objNovoAlarmeLocal = { ...newVal }
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
      this.buscarTpCriticidades()
      this.buscarRiscos()
      this.buscarCausas()
      this.buscarTiposAlarmes()
      this.buscarFlPrioridades()
      this.buscarGruposAlarmes()
   }
}
</script>

<style scoped>
.border-danger {
   border: 1.5px solid red;
   border-radius: 4px;
}
</style>