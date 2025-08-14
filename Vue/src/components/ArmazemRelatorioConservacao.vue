<template>
   <div v-if="conservacao?.dados" class="mt-3">
      <b-row>
         <b-col>
            <b-table small striped bordered :items="conservacao.dados" :fields="fields" responsive>
               <template #cell(temperatura)="row">
                  <span>{{ !isNaN(row.item.temperatura) ? Number(row.item.temperatura).toFixed(1) : 'erro' }} °C</span>
               </template>
               <template #cell(tm_tendencia)="row">
                  <b-icon :icon="icone(row.item.tm_tendencia)" :variant="corIcone(row.item.tm_tendencia)" scale="1.2"></b-icon>
               </template>
               <template #cell(umidade)="row">
                  <span>{{ row.item.umidade }} %</span>
               </template>
               <template #cell(um_tendencia)="row">
                  <b-icon :icon="icone(row.item.um_tendencia)" :variant="corIcone(row.item.um_tendencia)" scale="1.2"></b-icon>
               </template>
               <template #cell(conservacao)="row">
                  <b-icon icon="circle-fill" class="mr-1" :style="{ color: corConservacao(row.item.umidade, row.item.temperatura) }"></b-icon>
                  <span class="mb-0">{{ row.item.umidade == 0 || !row.item.umidade ? 'Umidade não informada' : row.item.temperatura == 0 || !row.item.temperatura ? 'Conservação não calculada' : buscarConservacao(calcularConservacao(row.item?.umidade, row.item?.temperatura)) }}</span>
               </template>
            </b-table>
         </b-col>
      </b-row>
   </div>
</template>

<script>
export default {
   name: 'ArmazemRelatorioConservacao',
   props: {
      conservacao: [Array, Object]
   },

   data() {
      return {
         items: [],
         fields: [
            { key: 'data', label: 'Data', thClass: 'text-center' },
            { key: 'temperatura', label: 'Temperatura', thClass: 'text-center' },
            { key: 'tm_tendencia', label: 'Tendência', thClass: 'text-center' },
            { key: 'umidade', label: 'Umidade', thClass: 'text-center' },
            { key: 'um_tendencia', label: 'Tendência', thClass: 'text-center' },
            { key: 'conservacao', label: 'Conservação', thClass: 'text-center' }
         ]
      }
   },

   methods: {
      icone(valor) {
         const icone = {
            '>': 'arrow-up',
            '<': 'arrow-down',
            '-': 'dash'
         }
         return icone[valor]
      },
      corIcone(valor) {
         const icone = {
            '>': 'danger',
            '<': 'success',
            '-': 'secondary'
         }
         return icone[valor]
      },
      corConservacao(umidade, temperatura) {
         if (umidade == 0 || !umidade || temperatura == 0 || !temperatura) return '#adaaaa'
         const conservacao = this.calcularConservacao(umidade, temperatura)
         const conservacoes = {
            1: '#28a745',
            2: '#ffc107',
            3: '#ec7404',
            4: '#dc3545 '
         }
         let cor = conservacoes[conservacao] || '#adaaaa'
         return cor
      },
      buscarConservacao(conservacao) {
         const conservacoes = {
            1: 'Grãos conservados',
            2: 'Proliferação de insetos',
            3: 'Proliferação de fungos',
            4: 'Alto risco'
         }
         return conservacoes[conservacao]
      },
      calcularConservacao(umidade, temperatura) {
         if (!umidade || !temperatura || umidade == 0 || temperatura == 0 || umidade == 'erro' || temperatura == 'erro') {
            return 0
         }
         umidade = Math.min(Math.max(umidade, 5), 25)
         umidade = Math.round(umidade)
         temperatura = Math.min(temperatura, 40)
         const verificarFaixa = (faixas, umidade, temperatura) => {
            return faixas.some(([umMin, umMax, tempMin, tempMax]) => {
               return umidade >= umMin && umidade < umMax && temperatura >= tempMin && temperatura <= tempMax
            })
         }
         const faixas1 = [
            [5, 6, 0, 23],
            [6, 7, 0, 22],
            [7, 8, 0, 20],
            [8, 9, 0, 19],
            [9, 10, 0, 18],
            [10, 11, 0, 18],
            [11, 12, 0, 18],
            [12, 13, 0, 18],
            [13, 14, 0, 18],
            [14, 15, 0, 17],
            [15, 16, 0, 14],
            [16, 17, 0, 12],
            [17, 18, 0, 10],
            [18, 19, 0, 8],
            [19, 20, 0, 6],
            [20, 21, 0, 4],
            [21, 22, 0, 3],
            [22, 23, 0, 1],
            [23, 24, 0, 0]
         ]
         const faixas2 = [
            [5, 6, 23.1, 37],
            [6, 7, 22.1, 36.5],
            [7, 8, 20.1, 36],
            [8, 9, 19.1, 35],
            [9, 10, 18.1, 34],
            [10, 11, 18.1, 32],
            [11, 12, 18.1, 30],
            [12, 13, 18.1, 26],
            [13, 14, 18.1, 21],
            [14, 15, 17.1, 18]
         ]
         const faixas3 = [
            [5, 6, 37.1, 40],
            [6, 7, 36.6, 40],
            [7, 8, 36.1, 40],
            [8, 9, 35.1, 40],
            [9, 10, 34.1, 40],
            [10, 11, 32.1, 40],
            [11, 12, 30.1, 40],
            [12, 13, 26.1, 40],
            [13, 14, 21.1, 25],
            [14, 15, 18.1, 21],
            [15, 16, 18.1, 18],
            [16, 17, 18.1, 18],
            [17, 18, 9.1, 18],
            [18, 19, 8.1, 18],
            [19, 20, 6.1, 18],
            [20, 21, 4.1, 18],
            [21, 22, 3.1, 18],
            [22, 23, 1.1, 18],
            [23, 24, 0.1, 18],
            [24, 25, 0.1, 18],
            [25, 26, 0.1, 18]
         ]
         const faixas4 = [
            [12, 13, 34.1, 40],
            [13, 14, 25.1, 40],
            [14, 15, 21.1, 40],
            [15, 16, 18.1, 40],
            [16, 17, 18.1, 40],
            [17, 18, 18.1, 40],
            [18, 19, 18.1, 40],
            [19, 20, 18.1, 40],
            [20, 21, 18.1, 40],
            [21, 22, 18.1, 40],
            [22, 23, 18.1, 40],
            [23, 24, 18.1, 40],
            [24, 25, 18.1, 40],
            [25, 26, 18.1, 40]
         ]
         if (verificarFaixa(faixas1, umidade, temperatura)) return 1
         if (verificarFaixa(faixas2, umidade, temperatura)) return 2
         if (verificarFaixa(faixas3, umidade, temperatura)) return 3
         if (verificarFaixa(faixas4, umidade, temperatura)) return 4
         if (umidade < 5) {
            if (temperatura <= 23) return 1
            if (temperatura <= 37) return 2
            if (temperatura <= 40) return 3
            return 4
         }
         if (umidade > 25) {
            if (temperatura <= 19) return 3
            return 4
         }
      }
   }
}
</script>

<style>
</style>