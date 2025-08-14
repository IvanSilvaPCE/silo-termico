<template>
   <b-overlay :show="buscandoAeracao" rounded="sm" class="overlay">
      <b-row>
         <b-col sm="12" md="6" lg="3">
            <b-form-group label="Data">
               <b-form-datepicker v-model="data" @input="buscarAeracao()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-form-group>
         </b-col>
      </b-row>
      <b-row class="justify-content-center d-flex overflow-auto">
         <b-col cols="12">
            <b-list-group horizontal class="mt-2">
               <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Horas de aeração">
                  <b-badge variant="primary" class="valor mr-1">Aer</b-badge>
                  <small class="valor text-nowrap">{{ this.aeracao.tempoAeracao || 0 }} h</small>
               </b-list-group-item>
               <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Horas de chuva">
                  <b-badge variant="primary" class="valor mr-1">Chu</b-badge>
                  <small class="valor text-nowrap">{{ this.aeracao.tempoChuva || 0 }} h</small>
               </b-list-group-item>
               <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Horas bloqueio horário de ponta / timer">
                  <b-badge variant="primary" class="valor mr-1">Pon</b-badge>
                  <small class="valor text-nowrap">{{ this.aeracao.tempoHorario || 0 }} h</small>
               </b-list-group-item>
            </b-list-group>
         </b-col>
      </b-row>
      <b-row ref="chartContainer">
         <div ref="chart" style="width: 100%; height: 55vh"></div>
      </b-row>
      <b-row>
         <b-col>
            <small>Análise baseada nas condições ambientais e da massa de grãos. Acionamento da aeração é dependente da parametrização da termometria e disponibilidade de partida dos motores</small>
         </b-col>
      </b-row>
      <b-row>
         <b-col>
            <b-table-simple hover small class="mt-2">
               <b-thead>
                  <b-tr>
                     <b-th colspan="2" class="text-center">Janela Diária</b-th>
                  </b-tr>
                  <b-tr>
                     <b-th></b-th>
                     <b-th>Oportunizado</b-th>
                  </b-tr>
               </b-thead>
               <b-tbody>
                  <b-tr>
                     <b-th variant="success">Aeração recomendada</b-th>
                     <b-td>{{ this.aeracao.janela3 }} h</b-td>
                  </b-tr>
                  <b-tr>
                     <b-th variant="warning">Aeração possível</b-th>
                     <b-td>{{ this.aeracao.janela2 }} h</b-td>
                  </b-tr>
                  <b-tr>
                     <b-th variant="danger">Aeração com risco de secagem / condensação</b-th>
                     <b-td>{{ this.aeracao.janela4 }} h</b-td>
                  </b-tr>
                  <b-tr>
                     <b-th variant="secondary">Aeração sem interesse</b-th>
                     <b-td>{{ this.aeracao.janela1 }} h</b-td>
                  </b-tr>
               </b-tbody>
            </b-table-simple>
         </b-col>
      </b-row>
      <b-row>
         <b-col sm="12" md="6" v-if="this.aeracao.aeracaoChuva" class="d-flex align-items-center mt-2">
            <p class="m-0">{{ this.aeracao.aeracaoChuva == 0 ? 'Bloqueada aeração com chuva' : 'Liberada aeração com chuva' }}</p>
         </b-col>
         <b-col sm="12" md="6" v-if="this.aeracao.horario && !this.aeracao.horario?.length" class="d-flex align-items-center mt-2">
            <p class="m-0">Bloqueio de ponta / timer desabilitado</p>
         </b-col>
      </b-row>
   </b-overlay>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'
// import { circle } from 'leaflet'

