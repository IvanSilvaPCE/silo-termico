<template>
   <div>
      <div class="white_shd full margin_bottom_30">
         <div class="full graph_head">
            <div class="heading1 margin_0">
               <b-overlay :show="buscandoEquipamento" rounded="sm" class="overlay">
                  <b-row class="align-items-center justify-content-center justify-content-md-start text-center text-md-left">
                     <b-col sm="12" lg="3">
                        <h2>{{ equipamento?.ds_equipamento }}</h2>
                     </b-col>
                     <b-col cols="4" md="2" lg="1" v-b-tooltip.hover title="Status">
                        <b-icon icon="circle-fill" scale="1.5" class="mr-2" :variant="corVariant(this.equipamento.st_operacao)"></b-icon>
                        <span :class="corTexto(this.equipamento.st_operacao)">{{ formatarStatus(this.equipamento.st_operacao) || '-' }}</span>
                     </b-col>
                  </b-row>
                  <b-row class="text-center text-md-left">
                     <b-col>
                        <small class="mb-0">Última atualização: {{ formatarData(this.nivel?.data) }}</small>
                     </b-col>
                  </b-row>
               </b-overlay>
            </div>
         </div>

         <div class="map_section padding_infor_info">
            <b-row>
               <b-col>
                  <h1 class="mb-2 text-center text-md-left">Resumo da armazenagem</h1>
               </b-col>
            </b-row>
            <b-row>
               <b-col>
                  <div ref="chartContainer">
                     <b-overlay :show="buscandoNivel" rounded="sm" class="overlay">
                        <div ref="chartInventario" style="width: 100%; height: 65vh"></div>
                     </b-overlay>
                  </div>
               </b-col>
            </b-row>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'
import * as echarts from 'echarts'

export default {
   name: 'TermometriaDados',
   data() {
      return {
         buscandoEquipamento: false,
         buscandoNivel: false,
         equipamento: [],
         nivel: [],
         graficoInventario: {}
      }
   },

   methods: {
      async buscarEquipamento() {
         if (!this.idTermometria) {
            return
         }
         this.buscandoEquipamento = true
         const dados = await client.get(`/equipamento/${this.idTermometria}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamento. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoEquipamento = false
         })
         this.buscandoEquipamento = false
         if (dados && dados.data) {
            this.equipamento = dados.data
         }
      },
      async buscarNivel() {
         if (!this.idTermometria) {
            return
         }
         this.buscandoNivel = true
         const dados = await client.get(`/termometria/buscarnivel/${this.idTermometria}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoNivel = false
         })
         this.buscandoNivel = false
         if (dados && dados.data) {
            this.nivel = dados.data
            this.construirGraficoInventario()
         }
      },
      construirGraficoInventario() {
         const legenda = Object.keys(this.nivel?.dados)
         const series = Object.keys(this.nivel?.dados).map((cultura, index) => ({
            name: cultura,
            type: 'bar',
            barWidth: '50%',
            minWidth: '50%',
            itemStyle: { color: this.corProduto(index) },
            stack: 'stack1',
            data: this.nivel?.dados[cultura].map((item) => [item[0], parseFloat(item[1])]),
            label: {
               show: true,
               position: 'inside',
               formatter: function (params) {
                  return params.value[1] + '%'
               },
               color: '#fff',
               fontWeight: 'bold',
               fontSize: 12
            }
         }))
         series.push(
            {
               name: 'Volume',
               type: 'line',
               lineStyle: { color: 'transparent', opacity: 0, width: 0 },
               itemStyle: { color: 'transparent', opacity: 0 },
               emphasis: { lineStyle: { opacity: 0 }, itemStyle: { opacity: 0 } },
               showSymbol: false,
               data: this.nivel?.volume
            },
            {
               name: 'Peso',
               type: 'line',
               lineStyle: { color: 'transparent', opacity: 0, width: 0 },
               itemStyle: { color: 'transparent', opacity: 0 },
               emphasis: { lineStyle: { opacity: 0 }, itemStyle: { opacity: 0 } },
               showSymbol: false,
               data: this.nivel?.peso
            },
            {
               name: 'Nível',
               type: 'line',
               lineStyle: { color: 'transparent', opacity: 0, width: 0 },
               itemStyle: { color: 'transparent', opacity: 0 },
               emphasis: { lineStyle: { opacity: 0 }, itemStyle: { opacity: 0 } },
               showSymbol: false,
               data: this.nivel?.nivel
            }
         )
         this.graficoInventario = {
            grid: {
               left: '3%',
               right: '4%',
               bottom: '3%',
               containLabel: true
            },
            tooltip: {
               trigger: 'axis',
               axisPointer: {
                  type: 'shadow'
               },
               formatter: (params) => {
                  let tooltipContent = `<div class="text-left">`
                  params.forEach((param) => {
                     let unidadeVariavel = '%'
                     if (param.seriesName == 'Volume') {
                        unidadeVariavel = 'm³'
                     } else if (param.seriesName == 'Peso') {
                        unidadeVariavel = 'ton'
                     } else if (param.seriesName == 'Nível') {
                        unidadeVariavel = ''
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
            legend: { textStyle: { color: '#6c727a' }, data: legenda },
            xAxis: [{ type: 'category', axisTick: { alignWithLabel: true } }],
            yAxis: [{ type: 'value', axisLabel: { formatter: '{value} %' }, max: 100 }],
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
      formatarStatus(value) {
         const status = {
            OF: 'Offline',
            EF: 'Alerta',
            EC: 'Em configuração',
            EM: 'Em manutenção',
            CM: 'Com mensagem',
            ON: 'Online'
         }
         return status[value]
      },
      corTexto(st_operacao) {
         const variant = {
            OF: 'text-secondary',
            EF: 'text-danger',
            EC: 'text-dark',
            EM: 'text-warning',
            ON: 'text-success'
         }
         return variant[st_operacao]
      },
      corVariant(st_operacao) {
         const variant = {
            OF: 'secondary',
            EF: 'danger',
            EC: 'dark',
            EM: 'warning',
            ON: 'success'
         }
         return variant[st_operacao]
      },
      corProduto(index) {
         const cores = {
            0: 'rgba(0, 143, 251, 0.85)',
            1: 'rgba(0, 227, 150, 0.85)',
            2: 'rgba(254, 176, 25, 0.85)',
            3: 'rgba(255, 69, 96, 0.85)',
            4: 'rgba(119, 93, 208, 0.85)',
            5: 'rgba(0, 143, 251, 0.85)',
            6: 'rgba(0, 227, 150, 0.85)'
         }
         return cores[index]
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm').format('DD/MM/YYYY HH:mm')
      }
   },

   mounted() {
      const idTermometriaLocalStorage = localStorage.getItem('sil')

      if (idTermometriaLocalStorage && idTermometriaLocalStorage != 'undefined') {
         this.idTermometria = idTermometriaLocalStorage
      } else {
         this.idTermometria = this.$route.params.idTermometria
         localStorage.setItem('ter', this.idTermometria)
      }
      this.buscarEquipamento()
      this.buscarNivel()

      this.initializeChartInventario()

      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(this.$refs.chartContainer)

      window.addEventListener('resize', this.handleResize)
   }
}
</script>

<style scoped>
.overlay {
   z-index: 0;
}
</style>