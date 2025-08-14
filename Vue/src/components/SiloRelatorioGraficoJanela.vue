<template>
   <div ref="chart" style="width: 100%; height: 55vh"></div>
</template>
 
 <script>
import * as echarts from 'echarts'

export default {
   name: 'SiloRelatorioGraficoJanela',
   props: {
      opcoesDoGrafico: Object
   },
   data() {
      return {
         chartInstance: null
      }
   },
   mounted() {
      this.initializeChart()
   },
   methods: {
      initializeChart() {
         this.chartInstance = echarts.init(this.$refs.chart)
         this.chartInstance.setOption(this.opcoesDoGrafico)
      },
      updateChart(novasOpcoes) {
         if (this.chartInstance) {
            this.chartInstance.setOption(novasOpcoes)
         }
      },
      resizeChart() {
         if (this.chartInstance) {
            this.chartInstance.resize()
         }
      }
   },
   watch: {
      opcoesDoGrafico: {
         handler(novasOpcoes) {
            this.updateChart(novasOpcoes)
         },
         deep: true
      }
   },
   beforeDestroy() {
      if (this.chartInstance) {
         this.chartInstance.dispose()
      }
   }
}
</script>
 
 <style scoped>
</style>
 