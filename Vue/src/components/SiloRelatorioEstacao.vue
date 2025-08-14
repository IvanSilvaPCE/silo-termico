<template>
   <div v-if="estacao?.diario?.length" class="mt-4">
      <div ref="chartContainer">
         <b-row>
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Análise Temperatura / Umidade</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartTemperatura" class="chartTemperatura" style="min-width: 100%; height: 600px"></div>
               <!-- <div ref="chartTemperatura" style="width: 1100px; height: 600px"></div> -->
            </b-col>
         </b-row>
         <b-row style="page-break-before: auto">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Análise Vento / Pressão atmosférica</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartPressao" class="chartPressao" style="width: 100%; height: 600px"></div>
               <!-- <div ref="chartPressao" style="width: 1100px; height: 600px"></div> -->
            </b-col>
         </b-row>
         <b-row style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Análise Pluviômetro</b></p>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <div ref="chartPluviometro" class="chartPluviometro" style="width: 100%; height: 600px"></div>
               <!-- <div ref="chartPluviometro" style="width: 1100px; height: 600px"></div> -->
            </b-col>
         </b-row>
         <b-row style="page-break-before: always">
            <b-col>
               <p class="mb-0 text-center"><b class="fonte-tab">Últimos dados recebidos da estação</b></p>
            </b-col>
         </b-row>
         <b-row class="justify-content-center d-flex align-items-center mx-auto flex-wrap text-center">
            <b-col cols="6" sm="2" md="2" class=" ">
               <div>
                  <img :src="require('@/assets/images/clima/' + iconeClimaEstacao(clima?.current?.weather[0]?.id, clima?.current?.weather[0]?.icon))" width="70" />
               </div>
               <div style="margin-top: -15px">
                  <p class="temperatura">{{ Math.round(estacao?.clima?.TEM) || '-' }}°</p>
               </div>
            </b-col>
            <b-col cols="6" sm="2" md="2" class="">
               <img src="@/assets/images/clima/umidade.png" width="30" v-b-tooltip.hover />
               <h1>{{ estacao?.clima?.UMI || '-' }} %</h1>
               <small>Umidade</small>
            </b-col>
            <b-col cols="6" sm="2" md="2" class="">
               <img src="@/assets/images/clima/pressao.png" width="30" v-b-tooltip.hover />
               <h1>{{ estacao?.clima?.PRE || '-' }} hPa</h1>
               <small>Pressão atmosférica</small>
            </b-col>
            <b-col cols="6" sm="2" md="2" class="mt-2">
               <img src="@/assets/images/clima/vento.png" height="30" v-b-tooltip.hover />
               <h1>{{ estacao?.clima?.VEL }} km/h</h1>
               <small>Vento</small>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <b-table small striped bordered :items="estacao.diario" :fields="fields" responsive>
                  <template #thead-top>
                     <tr>
                        <th colspan="10" class="text-center">Análise Diária</th>
                     </tr>
                  </template>
               </b-table>
            </b-col>
         </b-row>
      </div>
   </div>
</template>

<script>
import axios from 'axios'
import client from '@/api'
import * as echarts from 'echarts'
import { mapState, mapActions } from 'vuex'

