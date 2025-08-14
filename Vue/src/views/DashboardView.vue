<template>
   <div>
      <b-row class="">
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30">
               <div class="couter_icon">
                  <div><i class="fa fa-circle blue_color icone"></i></div>
               </div>
               <b-overlay :show="buscandoEquipamentos" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <p class="head_couter">Equipamentos</p>
                     <p class="total_no">{{ this.equipamentos.equipamentos }}</p>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30">
               <div class="couter_icon">
                  <div><i class="fa fa-circle green_color icone"></i></div>
               </div>
               <b-overlay :show="buscandoEquipamentos" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <div>
                        <p class="head_couter">Online</p>
                        <p class="total_no">{{ this.equipamentos.online }}</p>
                     </div>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30">
               <div class="couter_icon">
                  <div><i class="fa fa-circle grey_color icone"></i></div>
               </div>
               <b-overlay :show="buscandoEquipamentos" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <div>
                        <p class="head_couter">Offline</p>
                        <p class="total_no">{{ this.equipamentos.offline }}</p>
                     </div>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30">
               <div class="couter_icon">
                  <div><i class="fa fa-circle red_color icone"></i></div>
               </div>
               <b-overlay :show="buscandoEquipamentos" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <div>
                        <p class="head_couter">Alerta</p>
                        <p class="total_no">{{ this.equipamentos.alerta }}</p>
                     </div>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30">
               <div class="couter_icon">
                  <div><i class="fa fa-circle yellow_color icone"></i></div>
               </div>
               <b-overlay :show="buscandoEquipamentos" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <div>
                        <p class="head_couter">Manutenção</p>
                        <p class="total_no">{{ this.equipamentos.manutencao }}</p>
                     </div>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30">
               <div class="couter_icon">
                  <div><i class="fa fa-circle black_color icone"></i></div>
               </div>
               <b-overlay :show="buscandoEquipamentos" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <div>
                        <p class="head_couter">Configuração</p>
                        <p class="total_no">{{ this.equipamentos.configuracao }}</p>
                     </div>
                  </div>
               </b-overlay>
            </div>
         </b-col>
      </b-row>
      <b-row>
         <b-col lg="4">
            <div class="white_shd full margin_bottom_30">
               <b-overlay :show="buscandoTamanhoTabela" rounded="sm">
                  <h2 class="text-center mb-0 mt-1">Maiores Tabelas</h2>
                  <div ref="containerTamanhoTabela" style="margin: -50px 0px -50px 0px">
                     <div ref="chartTamanhoTabela" class="mb-0" style="width: 100%; height: 40vh"></div>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="4">
            <div class="white_shd full margin_bottom_30">
               <b-overlay :show="buscandoRegistroMinuto" rounded="sm">
                  <h2 class="text-center mb-0 mt-1">Registros por Minuto</h2>
                  <div ref="containerRegistroMinuto" style="margin: -50px -40px -50px -40px">
                     <div ref="chartRegistroMinuto" class="mb-0" style="width: 100%; height: 40vh"></div>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="4">
            <div class="white_shd full margin_bottom_30">
               <b-overlay :show="buscandoDadosEquipamento" rounded="sm">
                  <h2 class="text-center mb-0 mt-1">Dados por Equipamento</h2>
                  <div ref="containerDadosEquipamento" style="margin: -50px -40px 0px 0px">
                     <div ref="chartDadosEquipamento" class="mb-0" style="width: 100%; height: 35vh"></div>
                  </div>
               </b-overlay>
            </div>
         </b-col>
      </b-row>
      <b-row>
         <b-col lg="4">
            <div class="white_shd full margin_bottom_30">
               <h2 class="text-center mb-0 mt-1">Log de Processos</h2>
               <b-row class="p-4">
                  <b-col>
                     <b-overlay :show="buscandoLogProcessos" rounded="sm">
                        <b-list-group>
                           <b-list-group-item href="#" @click="mostrarModal(log.logsSucesso)" variant="success" class="flex-column align-items-start">
                              <div class="d-flex w-100 justify-content-center mb-2">
                                 <b-icon icon="check-circle" variant="" scale="1.8"></b-icon>
                              </div>
                              <div class="d-flex w-100 justify-content-center">
                                 <h2 class="mb-1">Sucesso</h2>
                              </div>
                              <div class="d-flex w-100 justify-content-center">
                                 <p class="mb-1 ml-2 text-center valor">{{ this.log.quantidadeSucesso || 0 }}</p>
                              </div>
                           </b-list-group-item>
                        </b-list-group>
                     </b-overlay>
                  </b-col>
                  <b-col>
                     <b-overlay :show="buscandoLogProcessos" rounded="sm">
                        <b-list-group-item href="#" @click="mostrarModal(log.logsFalha)" variant="danger" class="flex-column align-items-start">
                           <div class="d-flex w-100 justify-content-center mb-2">
                              <b-icon icon="x-circle" scale="1.8"></b-icon>
                           </div>
                           <div class="d-flex w-100 justify-content-center">
                              <h2 class="mb-1">Falha</h2>
                           </div>
                           <div class="d-flex w-100 justify-content-center">
                              <p class="mb-1 ml-2 text-center valor">{{ this.log.quantidadeFalha || 0 }}</p>
                           </div>
                        </b-list-group-item>
                     </b-overlay>
                  </b-col>
               </b-row>
               <b-row class="pl-4 pb-4 pr-4">
                  <b-col>
                     <b-overlay :show="buscandoLogMedia" rounded="sm">
                        <b-list-group-item variant="" class="flex-column align-items-start">
                           <div class="d-flex w-100 justify-content-center mb-2">
                              <b-icon icon="clock" variant="primary" scale="1.8"></b-icon>
                           </div>
                           <div class="d-flex w-100 justify-content-center">
                              <h2 class="mb-1">Tempo Médio</h2>
                           </div>
                           <div class="d-flex w-100 justify-content-center">
                              <p class="mb-1 ml-2 text-center valor">{{ this.logMedia.length ? formatarData(this.logMedia) : '-' }}</p>
                           </div>
                        </b-list-group-item>
                     </b-overlay>
                  </b-col>
                  <b-col>
                     <b-overlay :show="buscandoLogMedia" rounded="sm">
                        <b-list-group-item href="#" @click="mostrarModal(logMensagem.logMensagens)" variant="" class="flex-column align-items-start">
                           <div class="d-flex w-100 justify-content-center mb-2">
                              <b-icon icon="chat-dots" variant="primary" scale="1.8"></b-icon>
                           </div>
                           <div class="d-flex w-100 justify-content-center">
                              <h2 class="mb-1">Mensagens</h2>
                           </div>
                           <div class="d-flex w-100 justify-content-center">
                              <p class="mb-1 ml-2 text-center valor">{{ this.logMensagem.quantidadeMensagens || 0 }}</p>
                           </div>
                        </b-list-group-item>
                     </b-overlay>
                  </b-col>
               </b-row>
            </div>
         </b-col>
         <b-col lg="4">
            <div class="white_shd full margin_bottom_30" @click="mostrarModal(usuarios.usuariosOnline)">
               <b-overlay :show="buscandoUsuarios" rounded="sm">
                  <h2 class="text-center mb-0 mt-1">Usuários Online</h2>
                  <div ref="containerUsuarios" style="margin: -35px 0px -35px 0px">
                     <div ref="chartUsuarios" class="mb-0" style="width: 100%; height: 35vh"></div>
                  </div>
               </b-overlay>
            </div>
         </b-col>
      </b-row>
      <b-modal id="modal-log" ref="modal" ok-title="Salvar" size="xl" scrollable>
         <b-table small :items="dadosModal" select-mode="single" responsive="sm" hover selectable></b-table>
         <p class="text-center" v-if="!this.dadosModal.length">Nenhum resultado para listar</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Fechar </b-button>
         </template>
      </b-modal>
      <div :class="['btn-group-fab', { active }]">
         <div>
            <b-button class="btn btn-main" variant="primary" @click.stop="toggleMenu()"> <i class="fa fa-bars"></i> </b-button>
            <b-button class="btn btn-sub" variant="primary" @click="modalDashboard(), toggleMenu()" :style="{ opacity: active ? 1 : 0 }"> Acessos </b-button>
            <b-button class="btn btn-sub" variant="primary" id="popover" @click="showPopover = !showPopover" :style="{ opacity: active ? 1 : 0 }"> Atualização </b-button>
         </div>
      </div>
      <b-popover :show="showPopover" target="popover" triggers="focus">
         <b-row>
            <b-col class="m-1">
               <b-form-select v-model="tempoAtualizacao" :options="options" size="sm"></b-form-select>
            </b-col>
         </b-row>
      </b-popover>
      <modal-dashboard></modal-dashboard>
   </div>
