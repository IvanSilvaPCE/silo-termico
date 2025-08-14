<template>
   <div v-if="temperatura.length">
      <div v-for="(relatorio, index) in temperatura" :key="index" style="page-break-inside: avoid">
         <div class="mt-2" style="border: 1px solid #c0c0c0 !important; border-radius: 5px">
            <b-row style="width: 99%">
               <b-col class="text-center">
                  <p class="mb-0">
                     <b class="fonte-tab">{{ formatarLeitura(relatorio?.dados?.TIP) + ' ' + formatarData(relatorio?.dados?.DAT) }}</b>
                  </p>
               </b-col>
            </b-row>
            <hr class="mt-1 mb-1 mr-1 ml-1" />
            <b-row class="text-center" style="width: 99%">
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">T<sub>med</sub>:</b> {{ relatorio?.dados?.TMS / 10 || '-' }} °C</p>
               </b-col>
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">T<sub>mín</sub>:</b> {{ relatorio?.dados?.TMI / 10 || '-' }} °C</p>
               </b-col>
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">T<sub>máx</sub>:</b> {{ relatorio?.dados?.TMA / 10 || '-' }} °C</p>
               </b-col>
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">U<sub>med</sub>:</b> {{ relatorio?.dados?.UMS / 10 || '-' }} %</p>
               </b-col>
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">P<sub>quente</sub>:</b> {{ relatorio?.dados?.NPQ }}</p>
               </b-col>
            </b-row>
            <hr class="mt-1 mb-1 mr-1 ml-1" />
            <b-row class="text-center">
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">T<sub>amb</sub>:</b> {{ relatorio?.dados?.TEM }} °C</p>
               </b-col>
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">U<sub>amb</sub>:</b> {{ relatorio?.dados?.UMI }} %</p>
               </b-col>
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">Chuva:</b> {{ relatorio?.dados?.CHO == '1' ? 'Sim' : 'Não' }}</p>
               </b-col>
               <b-col cols="3">
                  <p class="mb-0"><b class="fonte-tab">Capac.: </b>{{ converterSacas(relatorio?.dados?.CUL, relatorio?.dados?.VOL) || '-' }}<sub> sacas</sub> / {{ relatorio?.dados?.NIV || '-' }} %</p>
               </b-col>
               <b-col cols="4">
                  <p class="mb-0"><b class="fonte-tab">Conservação:</b> {{ relatorio?.dados?.UMS == 0 ? 'Umidade não informada' : relatorio?.dados?.TMS == 0 || !relatorio?.dados?.TMS ? 'Conservação não calculada' : buscarConservacao(calcularConservacao(relatorio?.dados?.UMS, relatorio?.dados?.TMS)) }}</p>
               </b-col>
            </b-row>
         </div>
         <b-table borderless :fields="campos(relatorio)" :items="relatorio.pendulos" class="mt-0 mb-2 tabela-relatorio text-start" table-sm responsive small>
            <template #table-busy>
               <div class="text-center text-danger my-2">
                  <b-spinner class="align-middle mr-1"></b-spinner>
                  <strong>Carregando...</strong>
               </div>
            </template>
            <template v-for="column in getColumnHeaders(relatorio.pendulos)" #[`cell(${column})`]="data">
               <b-badge :key="column" :class="calculateColorClass(data.value)" class="estilo-badge2" align="center">
                  {{ data.value[3] == 1 || data.value[0] == 0.0 ? 'ERRO' : data.value[0] }}
               </b-badge>
            </template>
         </b-table>
      </div>
   </div>
</template>

