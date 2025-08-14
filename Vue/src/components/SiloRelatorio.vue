<template>
   <div>
      <div>
         <b-row>
            <b-col sm="12" md="6" lg="3">
               <b-form-group label="Selecione o Tipo do Relatório">
                  <v-select multiple v-model="relatorioSelecionado" :options="optionsRelatorio" :reduce="(relatorio) => relatorio.value" @input="valorSelecionado()">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3">
               <b-form-group label="Selecione o Silo">
                  <b-form-select v-model="siloSelecionado" :options="optionsSilos"></b-form-select>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3">
               <b-form-group label="Selecione o Tipo de Intervalo">
                  <b-form-select v-model="intervaloSelecionado" :options="optionsIntervalo"></b-form-select>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="!dataUnicaSelecionada">
               <b-form-group :label="dataUnicaSelecionada ? 'Data' : 'Data Inicial'">
                  <b-form-datepicker v-model="dataInicial" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="!dataUnicaSelecionada">
               <b-form-group label="Data Final">
                  <b-form-datepicker v-model="dataFinal" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="dataUnicaSelecionada && intervaloSelecionado != 'semester' && intervaloSelecionado != 'year'">
               <b-form-group label="Selecione a Data">
                  <b-form-datepicker v-model="dataUnica" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-form-group>
            </b-col>
            <b-col cols="6" sm="3" md="3" lg="1">
               <b-button variant="outline-primary" class="mt-sm-0" @click="acionarBusca()" :disabled="buscandoRelatorio || buscandoRelatorioEstacao || buscandoRelatorioAeracao || buscandoRelatorioConservacao || buscandoRelatorioInventario || buscandoSilos || !dataInicial || !siloSelecionado">
                  <span v-if="!buscandoRelatorio && !buscandoRelatorioEstacao && !buscandoRelatorioAeracao && !buscandoRelatorioConservacao && !buscandoRelatorioInventario">Buscar</span>
                  <div v-else class="text-nowrap">
                     <b-spinner small></b-spinner>
                     <span class="ml-1">Buscar...</span>
                  </div>
               </b-button>
            </b-col>
            <b-col cols="6" sm="3" md="3" lg="1">
               <b-button variant="outline-primary" class="mt-sm-0" @click="generatePDF()" :disabled="(!temperatura.length && !estacao?.diario?.length && !aeracao?.tma?.length && !conservacao?.dados?.length && !inventario?.niv?.length) || buscandoRelatorio || buscandoRelatorioEstacao || buscandoRelatorioAeracao || buscandoRelatorioConservacao || buscandoRelatorioInventario || exportar">
                  <span v-if="!exportar">Exportar</span>
                  <div v-else class="text-nowrap">
                     <b-spinner small></b-spinner>
                     <span class="ml-1">Exportar...</span>
                  </div>
               </b-button>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <p class="mt-2"><strong>Intervalo Selecionado:</strong> {{ periodoCalculado }}</p>
            </b-col>
         </b-row>
      </div>

      <b-row style="margin: 0 -12px 0 -12px">
         <!-- <b-col sm="12" md="6" lg="3">
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
         </b-col> -->
      </b-row>
      <hr />
      <div ref="contentToPrint" id="content-to-export" style="min-height: 30vh; page-break-inside: avoid">
         <div v-if="temperatura.length" style="border: 1px solid #c0c0c0 !important; border-radius: 5px">
            <b-row>
               <b-col>
                  <p class="mb-0 titulo text-center">Relatório de Temperaturas</p>
               </b-col>
            </b-row>
            <hr class="m-1" />
            <b-row class="m-1 align-items-center">
               <b-col style="max-width: 150px !important; margin: 2px 0 2px 0">
                  <img src="@/assets/images/logo/pce_favicon.png" height="30" />
               </b-col>
               <b-col class="mr-2 text-center">
                  <p class="mb-0"><b class="fonte-tab">Unidade:</b> {{ equipamento?.pessoa?.natureza == 'J' ? equipamento?.pessoa?.nm_fantasia : equipamento?.pessoa?.nm_pessoa }}</p>
               </b-col>
               <b-col class="text-center">
                  <p class="mb-0"><b class="fonte-tab">Equipamento:</b> {{ equipamento?.ds_equipamento }}</p>
               </b-col>
               <b-col style="max-width: 180px !important; margin: 2px 0 2px 0">
                  <img v-if="imagem" :src="imagem" height="30" class="pull-right" />
               </b-col>
            </b-row>
            <hr class="m-1" />
            <b-row class="m-1">
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">Período:</b> {{ this.$moment(this.dataInicial).startOf('day').format('DD/MM/YYYY HH:mm') + ' - ' + (this.$moment(this.dataFinal).isSame(this.$moment(), 'day') ? this.$moment().format('DD/MM/YYYY HH:mm') : this.$moment(this.dataFinal).endOf('day').format('DD/MM/YYYY HH:mm')) }}</p>
               </b-col>
               <b-col>
                  <p class="mb-0 text-right"><b class="fonte-tab">Emissão:</b> {{ this.dataRelatorio }}</p>
               </b-col>
            </b-row>
         </div>
         <silo-relatorio-temperatura :buscandoTemperatura="buscandoRelatorio" :temperatura="temperatura"></silo-relatorio-temperatura>
         <div v-if="estacao?.diario?.length" style="border: 1px solid #c0c0c0 !important; border-radius: 5px" :style="quebraEstacao ? { 'page-break-before': 'always' } : {}">
            <b-row>
               <b-col>
                  <p class="mb-0 titulo text-center">Relatório da Estação</p>
               </b-col>
            </b-row>
            <hr class="m-1" />
            <b-row class="m-1 align-items-center">
               <b-col style="max-width: 150px !important; margin: 2px 0 2px 0">
                  <img src="@/assets/images/logo/pce_favicon.png" height="30" />
               </b-col>
               <b-col class="mr-2 text-center">
                  <p class="mb-0"><b class="fonte-tab">Unidade:</b> {{ equipamento?.pessoa?.natureza == 'J' ? equipamento?.pessoa?.nm_fantasia : equipamento?.pessoa?.nm_pessoa }}</p>
               </b-col>
               <b-col class="text-center">
                  <p class="mb-0"><b class="fonte-tab">Equipamento:</b> {{ equipamento?.ds_equipamento }}</p>
               </b-col>
               <b-col style="max-width: 180px !important; margin: 2px 0 2px 0">
                  <img v-if="imagem" :src="imagem" height="30" class="pull-right" />
               </b-col>
            </b-row>
            <hr class="m-1" />
            <b-row class="m-1">
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">Período:</b> {{ this.$moment(this.dataInicial).startOf('day').format('DD/MM/YYYY HH:mm') + ' - ' + (this.$moment(this.dataFinal).isSame(this.$moment(), 'day') ? this.$moment().format('DD/MM/YYYY HH:mm') : this.$moment(this.dataFinal).endOf('day').format('DD/MM/YYYY HH:mm')) }}</p>
               </b-col>
               <b-col>
                  <p class="mb-0 text-right"><b class="fonte-tab">Emissão:</b> {{ this.dataRelatorio }}</p>
               </b-col>
            </b-row>
         </div>
         <silo-relatorio-estacao ref="relatorioEstacao" :estacao="estacao" :exportar="exportar"></silo-relatorio-estacao>
         <div v-if="aeracao?.aeracao" style="border: 1px solid #c0c0c0 !important; border-radius: 5px" :style="quebraAeracao ? { 'page-break-before': 'always' } : {}">
            <b-row>
               <b-col>
                  <p class="mb-0 titulo text-center">Relatório da Aeração</p>
               </b-col>
            </b-row>
            <hr class="m-1" />
            <b-row class="m-1 align-items-center">
               <b-col style="max-width: 150px !important; margin: 2px 0 2px 0">
                  <img src="@/assets/images/logo/pce_favicon.png" height="30" />
               </b-col>
               <b-col class="mr-2 text-center">
                  <p class="mb-0"><b class="fonte-tab">Unidade:</b> {{ equipamento?.pessoa?.natureza == 'J' ? equipamento?.pessoa?.nm_fantasia : equipamento?.pessoa?.nm_pessoa }}</p>
               </b-col>
               <b-col class="text-center">
                  <p class="mb-0"><b class="fonte-tab">Equipamento:</b> {{ equipamento?.ds_equipamento }}</p>
               </b-col>
               <b-col style="max-width: 180px !important; margin: 2px 0 2px 0">
                  <img v-if="imagem" :src="imagem" height="30" class="pull-right" />
               </b-col>
            </b-row>
            <hr class="m-1" />
            <b-row class="m-1">
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">Período:</b> {{ this.$moment(this.dataInicial).startOf('day').format('DD/MM/YYYY HH:mm') + ' - ' + (this.$moment(this.dataFinal).isSame(this.$moment(), 'day') ? this.$moment().format('DD/MM/YYYY HH:mm') : this.$moment(this.dataFinal).endOf('day').format('DD/MM/YYYY HH:mm')) }}</p>
               </b-col>
               <b-col>
                  <p class="mb-0 text-right"><b class="fonte-tab">Emissão:</b> {{ this.dataRelatorio }}</p>
               </b-col>
            </b-row>
         </div>
         <silo-relatorio-aeracao ref="relatorioAeracao" :aeracao="aeracao" :exportar="exportar"></silo-relatorio-aeracao>
         <div v-if="conservacao?.dados" style="border: 1px solid #c0c0c0 !important; border-radius: 5px" :style="quebraConservacao ? { 'page-break-before': 'always' } : {}">
            <b-row>
               <b-col>
                  <p class="mb-0 titulo text-center">Relatório de Conservação</p>
               </b-col>
            </b-row>
            <hr class="m-1" />
            <b-row class="m-1 align-items-center">
               <b-col style="max-width: 150px !important; margin: 2px 0 2px 0">
                  <img src="@/assets/images/logo/pce_favicon.png" height="30" />
               </b-col>
               <b-col class="mr-2 text-center">
                  <p class="mb-0"><b class="fonte-tab">Unidade:</b> {{ equipamento?.pessoa?.natureza == 'J' ? equipamento?.pessoa?.nm_fantasia : equipamento?.pessoa?.nm_pessoa }}</p>
               </b-col>
               <b-col class="text-center">
                  <p class="mb-0"><b class="fonte-tab">Equipamento:</b> {{ equipamento?.ds_equipamento }}</p>
               </b-col>
               <b-col style="max-width: 180px !important; margin: 2px 0 2px 0">
                  <img v-if="imagem" :src="imagem" height="30" class="pull-right" />
               </b-col>
            </b-row>
            <hr class="m-1" />
            <b-row class="m-1">
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">Período:</b> {{ this.$moment(this.dataInicial).startOf('day').format('DD/MM/YYYY HH:mm') + ' - ' + (this.$moment(this.dataFinal).isSame(this.$moment(), 'day') ? this.$moment().format('DD/MM/YYYY HH:mm') : this.$moment(this.dataFinal).endOf('day').format('DD/MM/YYYY HH:mm')) }}</p>
               </b-col>
               <b-col>
                  <p class="mb-0 text-right"><b class="fonte-tab">Emissão:</b> {{ this.dataRelatorio }}</p>
               </b-col>
            </b-row>
         </div>
         <silo-relatorio-conservacao :conservacao="conservacao"></silo-relatorio-conservacao>
         <div v-if="inventario?.niv" style="border: 1px solid #c0c0c0 !important; border-radius: 5px" :style="quebraInventario ? { 'page-break-before': 'always' } : {}">
            <b-row>
               <b-col>
                  <p class="mb-0 titulo text-center">Relatório de Inventário</p>
               </b-col>
            </b-row>
            <hr class="m-1" />
            <b-row class="m-1 align-items-center">
               <b-col style="max-width: 150px !important; margin: 2px 0 2px 0">
                  <img src="@/assets/images/logo/pce_favicon.png" height="30" />
               </b-col>
               <b-col class="mr-2 text-center">
                  <p class="mb-0"><b class="fonte-tab">Unidade:</b> {{ equipamento?.pessoa?.natureza == 'J' ? equipamento?.pessoa?.nm_fantasia : equipamento?.pessoa?.nm_pessoa }}</p>
               </b-col>
               <b-col class="text-center">
                  <p class="mb-0"><b class="fonte-tab">Equipamento:</b> {{ equipamento?.ds_equipamento }}</p>
               </b-col>
               <b-col style="max-width: 180px !important; margin: 2px 0 2px 0">
                  <img v-if="imagem" :src="imagem" height="30" class="pull-right" />
               </b-col>
            </b-row>
            <hr class="m-1" />
            <b-row class="m-1">
               <b-col>
                  <p class="mb-0"><b class="fonte-tab">Período:</b> {{ this.$moment(this.dataInicial).startOf('day').format('DD/MM/YYYY HH:mm') + ' - ' + (this.$moment(this.dataFinal).isSame(this.$moment(), 'day') ? this.$moment().format('DD/MM/YYYY HH:mm') : this.$moment(this.dataFinal).endOf('day').format('DD/MM/YYYY HH:mm')) }}</p>
               </b-col>
               <b-col>
                  <p class="mb-0 text-right"><b class="fonte-tab">Emissão:</b> {{ this.dataRelatorio }}</p>
               </b-col>
            </b-row>
         </div>
         <silo-relatorio-inventario ref="relatorioInventario" :inventario="inventario" :exportar="exportar"></silo-relatorio-inventario>
      </div>
   </div>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'