</template>

<script>
import client from '@/api'
import * as echarts from 'echarts'
import ModalDashboard from '../components/ModalDashboard.vue'

export default {
   name: 'DashboardView',
   components: {
      ModalDashboard
   },
   data() {
      return {
         buscandoEquipamentos: false,
         buscandoTamanhoTabela: false,
         buscandoRegistroMinuto: false,
         buscandoDadosEquipamento: false,
         buscandoLogProcessos: false,
         buscandoLogMedia: false,
         buscandoLogMensagens: false,
         buscandoUsuarios: false,
         equipamentos: {},
         tabelas: {},
         registroMinuto: [],
         dadosEquipamento: [],
         log: {},
         logMedia: {},
         logMensagem: {},
         usuarios: {},
         dadosModal: [],
         graficoTamanhoTabela: {},
         graficoRegistroMinuto: {},
         graficoDadosEquipamento: {},
         graficoUsuarios: {},
         itemsLog: [],
         fieldsLog: [
            { key: 'jobid', label: 'Job', tdClass: 'text-center', class: 'text-center' },
            { key: 'runid', label: 'Run', tdClass: 'text-center', class: 'text-center' },
            { key: 'job_pid', label: 'Pid', tdClass: 'text-center', class: 'text-center' },
            { key: 'command', label: 'Comando' },
            { key: 'status', label: 'St.' },
            { key: 'tempo', label: 'Tempo' }
         ],
         active: false,
         showPopover: false,
         tempoAtualizacao: null,
         options: [
            { value: null, text: 'Atualização automática' },
            { value: 60000, text: '1 minuto' },
            { value: 120000, text: '2 minutos' },
            { value: 300000, text: '5 minutos' }
         ]
      }
   },

   mounted() {
      this.initializeChart()
      this.buscarEquipamentos()
      this.buscarTamanhoTabela()
      this.buscarQuantidadeDados()
      this.buscarDadosEquipamento()
      this.buscarLogProcessos()
      this.buscarLogMedia()
      this.buscarLogMensagens()
      this.buscarUsuarios()
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(this.$refs.containerTamanhoTabela)
      this.resizeObserver.observe(this.$refs.containerRegistroMinuto)
      this.resizeObserver.observe(this.$refs.containerDadosEquipamento)
      this.resizeObserver.observe(this.$refs.containerUsuarios)
      window.addEventListener('resize', this.handleResize)
   },

   methods: {
      toggleMenu() {
         this.active = !this.active
      },
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarEquipamentos()
            this.buscarTamanhoTabela()
            this.buscarQuantidadeDados()
            this.buscarDadosEquipamento()
            this.buscarLogProcessos()
            this.buscarLogMedia()
            this.buscarLogMensagens()
            this.buscarUsuarios()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      },
      mostrarModal(dados) {
         this.dadosModal = dados
         this.$bvModal.show('modal-log')
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'HH:mm:ss.SSSSSS').format('HH:mm:ss.S')
      },
      initializeChart() {
         this.chartTamanhoTabela = echarts.init(this.$refs.chartTamanhoTabela)
         if (this.graficoTamanhoTabela) {
            this.chartTamanhoTabela.setOption(this.graficoTamanhoTabela)
         }
         this.chartRegistroMinuto = echarts.init(this.$refs.chartRegistroMinuto)
         if (this.graficoRegistroMinuto) {
            this.chartRegistroMinuto.setOption(this.graficoRegistroMinuto)
         }
         this.chartDadosEquipamento = echarts.init(this.$refs.chartDadosEquipamento)
         if (this.graficoDadosEquipamento) {
            this.chartDadosEquipamento.setOption(this.graficoDadosEquipamento)
         }
         this.chartUsuarios = echarts.init(this.$refs.chartUsuarios)
         if (this.graficoUsuarios) {
            this.chartUsuarios.setOption(this.graficoUsuarios)
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
         if (this.chartTamanhoTabela) {
            this.chartTamanhoTabela.resize()
         }
         if (this.chartRegistroMinuto) {
            this.chartRegistroMinuto.resize()
         }
         if (this.chartDadosEquipamento) {
            this.chartDadosEquipamento.resize()
         }
         if (this.chartUsuarios) {
            this.chartUsuarios.resize()
         }
      },
      async buscarEquipamentos() {
         this.buscandoEquipamentos = true
         const dados = await client.get('/dashboard/equipamentos').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoEquipamentos = false
         })
         this.buscandoEquipamentos = false
         this.equipamentos = dados.data
      },
      async buscarTamanhoTabela() {
         this.buscandoTamanhoTabela = true
         const dados = await client.get('/dashboard/tabelas').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tamanho das tabelas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoTamanhoTabela = false
         })
         this.buscandoTamanhoTabela = false
         this.tabelas = dados.data
         this.construirGraficoTamanhoTabela()
      },
      async buscarQuantidadeDados() {
         this.buscandoRegistroMinuto = true
         const dados = await client.get('/dashboard/quantidadedados').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar registros por minuto. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRegistroMinuto = false
         })
         this.buscandoRegistroMinuto = false
         this.registroMinuto = dados.data
         this.construirGraficoRegistroMinuto()
      },
      async buscarDadosEquipamento() {
         this.buscandoDadosEquipamento = true
         const dados = await client.get('/dashboard/dadosequipamento').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados por equipamento. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoDadosEquipamento = false
         })
         this.buscandoDadosEquipamento = false
         this.dadosEquipamento = dados.data
         this.construirGraficoDadosEquipamento()
      },
      async buscarLogProcessos() {
         this.buscandoLogProcessos = true
         const dados = await client.get('/dashboard/logprocessos').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar log de processos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoLogProcessos = false
         })
         this.buscandoLogProcessos = false
         this.log = dados.data
      },
      async buscarLogMedia() {
         this.buscandoLogMedia = true
         const dados = await client.get('/dashboard/logmedia').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tempo médio. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoLogMedia = false
         })
         this.buscandoLogMedia = false
         this.logMedia = dados.data
      },
      async buscarLogMensagens() {
         this.buscandoLogMensagens = true
         const dados = await client.get('/dashboard/logmensagens').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar mensagens. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoLogMensagens = false
         })
         this.buscandoLogMensagens = false
         this.logMensagem = dados.data
      },
      async buscarUsuarios() {
         this.buscandoUsuarios = true
         const dados = await client.get('/dashboard/usuarios').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar usuários online. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoUsuarios = false
         })
         this.buscandoUsuarios = false
         this.usuarios = dados.data
         this.construirGraficoUsuarios()
      },
      construirGraficoTamanhoTabela() {
         this.graficoTamanhoTabela = {
            tooltip: { trigger: 'item' },
            series: [{ type: 'pie', radius: ['25%', '50%'], data: this.tabelas, tooltip: { valueFormatter: (value) => value + ' MB' } }]
         }
      },
      construirGraficoRegistroMinuto() {
         this.graficoRegistroMinuto = {
            tooltip: { trigger: 'axis' },
            grid: { top: '20%', containLabel: true },
            xAxis: { type: 'time', boundaryGap: false },
            yAxis: { type: 'value' },
            series: [{ name: 'Registros', type: 'line', showSymbol: false, data: this.registroMinuto }]
         }
      },
      construirGraficoDadosEquipamento() {
         this.graficoDadosEquipamento = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { bottom: '20' },
            xAxis: { axisLabel: { show: false, rotate: 30 }, type: 'category' },
            yAxis: { type: 'value' },
            series: [{ data: this.dadosEquipamento, type: 'bar', showBackground: true, backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' }, label: { show: true } }]
         }
      },
      construirGraficoUsuarios() {
         this.graficoUsuarios = {
            tooltip: { trigger: 'item' },
            series: [
               {
                  type: 'pie',
                  radius: ['32%', '60%'],
                  data: [
                     { value: this.usuarios.offline, name: 'Offline', itemStyle: { color: '#C4C4C4' } },
                     { value: this.usuarios.online, name: 'Online', itemStyle: { color: '#91cc75' } }
                  ]
               }
            ]
         }
      },
      modalDashboard() {
         this.$bvModal.show('modal-dashboard')
      }
   },

   watch: {
      graficoTamanhoTabela(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart(this.chartTamanhoTabela)
            this.updateChart(this.chartTamanhoTabela, novasOpcoes)
         }
      },
      graficoRegistroMinuto(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart(this.chartRegistroMinuto)
            this.updateChart(this.chartRegistroMinuto, novasOpcoes)
         }
      },
      graficoDadosEquipamento(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart(this.chartDadosEquipamento)
            this.updateChart(this.chartDadosEquipamento, novasOpcoes)
         }
      },
      graficoUsuarios(novasOpcoes) {
         if (novasOpcoes) {
            this.clearChart(this.chartUsuarios)
            this.updateChart(this.chartUsuarios, novasOpcoes)
         }
      },
      tempoAtualizacao(newValue) {
         this.showPopover = !this.showPopover
         this.toggleMenu()
         if (newValue) {
            this.startInterval(newValue)
         } else {
            this.stopInterval()
         }
      }
   },

   beforeDestroy() {
      this.stopInterval()
   }
}
</script>

