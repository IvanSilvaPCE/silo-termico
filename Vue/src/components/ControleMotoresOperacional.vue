<template>
   <div>
      <b-row>
         <b-col sm="12" lg="4">
            <v-select v-model="operacao" :options="optionsOperacao" @input="buscarLogGrafico()" :reduce="(operacao) => operacao.value">
               <template #no-options="">Nenhuma correspondência</template>
            </v-select>
         </b-col>
      </b-row>
      <b-row>
         <b-col>
            <div ref="containerCalendario" style="overflow-x: auto">
               <b-overlay :show="buscandoLogGrafico" rounded="sm" class="overlay">
                  <div ref="chartCalendario" class="mb-0" style="width: 100%; height: 300px; min-width: 1000px"></div>
               </b-overlay>
            </div>
         </b-col>
      </b-row>
      <b-row>
         <b-col sm="12" md="6">
            <div ref="containerCriticidade">
               <b-overlay :show="buscandoLogGrafico" rounded="sm" class="overlay">
                  <div ref="chartCriticidade" class="mt-0" style="width: 100%; height: 400px"></div>
               </b-overlay>
            </div>
         </b-col>
         <b-col md="6" class="mt-4" v-if="logGrafico.alarmes">
            <b-row>
               <b-col md="6">
                  <b-card class="text-center mb-3">
                     <template #header>
                        <p class="texto mb-0">Filtro de criticidade</p>
                     </template>
                     <div class="d-flex justify-content-between align-items-center">
                        <p class="texto flex-grow-1 text-center">{{ this.criticidadeSelecionada || 'Nenhum filtro' }}</p>
                        <b-button v-if="criticidadeSelecionada" variant="outline-secondary" @click="limparFiltro()" v-b-tooltip.hover title="Limpar filtro">
                           <b-icon icon="x-circle"></b-icon>
                        </b-button>
                     </div>
                  </b-card>
               </b-col>
               <b-col md="6">
                  <b-card class="text-center mb-3">
                     <template #header>
                        <p class="texto mb-0">Total de eventos {{ criticidadeSelecionada.toLowerCase() }}</p>
                     </template>
                     <b-overlay :show="buscandoLogGrafico" rounded="sm">
                        <p class="texto">{{ this.totalAlarmes }}</p>
                     </b-overlay>
                  </b-card>
               </b-col>
            </b-row>
            <b-row>
               <b-col md="6">
                  <b-card class="text-center mb-3">
                     <template #header>
                        <p class="texto mb-0">Tempo eventos crítico</p>
                     </template>
                     <b-overlay :show="buscandoLogGrafico" rounded="sm">
                        <p class="texto">{{ this.logGrafico.tempo_critico }}</p>
                     </b-overlay>
                  </b-card>
               </b-col>
               <b-col md="6">
                  <b-card class="text-center mb-3">
                     <template #header>
                        <p class="texto mb-0">Tempo total eventos</p>
                     </template>
                     <b-overlay :show="buscandoLogGrafico" rounded="sm">
                        <p class="texto">{{ this.logGrafico.tempo_total }}</p>
                     </b-overlay>
                  </b-card>
               </b-col>
            </b-row>
         </b-col>
      </b-row>
      <b-row v-if="buscandoLogDia || logDia.length">
         <b-col class="mt-4">
            <p class="mb-4 mt-3 texto">Eventos do dia {{ formatarDataSemHora(this.dataSelecionada) }}</p>
            <b-table :items="logDia" :fields="fields" :busy="buscandoLogDia" :current-page="currentPage" :per-page="perPage" select-mode="single" responsive="sm" sort-by="tp_criticidade_alarme" sort-desc hover selectable striped>
               <template #table-busy>
                  <div class="text-center text-danger my-2">
                     <b-spinner class="align-middle mr-1"></b-spinner>
                     <strong>Carregando...</strong>
                  </div>
               </template>
               <template #cell(tp_criticidade_alarme)="row">
                  <b-badge class="p-2" :variant="criticidade(row.item.tp_criticidade_alarme)">{{ formatarCriticidade(row.item.tp_criticidade_alarme) }}</b-badge>
               </template>
               <template #cell(status)="row">
                  <span>{{ !row.item.dt_fim ? 'Ativo' : 'Restaurado' }}</span>
               </template>
               <template #cell(tempo)="row">
                  <span>{{ calculaData(row.item.dt_inicio, row.item.dt_fim) }}</span>
               </template>
            </b-table>
            <b-pagination v-if="buscandoLogDia || logDia.length" v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="right" class="my-0"></b-pagination>
         </b-col>
      </b-row>
      <hr />
      <b-row>
         <b-col sm="12" lg="4">
            <b-form-datepicker v-model="data" @input="buscarOperacao()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
         </b-col>
      </b-row>
      <b-row>
         <b-col sm="12" md="12">
            <div ref="containerOperacao">
               <b-overlay :show="buscandoOperacao" rounded="sm" class="overlay">
                  <div ref="chartOperacao" class="mt-0" style="width: 100%; height: 400px"></div>
               </b-overlay>
            </div>
         </b-col>
      </b-row>
   </div>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'