<script>
export default {
   name: 'ArmazemRelatorioTemperatura',
   props: {
      buscandoTemperatura: Boolean,
      temperatura: Array
   },

   methods: {
      getColumnHeaders(dados) {
         if (!Array.isArray(dados) || dados.length === 0) {
            return []
         }
         return Object.keys(dados[0]).filter((coluna) => coluna !== 'S')
      },
      campos(dados) {
         if (!dados) {
            return []
         }
         const chavesFiltradas = Object.keys(dados.pendulos[0]).filter((chave) => chave !== 'S')
         let fields = [{ key: 'S', label: 'S', thClass: 'text-center', stickyColumn: true, class: 'col_sensor' }]
         chavesFiltradas.forEach((valor) => {
            fields.push({ key: valor, thClass: 'text-center' })
         })
         return fields
      },
      calculateColorClass(value) {
         // value[1] = temperatura | value[2] = media | value[3] = p. quente | value[4] = falha | value[5] = nivel
         const colorMap = [
            { max: 12, color: 'background-color-blue' },
            { max: 15, color: 'background-color-lightblue' },
            { max: 17, color: 'background-color-lightgreen' },
            { max: 21, color: 'background-color-green' },
            { max: 25, color: 'background-color-greeng' },
            { max: 27, color: 'background-color-yellow' },
            { max: 30, color: 'background-color-orange' },
            { max: 35, color: 'background-color-red' },
            { max: 50, color: 'background-color-violet' },
            { max: Infinity, color: 'background-color-darkviolet' }
         ]

         let color = value[0] == null ? '' : colorMap.find((c) => value[0] < c.max).color
         let colorNivel = value[4] == 0 ? 'nivel' : ''
         let colorPontoQuente = value[4] == 1 && value[2] == 1 ? 'ponto-quente' : ''
         let colorErro = value[3] == 1 || value[0] == 0.0 ? 'erro-leitura' : ''

         return `${color} ${colorNivel} ${colorErro} ${colorPontoQuente}`
      },
      formatarLeitura(value) {
         const leitura = {
            1: 'Leitura Fria',
            2: 'Leitura Quente',
            3: 'Leitura Manual',
            4: 'Leitura Periódica'
         }
         return leitura[value]
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format(' - HH:mm - DD/MM/YYYY')
      },
      converterSacas(grao, volume) {
         if (!grao || grao == 0 || !volume) {
            return null
         }
         const densidades = {
            1: 750,
            2: 700,
            3: 750,
            4: 650,
            5: 760,
            6: 100,
            7: 300
         }
         const densidade = densidades[grao] || 700
         const pesoSaca = 60
         const massaTotal = volume * densidade
         const numeroSacas = Math.round(massaTotal / pesoSaca)
         return numeroSacas
      },
      calcularConservacao(umidade, temperatura) {
         if (!umidade || !temperatura || umidade == 0 || temperatura == 0) {
            return 0
         }
         umidade = umidade / 10
         temperatura = temperatura / 10
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
      },
      buscarConservacao(conservacao) {
         const conservacoes = {
            1: 'Grãos conservados',
            2: 'Proliferação de insetos',
            3: 'Proliferação de fungos',
            4: 'Alto risco'
         }
         return conservacoes[conservacao]
      }
   }
}
</script>

<style scoped>
.fonte-tab {
   font-weight: 500;
}

.titulo {
   font-size: 16px;
   font-weight: 600;
}

.estilo-badge2 {
   padding: 6px;
   border-radius: 35px;
   position: relative;
   z-index: 1 !important;
   border: transparent;
}

/* Estilos para as cores de fundo condicionais */
/* p1 < 12 */
.background-color-blue {
   background-color: #0384fc;
   color: black;
}

/* p1 >= 12 e < 15 */
.background-color-lightblue {
   background-color: #03e8fc;
   color: black;
}

/* p1 >= 15 e < 17 */
.background-color-lightgreen {
   background-color: #03fcbe;
   color: black;
}

/* p1 >= 17 e < 21 */
.background-color-green {
   background-color: #07fc03;
   color: black;
}

/* p1 >= 21 e < 25*/
.background-color-greeng {
   background-color: #c3ff00;
   color: black;
}

/* p1 >= 25 e < 27 */
.background-color-yellow {
   background-color: #fcf803;
   color: black;
}

/* p1 >= 27 e < 30 */
.background-color-orange {
   background-color: #ffb300;
   color: black;
}

/* p1 >= 30 e < 35*/
.background-color-red {
   background-color: #ff2200;
   color: black;
}

/* p1 >= 35 e < 50 */
.background-color-violet {
   background-color: #ff0090;
   color: black;
}

/* p1 >= 50 */
.background-color-darkviolet {
   background-color: #f700ff;
   color: black;
}

::v-deep(.tabela-relatorio td) {
   position: relative;
   text-align: center;
   padding: 0.1rem;
   overflow: hidden;
}

::v-deep(.tabela-relatorio td::after) {
   content: '';
   position: absolute;
   width: 5px;
   background-color: #555;
   z-index: 0;
   top: 50%;
   bottom: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   height: calc(100%);
}

.nivel {
   background-color: #d4d4d4;
}

.erro-leitura {
   background-color: red !important;
   color: white !important;
   padding: 6px !important;
   border-radius: 35px !important;
   position: relative !important;
   z-index: 1 !important;
}

.ponto-quente {
   border-radius: 50%;
   border: #ff0000 2px solid !important;
   z-index: 1 !important;
   padding: 6px;
}

::v-deep(.col_sensor::after) {
   border: none !important;
   width: 0px !important;
   background-color: #555;
}

::v-deep(.tabela-relatorio .table) {
   width: auto !important;
}
</style>