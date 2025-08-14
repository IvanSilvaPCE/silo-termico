<template>
   <div>
      <div class="midde_cont">
         <div class="container-fluid">
            <div class="row column_title">
               <div class="col-md-12">
                  <div class="page_title">
                     <b-row>
                        <b-col sm="12" md="10" lg="10" class="text-center text-md-left">
                           <h2>Log de eventos | {{ this.nomeUnidade }}</h2>
                        </b-col>
                        <b-col sm="12" md="2" lg="2" class="text-center text-md-right">
                           <b-button variant="outline-primary" @click="voltar()"><b-icon icon="caret-left"></b-icon>Voltar</b-button>
                        </b-col>
                     </b-row>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div class="white_shd full margin_bottom_30">
         <div class="map_section padding_infor_info">
            <div class="map m_style1">
               <b-row>
                  <b-col sm="6" lg="4" class="mb-2">
                     <b-overlay :show="overlayEquipamentos" rounded="sm">
                        <v-select v-model="id_equipamento" :options="optionsEquipamentos" :reduce="(equipamento) => equipamento.value">
                           <template #no-options="">Nenhuma correspondência</template>
                        </v-select>
                     </b-overlay>
                  </b-col>
                  <b-col sm="6" lg="4" class="mb-2" v-if="id_equipamento != 'null'">
                     <b-overlay :show="overlayAlarmes" rounded="sm">
                        <v-select v-model="id_alarme" :options="optionsAlarmes" :reduce="(alarme) => alarme.value">
                           <template #no-options="">Nenhuma correspondência</template>
                        </v-select>
                     </b-overlay>
                  </b-col>
                  <b-col sm="6" lg="4" class="mb-2">
                     <v-select v-model="ativo" :options="optionsAtivo" :reduce="(ativo) => ativo.value">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                  </b-col>
                  <!-- <b-col sm="6" lg="4" class="mb-2" v-if="verificarPerfilOperacao(['ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'])">
                     <b-overlay :show="overlayProdutos" rounded="sm">
                        <v-select v-model="id_produto" :options="optionsProdutos" :reduce="(produto) => produto.value">
                           <template #no-options="">Nenhuma correspondência</template>
                        </v-select>
                     </b-overlay>
                  </b-col> -->
                  <b-col sm="6" lg="4" class="mb-2" v-if="id_produto != 'null' && verificarPerfilOperacao(['ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'])">
                     <v-select v-model="unidades" :options="optionsUnidades" :reduce="(unidades) => unidades.value">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                  </b-col>
                  <b-col sm="6" lg="4" class="mb-2" v-if="verificarPerfilOperacao(['SUPORTTECN', 'ADMINPORTA'])">
                     <v-select v-model="assistencia" :options="optionsAssistencia" :reduce="(assistencia) => assistencia.value">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                  </b-col>
                  <b-col sm="6" lg="4" class="mb-2" v-if="this.logGrafico.categoria == 1">
                     <v-select v-model="operacao" :options="optionsOperacao" :reduce="(operacao) => operacao.value">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                  </b-col>
                  <b-col sm="6" lg="4" class="mb-2">
                     <b-button variant="outline-secondary" @click="resetarFiltros()" :disabled="desabilitarResetar()">
                        Limpar filtros
                        <b-icon icon="x-circle"></b-icon>
                     </b-button>
                  </b-col>
               </b-row>
               <hr />
               <b-overlay :show="buscandoLogGrafico" rounded="sm">
                  <b-row class="justify-content-center">
                     <b-col sm="12" lg="2" v-if="id_equipamento != 'null'">
                        <v-select v-model="data_pesquisa" :options="optionsDatas" :reduce="(data) => data.value">
                           <template #no-options="">Nenhuma correspondência</template>
                        </v-select>
                     </b-col>
                  </b-row>
                  <b-row>
                     <b-col>
                        <div ref="containerCalendario" style="overflow-x: auto">
                           <div ref="chartCalendario" class="mb-0" style="width: 100%; height: 300px; min-width: 1000px"></div>
                        </div>
                     </b-col>
                  </b-row>
               </b-overlay>
               <b-row>
                  <b-col sm="12" md="6">
                     <div ref="containerCriticidade">
                        <b-overlay :show="buscandoLogGrafico" rounded="sm">
                           <div ref="chartCriticidade" class="mt-0" style="width: 100%; height: 400px"></div>
                        </b-overlay>
                     </div>
                  </b-col>
                  <b-col md="6" class="mt-4" v-if="logGrafico.alarmes">
                     <b-row>
                        <b-col md="6">
                           <b-card class="text-center mb-3" v-if="id_alarme == 'null'">
                              <template #header>
                                 <p class="texto mb-0">Filtro de criticidade</p>
                              </template>
                              <div class="d-flex justify-content-between align-items-center">
                                 <p class="texto flex-grow-1 text-center">{{ this.criticidadeSelecionada || 'Nenhum filtro' }}</p>
                                 <b-button v-if="criticidadeSelecionada" variant="outline-secondary" @click="limparFiltro()" v-b-tooltip.hover title="Limpar filtro">
                                    <b-icon icon="x-circle"></b-icon>
                                 </b-button>
                              </div>
                           </b-card>
                        </b-col>
                        <b-col md="6">
                           <b-card class="text-center mb-3">
                              <template #header>
                                 <p class="texto mb-0">Total de eventos {{ criticidadeSelecionada.toLowerCase() }}</p>
                              </template>
                              <b-overlay :show="buscandoLogGrafico" rounded="sm">
                                 <p class="texto">{{ this.totalAlarmes }}</p>
                              </b-overlay>
                           </b-card>
                        </b-col>
                     </b-row>
                     <b-row>
                        <b-col md="6">
                           <b-card class="text-center mb-3" v-if="id_alarme == 'null'">
                              <template #header>
                                 <p class="texto mb-0">Tempo eventos crítico</p>
                              </template>
                              <b-overlay :show="buscandoLogGrafico" rounded="sm">
                                 <p class="texto">{{ this.logGrafico.tempo_critico }}</p>
                              </b-overlay>
                           </b-card>
                        </b-col>
                        <b-col md="6">
                           <b-card class="text-center mb-3">
                              <template #header>
                                 <p class="texto mb-0">Tempo total eventos</p>
                              </template>
                              <b-overlay :show="buscandoLogGrafico" rounded="sm">
                                 <p class="texto">{{ this.logGrafico.tempo_total }}</p>
                              </b-overlay>
                           </b-card>
                        </b-col>
                     </b-row>
                  </b-col>
               </b-row>
               <b-row v-if="buscandoLogDia || logDia.length">
                  <b-col class="mt-4">
                     <p class="mb-4 mt-3 texto">Eventos do dia {{ formatarDataSemHora(this.dataSelecionada) }}</p>
                     <b-table :items="logDia" :fields="fields" :busy="buscandoLogDia" :current-page="currentPage" :per-page="perPage" select-mode="single" responsive="sm" sort-by="tp_criticidade_alarme" sort-desc hover selectable striped>
                        <template #table-busy>
                           <div class="text-center text-danger my-2">
                              <b-spinner class="align-middle mr-1"></b-spinner>
                              <strong>Carregando...</strong>
                           </div>
                        </template>
                        <template #cell(tp_criticidade_alarme)="row">
                           <b-badge class="p-2" :variant="criticidade(row.item.tp_criticidade_alarme)">{{ formatarCriticidade(row.item.tp_criticidade_alarme) }}</b-badge>
                        </template>
                        <template #cell(status)="row">
                           <span>{{ !row.item.dt_fim ? 'Ativo' : 'Restaurado' }}</span>
                        </template>
                        <template #cell(tempo)="row">
                           <span>{{ calculaData(row.item.dt_inicio, row.item.dt_fim) }}</span>
                        </template>
                     </b-table>
                     <b-pagination v-if="buscandoLogDia || logDia.length" v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="right" class="my-0"></b-pagination>
                  </b-col>
               </b-row>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import * as echarts from 'echarts'
