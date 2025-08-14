<template>
   <div class="white_shd full margin_bottom_30">
      <div class="full graph_head">
         <div class="heading1 margin_0">
            <b-row>
               <b-col cols="10">
                  <h2>Relatório</h2>
               </b-col>
            </b-row>
         </div>
      </div>
      <div class="map_section padding_infor_info">
         <b-row>
            <b-col sm="12" md="6" lg="3">
               <b-form-group label="Selecione o Tipo do Relatório">
                  <v-select multiple v-model="relatorioSelecionado" :options="optionsRelatorio" :reduce="(relatorio) => relatorio.value" @input="valorSelecionado()">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3">
               <b-form-group label="Selecione o Tipo de Intervalo">
                  <b-form-select v-model="intervaloSelecionado" :options="optionsIntervalo"></b-form-select>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="!dataUnicaSelecionada">
               <b-form-group :label="dataUnicaSelecionada ? 'Data' : 'Data Inicial'">
                  <b-form-datepicker v-model="dataInicial" :date-info-fn="marcaDatasSecagem" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="!dataUnicaSelecionada">
               <b-form-group label="Data Final">
                  <b-form-datepicker v-model="dataFinal" :date-info-fn="marcaDatasSecagem" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3" v-if="dataUnicaSelecionada && intervaloSelecionado != 'semester' && intervaloSelecionado != 'year'">
               <b-form-group label="Selecione a Data">
                  <b-form-datepicker v-model="dataUnica" :date-info-fn="marcaDatasSecagem" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-form-group>
            </b-col>
            <b-col sm="12" md="6" lg="3">
               <b-form-group label="Fundo do Gráfico">
                  <b-form-select v-model="fundoGrafico" :options="optionsGrafico"></b-form-select>
               </b-form-group>
            </b-col>
         </b-row>
         <b-row>
            <b-col cols="6" sm="3" md="3" lg="1">
               <b-button variant="outline-primary" class="mt-sm-0" @click="acionarBusca()" :disabled="buscandoRelatorioTemperatura || buscandoRelatorioPressao || buscandoRelatorioSecagem || buscandoRelatorioAcionamento || buscandoRelatorioEvento || !dataInicial">
                  <span v-if="!buscandoRelatorioTemperatura && !buscandoRelatorioPressao && !buscandoRelatorioSecagem && !buscandoRelatorioAcionamento && !buscandoRelatorioEvento">Buscar</span>
                  <div v-else class="text-nowrap">
                     <b-spinner small></b-spinner>
                     <span class="ml-1">Buscar...</span>
                  </div>
               </b-button>
            </b-col>
            <b-col cols="6" sm="3" md="3" lg="1">
               <b-button variant="outline-primary" class="mt-sm-0" @click="generatePDF()" :disabled="(!temperatura?.t1?.length && !pressao?.p1?.length && !secagem?.di?.length && !acionamento?.descarga?.length && !evento?.dados) || buscandoRelatorioTemperatura || buscandoRelatorioPressao || buscandoRelatorioSecagem || buscandoRelatorioAcionamento || buscandoRelatorioEvento">
                  <span>Exportar</span>
               </b-button>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <p class="mt-2"><strong>Intervalo Selecionado:</strong> {{ periodoCalculado }}</p>
            </b-col>
         </b-row>
         <hr />
         <div ref="contentToPrint" id="content-to-export" style="min-height: 30vh; page-break-inside: avoid">
            <div v-if="temperatura?.t1?.length" style="border: 1px solid #c0c0c0 !important; border-radius: 5px">
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
            <secador-relatorio-temperatura ref="relatorioTemperatura" :temperatura="temperatura" :fundoGrafico="fundoGrafico"></secador-relatorio-temperatura>
            <div v-if="pressao?.p1?.length" style="border: 1px solid #c0c0c0 !important; border-radius: 5px" :style="quebraPressao ? { 'page-break-before': 'always' } : {}">
               <b-row>
                  <b-col>
                     <p class="mb-0 titulo text-center">Relatório de Depressões</p>
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
            <secador-relatorio-pressao ref="relatorioPressao" :pressao="pressao" :fundoGrafico="fundoGrafico"></secador-relatorio-pressao>
            <div v-if="secagem?.di?.length" style="border: 1px solid #c0c0c0 !important; border-radius: 5px" :style="quebraPressao ? { 'page-break-before': 'always' } : {}">
               <b-row>
                  <b-col>
                     <p class="mb-0 titulo text-center">Relatório de Secagem</p>
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
            <secador-relatorio-secagem ref="relatorioSecagem" :secagem="secagem" :fundoGrafico="fundoGrafico"></secador-relatorio-secagem>
            <div v-if="acionamento?.descarga?.length" style="border: 1px solid #c0c0c0 !important; border-radius: 5px" :style="quebraPressao ? { 'page-break-before': 'always' } : {}">
               <b-row>
                  <b-col>
                     <p class="mb-0 titulo text-center">Relatório de Acionamentos</p>
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
            <secador-relatorio-acionamento ref="relatorioAcionamento" :acionamento="acionamento" :fundoGrafico="fundoGrafico" :chavesAcionamentos="chavesAcionamentos"></secador-relatorio-acionamento>
            <div v-if="evento?.dados" style="border: 1px solid #c0c0c0 !important; border-radius: 5px" :style="quebraPressao ? { 'page-break-before': 'always' } : {}">
               <b-row>
                  <b-col>
                     <p class="mb-0 titulo text-center">Relatório de Eventos</p>
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
            <secador-relatorio-evento :evento="evento"></secador-relatorio-evento>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'
