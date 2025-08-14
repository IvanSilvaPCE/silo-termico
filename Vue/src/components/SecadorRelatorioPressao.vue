<template>
   <div v-if="pressao?.p1?.length">
      <div class="mt-4" ref="chartContainer">
         <b-row>
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Análise Depressões</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartPressao" class="chartPressao" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Pressão P1</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartPressaoP1" class="chartPressaoP1" style="min-width: 100%; height: 600px"></div>
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
         <b-row style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Pressão P2</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartPressaoP2" class="chartPressaoP2" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Pressão P3</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartPressaoP3" class="chartPressaoP3" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Pressão P4</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartPressaoP4" class="chartPressaoP4" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Pressão P5</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartPressaoP5" class="chartPressaoP5" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
      </div>
   </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
   name: 'SecadorRelatorioPressao',
   props: {
      pressao: [Array, Object],
      fundoGrafico: String
   },

   data() {
      return {
         graficoPressao: {}
      }
   },

   computed: {
      chavesPressao() {
         return Object.keys(this.pressao)
            .filter((chave) => chave.startsWith('p') && !chave.startsWith('pa') && !chave.startsWith('pb'))
            .sort((a, b) => {
               const numA = parseInt(a.slice(1))
               const numB = parseInt(b.slice(1))
               return numA - numB
            })
      }
   },

   methods: {
      construirGraficoPressao() {
         let seriesGrafico = this.chavesPressao.map((chave) => ({
            name: chave.toUpperCase(),
            type: 'line',
            showSymbol: false,
            data: this.pressao[chave.replace(/s/g, 'p')],
            tooltip: { valueFormatter: (value) => value + ' mmCa' }
         }))

         const formatTooltip = (params) => {
            const date = params[0].value[0]
            const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
            let tooltipContent = `<div class="text-left">${formattedTime}<br/>`

            params.forEach((param) => {
               tooltipContent += `<div class="d-flex justify-content-between">
                  <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                  <span class="text-right"><b>${param.value[1]} mmCa</b></span>
                  </div>`
            })

            tooltipContent += '</div>'
            return tooltipContent
         }

         this.graficoPressao = {
            tooltip: { trigger: 'axis', formatter: formatTooltip },
            legend: { textStyle: { color: '#6c727a' }, top: 15, data: this.chavesPressao.map((item) => item.toUpperCase()), type: 'scroll', orient: 'horizontal' },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: { type: 'time', boundaryGap: false, axisLabel: { formatter: (value) => echarts.format.formatTime('dd/MM hh:mm', value) } },
            yAxis: { type: 'value', name: 'mmCa', splitNumber: 10, axisLabel: { show: true } },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            series: seriesGrafico
         }
         this.updateChart(this.chartPressao, this.graficoPressao)
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
            adicionarMarkArea(this.pressao.fluxos?.continuo, 'rgba(42, 154, 57, 0.3)')
            adicionarMarkArea(this.pressao.fluxos?.rodizio, 'rgba(163, 254, 44, 0.3)')
         } else if (this.fundoGrafico === 'operacao') {
            adicionarMarkArea(this.pressao.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
            adicionarMarkArea(this.pressao.operacoes?.carga, 'rgba(254, 254, 49, 0.3)')
            adicionarMarkArea(this.pressao.operacoes?.carregado, 'rgba(247, 96, 28, 0.3)')
            adicionarMarkArea(this.pressao.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
            adicionarMarkArea(this.pressao.operacoes?.descarga, 'rgba(64, 206, 253, 0.3)')
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
                     <span class="text-right"><b>${param.value[1]} mmCa</b></span>
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
            yAxis: { type: 'value', name: '%', splitNumber: 10 },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            series: [
               { name: variavel.toUpperCase(), type: 'line', showSymbol: false, data: this.pressao[`p${variavel.substr(1, 4)}`], markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' mmCa' } },
               { name: 'Máximo', type: 'line', showSymbol: false, lineStyle: { color: 'red', type: 'dashed' }, itemStyle: { color: 'red' }, data: this.pressao[`pa${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' mmCa' } },
               { name: 'Mínimo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.pressao[`pb${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' mmCa' } }
            ]
         }
         this.updateChart(chart, opcoesDoGrafico)
      },
      initializeChartPressao() {
         this.chartPressao = echarts.init(this.$refs.chartPressao)
         this.chartPressaoP1 = echarts.init(this.$refs.chartPressaoP1)
         this.chartPressaoP2 = echarts.init(this.$refs.chartPressaoP2)
         this.chartPressaoP3 = echarts.init(this.$refs.chartPressaoP3)
         this.chartPressaoP4 = echarts.init(this.$refs.chartPressaoP4)
         this.chartPressaoP5 = echarts.init(this.$refs.chartPressaoP5)
      },
      updateChart(chart, novasOpcoes) {
         if (chart) {
            chart.setOption(novasOpcoes)
         }
      },
      handleResize() {
         if (this.chartPressao) {
            this.chartPressao.resize()
         }
      }
   },

   watch: {
      pressao() {
         if (this.pressao?.p1) {
            setTimeout(() => {
               this.initializeChartPressao()
               this.construirGraficoPressao()

               this.chavesPressao.forEach((chave) => {
                  const chart = this[`chartPressao${chave.toUpperCase()}`]
                  this.construirGraficoVariavel(chart, chave)
               })

               this.resizeObserver = new ResizeObserver(this.handleResize)
               this.resizeObserver.observe(this.$refs.chartContainer)

               window.addEventListener('resize', this.handleResize)
            }, 100)
         }
      },
      fundoGrafico() {
         if (this.pressao?.p1) {
            this.chavesPressao.forEach((chave) => {
               const chart = this[`chartPressao${chave.toUpperCase()}`]
               this.construirGraficoVariavel(chart, chave)
            })
         }
      }
   },

   beforeDestroy() {
      if (this.chartPressao) {
         this.chartPressao.dispose()
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