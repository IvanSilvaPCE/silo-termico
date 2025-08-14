<template>
   <div>
      <b-overlay :show="buscandoInventario || buscandoConservacao || buscandoTemperatura || buscandoAeracao" rounded="sm" class="overlay">
         <b-row v-if="tipoGrafico == ''">
            <b-col>
               <p class="text-center">Selecione um grupo para visualizar dados</p>
            </b-col>
         </b-row>
         <b-row>
            <b-col sm="12" md="6" lg="3" v-if="tipoGrafico != 'conservacao'">
               <b-form-group label="Data inicial">
                  <b-form-datepicker v-model="dataInical" :date-info-fn="marcaDatasOperacao" @input="tipoGrafico === 'temperatura' ? buscarTemperaturas() : tipoGrafico === 'inventario' ? buscarInventario() : buscarAeracao()" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3">
               <b-form-group :label="tipoGrafico != 'conservacao' ? 'Data final' : 'Data'">
                  <b-form-datepicker v-model="dataFinal" :date-info-fn="marcaDatasOperacao" @input="tipoGrafico === 'temperatura' ? buscarTemperaturas() : tipoGrafico === 'inventario' ? buscarInventario() : tipoGrafico === 'conservacao' ? buscarConservacao() : buscarAeracao()" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="tipoGrafico == 'temperatura'">
               <b-form-group label="Pêndulo">
                  <b-dropdown v-model="penduloSelecionado" id="dropdown-left" :text="penduloSelecionado || 'Selecionar pêndulo'" variant="outline-primary" class="btn-block pendulo" menu-class="w-100" block>
                     <b-dropdown-item v-for="(item, index) in pendulos" :key="index" @click="selecionarPendulo(item)" :value="item">{{ item }}</b-dropdown-item>
                  </b-dropdown>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="tipoGrafico == 'temperatura'">
               <b-form-group label="Sensor">
                  <b-dropdown id="dropdown-left" :text="sensorSelecionado || 'Selecionar sensor'" variant="outline-primary" class="btn-block pendulo" menu-class="w-100" block>
                     <b-dropdown-item v-for="(item, index) in sensores" :key="index" @click="selecionarSensor(item)" :value="item" :variant="variante(item)">{{ item }}</b-dropdown-item>
                  </b-dropdown>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="tipoGrafico == 'temperatura'">
               <b-form-group label="Leitura">
                  <v-select multiple v-model="tipoLeitura" :options="optionsLeitura" :reduce="(leitura) => leitura.value" @input="buscarTemperaturas()">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="tipoGrafico == 'aeracao'">
               <b-form-group label="Aeração">
                  <b-dropdown v-model="aeracaoSelecionada" id="dropdown-left" :text="aeracaoSelecionada || 'Selecionar aeração'" variant="outline-primary" class="btn-block pendulo" menu-class="w-100" block>
                     <b-dropdown-item @click="selecionarAeracao('Aeração total', 9)">Aeração total</b-dropdown-item>
                     <b-dropdown-item @click="selecionarAeracao('Aeração Manual', 1)">Aeração Manual</b-dropdown-item>
                     <b-dropdown-item @click="selecionarAeracao('Aeração Automática', 0)">Aeração Automática</b-dropdown-item>
                  </b-dropdown>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="tipoGrafico == 'aeracao'">
               <b-form-group label="Leitura">
                  <b-dropdown id="dropdown-left" :text="leituraSelecionada || 'Selecionar leitura'" variant="outline-primary" class="btn-block pendulo" menu-class="w-100" block>
                     <b-dropdown-item @click="selecionarLeitura('Leitura fria', 1)">Leitura fria</b-dropdown-item>
                     <b-dropdown-item @click="selecionarLeitura('Leitura quente', 2)">Leitura quente</b-dropdown-item>
                  </b-dropdown>
               </b-form-group>
            </b-col>
         </b-row>
         <b-row v-if="tipoGrafico == 'temperatura'" class="justify-content-center d-flex overflow-auto">
            <b-col cols="12">
               <b-list-group horizontal class="mt-2">
                  <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Temperatura média do sensor">
                     <b-badge variant="primary" class="valor mr-1">Méd</b-badge>
                     <small class="valor text-nowrap">{{ this.temperatura?.sensor && this.temperatura.sensor.length ? (this.temperatura.sensor.reduce((acc, val) => acc + (isNaN(parseFloat(val[1])) ? 0 : parseFloat(val[1])), 0) / this.temperatura.sensor.length).toFixed(1) : '-' }} °C</small>
                  </b-list-group-item>
                  <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Temperatura mínima do sensor">
                     <b-badge variant="primary" class="valor mr-1">Mín</b-badge>
                     <small class="valor text-nowrap">{{ this.temperatura?.sensor && this.temperatura.sensor.length ? Math.min(...this.temperatura.sensor.map((item) => parseFloat(item[1]))) : '-' }} °C</small>
                  </b-list-group-item>
                  <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Temperatura máxima do sensor">
                     <b-badge variant="primary" class="valor mr-1">Máx</b-badge>
                     <small class="valor text-nowrap">{{ this.temperatura?.sensor && this.temperatura.sensor.length ? Math.max(...this.temperatura.sensor.map((item) => parseFloat(item[1]))) : '-' }} °C</small>
                  </b-list-group-item>
               </b-list-group>
            </b-col>
         </b-row>
         <b-row v-if="tipoGrafico == 'aeracao'" class="justify-content-center d-flex overflow-auto">
            <b-col cols="12">
               <b-list-group horizontal class="mt-3 mb-3">
                  <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Temperatura média">
                     <b-badge variant="primary" class="valor mr-1">Méd</b-badge>
                     <small class="valor text-nowrap">{{ this.aeracao?.tms && this.aeracao.tms.length ? (this.aeracao.tms.reduce((acc, val) => acc + (isNaN(parseFloat(val[1])) ? 0 : parseFloat(val[1])), 0) / this.aeracao.tms.length).toFixed(1) : '-' }} °C</small>
                  </b-list-group-item>
                  <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Temperatura mínima">
                     <b-badge variant="primary" class="valor mr-1">Mín</b-badge>
                     <small class="valor text-nowrap">{{ this.aeracao?.tmi && this.aeracao.tmi.length ? Math.min(...this.aeracao.tmi.map((item) => (item[1] !== 'erro' ? parseFloat(item[1]) : Infinity))) : '-' }} °C</small>
                  </b-list-group-item>
                  <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Temperatura máxima">
                     <b-badge variant="primary" class="valor mr-1">Máx</b-badge>
                     <small class="valor text-nowrap">{{ this.aeracao?.tma && this.aeracao.tma.length ? Math.max(...this.aeracao.tma.map((item) => (item[1] !== 'erro' ? parseFloat(item[1]) : 0))) : '-' }} °C</small>
                  </b-list-group-item>
                  <b-list-group-item class="d-flex justify-content-between align-items-center" v-b-tooltip.hover title="Total de horas aeradas">
                     <b-badge variant="primary" class="valor mr-1">Hor</b-badge>
                     <small class="valor text-nowrap">{{ this.aeracao?.aeracao && this.aeracao.aeracao.length ? this.aeracao.aeracao.reduce((acc, val) => acc + (isNaN(parseFloat(val[1])) ? 0 : parseFloat(val[1])), 0).toFixed(1) : '-' }} h</small>
                  </b-list-group-item>
               </b-list-group>
            </b-col>
         </b-row>
         <b-row ref="chartContainer">
            <b-col cols="12" v-if="tipoGrafico == 'conservacao'">
               <h1 class="mt-2" v-if="tipoGrafico == 'conservacao' && this.conservacao.UMS == 0">Umidade não informada pelo usuário</h1>
               <span v-if="tipoGrafico == 'conservacao' && (this.conservacao.UMS == 0 || this.conservacao.TMS == 0 || !this.conservacao.UMS || !this.conservacao.TMS)">Não foi possível analisar o estado de conservação na data selecionada</span>
            </b-col>
            <b-col cols="12" v-if="tipoGrafico == 'conservacao' && this.conservacao.UMS != 0 && this.conservacao.TMS != 0 && !!this.conservacao.UMS && !!this.conservacao.TMS">
               <small class="mt-2"> Análise da conservação com base na temperatura média da massa de grãos na leitura fria do dia {{ this.$moment(dataFinal).format('DD/MM/YYYY') }} e umidade da massa de grãos informada pelo usuário </small>
            </b-col>
            <b-col cols="12" v-if="tipoGrafico == 'inventario'">
               <small v-if="inventario?.configuracao == '1'">Capacidade estimada pelo sensor de nível</small>
               <small v-else>Capacidade estimada pela termometria</small>
            </b-col>
            <div ref="chart" style="width: 100%; height: 75vh"></div>
         </b-row>
      </b-overlay>
   </div>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'

