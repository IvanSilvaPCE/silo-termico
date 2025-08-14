<template>
   <b-overlay :show="buscandoComparacao" rounded="sm" class="overlay">
      <b-row>
         <b-col sm="12" md="6">
            <b-form-group label="Data inicial">
               <b-form-datepicker v-model="dataInical" @input="buscarComparacao()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-form-group>
         </b-col>
         <b-col sm="12" md="6">
            <b-form-group label="Data final">
               <b-form-datepicker v-model="dataFinal" @input="buscarComparacao()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-form-group>
         </b-col>
      </b-row>
      <b-row ref="chartContainer">
         <b-col>
            <div ref="chart" style="width: 100%; height: 90vh"></div>
         </b-col>
      </b-row>
   </b-overlay>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'

export default {
   name: 'LimpezaPressaoMedia',
   data() {
      return {
         buscandoComparacao: false,
         comparacao: {},
         opcoesDoGrafico: {},
         datasOperacao: [],
         dataInical: this.$moment().subtract(14, 'days').format('YYYY-MM-DD'),
         dataFinal: this.$moment().format('YYYY-MM-DD')
      }
   },

   computed: {
      dataMinima() {
         return this.$moment(this.dataFinal).subtract(30, 'days').format('YYYY-MM-DD')
      }
   },

   mounted() {
      const idLimpezaLocalStorage = localStorage.getItem('lim')
      if (idLimpezaLocalStorage && idLimpezaLocalStorage != 'undefined') {
         this.idLimpeza = idLimpezaLocalStorage
      } else {
         this.idLimpeza = this.$route.params.idLimpeza
         localStorage.setItem('lim', this.idLimpeza)
      }

      if (this.opcoesDoGrafico) {
         this.initializeChart()
      }
      this.buscarComparacao()
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
      async buscarComparacao() {
         if (!this.idLimpeza) {
            return
         }
         this.buscandoComparacao = true
         const dados = await client.get(`/limpeza/buscarcompara/${this.idLimpeza}?inicio=${this.dataInical}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados para comparar. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoComparacao = false
         })
         this.buscandoComparacao = false
         if (dados && dados.data) {
            this.comparacao = dados.data
            this.construirGrafico()
            this.datasOperacao = this.comparacao.datasOperacao
         }
      },
      construirGrafico() {
         this.opcoesDoGrafico = {
            tooltip: {
               trigger: 'axis',
               axisPointer: {
                  animation: false
               },
               formatter: (params) => {
                  const date = params[0].value[0]
                  const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
                  params.forEach((param) => {
                     const serieName = param.seriesName.charAt(0)
                     let unidade = ''
                     if (serieName == 'V') {
                        unidade = 'mm/s'
                     } else if (serieName == 'P') {
                        unidade = 'mmCa'
                     } else if (serieName == 'C') {
                        unidade = 'A'
                     } else {
                        unidade = 'Hz'
                     }
                     tooltipContent += `<div class="d-flex justify-content-between">
                           <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                           <span class="text-right"><b>${param.value[1]} ${unidade}</b></span>
                        </div>`
                  })
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            legend: { textStyle: { color: '#6c727a' }, top: 10, type: 'scroll', orient: 'horizontal', selectedMode: false },
            toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            axisPointer: { link: [{ xAxisIndex: 'all' }] },
            dataZoom: [{ type: 'inside', start: 0, xAxisIndex: [0, 1, 2, 3] }, { start: 0 }],
            grid: [
               { left: 60, right: 50, height: '15%' },
               { left: 60, right: 50, top: '29%', height: '15%' },
               { left: 60, right: 50, top: '50%', height: '15%' },
               { left: 60, right: 50, top: '71%', height: '15%' }
            ],
            xAxis: [
               { show: false, type: 'time', boundaryGap: false, axisLine: { onZero: true } },
               { show: false, gridIndex: 1, type: 'time', boundaryGap: false, axisLine: { onZero: true }, position: 'disabled' },
               { show: false, gridIndex: 2, type: 'time', boundaryGap: false, axisLine: { onZero: true }, position: 'bottom' },
               {
                  gridIndex: 3,
                  type: 'time',
                  boundaryGap: false,
                  axisLine: { onZero: true },
                  position: 'bottom',
                  axisLabel: {
                     formatter: function (value) {
                        return echarts.format.formatTime('dd/MM', value)
                     }
                  }
               }
            ],
            yAxis: [
               { name: 'Vibração(mm/s)', type: 'value' },
               { gridIndex: 1, name: 'Pressão(mmCa)', type: 'value', inverse: false },
               { gridIndex: 2, name: 'Corrente(A)', type: 'value', inverse: false },
               { gridIndex: 3, name: 'Frequência(Hz)', type: 'value', inverse: false }
            ],
            series: [
               { name: 'Vibração', type: 'line', showSymbol: false, data: this.comparacao.vibracao },
               { name: 'Pressão', type: 'line', xAxisIndex: 1, yAxisIndex: 1, showSymbol: false, data: this.comparacao.pressao },
               { name: 'Corrente ventilador', type: 'line', xAxisIndex: 2, yAxisIndex: 2, showSymbol: false, data: this.comparacao.corrente },
               { name: 'Frequência aspirador', type: 'line', xAxisIndex: 3, yAxisIndex: 3, showSymbol: false, data: this.comparacao.velocidade }
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

.valor {
   font-size: 16px;
   font-weight: 400;
}
</style>