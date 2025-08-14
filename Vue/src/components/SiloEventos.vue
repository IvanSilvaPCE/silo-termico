<template>
   <div>
      <b-row>
         <b-col cols="7">
            <h1>Eventos</h1>
         </b-col>
         <b-col cols="5" class="text-right">
            <b-button :pressed.sync="alarmeDia" @click="buscar()" variant="outline-primary" size="sm" class="mr-2" v-b-tooltip.hover title="Eventos das últimas 24h">24h</b-button>
            <b-button variant="outline-primary" size="sm" v-b-tooltip.hover title="Ver log de eventos" @click="verLog(idSilo)"><b-icon-clock></b-icon-clock></b-button>
         </b-col>
      </b-row>
      <b-row>
         <b-col>
            <b-table :items="items" :fields="fields" :busy="isBusy" select-mode="single" responsive="sm" sort-by="tp_criticidade_alarme" sort-desc hover selectable striped class="mt-1">
               <template #table-busy>
                  <div class="text-center text-danger my-2">
                     <b-spinner class="align-middle mr-1"></b-spinner>
                     <strong>Carregando...</strong>
                  </div>
               </template>
               <template #cell(tp_criticidade_alarme)="row">
                  <b-badge class="p-2" :variant="criticidade(row.item.tp_criticidade_alarme)">{{ formatarCriticidade(row.item.tp_criticidade_alarme) }}</b-badge>
               </template>
               <template #cell(status)="row" v-if="!alarmeDia">
                  <span>{{ !row.item.dt_fim ? 'Ativo' : 'Restaurado' }}</span>
               </template>
               <template #cell(tempo)="row" v-if="!alarmeDia">
                  <span>{{ calculaData(row.item.dt_inicio) }}</span>
               </template>
            </b-table>
            <p class="text-center" v-if="!this.items.length && !isBusy">Nenhum evento para listar</p>
         </b-col>
      </b-row>
   </div>
</template>
 
<script>
import client from '@/api'

export default {
   name: 'SiloEventos',
   data() {
      return {
         items: [],
         isBusy: false,
         alarmeDia: false,
         fields: [
            { key: 'tp_criticidade_alarme', label: 'Criticidade' },
            { key: 'status', label: 'Status' },
            { key: 'ds_alarme', label: 'Alarme' },
            { key: 'tempo', label: 'Duração' },
            { key: 'dt_inicio', label: 'Início', formatter: 'formatarData' },
            { key: 'dt_fim', label: 'Fim', formatter: 'formatarData' }
         ]
      }
   },

   methods: {
      async buscar() {
         this.isBusy = true
         const dia = this.alarmeDia == true ? 'S' : 'N'
         const dados = await client.get(`/silo/buscaralarme/${this.idSilo}?dia=${dia}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar eventos. ${err}`, {
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
      },
      criticidade(value) {
         if (value == 0) return 'info'
         if (value == 10) return 'primary'
         if (value == 25) return 'warning'
         if (value == 50) return 'danger'
      },
      formatarCriticidade(value) {
         if (value == 0) return 'Alerta'
         if (value == 10) return 'Baixo'
         if (value == 25) return 'Alto'
         if (value == 50) return 'Crítico'
         return value
      },
      formatarData(value) {
         if (!value) return '-'
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
      },
      calculaData(dataInicio) {
         if (!dataInicio) return ''
         const inicio = this.$moment(dataInicio, 'YYYY/MM/DD HH:mm:ss')
         const agora = this.$moment()
         const duracao = this.$moment.duration(agora.diff(inicio))
         const diasEmHoras = Math.floor(duracao.asDays()) * 24
         const horas = duracao.hours() + diasEmHoras
         const minutos = duracao.minutes()
         return `${horas}h ${minutos}min`
      },
      verLog(idEquipamento) {
         this.$router.push({ name: 'log', params: { idEquipamento } })
      }
   },

   mounted() {
      const idSiloLocalStorage = localStorage.getItem('sil')

      if (idSiloLocalStorage && idSiloLocalStorage != 'undefined') {
         this.idSilo = idSiloLocalStorage
      } else {
         this.idSilo = this.$route.params.idSilo
         localStorage.setItem('sil', this.idSilo)
      }
      this.buscar()
   }
}
</script>
 
<style>
</style>