export default {
   name: 'SiloGraficos',
   props: {
      tipoGrafico: String,
      pendulo: String
   },
   data() {
      return {
         controleAeracao: 9,
         controleLeitura: 1,
         aeracaoSelecionada: 'Aeração total',
         leituraSelecionada: 'Leitura fria',
         penduloSelecionado: null,
         sensorSelecionado: null,
         opcoesDoGrafico: {},
         buscandoPendulos: false,
         pendulosSilo: {},
         pendulos: [],
         sensores: [],
         buscandoInventario: false,
         inventario: {},
         buscandoConservacao: false,
         conservacao: {},
         buscandoTemperatura: false,
         temperatura: {},
         buscandoAeracao: false,
         aeracao: {},
         pontosQuentes: [],
         datasOperacao: [],
         dataInical: this.$moment().subtract(30, 'days').format('YYYY-MM-DD'),
         dataFinal: this.$moment().format('YYYY-MM-DD'),
         optionsLeitura: [
            { value: '1', label: 'Fria' },
            { value: '2', label: 'Quente' },
            { value: '3', label: 'Manual' },
            { value: '4', label: 'Periódica' }
         ],
         tipoLeitura: ['1', '2']
      }
   },

   computed: {
      dataMinima() {
         return this.$moment(this.dataFinal).subtract(30, 'days').format('YYYY-MM-DD')
      }
   },

   mounted() {
      const idSiloLocalStorage = localStorage.getItem('sil')

      if (idSiloLocalStorage && idSiloLocalStorage != 'undefined') {
         this.idSilo = idSiloLocalStorage
      } else {
         this.idSilo = this.$route.params.idSilo
         localStorage.setItem('sil', this.idSilo)
      }
      if (Object.keys(this.opcoesDoGrafico).length == 0) {
         this.initializeChart()
      }
      this.buscarPendulos()
      this.acionaBusca(this.tipoGrafico)
      this.chartInstance.on('legendselectchanged', this.selecionaLegenda)
   },

   methods: {
      marcaDatasOperacao(data) {
         const possuiData = this.datasOperacao.includes(data)
         return possuiData ? 'table-primary' : ''
      },
      acionaBusca(tipoGrafico) {
         if (tipoGrafico == 'temperatura') {
            this.buscarPendulos()
            this.buscarTemperaturas()
         } else if (tipoGrafico == 'conservacao') {
            this.buscarConservacao()
         } else if (tipoGrafico == 'inventario') {
            this.buscarInventario()
         } else if (tipoGrafico == 'aeracao') {
            this.buscarAeracao()
         }
      },
      selecionarAeracao(item, aeracao) {
         this.aeracaoSelecionada = item
         this.controleAeracao = aeracao
         this.buscarAeracao()
      },
      selecionarLeitura(item, leitura) {
         this.leituraSelecionada = item
         this.controleLeitura = leitura
         this.buscarAeracao()
      },
      selecionarPendulo(item) {
         this.sensores = []
         this.pontosQuentes = []
         this.penduloSelecionado = item
         this.formatarSensores(item)
         this.buscarTemperaturas()
      },
      selecionarSensor(item) {
         this.sensorSelecionado = item
         this.buscarTemperaturas()
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
      async buscarPendulos() {
         if (!this.idSilo) {
            return
         }
         this.buscandoPendulos = true
         const dados = await client.get(`/silo/buscarpendulo/${this.idSilo}?tipo=null&data=null`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar pêndulos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoPendulos = false
         })
         this.buscandoPendulos = false
         if (dados && dados.data) {
            this.pendulosSilo = dados.data
            this.formatarPendulos()
            this.formatarSensores('P1')
            this.datasOperacao = this.pendulosSilo.datasOperacao
         }
      },
      formatarPendulos() {
         const filteredKeys = []
         let counter = 1
         for (const key in this.pendulosSilo) {
            if (Object.prototype.hasOwnProperty.call(this.pendulosSilo, key) && key.charAt(0) === 'P') {
               filteredKeys.push(`P${counter}`)
               counter++
            }
         }
         this.pendulos = filteredKeys
      },
      formatarSensores(pendulo) {
         if (!this.pendulosSilo || !this.pendulosSilo[pendulo]) {
            return
         }
         const sensoresKey = []
         let counter = 1
         let temperaturas = JSON.parse(this.pendulosSilo[pendulo])
         let pontoQuente = temperaturas[2]
         this.converterBinario(pontoQuente)
         temperaturas = temperaturas[0].match(/.{1,3}/g) || []

         temperaturas.forEach(() => {
            sensoresKey.push(`S${counter}`)
            counter++
         })
         this.sensores = sensoresKey
      },
      converterBinario(decimal) {
         if (!decimal) return
         decimal = parseInt(decimal).toString(2).split('')
         const posicoes = decimal.reduce((acc, curr, i) => {
            if (curr == 1) {
               acc.push(`S${decimal.length - i}`)
            }
            return acc
         }, [])
         this.pontosQuentes = posicoes
      },
      variante(item) {
         if (!this.pontosQuentes.length) return
         if (this.pontosQuentes.includes(item)) {
            return 'danger'
         }
         return ''
      },
      converterUmidade(umidade) {
         if (umidade < 5) {
            return 5
         } else if (umidade > 25) {
            return 25
         } else {
            return umidade
         }
      },
      converterTemperatura(temperatura) {
         if (temperatura > 40) {
            return 40
         } else {
            return temperatura
         }
      },
      async buscarTemperaturas() {
         if (!this.idSilo) {
            return
         }
         this.buscandoTemperatura = true
         const dados = await client.get(`/silo/buscartemperatura/${this.idSilo}?pendulo=${this.penduloSelecionado}&sensor=${this.sensorSelecionado}&inicio=${this.dataInical}&fim=${this.dataFinal}&leitura=[${this.tipoLeitura}]`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar temperatura. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoTemperatura = false
         })
         this.buscandoTemperatura = false
         if (dados && dados.data) {
            this.temperatura = dados.data
            this.construirGrafico(this.temperatura)
         }
      },
      async buscarConservacao() {
         if (!this.idSilo) {
            return
         }
         this.buscandoConservacao = true
         const dados = await client.get(`/silo/buscarconservacao/${this.idSilo}?data=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar conservação. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoConservacao = false
         })
         this.buscandoConservacao = false
         if (dados && dados.data) {
            this.conservacao = dados.data
            this.construirGrafico(this.conservacao)
         }
      },
      async buscarInventario() {
         if (!this.idSilo) {
            return
         }
         this.buscandoInventario = true
         const dados = await client.get(`/silo/buscarinventario/${this.idSilo}?inicio=${this.dataInical}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar inventário. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoInventario = false
         })
         this.buscandoInventario = false
         if (dados && dados.data) {
            this.inventario = dados.data
            this.construirGrafico(this.inventario)
         }
      },
      async buscarAeracao() {
         if (!this.idSilo) {
            return
         }
         this.buscandoAeracao = true
         const dados = await client.get(`/silo/buscaraeracao/${this.idSilo}?leitura=${this.controleLeitura}&controle=${this.controleAeracao}&inicio=${this.dataInical}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar aeração. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoAeracao = false
         })
         this.buscandoAeracao = false
         if (dados && dados.data) {
            this.aeracao = dados.data
            this.construirGrafico(this.aeracao)
            this.datasOperacao = this.aeracao.datasOperacao
         }
      },
      construirGrafico() {
         if (this.tipoGrafico == 'temperatura') {
            let unidadeVariavel = '°C'
            this.opcoesDoGrafico = {
               legend: { textStyle: { color: '#6c727a' }, top: 50, data: [this.sensorSelecionado || 'S1', 'Média do silo', 'Média do pêndulo'], selected: { 'Média do silo': false, 'Média do pêndulo': false }, type: 'scroll', orient: 'horizontal', bottom: 20, height: 50 },
               xAxis: {
                  type: 'time',
                  boundaryGap: false,
                  axisLabel: {
                     formatter: function (value) {
                        return echarts.format.formatTime('dd/MM', value)
                     }
                  }
               },
               yAxis: [{ type: 'value', position: 'left', axisLine: { show: true, lineStyle: { color: 'orange' } }, axisLabel: { formatter: '{value} °C' } }],
               dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
               grid: { left: '3%', right: '4%', bottom: '10%', top: '13%', containLabel: true },
               tooltip: {
                  trigger: 'axis',
                  formatter: (params) => {
                     const date = new Date(params[0].value[0])
                     const leitura = params[3]?.value[1] ?? ''
                     const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
                     let corTexto = ''
                     let tooltipContent = `<div class="text-left">${formattedTime}<br/>${leitura}`
                     params.forEach((param) => {
                        if (param.seriesName && param.seriesName.startsWith('L')) {
                           return
                        }
                        unidadeVariavel = ['S', 'M'].includes(param.seriesName.charAt(0)) ? '°C' : ''
                        corTexto = ['P'].includes(param.seriesName.charAt(0)) && param.value[1] == 'Sim' ? 'text-danger' : ''
                        tooltipContent += `<div class="d-flex justify-content-between">
                        <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                        <span class="text-right ${corTexto}"><b>${param.value[1]} ${unidadeVariavel}</b></span>
                     </div>`
                     })
                     tooltipContent += '</div>'
                     return tooltipContent
                  }
               },
               series: [
                  { name: this.sensorSelecionado || 'S1', data: this.temperatura.sensor, type: 'line', yAxisIndex: 0, itemStyle: { color: 'orange' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: 'Média do silo', data: this.temperatura.mediaSilo, type: 'line', yAxisIndex: 0, itemStyle: { color: 'blue' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: 'Média do pêndulo', data: this.temperatura.media, type: 'line', yAxisIndex: 0, itemStyle: { color: 'darkred' }, smooth: true, showSymbol: false, tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: 'Nível', data: this.temperatura.nivel, type: 'line', yAxisIndex: 0, itemStyle: { color: 'transparent' }, smooth: true },
                  { name: 'Ponto Quente', data: this.temperatura.pontoQuente, type: 'line', yAxisIndex: 0, itemStyle: { color: 'transparent' }, smooth: true },
                  { name: 'Leitura', data: this.temperatura.leituras, type: 'line', yAxisIndex: 0, itemStyle: { color: 'transparent' }, smooth: true }
               ]
            }
         } else if (this.tipoGrafico == 'conservacao') {
            this.opcoesDoGrafico = {
               legend: { textStyle: { color: '#6c727a' }, selectedMode: false, top: 20, data: ['Zona boa', 'Insetos', 'Alto risco', 'Germinação e fungos', 'Status'], type: 'scroll', orient: 'horizontal', height: 50 },
               xAxis: [{ name: '%', type: 'value', interval: 1, min: 5, max: 25, data: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] }],
               yAxis: [{ name: '°C', type: 'value', interval: 4, max: 40 }],
               grid: { left: '3%', right: '4%', bottom: '0%', top: '13%', containLabel: true },
               tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
               series: [
                  {
                     name: 'Zona boa',
                     type: 'line',
                     color: '#458a45',
                     symbol: 'none',
                     smooth: true,
                     areaStyle: { opacity: 1 },
                     z: 4,
                     data: [
                        [23, 0],
                        [22, 1],
                        [21, 3],
                        [20, 4],
                        [19, 6],
                        [18, 8],
                        [17, 10],
                        [16, 12],
                        [15, 14],
                        [14, 17],
                        [13, 18],
                        [12, 18],
                        [11, 18],
                        [10, 18],
                        [9, 18],
                        [8, 19],
                        [7, 20],
                        [6, 22],
                        [5, 23]
                     ]
                  },
                  {
                     name: 'Insetos',
                     type: 'line',
                     stack: 'Total',
                     color: '#f3ef00',
                     symbol: 'none',
                     smooth: true,
                     areaStyle: { opacity: 1 },
                     z: 3,
                     data: [
                        [14, 17],
                        [13, 22],
                        [12, 26],
                        [11, 30],
                        [10, 32],
                        [9, 34],
                        [8, 35],
                        [7, 36],
                        [6, 36.5],
                        [5, 37]
                     ]
                  },
                  {
                     name: 'Germinação e fungos',
                     type: 'line',
                     color: '#e6a901',
                     symbol: 'none',
                     smooth: true,
                     areaStyle: { opacity: 1 },
                     z: 2,
                     data: [
                        [25, 18],
                        [24, 18],
                        [23, 18],
                        [22, 18],
                        [21, 18],
                        [20, 18],
                        [19, 18],
                        [18, 18],
                        [17, 18],
                        [16, 18],
                        [15, 18],
                        [14, 21],
                        [13, 24],
                        [12, 40],
                        [11, 40],
                        [10, 40],
                        [9, 40],
                        [8, 40],
                        [7, 40],
                        [6, 40],
                        [5, 40]
                     ]
                  },
                  {
                     name: 'Alto risco',
                     type: 'line',
                     color: '#db4646',
                     symbol: 'none',
                     smooth: true,
                     areaStyle: { opacity: 1 },
                     z: 1,
                     data: [
                        [25, 40],
                        [24, 40],
                        [23, 40],
                        [22, 40],
                        [21, 40],
                        [20, 40],
                        [18, 40],
                        [17, 40],
                        [16, 40],
                        [15, 40],
                        [14, 40],
                        [13, 40],
                        [12, 40],
                        [11, 40],
                        [10, 40],
                        [9, 40],
                        [8, 40],
                        [7, 40]
                     ]
                  },
                  {
                     name: 'Status',
                     type: 'scatter',
                     color: 'black',
                     symbolSize: 17,
                     z: 10,
                     data: [[this.converterUmidade(this.conservacao.UMS), this.converterTemperatura(this.conservacao.TMS)]]
                     // data: [[this.converterUmidade(20.6), this.converterTemperatura(35.8)]]
                  }
               ]
            }
            if (this.conservacao.UMS == 0 || this.conservacao.TMS == 0 || !this.conservacao.UMS || !this.conservacao.TMS) {
               this.opcoesDoGrafico = {}
            }
         } else if (this.tipoGrafico == 'inventario') {
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
                     lineStyle: {
                        color: corProduto,
                        type: 'dashed',
                        width: 2
                     },
                     tooltip: {
                        show: false
                     }
                  }
               )
            })
            this.opcoesDoGrafico = {
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
                           <span class="text-right"><b>${param.value[1]} ${unidadeVariavel}</b></span>`
                        tooltipContent += `</div>`
                     })
                     tooltipContent += '</div>'
                     return tooltipContent
                  }
               },
               series: series
            }
         } else if (this.tipoGrafico == 'aeracao') {
            this.opcoesDoGrafico = {
               grid: { left: '3%', right: '4%', bottom: '10%', top: '13%', containLabel: true },
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
                           <span class="text-right"><b>${param.value[1]} ${param.seriesName && !param.seriesName.startsWith('N') ? (param.componentSubType == 'bar' ? ' h' : ' °C') : ''}</b></span>
                        </div>`
                     })
                     tooltipContent += '</div>'
                     return tooltipContent
                  }
               },
               toolbox: { bottom: -4, left: -2, orient: 'vertical', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
               dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
               legend: { textStyle: { color: '#6c727a' }, data: ['Aeração', 'Máxima', 'Mínima', 'Média'] },
               xAxis: [
                  { type: 'time', gridIndex: 0, axisLabel: { formatter: function (value) { return echarts.format.formatTime('dd/MM', value) } } }
               ],
               yAxis: [
                  { type: 'value', name: 'Horas', min: 0, max: 24, alignTicks: true, axisLabel: { formatter: function (value) { return `${Math.round(value)} h` } } },
                  { type: 'value', name: 'Temperatura', min: 0, axisLabel: { formatter: '{value} °C' } }
               ],
               series: [
                  { name: 'Aeração', type: 'bar', barMaxWidth: this.aeracao.aeracao.length <= 2 ? '5%' : undefined, data: this.aeracao.aeracao },
                  { name: 'Média', type: 'line', yAxisIndex: 1, showSymbol: false, data: this.aeracao.tms },
                  { name: 'Mínima', type: 'line', yAxisIndex: 1, showSymbol: false, data: this.aeracao.tmi },
                  { name: 'Máxima', type: 'line', yAxisIndex: 1, showSymbol: false, data: this.aeracao.tma },
                  { name: 'Nível', data: this.aeracao.nivel, type: 'line', yAxisIndex: 0, itemStyle: { color: 'transparent' }, smooth: true }
               ]
            }
         }
      },
      selecionaLegenda(params) {
         if (this.tipoGrafico != 'inventario') {
            return
         }
         const selected = params.selected
         const seriesNames = Object.keys(selected)
         if (selected[seriesNames[0]] && selected[seriesNames[1]]) {
            const lastClicked = params.name
            const newSelection = {
               [seriesNames[0]]: seriesNames[0] === lastClicked,
               [seriesNames[1]]: seriesNames[1] === lastClicked
            }
            this.$nextTick(() => {
               this.chartInstance.setOption({
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
      },
      tipoGrafico() {
         this.acionaBusca(this.tipoGrafico)
      },
      pendulo() {
         this.selecionarPendulo(this.pendulo)
      }
   }
}
</script>

<style scoped>
.valor {
   font-size: 16px;
   font-weight: 400;
}

.overlay {
   z-index: 0;
}
</style>