export default {
   name: 'SiloRelatorioEstacao',
   props: {
      estacao: [Array, Object],
      exportar: Boolean
   },

   data() {
      return {
         graficoTemperatura: {},
         graficoPressao: {},
         graficoPluviometro: {},
         items: [],
         latitude: null,
         longitude: null,
         clima: null,
         fields: [
            { key: 'data', label: 'Data', thClass: 'text-center' },
            { key: 'temp_max', label: 'Temp. máx.', thClass: 'text-center' },
            { key: 'temp_min', label: 'Temp. mín.', thClass: 'text-center' },
            { key: 'umid_max', label: 'Umid. máx', thClass: 'text-center' },
            { key: 'umid_min', label: 'Umid. mín', thClass: 'text-center' },
            { key: 'pres_max', label: 'Press. máx.', thClass: 'text-center' },
            { key: 'pres_min', label: 'Press. mín.', thClass: 'text-center' },
            { key: 'vent_max', label: 'Vento máx.', thClass: 'text-center' },
            { key: 'vent_min', label: 'Vento mín.', thClass: 'text-center' },
            { key: 'pluv_tot', label: 'Chuva', thClass: 'text-center' }
         ]
      }
   },

   mounted() {
      this.buscarLocal()
   },

   computed: {
      ...mapState('unidade', ['unidade'])
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade']),
      async buscarClima() {
         this.isBusy = true
         try {
            const dados = await axios.get('https://api.openweathermap.org/data/3.0/onecall', {
               params: {
                  lat: this.latitude,
                  lon: this.longitude,
                  appid: process.env.VUE_APP_OPENWEATHERMAP_API_KEY,
                  units: 'metric',
                  lang: 'pt_br',
                  exclude: 'hourly,daily,minutely,alerts'
               }
            })
            this.clima = dados.data
         } catch (err) {
            this.$bvToast.toast(`Erro ao buscar condições meteorológicas. ${err}`, {
               title: 'Erro',
               variant: 'danger',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
         }
         this.isBusy = false
      },
      async buscarLocal() {
         if (!this.unidade || this.unidade == '') {
            return
         }
         const dados = await client.get(`/estrutura_pessoa/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar local da unidade. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
         })
         if (dados.data && dados.data.local_estrutura) {
            this.latitude = dados.data.local_estrutura.latitude
            this.longitude = dados.data.local_estrutura.longitude
            this.buscarClima()
         }
      },
      iconeClimaEstacao(id, icon) {
         id = id.toString()
         const icones = {
            '01d': 'ensolarado.svg',
            '01n': 'lua.svg',
            '02d': 'dia-nublado.svg',
            '02n': 'nublado.svg',
            '03d': 'dia-nublado.svg',
            '03n': 'nublado.svg',
            '04d': 'dia-nublado.svg',
            '04n': 'nublado.svg',
            '09d': 'chuvoso.svg',
            '09n': 'chuvoso.svg',
            '10d': 'chuvoso.svg',
            '10n': 'chuvoso.svg',
            '11d': 'tempestade.svg',
            '11n': 'tempestade.svg',
            '13d': 'nevando.svg',
            '13n': 'nevando.svg',
            '50d': 'nublado.svg',
            '50n': 'nublado.svg'
         }
         if (this.estacao?.clima && this.estacao?.clima?.CHO == 1) {
            return 'chuvoso.svg'
         } else if (this.estacao?.clima && this.estacao?.clima?.CHO == 0 && id && (id.charAt(0) == '3' || id.charAt(0) == '5')) {
            return 'nublado.svg'
         } else {
            return icones[icon] || 'nublado.svg'
         }
      },
      construirGraficoTemperatura() {
         let markAreasGrafico = []

         const adicionarMarkArea = (dados) => {
            if (!dados) return
            dados.forEach((item) => {
               markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: 'rgba(173, 216, 230)' } }])
            })
         }
         adicionarMarkArea(this.estacao.chuva)

         this.graficoTemperatura = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            grid: { left: '1%', right: '1%', bottom: '1%', containLabel: true },
            legend: { textStyle: { color: '#6c727a' }, top: 20, data: ['Temperatura', 'Umidade', 'Chuva'] },
            xAxis: { type: 'category', boundaryGap: false, data: this.estacao?.data },
            yAxis: [
               { type: 'value', position: 'left', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'orange' } }, axisLabel: { formatter: '{value} °C' } },
               { type: 'value', position: 'right', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'blue' } }, axisLabel: { formatter: '{value} %' }, max: 100 }
            ],
            series: [
               { name: 'Temperatura', data: this.estacao?.temperatura, type: 'line', yAxisIndex: 0, itemStyle: { color: 'orange' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Umidade', data: this.estacao?.umidade, type: 'line', yAxisIndex: 1, itemStyle: { color: 'blue' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' %' } },
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
         adicionarMarkArea(this.estacao?.chuva)

         this.graficoPressao = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            grid: { left: '1%', right: '0%', bottom: '1%', containLabel: true },
            legend: { textStyle: { color: '#6c727a' }, top: 20, data: ['Vento', 'Pressão atmosf.', 'Chuva'] },
            xAxis: { type: 'category', boundaryGap: false, data: this.estacao?.data },
            yAxis: [
               { type: 'value', position: 'left', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'green' } }, axisLabel: { formatter: '{value} km/h' } },
               { type: 'value', position: 'right', alignTicks: true, axisLine: { show: true, lineStyle: { color: 'darkorange' } }, axisLabel: { formatter: function (value) { return `${Math.round(value)} hPa` } }, min: this.escalaMinima, max: this.escalaMaxima, axisPointer: { label: { formatter: function (params) { return Math.round(params.value) } } } }
            ],
            series: [
               { name: 'Vento', data: this.estacao?.vento, type: 'line', yAxisIndex: 0, itemStyle: { color: 'green' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' km/h' } },
               { name: 'Pressão atmosf.', data: this.estacao?.pressao, type: 'line', yAxisIndex: 1, itemStyle: { color: 'darkorange' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' hPa' } },
               { name: 'Chuva', type: 'line', color: 'rgba(173, 216, 230)', markArea: { data: markAreasGrafico } }
            ]
         }
         this.updateChart(this.chartPressao, this.graficoPressao)
      },
      construirGraficoPluviometro() {
         this.graficoPluviometro = {
            tooltip: { trigger: 'axis' },
            dataZoom: [
               { type: 'slider', show: false, start: 0 },
               { type: 'inside', start: 0 }
            ],
            grid: { left: '1%', right: '0%', bottom: '1%', containLabel: true },
            xAxis: { type: 'category', data: this.estacao?.pluviometroData || [] },
            yAxis: { type: 'value', axisLabel: { formatter: '{value} mm' } },
            series: [{ name: 'Chuva', data: this.estacao?.pluviometroChuva || [], label: { show: true, position: 'insideBottom', rotate: 270, distance: 25, verticalAlign: 'center' }, type: 'bar', showBackground: true, backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' }, tooltip: { valueFormatter: (value) => value + ' mm' } }]
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
      }
   },

   watch: {
      estacao() {
         if (this.estacao?.diario) {
            setTimeout(() => {
               this.initializeChartTemperatura()
               this.construirGraficoTemperatura()

               this.initializeChartPressao()
               this.construirGraficoPressao()

               this.initializeChartPluviometro()
               this.construirGraficoPluviometro()

               this.resizeObserver = new ResizeObserver(this.handleResize)
               this.resizeObserver.observe(this.$refs.chartContainer)

               window.addEventListener('resize', this.handleResize)
            }, 100)
         }
      },
      unidade(newValue) {
         if (newValue) {
            this.buscarLocal()
         }
      },
      exportar(newVal) {
         if (this.graficoTemperatura && this.graficoPressao && this.graficoPluviometro && this.estacao?.diario?.length) {
            const ajustarTamanho = (container, width, height) => {
               container.style.width = width
               container.style.height = height
            }
            const width = newVal ? '1100px' : '100%'
            const height = '600px'
            ajustarTamanho(this.$refs.chartTemperatura, width, height)
            ajustarTamanho(this.$refs.chartPressao, width, height)
            ajustarTamanho(this.$refs.chartPluviometro, width, height)
            this.chartTemperatura.resize()
            this.chartPressao.resize()
            this.chartPluviometro.resize()
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
   }
}
</script>

<style scoped>
.titulo {
   font-size: 16px;
   font-weight: 600;
}

.fonte-tab {
   font-weight: 500;
}

.temperatura {
   font-size: 20px;
   font-weight: 400;
   color: black;
}

h1 {
   font-size: 18px;
}

.largura {
   width: 500px !important;
}
</style>