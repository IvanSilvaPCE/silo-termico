<template>
   <div v-if="acionamento?.descarga?.length">
      <div class="mt-4" ref="chartContainer">
         <b-row>
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Análise Acionamentos</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartAcionamento" class="chartAcionamento" style="min-width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <b-table-simple hover small class="mt-2">
                  <b-thead>
                     <b-tr>
                        <b-th colspan="2" class="text-center">Tempo de acionamento no período</b-th>
                     </b-tr>
                  </b-thead>
                  <b-tbody>
                     <b-tr>
                        <b-td>Exaustor</b-td>
                        <b-td>{{ this.acionamento?.exaustorTempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-td>Transportador</b-td>
                        <b-td>{{ this.acionamento?.transportadorTempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-td>Descarga</b-td>
                        <b-td>{{ this.acionamento?.descargaTempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-td>Carga</b-td>
                        <b-td>{{ this.acionamento?.cargaTempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamento?.minimo1Tempo != null">
                        <b-td>Nível mínimo 1</b-td>
                        <b-td>{{ this.acionamento?.minimo1Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamento?.maximo1Tempo != null">
                        <b-td>Nível máximo 1</b-td>
                        <b-td>{{ this.acionamento?.maximo1Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamento?.minimo2Tempo != null">
                        <b-td>Nível mínimo 2</b-td>
                        <b-td>{{ this.acionamento?.minimo2Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamento?.maximo2Tempo != null">
                        <b-td>Nível máximo 2</b-td>
                        <b-td>{{ this.acionamento?.maximo2Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamento?.minimo3Tempo != null">
                        <b-td>Nível mínimo 3</b-td>
                        <b-td>{{ this.acionamento?.minimo3Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamento?.maximo3Tempo != null">
                        <b-td>Nível máximo 3</b-td>
                        <b-td>{{ this.acionamento?.maximo3Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamento?.minimo4Tempo != null">
                        <b-td>Nível mínimo 4</b-td>
                        <b-td>{{ this.acionamento?.minimo4Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamento?.maximo4Tempo != null">
                        <b-td>Nível máximo 4</b-td>
                        <b-td>{{ this.acionamento?.maximo4Tempo || 0 }} h</b-td>
                     </b-tr>
                  </b-tbody>
               </b-table-simple>
            </b-col>
         </b-row>
      </div>
   </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
   name: 'SecadorRelatorioAcionamento',
   props: {
      acionamento: [Array, Object],
      fundoGrafico: String,
      chavesAcionamentos: Array
   },

   data() {
      return {
         graficoAcionamento: {}
      }
   },

   methods: {
      construirGraficoAcionamento() {
         let markAreasGrafico = []
         const adicionarMarkArea = (dados, cor) => {
            if (!dados) return
            dados.forEach((item) => {
               markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
            })
         }

         adicionarMarkArea(this.acionamento.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
         adicionarMarkArea(this.acionamento.operacoes?.descarga, 'rgba(254, 254, 49, 0.3)')
         adicionarMarkArea(this.acionamento.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
         adicionarMarkArea(this.acionamento.operacoes?.carga, 'rgba(64, 206, 253, 0.3)')

         const coresNiveis = {
            'Nível mínimo 1': '#8FDEAD',
            'Nível máximo 1': '#78D39A',
            'Nível mínimo 2': '#5CC982',
            'Nível máximo 2': '#3FBF6B',
            'Nível mínimo 3': '#2E9F5E',
            'Nível máximo 3': '#258050',
            'Nível mínimo 4': '#1D6641',
            'Nível máximo 4': '#154D33'
         }

         let legendaGrafico = ['Exaustor', 'Transportador', 'Descarga', 'Elevador']
         let seriesGrafico = [
            { name: 'Transportador', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#72BFE5' }, itemStyle: { color: '#72BFE5' }, data: this.acionamento.transportador },
            { name: 'Descarga', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#3CA6DA' }, itemStyle: { color: '#3CA6DA' }, data: this.acionamento.descarga },
            { name: 'Elevador', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#1E6FBA' }, itemStyle: { color: '#1E6FBA' }, data: this.acionamento.elevador },
            { name: 'Exaustor', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#18559a' }, itemStyle: { color: '#18559a' }, data: this.acionamento.exaustor },
            { name: '', type: 'line', showSymbol: false, lineStyle: { opacity: 0 }, markArea: { data: markAreasGrafico }, tooltip: { show: false } }
         ]

         this.chavesAcionamentos.forEach((chave) => {
            seriesGrafico.push({ name: chave, type: 'line', showSymbol: false, lineStyle: { width: 20, color: coresNiveis[chave] }, itemStyle: { color: coresNiveis[chave] }, data: this.acionamento[chave] })
            legendaGrafico.push(chave)
         })

         this.graficoAcionamento = {
            tooltip: {
               trigger: 'axis',
               formatter: (params) => {
                  const date = params[0].value[0]
                  const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
                  const grouped = {}
                  params.forEach((param) => {
                     if (!grouped[param.seriesName]) grouped[param.seriesName] = param
                  })
                  Object.values(grouped).forEach((param) => {
                     tooltipContent += `<div class="d-flex justify-content-between">
                  <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                  <span class="text-right"><b>${param.value[1] === 'erro' ? '-' : 'Acionado'}</b></span>
                  </div>`
                  })
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            legend: { textStyle: { color: '#6c727a' }, top: 15, data: legendaGrafico, type: 'scroll', orient: 'horizontal' },
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
            yAxis: { type: 'value', name: '', splitNumber: 10, axisLabel: { show: false } },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            series: seriesGrafico
         }

         this.updateChart(this.chartAcionamento, this.graficoAcionamento)
      },
      initializeChartAcionamento() {
         this.chartAcionamento = echarts.init(this.$refs.chartAcionamento)
      },
      updateChart(chart, novasOpcoes) {
         if (chart) {
            chart.setOption(novasOpcoes)
         }
      },
      handleResize() {
         if (this.chartAcionamento) {
            this.chartAcionamento.resize()
         }
      }
   },

   watch: {
      acionamento() {
         if (this.acionamento?.descarga) {
            setTimeout(() => {
               this.initializeChartAcionamento()
               this.construirGraficoAcionamento()

               this.resizeObserver = new ResizeObserver(this.handleResize)
               this.resizeObserver.observe(this.$refs.chartContainer)

               window.addEventListener('resize', this.handleResize)
            }, 100)
         }
      }
   },

   beforeDestroy() {
      if (this.chartAcionamento) {
         this.chartAcionamento.dispose()
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