export default {
   name: 'SiloAeracao',
   data() {
      return {
         tipoGrafico: '',
         opcoesDoGrafico: {},
         buscandoAeracao: false,
         aeracao: {},
         datasOperacao: [],
         data: this.$moment().format('YYYY-MM-DD')
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

      if (this.opcoesDoGrafico) {
         this.initializeChart()
      }
      this.buscarAeracao()
   },

   methods: {
      marcaDatasOperacao(data) {
         const possuiData = this.datasOperacao.includes(data)
         return possuiData ? 'table-primary' : ''
      },
      initializeChart() {
         this.chartInstance = echarts.init(this.$refs.chart)
         if (this.opcoesDoGrafico) {
            this.chartInstance.setOption(this.opcoesDoGrafico)
         }
      },
      updateChart(novasOpcoes) {
         if (this.chartInstance) {
            this.chartInstance.setOption(novasOpcoes)
         }
      },
      clearChart() {
         if (this.chartInstance) {
            this.chartInstance.clear()
         }
      },
      handleResize() {
         if (this.chartInstance) {
            this.chartInstance.resize()
         }
      },
      async buscarAeracao() {
         if (!this.idSilo) {
            return
         }
         this.buscandoAeracao = true
         const dados = await client.get(`/silo/buscarjanelaaeracao/${this.idSilo}?data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar aeração. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoAeracao = false
         })
         this.buscandoAeracao = false
         if (dados && dados.data) {
            this.aeracao = dados.data
            this.construirGrafico(this.aeracao)
            this.datasOperacao = this.aeracao.datasOperacao
         }
      },
      construirGrafico() {
         const agora = new Date()
         const timestampAtual = agora.getTime()
         let markAreasGrafico = []
         const adicionarMarkArea = (dados, cor) => {
            if (!dados) return
            dados.forEach((item) => {
               markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
            })
         }

         adicionarMarkArea(this.aeracao.janela?.[1], 'rgba(194, 192, 192, 0.2)')
         adicionarMarkArea(this.aeracao.janela?.[2], 'rgba(254, 254, 49, 0.2)')
         adicionarMarkArea(this.aeracao.janela?.[3], 'rgba(77, 205, 60, 0.2)')
         adicionarMarkArea(this.aeracao.janela?.[4], 'rgba(247, 96, 28, 0.2)')

         this.opcoesDoGrafico = {
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
            legend: { textStyle: { color: '#6c727a' }, top: 25, data: [{ name: 'Aer. automática' }, { name: 'Aer. manual' }, { name: 'Chuva' }, { name: 'Horário ponta / timer' }, { name: '', icon: 'none' }], type: 'scroll', orient: 'horizontal' },
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
            yAxis: { type: 'value', show: false, max: 5 },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            series: [
               { name: 'Chuva', type: 'line', showSymbol: false, lineStyle: { width: 35 }, data: this.aeracao.chuva },
               { name: 'Aer. automática', type: 'line', showSymbol: false, lineStyle: { width: 35 }, data: this.aeracao.aeracaoAuto },
               { name: 'Aer. manual', type: 'line', showSymbol: false, lineStyle: { width: 35 }, itemStyle: { color: 'green' }, data: this.aeracao.aeracaoManu },
               { name: 'Horário ponta / timer', type: 'line', showSymbol: false, lineStyle: { width: 35, color: 'red', opacity: 0.6 }, itemStyle: { color: 'red' }, data: this.aeracao.horario },
               { name: '', type: 'line', symbol: 'none', markArea: { data: markAreasGrafico } },
               { name: '', type: 'scatter', markPoint: { symbol: 'pin', symbolSize: 40, itemStyle: { color: 'green' }, label: { color: '#FFFFFF', backgroundColor: 'green', padding: [3, 5], borderRadius: 4, formatter: 'Agora', position: 'bottom' }, data: [{ name: 'Horário Atual', coord: [timestampAtual, 0], value: 'Agora' }] } }
            ]
         }
      }
   },

   beforeDestroy() {
      if (this.chartInstance) {
         this.chartInstance.dispose()
      }
      if (this.resizeObserver) {
         this.resizeObserver.disconnect()
      }
      window.removeEventListener('resize', this.handleResize)
   },

   watch: {
      opcoesDoGrafico(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart()
            this.updateChart(novasOpcoes)
            this.resizeObserver = new ResizeObserver(this.handleResize)
            this.resizeObserver.observe(this.$refs.chartContainer)

            window.addEventListener('resize', this.handleResize)
         }
      }
   }
}
</script>

<style scoped>
.overlay {
   z-index: 0;
}
</style>