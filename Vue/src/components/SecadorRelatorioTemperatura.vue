<template>
   <div v-if="temperatura?.t1?.length">
      <div class="mt-4" ref="chartContainer">
         <b-row>
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Análise Temperaturas</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartTemperatura" class="chartTemperatura" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Temperatura S1</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartTemperaturaS1" class="chartTemperaturaS1" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row>
            <b-col v-if="fundoGrafico == 'fluxo'" class="d-flex align-items-center mt-2">
               <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(42, 154, 57, 0.4); border: none">&nbsp;</b-badge>
               <p class="m-0">Contínuo</p>
            </b-col>
            <b-col v-if="fundoGrafico == 'fluxo'" class="d-flex align-items-center mt-2">
               <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(163, 254, 44, 0.4); border: none">&nbsp;</b-badge>
               <p class="m-0">Rodízio</p>
            </b-col>

            <b-col v-if="fundoGrafico == 'operacao'" class="d-flex align-items-center mt-2">
               <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(194, 192, 192, 0.4); border: 1px solid lightgrey">&nbsp;</b-badge>
               <p class="m-0">Desligado</p>
            </b-col>
            <b-col v-if="fundoGrafico == 'operacao'" class="d-flex align-items-center mt-2">
               <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(254, 254, 49, 0.4); border: none">&nbsp;</b-badge>
               <p class="m-0">Em carga</p>
            </b-col>
            <b-col v-if="fundoGrafico == 'operacao'" class="d-flex align-items-center mt-2">
               <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(247, 96, 28, 0.4); border: none">&nbsp;</b-badge>
               <p class="m-0">Carregado</p>
            </b-col>
            <b-col v-if="fundoGrafico == 'operacao'" class="d-flex align-items-center mt-2">
               <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(77, 205, 60, 0.4); border: none">&nbsp;</b-badge>
               <p class="m-0">Em secagem</p>
            </b-col>
            <b-col v-if="fundoGrafico == 'operacao'" class="d-flex align-items-center mt-2">
               <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(64, 206, 253, 0.4); border: none">&nbsp;</b-badge>
               <p class="m-0">Em descarga</p>
            </b-col>
         </b-row>
         <b-row v-show="chavesTemperatura.includes('s1.1')" style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Temperatura S1.1</b></p>
            </b-col>
         </b-row>
         <b-row v-show="chavesTemperatura.includes('s1.1')">
            <b-col>
               <div ref="chartTemperaturaS1.1" class="chartTemperaturaS1_1" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Temperatura S2</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartTemperaturaS2" class="chartTemperaturaS2" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row v-show="chavesTemperatura.includes('s2.1')" style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Temperatura S2.1</b></p>
            </b-col>
         </b-row>
         <b-row v-show="chavesTemperatura.includes('s2.1')">
            <b-col>
               <div ref="chartTemperaturaS2.1" class="chartTemperaturaS2_1" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Temperatura S3</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartTemperaturaS3" class="chartTemperaturaS3" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row v-show="chavesTemperatura.includes('s3.1')" style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Temperatura S3.1</b></p>
            </b-col>
         </b-row>
         <b-row v-show="chavesTemperatura.includes('s3.1')">
            <b-col>
               <div ref="chartTemperaturaS3.1" class="chartTemperaturaS3_1" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
      </div>
   </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
   name: 'SecadorRelatorioTemperatura',
   props: {
      temperatura: [Array, Object],
      fundoGrafico: String
   },

   data() {
      return {
         graficoTemperatura: {}
      }
   },

   computed: {
      chavesTemperatura() {
         return Object.keys(this.temperatura)
            .filter((chave) => chave.startsWith('t') && !chave.startsWith('ta') && !chave.startsWith('tb') && !chave.startsWith('to'))
            .map((chave) => 's' + chave.slice(1))
            .sort((a, b) => {
               const numA = parseInt(a.slice(1))
               const numB = parseInt(b.slice(1))
               return numA - numB
            })
      }
   },

   methods: {
      construirGraficoTemperatura() {
         let seriesGrafico = this.chavesTemperatura.map((chave) => ({
            name: chave.toUpperCase(),
            type: 'line',
            showSymbol: false,
            data: this.temperatura[chave.replace(/s/g, 't')],
            tooltip: { valueFormatter: (value) => value + ' °C' }
         }))

         const formatTooltip = (params) => {
            const date = params[0].value[0]
            const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
            let tooltipContent = `<div class="text-left">${formattedTime}<br/>`

            params.forEach((param) => {
               tooltipContent += `<div class="d-flex justify-content-between">
                  <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                  <span class="text-right"><b>${param.value[1]} °C</b></span>
                  </div>`
            })

            tooltipContent += '</div>'
            return tooltipContent
         }

         this.graficoTemperatura = {
            tooltip: { trigger: 'axis', formatter: formatTooltip },
            legend: { textStyle: { color: '#6c727a' }, top: 15, data: this.chavesTemperatura.map((item) => item.toUpperCase()), type: 'scroll', orient: 'horizontal' },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: { type: 'time', boundaryGap: false, axisLabel: { formatter: (value) => echarts.format.formatTime('dd/MM hh:mm', value) } },
            yAxis: { type: 'value', name: '°C', splitNumber: 10, axisLabel: { show: true } },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            series: seriesGrafico
         }
         this.updateChart(this.chartTemperatura, this.graficoTemperatura)
      },
      construirGraficoVariavel(chart, variavel) {
         let markAreasGrafico = []
         const adicionarMarkArea = (dados, cor) => {
            if (!dados) return
            dados.forEach((item) => {
               markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
            })
         }
         if (this.fundoGrafico === 'fluxo') {
            adicionarMarkArea(this.temperatura.fluxos?.continuo, 'rgba(42, 154, 57, 0.3)')
            adicionarMarkArea(this.temperatura.fluxos?.rodizio, 'rgba(163, 254, 44, 0.3)')
         } else if (this.fundoGrafico === 'operacao') {
            adicionarMarkArea(this.temperatura.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
            adicionarMarkArea(this.temperatura.operacoes?.carga, 'rgba(254, 254, 49, 0.3)')
            adicionarMarkArea(this.temperatura.operacoes?.carregado, 'rgba(247, 96, 28, 0.3)')
            adicionarMarkArea(this.temperatura.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
            adicionarMarkArea(this.temperatura.operacoes?.descarga, 'rgba(64, 206, 253, 0.3)')
         } else {
            markAreasGrafico = []
         }

         let opcoesDoGrafico = {
            tooltip: {
               trigger: 'axis',
               formatter: (params) => {
                  const date = params[0].value[0]
                  const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
                  params.forEach((param) => {
                     tooltipContent += `<div class="d-flex justify-content-between">
                     <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                     <span class="text-right"><b>${param.value[1]} °C</b></span>
                  </div>`
                  })
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            legend: { textStyle: { color: '#6c727a' }, top: 25, data: [variavel.toUpperCase(), 'Máximo', 'Mínimo'] },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: {
               type: 'time',
               boundaryGap: false,
               axisLabel: {
                  formatter: function (value) {
                     return echarts.format.formatTime('dd/MM hh:mm', value)
                  }
               }
            },
            yAxis: { type: 'value', name: '°C', splitNumber: 10 },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            series: [
               { name: variavel.toUpperCase(), type: 'line', showSymbol: false, data: this.temperatura[`t${variavel.substr(1, 4)}`], markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Máximo', type: 'line', showSymbol: false, lineStyle: { color: 'red', type: 'dashed' }, itemStyle: { color: 'red' }, data: this.temperatura[`ta${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Mínimo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.temperatura[`tb${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' °C' } }
            ]
         }
         this.updateChart(chart, opcoesDoGrafico)
      },
      initializeChartTemperatura() {
         this.chartTemperatura = echarts.init(this.$refs.chartTemperatura)
         this.chartTemperaturaS1 = echarts.init(this.$refs.chartTemperaturaS1)
         this.chartTemperaturaS2 = echarts.init(this.$refs.chartTemperaturaS2)
         this.chartTemperaturaS3 = echarts.init(this.$refs.chartTemperaturaS3)
         this['chartTemperaturaS1.1'] = echarts.init(this.$refs['chartTemperaturaS1.1'])
         this['chartTemperaturaS2.1'] = echarts.init(this.$refs['chartTemperaturaS2.1'])
         this['chartTemperaturaS3.1'] = echarts.init(this.$refs['chartTemperaturaS3.1'])
         if (this.graficoTemperatura) {
            this.chartTemperatura.setOption(this.graficoTemperatura)
         }
      },
      updateChart(chart, novasOpcoes) {
         if (chart) {
            chart.setOption(novasOpcoes)
         }
      },
      handleResize() {
         if (this.chartTemperatura) {
            this.chartTemperatura.resize()
            this.chartTemperaturaS1.resize()
            this.chartTemperaturaS2.resize()
            this.chartTemperaturaS3.resize()
            this['chartTemperaturaS1.1'].resize()
            this['chartTemperaturaS2.1'].resize()
            this['chartTemperaturaS3.1'].resize()
         }
      }
   },

   watch: {
      temperatura() {
         if (this.temperatura?.t1) {
            setTimeout(() => {
               this.initializeChartTemperatura()
               this.construirGraficoTemperatura()

               this.chavesTemperatura.forEach((chave) => {
                  const chart = this[`chartTemperatura${chave.toUpperCase()}`]
                  this.construirGraficoVariavel(chart, chave)
               })

               this.resizeObserver = new ResizeObserver(this.handleResize)
               this.resizeObserver.observe(this.$refs.chartContainer)

               window.addEventListener('resize', this.handleResize)
            }, 100)
         }
      },
      fundoGrafico() {
         if (this.temperatura?.t1) {
            this.chavesTemperatura.forEach((chave) => {
               const chart = this[`chartTemperatura${chave.toUpperCase()}`]
               this.construirGraficoVariavel(chart, chave)
            })
         }
      }
   },

   beforeDestroy() {
      if (this.chartTemperatura) {
         this.chartTemperatura.dispose()
      }
      if (this.resizeObserver) {
         this.resizeObserver.disconnect()
      }
      window.removeEventListener('resize', this.handleResize)
   }
}
</script>

<style scoped>
.fonte-tab {
   font-weight: 500;
}
</style>