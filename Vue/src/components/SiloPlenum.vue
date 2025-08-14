<template>
   <b-overlay :show="buscandoPlenum" rounded="sm" class="overlay">
      <b-row>
         <b-col sm="12" md="6" lg="3">
            <b-form-group label="Data inicial">
               <b-form-datepicker v-model="dataInical" @input="buscarPlenum()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-form-group>
         </b-col>
         <b-col sm="12" md="6" lg="3">
            <b-form-group label="Data final">
               <b-form-datepicker v-model="dataFinal" @input="buscarPlenum()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-form-group>
         </b-col>
      </b-row>
      <b-row ref="chartContainer">
         <b-col>
            <div ref="chart" style="width: 100%; height: 75vh"></div>
         </b-col>
      </b-row>
   </b-overlay>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'

export default {
   name: 'SiloPlenum',
   data() {
      return {
         buscandoPlenum: false,
         plenum: {},
         opcoesDoGrafico: {},
         datasOperacao: [],
         dataInical: this.$moment().format('YYYY-MM-DD'),
         dataFinal: this.$moment().format('YYYY-MM-DD')
      }
   },

   computed: {
      dataMinima() {
         return this.$moment(this.dataFinal).subtract(30, 'days').format('YYYY-MM-DD')
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
      this.buscarPlenum()
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
      async buscarPlenum() {
         if (!this.idSilo) {
            return
         }
         this.buscandoPlenum = true
         const dados = await client.get(`/silo/buscarplenum/${this.idSilo}?inicio=${this.dataInical}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar plenum. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoPlenum = false
         })
         this.buscandoPlenum = false
         if (dados && dados.data) {
            this.plenum = dados.data
            this.construirGrafico(this.plenum)
            this.datasOperacao = this.plenum.datasOperacao
         }
      },
      construirGrafico() {
         let markAreaChuva = []
         let markAreaAeraLiga = []

         const adicionarMarkArea = (dados, cor, serie) => {
            if (!dados) return
            dados.forEach((item) => {
               serie.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
            })
         }

         adicionarMarkArea(this.plenum.chuva, 'rgba(173, 216, 230)', markAreaChuva)
         adicionarMarkArea(this.plenum.aerLigada, 'rgba(0, 204, 102, 0.4)', markAreaAeraLiga)

         this.opcoesDoGrafico = {
            tooltip: {
               trigger: 'axis',
               axisPointer: { type: 'cross' },
               formatter: (params) => {
                  const date = new Date(params[0].value[0])
                  const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm').format('DD/MM/YYYY HH:mm')
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
                  params.forEach((param) => {
                     let valor = param.value[1] == 'erro' ? param.value[1] : parseFloat(param.value[1]).toFixed(1)
                     let unidade = param.seriesName.charAt(0) == 'T' ? ' °C' : ' %'
                     tooltipContent += `<div class="d-flex justify-content-between">
                        <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                        <span class="text-right"><b>${valor} ${unidade}</b></span>
                     </div>`
                  })
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            grid: { left: '1%', right: '0%', bottom: '12%', containLabel: true },
            legend: { textStyle: { color: '#6c727a' }, top: 20, data: [{ name: 'Temp. plenum' }, { name: 'Umid. plenum' }, { name: 'Temp. estação' }, { name: 'Umid. estação' }, { name: 'Chuva' }, { name: 'Aeração' }], selected: { 'Temp. estação': false, 'Umid. estação': false, Chuva: false, Aeração: false }, type: 'scroll', orient: 'horizontal' },
            xAxis: {
               type: 'category',
               boundaryGap: false,
               data: this.dadosTemperatura?.data,
               axisLabel: {
                  formatter: function (value) {
                     return echarts.format.formatTime('dd/MM hh:mm', value)
                  }
               }
            },
            yAxis: [
               { type: 'value', position: 'left', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'orange' } }, axisLabel: { formatter: '{value} °C' } },
               { type: 'value', position: 'right', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'blue' } }, axisLabel: { formatter: '{value} %' } }
            ],
            series: [
               { name: 'Temp. estação', data: this.plenum.tempEstacao, type: 'line', yAxisIndex: 0, itemStyle: { color: 'orange' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Umid. estação', data: this.plenum.umidEstacao, type: 'line', yAxisIndex: 1, itemStyle: { color: 'blue' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Temp. plenum', data: this.plenum.tempPlenum, type: 'line', yAxisIndex: 0, itemStyle: { color: '#ffd633' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Umid. plenum', data: this.plenum.umidPlenum, type: 'line', yAxisIndex: 1, itemStyle: { color: '#3385ff' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Chuva', type: 'line', itemStyle: { color: 'lightblue' }, markArea: { data: markAreaChuva } },
               { name: 'Aeração', type: 'line', itemStyle: { color: 'lightgreen' }, markArea: { data: markAreaAeraLiga } }
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

<style>
</style>