<style scoped>
.valor {
   font-size: 30px;
   font-weight: 500;
   color: black;
}
h2 {
   font-size: 19px;
   font-weight: 500;
}
.icone {
   font-size: 35px;
}
.blue_color {
   color: #007bff;
}
.green_color {
   color: #28a745 !important;
}
.grey_color {
   color: #6c757d;
}
.red_color {
   color: #dc3545 !important;
}
.yellow_color {
   color: #ffc107 !important;
}
.black_color {
   color: #343a40;
}
.btn-group-fab {
   position: fixed;
   width: 50px;
   height: auto;
   right: 20px;
   bottom: 20px;
   z-index: 1;
}
.btn-group-fab div {
   position: relative;
   width: 100%;
   height: auto;
}
.btn-group-fab .btn {
   position: absolute;
   bottom: 0;
   display: block;
   margin-bottom: 4px;
   margin: 4px auto;
}
.btn-group-fab .btn-main {
   border-radius: 50%;
   width: 40px;
   height: 40px;
   width: 50px;
   height: 50px;
   right: 50%;
   margin-right: -25px;
   z-index: 9;
}
.btn-group-fab .btn-sub {
   bottom: 0;
   z-index: 8;
   right: 50%;
   margin-right: -20px;
   -webkit-transition: all 2s;
   transition: all 0.5s;
   min-width: 130px;
}
.btn-group-fab.active .btn-sub:nth-child(2) {
   bottom: 60px;
}
.btn-group-fab.active .btn-sub:nth-child(3) {
   bottom: 110px;
}
</style>