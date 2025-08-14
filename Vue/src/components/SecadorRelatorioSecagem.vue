<template>
   <div v-show="secagem?.di?.length">
      <div class="mt-4" ref="chartContainer">
         <b-row>
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Análise Umidades</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartUmidade" class="chartUmidade" style="min-width: 100%; height: 600px"></div>
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
         <b-row v-show="secagem?.ue?.length" style="page-break-before: auto">
            <b-col cols="12">
               <b-table thead-class="text-center" sort-by="data" small striped bordered responsive :items="secagem.dadosTabela" :fields="fields">
                  <template #cell(grao)="row">
                     <span>{{ formatarProduto(row.item.grao) }}</span>
                  </template>
                  <template #cell(fluxo)="row">
                     <span>{{ formatarFluxo(row.item.fluxo) }}</span>
                  </template>
                  <template #cell(app)="row">
                     <span>{{ formatarApp(row.item.app) }}</span>
                  </template>
               </b-table>
            </b-col>
         </b-row>
         <b-row style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Análise Produção</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartProducao" class="chartProducao" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
      </div>
   </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
   name: 'SecadorRelatorioSecagem',
   props: {
      secagem: [Array, Object],
      fundoGrafico: String
   },

   data() {
      return {
         graficoUmidade: {},
         graficoProducao: {},
         fields: [
            { key: 'data', label: 'Data', sortable: true },
            { key: 'grao', label: 'Grão' },
            { key: 'fluxo', label: 'Fluxo' },
            { key: 'umEntrada', label: 'Um Entrada' },
            { key: 'umSaida', label: 'Um Saída' },
            { key: 'umSaida', label: 'Um Saída' },
            { key: 'temp1', label: 'T1' },
            { key: 'temp2', label: 'T2' },
            { key: 'temp3', label: 'T3' },
            { key: 'app', label: 'Origem' }
         ]
      }
   },

   methods: {
      construirGraficoUmidade() {
         let markAreasGrafico = []
         const adicionarMarkArea = (dados, cor) => {
            if (!dados) return
            dados.forEach((item) => {
               markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
            })
         }
         if (this.fundoGrafico === 'fluxo') {
            adicionarMarkArea(this.secagem.fluxos?.continuo, 'rgba(42, 154, 57, 0.3)')
            adicionarMarkArea(this.secagem.fluxos?.rodizio, 'rgba(163, 254, 44, 0.3)')
         } else if (this.fundoGrafico === 'operacao') {
            adicionarMarkArea(this.secagem.operacoes?.desligado, 'transparent')
            adicionarMarkArea(this.secagem.operacoes?.carga, 'transparent')
            adicionarMarkArea(this.secagem.operacoes?.carregado, 'transparent')
            adicionarMarkArea(this.secagem.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
            adicionarMarkArea(this.secagem.operacoes?.descarga, 'rgba(64, 206, 253, 0.3)')
         } else {
            markAreasGrafico = []
         }

         this.graficoUmidade = {
            tooltip: {
               trigger: 'axis',
               formatter: (params) => {
                  const date = params[0].value[0]
                  const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
                  params.forEach((param) => {
                     tooltipContent += `<div class="d-flex justify-content-between">
                     <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                     <span class="text-right"><b>${param.value[1]} %</b></span>
                  </div>`
                  })
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            legend: { textStyle: { color: '#6c727a' }, top: 25, data: ['U1', 'U2', 'Objetivo'] },
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
            yAxis: { type: 'value', name: 'mmCa', splitNumber: 10 },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            series: [
               { name: 'U1', type: 'line', showSymbol: false, data: this.secagem.ue, markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'U2', type: 'line', showSymbol: false, data: this.secagem.us, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'Objetivo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.secagem.uo, tooltip: { valueFormatter: (value) => value + ' %' } }
            ]
         }

         this.updateChart(this.chartUmidade, this.graficoUmidade)
      },
      construirGraficoProducao() {
         let markAreasGrafico = []
         const adicionarMarkArea = (dados, cor) => {
            if (!dados) return
            dados.forEach((item) => {
               markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
            })
         }
         if (this.fundoGrafico === 'fluxo') {
            adicionarMarkArea(this.secagem.fluxos?.continuo, 'rgba(42, 154, 57, 0.3)')
            adicionarMarkArea(this.secagem.fluxos?.rodizio, 'rgba(163, 254, 44, 0.3)')
         } else if (this.fundoGrafico === 'operacao') {
            adicionarMarkArea(this.secagem.operacoes?.desligado, 'transparent')
            adicionarMarkArea(this.secagem.operacoes?.carga, 'transparent')
            adicionarMarkArea(this.secagem.operacoes?.carregado, 'transparent')
            adicionarMarkArea(this.secagem.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
            adicionarMarkArea(this.secagem.operacoes?.descarga, 'rgba(64, 206, 253, 0.3)')
         } else {
            markAreasGrafico = []
         }

         this.graficoProducao = {
            tooltip: {
               trigger: 'axis',
               formatter: (params) => {
                  const date = params[0].value[0]
                  const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
                  params.forEach((param) => {
                     tooltipContent += `<div class="d-flex justify-content-between">
                     <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                     <span class="text-right"><b>${param.value[1]} ton/h</b></span>
                  </div>`
                  })
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            legend: { textStyle: { color: '#6c727a' }, top: 25, data: ['Produção'] },
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
            yAxis: { type: 'value', name: 'ton/h', splitNumber: 10 },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            series: [{ name: 'Produção', type: 'line', showSymbol: false, data: this.secagem.di, markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' ton/h' } }]
         }

         this.updateChart(this.chartProducao, this.graficoProducao)
      },
      initializeChartUmidade() {
         this.chartUmidade = echarts.init(this.$refs.chartUmidade)
      },
      initializeChartProducao() {
         this.chartProducao = echarts.init(this.$refs.chartProducao)
      },
      updateChart(chart, novasOpcoes) {
         if (chart) {
            chart.setOption(novasOpcoes)
         }
      },
      handleResize() {
         if (this.chartUmidade) {
            this.chartUmidade.resize()
         }
         if (this.chartProducao) {
            this.chartProducao.resize()
         }
      },
      formatarProduto(value) {
         const produto = {
            1: 'Soja',
            2: 'Milho',
            3: 'Trigo',
            4: 'Arroz',
            5: 'Semente',
            6: 'Outro'
         }
         return produto[value]
      },
      formatarFluxo(value) {
         const fluxo = {
            0: 'Contínuo',
            1: 'Rodízio'
         }
         return fluxo[value]
      },
      formatarApp(value) {
         const app = {
            0: 'IHM',
            1: 'App'
         }
         return app[value]
      }
   },

   watch: {
      secagem() {
         if (this.secagem?.di) {
            setTimeout(() => {
               this.initializeChartUmidade()
               this.construirGraficoUmidade()
               this.initializeChartProducao()
               this.construirGraficoProducao()

               this.resizeObserver = new ResizeObserver(this.handleResize)
               this.resizeObserver.observe(this.$refs.chartContainer)

               window.addEventListener('resize', this.handleResize)
            }, 100)
         }
      },
      fundoGrafico() {
         if (this.secagem?.di) {
            this.construirGraficoUmidade()
            this.construirGraficoProducao()
         }
      }
   },

   beforeDestroy() {
      if (this.chartUmidade) {
         this.chartUmidade.dispose()
      }
      if (this.chartProducao) {
         this.chartProducao.dispose()
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