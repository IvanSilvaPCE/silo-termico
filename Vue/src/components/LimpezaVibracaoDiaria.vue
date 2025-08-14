<template>
   <b-overlay :show="buscandoVibracao" rounded="sm" class="overlay">
      <b-row>
         <b-col sm="12" md="6">
            <b-form-datepicker v-model="data" @input="buscarVibracao()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
         </b-col>
      </b-row>
      <b-row class="justify-content-center d-flex overflow-auto">
         <b-col cols="12">
            <b-list-group horizontal class="mt-2">
               <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Vibração média">
                  <b-badge variant="primary" class="valor mr-1">Méd</b-badge>
                  <small class="valor">{{ this.vibracao?.vibracao && this.vibracao.vibracao.length ? (this.vibracao.vibracao.reduce((acc, val) => acc + (isNaN(parseFloat(val[1])) ? 0 : parseFloat(val[1])), 0) / this.vibracao.vibracao.length).toFixed(1) : '-' }}</small>
                  <small class="ml-1">mm/s</small>
               </b-list-group-item>
               <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Vibração mínima">
                  <b-badge variant="primary" class="valor mr-1">Mín</b-badge>
                  <small class="valor">{{ this.vibracao?.vibracao && this.vibracao.vibracao.length ? Math.min(...this.vibracao.vibracao.map((item) => parseFloat(item[1]))) : '-' }}</small>
                  <small class="ml-1">mm/s</small>
               </b-list-group-item>
               <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Vibração máxima">
                  <b-badge variant="primary" class="valor mr-1">Máx</b-badge>
                  <small class="valor">{{ this.vibracao?.vibracao && this.vibracao.vibracao.length ? Math.max(...this.vibracao.vibracao.map((item) => parseFloat(item[1]))) : '-' }}</small>
                  <small class="ml-1">mm/s</small>
               </b-list-group-item>
            </b-list-group>
         </b-col>
      </b-row>
      <b-row ref="chartContainer">
         <b-col>
            <div ref="chart" style="width: 100%; height: 60vh"></div>
         </b-col>
      </b-row>
   </b-overlay>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'

export default {
   name: 'LimpezaVibracaoDiaria',
   data() {
      return {
         buscandoVibracao: false,
         vibracao: {},
         opcoesDoGrafico: {},
         datasOperacao: [],
         data: this.$moment().format('YYYY-MM-DD')
      }
   },

   computed: {},

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
      this.buscarVibracao()
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
      async buscarVibracao() {
         if (!this.idLimpeza) {
            return
         }
         this.buscandoVibracao = true
         const dados = await client.get(`/limpeza/buscarvibracaodiaria/${this.idLimpeza}?data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar vibração diária. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoVibracao = false
         })
         this.buscandoVibracao = false
         if (dados && dados.data) {
            this.vibracao = dados.data
            this.construirGrafico(this.vibracao)
            this.datasOperacao = this.vibracao.datasOperacao
         }
      },
      construirGrafico() {
         this.opcoesDoGrafico = {
            toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            tooltip: {
               trigger: 'axis',
               formatter: (params) => {
                  const date = new Date(params[0].value[0])
                  const formattedTime = `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
                  params.forEach((param) => {
                     tooltipContent += `<div class="d-flex justify-content-between">
                     <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                     <span class="text-right"><b>${param.value[1]} mm/s</b></span>
                  </div>`
                  })
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            legend: { textStyle: { color: '#6c727a' }, top: 25 },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: { type: 'time', boundaryGap: false },
            yAxis: { name: 'V(mm/s)', type: 'value' },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            series: [
               {
                  name: 'Vibração',
                  tooltip: { valueFormatter: (value) => value + ' mm/s' },
                  data: this.vibracao.vibracao,
                  type: 'line',
                  showSymbol: false,
                  lineStyle: { color: '#9dc3eb' },
                  itemStyle: { color: '#9dc3eb' },
                  areaStyle: {
                     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#8ec2f4' },
                        { offset: 1, color: 'white' }
                     ])
                  }
               },
               {
                  name: 'Vibração máxima',
                  tooltip: { valueFormatter: (value) => value + ' mm/s' },
                  data: this.vibracao.limite,
                  type: 'line',
                  showSymbol: false,
                  lineStyle: { color: 'red', type: 'dashed' },
                  itemStyle: { color: 'red' }
               }
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