import client from '@/api'
import { mapState, mapActions } from 'vuex'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'LogEventoView',
   data() {
      return {
         ativo: 'null',
         unidades: 'n',
         id_equipamento: 'null',
         id_alarme: 'null',
         id_produto: 'null',
         assistencia: 'null',
         operacao: 'null',
         data_pesquisa: this.$moment().format('YYYY'),
         graficoCalendario: {},
         graficoCriticidade: {},
         buscandoLogGrafico: false,
         buscandoLogDia: false,
         overlayAlarmes: false,
         overlayProdutos: false,
         overlayDatas: false,
         produto: [],
         logGrafico: [],
         logDia: [],
         equipamento: [],
         alarme: [],
         datas: [],
         overlayEquipamentos: false,
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         dataSelecionada: null,
         criticidadeSelecionada: '',
         valorCriticidade: '',
         fields: [
            { key: 'tp_criticidade_alarme', label: 'Criticidade' },
            { key: 'status', label: 'Status' },
            { key: 'ds_alarme', label: 'Alarme' },
            { key: 'tempo', label: 'Duração' },
            { key: 'dt_inicio', label: 'Início', formatter: 'formatarData' },
            { key: 'dt_fim', label: 'Fim', formatter: 'formatarData' }
         ],
         optionsAtivo: [
            { value: 'null', label: 'Eventos ativos' },
            { value: 's', label: 'Sim' },
            { value: 'n', label: 'Não' }
         ],
         optionsUnidades: [
            { value: 'null', label: 'Ver todas unidades' },
            { value: 's', label: 'Sim' },
            { value: 'n', label: 'Não' }
         ],
         optionsAssistencia: [
            { value: 'null', label: 'Eventos assistência' },
            { value: 's', label: 'Sim' },
            { value: 'n', label: 'Não' }
         ],
         optionsOperacao: [
            { value: 'null', label: 'Eventos em operação' },
            { value: 's', label: 'Sim' },
            { value: 'n', label: 'Não' }
         ]
      }
   },

   computed: {
      ...mapState('unidade', ['unidade', 'nomeUnidade']),
      maiorValor() {
         let maximo = this.logGrafico.alarmes.reduce((maior, item) => {
            return Math.max(maior, item[1])
         }, 0)
         let arredondado = Math.ceil(maximo / 10) * 10
         return arredondado
      },
      optionsEquipamentos() {
         const options = [
            {
               value: 'null',
               label: 'Selecione um equipamento'
            }
         ]
         return options.concat(
            this.equipamento
               .filter((equipamento) => equipamento.equipamento !== null)
               .map((equipamento) => ({
                  value: equipamento.id_equipamento,
                  label: equipamento.ds_equipamento
               }))
         )
      },
      optionsAlarmes() {
         const options = [
            {
               value: 'null',
               label: 'Eventos'
            }
         ]
         return options.concat(
            this.alarme
               .filter((alarme) => alarme.alarme !== null)
               .map((alarme) => ({
                  value: alarme.id_alarme,
                  label: this.formatarCriticidade(alarme.tp_criticidade) + ' | ' + alarme.ds_alarme
               }))
         )
      },
      optionsProdutos() {
         const options = [
            {
               value: 'null',
               label: 'Produtos'
            }
         ]
         return options.concat(
            this.produto
               .filter((produto) => produto.produto !== null)
               .map((produto) => ({
                  value: produto.id_produto,
                  label: produto.nm_produto
               }))
         )
      },
      optionsDatas() {
         return this.datas.map((ano) => ({
            value: ano,
            label: ano.toString()
         }))
      },
      totalAlarmes() {
         if (this.logGrafico && this.logGrafico.alarmes && Array.isArray(this.logGrafico.alarmes)) {
            return this.logGrafico.alarmes.reduce((total, item) => {
               return total + item[1]
            }, 0)
         } else {
            return 0
         }
      },
      equipamentos() {
         return this.optionsEquipamentos.map((item) => item.value).filter((value) => value !== 'null')
      },
      idProdutos() {
         let id_produtos = this.equipamento.map((obj) => obj.id_produto)
         return [...new Set(id_produtos)]
      }
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade', 'retrieveNomeUnidade']),
      verificaPerfil() {
         if (!verificarPerfilOperacao(['USUARIOLOC', 'ADMINLOCAL']) && (!this.unidade || this.unidade == '' || this.unidade === undefined)) {
            this.$router.push('/mapa')
         }
      },
      async buscarLogGrafico(criticidade) {
         this.buscandoLogGrafico = true
         const dados = await client.get(`/log_evento/${this.id_equipamento}?criticidade=${criticidade}&alarme=${this.id_alarme}&ativo=${this.ativo}&equipamentos=[${this.equipamentos}]&assistencia=${this.assistencia}&data=${this.data_pesquisa}&operacao=${this.operacao}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar log de eventos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoLogGrafico = false
         })
         this.buscandoLogGrafico = false
         if (dados && dados.data) {
            this.logGrafico = dados.data
            this.construirGraficoCalendario(dados.data.alarmes)
            this.construirGraficoCriticidade(dados.data.criticidades)
         }
      },
      async buscarLogProduto() {
         if (this.id_produto == 'null') return
         this.buscandoLogGrafico = true
         let equipamento = this.equipamentos
         if (this.unidades != 'n' || this.unidades != 'null') {
            equipamento = 'null'
         }
         const dados = await client.get(`/log_evento/produto?produto=${this.id_produto}&equipamentos=[${equipamento}]`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar log de eventos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoLogGrafico = false
         })
         this.buscandoLogGrafico = false
         if (dados && dados.data) {
            this.logGrafico = dados.data
            this.construirGraficoCalendario(dados.data.alarmes)
            this.construirGraficoCriticidade(dados.data.criticidades)
         }
      },
      async buscarEquipamentos() {
         if (!this.unidade) return
         this.overlayEquipamentos = true
         const dados = await client.get(`/log_evento/buscarequipamento/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEquipamentos = false
         this.equipamento = dados.data
         this.buscarProdutos()
      },
      async buscarProdutos() {
         if (!verificarPerfilOperacao(['ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'])) {
            return
         }
         this.overlayProdutos = true
         const dados = await client.get(`/log_evento/buscarproduto?produtos=[${this.idProdutos}]`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar produtos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayProdutos = false
         this.produto = dados.data
      },
      async buscarAlarmes() {
         this.overlayAlarmes = true
         const dados = await client.get(`/log_evento/buscaralarme/${this.id_equipamento}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar alarmes. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.overlayAlarmes = false
         })
         this.overlayAlarmes = false
         this.alarme = dados.data
      },
      async buscarDatas() {
         if (!this.unidade) return
         this.overlayDatas = true
         const dados = await client.get(`/log_evento/buscardatas/${this.id_equipamento}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar datas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayDatas = false
         this.datas = dados.data
      },
      criticidade(value) {
         if (value == 0) return 'info'
         if (value == 10) return 'primary'
         if (value == 25) return 'warning'
         if (value == 50) return 'danger'
      },
      formatarCriticidade(value) {
         if (value == 0) return 'Alerta'
         if (value == 10) return 'Baixo'
         if (value == 25) return 'Alto'
         if (value == 50) return 'Crítico'
         return value
      },
      formatarData(value) {
         if (!value) return '-'
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
      },
      formatarDataSemHora(value) {
         if (!value) return '-'
         return this.$moment(value, 'YYYY/MM/DD').format('DD/MM/YYYY')
      },
      calculaData(dataInicio, dataFim) {
         if (!dataInicio) return ''
         const inicio = this.$moment(dataInicio, 'YYYY/MM/DD HH:mm:ss')
         const fim = !dataFim ? this.$moment() : this.$moment(dataFim, 'YYYY/MM/DD HH:mm:ss')
         const duracao = this.$moment.duration(fim.diff(inicio))
         const diasEmHoras = Math.floor(duracao.asDays()) * 24
         const horas = duracao.hours() + diasEmHoras
         const minutos = duracao.minutes()
         return `${horas}h ${minutos}min`
      },
      initializeChart() {
         this.chartCalendario = echarts.init(this.$refs.chartCalendario)
         if (this.graficoCalendario) {
            this.chartCalendario.setOption(this.graficoCalendario)
         }
         this.chartCriticidade = echarts.init(this.$refs.chartCriticidade)
         if (this.graficoCriticidade) {
            this.chartCriticidade.setOption(this.graficoCriticidade)
         }
      },
      updateChart(chart, novasOpcoes) {
         if (chart) {
            chart.setOption(novasOpcoes)
         }
      },
      clearChart(chart) {
         if (chart) {
            chart.clear()
         }
      },
      handleResize() {
         if (this.chartCalendario) {
            this.chartCalendario.resize()
         }
         if (this.chartCriticidade) {
            this.chartCriticidade.resize()
         }
      },
      cliqueCalendario(params) {
         if (params.componentType === 'series') {
            this.dataSelecionada = params.data[0]
            this.buscarLogDia(params.data[0])
         }
      },
      cliqueCriticidade(params) {
         this.logDia = []
         if (params.componentType === 'series') {
            const valCriticidade = {
               Crítico: 50,
               Alto: 25,
               Baixo: 10,
               Alerta: 0
            }
            this.criticidadeSelecionada = params.data.name
            this.valorCriticidade = valCriticidade[params.data.name]
            this.buscarLogGrafico(this.valorCriticidade)
         }
      },
      async buscarLogDia(data) {
         this.buscandoLogDia = true
         const dados = await client.get(`/log_evento/dia?equipamento=${this.id_equipamento}&data=${data}&criticidade=${this.valorCriticidade}&alarme=${this.id_alarme}&ativo=${this.ativo}&equipamentos=[${this.equipamentos}]&assistencia=${this.assistencia}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.buscandoLogDia = false
         this.logDia = dados.data
         this.totalRows = this.logDia.length
         window.scrollTo({ top: 1000, behavior: 'smooth' })
      },
      limparFiltro() {
         this.valorCriticidade = ''
         this.buscarLogGrafico()
         this.criticidadeSelecionada = ''
         this.logDia = []
      },
      resetarFiltros() {
         this.id_equipamento = 'null'
         this.id_alarme = 'null'
         this.ativo = 'null'
         this.id_produto = 'null'
         this.unidades = 'n'
         this.assistencia = 'null'
      },
      desabilitarResetar() {
         return !(this.id_equipamento != 'null' || this.id_alarme != 'null' || this.ativo != 'null' || this.id_produto != 'null' || this.unidades != 'n' || this.assistencia != 'null')
      },
      construirGraficoCalendario(dados) {
         if (!dados) return

         this.graficoCalendario = {
            // title: { textStyle: { color: '#6c727a' }, top: 1, left: 'center', text: this.data_pesquisa },
            tooltip: {
               position: 'top',
               appendToBody: true,
               formatter: (p) => {
                  const dateFormat = this.$moment(p.data[0], 'YYYY/MM/DD').format('DD/MM/YYYY')
                  let tooltip = `<div>${dateFormat}</div>`
                  tooltip += `<div>Eventos: ${p.data[1]}</div>`
                  if (this.logGrafico.categoria == 1) {
                     tooltip += `<div>Operação: ${this.logGrafico.datas.includes(p.data[0]) ? 'Sim' : 'Não'}</div>`
                     let grao = this.logGrafico.graos.find((item) => item[0] === p.data[0])
                     tooltip += `<div>Grão: ${grao ? grao[1] : '-'}</div>`
                  }
                  return tooltip
               }
            },
            visualMap: { min: 0, max: this.maiorValor, type: 'piecewise', orient: 'horizontal', left: 'center', top: 30, textStyle: { color: '#6c727a' } },
            calendar: {
               top: 90,
               left: 30,
               right: 30,
               cellSize: ['auto'],
               range: this.data_pesquisa,
               itemStyle: { borderWidth: 0.5 },
               dayLabel: { textStyle: { color: '#6c727a' }, margin: 3, nameMap: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] },
               monthLabel: { textStyle: { color: '#6c727a' }, nameMap: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'] },
               yearLabel: { show: false }
            },
            series: { type: 'heatmap', coordinateSystem: 'calendar', data: dados }
         }
      },
      construirGraficoCriticidade(dados) {
         this.graficoCriticidade = {
            title: { textStyle: { color: '#6c727a' }, top: 20, left: 'center', text: 'Criticidades' },
            tooltip: { trigger: 'item' },
            series: [
               {
                  name: 'Eventos',
                  type: 'pie',
                  radius: ['35%', '70%'],
                  avoidLabelOverlap: false,
                  label: { show: false, position: 'center' },
                  emphasis: { label: { show: true, fontSize: 25, fontWeight: 'bold' } },
                  labelLine: { show: false },
                  data: [
                     { value: dados.critico, name: 'Crítico', itemStyle: { color: '#dc3545' } },
                     { value: dados.alto, name: 'Alto', itemStyle: { color: '#ffc107' } },
                     { value: dados.baixo, name: 'Baixo', itemStyle: { color: '#007bff' } },
                     { value: dados.alerta, name: 'Alerta', itemStyle: { color: '#17a2b8' } }
                  ]
               }
            ]
         }
      },
      voltar() {
         this.$router.push(this.$previousRoute().path)
      },
      verificarPerfilOperacao
   },

   watch: {
      graficoCalendario(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart(this.chartCalendario)
            this.updateChart(this.chartCalendario, novasOpcoes)
         }
      },
      graficoCriticidade(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart(this.chartCriticidade)
            if (this.id_alarme == 'null') {
               this.updateChart(this.chartCriticidade, novasOpcoes)
            }
         }
      },
      id_equipamento(newValue) {
         if (newValue && newValue != 'null') {
            this.criticidadeSelecionada = ''
            this.id_alarme = 'null'
            this.ativo = 'null'
            this.id_produto = 'null'
            this.unidades = 'n'
            this.operacao = 'null'
            this.buscarDatas()
            this.buscarLogGrafico()
            this.buscarAlarmes()
            this.logDia = []
         }
      },
      id_produto(newValue) {
         if (newValue && newValue != 'null') {
            this.criticidadeSelecionada = ''
            this.id_equipamento = 'null'
            this.id_alarme = 'null'
            this.ativo = 'null'
            this.buscarLogProduto()
            this.logDia = []
         }
      },
      id_alarme(newValue) {
         if (newValue && newValue != 'null') {
            this.ativo = 'null'
            this.id_produto = 'null'
            this.unidades = 'n'
            this.buscarLogGrafico()
            this.logDia = []
            this.criticidadeSelecionada = ''
         }
      },
      ativo(newValue) {
         if (newValue && (newValue != 'null' || newValue != 'n')) {
            this.criticidadeSelecionada = ''
            this.id_equipamento = 'null'
            this.id_alarme = 'null'
            this.id_produto = 'null'
            this.unidades = 'null'
            this.operacao = 'null'
            this.buscarLogGrafico()
            this.logDia = []
         }
      },
      unidades(newValue) {
         if (newValue && (newValue != 'null' || newValue != 'n')) {
            this.buscarLogProduto()
            this.logDia = []
            this.criticidadeSelecionada = ''
         }
      },
      assistencia(newValue) {
         if (newValue && newValue != 'null') {
            this.criticidadeSelecionada = ''
            this.id_alarme = 'null'
            this.ativo = 'null'
            this.id_produto = 'null'
            this.unidades = 'n'
            this.buscarLogGrafico()
            this.logDia = []
         }
      },
      operacao(newValue) {
         if (newValue && newValue != 'null') {
            this.buscarLogGrafico()
         }
      },
      data_pesquisa() {
         this.logDia = []
         this.buscarLogGrafico()
      }
   },

   mounted() {
      this.buscarEquipamentos()
      this.retrieveNomeUnidade()
      if (this.graficoCalendario) {
         this.initializeChart()
      }
      this.chartCalendario.on('click', this.cliqueCalendario)
      this.chartCriticidade.on('click', this.cliqueCriticidade)
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(this.$refs.containerCalendario)
      this.resizeObserver.observe(this.$refs.containerCriticidade)
      window.addEventListener('resize', this.handleResize)
      if (this.$route.params.idEquipamento) {
         this.id_equipamento = parseInt(this.$route.params.idEquipamento)
      }
   },

   beforeMount() {
      this.verificaPerfil()
   }
}
</script>

<style scoped>
.texto {
   font-size: 20px;
   font-weight: 500;
   color: black;
}

.titulo {
   font-size: 20px;
   font-weight: 550;
   color: black;
}
</style>