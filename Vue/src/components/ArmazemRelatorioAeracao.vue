<template>
   <div v-if="aeracao?.aeracao" class="mt-4">
      <div ref="chartContainer">
         <b-row>
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Análise Aeração</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartAeracao" class="chartAeracao" style="width: 100%; height: 600px"></div>
            </b-col>
         </b-row>
         <b-row style="page-break-before: auto">
            <b-col>
               <b-table small striped bordered :items="aeracao.logProgramas" :fields="fields" responsive>
                  <template #thead-top>
                     <tr>
                        <th colspan="2" class="text-center">Programa Selecionado</th>
                     </tr>
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
   name: 'ArmazemRelatorioAeracao',
   props: {
      aeracao: [Array, Object],
      exportar: Boolean
   },

   data() {
      return {
         graficoAeracao: {},
         fields: [
            { key: 'dt_param', label: 'Data', thClass: 'text-center', formatter: 'formatarData' },
            { key: 'vl_dado', label: 'Programa', thClass: 'text-center', formatter: 'formatarPrograma' }
         ]
      }
   },

   methods: {
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
      },
      formatarPrograma(st_operacao) {
         const variant = {
            1: 'Programa livre',
            2: 'Programa secagem',
            3: 'Programa resfriamento',
            4: 'Programa conservação'
         }
         return variant[st_operacao]
      },
      construirGraficoAeracao() {
         this.graficoAeracao = {
            grid: { left: '1%', right: '1%', bottom: '1%', top: '10%', containLabel: true },
            tooltip: {
               trigger: 'axis',
               formatter: (params) => {
                  const date = params[0].value[0]
                  const [year, month, day] = date.split('-')
                  const formattedTime = `${day}/${month}/${year}`
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
                  params.forEach((param) => {
                     tooltipContent += `<div class="d-flex justify-content-between">
                        <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                        <span class="text-right"><b>${param.value[1]} ${param.componentSubType == 'bar' ? ' h' : ' °C'}</b></span>
                     </div>`
                  })
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            legend: { textStyle: { color: '#6c727a' }, data: ['Aeração', 'Máxima', 'Mínima', 'Média'] },
            xAxis: [
               {
                  type: 'time',
                  gridIndex: 0,
                  axisLabel: {
                     formatter: function (value) {
                        return echarts.format.formatTime('dd/MM', value)
                     }
                  }
               }
            ],
            yAxis: [
               {
                  type: 'value',
                  name: 'Horas',
                  min: 0,
                  max: 24,
                  alignTicks: true,
                  axisLabel: {
                     formatter: function (value) {
                        return `${Math.round(value)} h`
                     }
                  }
               },
               { type: 'value', name: 'Temperatura', min: 0, axisLabel: { formatter: '{value} °C' } }
            ],
            series: [
               { name: 'Aeração', type: 'bar', barMaxWidth: this.aeracao?.aeracao?.length <= 2 ? '5%' : undefined, data: this.aeracao?.aeracao },
               { name: 'Média', type: 'line', yAxisIndex: 1, showSymbol: false, data: this.aeracao?.tms },
               { name: 'Mínima', type: 'line', yAxisIndex: 1, showSymbol: false, data: this.aeracao?.tmi },
               { name: 'Máxima', type: 'line', yAxisIndex: 1, showSymbol: false, data: this.aeracao?.tma }
            ]
         }
         this.updateChart(this.chartAeracao, this.graficoAeracao)
      },
      initializeChartAeracao() {
         this.chartAeracao = echarts.init(this.$refs.chartAeracao)
         if (this.graficoAeracao) {
            this.chartAeracao.setOption(this.graficoAeracao)
         }
      },
      updateChart(chart, novasOpcoes) {
         if (chart) {
            chart.setOption(novasOpcoes)
         }
      },
      handleResize() {
         if (this.chartAeracao) {
            this.chartAeracao.resize()
         }
      }
   },

   watch: {
      aeracao() {
         if (this.aeracao?.tma) {
            setTimeout(() => {
               this.initializeChartAeracao()
               this.construirGraficoAeracao()

               this.resizeObserver = new ResizeObserver(this.handleResize)
               this.resizeObserver.observe(this.$refs.chartContainer)

               window.addEventListener('resize', this.handleResize)
            }, 100)
         }
      },
      exportar(newVal) {
         if (this.graficoAeracao && this.aeracao?.aeracao) {
            const ajustarTamanho = (container, width, height) => {
               container.style.width = width
               container.style.height = height
            }
            const width = newVal ? '1100px' : '100%'
            const height = '600px'
            ajustarTamanho(this.$refs.chartAeracao, width, height)
            this.chartAeracao.resize()
         }
      }
   }
}
</script>

<style scoped>
.fonte-tab {
   font-weight: 500;
}
</style>