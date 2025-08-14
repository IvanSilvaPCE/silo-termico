<template>
   <b-overlay :show="buscandoHorimetro" rounded="sm" class="overlay">
      <b-row>
         <b-col sm="12" md="6">
            <b-form-group label="Data inicial">
               <b-form-datepicker v-model="dataInical" @input="buscarHorimetro()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-form-group>
         </b-col>
         <b-col sm="12" md="6">
            <b-form-group label="Data final">
               <b-form-datepicker v-model="dataFinal" @input="buscarHorimetro()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-form-group>
         </b-col>
      </b-row>
      <b-row class="justify-content-center d-flex overflow-auto">
         <b-col cols="12">
            <b-list-group horizontal class="mt-2">
               <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Total de horas">
                  <b-badge variant="primary" class="valor mr-1">Hor</b-badge>
                  <small class="valor">{{ this.horimetro?.horasTotal }} h</small>
               </b-list-group-item>
               <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Horas manual">
                  <b-badge variant="primary" class="valor mr-1 manual">Man</b-badge>
                  <small class="valor">{{ this.horimetro?.horasManual }} h</small>
               </b-list-group-item>
               <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Horas automático">
                  <b-badge variant="primary" class="valor mr-1 automatico">Aut</b-badge>
                  <small class="valor">{{ this.horimetro?.horasAutomatico }} h</small>
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
   name: 'LimpezaHorimetro',
   data() {
      return {
         buscandoHorimetro: false,
         horimetro: {},
         opcoesDoGrafico: {},
         datasOperacao: [],
         dataInical: this.$moment().subtract(9, 'days').format('YYYY-MM-DD'),
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
      this.buscarHorimetro()
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
      async buscarHorimetro() {
         if (!this.idLimpeza) {
            return
         }
         this.buscandoHorimetro = true
         const dados = await client.get(`/limpeza/buscarhorimetro/${this.idLimpeza}?inicio=${this.dataInical}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar horímetro. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoHorimetro = false
         })
         this.buscandoHorimetro = false
         if (dados && dados.data) {
            this.horimetro = dados.data
            this.datasOperacao = this.horimetro.datasOperacao
            this.construirGrafico()
         }
      },
      construirGrafico() {
         this.opcoesDoGrafico = {
            toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
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
            legend: { textStyle: { color: '#6c727a' }, top: 25 },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            yAxis: { type: 'value', max: 24, axisLabel: { formatter: '{value} h' } },
            xAxis: {
               type: 'time',
               axisLabel: {
                  formatter: function (value) {
                     return echarts.format.formatTime('dd/MM', value)
                  }
               }
            },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            series: [
               { name: 'Horas manual', type: 'bar', stack: 'total', label: { show: true }, emphasis: { focus: 'series' }, tooltip: { valueFormatter: (value) => value + ' h' }, itemStyle: { color: '#019932' }, data: this.horimetro?.manual },
               { name: 'Horas automático', type: 'bar', stack: 'total', label: { show: true, color: 'white', textBorderColor: '#34cd34', textBorderWidth: 2 }, emphasis: { focus: 'series' }, tooltip: { valueFormatter: (value) => value + ' h' }, itemStyle: { color: '#34cd34' }, data: this.horimetro?.automatico }
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

.manual {
   background-color: #019932;
}

.automatico {
   background-color: #34cd34;
}
</style>