import { mapState, mapActions } from 'vuex'
import SiloRelatorioTemperatura from '../components/SiloRelatorioTemperatura.vue'
import SiloRelatorioEstacao from '../components/SiloRelatorioEstacao.vue'
import SiloRelatorioAeracao from '../components/SiloRelatorioAeracao.vue'
import SiloRelatorioConservacao from '../components/SiloRelatorioConservacao.vue'
import SiloRelatorioInventario from '../components/SiloRelatorioInventario.vue'

export default {
   name: 'SiloRelatorio',
   components: {
      SiloRelatorioTemperatura,
      SiloRelatorioEstacao,
      SiloRelatorioAeracao,
      SiloRelatorioConservacao,
      SiloRelatorioInventario
   },
   data() {
      return {
         buscandoRelatorio: false,
         buscandoRelatorioEstacao: false,
         buscandoRelatorioAeracao: false,
         buscandoRelatorioConservacao: false,
         buscandoRelatorioInventario: false,
         buscandoRelatorioJanela: false,
         temperatura: [],
         estacao: [],
         aeracao: [],
         conservacao: [],
         inventario: [],
         janela: [],
         equipamento: [],
         tipoLeitura: ['1', '2'],
         exportar: false,
         buscandoSilos: true,
         silos: {},
         siloSelecionado: localStorage.getItem('sil'),
         optionsLeitura: [
            { value: '1', label: 'Fria' },
            { value: '2', label: 'Quente' },
            { value: '3', label: 'Manual' },
            { value: '4', label: 'Periódica' }
         ],

         intervaloSelecionado: 'dia',
         optionsIntervalo: [
            { value: 'dia', text: 'Dia' },
            { value: 'semana', text: 'Semana' },
            { value: 'mes', text: 'Mês' },
            { value: 'trimestre', text: 'Trimestre' },
            { value: 'semestre', text: 'Semestre' }
            // { value: 'ano', text: 'Ano' },
            // { value: 'outro', text: 'Período Personalizado' }
         ],
         relatorioSelecionado: ['padrao'],
         optionsRelatorio: [
            { value: 'padrao', label: 'Relatório padrão' },
            { value: 'temperatura', label: 'Relatório de temperaturas' },
            { value: 'estacao', label: 'Relatório da estação' },
            { value: 'aeracao', label: 'Relatório de aeração' },
            { value: 'conservacao', label: 'Relatório de conservação' },
            { value: 'inventario', label: 'Relatório de inventário' }
         ],
         dataUnica: null,
         dataInicial: null,
         dataFinal: null,
         imagem: null,
         buscandoImagem: false,
         dataRelatorio: null
      }
   },

   computed: {
      ...mapState('unidade', ['unidade', 'nomeUnidade']),
      dataUnicaSelecionada() {
         return ['dia', 'semana', 'mes', 'trimestre', 'semestre', 'ano'].includes(this.intervaloSelecionado)
      },
      periodoCalculado() {
         if (this.dataInicial && this.dataFinal) {
            return `${this.$moment(this.dataInicial).format('DD/MM/YYYY')} - ${this.$moment(this.dataFinal).format('DD/MM/YYYY')}`
         }
         return 'Selecione uma data válida.'
      },
      optionsSilos() {
         return this.silos?.estrutura_equipamentos?.map((estrutura) => ({
            value: estrutura.id_equipamento,
            text: estrutura.ds_equipamento
         }))
      },
      quebraEstacao() {
         return this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('temperatura')
      },
      quebraAeracao() {
         return this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('temperatura') || this.relatorioSelecionado.includes('estacao')
      },
      quebraConservacao() {
         return this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('temperatura') || this.relatorioSelecionado.includes('estacao') || this.relatorioSelecionado.includes('aeracao')
      },
      quebraInventario() {
         return this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('temperatura') || this.relatorioSelecionado.includes('estacao') || this.relatorioSelecionado.includes('aeracao') || this.relatorioSelecionado.includes('conservacao')
      }
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade']),
      acionarBusca() {
         this.temperatura = []
         this.estacao = []
         this.aeracao = []
         this.conservacao = []
         this.inventario = []
         this.dataRelatorio = this.$moment().format('DD/MM/YYYY HH:mm')
         localStorage.setItem('relatorio', this.relatorioSelecionado)
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('temperatura')) {
            this.buscarRelatorioTemperatura()
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('estacao')) {
            this.buscarRelatorioEstacao()
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('aeracao')) {
            this.buscarRelatorioAeracao()
            // this.buscarRelatorioJanela()
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('conservacao')) {
            this.buscarRelatorioConservacao()
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('inventario')) {
            this.buscarRelatorioInventario()
         }
      },
      async generatePDF() {
         const captureChartImage = (chartRef) => {
            const chartInstance = echarts.getInstanceByDom(chartRef)
            return chartInstance.getDataURL({
               type: 'png',
               pixelRatio: 2,
               backgroundColor: '#fff'
            })
         }
         const createImage = (src) => {
            return new Promise((resolve) => {
               const img = new Image()
               img.onload = () => resolve(img)
               img.src = src
               img.style.width = '99%'
               img.style.height = 'auto'
            })
         }
         let imgTemp, imgPres, imgPluv, imgAera, imgInve
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('estacao')) {
            const graficoTemperatura = this.$refs.relatorioEstacao.$refs.chartTemperatura
            const graficoPressao = this.$refs.relatorioEstacao.$refs.chartPressao
            const graficoPluviometro = this.$refs.relatorioEstacao.$refs.chartPluviometro
            const imagemTemp = captureChartImage(graficoTemperatura)
            const imagemPres = captureChartImage(graficoPressao)
            const imagemPluv = captureChartImage(graficoPluviometro)
            imgTemp = await createImage(imagemTemp)
            imgPres = await createImage(imagemPres)
            imgPluv = await createImage(imagemPluv)
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('aeracao')) {
            const graficoAeracao = this.$refs.relatorioAeracao.$refs.chartAeracao
            const imagemAera = captureChartImage(graficoAeracao)
            imgAera = await createImage(imagemAera)
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('inventario')) {
            const graficoInventario = this.$refs.relatorioInventario.$refs.chartInventario
            const imagemInve = captureChartImage(graficoInventario)
            imgInve = await createImage(imagemInve)
         }
         const printContent = this.$refs.contentToPrint.cloneNode(true)
         const replaceChartWithImage = (selector, img) => {
            const chartElement = printContent.querySelector(selector)
            if (chartElement) {
               chartElement.innerHTML = ''
               chartElement.appendChild(img)
            }
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('estacao')) {
            replaceChartWithImage('.chartTemperatura', imgTemp)
            replaceChartWithImage('.chartPressao', imgPres)
            replaceChartWithImage('.chartPluviometro', imgPluv)
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('aeracao')) {
            replaceChartWithImage('.chartAeracao', imgAera)
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('inventario')) {
            replaceChartWithImage('.chartInventario', imgInve)
         }
         const originalContent = document.body.innerHTML
         document.body.innerHTML = ''
         document.body.appendChild(printContent)
         window.print()
         document.body.innerHTML = originalContent
         window.location.reload()
      },

      atualizarData() {
         if (this.intervaloSelecionado === 'custom') {
            return
         }
         const baseDate = this.$moment(this.dataUnica)
         const today = this.$moment()
         switch (this.intervaloSelecionado) {
            case 'dia':
               this.dataInicial = baseDate.clone().startOf('day').format('YYYY-MM-DD')
               this.dataFinal = baseDate.clone().endOf('day').format('YYYY-MM-DD')
               break
            case 'semana':
               this.dataInicial = baseDate.clone().startOf('week').format('YYYY-MM-DD')
               this.dataFinal = baseDate.clone().endOf('week').format('YYYY-MM-DD')
               break
            case 'mes':
               this.dataInicial = baseDate.clone().startOf('month').format('YYYY-MM-DD')
               this.dataFinal = baseDate.clone().endOf('month').format('YYYY-MM-DD')
               break
            case 'trimestre':
               // this.dataInicial = today.clone().subtract(6, 'months').format('YYYY-MM-DD')
               // this.dataFinal = today.clone().format('YYYY-MM-DD')
               this.dataInicial = baseDate.clone().subtract(3, 'months').format('YYYY-MM-DD')
               this.dataFinal = baseDate.clone().format('YYYY-MM-DD')
               break
            case 'semestre':
               // this.dataInicial = today.clone().subtract(6, 'months').format('YYYY-MM-DD')
               // this.dataFinal = today.clone().format('YYYY-MM-DD')
               this.dataInicial = baseDate.clone().subtract(6, 'months').format('YYYY-MM-DD')
               this.dataFinal = baseDate.clone().format('YYYY-MM-DD')
               break
            case 'ano':
               this.dataInicial = today.clone().subtract(12, 'months').format('YYYY-MM-DD')
               this.dataFinal = today.clone().format('YYYY-MM-DD')
               break
         }
      },
      valorSelecionado() {
         const isPadraoSelected = this.relatorioSelecionado.includes('padrao')
         if (isPadraoSelected) {
            this.relatorioSelecionado = this.relatorioSelecionado.filter((option) => option == 'padrao')
         } else {
            this.relatorioSelecionado = this.relatorioSelecionado.filter((option) => option != 'padrao')
         }
      },
      async buscarSilos() {
         if (this.unidade == null || this.unidade === undefined || this.unidade == '') {
            return
         }
         this.buscandoSilos = true
         const dados = await client.get(`/silo/buscarsilos/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar silos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoSilos = false
         })
         this.buscandoSilos = false
         if (dados && dados.data) {
            this.silos = dados.data
         }
      },
      async buscarRelatorioTemperatura() {
         if (!this.siloSelecionado) {
            return
         }
         this.temperatura = []
         this.buscandoRelatorio = true

         const dados = await client.get(`/silo/buscarrelatoriotemperatura/${this.siloSelecionado}?inicio=${this.dataInicial}&fim=${this.dataFinal}&tipo=[${this.tipoLeitura}]`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados de temperaturas. ${err}`, {
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
            this.temperatura = dados.data
         }
      },
      async buscarRelatorioEstacao() {
         if (!this.siloSelecionado) {
            return
         }
         this.estacao = []
         this.buscandoRelatorioEstacao = true

         const dados = await client.get(`/silo/buscarrelatorioestacao/${this.siloSelecionado}?inicio=${this.dataInicial}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados da estação. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorioEstacao = false
         })
         this.buscandoRelatorioEstacao = false
         if (dados && dados.data) {
            this.estacao = dados.data
         }
      },
      async buscarRelatorioAeracao() {
         if (!this.siloSelecionado) {
            return
         }
         this.aeracao = []
         this.buscandoRelatorioAeracao = true

         const dados = await client.get(`/silo/buscarrelatorioaeracao/${this.siloSelecionado}?inicio=${this.dataInicial}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados da aeração. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorioAeracao = false
         })
         this.buscandoRelatorioAeracao = false
         if (dados && dados.data) {
            this.aeracao = dados.data
         }
      },
      async buscarRelatorioConservacao() {
         if (!this.siloSelecionado) {
            return
         }
         this.conservacao = []
         this.buscandoRelatorioConservacao = true

         const dados = await client.get(`/silo/buscarrelatorioconservacao/${this.siloSelecionado}?inicio=${this.dataInicial}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados de conservação. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorioConservacao = false
         })
         this.buscandoRelatorioConservacao = false
         if (dados && dados.data) {
            this.conservacao = dados.data
         }
      },
      async buscarRelatorioInventario() {
         if (!this.siloSelecionado) {
            return
         }
         this.inventario = []
         this.buscandoRelatorioInventario = true

         const dados = await client.get(`/silo/buscarinventario/${this.siloSelecionado}?inicio=${this.dataInicial}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados de inventário. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorioInventario = false
         })
         this.buscandoRelatorioInventario = false
         if (dados && dados.data) {
            this.inventario = dados.data
         }
      },
      async buscarRelatorioJanela() {
         if (!this.siloSelecionado) {
            return
         }
         this.janela = []
         this.buscandoRelatorioJanela = true

         const dados = await client.get(`/silo/buscarrelatoriojanela/${this.siloSelecionado}?inicio=${this.dataInicial}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados da janela de aeração. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorioJanela = false
         })
         this.buscandoRelatorioJanela = false
         if (dados && dados.data) {
            this.janela = dados.data
         }
      },
      async buscarEquipamento() {
         if (!this.siloSelecionado) {
            return
         }
         const dados = await client.get(`/equipamento/${this.siloSelecionado}`).catch((err) => {
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
            if (this.equipamento?.pessoa?.logo) {
               this.buscarImagem(this.equipamento.pessoa.logo)
            }
         }
      },
      async buscarImagem(imagem) {
         if (!imagem) {
            return
         }
         this.buscandoImagem = true
         const dados = await client.get(`/imagem?caminho=${imagem}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar a imagem. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
         })
         if (dados && dados.data) {
            this.imagem = dados.data
         }
         this.buscandoImagem = false
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
      this.relatorioSelecionado = localStorage
         .getItem('relatorio')
         ?.split(',')
         .map((item) => item.trim()) || ['padrao']
      this.buscarEquipamento()
      this.buscarSilos()
   },

   watch: {
      intervaloSelecionado() {
         if (this.dataUnica) {
            this.atualizarData()
         }
      },
      dataUnica() {
         this.atualizarData()
      },
      siloSelecionado() {
         this.buscarEquipamento()
      }
   }
}
</script>

<style scoped>
@page {
   size: landscape;
}

.fonte-tab {
   font-weight: 500;
}

.titulo {
   font-size: 16px;
   font-weight: 600;
}

.largura {
   width: 500px !important;
}
</style>