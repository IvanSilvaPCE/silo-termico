<template>
   <div class="white_shd full margin_bottom_30" ref="chartContainer">
      <div class="full graph_head">
         <div class="heading1 margin_0">
            <h2>Análise</h2>
         </div>
      </div>
      <div class="map_section padding_infor_info">
         <b-overlay :show="buscandoEstacao" rounded="sm" class="overlay">
            <div v-if="estacao && !buscandoEstacao">
               <b-row class="mb-4 align-items-end">
                  <b-col lg="3">
                     <label class="" for="inline-form-input-name">Data inicial</label>
                     <b-form-datepicker v-model="dataInical" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
                  </b-col>
                  <b-col lg="3">
                     <label class="" for="inline-form-input-name">Data final</label>
                     <b-form-datepicker v-model="dataFinal" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
                  </b-col>
                  <b-col lg="2">
                     <b-button variant="outline-primary" class="mt-2" @click="buscarDados" :disabled="buscandoEstacao || buscandoTemperatura || buscandoPressao || buscandoPluviometro">
                        <span v-if="!buscandoEstacao && !buscandoTemperatura && !buscandoPressao && !buscandoPluviometro">Filtrar</span>
                        <div v-else>
                           <b-spinner small></b-spinner>
                           <span class="ml-1">Buscando...</span>
                        </div>
                     </b-button>
                  </b-col>
               </b-row>
               <b-row v-if="verificarPerfilOperacao(['ADMINPORTA'])">
                  <b-col lg="2">
                     <b-button variant="outline-primary" @click="$bvModal.show('estacao-api')">API</b-button>
                  </b-col>
               </b-row>
               <b-row>
                  <b-col class="mt-2 pb-0">
                     <b-button variant="outline-warning" class="p-1 mr-1" @click="maiorValor(chartTemperatura, 'Temperatura')" v-b-tooltip.hover title="Temperatura máxima"><b-icon-chevron-up></b-icon-chevron-up></b-button>
                     <b-button variant="outline-warning" class="p-1 mr-3" @click="menorValor(chartTemperatura, 'Temperatura')" v-b-tooltip.hover title="Temperatura mínima"><b-icon-chevron-down></b-icon-chevron-down></b-button>
                     <b-button variant="outline-primary" class="p-1 mr-1" @click="maiorValor(chartTemperatura, 'Umidade')" v-b-tooltip.hover title="Umidade máxima"><b-icon-chevron-up></b-icon-chevron-up></b-button>
                     <b-button variant="outline-primary" class="p-1" @click="menorValor(chartTemperatura, 'Umidade')" v-b-tooltip.hover title="Umidade mínima"><b-icon-chevron-down></b-icon-chevron-down></b-button>
                  </b-col>
               </b-row>
               <b-row>
                  <b-overlay :show="buscandoTemperatura || buscandoEstacao" rounded="sm" class="overlay">
                     <b-col class="mt-3">
                        <div ref="chartTemperatura" style="width: 100%; height: 65vh"></div>
                     </b-col>
                  </b-overlay>
               </b-row>
               <b-row style="margin-bottom: -20px" v-if="!estacaoAux">
                  <b-col class="mt-3 pb-0">
                     <b-button variant="outline-success" class="p-1 mr-1" @click="maiorValor(chartPressao, 'Vento')" v-b-tooltip.hover title="Vento máximo"><b-icon-chevron-up></b-icon-chevron-up></b-button>
                     <b-button variant="outline-success" class="p-1 mr-3" @click="menorValor(chartPressao, 'Vento')" v-b-tooltip.hover title="Vento mínimo"><b-icon-chevron-down></b-icon-chevron-down></b-button>
                     <b-button variant="outline-warning" class="p-1 mr-1" @click="maiorValor(chartPressao, 'Pressão atmosf.')" v-b-tooltip.hover title="Pressão atmosf. máxima"><b-icon-chevron-up></b-icon-chevron-up></b-button>
                     <b-button variant="outline-warning" class="p-1" @click="menorValor(chartPressao, 'Pressão atmosf.')" v-b-tooltip.hover title="Pressão atmosf. mínima"><b-icon-chevron-down></b-icon-chevron-down></b-button>
                  </b-col>
               </b-row>
               <b-row class="mt-5" v-if="!estacaoAux">
                  <b-overlay :show="buscandoPressao || buscandoEstacao" rounded="sm" class="overlay">
                     <b-col>
                        <div ref="chartPressao" style="width: 100%; height: 65vh"></div>
                     </b-col>
                  </b-overlay>
               </b-row>
               <b-row style="margin-bottom: -20px" v-if="!estacaoAux">
                  <b-col class="mt-3 pb-0">
                     <b-button variant="outline-primary" class="p-1 mr-1" @click="maiorValor(chartPluviometro, 'Chuva')" v-b-tooltip.hover title="Pluviômetro máximo"><b-icon-chevron-up></b-icon-chevron-up></b-button>
                     <b-button variant="outline-primary" class="p-1 mr-3" @click="menorValor(chartPluviometro, 'Chuva')" v-b-tooltip.hover title="Pluviômetro mínimo"><b-icon-chevron-down></b-icon-chevron-down></b-button>
                  </b-col>
               </b-row>
               <b-row class="mt-5" v-if="!estacaoAux">
                  <b-overlay :show="buscandoPluviometro || buscandoEstacao" rounded="sm" class="overlay">
                     <b-col>
                        <div ref="chartPluviometro" style="width: 100%; height: 65vh"></div>
                     </b-col>
                  </b-overlay>
               </b-row>
               <b-row v-if="!estacaoAux">
                  <b-col>
                     <p><b>Total do período: {{ this.dadosPluviometro && this.dadosPluviometro.chuva && this.dadosPluviometro.chuva.length ? this.dadosPluviometro.chuva.reduce((acc, curr) => acc + parseFloat(curr), 0).toFixed(2) : 0 }} mm</b></p>
                  </b-col>
               </b-row>
            </div>
            <div v-else>
               <b-row>
                  <b-col>
                     <p class="text-center">Dados disponíveis somente para estação meteorológica</p>
                  </b-col>
               </b-row>
            </div>
         </b-overlay>
      </div>
      <modal-estacao-historico-api :estacao="estacao" :estacaoAux="estacaoAux"></modal-estacao-historico-api>
   </div>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'
