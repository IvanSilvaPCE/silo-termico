<template>
   <div ref="chartContainer">
      <b-overlay :show="buscandoTemperaturas || buscandoPressoes || buscandoUmidades || buscandoSecagem || buscandoParametro || buscandoAcionamento" rounded="sm" class="overlay">
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
               <b-button variant="outline-primary" class="mt-2" @click="acionaBusca(filtroGrafico)" :disabled="buscandoSecagem || buscandoUmidades || buscandoPressoes || buscandoTemperaturas || buscandoAcionamento">
                  <span v-if="!buscandoSecagem && !buscandoUmidades && !buscandoPressoes && !buscandoTemperaturas && !buscandoParametro && !buscandoAcionamento">Filtrar</span>
                  <div v-else>
                     <b-spinner small></b-spinner>
                     <span class="ml-1">Filtrar...</span>
                  </div>
               </b-button>
            </b-col>
            <b-col lg="2">
               <b-button variant="outline-primary" class="mt-2" v-if="filtroGrafico == 'secagem' && verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN', 'ADMINFABRI', 'ADMINLOCAL', 'ADMINGERAL'])" @click="abrirPagina()">Editar Lotes</b-button>
            </b-col>
         </b-row>
         <b-overlay :show="this.verificarObjetoVazio() && filtroGrafico != 'parametros'" opacity="0">
            <template #overlay>
               <div class="text-center text-nowrap">
                  <p>Sem dados no período</p>
               </div>
            </template>
            <b-row v-if="filtroGrafico == 'temperaturas' || filtroGrafico == 'pressões'">
               <b-col>
                  <label>Últimos valores (clique para detalhes)</label>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico == 'temperaturas'" class="justify-content-center d-flex overflow-auto">
               <b-col cols="12">
                  <b-list-group horizontal>
                     <b-list-group-item @click="graficoVariavel((variavel = 't1'), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">T1</b-badge>
                        <small class="valor">{{ temperaturas['t1']?.[temperaturas['t1'].length - 1]?.[1] }}</small>
                        <small class="ml-1">°C</small>
                     </b-list-group-item>
                     <b-list-group-item @click="graficoVariavel((variavel = 't2'), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">T2</b-badge>
                        <small class="valor">{{ temperaturas['t2']?.[temperaturas['t2'].length - 1]?.[1] }}</small>
                        <small class="ml-1">°C</small>
                     </b-list-group-item>
                     <b-list-group-item @click="graficoVariavel((variavel = 't3'), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">T3</b-badge>
                        <small class="valor">{{ temperaturas['t3']?.[temperaturas['t3'].length - 1]?.[1] }}</small>
                        <small class="ml-1">°C</small>
                     </b-list-group-item>
                     <b-list-group-item @click="graficoVariavel((variavel = 't4'), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">T4</b-badge>
                        <small class="valor">{{ temperaturas['t4']?.[temperaturas['t4'].length - 1]?.[1] }}</small>
                        <small class="ml-1">°C</small>
                     </b-list-group-item>
                  </b-list-group>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico == 'pressões'" class="justify-content-center d-flex overflow-auto">
               <b-col cols="12">
                  <b-list-group horizontal>
                     <b-list-group-item @click="graficoVariavel((variavel = 'p1'), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">P1</b-badge>
                        <small class="valor">{{ pressoes['p1']?.[pressoes['p1'].length - 1]?.[1] }}</small>
                        <small class="ml-1">mmCa</small>
                     </b-list-group-item>
                     <b-list-group-item @click="graficoVariavel((variavel = 'p2'), modo)" class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">P2</b-badge>
                        <small class="valor">{{ pressoes['p2']?.[pressoes['p2'].length - 1]?.[1] }}</small>
                        <small class="ml-1">mmCa</small>
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

            <div v-show="filtroGrafico != 'parametros'" ref="chart" style="width: 100%; height: 71vh"></div>

            <b-row v-if="variavel || filtroGrafico == 'secagem' || filtroGrafico == 'acionamentos'">
               <b-col class="d-flex align-items-center mt-2">
                  <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(194, 192, 192, 0.4); border: 1px solid lightgrey">&nbsp;</b-badge>
                  <p class="m-0">Desligado</p>
               </b-col>
               <b-col class="d-flex align-items-center mt-2">
                  <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(254, 254, 49, 0.4)">&nbsp;</b-badge>
                  <p class="m-0">Descarga</p>
               </b-col>
               <b-col class="d-flex align-items-center mt-2">
                  <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(77, 205, 60, 0.4)">&nbsp;</b-badge>
                  <p class="m-0">Secagem</p>
               </b-col>
               <b-col class="d-flex align-items-center mt-2">
                  <b-badge class="pr-4 pb-3 mr-1" style="background-color: rgba(64, 206, 253, 0.4)">&nbsp;</b-badge>
                  <p class="m-0">Carga</p>
               </b-col>
            </b-row>
            <b-row class="justify-content-end">
               <b-col sm="12" md="4" lg="3">
                  <b-form-select class="mt-2" v-model="filtroLote" :options="optionsLote" v-if="filtroGrafico == 'secagem' && secagem.dadosTabela?.length"></b-form-select>
               </b-col>
            </b-row>
            <b-row>
               <b-col cols="12">
                  <b-table class="mt-2" thead-class="text-center" sort-by="data" small striped bordered responsive :filter="filtroLote" :filter-function="filterFunction" :items="secagem.dadosTabela" :fields="fields" v-if="filtroGrafico == 'secagem' && secagem.dadosTabela?.length" style="max-height: 300px"> </b-table>
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
                        <small class="valor">{{ formatarProduto(parametro?.CUL) }}</small>
                     </b-list-group-item>
                     <b-list-group-item class="d-flex justify-content-between">
                        <b-badge variant="primary" class="valor mr-1">Umidade Objetivo</b-badge>
                        <small class="valor text-nowrap">{{ parametro?.UO || '-' }} %</small>
                     </b-list-group-item>
                  </b-list-group>
               </b-col>
            </b-row>
            <b-row v-if="filtroGrafico == 'parametros' && !this.isDataExpirada()" class="m-2">
               <b-col cols="12" sm="12" md="6" lg="4" class="p-1" v-for="chave in chaves" :key="chave">
                  <div class="card text-center">
                     <div class="bg-transparent card-header pt-0 border-0">
                        <h1 class="h1 font-weight-normal text-primary text-center mb-0">
                           <span class="h5 text-muted ml-2">{{ chave }}</span>
                        </h1>
                     </div>
                     <div class="card-body pt-0 pb-3">
                        <b-row>
                           <b-col cols="12">
                              <span class="float-left"><b>Máximo</b></span>
                              <span v-if="chave.startsWith('T')" class="float-right">{{ parametro?.[`TA${chave.substr(1, 4)}`] }} °C</span>
                              <span v-if="chave.startsWith('P')" class="float-right">{{ parametro?.[`PA${chave.substr(1, 4)}`] }} mmCa</span>
                           </b-col>
                           <b-col>
                              <hr class="m-2" />
                           </b-col>
                           <b-col cols="12" v-if="chave.startsWith('T')">
                              <span class="float-left"><b>Operacional</b></span>
                              <span class="float-right">{{ parametro?.[`TO${chave.substr(1, 4)}`] }} °C</span>
                           </b-col>
                           <b-col cols="12" v-if="chave.startsWith('P')">
                              <span class="float-left"><b>&nbsp;</b></span>
                              <span class="float-right">&nbsp;</span>
                           </b-col>
                           <b-col>
                              <hr class="m-2" />
                           </b-col>
                           <b-col cols="12">
                              <span class="float-left"><b>Mínimo</b></span>
                              <span v-if="chave.startsWith('T')" class="float-right">{{ parametro?.[`TB${chave.substr(1, 4)}`] }} °C</span>
                              <span v-if="chave.startsWith('P')" class="float-right">{{ parametro?.[`PB${chave.substr(1, 4)}`] }} mmCa</span>
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
                        <b-th colspan="2" class="text-center">Tempo de Acionamento no período</b-th>
                     </b-tr>
                  </b-thead>
                  <b-tbody>
                     <b-tr>
                        <b-th>Nível máximo</b-th>
                        <b-td>{{ this.acionamento?.maximoTempo }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-th>Presença 1</b-th>
                        <b-td>{{ this.acionamento?.presenca1Tempo }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-th>Presença 2</b-th>
                        <b-td>{{ this.acionamento?.presenca2Tempo }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-th>Nível mínimo</b-th>
                        <b-td>{{ this.acionamento?.minimoTempo }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-th>Captação pó</b-th>
                        <b-td>{{ this.acionamento?.captacaoTempo }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-th>Transportador</b-th>
                        <b-td>{{ this.acionamento?.transportadorTempo }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-th>Descarga</b-th>
                        <b-td>{{ this.acionamento?.valvulaTempo }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-th>Carga</b-th>
                        <b-td>{{ this.acionamento?.elevadorTempo }} h</b-td>
                     </b-tr>
                     <b-tr>
                        <b-th>Ventilador</b-th>
                        <b-td>{{ this.acionamento?.ventiladorTempo }} h</b-td>
                     </b-tr>
                  </b-tbody>
               </b-table-simple>
            </b-col>
         </b-row>
      </b-overlay>
   </div>
</template>

<script>
import client from '@/api'
import * as echarts from 'echarts'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'SecadorHorbachGrafico',
   props: {
      filtroGrafico: String,
      tempoAtualizacao: Number,
      statusEquipamento: String,
      dataInicial: String,
      dataFinal: String
   },
   emits: ['update:dataInicial', 'update:dataFinal'],
   data() {
      return {
         chartInstance: null,
         resizeObserver: null,
         opcoesDoGrafico: {},
         idSecador: null,
         buscandoTemperaturas: false,
         buscandoPressoes: false,
         buscandoUmidades: false,
         buscandoSecagem: false,
         buscandoParametro: false,
         buscandoAcionamento: false,
         temperaturas: {},
         pressoes: {},
         umidades: {},
         secagem: {},
         parametro: {},
         acionamento: {},
         datasOperacao: [],
         variavel: null,
         modo: 'operacao',
         filtroLote: null,
         datas: [],
         chaves: ['T1', 'T2', 'T3', 'T4', 'P1', 'P2'],
         fields: [
            { key: 'data', label: 'Data', formatter: 'formatarData', sortable: true },
            { key: 'lote', label: 'Lote' },
            { key: 'origem', label: 'Origem' },
            { key: 'destino', label: 'Destino' },
            { key: 'umEntrada', label: 'Um Inicial' },
            { key: 'umSaida', label: 'Um Saída' },
            { key: 'temp', label: 'Temp' }
         ],
         verificacaoConfig: [
            { objeto: 'temperaturas', props: ['t1', 't2', 't3', 't4'] },
            { objeto: 'pressoes', props: ['p1', 'p2'] },
            { objeto: 'secagem', props: ['uo', 'us'] },
            { objeto: 'acionamento', props: ['maximo', 'presenca1', 'presenca2', 'minimo', 'ventilador', 'elevador', 'valvula', 'transportador', 'captacao'] }
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
      optionsLote() {
         if (!this.secagem.dadosTabela?.length) return [{ value: null, text: 'Filtrar Lote' }]
         const lotesUnicos = [...new Set(this.secagem.dadosTabela.map((a) => a.lote))]
         return [{ value: null, text: 'Filtrar Lote' }, ...lotesUnicos.map((lote) => ({ value: lote, text: lote }))]
      }
   },

   mounted() {
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
         } else if (filtro == 'secagem') {
            this.buscarSecagem()
         } else if (filtro == 'parametros') {
            this.buscarParametro()
         } else if (filtro == 'acionamentos') {
            this.buscarAcionamento()
         } else {
            this.opcoesDoGrafico = {}
         }
      },
      async buscarTemperaturas() {
         if (!this.idSecador) {
            return
         }
         this.buscandoTemperaturas = true
         const dados = await client.get(`/secador/horbach/buscartemperatura/${this.idSecador}?inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
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
            this.acionamento = {}
            this.construirGrafico(this.temperaturas)
            this.datasOperacao = this.temperaturas.datasOperacao
         }
      },
      async buscarPressoes() {
         if (!this.idSecador) {
            return
         }
         this.buscandoPressoes = true
         const dados = await client.get(`/secador/horbach/buscarpressao/${this.idSecador}?inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
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
            this.acionamento = {}
            this.construirGrafico(this.pressoes)
         }
      },
      async buscarUmidades() {
         if (!this.idSecador) {
            return
         }
         this.buscandoUmidades = true
         const dados = await client.get(`/secador/horbach/buscarumidade/${this.idSecador}?inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
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
            this.temperaturas = {}
            this.pressoes = {}
            this.acionamento = {}
            this.construirGrafico(this.umidades)
         }
      },
      async buscarSecagem() {
         if (!this.idSecador) {
            return
         }
         this.buscandoSecagem = true
         const dados = await client.get(`/secador/horbach/buscarsecagem/${this.idSecador}?inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar secagem. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoSecagem = false
         })
         this.buscandoSecagem = false
         if (dados && dados.data) {
            this.secagem = dados.data
            this.umidades = {}
            this.temperaturas = {}
            this.pressoes = {}
            this.acionamento = {}
            this.construirGrafico(this.secagem)
         }
      },
      async buscarParametro() {
         if (!this.idSecador) {
            return
         }
         this.buscandoParametro = true
         const dados = await client.get(`/secador/horbach/buscarparametro/${this.idSecador}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar parâmetros. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoParametro = false
         })
         this.buscandoParametro = false
         if (dados && dados.data) {
            this.parametro = dados.data
            this.secagem = {}
            this.umidades = {}
            this.temperaturas = {}
            this.pressoes = {}
            this.acionamento = {}
         }
      },
      async buscarAcionamento() {
         if (!this.idSecador) {
            return
         }
         this.buscandoAcionamento = true
         const dados = await client.get(`/secador/horbach/buscaracionamento/${this.idSecador}?inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar acionamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoAcionamento = false
         })
         this.buscandoAcionamento = false
         if (dados && dados.data) {
            this.acionamento = dados.data
            this.parametro = {}
            this.secagem = {}
            this.umidades = {}
            this.temperaturas = {}
            this.pressoes = {}
            this.construirGrafico(this.acionamento)
         }
      },
      construirGrafico(dados) {
         let seriesGrafico = []
         let legendaGrafico = []
         let legendaSelecionada = {}
         let unidadeGrafico = ''
         let unidadeVariavel = ''

         if (this.filtroGrafico == 'temperaturas') {
            let chavesTemperatura = ['t1', 't2', 't2a', 't2b', 't2c', 't2d', 't3', 't3a', 't3b', 't3c', 't3d', 't4']
            if (verificarPerfilOperacao(['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL'])) {
               chavesTemperatura = ['t1', 't2', 't3', 't4']
            }

            legendaGrafico = chavesTemperatura.map((item) => item.toUpperCase())
            legendaSelecionada = { T2A: false, T2B: false, T2C: false, T2D: false, T3A: false, T3B: false, T3C: false, T3D: false }
            unidadeGrafico = 'T(°C)'
            unidadeVariavel = '°C'
            seriesGrafico = chavesTemperatura.map((chave) => ({
               name: chave.toUpperCase(),
               type: 'line',
               showSymbol: false,
               data: dados[chave],
               tooltip: { valueFormatter: (value) => value + ' °C' }
            }))
         } else if (this.filtroGrafico == 'pressões') {
            legendaGrafico = ['P1', 'P2']
            unidadeGrafico = 'P(mmCa)'
            unidadeVariavel = 'mmCa'
            seriesGrafico = [
               { name: 'P1', type: 'line', showSymbol: false, data: dados?.p1, tooltip: { valueFormatter: (value) => value + ' mmCa' } },
               { name: 'P2', type: 'line', showSymbol: false, data: dados?.p2, tooltip: { valueFormatter: (value) => value + ' mmCa' } }
            ]
         } else if (this.filtroGrafico == 'umidades') {
            legendaGrafico = ['UE', 'US']
            unidadeGrafico = 'U(%)'
            unidadeVariavel = '%'
            seriesGrafico = [
               { name: 'UE', type: 'line', showSymbol: false, data: dados?.ue, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'US', type: 'line', showSymbol: false, data: dados?.us, tooltip: { valueFormatter: (value) => value + ' %' } }
            ]
         } else if (this.filtroGrafico == 'secagem') {
            let markAreasGrafico = []
            const adicionarMarkArea = (dados, cor) => {
               if (!dados) return
               dados.forEach((item) => {
                  markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
               })
            }

            adicionarMarkArea(this.secagem.operacoes?.desligado, 'transparent')
            adicionarMarkArea(this.secagem.operacoes?.descarga, 'transparent')
            adicionarMarkArea(this.secagem.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
            adicionarMarkArea(this.secagem.operacoes?.carga, 'transparent')

            legendaGrafico = ['Umidade saída', 'Umidade objetivo']
            unidadeGrafico = 'U(%)'
            unidadeVariavel = '%'
            seriesGrafico = [
               { name: 'Umidade saída', type: 'line', showSymbol: false, data: dados?.us, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'Umidade objetivo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: dados?.uo, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: '', type: 'line', showSymbol: false, lineStyle: { opacity: 0 }, data: this.secagem.dadosOperacao, markArea: { data: markAreasGrafico }, tooltip: { show: false } }
            ]
         } else if (this.filtroGrafico == 'acionamentos') {
            let markAreasGrafico = []
            const adicionarMarkArea = (dados, cor) => {
               if (!dados) return
               dados.forEach((item) => {
                  markAreasGrafico.push([{ xAxis: `${item.inicio}` }, { xAxis: `${item.fim}`, itemStyle: { color: cor } }])
               })
            }

            adicionarMarkArea(this.acionamento.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
            adicionarMarkArea(this.acionamento.operacoes?.descarga, 'rgba(254, 254, 49, 0.3)')
            adicionarMarkArea(this.acionamento.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
            adicionarMarkArea(this.acionamento.operacoes?.carga, 'rgba(64, 206, 253, 0.3)')

            legendaGrafico = ['Nível máximo', 'Presença 1', 'Presença 2', 'Nível Mínimo', 'Captação pó', 'Transportador', 'Descarga', 'Elevador', 'Ventilador']
            unidadeGrafico = ''
            unidadeVariavel = ''
            seriesGrafico = [
               { name: 'Nível máximo', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#5CC982' }, itemStyle: { color: '#5CC982' }, data: this.acionamento.maximo },
               { name: 'Presença 1', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#3FBF6B' }, itemStyle: { color: '#3FBF6B' }, data: this.acionamento.presenca1 },
               { name: 'Presença 2', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#2E9F5E' }, itemStyle: { color: '#2E9F5E' }, data: this.acionamento.presenca2 },
               { name: 'Nível Mínimo', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#258050' }, itemStyle: { color: '#258050' }, data: this.acionamento.minimo },
               { name: 'Captação pó', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#A7D8F0' }, itemStyle: { color: '#A7D8F0' }, data: this.acionamento.captacao },
               { name: 'Transportador', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#72BFE5' }, itemStyle: { color: '#72BFE5' }, data: this.acionamento.transportador },
               { name: 'Descarga', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#3CA6DA' }, itemStyle: { color: '#3CA6DA' }, data: this.acionamento.valvula },
               { name: 'Elevador', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#1E6FBA' }, itemStyle: { color: '#1E6FBA' }, data: this.acionamento.elevador },
               { name: 'Ventilador', type: 'line', showSymbol: false, lineStyle: { width: 20, color: '#18559a' }, itemStyle: { color: '#18559a' }, data: this.acionamento.ventilador },
               { name: '', type: 'line', showSymbol: false, lineStyle: { opacity: 0 }, markArea: { data: markAreasGrafico }, tooltip: { show: false } }
            ]
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
            toolbox: { top: -5, left: -5, orient: 'horizontal', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
            title: { text: '' },
            tooltip: { trigger: 'axis', formatter: formatTooltip },
            legend: { textStyle: { color: '#6c727a' }, top: 15, data: legendaGrafico, type: 'scroll', orient: 'horizontal', selected: legendaSelecionada },
            grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
            xAxis: { type: 'time', boundaryGap: false, axisLabel: { formatter: (value) => echarts.format.formatTime('dd/MM hh:mm', value) } },
            yAxis: { type: 'value', name: unidadeGrafico, splitNumber: 10, axisLabel: { show: this.filtroGrafico == 'acionamentos' ? false : true } },
            dataZoom: [{ type: 'inside', start: 0 }, { start: 0 }],
            series: seriesGrafico
         }
      },
      graficoVariavel(variavel) {
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

         if (variavel.startsWith('t')) {
            if (this.modo === 'operacao') {
               adicionarMarkArea(this.temperaturas.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
               adicionarMarkArea(this.temperaturas.operacoes?.descarga, 'rgba(254, 254, 49, 0.3)')
               adicionarMarkArea(this.temperaturas.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
               adicionarMarkArea(this.temperaturas.operacoes?.carga, 'rgba(64, 206, 253, 0.3)')
            }

            if (variavel.substr(1, 4) == 1 || variavel.substr(1, 4) == 4 || verificarPerfilOperacao(['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL'])) {
               unidadeGrafico = 'T(°C)'
               unidadeVariavel = '°C'
               legendaGrafico = [variavel.toUpperCase(), 'Máximo', 'Mínimo']

               seriesGrafico = [
                  { name: variavel.toUpperCase(), type: 'line', showSymbol: false, data: this.temperaturas[`t${variavel.substr(1, 4)}`], markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: 'Máximo', type: 'line', showSymbol: false, lineStyle: { color: 'red', type: 'dashed' }, itemStyle: { color: 'red' }, data: this.temperaturas[`ta${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: 'Mínimo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.temperaturas[`tb${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' °C' } }
               ]
               media = (this.temperaturas[`t${variavel.substr(1, 4)}`].filter((d) => d[1] !== '-' && !isNaN(parseFloat(d[1]))).reduce((acc, curr) => acc + parseFloat(curr[1]), 0) / this.temperaturas[`t${variavel.substr(1, 4)}`].filter((d) => d[1] !== '-' && !isNaN(parseFloat(d[1]))).length).toFixed(1)
            } else {
               unidadeGrafico = 'T(°C)'
               unidadeVariavel = '°C'
               legendaGrafico = [`T${variavel.substr(1, 4)}`, `T${variavel.substr(1, 4)}A`, `T${variavel.substr(1, 4)}B`, `T${variavel.substr(1, 4)}C`, `T${variavel.substr(1, 4)}D`, 'Máximo', 'Mínimo']

               seriesGrafico = [
                  { name: `T${variavel.substr(1, 4)}`, type: 'line', showSymbol: false, data: this.temperaturas[`t${variavel.substr(1, 4)}`], markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: `T${variavel.substr(1, 4)}A`, type: 'line', showSymbol: false, data: this.temperaturas[`t${variavel.substr(1, 4)}a`], tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: `T${variavel.substr(1, 4)}B`, type: 'line', showSymbol: false, data: this.temperaturas[`t${variavel.substr(1, 4)}b`], tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: `T${variavel.substr(1, 4)}C`, type: 'line', showSymbol: false, data: this.temperaturas[`t${variavel.substr(1, 4)}c`], tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: `T${variavel.substr(1, 4)}D`, type: 'line', showSymbol: false, data: this.temperaturas[`t${variavel.substr(1, 4)}d`], tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: 'Máximo', type: 'line', showSymbol: false, lineStyle: { color: 'red', type: 'dashed' }, itemStyle: { color: 'red' }, data: this.temperaturas[`ta${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' °C' } },
                  { name: 'Mínimo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.temperaturas[`tb${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' °C' } }
               ]
               if (verificarPerfilOperacao(['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL'])) {
                  legendaGrafico = [`T${variavel.substr(1, 4)}`, 'Máximo', 'Mínimo']
                  seriesGrafico = [
                     { name: `T${variavel.substr(1, 4)}`, type: 'line', showSymbol: false, data: this.temperaturas[`t${variavel.substr(1, 4)}`], markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' °C' } },
                     { name: 'Máximo', type: 'line', showSymbol: false, lineStyle: { color: 'red', type: 'dashed' }, itemStyle: { color: 'red' }, data: this.temperaturas[`ta${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' °C' } },
                     { name: 'Mínimo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.temperaturas[`tb${variavel.substr(1, 4)}`], tooltip: { valueFormatter: (value) => value + ' °C' } }
                  ]
               }
               media = (this.temperaturas[`t${variavel.substr(1, 4)}`].filter((d) => d[1] !== '-' && !isNaN(parseFloat(d[1]))).reduce((acc, curr) => acc + parseFloat(curr[1]), 0) / this.temperaturas[`t${variavel.substr(1, 4)}`].filter((d) => d[1] !== '-' && !isNaN(parseFloat(d[1]))).length).toFixed(1)
            }
         } else if (variavel.startsWith('p')) {
            if (this.modo === 'operacao') {
               adicionarMarkArea(this.pressoes.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
               adicionarMarkArea(this.pressoes.operacoes?.descarga, 'rgba(254, 254, 49, 0.3)')
               adicionarMarkArea(this.pressoes.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
               adicionarMarkArea(this.pressoes.operacoes?.carga, 'rgba(64, 206, 253, 0.3)')
            }
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
            if (this.modo === 'operacao') {
               adicionarMarkArea(this.umidades.operacoes?.desligado, 'rgba(194, 192, 192, 0.3)')
               adicionarMarkArea(this.umidades.operacoes?.descarga, 'rgba(254, 254, 49, 0.3)')
               adicionarMarkArea(this.umidades.operacoes?.secagem, 'rgba(77, 205, 60, 0.3)')
               adicionarMarkArea(this.umidades.operacoes?.carga, 'rgba(64, 206, 253, 0.3)')
            }
            unidadeGrafico = 'U(%)'
            unidadeVariavel = '%'
            legendaGrafico = [variavel.toUpperCase(), 'Objetivo']
            seriesGrafico = [
               { name: variavel.toUpperCase(), type: 'line', showSymbol: false, data: this.umidades[variavel], markArea: { data: markAreasGrafico }, tooltip: { valueFormatter: (value) => value + ' %' } },
               { name: 'Objetivo', type: 'line', showSymbol: false, lineStyle: { color: 'lightskyblue', type: 'dashed' }, itemStyle: { color: 'lightskyblue' }, data: this.umidades.uo, tooltip: { valueFormatter: (value) => value + ' %' } }
            ]
         }
         this.opcoesDoGrafico = {
            toolbox: { top: -5, left: -5, orient: 'horizontal', feature: { saveAsImage: { title: 'Salvar Imagem' }, dataZoom: { yAxisIndex: 'none' } } },
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
            legend: { textStyle: { color: '#6c727a' }, top: 15, data: legendaGrafico, type: 'scroll', orient: 'horizontal' },
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
      abrirPagina() {
         const rota = this.$router.resolve({ name: 'lotes' })
         window.open(rota.href, '_blank')
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
      filterFunction(row, filter) {
         if (filter === null) return true
         return row.lote === filter
      },
      formatarProduto(value) {
         const produto = {
            1: 'Soja',
            2: 'Milho',
            3: 'Trigo',
            4: 'Arroz',
            6: 'Outros',
            7: 'Semente Soja',
            8: 'Semente Milho',
            9: 'Semente Trigo',
            10: 'Semente Arroz',
            11: 'Outras Sementes'
         }
         return produto[value] || '-'
      },
      isDataExpirada() {
         if (!this.parametro || !this.parametro.DAT || this.statusEquipamento === 'OF') {
            return true
         }
         const dataDados = this.$moment(this.parametro.DAT, 'DD/MM/YYYY HH:mm:ss')
         const dataAtual = this.$moment()
         const diferencaHoras = dataAtual.diff(dataDados, 'hours')
         return diferencaHoras > 1
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
         const dados = await client.get(`/secador/horbach/buscardatassecagem/${this.idSecador}`).catch((err) => {
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
      verificarPerfilOperacao
   },

   watch: {
      opcoesDoGrafico(novasOpcoes) {
         if (novasOpcoes) {
            this.initializeChart()
            this.clearChart()
            this.updateChart(novasOpcoes)
         }
      },
      tempoAtualizacao(newValue) {
         if (newValue) {
            this.startInterval(newValue)
         } else {
            this.stopInterval()
         }
      },
      filtroGrafico() {
         this.acionaBusca(this.filtroGrafico)
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

::-webkit-scrollbar-thumb:vertical {
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