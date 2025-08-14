<template>
   <div class="white_shd full margin_bottom_30">
      <div class="full graph_head">
         <div class="heading1 margin_0">
            <b-row>
               <b-col cols="10">
                  <h2>Eventos</h2>
                  <small>Data: {{ this.$moment().format('DD/MM/YYYY HH:mm:ss') }}</small>
               </b-col>
               <b-col cols="2" class="text-right" v-if="estacao">
                  <b-button :pressed.sync="alarmeDia" @click="buscar()" variant="outline-primary" size="sm" class="mr-2" v-b-tooltip.hover title="Eventos das últimas 24h">24h</b-button>
                  <b-button variant="outline-primary" size="sm" v-b-tooltip.hover title="Ver log de eventos" @click="verLog(estacao)"><b-icon-clock></b-icon-clock></b-button>
               </b-col>
            </b-row>
         </div>
      </div>
      <div class="map_section padding_infor_info">
         <b-table :items="items" :fields="fields" :busy="isBusy || buscandoEstacao" select-mode="single" responsive="sm" sort-by="tp_criticidade_alarme" sort-desc hover selectable striped>
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
         <p class="text-center" v-if="!this.items.length && !isBusy && !buscandoEstacao">Nenhum evento para listar</p>
      </div>
   </div>
</template>

<script>
import client from '@/api'
import { mapState, mapActions } from 'vuex'

export default {
   name: 'EstacaoAutomaticaEventos',
   props: {
      tempoAtualizacao: Number
   },
   data() {
      return {
         items: [],
         isBusy: false,
         buscandoEstacao: false,
         estacao: null,
         intervalId: null,
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

   computed: {
      ...mapState('unidade', ['unidade'])
   },
   methods: {
      ...mapActions('unidade', ['retrieveUnidade']),
      async buscarEstacao() {
         if (!this.unidade || this.unidade == '') {
            return
         }
         this.buscandoEstacao = true
         const dados = await client.get(`/resumo/buscarestacao/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar estação meteorológica. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoEstacao = false
         })
         this.buscandoEstacao = false
         if (dados.data && dados.data.estrutura_equipamentos.length) {
            this.estacao = dados.data.estrutura_equipamentos[0].id_equipamento
            this.buscar()
         }
      },
      async buscar() {
         this.isBusy = true
         const dia = this.alarmeDia == true ? 'S' : 'N'
         const dados = await client.get(`/estacao/buscaralarme/${this.estacao}?dia=${dia}`).catch((err) => {
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
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscar()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      },
      verLog(idEquipamento) {
         this.$router.push({ name: 'log', params: { idEquipamento } })
      }
   },

   watch: {
      filtroGrafico(newValue) {
         if (newValue) {
            this.buscar()
         }
      },
      tempoAtualizacao(newValue) {
         if (newValue) {
            this.startInterval(newValue)
         } else {
            this.stopInterval()
         }
      }
   },

   mounted() {
      this.buscarEstacao()
   },

   beforeDestroy() {
      this.stopInterval()
   }
}
</script>

<style>
</style>