import * as echarts from 'echarts'
import SecadorRelatorioTemperatura from '../components/SecadorRelatorioTemperatura.vue'
import SecadorRelatorioPressao from '../components/SecadorRelatorioPressao.vue'
import SecadorRelatorioSecagem from '../components/SecadorRelatorioSecagem.vue'
import SecadorRelatorioAcionamento from '../components/SecadorRelatorioAcionamento.vue'
import SecadorRelatorioEvento from '../components/SecadorRelatorioEvento.vue'

export default {
   name: 'SecadorRelatorio',
   components: {
      SecadorRelatorioTemperatura,
      SecadorRelatorioPressao,
      SecadorRelatorioSecagem,
      SecadorRelatorioAcionamento,
      SecadorRelatorioEvento
   },
   data() {
      return {
         buscandoRelatorioTemperatura: false,
         buscandoRelatorioPressao: false,
         buscandoRelatorioSecagem: false,
         buscandoRelatorioAcionamento: false,
         buscandoRelatorioEvento: false,
         temperatura: {},
         pressao: {},
         secagem: {},
         acionamento: {},
         equipamento: [],
         evento: [],
         intervaloSelecionado: 'dia',
         optionsIntervalo: [
            { value: 'dia', text: 'Dia' },
            { value: 'semana', text: 'Semana' },
            { value: 'mes', text: 'Mês' },
            { value: 'trimestre', text: 'Trimestre' },
            { value: 'semestre', text: 'Semestre' }
         ],
         relatorioSelecionado: ['padrao'],
         optionsRelatorio: [
            { value: 'padrao', label: 'Relatório padrão' },
            { value: 'temperatura', label: 'Relatório de temperaturas' },
            { value: 'pressao', label: 'Relatório de depressões' },
            { value: 'secagem', label: 'Relatório de secagem' },
            { value: 'acionamento', label: 'Relatório de acionamentos' },
            { value: 'evento', label: 'Relatório de eventos' }
         ],
         optionsGrafico: [
            { value: 'nenhum', text: 'Nenhum' },
            { value: 'fluxo', text: 'Fluxo' },
            { value: 'operacao', text: 'Operação' }
         ],
         dataUnica: null,
         dataInicial: null,
         dataFinal: null,
         imagem: null,
         buscandoImagem: false,
         dataRelatorio: null,
         datas: [],
         fundoGrafico: 'nenhum',
         chavesAcionamentos: []
      }
   },

   computed: {
      dataUnicaSelecionada() {
         return ['dia', 'semana', 'mes', 'trimestre', 'semestre', 'ano'].includes(this.intervaloSelecionado)
      },
      periodoCalculado() {
         if (this.dataInicial && this.dataFinal) {
            return `${this.$moment(this.dataInicial).format('DD/MM/YYYY')} - ${this.$moment(this.dataFinal).format('DD/MM/YYYY')}`
         }
         return 'Selecione uma data válida.'
      },
      chavesTemperatura() {
         return Object.keys(this.temperatura)
            .filter((chave) => chave.startsWith('t') && !chave.startsWith('ta') && !chave.startsWith('tb') && !chave.startsWith('to'))
            .map((chave) => 's' + chave.slice(1))
            .sort((a, b) => {
               const numA = parseInt(a.slice(1))
               const numB = parseInt(b.slice(1))
               return numA - numB
            })
      },
      quebraPressao() {
         return this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('temperatura')
      }
   },

   methods: {
      marcaDatasSecagem(data) {
         const datasOperacao = this.datas?.datasOperacao?.includes(data)
         const datasSecagem = this.datas?.datasSecagem?.includes(data)

         if (datasSecagem) return 'table-success'
         if (datasOperacao) return 'table-primary'
         return ''
      },
      acionarBusca() {
         this.temperatura = []
         this.dataRelatorio = this.$moment().format('DD/MM/YYYY HH:mm')
         localStorage.setItem('relatorioSec', this.relatorioSelecionado)
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('temperatura')) {
            this.buscarRelatorioTemperatura()
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('pressao')) {
            this.buscarRelatorioPressao()
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('secagem')) {
            this.buscarRelatorioSecagem()
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('acionamento')) {
            this.buscarRelatorioAcionamento()
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('evento')) {
            this.buscarRelatorioEvento()
         }
      },
      async generatePDF() {
         const captureChartImage = (chartRef) => {
            if (!chartRef) return null
            const chartInstance = echarts.getInstanceByDom(chartRef)
            if (!chartInstance) return null
            return chartInstance.getDataURL({
               type: 'png',
               pixelRatio: 2,
               backgroundColor: '#fff'
            })
         }
         const createImage = (src) => {
            return new Promise((resolve) => {
               if (!src) {
                  return resolve(null)
               }
               const img = new Image()
               img.onload = () => resolve(img)
               img.src = src
               img.style.width = '99%'
               img.style.height = 'auto'
            })
         }
         let imgTemp, imgTempS1, imgTempS1_1, imgTempS2, imgTempS2_1, imgTempS3, imgTempS3_1, imgPres, imgPresP1, imgPresP2, imgPresP3, imgPresP4, imgPresP5, imgUmid, imgProd, imgAcio
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('temperatura')) {
            const graficoTemperatura = this.$refs.relatorioTemperatura.$refs.chartTemperatura
            const graficoTemperaturaS1 = this.$refs.relatorioTemperatura.$refs.chartTemperaturaS1
            const graficoTemperaturaS1_1 = this.$refs.relatorioTemperatura.$refs['chartTemperaturaS1.1']
            const graficoTemperaturaS2 = this.$refs.relatorioTemperatura.$refs.chartTemperaturaS2
            const graficoTemperaturaS2_1 = this.$refs.relatorioTemperatura.$refs['chartTemperaturaS2.1']
            const graficoTemperaturaS3 = this.$refs.relatorioTemperatura.$refs.chartTemperaturaS3
            const graficoTemperaturaS3_1 = this.$refs.relatorioTemperatura.$refs['chartTemperaturaS3.1']

            const imagemTemp = captureChartImage(graficoTemperatura)
            const imagemTempS1 = captureChartImage(graficoTemperaturaS1)
            const imagemTempS2 = captureChartImage(graficoTemperaturaS2)
            const imagemTempS3 = captureChartImage(graficoTemperaturaS3)

            imgTemp = await createImage(imagemTemp)
            imgTempS1 = await createImage(imagemTempS1)
            imgTempS2 = await createImage(imagemTempS2)
            imgTempS3 = await createImage(imagemTempS3)

            if (this.chavesTemperatura.includes('s1.1')) {
               const imagemTempS1_1 = captureChartImage(graficoTemperaturaS1_1)
               imgTempS1_1 = await createImage(imagemTempS1_1)
            }
            if (this.chavesTemperatura.includes('s2.1')) {
               const imagemTempS2_1 = captureChartImage(graficoTemperaturaS2_1)
               imgTempS2_1 = await createImage(imagemTempS2_1)
            }
            if (this.chavesTemperatura.includes('s3.1')) {
               const imagemTempS3_1 = captureChartImage(graficoTemperaturaS3_1)
               imgTempS3_1 = await createImage(imagemTempS3_1)
            }
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('pressao')) {
            const graficoPressao = this.$refs.relatorioPressao.$refs.chartPressao
            const graficoPressaoP1 = this.$refs.relatorioPressao.$refs.chartPressaoP1
            const graficoPressaoP2 = this.$refs.relatorioPressao.$refs.chartPressaoP2
            const graficoPressaoP3 = this.$refs.relatorioPressao.$refs.chartPressaoP3
            const graficoPressaoP4 = this.$refs.relatorioPressao.$refs.chartPressaoP4
            const graficoPressaoP5 = this.$refs.relatorioPressao.$refs.chartPressaoP5
            const imagemPres = captureChartImage(graficoPressao)
            const imagemPresP1 = captureChartImage(graficoPressaoP1)
            const imagemPresP2 = captureChartImage(graficoPressaoP2)
            const imagemPresP3 = captureChartImage(graficoPressaoP3)
            const imagemPresP4 = captureChartImage(graficoPressaoP4)
            const imagemPresP5 = captureChartImage(graficoPressaoP5)
            imgPres = await createImage(imagemPres)
            imgPresP1 = await createImage(imagemPresP1)
            imgPresP2 = await createImage(imagemPresP2)
            imgPresP3 = await createImage(imagemPresP3)
            imgPresP4 = await createImage(imagemPresP4)
            imgPresP5 = await createImage(imagemPresP5)
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('secagem')) {
            const graficoUmidade = this.$refs.relatorioSecagem.$refs.chartUmidade
            const graficoProducao = this.$refs.relatorioSecagem.$refs.chartProducao
            const imagemUmid = captureChartImage(graficoUmidade)
            const imagemProd = captureChartImage(graficoProducao)
            imgUmid = await createImage(imagemUmid)
            imgProd = await createImage(imagemProd)
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('acionamento')) {
            const graficoAcionamento = this.$refs.relatorioAcionamento.$refs.chartAcionamento
            const imagemAcio = captureChartImage(graficoAcionamento)
            imgAcio = await createImage(imagemAcio)
         }

         const printContent = this.$refs.contentToPrint.cloneNode(true)
         const replaceChartWithImage = (selector, img) => {
            if (!img) {
               return
            }
            const chartElement = printContent.querySelector(selector)
            if (chartElement) {
               chartElement.innerHTML = ''
               chartElement.appendChild(img)
            }
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('temperatura')) {
            replaceChartWithImage('.chartTemperatura', imgTemp)
            replaceChartWithImage('.chartTemperaturaS1', imgTempS1)
            replaceChartWithImage('.chartTemperaturaS2', imgTempS2)
            replaceChartWithImage('.chartTemperaturaS3', imgTempS3)

            if (this.chavesTemperatura.includes('s1.1')) {
               replaceChartWithImage('.chartTemperaturaS1_1', imgTempS1_1)
            }
            if (this.chavesTemperatura.includes('s2.1')) {
               replaceChartWithImage('.chartTemperaturaS2_1', imgTempS2_1)
            }
            if (this.chavesTemperatura.includes('s3.1')) {
               replaceChartWithImage('.chartTemperaturaS3_1', imgTempS3_1)
            }
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('pressao')) {
            replaceChartWithImage('.chartPressao', imgPres)
            replaceChartWithImage('.chartPressaoP1', imgPresP1)
            replaceChartWithImage('.chartPressaoP2', imgPresP2)
            replaceChartWithImage('.chartPressaoP3', imgPresP3)
            replaceChartWithImage('.chartPressaoP4', imgPresP4)
            replaceChartWithImage('.chartPressaoP5', imgPresP5)
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('secagem')) {
            replaceChartWithImage('.chartUmidade', imgUmid)
            replaceChartWithImage('.chartProducao', imgProd)
         }
         if (this.relatorioSelecionado.includes('padrao') || this.relatorioSelecionado.includes('acionamento')) {
            replaceChartWithImage('.chartAcionamento', imgAcio)
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
               this.dataInicial = baseDate.clone().subtract(3, 'months').format('YYYY-MM-DD')
               this.dataFinal = baseDate.clone().format('YYYY-MM-DD')
               break
            case 'semestre':
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
      async buscarRelatorioTemperatura() {
         if (!this.idSecador) {
            return
         }
         this.buscandoRelatorioTemperatura = true
         const dados = await client.get(`/secador/buscartemperatura/${this.idSecador}?inicio=${this.dataInicial}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar temperaturas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorioTemperatura = false
         })
         this.buscandoRelatorioTemperatura = false
         if (dados && dados.data) {
            this.temperatura = dados.data
            const converteTemperatura = {
               t4: 't1.1',
               to4: 'to1.1',
               ta4: 'ta1.1',
               tb4: 'tb1.1',
               t5: 't2.1',
               to5: 'to2.1',
               ta5: 'ta2.1',
               tb5: 'tb2.1',
               t6: 't3.1',
               to6: 'to3.1',
               ta6: 'ta3.1',
               tb6: 'tb3.1'
            }
            for (let key in converteTemperatura) {
               if (Object.prototype.hasOwnProperty.call(this.temperatura, key)) {
                  this.temperatura[converteTemperatura[key]] = this.temperatura[key]
                  delete this.temperatura[key]
               }
            }
         }
      },
      async buscarRelatorioPressao() {
         if (!this.idSecador) {
            return
         }
         this.buscandoRelatorioPressao = true
         const dados = await client.get(`/secador/buscarpressao/${this.idSecador}?inicio=${this.dataInicial}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar pressões. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorioPressao = false
         })
         this.buscandoRelatorioPressao = false
         if (dados && dados.data) {
            this.pressao = dados.data
         }
      },
      async buscarRelatorioSecagem() {
         if (!this.idSecador) {
            return
         }
         this.buscandoRelatorioSecagem = true
         const dados = await client.get(`/secador/buscarumidade/${this.idSecador}?inicio=${this.dataInicial}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar secagem. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorioSecagem = false
         })
         this.buscandoRelatorioSecagem = false
         if (dados && dados.data) {
            this.secagem = dados.data
         }
      },
      async buscarRelatorioAcionamento() {
         if (!this.idSecador) {
            return
         }
         this.buscandoRelatorioAcionamento = true
         const dados = await client.get(`/secador/buscaracionamento/${this.idSecador}?inicio=${this.dataInicial}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar acionamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorioAcionamento = false
         })
         this.buscandoRelatorioAcionamento = false
         if (dados && dados.data) {
            this.acionamento = dados.data
            const converteChave = {
               minimo1: 'Nível mínimo 1',
               minimo2: 'Nível mínimo 2',
               minimo3: 'Nível mínimo 3',
               minimo4: 'Nível mínimo 4',
               maximo1: 'Nível máximo 1',
               maximo2: 'Nível máximo 2',
               maximo3: 'Nível máximo 3',
               maximo4: 'Nível máximo 4'
            }
            for (let key in converteChave) {
               if (Object.prototype.hasOwnProperty.call(this.acionamento, key)) {
                  this.chavesAcionamentos.push(converteChave[key])
                  this.acionamento[converteChave[key]] = this.acionamento[key]
                  delete this.acionamento[key]
               }
            }
         }
      },
      async buscarRelatorioEvento() {
         if (!this.idSecador) {
            return
         }
         this.buscandoRelatorioEvento = true
         const dados = await client.get(`/secador/buscarrelatorioalarme/${this.idSecador}?inicio=${this.dataInicial}&fim=${this.dataFinal}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar eventos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorioEvento = false
         })
         this.buscandoRelatorioEvento = false
         if (dados && dados.data) {
            this.evento = dados.data
         }
      },
      async buscarEquipamento() {
         if (!this.idSecador) {
            return
         }
         const dados = await client.get(`/equipamento/${this.idSecador}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar secador. ${err}`, {
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
      async buscarDatasSecagem() {
         if (!this.idSecador) {
            return
         }
         const dados = await client.get(`/secador/buscardatassecagem/${this.idSecador}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar datas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
         })
         if (dados && dados.data) {
            this.datas = dados.data
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
      this.idSecador = localStorage.getItem('sec')

      this.relatorioSelecionado = localStorage
         .getItem('relatorioSec')
         ?.split(',')
         .map((item) => item.trim()) || ['padrao']
      this.buscarEquipamento()
      this.buscarDatasSecagem()
   },

   watch: {
      intervaloSelecionado() {
         if (this.dataUnica) {
            this.atualizarData()
         }
      },
      dataUnica() {
         this.atualizarData()
      }
   }
}
</script>

<style scoped>
@page {
   size: landscape;
}

.titulo {
   font-size: 16px;
   font-weight: 600;
}
</style>