import { mapState, mapActions } from 'vuex'
import ModalEstacaoHistoricoApi from './ModalEstacaoHistoricoApi.vue'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'EstacaoAutomaticaHistorico',
   components: {
      ModalEstacaoHistoricoApi
   },
   props: {
      tempoAtualizacao: Number
   },
   data() {
      return {
         dataInical: this.$moment().format('YYYY-MM-DD'),
         dataFinal: this.$moment().format('YYYY-MM-DD'),
         timestamps: [],
         randomArray: [],
         graficoTemperatura: {},
         graficoPressao: {},
         graficoPluviometro: {},
         buscandoEstacao: false,
         estacao: null,
         buscandoPluviometro: false,
         dadosPluviometro: null,
         buscandoPressao: false,
         dadosPressao: null,
         buscandoTemperatura: false,
         dadosTemperatura: null,
         intervalId: null,
         datasOperacao: [],
         estacaoAux: false
      }
   },

   computed: {
      ...mapState('unidade', ['unidade']),
      dataMinima() {
         return this.$moment(this.dataFinal).subtract(30, 'days').format('YYYY-MM-DD')
      },
      escalaMinima() {
         const filteredArray = this.dadosPressao?.pressao.filter((item) => !isNaN(parseInt(item)))
         if (filteredArray.length > 0) {
            const intArray = filteredArray.map((item) => parseInt(item))
            return Math.min(...intArray) - 10
         } else {
            return null
         }
      },
      escalaMaxima() {
         const filteredArray = this.dadosPressao?.pressao.filter((item) => !isNaN(parseInt(item)))
         if (filteredArray.length > 0) {
            const intArray = filteredArray.map((item) => parseInt(item))
            return Math.max(...intArray) + 10
         } else {
            return null
         }
      }
   },

   mounted() {
      this.buscarEstacao()
      if (this.estacao) {
         this.initializeChartTemperatura()
         this.initializeChartPressao()
         this.initializeChartPluviometro()

         this.resizeObserver = new ResizeObserver(this.handleResize)
         this.resizeObserver.observe(this.$refs.chartContainer)

         window.addEventListener('resize', this.handleResize)
      }
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade']),
      marcaDatasOperacao(data) {
         const possuiData = this.datasOperacao.includes(data)
         return possuiData ? 'table-primary' : ''
      },
      async buscarEstacao() {
         if (!this.unidade || this.unidade == '') {
            return
         }
         this.buscandoEstacao = true
         const dados = await client.get(`/resumo/buscarestacao/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar estação meteorológica. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoEstacao = false
         })
         this.buscandoEstacao = false
         if (dados.data && dados.data.estrutura_equipamentos.length) {
            this.estacao = dados.data.estrutura_equipamentos[0].id_equipamento
            this.estacaoAux = dados.data.estrutura_equipamentos[0]?.auxiliar
            this.buscarDados()
         }
      },
      buscarDados() {
         this.buscarTemperatura()
         if (!this.estacaoAux) {
            this.buscarPressao()
            this.buscarPluviometro()
         }
      },
      async buscarTemperatura() {
         if (!this.estacao || this.estacao == undefined) {
            return
         }
         this.buscandoTemperatura = true
         const dados = await client.get(`/estacao/buscartemperatura/${this.estacao}?inicio=${this.dataInical}&fim=${this.dataFinal}&auxiliar=${this.estacaoAux}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados de temperatura e umidade. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoTemperatura = false
         })
         this.buscandoTemperatura = false
         if (dados.data) {
            this.dadosTemperatura = dados.data
            this.datasOperacao = this.dadosTemperatura.datasOperacao
         }
         this.construirGraficoTemperatura()
      },
      async buscarPressao() {
         if (!this.estacao || this.estacao == undefined || this.estacaoAux) {
            return
         }
         this.buscandoPressao = true
         const dados = await client.get(`/estacao/buscarpressao/${this.estacao}?inicio=${this.dataInical}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados de vento e pressão. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoPressao = false
         })
         this.buscandoPressao = false
         if (dados.data) {
            this.dadosPressao = dados.data
         }
         this.construirGraficoPressao()
      },
      async buscarPluviometro() {
         if (!this.estacao || this.estacao == undefined || this.estacaoAux) {
            return
         }
         this.buscandoPluviometro = true
         const dados = await client.get(`/estacao/buscarpluviometro/${this.estacao}?inicio=${this.dataInical}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados pluviométricos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoPluviometro = false
         })
         this.buscandoPluviometro = false
         if (dados.data) {
            this.dadosPluviometro = dados.data
         }
         this.construirGraficoPluviometro()
      },
      construirGraficoTemperatura() {
         let markAreasGrafico = []

         const adicionarMarkArea = (dados) => {
            if (!dados) return
            dados.forEach((item) => {
               markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: 'rgba(173, 216, 230)' } }])
            })
         }
         adicionarMarkArea(this.dadosTemperatura.chuva)

         this.graficoTemperatura = {
            title: { textStyle: { color: '#6c727a' }, text: 'Temperatura / Umidade' },
            tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
            toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            grid: { left: '1%', right: '0%', bottom: '12%', containLabel: true },
            legend: { textStyle: { color: '#6c727a' }, top: 20, data: !this.estacaoAux ? ['Temperatura', 'Umidade', 'Chuva'] : ['Temperatura', 'Umidade'] },
            xAxis: { type: 'category', boundaryGap: false, data: this.dadosTemperatura?.data },
            yAxis: [
               { type: 'value', position: 'left', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'orange' } }, axisLabel: { formatter: '{value} °C' } },
               { type: 'value', position: 'right', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'blue' } }, axisLabel: { formatter: '{value} %' }, max: 100 }
            ],
            series: [
               { name: 'Temperatura', data: this.dadosTemperatura?.temperatura, type: 'line', yAxisIndex: 0, itemStyle: { color: 'orange' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Umidade', data: this.dadosTemperatura?.umidade, type: 'line', yAxisIndex: 1, itemStyle: { color: 'blue' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'Chuva', type: 'line', color: 'rgba(173, 216, 230)', markArea: { data: markAreasGrafico } }
            ]
         }
         this.updateChart(this.chartTemperatura, this.graficoTemperatura)
      },
      construirGraficoPressao() {
         let markAreasGrafico = []

         const adicionarMarkArea = (dados) => {
            if (!dados) return
            dados.forEach((item) => {
               markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: 'rgba(173, 216, 230)' } }])
            })
         }
         adicionarMarkArea(this.dadosPressao.chuva)

         this.graficoPressao = {
            title: { textStyle: { color: '#6c727a' }, text: 'Vento / Pressão atmosférica' },
            tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
            toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            grid: { left: '1%', right: '0%', bottom: '12%', containLabel: true },
            legend: { textStyle: { color: '#6c727a' }, top: 20, data: ['Vento', 'Pressão atmosf.', 'Chuva'] },
            xAxis: { type: 'category', boundaryGap: false, data: this.dadosPressao?.data },
            yAxis: [
               { type: 'value', position: 'left', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'green' } }, axisLabel: { formatter: '{value} km/h' } },
               { type: 'value', position: 'right', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'darkorange' } }, axisLabel: { formatter: function (value) { return `${Math.round(value)} hPa` } }, min: this.escalaMinima, max: this.escalaMaxima, axisPointer: { label: { formatter: function (params) {return Math.round(params.value) } } } }
            ],
            series: [
               { name: 'Vento', data: this.dadosPressao?.vento, type: 'line', yAxisIndex: 0, itemStyle: { color: 'green' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' km/h' } },
               { name: 'Pressão atmosf.', data: this.dadosPressao?.pressao, type: 'line', yAxisIndex: 1, itemStyle: { color: 'darkorange' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' hPa' } },
               { name: 'Chuva', type: 'line', color: 'rgba(173, 216, 230)', markArea: { data: markAreasGrafico } }
            ]
         }
         this.updateChart(this.chartPressao, this.graficoPressao)
      },
      construirGraficoPluviometro() {
         this.graficoPluviometro = {
            title: { textStyle: { color: '#6c727a' }, text: 'Pluviômetro' },
            tooltip: { trigger: 'axis' },
            toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            grid: { left: '1%', right: '0%', bottom: '12%', containLabel: true },
            xAxis: { type: 'category', data: this.dadosPluviometro?.data || [] },
            yAxis: { type: 'value', axisLabel: { formatter: '{value} mm' } },
            series: [{ name: 'Chuva', data: this.dadosPluviometro?.chuva || [], label: { show: true, position: 'inside' }, type: 'bar', showBackground: true, backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' }, tooltip: { valueFormatter: (value) => value + ' mm' } }]
         }
         this.updateChart(this.chartPluviometro, this.graficoPluviometro)
      },
      initializeChartTemperatura() {
         this.chartTemperatura = echarts.init(this.$refs.chartTemperatura)
         if (this.graficoTemperatura) {
            this.chartTemperatura.setOption(this.graficoTemperatura)
         }
      },
      initializeChartPressao() {
         this.chartPressao = echarts.init(this.$refs.chartPressao)
         if (this.graficoPressao) {
            this.chartPressao.setOption(this.graficoPressao)
         }
      },
      initializeChartPluviometro() {
         this.chartPluviometro = echarts.init(this.$refs.chartPluviometro)
         if (this.graficoPluviometro) {
            this.chartPluviometro.setOption(this.graficoPluviometro)
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
         }
         if (this.chartPressao) {
            this.chartPressao.resize()
         }
         if (this.chartPluviometro) {
            this.chartPluviometro.resize()
         }
      },
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarDados()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      },
      maiorValor(grafico, variavel) {
         this.$nextTick(() => {
            const myChart = grafico
            const option = myChart.getOption()
            let maxIndex = 0
            let maxValue = -Infinity
            let maxSeriesIndex = 0
            for (let seriesIndex = 0; seriesIndex < option.series.length; seriesIndex++) {
               const seriesName = option.series[seriesIndex].name
               if (seriesName != variavel) {
                  continue
               }
               const seriesData = option.series[seriesIndex].data
               for (let i = 0; i < seriesData.length; i++) {
                  if (parseFloat(seriesData[i]) >= maxValue) {
                     maxValue = parseFloat(seriesData[i])
                     maxIndex = i
                     maxSeriesIndex = seriesIndex
                  }
               }
            }
            setTimeout(() => {
               myChart.dispatchAction({
                  type: 'showTip',
                  seriesIndex: maxSeriesIndex,
                  dataIndex: maxIndex
               })
            }, 100)
         })
      },
      menorValor(grafico, variavel) {
         this.$nextTick(() => {
            const myChart = grafico
            const option = myChart.getOption()
            let maxIndex = 0
            let maxValue = Infinity
            let maxSeriesIndex = 0
            for (let seriesIndex = 0; seriesIndex < option.series.length; seriesIndex++) {
               const seriesName = option.series[seriesIndex].name
               if (seriesName != variavel) {
                  continue
               }
               const seriesData = option.series[seriesIndex].data
               for (let i = 0; i < seriesData.length; i++) {
                  if (parseFloat(seriesData[i]) <= maxValue) {
                     maxValue = parseFloat(seriesData[i])
                     maxIndex = i
                     maxSeriesIndex = seriesIndex
                  }
               }
            }
            setTimeout(() => {
               myChart.dispatchAction({
                  type: 'showTip',
                  seriesIndex: maxSeriesIndex,
                  dataIndex: maxIndex
               })
            }, 100)
         })
      },
      verificarPerfilOperacao
   },

   watch: {
      estacao(newValue) {
         if (newValue) {
            setTimeout(() => {
               this.initializeChartTemperatura()
               if (!this.estacaoAux) {
                  this.initializeChartPressao()
                  this.initializeChartPluviometro()
               }

               this.resizeObserver = new ResizeObserver(this.handleResize)
               this.resizeObserver.observe(this.$refs.chartContainer)

               window.addEventListener('resize', this.handleResize)
            }, 1000)
         }
      },
      tempoAtualizacao(newValue) {
         if (newValue) {
            this.startInterval(newValue)
         } else {
            this.stopInterval()
         }
      }
   },

   beforeDestroy() {
      if (this.chartTemperatura) {
         this.chartTemperatura.dispose()
      }
      if (this.chartPressao) {
         this.chartPressao.dispose()
      }
      if (this.chartPluviometro) {
         this.chartPluviometro.dispose()
      }
      if (this.resizeObserver) {
         this.resizeObserver.disconnect()
      }
      window.removeEventListener('resize', this.handleResize)
      this.stopInterval()
   }
}
</script>

<style scoped>
.overlay {
   z-index: 0;
   width: 100%;
}
</style>