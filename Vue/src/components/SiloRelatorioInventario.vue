<template>
   <div v-if="inventario?.niv" class="mt-4">
      <div ref="chartContainer">
         <b-row>
            <b-col>
               <small v-if="inventario?.configuracao == '1'">Capacidade estimada pelo sensor de nível</small>
               <small v-else>Capacidade estimada pela termometria</small>
            </b-col>
         </b-row>
         <b-row style="page-break-after: auto">
            <b-col>
               <div ref="chartInventario" class="chartInventario" style="width: 100%; height: 600px"></div>
               <!-- <div ref="chartInventario" style="width: 1100px; height: 600px"></div> -->
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <b-table small striped bordered :items="inventario.tabela" :fields="fields">
                  <template #cell(volume)="row">
                     <span>{{ row.item.volume }} m³</span>
                  </template>
                  <template #cell(peso)="row">
                     <span>{{ row.item.peso }} ton</span>
                  </template>
                  <template #cell(nivel)="row">
                     <span>{{ row.item.nivel }} %</span>
                  </template>
               </b-table>
            </b-col>
         </b-row>
      </div>
   </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
   name: 'SiloRelatorioInventario',
   props: {
      inventario: [Array, Object],
      exportar: Boolean
   },

   data() {
      return {
         graficoInventario: {},
         fields: [
            { key: 'data', label: 'Data', thClass: 'text-center' },
            { key: 'grao', label: 'Grão', thClass: 'text-center' },
            { key: 'volume', label: 'Volume', thClass: 'text-center' },
            { key: 'peso', label: 'Peso', thClass: 'text-center' },
            { key: 'nivel', label: 'Capacidade', thClass: 'text-center' }
         ]
      }
   },

   methods: {
      construirGraficoInventario() {
         let legendaSelecionada = null
         const series = [
            { name: 'Volume', data: this.inventario?.vol, type: 'line', yAxisIndex: 0, itemStyle: { color: 'transparent' }, smooth: true, showSymbol: false },
            { name: 'Peso', data: this.inventario?.peso, type: 'line', yAxisIndex: 0, itemStyle: { color: 'transparent' }, smooth: true, showSymbol: false },
            { name: 'Nível manual', data: this.inventario?.niu, type: 'line', yAxisIndex: 0, itemStyle: { color: 'transparent' }, smooth: true, showSymbol: false },
            { name: 'Nível estimado', data: this.inventario?.configuracao === '1' ? this.inventario?.nie : this.inventario?.niv, type: 'line', yAxisIndex: 0, smooth: false, showSymbol: false, areaStyle: {} }
         ]
         if (this.inventario?.configuracao === '1') {
            legendaSelecionada = { 'Nível estimado': false, 'Nível corrigido': false }
            series.push({ name: 'Nível sensor', data: this.inventario?.nivelCorrigido, type: 'line', yAxisIndex: 0, smooth: false, showSymbol: false, areaStyle: {} })
         }
         this.inventario?.grao?.forEach((grao) => {
            const corProduto = this.formatarCorProduto(grao.vl_dado)

            series.push(
               {
                  name: 'Produto',
                  type: 'line',
                  data: [[grao.dt_param, 100]],
                  symbol: 'pin',
                  symbolSize: 40,
                  itemStyle: { color: corProduto },
                  label: { show: true, formatter: grao.descricao, position: 'bottom', color: '#4a4a4a', backgroundColor: corProduto, padding: [3, 5], borderRadius: 4 }
               },
               {
                  name: '',
                  type: 'line',
                  data: [
                     [grao.dt_param, 0],
                     [grao.dt_param, 100]
                  ],
                  symbol: 'none',
                  lineStyle: { color: corProduto, type: 'dashed', width: 2 },
                  tooltip: { show: false }
               }
            )
         })
         this.graficoInventario = {
            legend: { textStyle: { color: '#6c727a' }, top: 20, data: this.inventario?.configuracao == '1' ? ['Nível sensor', 'Nível estimado'] : ['Nível estimado'], selected: legendaSelecionada },
            xAxis: {
               type: 'time',
               boundaryGap: false,
               axisLabel: {
                  formatter: function (value) {
                     return echarts.format.formatTime('dd/MM hh:mm', value)
                  }
               }
            },
            yAxis: [{ type: 'value', position: 'left', alignTicks: true, max: 100, axisLabel: { formatter: '{value}%' } }],
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            grid: { left: '3%', right: '4%', bottom: '10%', top: '13%', containLabel: true },
            tooltip: {
               trigger: 'axis',
               formatter: (params) => {
                  const nivelManual = params[0]?.value[1] == 2 && params[0]?.seriesName == 'Nível manual' ? 'Nível informado manualmente' : ''
                  const date = params[0].value[0]
                  const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>${nivelManual}`
                  params.forEach((param) => {
                     if (param.seriesName && (param.seriesName == 'Nível manual' || param.seriesName == 'Produto')) {
                        return
                     }
                     let unidadeVariavel = '%'
                     if (param.seriesName == 'Volume') {
                        unidadeVariavel = 'm³'
                     } else if (param.seriesName == 'Peso') {
                        unidadeVariavel = 'ton'
                     }
                     tooltipContent += `<div class="d-flex justify-content-between">
                           <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                           <span class="text-right"><b>${param.value[1]} ${unidadeVariavel}</b></span>
                        </div>`
                  })
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            series: series
         }
         this.updateChart(this.chartInventario, this.graficoInventario)
      },
      initializeChartInventario() {
         this.chartInventario = echarts.init(this.$refs.chartInventario)
         if (this.graficoInventario) {
            this.chartInventario.setOption(this.graficoInventario)
         }
         this.chartInventario.on('legendselectchanged', this.selecionaLegenda)
      },
      updateChart(chart, novasOpcoes) {
         if (chart) {
            chart.setOption(novasOpcoes)
         }
      },
      handleResize() {
         if (this.chartInventario) {
            this.chartInventario.resize()
         }
      },
      selecionaLegenda(params) {
         const selected = params.selected
         const seriesNames = Object.keys(selected)
         if (selected[seriesNames[0]] && selected[seriesNames[1]]) {
            const lastClicked = params.name
            const newSelection = {
               [seriesNames[0]]: seriesNames[0] === lastClicked,
               [seriesNames[1]]: seriesNames[1] === lastClicked
            }
            this.$nextTick(() => {
               this.chartInventario.setOption({
                  legend: { selected: newSelection }
               })
            })
         }
      },
      formatarCorProduto(value) {
         const cor = {
            0: '#C9C9C9',
            1: '#D27D46',
            2: '#FFD700',
            3: '#F5DEB3',
            4: '#C2B280',
            5: '#A0522D',
            6: '#FFF8E7',
            7: '#B7410E'
         }
         return cor[value] || '#C9C9C9'
      }
   },

   watch: {
      inventario() {
         if (this.inventario?.niv) {
            setTimeout(() => {
               this.initializeChartInventario()
               this.construirGraficoInventario()

               this.resizeObserver = new ResizeObserver(this.handleResize)
               this.resizeObserver.observe(this.$refs.chartContainer)

               window.addEventListener('resize', this.handleResize)
            }, 100)
         }
      },
      exportar(newVal) {
         if (this.graficoInventario && this.inventario?.niv) {
            const ajustarTamanho = (container, width, height) => {
               container.style.width = width
               container.style.height = height
            }
            const width = newVal ? '1100px' : '100%'
            const height = '600px'
            ajustarTamanho(this.$refs.chartInventario, width, height)
            this.chartInventario.resize()
         }
      }
   }
}
</script>

<style>
</style>