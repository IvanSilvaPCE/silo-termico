<template>
   <div>
      <b-row>
         <b-col sm="12" md="6" lg="3">
            <b-form-group label="Selecionar Gráfico">
               <v-select v-model="grafico" :options="optionsGraficos" @input="buscarGrafico()" :reduce="(grafico) => grafico.value">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
            </b-form-group>
         </b-col>
         <b-col sm="12" md="6" lg="3">
            <b-form-group label="Data">
               <b-form-datepicker v-model="data" @input="buscarGrafico()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-form-group>
         </b-col>
      </b-row>
      <b-overlay :show="buscandoGrafico" rounded="sm" class="overlay">
         <b-row class="justify-content-center d-flex overflow-auto">
            <b-col cols="12">
               <b-list-group horizontal>
                  <b-list-group-item v-for="chave in chavesGrafico.filter((chave) => chave !== 'Média' && chave !== 'Total')" :key="chave" class="d-flex justify-content-between align-items-center cursor">
                     <b-badge variant="primary" class="valor mr-1">{{ chave }}</b-badge>
                     <small class="valor">{{ dados[chave][dados[chave].length - 1]?.[1] }}</small
                     ><small class="ml-1">{{ unidadeGrafico() }}</small>
                  </b-list-group-item>
               </b-list-group>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="containerGrafico">
                  <div ref="chartGrafico" class="mt-0" style="width: 100%; height: 60vh"></div>
               </div>
            </b-col>
         </b-row>
      </b-overlay>
   </div>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'

export default {
   name: 'ControleMotoresEnergia',
   props: {
      tempoAtualizacao: Number
   },
   data() {
      return {
         buscandoGrafico: false,
         opcoesDoGrafico: {},
         dados: {},
         grafico: 'VF',
         datasOperacao: [],
         data: this.$moment().format('YYYY-MM-DD'),
         intervalId: null,
         optionsGraficos: [
            { value: 'VF', label: 'Tensão de fase' },
            { value: 'VL', label: 'Tensão de linha' },
            { value: 'IF', label: 'Corrente de fase' },
            { value: 'S', label: 'Potência Aparente' },
            { value: 'P', label: 'Potência Ativa' },
            { value: 'Q', label: 'Potência Reativa' },
            { value: 'FP', label: 'Fator de potência' }
         ]
      }
   },

   computed: {
      chavesGrafico() {
         return Object.keys(this.dados).filter((chave) => chave !== 'datasOperacao')
      }
   },

   methods: {
      async buscarGrafico() {
         if (!this.idControle) {
            return
         }
         this.buscandoGrafico = true
         const dados = await client.get(`/controle/buscarenergia/${this.idControle}?filtro=${this.grafico}&data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados de energia. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoGrafico = false
         })
         this.buscandoGrafico = false
         if (dados && dados.data) {
            this.dados = dados.data
            this.datasOperacao = this.dados.datasOperacao
            this.construirGrafico(dados.data)
         }
      },
      marcaDatasOperacao(data) {
         const possuiData = this.datasOperacao.includes(data)
         return possuiData ? 'table-primary' : ''
      },
      unidadeGrafico() {
         const unidades = {
            VF: 'V',
            VL: 'V',
            IF: 'A',
            S: 'VA',
            P: 'W',
            Q: 'VAR'
         }
         return unidades[this.grafico] || ''
      },
      construirGrafico() {
         this.opcoesDoGrafico = {
            toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            title: { text: '' },
            tooltip: {
               trigger: 'axis',
               formatter: (params) => {
                  const date = new Date(params[0].value[0])
                  const formattedTime = `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
                  params.forEach((param) => {
                     tooltipContent += `<div class="d-flex justify-content-between">
                     <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                     <span class="text-right"><b>${param.value[1]} ${this.unidadeGrafico()}</b></span>
                  </div>`
                  })
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            legend: { textStyle: { color: '#6c727a' }, top: 25, data: this.chavesGrafico },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: {
               type: 'time',
               boundaryGap: false,
               axisLabel: {
                  formatter: function (value) {
                     return echarts.format.formatTime('hh:mm', value)
                  }
               }
            },
            yAxis: { type: 'value', name: this.unidadeGrafico(), splitNumber: 10 },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            series: this.chavesGrafico.map((chave) => ({
               name: chave,
               type: 'line',
               showSymbol: false,
               data: this.dados[chave]
            }))
         }
      },
      initializeChart() {
         this.chartGrafico = echarts.init(this.$refs.chartGrafico)
         if (this.opcoesDoGrafico) {
            this.chartGrafico.setOption(this.opcoesDoGrafico)
         }
      },
      updateChart(chart, novasOpcoes) {
         if (chart) {
            chart.setOption(novasOpcoes)
         }
      },
      clearChart(chart) {
         if (chart) {
            chart.clear()
         }
      },
      handleResize() {
         if (this.chartGrafico) {
            this.chartGrafico.resize()
         }
      },
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarGrafico()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      }
   },

   mounted() {
      const idControleLocalStorage = localStorage.getItem('con')
      if (idControleLocalStorage && idControleLocalStorage != 'undefined') {
         this.idControle = idControleLocalStorage
      } else {
         this.idControle = this.$route.params.idControle
         localStorage.setItem('con', this.idControle)
      }
      this.buscarGrafico()
      if (this.opcoesDoGrafico) {
         this.initializeChart()
      }
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(this.$refs.containerGrafico)
      window.addEventListener('resize', this.handleResize)
   },

   watch: {
      opcoesDoGrafico(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart(this.chartGrafico)
            this.updateChart(this.chartGrafico, novasOpcoes)
         }
      },
      tempoAtualizacao(newValue) {
         if (newValue) {
            this.startInterval(newValue)
         } else {
            this.stopInterval()
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