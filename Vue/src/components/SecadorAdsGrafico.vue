<template>
   <div ref="chartContainer">
      <b-overlay :show="buscandoTemperaturas || buscandoPressoes || buscandoUmidades || buscandoRendimento || buscandoParametros || buscandoAcionamentos" rounded="sm" class="overlay">
         <b-row v-if="filtroGrafico != 'parametros'" class="mb-3 align-items-end">
            <b-col lg="5">
               <label class="" for="inline-form-input-name">Data inicial</label>
               <b-form-datepicker v-model="dataInicio" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-col>
            <b-col lg="5">
               <label class="" for="inline-form-input-name">Data final</label>
               <b-form-datepicker v-model="dataFim" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
            </b-col>
            <b-col lg="2">
               <b-button variant="outline-primary" class="mt-2" @click="acionaBusca(filtroGrafico)" :disabled="buscandoTemperaturas || buscandoPressoes || buscandoUmidades || buscandoRendimento || buscandoParametros || buscandoAcionamentos">
                  <span v-if="!buscandoTemperaturas && !buscandoPressoes && !buscandoUmidades && !buscandoRendimento && !buscandoParametros && !buscandoAcionamentos">Filtrar</span>
                  <div v-else>
                     <b-spinner small></b-spinner>
                     <span class="ml-1">Filtrar...</span>
                  </div>
               </b-button>
            </b-col>
         </b-row>
         <b-overlay :show="this.verificarObjetoVazio() && filtroGrafico != 'parametros'" opacity="0">
            <template #overlay>
               <div class="text-center text-nowrap">
                  <p>Sem dados no período</p>
               </div>
            </template>
            <b-row v-if="filtroGrafico == 'temperaturas' || filtroGrafico == 'pressões' || filtroGrafico == 'umidades' || filtroGrafico == 'rendimento'">
               <b-col>
                  <label>Últimos valores (clique para detalhes)</label>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico == 'temperaturas'" class="justify-content-center d-flex overflow-auto">
               <b-col cols="12">
                  <b-list-group horizontal>
                     <b-list-group-item v-for="chave in chavesTemperatura.filter((c) => !/[a-zA-Z]$/.test(c))" :key="chave" @click="graficoVariavel((variavel = chave), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">{{ chave.toUpperCase() }}</b-badge>
                        <small class="valor">{{ temperaturas[chave][temperaturas[chave].length - 1]?.[1] }}</small
                        ><small class="ml-1">°C</small>
                     </b-list-group-item>
                  </b-list-group>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico == 'pressões'" class="justify-content-center d-flex overflow-auto">
               <b-col cols="12">
                  <b-list-group horizontal>
                     <b-list-group-item v-for="chave in chavesPressao" :key="chave" @click="graficoVariavel((variavel = chave), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">{{ chave.toUpperCase() }}</b-badge>
                        <small class="valor">{{ pressoes[chave.replace(/s/g, 'p')][pressoes[chave.replace(/s/g, 'p')].length - 1]?.[1] }}</small
                        ><small class="ml-1">mmCa</small>
                     </b-list-group-item>
                  </b-list-group>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico == 'umidades'" class="justify-content-center d-flex overflow-auto">
               <b-col cols="12">
                  <b-list-group horizontal>
                     <b-list-group-item @click="graficoVariavel((variavel = 'ue'), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">UE</b-badge>
                        <small class="valor">{{ umidades['ue']?.[umidades['ue'].length - 1]?.[1] }}</small>
                        <small class="ml-1">%</small>
                     </b-list-group-item>
                     <b-list-group-item @click="graficoVariavel((variavel = 'us'), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">US</b-badge>
                        <small class="valor">{{ umidades['us']?.[umidades['us'].length - 1]?.[1] }}</small>
                        <small class="ml-1">%</small>
                     </b-list-group-item>
                  </b-list-group>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico == 'rendimento'" class="justify-content-center d-flex overflow-auto">
               <b-col cols="12">
                  <b-list-group horizontal>
                     <b-list-group-item @click="graficoVariavel((variavel = 'cis'), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">CI</b-badge>
                        <small class="valor">{{ rendimento['cis']?.[rendimento['cis'].length - 1]?.[1] }}</small>
                        <small class="ml-1">ton/h</small>
                     </b-list-group-item>
                     <b-list-group-item @click="graficoVariavel((variavel = 'cca'), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">CC</b-badge>
                        <small class="valor">{{ rendimento['cca']?.[rendimento['cca'].length - 1]?.[1] }}</small>
                        <small class="ml-1">ton/h</small>
                     </b-list-group-item>
                  </b-list-group>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico != 'parametros'">
               <b-col class="mt-2">
                  <small>Ferramentas do gráfico</small>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico != 'parametros'">
               <b-col class="pb-0">
                  <b-button variant="outline-primary" class="p-1 mr-1" @click="maiorValor()" v-b-tooltip.hover title="Valor máximo"><b-icon-chevron-up></b-icon-chevron-up></b-button>
                  <b-button variant="outline-primary" class="p-1 mr-1" @click="menorValor()" v-b-tooltip.hover title="Valor mínimo"><b-icon-chevron-down></b-icon-chevron-down></b-button>
                  <b-button variant="outline-primary" class="p-1" @click="limpar()" v-if="!!variavel" v-b-tooltip.hover title="Resetar"><b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise></b-button>
               </b-col>
            </b-row>

            <div ref="chart" v-show="this.filtroGrafico != 'parametros'" style="width: 100%; height: 71vh"></div>

            <b-row v-if="variavel">
               <b-col lg="4">
                  <b-form-select v-model="modo" :options="options" @change="graficoVariavel(variavel, modo)" class="mt-1"></b-form-select>
               </b-col>
            </b-row>
            <b-row v-if="variavel || filtroGrafico == 'acionamentos'">
               <b-col v-if="modo == 'fluxo' && filtroGrafico != 'acionamentos'" class="d-flex align-items-center mt-2">
                  <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(42, 154, 57, 0.4)">&nbsp;</b-badge>
                  <p class="m-0">Contínuo</p>
               </b-col>
               <b-col v-if="modo == 'fluxo' && filtroGrafico != 'acionamentos'" class="d-flex align-items-center mt-2">
                  <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(163, 254, 44, 0.4)">&nbsp;</b-badge>
                  <p class="m-0">Rodízio</p>
               </b-col>

               <b-col v-if="modo == 'operacao' || filtroGrafico == 'acionamentos'" class="d-flex align-items-center mt-2">
                  <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(194, 192, 192, 0.4); border: 1px solid lightgrey">&nbsp;</b-badge>
                  <p class="m-0">Desligado</p>
               </b-col>
               <b-col v-if="modo == 'operacao' || filtroGrafico == 'acionamentos'" class="d-flex align-items-center mt-2">
                  <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(254, 254, 49, 0.4)">&nbsp;</b-badge>
                  <p class="m-0">Descarga</p>
               </b-col>
               <b-col v-if="modo == 'operacao' || filtroGrafico == 'acionamentos'" class="d-flex align-items-center mt-2">
                  <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(77, 205, 60, 0.4)">&nbsp;</b-badge>
                  <p class="m-0">Secagem</p>
               </b-col>
               <b-col v-if="modo == 'operacao' || filtroGrafico == 'acionamentos'" class="d-flex align-items-center mt-2">
                  <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(64, 206, 253, 0.4)">&nbsp;</b-badge>
                  <p class="m-0">Carga</p>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico == 'parametros'">
               <b-col>
                  <p v-if="!this.isDataExpirada()">Parâmetros recebidos na última hora</p>
                  <b-list-group horizontal v-if="this.isDataExpirada()">
                     <b-list-group-item class="d-flex justify-content-between">
                        <b-badge variant="primary" class="valor mr-1">Aguardando dados</b-badge>
                     </b-list-group-item>
                  </b-list-group>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico == 'parametros' && !this.isDataExpirada()" class="text-center justify-content-center d-flex overflow-auto">
               <b-col class="ml-3 mr-3 mt-2">
                  <b-list-group horizontal>
                     <b-list-group-item class="d-flex justify-content-between">
                        <b-badge variant="primary" class="valor mr-1">Produto em Secagem</b-badge>
                        <small class="valor">{{ formatarProduto(parametros?.cul) }}</small>
                     </b-list-group-item>
                     <b-list-group-item class="d-flex justify-content-between">
                        <b-badge variant="primary" class="valor mr-1">Umidade Objetivo</b-badge>
                        <small class="valor text-nowrap">{{ parametros?.uo || '-' }} %</small>
                     </b-list-group-item>
                  </b-list-group>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico == 'parametros' && !this.isDataExpirada()" class="m-2">
               <b-col cols="12" sm="12" md="6" lg="4" class="p-1" v-for="chave in chavesParametros" :key="chave">
                  <div class="card text-center">
                     <div class="bg-transparent card-header pt-0 border-0">
                        <h1 class="h1 font-weight-normal text-primary text-center mb-0">
                           <span class="h5 text-muted ml-2">{{ chave.toUpperCase() }}</span>
                        </h1>
                     </div>
                     <div class="card-body pt-0 pb-3">
                        <b-row>
                           <b-col cols="12">
                              <span class="float-left"><b>Máximo</b></span>
                              <span v-if="chave.startsWith('s')" class="float-right">{{ parametros?.[`ta${chave.substr(1, 4)}`] }} °C</span>
                              <span v-if="chave.startsWith('p')" class="float-right">{{ parametros?.[`pa${chave.substr(1, 4)}`] }} mmCa</span>
                           </b-col>
                           <b-col>
                              <hr class="m-2" />
                           </b-col>
                           <b-col cols="12" v-if="chave.startsWith('s')">
                              <span class="float-left"><b>Operacional</b></span>
                              <span class="float-right">{{ parametros?.[`to${chave.substr(1, 4)}`] }} °C</span>
                           </b-col>
                           <b-col cols="12" v-if="chave.startsWith('p')">
                              <span class="float-left"><b>&nbsp;</b></span>
                              <span class="float-right">&nbsp;</span>
                           </b-col>
                           <b-col>
                              <hr class="m-2" />
                           </b-col>
                           <b-col cols="12">
                              <span class="float-left"><b>Mínimo</b></span>
                              <span v-if="chave.startsWith('s')" class="float-right">{{ parametros?.[`tb${chave.substr(1, 4)}`] }} °C</span>
                              <span v-if="chave.startsWith('p')" class="float-right">{{ parametros?.[`pb${chave.substr(1, 4)}`] }} mmCa</span>
                           </b-col>
                           <b-col>
                              <hr class="m-2" />
                           </b-col>
                        </b-row>
                     </div>
                  </div>
               </b-col>
            </b-row>
         </b-overlay>
         <b-row v-show="filtroGrafico == 'acionamentos'">
            <b-col>
               <b-table-simple hover small class="mt-2">
                  <b-thead>
                     <b-tr>
                        <b-th colspan="2" class="text-center">Tempo de acionamento no período</b-th>
                     </b-tr>
                  </b-thead>
                  <b-tbody>
                     <b-tr>
                        <b-td>Exaustor</b-td>
                        <b-td>{{ this.acionamentos?.exaustorTempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-td>Transportador</b-td>
                        <b-td>{{ this.acionamentos?.transportadorTempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-td>Descarga</b-td>
                        <b-td>{{ this.acionamentos?.descargaTempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-td>Captação</b-td>
                        <b-td>{{ this.acionamentos?.captacaoTempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamentos?.minimo1Tempo != null">
                        <b-td>Nível mínimo 1</b-td>
                        <b-td>{{ this.acionamentos?.minimo1Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamentos?.maximo1Tempo != null">
                        <b-td>Nível máximo 1</b-td>
                        <b-td>{{ this.acionamentos?.maximo1Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamentos?.minimo2Tempo != null">
                        <b-td>Nível mínimo 2</b-td>
                        <b-td>{{ this.acionamentos?.minimo2Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamentos?.maximo2Tempo != null">
                        <b-td>Nível máximo 2</b-td>
                        <b-td>{{ this.acionamentos?.maximo2Tempo || 0 }} h</b-td>
                     </b-tr>
                     <b-tr v-if="this.acionamentos?.intermediarioTempo != null">
                        <b-td>Nível intermediário</b-td>
                        <b-td>{{ this.acionamentos?.intermediarioTempo || 0 }} h</b-td>
                     </b-tr>
                  </b-tbody>
               </b-table-simple>
            </b-col>
         </b-row>
      </b-overlay>
   </div>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'

export default {
   name: 'SecadorAdsGrafico',
   props: {
      filtroGrafico: String,
      tempoAtualizacao: Number,
      dataInicial: String,
      dataFinal: String
   },
   emits: ['update:dataInicial', 'update:dataFinal'],
   data() {
      return {
         buscandoTemperaturas: false,
         buscandoPressoes: false,
         buscandoUmidades: false,
         buscandoRendimento: false,
         buscandoParametros: false,
         buscandoAcionamentos: false,
         temperaturas: {},
         pressoes: {},
         umidades: {},
         rendimento: {},
         parametros: {},
         acionamentos: {},
         idSecador: null,
         fullscreen: false,
         options: [
            { value: 'fluxo', text: 'Ver fluxo' },
            { value: 'operacao', text: 'Ver operação' }
         ],
         variavel: null,
         modo: 'fluxo',
         chartInstance: null,
         resizeObserver: null,
         opcoesDoGrafico: {},
         data: null,
         datasOperacao: [],
         chavesAcionamentos: [],
         datas: [],
         verificacaoConfig: [
            { objeto: 'temperaturas', props: ['s1', 's2', 's3', 's4'] },
            { objeto: 'pressoes', props: ['p1', 'p2', 'p3', 'p4', 'p5'] },
            { objeto: 'umidades', props: ['uo', 'us', 'ue'] },
            { objeto: 'rendimento', props: ['ces', 'cis'] },
            { objeto: 'acionamentos', props: ['minimo1', 'maximo1', 'ventilador', 'registro', 'esteira', 'captacao', 'transportador', 'descarga', 'exaustor'] }
         ]
      }
   },

   computed: {
      dataInicio: {
         get() {
            return this.dataInicial
         },
         set(value) {
            this.$emit('update:dataInicial', value)
         }
      },
      dataFim: {
         get() {
            return this.dataFinal
         },
         set(value) {
            this.$emit('update:dataFinal', value)
         }
      },
      chavesTemperatura() {
         return Object.keys(this.temperaturas)
            .filter((chave) => chave.startsWith('s') && !chave.startsWith('ta') && !chave.startsWith('tb'))
            .sort((a, b) => {
               const matchA = a.match(/^s(\d+)([a-z]*)$/i)
               const matchB = b.match(/^s(\d+)([a-z]*)$/i)
               const numA = parseInt(matchA[1])
               const numB = parseInt(matchB[1])
               if (numA !== numB) {
                  return numA - numB
               }
               const suffixA = matchA[2] || ''
               const suffixB = matchB[2] || ''
               return suffixA.localeCompare(suffixB)
            })
      },
      chavesPressao() {
         return Object.keys(this.pressoes)
            .filter((chave) => chave.startsWith('p') && !chave.startsWith('pa') && !chave.startsWith('pb'))
            .sort((a, b) => {
               const numA = parseInt(a.slice(1))
               const numB = parseInt(b.slice(1))
               return numA - numB
            })
      },
      chavesParametros() {
         return Object.keys(this.parametros)
            .filter((chave) => (chave.startsWith('s') || chave.startsWith('p')) && !chave.startsWith('to') && !chave.startsWith('ta') && !chave.startsWith('tb') && !chave.startsWith('pa') && !chave.startsWith('pb'))
            .sort((a, b) => {
               const prefixA = a.charAt(0)
               const prefixB = b.charAt(0)
               if (prefixA !== prefixB) {
                  return prefixA === 't' ? -1 : 1
               }
               const numA = parseFloat(a.slice(1))
               const numB = parseFloat(b.slice(1))
               return numA - numB
            })
      }
   },

   methods: {
      marcaDatasOperacao(data) {
         const datasOperacao = this.datas?.datasOperacao?.includes(data)
         const datasSecagem = this.datas?.datasSecagem?.includes(data)
         if (datasSecagem) return 'table-success'
         if (datasOperacao) return 'table-primary'
         return ''
      },
      acionaBusca(filtro) {
         this.variavel = null
         if (filtro == 'temperaturas') {
            this.buscarTemperaturas()
         } else if (filtro == 'pressões') {
            this.buscarPressoes()
         } else if (filtro == 'umidades') {
            this.buscarUmidades()
         } else if (filtro == 'rendimento') {
            this.buscarRendimento()
         } else if (filtro == 'parametros') {
            this.buscarParametros()
         } else if (filtro == 'acionamentos') {
            this.buscarAcionamentos()
         } else {
            this.opcoesDoGrafico = {}
         }
      },
      async buscarTemperaturas() {
         if (!this.idSecador) {
            return
         }
         this.buscandoTemperaturas = true
         const dados = await client.get(`/secador/ads/buscartemperatura/${this.idSecador}?inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar temperaturas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoTemperaturas = false
         })
         this.buscandoTemperaturas = false
         if (dados && dados.data) {
            this.temperaturas = dados.data
            this.pressoes = {}
            this.umidades = {}
            this.rendimento = {}
            this.acionamentos = {}
            this.construirGrafico(this.temperaturas)
            this.datasOperacao = this.temperaturas.datasOperacao
         }
      },
      async buscarPressoes() {
         if (!this.idSecador) {
            return
         }
         this.buscandoPressoes = true
         const dados = await client.get(`/secador/ads/buscarpressao/${this.idSecador}?inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar pressões. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoPressoes = false
         })
         this.buscandoPressoes = false
         if (dados && dados.data) {
            this.pressoes = dados.data
            this.temperaturas = {}
            this.umidades = {}
            this.rendimento = {}
            this.acionamentos = {}
            this.construirGrafico(this.pressoes)
         }
      },
      async buscarUmidades() {
         if (!this.idSecador) {
            return
         }
         this.buscandoUmidades = true
         const dados = await client.get(`/secador/ads/buscarumidade/${this.idSecador}?inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar umidades. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoUmidades = false
         })
         this.buscandoUmidades = false
         if (dados && dados.data) {
            this.umidades = dados.data
            this.pressoes = {}
            this.temperaturas = {}
            this.rendimento = {}
            this.acionamentos = {}
            this.construirGrafico(this.umidades)
         }
      },
      async buscarParametros() {
         if (!this.idSecador) {
            return
         }
         this.buscandoParametros = true
         const dados = await client.get(`/secador/ads/buscarparametro/${this.idSecador}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar parâmetros. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoParametros = false
         })
         this.buscandoParametros = false
         if (dados && dados.data) {
            this.parametros = dados.data
            this.temperaturas = {}
            this.pressoes = {}
            this.umidades = {}
            this.acionamentos = {}
         }
      },
      async buscarRendimento() {
         if (!this.idSecador) {
            return
         }
         this.buscandoRendimento = true
         const dados = await client.get(`/secador/ads/buscarrendimento/${this.idSecador}?inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar rendimento. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRendimento = false
         })
         this.buscandoRendimento = false
         if (dados && dados.data) {
            this.rendimento = dados.data
            this.umidades = {}
            this.pressoes = {}
            this.temperaturas = {}
            this.acionamentos = {}
            this.construirGrafico(this.rendimento)
         }
      },
      async buscarAcionamentos() {
         if (!this.idSecador) {
            return
         }
         this.buscandoAcionamentos = true
         const dados = await client.get(`/secador/ads/buscaracionamento/${this.idSecador}?inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar acionamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoAcionamentos = false
         })
         this.buscandoAcionamentos = false
         if (dados && dados.data) {
            this.acionamentos = dados.data
            const converteChave = {
               minimo1: 'Nível mínimo 1',
               minimo2: 'Nível mínimo 2',
               intermediario: 'Nível intermediário',
               maximo1: 'Nível máximo 1',
               maximo2: 'Nível máximo 2'
            }
            for (let key in converteChave) {
               if (Object.prototype.hasOwnProperty.call(this.acionamentos, key)) {
                  this.chavesAcionamentos.push(converteChave[key])
                  this.acionamentos[converteChave[key]] = this.acionamentos[key]
                  delete this.acionamentos[key]
               }
            }
            this.construirGrafico(this.acionamentos)
            this.parametros = {}
            this.temperaturas = {}
            this.pressoes = {}
            this.umidades = {}
         }
      },
      construirGrafico(dados) {
         let seriesGrafico = []
         let legendaGrafico = []
         let legendaSelecionada = {}
         let tituloGrafico = ''
         let unidadeGrafico = ''
         let unidadeVariavel = ''

         if (this.filtroGrafico == 'temperaturas' || this.filtroGrafico == 'todos') {
            legendaGrafico = this.chavesTemperatura.map((item) => item.toUpperCase())
            legendaSelecionada = { S4A: false, S4B: false, S4C: false, S4E: false }
            tituloGrafico = 'Temperaturas'
            unidadeGrafico = 'T(°C)'
            unidadeVariavel = '°C'
            seriesGrafico = this.chavesTemperatura.map((chave) => ({
               name: chave.toUpperCase(),
               type: 'line',
               showSymbol: false,
               data: dados[chave],
               tooltip: { valueFormatter: (value) => value + ' °C' }
            }))
         } else if (this.filtroGrafico == 'pressões') {
            legendaGrafico = this.chavesPressao.map((item) => item.toUpperCase())
            tituloGrafico = 'Pressões'
            unidadeGrafico = 'P(mmCa)'
            unidadeVariavel = 'mmCa'
            seriesGrafico = this.chavesPressao.map((chave) => ({
               name: chave.toUpperCase(),
               type: 'line',
               showSymbol: false,
               data: dados[chave.replace(/s/g, 'p')],
               tooltip: { valueFormatter: (value) => value + ' mmCa' }
            }))
         } else if (this.filtroGrafico == 'umidades') {
            legendaGrafico = ['UE', 'US']
            tituloGrafico = 'Umidades'
            unidadeGrafico = 'U(%)'
            unidadeVariavel = '%'
            seriesGrafico = [
               { name: 'UE', type: 'line', showSymbol: false, data: dados?.ue, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'US', type: 'line', showSymbol: false, data: dados?.us, tooltip: { valueFormatter: (value) => value + ' %' } }
            ]
         } else if (this.filtroGrafico == 'rendimento') {
            legendaGrafico = ['Capac. instantânea', 'Capac. calculada']
            tituloGrafico = 'Rendimento'
            unidadeGrafico = 'ton'
            unidadeVariavel = 'ton/h'
            seriesGrafico = [
               { name: 'Capac. instantânea', type: 'line', showSymbol: false, data: dados?.cis, tooltip: { valueFormatter: (value) => value + ' ton/h' } },
               { name: 'Capac. calculada', type: 'line', showSymbol: false, data: dados?.cca, tooltip: { valueFormatter: (value) => value + ' ton/h' } }
            ]
         } else if (this.filtroGrafico == 'acionamentos') {
            let markAreasGrafico = []
            const adicionarMarkArea = (dados, cor) => {
               if (!dados) return
               dados.forEach((item) => {
                  markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
               })
            }

            adicionarMarkArea(this.acionamentos.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
            adicionarMarkArea(this.acionamentos.operacoes?.descarga, 'rgba(254, 254, 49, 0.3)')
            adicionarMarkArea(this.acionamentos.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
            adicionarMarkArea(this.acionamentos.operacoes?.carga, 'rgba(64, 206, 253, 0.3)')

            const coresNiveis = {
               'Nível mínimo 1': '#8FDEAD',
               'Nível máximo 1': '#78D39A',
               'Nível intermediário': '#78D39A',
               'Nível mínimo 2': '#5CC982',
               'Nível máximo 2': '#3FBF6B'
            }

            legendaGrafico = ['Descarga', 'Transportador', 'Exaustor', 'Captação']
            unidadeGrafico = ''
            unidadeVariavel = ''
            seriesGrafico = [
               { name: 'Exaustor', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#A7D8F0' }, itemStyle: { color: '#A7D8F0' }, data: this.acionamentos.exaustor },
               { name: 'Descarga', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#72BFE5' }, itemStyle: { color: '#72BFE5' }, data: this.acionamentos.descarga },
               { name: 'Transportador', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#3CA6DA' }, itemStyle: { color: '#3CA6DA' }, data: this.acionamentos.transportador },
               { name: 'Captação', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#1E6FBA' }, itemStyle: { color: '#1E6FBA' }, data: this.acionamentos.captacao },
               { name: '', type: 'line', showSymbol: false, lineStyle: { opacity: 0 }, markArea: { data: markAreasGrafico }, tooltip: { show: false } }
            ]

            this.chavesAcionamentos.forEach((chave) => {
               seriesGrafico.push({ name: chave, type: 'line', showSymbol: false, lineStyle: { width: 20, color: coresNiveis[chave] }, itemStyle: { color: coresNiveis[chave] }, data: this.acionamentos[chave] })
               legendaGrafico.unshift(chave)
            })
         }

         const formatTime = (timestamp) => {
            return this.$moment(timestamp, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
         }

         const formatTooltip = (params) => {
            const formattedTime = formatTime(params[0].value[0])
            let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
            if (this.filtroGrafico == 'acionamentos') {
               const grouped = {}
               params.forEach((param) => {
                  if (!grouped[param.seriesName]) grouped[param.seriesName] = param
               })
               Object.values(grouped).forEach((param) => {
                  tooltipContent += `<div class="d-flex justify-content-between">
                  <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                  <span class="text-right"><b>${param.value[1] === 'erro' || param.value[1] === '-' ? '-' : 'Acionado'}</b></span>
                  </div>`
               })
            } else {
               params.forEach((param) => {
                  tooltipContent += `<div class="d-flex justify-content-between">
                  <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                  <span class="text-right"><b>${param.value[1]} ${unidadeVariavel}</b></span>
                  </div>`
               })
            }
            tooltipContent += '</div>'
            return tooltipContent
         }

         this.opcoesDoGrafico = {
            titulo: tituloGrafico,
            toolbox: { top: -3, left: -5, orient: 'horizontal', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            title: { text: '' },
            tooltip: { trigger: 'axis', formatter: formatTooltip },
            legend: { textStyle: { color: '#6c727a' }, top: 20, data: legendaGrafico, selected: legendaSelecionada, type: 'scroll', orient: 'horizontal' },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: { type: 'time', boundaryGap: false, axisLabel: { formatter: (value) => echarts.format.formatTime('dd/MM hh:mm', value) } },
            yAxis: { type: 'value', name: unidadeGrafico, splitNumber: 10, axisLabel: { show: this.filtroGrafico == 'acionamentos' ? false : true } },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            series: seriesGrafico
         }
      },
      graficoVariavel(variavel) {
         let tituloGrafico = ''
         let legendaGrafico = []
         let seriesGrafico = []
         let unidadeGrafico = null
         let unidadeVariavel = null
         let markAreasGrafico = []
         let media = null

         const adicionarMarkArea = (dados, cor) => {
            if (!dados) return
            dados.forEach((item) => {
               markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
            })
         }

         if (variavel.startsWith('s')) {
            if (this.modo === 'fluxo') {
               adicionarMarkArea(this.temperaturas.fluxos?.continuo, 'rgba(42, 154, 57, 0.3)')
               adicionarMarkArea(this.temperaturas.fluxos?.rodizio, 'rgba(163, 254, 44, 0.3)')
            } else if (this.modo === 'operacao') {
               adicionarMarkArea(this.temperaturas.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
               adicionarMarkArea(this.temperaturas.operacoes?.descarga, 'rgba(254, 254, 49, 0.3)')
               adicionarMarkArea(this.temperaturas.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
               adicionarMarkArea(this.temperaturas.operacoes?.carga, 'rgba(64, 206, 253, 0.3)')
            }
            tituloGrafico = 'Temperaturas'
            unidadeGrafico = 'T(°C)'
            unidadeVariavel = '°C'
            legendaGrafico = [variavel.toUpperCase(), 'Máximo', 'Mínimo']

            seriesGrafico = [
               { name: variavel.toUpperCase(), type: 'line', showSymbol: false, data: this.temperaturas[`s${variavel.substr(1, 4)}`], markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Máximo', type: 'line', showSymbol: false, lineStyle: { color: 'red', type: 'dashed' }, itemStyle: { color: 'red' }, data: this.temperaturas[`ta${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' °C' } },
               { name: 'Mínimo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.temperaturas[`tb${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' °C' } }
            ]
            media = (this.temperaturas[`s${variavel.substr(1, 4)}`].filter((d) => d[1] !== '-' && !isNaN(parseFloat(d[1]))).reduce((acc, curr) => acc + parseFloat(curr[1]), 0) / this.temperaturas[`s${variavel.substr(1, 4)}`].filter((d) => d[1] !== '-' && !isNaN(parseFloat(d[1]))).length).toFixed(1)
         } else if (variavel.startsWith('p') && variavel != 'prod') {
            if (this.modo === 'fluxo') {
               adicionarMarkArea(this.pressoes.fluxos?.continuo, 'rgba(42, 154, 57, 0.3)')
               adicionarMarkArea(this.pressoes.fluxos?.rodizio, 'rgba(163, 254, 44, 0.3)')
            } else if (this.modo === 'operacao') {
               adicionarMarkArea(this.pressoes.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
               adicionarMarkArea(this.pressoes.operacoes?.descarga, 'rgba(254, 254, 49, 0.3)')
               adicionarMarkArea(this.pressoes.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
               adicionarMarkArea(this.pressoes.operacoes?.carga, 'rgba(64, 206, 253, 0.3)')
            }
            tituloGrafico = 'Pressões'
            unidadeGrafico = 'P(mmCa)'
            unidadeVariavel = 'mmCa'
            legendaGrafico = [variavel.toUpperCase(), 'Máximo', 'Mínimo']
            seriesGrafico = [
               { name: variavel.toUpperCase(), type: 'line', showSymbol: false, data: this.pressoes[`p${variavel.charAt(1)}`], markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' mmCa' } },
               { name: 'Máximo', type: 'line', showSymbol: false, lineStyle: { color: 'red', type: 'dashed' }, itemStyle: { color: 'red' }, data: this.pressoes[`pa${variavel.charAt(1)}`], tooltip: { valueFormatter: (value) => value + ' mmCa' } },
               { name: 'Mínimo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.pressoes[`pb${variavel.charAt(1)}`], tooltip: { valueFormatter: (value) => value + ' mmCa' } }
            ]
            media = (this.pressoes[`p${variavel.substr(1, 4)}`].filter((d) => d[1] !== '-' && !isNaN(parseFloat(d[1]))).reduce((acc, curr) => acc + parseFloat(curr[1]), 0) / this.pressoes[`p${variavel.substr(1, 4)}`].filter((d) => d[1] !== '-' && !isNaN(parseFloat(d[1]))).length).toFixed(1)
         } else if (variavel.startsWith('u')) {
            if (this.modo === 'fluxo') {
               adicionarMarkArea(this.umidades.fluxos?.continuo, 'rgba(42, 154, 57, 0.3)')
               adicionarMarkArea(this.umidades.fluxos?.rodizio, 'rgba(163, 254, 44, 0.3)')
            } else if (this.modo === 'operacao') {
               adicionarMarkArea(this.umidades.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
               adicionarMarkArea(this.umidades.operacoes?.descarga, 'rgba(254, 254, 49, 0.3)')
               adicionarMarkArea(this.umidades.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
               adicionarMarkArea(this.umidades.operacoes?.carga, 'rgba(64, 206, 253, 0.3)')
            }
            tituloGrafico = 'Umidades'
            unidadeGrafico = 'U(%)'
            unidadeVariavel = '%'
            legendaGrafico = [variavel.toUpperCase(), 'Objetivo']
            seriesGrafico = [
               { name: variavel.toUpperCase(), type: 'line', showSymbol: false, data: this.umidades[variavel], markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'Objetivo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.umidades.uo, tooltip: { valueFormatter: (value) => value + ' %' } }
            ]
            media = (this.umidades[variavel].reduce((acc, curr) => acc + parseFloat(curr[1]), 0) / this.umidades[variavel].length).toFixed(1)
         } else if (variavel.startsWith('c')) {
            if (this.modo === 'fluxo') {
               adicionarMarkArea(this.rendimento.fluxos?.continuo, 'rgba(42, 154, 57, 0.3)')
               adicionarMarkArea(this.rendimento.fluxos?.rodizio, 'rgba(163, 254, 44, 0.3)')
            } else if (this.modo === 'operacao') {
               // adicionarMarkArea(this.rendimento.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
               adicionarMarkArea(this.rendimento.operacoes?.descarga, 'rgba(254, 254, 49, 0.3)')
               adicionarMarkArea(this.rendimento.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
               // adicionarMarkArea(this.rendimento.operacoes?.carga, 'rgba(64, 206, 253, 0.3)')
            }
            tituloGrafico = 'Rendimento'
            unidadeGrafico = 'ton'
            unidadeVariavel = 'ton/h'
            let legendaVariavel = variavel == 'cis' ? 'Capac. instantânea' : 'Capac. calculada'
            legendaGrafico = [legendaVariavel, 'Capac. nominal']
            seriesGrafico = [
               { name: legendaVariavel, type: 'line', showSymbol: false, data: this.rendimento[variavel], markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'Capac. nominal', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.rendimento.ces, tooltip: { valueFormatter: (value) => value + ' %' } }
            ]
            media = (this.rendimento[variavel].reduce((acc, curr) => acc + parseFloat(curr[1]), 0) / this.rendimento[variavel].length).toFixed(1)
         }
         this.opcoesDoGrafico = {
            titulo: tituloGrafico,
            toolbox: { top: -3, left: -5, orient: 'horizontal', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            title: { text: '' },
            tooltip: {
               trigger: 'axis',
               formatter: (params) => {
                  const date = params[0].value[0]
                  const formattedTime = this.$moment(date, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
                  let tooltipContent = `<div class="text-left">${formattedTime}<br/>`
                  params.forEach((param) => {
                     tooltipContent += `<div class="d-flex justify-content-between">
                     <span class="text-left mr-4">${param.marker} ${param.seriesName}</span>
                     <span class="text-right"><b>${param.value[1]} ${unidadeVariavel}</b></span>
                  </div>`
                  })
                  if (variavel != 'um') {
                     tooltipContent += `<div class="d-flex justify-content-between">
                     <span class="text-left ml-4 mr-4"> Média</span>
                     <span class="text-right"><b>${media} ${unidadeVariavel}</b></span>
                  </div>`
                  }
                  tooltipContent += '</div>'
                  return tooltipContent
               }
            },
            legend: { textStyle: { color: '#6c727a' }, top: 10, data: legendaGrafico, type: 'scroll', orient: 'horizontal' },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: {
               type: 'time',
               boundaryGap: false,
               axisLabel: {
                  formatter: function (value) {
                     return echarts.format.formatTime('dd/MM hh:mm', value)
                  }
               }
            },
            yAxis: { type: 'value', name: unidadeGrafico, splitNumber: 10 },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            series: seriesGrafico
         }
      },
      toggleFullScreen() {
         const elem = this.$refs.chartContainer
         this.fullscreen = true

         if (!this.fullscreenElement) {
            if (elem.requestFullscreen) {
               elem.requestFullscreen()
            } else if (elem.mozRequestFullScreen) {
               elem.mozRequestFullScreen()
            } else if (elem.webkitRequestFullscreen) {
               elem.webkitRequestFullscreen()
            } else if (elem.msRequestFullscreen) {
               elem.msRequestFullscreen()
            }

            elem.style.overflow = 'auto'
            this.fullscreenElement = elem
         } else {
            if (document.exitFullscreen) {
               document.exitFullscreen()
            } else if (document.mozCancelFullScreen) {
               document.mozCancelFullScreen()
            } else if (document.webkitExitFullscreen) {
               document.webkitExitFullscreen()
            } else if (document.msExitFullscreen) {
               document.msExitFullscreen()
            }

            this.fullscreenElement = null
            this.fullscreen = false
         }
      },
      exitFullScreen() {
         if (document.exitFullscreen) {
            document.exitFullscreen()
         } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
         } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
         } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
         }

         this.fullscreenElement = null
         this.fullscreen = false
      },
      initializeChart() {
         if (this.chartInstance) {
            this.chartInstance.dispose()
         }
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
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.acionaBusca(this.filtroGrafico)
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      },
      maiorValor() {
         this.$nextTick(() => {
            const myChart = this.chartInstance
            const option = myChart.getOption()
            let maxIndex = 0
            let maxValue = -Infinity
            let maxSeriesIndex = 0
            for (let seriesIndex = 0; seriesIndex < option.series.length; seriesIndex++) {
               const seriesName = option.series[seriesIndex].name
               if (seriesName === 'Máximo' || seriesName === 'Mínimo') {
                  continue
               }
               const seriesData = option.series[seriesIndex].data
               for (let i = 0; i < seriesData.length; i++) {
                  if (parseFloat(seriesData[i][1]) >= maxValue) {
                     maxValue = parseFloat(seriesData[i][1])
                     maxIndex = i
                     maxSeriesIndex = seriesIndex
                  }
               }
            }
            setTimeout(() => {
               myChart.dispatchAction({
                  type: 'showTip',
                  seriesIndex: maxSeriesIndex,
                  dataIndex: maxIndex
               })
            }, 100)
         })
      },
      menorValor() {
         this.$nextTick(() => {
            const myChart = this.chartInstance
            const option = myChart.getOption()
            let minIndex = 0
            let minValue = Infinity
            let minSeriesIndex = 0
            for (let seriesIndex = 0; seriesIndex < option.series.length; seriesIndex++) {
               const seriesName = option.series[seriesIndex].name
               if (seriesName === 'Máximo' || seriesName === 'Mínimo') {
                  continue
               }
               const seriesData = option.series[seriesIndex].data
               for (let i = 0; i < seriesData.length; i++) {
                  if (seriesData[i][1] <= minValue) {
                     minValue = seriesData[i][1]
                     minIndex = i
                     minSeriesIndex = seriesIndex
                  }
               }
            }
            setTimeout(() => {
               myChart.dispatchAction({
                  type: 'showTip',
                  seriesIndex: minSeriesIndex,
                  dataIndex: minIndex
               })
            }, 100)
         })
      },
      limpar() {
         this.variavel = null
         this.acionaBusca(this.filtroGrafico)
      },
      isDataExpirada() {
         if (!this.parametros || !this.parametros.dat || this.statusEquipamento === 'OF') {
            return true
         }
         const dataDados = this.$moment(this.parametros.dat, 'DD/MM/YYYY HH:mm:ss')
         const dataAtual = this.$moment()
         const diferencaHoras = dataAtual.diff(dataDados, 'hours')
         return diferencaHoras > 1
      },
      formatarProduto(value) {
         const produto = {
            0: '-',
            1: 'Soja',
            2: 'Milho',
            3: 'Trigo',
            4: 'Arroz',
            5: 'Outros'
         }
         return produto[value]
      },
      verificarObjetoVazio() {
         return this.verificacaoConfig.every((config) => {
            const obj = this[config.objeto]
            return config.props.every((prop) => !obj[prop]?.length)
         })
      },
      async buscarDatasSecagem() {
         if (!this.idSecador) {
            return
         }
         const dados = await client.get(`/secador/ads/buscardatassecagem/${this.idSecador}`).catch((err) => {
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
      }
   },

   mounted() {
      // this.renderChart()
      const idSecadorLocalStorage = localStorage.getItem('sec')

      if (idSecadorLocalStorage && idSecadorLocalStorage != 'undefined') {
         this.idSecador = idSecadorLocalStorage
      } else {
         this.idSecador = this.$route.params.idSecador
         localStorage.setItem('sec', this.idSecador)
      }

      this.buscarDatasSecagem()
      this.buscarTemperaturas()

      if (this.opcoesDoGrafico) {
         this.initializeChart()
      }
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(this.$refs.chartContainer)

      window.addEventListener('resize', this.handleResize)
   },

   watch: {
      opcoesDoGrafico(novasOpcoes) {
         if (novasOpcoes) {
            this.initializeChart()
            this.clearChart()
            this.updateChart(novasOpcoes)
         }
      },
      filtroGrafico() {
         // this.initializeChart()
         // this.resizeObserver = new ResizeObserver(this.handleResize)
         // this.resizeObserver.observe(this.$refs.chartContainer)
         // window.addEventListener('resize', this.handleResize)
         this.acionaBusca(this.filtroGrafico)
      },
      tempoAtualizacao(newValue) {
         if (newValue) {
            this.startInterval(newValue)
         } else {
            this.stopInterval()
         }
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
      this.stopInterval()
   }
}
</script>

<style scoped>
::-webkit-scrollbar {
   height: 8px;
   background: none;
}

::-webkit-scrollbar-thumb:horizontal {
   background: #a7a7a7;
   border-radius: 10px;
}

.valor {
   font-size: 16px;
   font-weight: 400;
}

.cursor {
   cursor: pointer;
}

.overlay {
   z-index: 0;
}
</style>