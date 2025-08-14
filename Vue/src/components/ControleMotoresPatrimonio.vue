<template>
   <div>
      <h1 class="mb-4">Bloquear Movimentação</h1>
      <b-row>
         <b-col cols="6" lg="6">
            <b-form-group label="Equipamentos">
               <v-select multiple v-model="equipamentos" :options="optionsEquipamentos" :reduce="(equipamento) => equipamento.value">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
            </b-form-group>
         </b-col>
      </b-row>
      <b-row class="mb-2">
         <b-col cols="6" md="6" lg="3" class="pr-0">
            <b-form-group label="Data Início">
               <b-form-datepicker v-model="dataInicio" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected=""></b-form-datepicker>
            </b-form-group>
         </b-col>
         <b-col cols="6" md="6" lg="3" class="pl-0">
            <b-form-group label="Hora Início">
               <b-form-timepicker v-model="horaInicio" locale="pt-br" now-button label-no-time-selected="" label-close-button="Fechar" label-now-button="Agora"></b-form-timepicker>
            </b-form-group>
         </b-col>
      </b-row>
      <b-row>
         <b-col cols="6" lg="3" class="pr-0">
            <b-form-group label="Data Fim">
               <b-form-datepicker v-model="dataFim" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected=""></b-form-datepicker>
            </b-form-group>
         </b-col>
         <b-col cols="6" lg="3" class="pl-0">
            <b-form-group label="Hora Fim">
               <b-form-timepicker v-model="horaFim" locale="pt-br" now-button label-no-time-selected="" label-close-button="Fechar" label-now-button="Agora"></b-form-timepicker>
            </b-form-group>
         </b-col>
      </b-row>
      <b-row>
         <b-col>
            <b-button variant="outline-primary" class="mr-2" @click="salvarDatas()" :disabled="!equipamentos?.length || !dataInicio || !dataFim">Salvar</b-button>
            <b-button variant="outline-secondary" @click="resetarDatas()" :disabled="!equipamentos?.length && !dataInicio && !dataFim">Resetar</b-button>
         </b-col>
      </b-row>
   </div>
</template>

<script>
export default {
   name: 'ControleMotoresPatrimonio',
   props: {
      tempoAtualizacao: Number
   },
   data() {
      return {
         dataInicio: null,
         horaInicio: null,
         dataFim: null,
         horaFim: null,
         equipamentos: [],
         intervalId: null,
         optionsEquipamentos: [
            { value: '1', label: 'EL-01' },
            { value: '2', label: 'EL-02' },
            { value: '3', label: 'EL-03' },
            { value: '4', label: 'TC-01' },
            { value: '5', label: 'TC-02' },
            { value: '6', label: 'TC-03' }
         ]
      }
   },

   methods: {
      salvarDatas() {
         localStorage.setItem('equipamentos', this.equipamentos)
         localStorage.setItem('dataInicio', this.dataInicio)
         localStorage.setItem('horaInicio', this.horaInicio)
         localStorage.setItem('dataFim', this.dataFim)
         localStorage.setItem('horaFim', this.horaFim)
         this.$bvToast.toast(`Configurado com sucesso.`, {
            title: 'Sucesso',
            variant: 'success',
            autoHideDelay: 5000,
            solid: true,
            toaster: 'b-toaster-bottom-right'
         })
         this.enviarInformacao()
      },
      enviarInformacao() {
         this.$emit('informacaoAtualizada', true)
      },
      buscarDatas() {
         this.equipamentos =
            localStorage
               .getItem('equipamentos')
               ?.split(',')
               .map((item) => item.trim()) || null
         this.dataInicio = localStorage.getItem('dataInicio') || null
         this.horaInicio = localStorage.getItem('horaInicio') || null
         this.dataFim = localStorage.getItem('dataFim') || null
         this.horaFim = localStorage.getItem('horaFim') || null
      },
      resetarDatas() {
         localStorage.removeItem('equipamentos')
         localStorage.removeItem('dataInicio')
         localStorage.removeItem('horaInicio')
         localStorage.removeItem('dataFim')
         localStorage.removeItem('horaFim')
         this.equipamentos = null
         this.dataInicio = null
         this.horaInicio = null
         this.dataFim = null
         this.horaFim = null
         this.$bvToast.toast(`Configuração removida.`, {
            title: 'Sucesso',
            variant: 'success',
            autoHideDelay: 5000,
            solid: true,
            toaster: 'b-toaster-bottom-right'
         })
         this.buscarDatas()
         this.enviarInformacao()
      },
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarDatas()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      }
   },

   mounted() {
      this.buscarDatas()
   },

   watch: {
      tempoAtualizacao(newValue) {
         if (newValue) {
            this.startInterval(newValue)
         } else {
            this.stopInterval()
         }
      }
   }
}
</script>

<style>
</style>