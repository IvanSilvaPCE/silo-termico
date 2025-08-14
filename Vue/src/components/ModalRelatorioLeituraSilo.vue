<template>
   <b-modal id="relatorioLeituraSilo" size="xl" title="Relatório" ok-title="Salvar" cancel-title="Cancelar" @ok="generatePDF()" scrollable>
      <b-row style="margin: 0 -12px 0 -12px">
         <b-col sm="12" md="6" lg="3">
            <b-form-group label="Data inicial">
               <b-form-datepicker v-model="dataInical" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-form-group>
         </b-col>
         <b-col sm="12" md="6" lg="3">
            <b-form-group label="Data final">
               <b-form-datepicker v-model="dataFinal" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-form-group>
         </b-col>
         <b-col sm="12" md="6" lg="3">
            <b-form-group label="Tipo de Leitura">
               <v-select multiple v-model="tipoLeitura" :options="optionsLeitura" :reduce="(leitura) => leitura.value">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
            </b-form-group>
         </b-col>
         <b-col sm="12" md="6" lg="3">
            <b-button variant="outline-primary" class="mt-sm-0 mt-md-4" @click="buscarRelatorio()" :disabled="buscandoRelatorio">
               <span v-if="!buscandoRelatorio">Buscar</span>
               <div v-else>
                  <b-spinner small></b-spinner>
                  <span class="ml-1">Buscando...</span>
               </div>
            </b-button>
         </b-col>
      </b-row>
      <hr />
      <div ref="contentToPrint" style="min-height: 30vh">
         <b-row v-if="relatorio.length" class="m-1 align-items-center" style="border: 1px solid #c0c0c0 !important; border-radius: 5px">
            <b-col style="max-width: 180px !important; margin: 2px 0 2px 0">
               <img src="@/assets/images/logo/pce_favicon.png" height="30" />
            </b-col>
            <b-col class="mr-2">
               <p class="mb-0 fonte-tab">Unidade: {{ equipamento?.pessoa?.natureza == 'J' ? equipamento?.pessoa?.nm_fantasia : equipamento?.pessoa?.nm_pessoa }}</p>
            </b-col>
            <b-col>
               <p class="mb-0 fonte-tab">Equipamento: {{ equipamento?.ds_equipamento }}</p>
            </b-col>
         </b-row>
         <div v-for="(relatorio, index) in relatorio" :key="index" style="page-break-inside: avoid">
            <b-row style="width: 99%">
               <b-col class="text-center">
                  <p class="mb-0 fonte-tab">Relatório: {{ formatarLeitura(relatorio?.dados?.TIP) + ' ' + formatarData(relatorio?.dados?.DAT) }}</p>
               </b-col>
            </b-row>
            <b-row class="text-center" style="width: 99%">
               <b-col>
                  <p class="mb-0 fonte-tab">Temperatura média: {{ relatorio?.dados?.TMS / 10 || '-' }} °C</p>
               </b-col>
               <b-col>
                  <p class="mb-0 fonte-tab">Temperatura mínima: {{ relatorio?.dados?.TMI / 10 || '-' }} °C</p>
               </b-col>
               <b-col>
                  <p class="mb-0 fonte-tab">Temperatura máxima: {{ relatorio?.dados?.TMA / 10 || '-' }} °C</p>
               </b-col>
               <b-col>
                  <p class="mb-0 fonte-tab">Umidade: {{ relatorio?.dados?.UMS / 10 || '-' }} %</p>
               </b-col>
            </b-row>
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
      <template #modal-footer="{ cancel, ok }">
         <b-button size="lg" variant="secondary" @click="cancel()"> Cancelar </b-button>
         <b-button size="lg" variant="primary" @click="ok()" :disabled="!relatorio.length"> Exportar </b-button>
      </template>
   </b-modal>
</template>

<script>
import client from '@/api'

export default {
   name: 'ModalRelatorioLeituraSilo',
   props: {
      idSilo: String,
      data: String,
      leitura: String,
      dadoPendulos: [Array, Object]
   },
   data() {
      return {
         buscandoRelatorio: false,
         relatorio: [],
         equipamento: [],
         tipoLeitura: ['1'],
         dataInical: this.$moment().format('YYYY-MM-DD'),
         dataFinal: this.$moment().format('YYYY-MM-DD'),
         optionsLeitura: [
            { value: '1', label: 'Fria' },
            { value: '2', label: 'Quente' },
            { value: '3', label: 'Manual' },
            { value: '4', label: 'Periódica' }
         ]
      }
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
         let fields = [{ key: 'S', label: 'S', thClass: 'text-center', stickyColumn: true, class: 'col_sensor' }]
         for (let i = 0; i < dados.quantidade; i++) {
            fields.push({ key: 'p' + (i + 1), thClass: 'text-center' })
         }
         return fields
      },
      calculateColorClass(value) {
         // value[0] = temperatura | value[1] = media | value[2] = p. quente | value[3] = falha | value[4] = nivel
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
      generatePDF() {
         const content = this.$refs.contentToPrint
         const options = {
            margin: 0.1,
            filename: 'RelatorioLeitura.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: ['css', 'avoid-all'] }
         }
         this.$html2pdf().set(options).from(content).save()
      },
      async buscarRelatorio() {
         if (!this.idSilo) {
            return
         }
         this.relatorio = []
         this.buscandoRelatorio = true
         const dados = await client.get(`/silo/buscarrelatorioleitura/${this.idSilo}?inicio=${this.dataInical}&fim=${this.dataFinal}&tipo=[${this.tipoLeitura}]`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar relatório. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorio = false
         })
         this.buscandoRelatorio = false
         if (dados && dados.data) {
            this.relatorio = dados.data
         }
      },
      async buscarEquipamento() {
         if (!this.idSilo) {
            return
         }
         const dados = await client.get(`/equipamento/${this.idSilo}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar silo. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
         })
         if (dados && dados.data) {
            this.equipamento = dados.data
         }
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
      }
   },

   watch: {
      idSilo() {
         this.buscarEquipamento()
      }
   }
}
</script>

<style>
.fonte-tab {
   font-weight: 400;
}

.estilo-badge2 {
   padding: 6px;
   border-radius: 35px;
   position: relative;
   z-index: 1 !important;
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

.tabela-relatorio td {
   position: relative;
   text-align: center;
   padding: 0.1rem;
   overflow: hidden;
}

.tabela-relatorio td::after {
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
   border: #ff0000 2px solid;
   z-index: 1 !important;
   padding: 6px;
}

.tabela-relatorio .table {
   width: auto !important;
}
</style>