export default {
   name: 'ControleMotoresOperacional',
   props: {
      tempoAtualizacao: Number
   },
   data() {
      return {
         operacao: '0',
         buscandoLogGrafico: false,
         logGrafico: [],
         graficoCalendario: {},
         graficoCriticidade: {},
         graficoOperacao: {},
         buscandoOperacao: false,
         dadosOperacao: {},
         criticidadeSelecionada: '',
         data: this.$moment().format('YYYY-MM-DD'),
         datasOperacao: [],
         valorCriticidade: '',
         buscandoLogDia: false,
         logDia: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         optionsOperacao: [
            { value: '0', label: 'Operação manual' },
            { value: '1', label: 'Operação automática' }
         ],
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
      maiorValor() {
         let maximo = this.logGrafico.alarmes.reduce((maior, item) => {
            return Math.max(maior, item[1])
         }, 0)
         let arredondado = Math.ceil(maximo / 10) * 10
         return arredondado
      },
      totalAlarmes() {
         if (this.logGrafico && this.logGrafico.alarmes && Array.isArray(this.logGrafico.alarmes)) {
            return this.logGrafico.alarmes.reduce((total, item) => {
               return total + item[1]
            }, 0)
         } else {
            return 0
         }
      }
   },

   methods: {
      async buscarLogGrafico() {
         this.buscandoLogGrafico = true
         const dados = await client.get(`/controle/buscarlog/${this.idControle}?operacao=${this.operacao}&criticidade=${this.valorCriticidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar log de eventos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoLogGrafico = false
         })
         this.buscandoLogGrafico = false
         if (dados && dados.data) {
            this.logGrafico = dados.data
            this.construirGraficoCalendario(dados.data.alarmes)
            this.construirGraficoCriticidade(dados.data.criticidades)
         }
      },
      async buscarLogDia(data) {
         this.buscandoLogDia = true
         const dados = await client.get(`/controle/buscarlogdia/${this.idControle}?data=${data}&criticidade=${this.valorCriticidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.buscandoLogDia = false
         this.logDia = dados.data
         this.totalRows = this.logDia.length
         window.scrollTo({ top: 2000, behavior: 'smooth' })
      },
      async buscarOperacao() {
         this.buscandoOperacao = true
         const dados = await client.get(`/controle/buscaroperacao/${this.idControle}?data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar operação. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoOperacao = false
         })
         this.buscandoOperacao = false
         if (dados && dados.data) {
            this.dadosOperacao = dados.data
            this.datasOperacao = this.dadosOperacao.datasOperacao
            this.construirGraficoOperacao()
         }
      },
      construirGraficoCalendario(dados) {
         if (!dados) return

         this.graficoCalendario = {
            title: { textStyle: { color: '#6c727a' }, top: 1, left: 'center', text: `${this.$moment().format('YYYY')}` },
            tooltip: {
               position: 'top',
               formatter: function (p) {
                  const format = echarts.time.format(p.data[0], 'Dia {dd}', false)
                  return format + ': ' + p.data[1]
               }
            },
            visualMap: { min: 0, max: this.maiorValor, type: 'piecewise', orient: 'horizontal', left: 'center', top: 65, textStyle: { color: '#6c727a' } },
            calendar: {
               top: 120,
               left: 30,
               right: 30,
               cellSize: ['auto'],
               range: `${this.$moment().format('YYYY')}`,
               itemStyle: { borderWidth: 0.5 },
               dayLabel: { textStyle: { color: '#6c727a' }, margin: 3, nameMap: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] },
               monthLabel: { textStyle: { color: '#6c727a' }, nameMap: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'] },
               yearLabel: { show: false }
            },
            series: { type: 'heatmap', coordinateSystem: 'calendar', data: dados }
         }
      },
      construirGraficoCriticidade(dados) {
         this.graficoCriticidade = {
            title: { textStyle: { color: '#6c727a' }, top: 20, left: 'center', text: 'Criticidades' },
            tooltip: { trigger: 'item' },
            series: [
               {
                  name: 'Eventos',
                  type: 'pie',
                  radius: ['35%', '70%'],
                  avoidLabelOverlap: false,
                  label: { show: false, position: 'center' },
                  emphasis: { label: { show: true, fontSize: 25, fontWeight: 'bold' } },
                  labelLine: { show: false },
                  data: [
                     { value: dados.critico, name: 'Crítico', itemStyle: { color: '#dc3545' } },
                     { value: dados.alto, name: 'Alto', itemStyle: { color: '#ffc107' } },
                     { value: dados.baixo, name: 'Baixo', itemStyle: { color: '#007bff' } },
                     { value: dados.alerta, name: 'Alerta', itemStyle: { color: '#17a2b8' } }
                  ]
               }
            ]
         }
      },
      construirGraficoOperacao() {
         this.graficoOperacao = {
            toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            tooltip: {
               trigger: 'axis',
               formatter: (params) => {
                  const date = new Date(params[0].value[0])
                  const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
                  let tooltipContent = `<div>${formattedTime}</div>`
                  return tooltipContent
               }
            },
            legend: { textStyle: { color: '#6c727a' }, top: 25, data: [{ name: 'Automático' }, { name: 'Manual' }], type: 'scroll', orient: 'horizontal' },
            grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
            xAxis: {
               type: 'time',
               boundaryGap: false,
               axisLabel: {
                  formatter: function (value) {
                     return echarts.format.formatTime('hh:mm', value)
                  }
               },
               splitLine: { show: true }
            },
            yAxis: { type: 'value', show: false, max: 3 },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            series: [
               {
                  name: 'Automático',
                  type: 'line',
                  showSymbol: false,
                  lineStyle: { width: 35 },
                  itemStyle: { color: 'green' },
                  data: this.dadosOperacao?.automatico
               },
               {
                  name: 'Manual',
                  type: 'line',
                  showSymbol: false,
                  lineStyle: { width: 35 },
                  itemStyle: { color: '#91cc75' },
                  data: this.dadosOperacao?.manual
               }
            ]
         }
      },
      limparFiltro() {
         this.valorCriticidade = ''
         this.buscarLogGrafico()
         this.criticidadeSelecionada = ''
         this.logDia = []
      },
      marcaDatasOperacao(data) {
         const possuiData = this.datasOperacao.includes(data)
         return possuiData ? 'table-primary' : ''
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
      formatarDataSemHora(value) {
         if (!value) return '-'
         return this.$moment(value, 'YYYY/MM/DD').format('DD/MM/YYYY')
      },
      calculaData(dataInicio, dataFim) {
         if (!dataInicio) return ''
         const inicio = this.$moment(dataInicio, 'YYYY/MM/DD HH:mm:ss')
         const fim = !dataFim ? this.$moment() : this.$moment(dataFim, 'YYYY/MM/DD HH:mm:ss')
         const duracao = this.$moment.duration(fim.diff(inicio))
         const diasEmHoras = Math.floor(duracao.asDays()) * 24
         const horas = duracao.hours() + diasEmHoras
         const minutos = duracao.minutes()
         return `${horas}h ${minutos}min`
      },
      initializeChart() {
         this.chartCalendario = echarts.init(this.$refs.chartCalendario)
         if (this.graficoCalendario) {
            this.chartCalendario.setOption(this.graficoCalendario)
         }
         this.chartCriticidade = echarts.init(this.$refs.chartCriticidade)
         if (this.graficoCriticidade) {
            this.chartCriticidade.setOption(this.graficoCriticidade)
         }
         this.chartOperacao = echarts.init(this.$refs.chartOperacao)
         if (this.graficoOperacao) {
            this.chartOperacao.setOption(this.graficoOperacao)
         }
      },
      updateChart(chart, novasOpcoes) {
         if (chart) {
            chart.setOption(novasOpcoes)
         }
      },
      clearChart(chart) {
         if (chart) {
            chart.clear()
         }
      },
      handleResize() {
         if (this.chartCalendario) {
            this.chartCalendario.resize()
         }
         if (this.chartCriticidade) {
            this.chartCriticidade.resize()
         }
         if (this.chartOperacao) {
            this.chartOperacao.resize()
         }
      },
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarOperacao()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      },
      cliqueCalendario(params) {
         if (params.componentType === 'series') {
            this.dataSelecionada = params.data[0]
            this.buscarLogDia(params.data[0])
         }
      },
      cliqueCriticidade(params) {
         this.logDia = []
         if (params.componentType === 'series') {
            const valCriticidade = {
               Crítico: 50,
               Alto: 25,
               Baixo: 10,
               Alerta: 0
            }
            this.criticidadeSelecionada = params.data.name
            this.valorCriticidade = valCriticidade[params.data.name]
            this.buscarLogGrafico()
         }
      }
   },

   mounted() {
      const idControleLocalStorage = localStorage.getItem('con')
      if (idControleLocalStorage && idControleLocalStorage != 'undefined') {
         this.idControle = idControleLocalStorage
      } else {
         this.idControle = this.$route.params.idControle
         localStorage.setItem('con', this.idControle)
      }
      this.buscarLogGrafico()
      this.buscarOperacao()
      if (this.graficoCalendario) {
         this.initializeChart()
      }
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(this.$refs.containerCalendario)
      this.resizeObserver.observe(this.$refs.containerCriticidade)
      this.resizeObserver.observe(this.$refs.containerOperacao)
      window.addEventListener('resize', this.handleResize)
      this.chartCriticidade.on('click', this.cliqueCriticidade)
      this.chartCalendario.on('click', this.cliqueCalendario)
   },

   watch: {
      graficoCalendario(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart(this.chartCalendario)
            this.updateChart(this.chartCalendario, novasOpcoes)
         }
      },
      graficoCriticidade(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart(this.chartCriticidade)
            this.updateChart(this.chartCriticidade, novasOpcoes)
         }
      },
      graficoOperacao(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart(this.chartOperacao)
            this.updateChart(this.chartOperacao, novasOpcoes)
         }
      },
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

<style scoped>
.overlay {
   z-index: 0;
}

.texto {
   font-size: 20px;
   font-weight: 500;
   color: black;
}

.titulo {
   font-size: 20px;
   font-weight: 550;
   color: black;
}
</style>