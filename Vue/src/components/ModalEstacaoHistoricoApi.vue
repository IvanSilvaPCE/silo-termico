<template>
   <b-modal id="estacao-api" size="xl" title="Comparação dados estação x API" class="custom-modal" @shown="initializeChartTemperatura()">
      <b-row>
         <b-col class="pt-0">
            <b-alert show variant="warning">Funcionalidade disponível somente para administradores. Alto uso dessa funcionalidade irá impactar no custo da API de clima</b-alert>
         </b-col>
      </b-row>
      <b-row>
         <b-col lg="4">
            <label class="" for="inline-form-input-name">Data</label>
            <b-form-datepicker v-model="data" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
         </b-col>
         <b-col lg="3">
            <b-button variant="outline-primary" class="mt-4" @click="buscarTemperatura()" :disabled="buscandoTemperatura">
               <span v-if="!buscandoTemperatura">Filtrar</span>
               <div v-else>
                  <b-spinner small></b-spinner>
                  <span class="ml-1">Buscando...</span>
               </div>
            </b-button>
         </b-col>
      </b-row>
      <b-row ref="chartContainer">
         <b-overlay :show="buscandoTemperatura" rounded="sm" class="overlay">
            <b-col class="mt-3">
               <div ref="chartTemperatura" style="width: 100%; height: 59vh"></div>
            </b-col>
         </b-overlay>
      </b-row>
      <template #modal-footer="{ ok }">
         <b-button size="lg" variant="primary" @click="ok()"> Fechar </b-button>
      </template>
   </b-modal>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'

export default {
   name: 'ModalEstacaoHistoricoApi',
   props: {
      estacao: Number,
      estacaoAux: [Boolean, String]
   },
   data() {
      return {
         data: this.$moment().format('YYYY-MM-DD'),
         buscandoTemperatura: false,
         dadosTemperatura: null,
         graficoTemperatura: {},
         datasOperacao: []
      }
   },

   methods: {
      marcaDatasOperacao(data) {
         const possuiData = this.datasOperacao.includes(data)
         return possuiData ? 'table-primary' : ''
      },
      async buscarTemperatura() {
         if (!this.estacao || this.estacao == undefined) {
            return
         }
         this.buscandoTemperatura = true
         const dados = await client.get(`/estacao/buscarcompara/${this.estacao}?inicio=${this.data}&fim=${this.data}&auxiliar=${this.estacaoAux}`).catch((err) => {
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
      construirGraficoTemperatura() {
         let markAreaChuva = []

         const adicionarMarkArea = (dados, cor, serie) => {
            if (!dados) return
            dados.forEach((item) => {
               serie.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
            })
         }

         adicionarMarkArea(this.dadosTemperatura.chuva, 'rgba(173, 216, 230)', markAreaChuva)

         this.graficoTemperatura = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
            toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            grid: { left: '1%', right: '0%', bottom: '12%', containLabel: true },
            legend: { textStyle: { color: '#6c727a' }, top: 20, data: [{ name: 'Temp. estação' }, { name: 'Umid. estação' }, { name: 'Pres. estação' }, { name: 'Temp. API' }, { name: 'Umid. API' }, { name: 'Pres. API' }, { name: 'Chuva' }], selected: { 'Temp. estação': true, 'Umid. estação': true, 'Temp. API': true, 'Umid. API': true, Chuva: true }, type: 'scroll', orient: 'horizontal' },
            xAxis: { type: 'category', boundaryGap: false, data: this.dadosTemperatura?.data },
            yAxis: [
               { type: 'value', position: 'left', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'orange' } }, axisLabel: { formatter: '{value} °C' } },
               { type: 'value', position: 'right', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'blue' } }, axisLabel: { formatter: '{value} %' } }
            ],
            series: [
               { name: 'Temp. estação', data: this.dadosTemperatura.temperatura, type: 'line', yAxisIndex: 0, itemStyle: { color: 'orange' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Umid. estação', data: this.dadosTemperatura.umidade, type: 'line', yAxisIndex: 1, itemStyle: { color: 'blue' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'Pres. estação', data: this.dadosTemperatura.pressao, type: 'line', yAxisIndex: 1, itemStyle: { color: 'green' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' hPa' } },
               { name: 'Temp. API', data: this.dadosTemperatura.temperaturaApi, type: 'line', yAxisIndex: 0, itemStyle: { color: '#ffd633' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Umid. API', data: this.dadosTemperatura.umidadeApi, type: 'line', yAxisIndex: 1, itemStyle: { color: '#3385ff' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'Pres. API', data: this.dadosTemperatura.pressaoApi, type: 'line', yAxisIndex: 1, itemStyle: { color: 'lightgreen' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' hPa' } },
               { name: 'Chuva', type: 'line', itemStyle: { color: 'lightblue' }, markArea: { data: markAreaChuva } }
            ]
         }
         this.updateChart(this.chartTemperatura, this.graficoTemperatura)
      },
      initializeChartTemperatura() {
         this.chartTemperatura = echarts.init(this.$refs.chartTemperatura)
         if (this.graficoTemperatura) {
            this.chartTemperatura.setOption(this.graficoTemperatura)
         }
         this.resizeObserver = new ResizeObserver(this.handleResize)
         this.resizeObserver.observe(this.$refs.chartContainer)
         window.addEventListener('resize', this.handleResize)
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
      }
   },

   beforeDestroy() {
      if (this.chartTemperatura) {
         this.chartTemperatura.dispose()
      }
      window.removeEventListener('resize', this.handleResize)
   }
}
</script>

<style scoped>
.overlay {
   z-index: 0;
   width: 100%;
}
</style>