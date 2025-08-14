<template>
   <div class="white_shd full margin_bottom_30">
      <div class="full graph_head">
         <div class="heading1 margin_0">
            <b-overlay :show="buscandoEquipamento || buscandoDados" rounded="sm" class="overlay">
               <b-row class="align-items-center justify-content-center justify-content-md-start text-center text-md-left">
                  <b-col sm="12" lg="3">
                     <h2>{{ this.equipamento?.ds_equipamento || '-' }}</h2>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" v-b-tooltip.hover title="Status">
                     <b-icon icon="circle-fill" scale="1.5" class="mr-2" :variant="corVariant(this.equipamento.st_operacao)"></b-icon>
                     <span :class="corTexto(this.equipamento.st_operacao)">{{ formatarStatus(this.equipamento.st_operacao) || '-' }}</span>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" v-b-tooltip.hover title="Produto">
                     <span id="popoverNivelAtual" class="mouse"><img width="22" v-if="formatarProduto(this.dados?.CUL).svg" :src="formatarProduto(this.dados?.CUL).svg" /> {{ formatarProduto(this.dados?.CUL).nome }}</span>
                  </b-col>
                  <b-col cols="4" md="2" lg="1">
                     <b-badge style="max-width: 30px" id="popoverConservacao" class="mt-2 p-1 d-flex justify-content-center align-items-center text-wrap" :style="{ 'background-color': buscarCorNivel(this.dados?.UMC, this.dados?.TMS, this.dados?.FCV) }" pill>
                        <img width="18" class="text-danger" :src="buscarImagemConservacao(calcularConservacao(this.dados?.UMC, this.dados?.TMS))" />
                     </b-badge>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" class="mouse" @click="showPopoverPlenum = !showPopoverPlenum" id="popoverPlenum">
                     <b-iconstack><b-icon stacked icon="droplet-fill" shift-h="9" shift-v="" scale="1.2"></b-icon><b-icon stacked icon="thermometer-high" scale="1.8"></b-icon></b-iconstack>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" id="popover" class="m-0 p-0 mouse" @click="showPopover = !showPopover">
                     <img v-if="this.dados?.estacao?.MOD == 1" :src="require('@/assets/images/clima/' + iconeClima(clima?.weather?.[0].id, clima?.weather?.[0].icon))" width="55" style="margin: -25px -25px -25px auto" />
                  </b-col>
               </b-row>
               <b-row class="text-center text-md-left">
                  <b-col>
                     <small class="mb-0">Última atualização: {{ formatarDataHora(this.dados?.DAT) || '-' }}</small>
                  </b-col>
               </b-row>
            </b-overlay>
         </div>
      </div>
      <div class="map_section padding_infor_info">
         <b-overlay :show="buscandoDados" rounded="sm" class="overlay">
            <b-row>
               <b-col>
                  <h1 class="mb-2 text-center text-md-left">Leituras da célula {{ this.celulaSelecionada }}</h1>
               </b-col>
            </b-row>
            <b-row>
               <b-col sm="12" md="6" lg="3">
                  <b-form-group label="Consultar leituras na data">
                     <b-form-datepicker v-model="data" @input="buscarLeiturasDia()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
                  </b-form-group>
               </b-col>
               <b-col sm="12" md="6" lg="3">
                  <b-form-group label="Selecionar leitura">
                     <b-overlay :show="buscandoLeituras" rounded="sm">
                        <b-dropdown id="dropdown-left" :text="visualizacaoLeitura" variant="outline-primary" class="btn-block altura-menu" menu-class="w-100" block :disabled="buscandoLeituras">
                           <b-dropdown-item @click="acionarBusca(leiturasDia.leituraFria?.tp_leitura, leiturasDia.leituraFria?.dt_dado, false)" :disabled="!leiturasDia.leituraFria?.dt_dado">Leitura fria - {{ formatarData(leiturasDia.leituraFria?.dt_dado) || 'não realizada' }}</b-dropdown-item>
                           <b-dropdown-item @click="acionarBusca(leiturasDia.leituraQuente?.tp_leitura, leiturasDia.leituraQuente?.dt_dado, false)" :disabled="!leiturasDia.leituraQuente?.dt_dado">Leitura quente - {{ formatarData(leiturasDia.leituraQuente?.dt_dado) || 'não realizada' }}</b-dropdown-item>
                           <b-dropdown-item @click="acionarBusca(leiturasDia.ultimaLeitura?.tp_leitura, leiturasDia.ultimaLeitura?.dt_dado, true)" :disabled="!leiturasDia.ultimaLeitura?.dt_dado">Última leitura do dia - {{ formatarData(leiturasDia.ultimaLeitura?.dt_dado) || 'sem leituras' }}</b-dropdown-item>
                           <b-dropdown-divider v-if="leiturasDia.leituraManual?.length || leiturasDia.leituraPeriodica?.length"></b-dropdown-divider>
                           <b-dropdown-item v-for="leitura in leiturasDia.leituraManual" :key="leitura.dt_dado" @click="acionarBusca(leitura?.tp_leitura, leitura?.dt_dado, false)">Leitura manual - {{ formatarData(leitura?.dt_dado) }}</b-dropdown-item>
                           <b-dropdown-item v-for="leitura in leiturasDia.leituraPeriodica" :key="leitura.dt_dado" @click="acionarBusca(leitura?.tp_leitura, leitura?.dt_dado, false)">Leitura periódica - {{ formatarData(leitura?.dt_dado) }}</b-dropdown-item>
                        </b-dropdown>
                     </b-overlay>
                  </b-form-group>
               </b-col>
               <b-col sm="12" md="12" lg="6">
                  <div class="card text-center">
                     <span class="h6 w-60 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm">Dados da leitura</span>
                     <div class="card-body pt-0 pb-2">
                        <div class="d-flex justify-content-between flex-wrap">
                           <div class="text-center flex-fill position-relative info-item px-1" v-b-tooltip.hover title="Temperatura média">
                              <b-icon icon="thermometer-half" scale="1.3"></b-icon>
                              <span class="ml-1">{{ this.dados?.TMS || '-' }} °C</span>
                           </div>
                           <div class="text-center flex-fill position-relative info-item px-1" v-b-tooltip.hover title="Temperatura mínima">
                              <b-iconstack><b-icon icon="thermometer-half" scale="1.4" shift-h="-4"></b-icon><b-icon icon="arrow-down" scale="1.4" shift-h="9"></b-icon></b-iconstack>
                              <span class="ml-1">{{ this.dados?.TMI || '-' }} °C</span>
                           </div>
                           <div class="text-center flex-fill position-relative info-item px-1" v-b-tooltip.hover title="Temperatura máxima">
                              <b-iconstack><b-icon icon="thermometer-half" scale="1.4" shift-h="-4"></b-icon><b-icon icon="arrow-up" scale="1.4" shift-h="9"></b-icon></b-iconstack>
                              <span class="ml-1">{{ this.dados?.TMA || '-' }} °C</span>
                           </div>
                           <div class="text-center flex-fill position-relative info-item px-1" id="popoverUmidade" v-b-tooltip.hover title="Umidade média">
                              <b-icon icon="droplet" scale="1.3"></b-icon>
                              <span class="ml-1" :class="{ 'text-danger': dados?.TUMI == 1 }">{{ this.dados?.UMC || '-' }} %</span>
                              <b-icon v-if="this.dados?.TUMI == 1" icon="exclamation-square" scale="1.2" variant="danger" animation="fade" class="ml-1"></b-icon>
                           </div>
                           <div class="text-center flex-fill position-relative info-item px-1 mouse" id="popoverNivel">
                              <b-icon icon="server" scale="1.3"></b-icon>
                              <span class="ml-1" v-if="this.dados?.NIVH">{{ this.dados?.NIVH / 10 || '-' }} %</span>
                              <span class="ml-1" v-else>{{ this.dados?.NIV || '-' }} %</span>
                           </div>
                           <div class="text-center flex-fill position-relative mouse">
                              <b-icon icon="cloud" scale="1.3" id="popoverLeitura"></b-icon>
                           </div>
                        </div>
                     </div>
                  </div>
               </b-col>
            </b-row>
            <b-row class="align-items-center" style="min-height: 300px">
               <b-col sm="12" md="12" lg="5" style="height: fit-content">
                  <armazem-arco ref="arcoRef" @receberArco="enviaArco"></armazem-arco>
               </b-col>
               <b-col sm="12" md="12" lg="7" style="height: fit-content">
                  <b-alert :show="!Object.keys(dados).length && !buscandoDados && !buscandoLeituras" variant="warning" class="text-center">Nenhum dado recebido nessa data</b-alert>
                  <div id="desenho-svg" class="text-center mt-2"></div>
               </b-col>
            </b-row>
         </b-overlay>
      </div>
      <b-popover :show="showPopover" target="popover" triggers="hover" placement="bottomleft">
         <template #title>Estação meteorológica em solo</template>
         <b-overlay :show="buscandoClima" rounded="sm" class="overlay" style="min-height: 15px">
            <b-row v-if="!buscandoClima" class="align-items-center justify-content-center">
               <b-col cols="7">
                  <b-row class="justify-content-center">
                     <b-row class="">
                        <b-col class="p-0">
                           <img v-if="this.dados?.estacao?.MOD == 1" :src="require('@/assets/images/clima/' + iconeClima(clima?.weather?.[0].id, clima?.weather?.[0].icon))" height="50" style="margin: -25px -25px -25px auto" />
                        </b-col>
                        <b-col class="p-0 ml-3">
                           <p class="texto">{{ Math.round(this.dados?.estacao?.TEM) || '-' }}°</p>
                        </b-col>
                     </b-row>
                  </b-row>
               </b-col>
               <b-col cols="5">
                  <b-row class="">
                     <b-col class="p-0">
                        <img src="@/assets/images/clima/umidade.png" width="25" v-b-tooltip.hover title="Umidade" />
                     </b-col>
                     <b-col class="p-0">
                        <b-row>
                           <b-col class="pr-0 pl-2">
                              <p class="texto">{{ Math.round(this.dados?.estacao?.UMI) || '-' }}</p>
                           </b-col>
                           <b-col class="p-0 mr-4">
                              <p>%</p>
                           </b-col>
                        </b-row>
                     </b-col>
                  </b-row>
               </b-col>
            </b-row>
         </b-overlay>
      </b-popover>
      <b-popover :show="showPopoverLeitura" target="popoverLeitura" triggers="hover" placement="bottomleft">
         <template #title>Clima no momento da leitura</template>
         <b-row class="align-items-center justify-content-center">
            <b-col cols="7">
               <b-row class="justify-content-center">
                  <b-row class="">
                     <b-col class="p-0">
                        <!-- <img v-if="this.dadoSilo?.MOD == 1" :src="require('@/assets/images/clima/' + iconeClima(clima?.weather?.[0].id, clima?.weather?.[0].icon))" height="50" style="margin: -25px -25px -25px auto" /> -->
                        <b-icon icon="thermometer-half" variant="primary" scale="1.7"></b-icon>
                     </b-col>
                     <b-col class="p-0 ml-3">
                        <p class="texto">{{ Math.round(this.dados?.estacaoLeitura?.TEM) || '-' }}°</p>
                     </b-col>
                  </b-row>
               </b-row>
            </b-col>
            <b-col cols="5">
               <b-row class="">
                  <b-col class="p-0">
                     <img src="@/assets/images/clima/umidade.png" width="25" v-b-tooltip.hover title="Umidade" />
                  </b-col>
                  <b-col class="p-0">
                     <b-row>
                        <b-col class="pr-0 pl-2">
                           <p class="texto">{{ Math.round(this.dados?.estacaoLeitura?.UMI) || '-' }}</p>
                        </b-col>
                        <b-col class="p-0 mr-4">
                           <p>%</p>
                        </b-col>
                     </b-row>
                  </b-col>
               </b-row>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverPlenum" target="popoverPlenum" triggers="hover" placement="bottomleft" style="min-width: 300px">
         <template #title>Dados do plenum</template>
         <b-row>
            <b-col class="text-nowrap">
               <b-icon icon="thermometer-half" scale="1.5" variant="primary"></b-icon>
               <span class="texto">{{ this.dados?.TCP || '-' }} °C</span>
            </b-col>
            <b-col class="text-nowrap">
               <b-icon icon="droplet" scale="1.5" class="mr-1" variant="primary"></b-icon>
               <span class="texto">{{ this.dados?.UCP || '-' }} %</span>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverNivel" target="popoverNivel" triggers="hover" placement="bottomleft" style="min-width: 400px !important">
         <template #title>Capacidade utilizada</template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="this.dados?.VOLH || this.dados?.NIVH" class="mb-0">Armazenado: {{ this.converterSacas(this.dados?.CUL, this.dados?.VOLH) || 0 }} sacas ({{ this.dados?.NIVH / 10 || '-' }} %)</p>
               <p v-else class="mb-0">Armazenado: {{ this.converterSacas(this.dados?.CUL, this.dados?.VOL) || 0 }} sacas ({{ this.dados?.NIV || '-' }} %)</p>
               <p class="mb-0">Estimado com a leitura selecionada</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverConservacao" target="popoverConservacao" triggers="hover" placement="bottomleft" style="min-width: 300px">
         <template #title>Estado da conservação</template>
         <b-row>
            <b-col class="text-nowrap">
               <p class="mb-0">{{ this.dados.UMC == 0 ? 'Umidade não informada' : this.dados.TMS == 0 || !this.dados.TMS ? 'Conservação não calculada' : buscarConservacao(calcularConservacao(this.dados?.UMC, this.dados?.TMS)) }}</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverNivelAtual" target="popoverNivelAtual" triggers="hover" placement="bottomleft" style="min-width: 400px !important">
         <template #title>Capacidade atual</template>
         <b-row>
            <b-col class="text-nowrap">
               <p class="mb-0">Armazenado: {{ this.converterSacas(this.dados?.CUL, this.dados?.VOL) || 0 }} sacas ({{ this.dados?.NIV || '-' }} %)</p>
               <p class="mb-0">Estimado com dados atuais</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="popoverUmidade" v-if="dados?.TUMI == 1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Validade esgotada</div></template>
         <b-row>
            <b-col class="text-center">
               <p>Tempo de validade da umidade esgotado, informe nova amostra na termometria</p>
            </b-col>
         </b-row>
      </b-popover>
   </div>
</template>

<script>
import client from '@/api'
import axios from 'axios'
import { mapState, mapActions } from 'vuex'
import ArmazemArco from '../components/ArmazemArco.vue'
import sojaSVG from '@/assets/images/inicio/soja.svg'
import milhoSVG from '@/assets/images/inicio/milho.svg'
import trigoSVG from '@/assets/images/inicio/trigo.svg'
import cevadaSVG from '@/assets/images/inicio/cevada.svg'
import feijaoSVG from '@/assets/images/inicio/cevada.svg'
import arrozSVG from '@/assets/images/inicio/arroz.svg'
import sorgoSVG from '@/assets/images/inicio/sorgo.svg'

export default {
   name: 'ArmazemDados',
   components: {
      ArmazemArco
   },
   data() {
      return {
         buscandoArmazem: false,
         data: this.$moment().format('YYYY-MM-DD'),
         isWideScreen: window.innerWidth > 999,
         celulaSelecionada: 1,
         arcoSelecionado: 1,
         buscandoLeituras: false,
         leiturasDia: {},
         tipoLeitura: null,
         dataLeitura: null,
         visualizacaoLeitura: 'Selecionar Leitura',
         dados: {},
         buscandoDados: false,
         equipamento: {},
         buscandoEquipamento: false,
         datasOperacao: [],
         layout_topo: {},
         dados_topo: {},
         showPopover: false,
         showPopoverPlenum: false,
         clima: {},
         buscandoClima: false,
         showPopoverLeitura: false,
         showPopoverNivel: false,
         showPopoverConservacao: false,
         showPopoverNivelAtual: false
      }
   },

   computed: {
      ...mapState('unidade', ['unidade'])
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade']),
      marcaDatasOperacao(data) {
         const possuiData = this.datasOperacao.includes(data)
         return possuiData ? 'table-primary' : ''
      },
      cliqueArco(arco, celula) {
         this.selecionaArco(arco)
         if (celula != this.celulaSelecionada) {
            this.selecionaCelula(celula)
         }
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('HH:mm')
      },
      formatarDataHora(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
      },
      formatarProduto(value) {
         const produto = {
            1: { nome: 'Soja', svg: sojaSVG },
            2: { nome: 'Milho', svg: milhoSVG },
            3: { nome: 'Trigo', svg: trigoSVG },
            4: { nome: 'Cevada', svg: cevadaSVG },
            5: { nome: 'Feijão', svg: feijaoSVG },
            6: { nome: 'Arroz', svg: arrozSVG },
            7: { nome: 'Sorgo', svg: sorgoSVG }
         }
         return produto[value] || { nome: '-', svg: sojaSVG }
      },
      verificarBitNaPosicao(binario, posicao) {
         if (!binario) return
         const posicaoInvertida = binario.length - 1 - posicao
         return binario.charAt(posicaoInvertida) === '1'
      },
      formatarStatus(value) {
         const status = {
            OF: 'Offline',
            EF: 'Alerta',
            EC: 'Em configuração',
            EM: 'Em manutenção',
            CM: 'Com mensagem',
            ON: 'Online'
         }
         return status[value]
      },
      corTexto(st_operacao) {
         const variant = {
            OF: 'text-secondary',
            EF: 'text-danger',
            EC: 'text-dark',
            EM: 'text-warning',
            ON: 'text-success'
         }
         return variant[st_operacao]
      },
      corVariant(st_operacao) {
         const variant = {
            OF: 'secondary',
            EF: 'danger',
            EC: 'dark',
            EM: 'warning',
            ON: 'success'
         }
         return variant[st_operacao]
      },
      buscarImagemConservacao(conservacao) {
         const imagensConservacao = {
            1: require('@/assets/images/termometria/checked.svg'),
            2: require('@/assets/images/termometria/inseto.svg'),
            3: require('@/assets/images/termometria/mofo.svg'),
            4: require('@/assets/images/termometria/perigo.svg')
         }
         return imagensConservacao[conservacao] || require('@/assets/images/termometria/remove.svg')
      },
      acionarBusca(tipo, data, ultimaLeitura) {
         const objLeitura = {
            1: 'Leitura fria',
            2: 'Leitura quente',
            3: 'Leitura manual',
            4: 'Leitura periódica'
         }
         this.visualizacaoLeitura = `${ultimaLeitura ? 'Última leitura do dia' : objLeitura[tipo]}  -  ${this.formatarData(data)}`
         this.tipoLeitura = tipo
         this.dataLeitura = data
         this.buscarDados()
      },
      async buscarDados() {
         if (!this.idArmazem) {
            return
         }
         this.buscandoDados = true
         const dados = await client.get(`/armazem/buscardado/${this.idArmazem}?celula=${this.celulaSelecionada}&leitura=${this.tipoLeitura}&data=${this.dataLeitura}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoDados = false
         })
         this.buscandoDados = false
         if (dados && dados.data) {
            this.dados = dados.data
         }
      },
      async buscarEquipamento() {
         if (!this.idArmazem) {
            return
         }
         this.buscandoEquipamento = true
         const dados = await client.get(`/equipamento/${this.idArmazem}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar armazém. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoEquipamento = false
         })
         this.buscandoEquipamento = false
         if (dados && dados.data) {
            this.equipamento = dados.data
         }
      },
      async buscarLeiturasDia() {
         this.visualizacaoLeitura = 'Selecionar Leitura'
         this.tipoLeitura = null
         this.dataLeitura = null
         this.buscandoLeituras = true
         const dados = await client.get(`/armazem/buscarleituradia/${this.idArmazem}?celula=${this.celulaSelecionada}&data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar leituras do dia. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoLeituras = false
         })
         this.buscandoLeituras = false
         this.leiturasDia = dados.data
         this.datasOperacao = this.leiturasDia.datasOperacao
      },
      handleResize() {
         this.isWideScreen = window.innerWidth > 999
      },
      buscarCorNivel(umidade, temperatura, vazio) {
         if (vazio == 1) return '#adaaaa'
         if (umidade == '-') umidade = 0
         if (temperatura == '-') temperatura = 0
         if (umidade == 0 || temperatura == 0) return '#adaaaa'
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
         if (umidade == 0 || temperatura == 0) {
            return 9
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
      },
      enviaArco(arco) {
         this.arcoSelecionado = arco
         this.celulaSelecionada = this.layout_topo[arco].celula
      },
      async buscarLocal() {
         this.buscandoLocal = true
         const dados = await client.get(`/estrutura_pessoa/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar local da unidade. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoLocal = false
         })
         this.buscandoLocal = false
         if (dados.data) {
            this.latitude = dados.data.local_estrutura.latitude
            this.longitude = dados.data.local_estrutura.longitude
            this.buscarClima()
         }
      },
      async buscarClima() {
         this.buscandoClima = true
         try {
            const dados = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
               params: {
                  lat: this.latitude,
                  lon: this.longitude,
                  appid: process.env.VUE_APP_OPENWEATHERMAP_API_KEY,
                  units: 'metric',
                  lang: 'pt_br'
               }
            })
            this.clima = dados.data
         } catch (err) {
            this.$bvToast.toast(`Erro ao buscar condições meteorológicas. ${err}`, {
               title: 'Erro',
               variant: 'danger',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
         }
         this.buscandoClima = false
      },
      iconeClima(id, icon) {
         if (!id) return 'nublado.svg'
         id = id.toString()
         const icones = {
            '01d': 'ensolarado.svg',
            '01n': 'lua.svg',
            '02d': 'dia-nublado.svg',
            '02n': 'nublado.svg',
            '03d': 'dia-nublado.svg',
            '03n': 'nublado.svg',
            '04d': 'dia-nublado.svg',
            '04n': 'nublado.svg',
            '09d': 'chuvoso.svg',
            '09n': 'chuvoso.svg',
            '10d': 'chuvoso.svg',
            '10n': 'chuvoso.svg',
            '11d': 'tempestade.svg',
            '11n': 'tempestade.svg',
            '13d': 'nevando.svg',
            '13n': 'nevando.svg',
            '50d': 'nublado.svg',
            '50n': 'nublado.svg'
         }
         if (this.dados && this.dados?.CHO == 1) {
            return 'chuvoso.svg'
         } else if (this.dados && this.dados?.CHO == 0 && id && (id.charAt(0) == '2' || id.charAt(0) == '3' || id.charAt(0) == '5')) {
            return 'nublado.svg'
         } else {
            return icones[icon] || 'nublado.svg'
         }
      },
      converterSacas(grao, volume) {
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
      handleMouseUp(event) {
         let _id_obj, _tipo, _numero, _desenho
         // Verifica se o clique foi em um objeto válido
         _desenho = document.getElementById('des_topo_armazem')
         try {
            _id_obj = event.target.parentElement.id
         } catch {
            _id_obj = null
         }
         // Se retornou um objeto válido
         if (_id_obj != null && _desenho) {
            // ID do grupo do elemento
            _tipo = String(_id_obj).slice(0, 4)
            _numero = String(_id_obj).slice(5)
            if (_tipo === 'arco') {
               this.arcoSelecionado = Number(_numero)
               this.celulaSelecionada = this.layout_topo[_numero].celula
            } else if (_tipo === 'cabo') {
               this.arcoSelecionado = this.qualArco(_numero)
               this.celulaSelecionada = this.layout_topo[this.qualArco(_numero)].celula
            }
            // Atualiza o desenho
            this.atualizar()
         }
      },
      atualizar() {
         //seleciona a celula
         this.selecionaCelula(this.celulaSelecionada, this.layout_topo)
         //seleciona o arco
         this.selecionaArco(this.arcoSelecionado, this.layout_topo)
         //define a cor dos cabos
         this.escreveTempCabo(this.dados.pendulos)
      },
      selecionaCelula(_celula_selecionada, _layout_topo) {
         let _num_arcos, _arco, _num_celulas, _celula
         //numero de arcos e celulas
         _num_arcos = Object.keys(_layout_topo).length - 2
         _num_celulas = Object.keys(_layout_topo['celulas']).length - 2
         //para cada arco
         for (_arco = 1; _arco <= _num_arcos; _arco++) {
            //se o arco pertence a celula selecionada
            //altera a cor do preenchimento
            if (Number(_layout_topo[String(_arco)].celula) == _celula_selecionada) {
               document.getElementById('rec_arco_' + String(_arco)).setAttribute('fill', '#E6E6E6')
            } else {
               document.getElementById('rec_arco_' + String(_arco)).setAttribute('fill', '#B3B3B3')
            }
         }
         //para cada celula
         for (_celula = 1; _celula <= _num_celulas; _celula++) {
            //se a celula estiver selecionada
            //altera a cor do preenchimento
            if (_celula_selecionada == _celula) {
               document.getElementById('rec_celula' + String(_celula)).setAttribute('fill', '#E6E6E6')
               document.getElementById('rec_celula' + String(_celula)).setAttribute('stroke', '#438AF6')
            } else {
               document.getElementById('rec_celula' + String(_celula)).setAttribute('fill', '#B3B3B3')
               document.getElementById('rec_celula' + String(_celula)).setAttribute('stroke', '#B3B3B3')
            }
         }
      },
      selecionaArco(_arco, _layout_topo) {
         let _num_arcos, _arco_looping
         _num_arcos = Object.keys(_layout_topo).length - 2
         this.arco_selecionado = _arco
         for (_arco_looping = 1; _arco_looping <= _num_arcos; _arco_looping++) {
            document.getElementById('arco' + String(_arco_looping) + '_botsup').setAttribute('fill', '#999999')
            document.getElementById('arco' + String(_arco_looping) + '_botinf').setAttribute('fill', '#999999')
         }
         //altera a cor do retangulo de selecao
         document.getElementById('rec_arco_' + String(_arco)).setAttribute('fill', '#438AF6')
         //altera a cor dos botoes de selecao
         document.getElementById('arco' + String(_arco) + '_botsup').setAttribute('fill', '#33CC33')
         document.getElementById('arco' + String(_arco) + '_botinf').setAttribute('fill', '#33CC33')
      },
      escreveTempCabo(_dados) {
         //lista com as configurações dos elementos visuais dos cabos
         //            cor retangulo, cor texto, cor do contorno, opacidade retangulo, opacidade texto, espessura do contorno
         let _visual = ['white', 'black', 'black', '1', '1', '1.5']
         let _valor = 0 //temperatura maxima em cada cabo
         let _nivel = false //se o sensor esta dentro do nivel
         let _falha = false //se o cabo estiver em falha
         let _i //usada no loopin
         // let _i, _j //usada no loopin
         //para cada cabo
         let _ponto_quente = null
         let _id = null
         for (_i = 1; _i <= this.numeroCabos(); _i++) {
            //variaveis
            _falha = _dados[String(_i)][0]
            _ponto_quente = _dados[String(_i)][1]
            _nivel = _dados[String(_i)][2]
            _valor = _dados[String(_i)][3]
            _visual = ['white', 'black', 'black', '1', '1', '0.4']
            //esconde animacao de falha
            _id = 'f_cabo_' + _i
            document.getElementById(_id).style.visibility = 'hidden'
            //esconde animacao de ponto quente
            _id = 'pq_cabo_' + _i
            document.getElementById(_id).style.visibility = 'hidden'
            //calcula a escala de cores conforme a temperatura
            //temperatura < 12 graus
            if (_valor < 12) {
               _visual[0] = '#0384fc' //cor retangulo
               _visual[1] = 'white' //cor texto
            }
            //temperatura >= 12 e < 15
            else if (_valor < 15) {
               _visual[0] = '#03e8fc' //cor retangulo
               _visual[1] = 'black' //cor texto
            }
            //temperatura >= 15 e < 17
            else if (_valor < 17) {
               _visual[0] = '#03fcbe' //cor retangulo
               _visual[1] = 'black' //cor texto
            }
            //temperatura >= 17 e < 21
            else if (_valor < 21) {
               _visual[0] = '#07fc03' //cor retangulo
               _visual[1] = 'black' //cor texto
            }
            //temperatura >= 21 e < 25
            else if (_valor < 25) {
               _visual[0] = '#c3ff00' //cor retangulo
               _visual[1] = 'black' //cor texto
            }
            //temperatura >= 25 e < 27
            else if (_valor < 27) {
               _visual[0] = '#fcf803' //cor retangulo
               _visual[1] = 'black' //cor texto
            }
            //temperatura >= 27 e < 30
            else if (_valor < 30) {
               _visual[0] = '#ffb300' //cor retangulo
               _visual[1] = 'black' //cor texto
            }
            //temperatura >= 30 e < 35
            else if (_valor < 35) {
               _visual[0] = '#ff2200' //cor retangulo
               _visual[1] = 'white' //cor texto
            }
            //temperatura >= 35 e < 50
            else if (_valor < 50) {
               _visual[0] = '#ff0090' //cor retangulo
               _visual[1] = 'white' //cor texto
            }
            //temperatura > 50
            else if (_valor >= 50) {
               _visual[0] = '#f700ff' //cor retangulo
               _visual[1] = 'white' //cor texto
            }
            //se todo o cabo estiver fora do nivel
            if (_nivel == false) {
               _visual[0] = '#c7c7c7' //cor retangulo
               _visual[1] = 'black' //cor texto
               _visual[2] = 'black' //cor contorno
               _visual[3] = '0.78' //opacidade retangulo
               _visual[4] = '0.4' //opacidade texto
            }
            //se todos os sensores do cabo apresentarem falha
            //erro no cabo inteiro
            if (_ponto_quente == true) {
               //mostra a animacaoo de ponto quente
               _id = 'pq_cabo_' + _i
               document.getElementById(_id).style.visibility = 'visible'
            }
            //se todos os sensores do cabo apresentarem falha
            //erro no cabo inteiro
            if (_falha == true) {
               //mostra animacao de falha
               _id = 'f_cabo_' + _i
               document.getElementById(_id).style.visibility = 'visible'
               //esconde a animacao de ponto quente
               _id = 'pq_cabo_' + _i
               document.getElementById(_id).style.visibility = 'hidden'
            }
            //altera a cor e a opacidade do texto
            _id = 't_cabo_' + _i
            document.getElementById(_id).setAttribute('fill', _visual[1])
            document.getElementById(_id).setAttribute('fill-opacity', _visual[4])
            //altera o preenchimento, cor, contorno e opacidade do retangulo
            _id = 'c_cabo_' + _i
            document.getElementById(_id).setAttribute('fill', _visual[0])
            document.getElementById(_id).setAttribute('stroke', _visual[2])
            document.getElementById(_id).setAttribute('stroke-width', _visual[5])
            document.getElementById(_id).setAttribute('fill-opacity', _visual[3])
         }
      },
      setaAerador(_aerador, _estado) {
         let _id, _id_blade, _cor
         _id = 'fundo_aerador_' + String(_aerador)
         _id_blade = 'blade_aerador_' + +String(_aerador) + '_'
         //seleciona o estado
         switch (_estado) {
            //desligado
            case 0:
               _cor = '#c5c5c5'
               document.getElementById(_id_blade + 'parado').style.visibility = 'visible'
               document.getElementById(_id_blade + 'girando').style.visibility = 'hidden'
               break
            //ligado
            case 1:
               _cor = '#31dd0f'
               document.getElementById(_id_blade + 'parado').style.visibility = 'hidden'
               document.getElementById(_id_blade + 'girando').style.visibility = 'visible'
               break
            //falha
            case 2:
               _cor = '#ff0000'
               document.getElementById(_id_blade + 'parado').style.visibility = 'visible'
               document.getElementById(_id_blade + 'girando').style.visibility = 'hidden'
               break
         }
         //seta a cor do aerador
         document.getElementById(_id).setAttribute('fill', _cor)
      },
      desenhaArco(_id_arco, _cabos) {
         let _pos_x, _num_cabos, _cabo, _pos_y, _desenho, _grupo_arco, _des_rec_selecao, _des_box_sup, _des_box_inf, _des_text_box_sup, _des_text_box_inf
         //posicao x do arco e numero de cabos
         _pos_x = _cabos.pos_x
         _num_cabos = Object.keys(_cabos.sensores).length
         //pega a referencia do desenho svg
         _desenho = document.getElementById('des_topo_armazem')
         //cria o grupo do desenho do arco
         _grupo_arco = document.createElementNS('http://www.w3.org/2000/svg', 'g')
         _grupo_arco.setAttribute('id', 'arco_' + String(_id_arco))
         //cria o desenho do retangulo de selecao
         _des_rec_selecao = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
         _des_rec_selecao.setAttribute('id', 'rec_arco_' + String(_id_arco))
         _des_rec_selecao.setAttribute('x', String(_pos_x - 8.5))
         _des_rec_selecao.setAttribute('y', String(49))
         _des_rec_selecao.setAttribute('width', '17')
         _des_rec_selecao.setAttribute('height', '254')
         //cria o desenho do box/botao superior
         _des_box_sup = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
         _des_box_sup.setAttribute('id', 'arco' + String(_id_arco) + '_botsup')
         _des_box_sup.setAttribute('x', String(_pos_x - 8.5))
         _des_box_sup.setAttribute('y', String(41))
         _des_box_sup.setAttribute('rx', String(4.2))
         _des_box_sup.setAttribute('ry', String(4.2))
         _des_box_sup.setAttribute('width', '17')
         _des_box_sup.setAttribute('height', '17')
         _des_box_sup.setAttribute('cursor', 'pointer')
         //cria o desenho do box/botao inferior
         _des_box_inf = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
         _des_box_inf.setAttribute('id', 'arco' + String(_id_arco) + '_botinf')
         _des_box_inf.setAttribute('x', String(_pos_x - 8.5))
         _des_box_inf.setAttribute('y', String(295))
         _des_box_inf.setAttribute('rx', String(4.2))
         _des_box_inf.setAttribute('ry', String(4.2))
         _des_box_inf.setAttribute('width', '17')
         _des_box_inf.setAttribute('height', '17')
         _des_box_inf.setAttribute('cursor', 'pointer')
         //cria o texto do box/botao superior
         _des_text_box_sup = document.createElementNS('http://www.w3.org/2000/svg', 'text')
         _des_text_box_sup.setAttribute('text-anchor', 'middle')
         _des_text_box_sup.setAttribute('dominant-baseline', 'central')
         _des_text_box_sup.setAttribute('font-weight', 'bold')
         _des_text_box_sup.setAttribute('font-size', '10.5')
         _des_text_box_sup.setAttribute('font-family', 'Arial')
         _des_text_box_sup.setAttribute('fill', 'white')
         _des_text_box_sup.setAttribute('x', String(_pos_x))
         _des_text_box_sup.setAttribute('y', String(41 + 8.5))
         _des_text_box_sup.setAttribute('fill', 'white')
         _des_text_box_sup.setAttribute('cursor', 'pointer')
         _des_text_box_sup.textContent = String(_id_arco)
         //cria o texto do box/botao inferior
         _des_text_box_inf = document.createElementNS('http://www.w3.org/2000/svg', 'text')
         _des_text_box_inf.setAttribute('text-anchor', 'middle')
         _des_text_box_inf.setAttribute('dominant-baseline', 'central')
         _des_text_box_inf.setAttribute('font-weight', 'bold')
         _des_text_box_inf.setAttribute('font-size', '10.5')
         _des_text_box_inf.setAttribute('font-family', 'Arial')
         _des_text_box_inf.setAttribute('fill', 'white')
         _des_text_box_inf.setAttribute('cursor', 'pointer')
         _des_text_box_inf.setAttribute('x', String(_pos_x))
         _des_text_box_inf.setAttribute('y', String(295 + 8.5))
         _des_text_box_inf.textContent = String(_id_arco)
         //faz o append dos desenhos
         _grupo_arco.appendChild(_des_rec_selecao)
         _grupo_arco.appendChild(_des_box_sup)
         _grupo_arco.appendChild(_des_text_box_sup)
         _grupo_arco.appendChild(_des_box_inf)
         _grupo_arco.appendChild(_des_text_box_inf)
         //cria o desenhos dos cabos
         for (_cabo = 1; _cabo <= _num_cabos; _cabo++) {
            _pos_y = _cabos.sensores[Object.keys(_cabos.sensores)[_cabo - 1]]
            _grupo_arco.appendChild(this.desenhaCabo(Object.keys(_cabos.sensores)[_cabo - 1], _pos_x, _pos_y))
         }
         //faz o append dos desenhos
         _desenho.appendChild(_grupo_arco)
      },
      desenhaCabo(_id_cabo, _pos_x, _pos_y) {
         let _grupo, _des_circulo_cabo, _des_texto_cabo, _des_erro_cabo, _des_pontoquente_cabo, _animacao_pontoquente
         //cria o grupo do desenho do cabo
         _grupo = document.createElementNS('http://www.w3.org/2000/svg', 'g')
         _grupo.setAttribute('id', 'cabo_' + String(_id_cabo))
         //cria o desenho do circulo do cabo
         _des_circulo_cabo = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
         _des_circulo_cabo.setAttribute('id', 'c_cabo_' + String(_id_cabo))
         _des_circulo_cabo.setAttribute('cx', String(_pos_x))
         _des_circulo_cabo.setAttribute('cy', String(_pos_y))
         _des_circulo_cabo.setAttribute('r', '9')
         _des_circulo_cabo.setAttribute('fill', 'white')
         //cria o desenho do texto
         _des_texto_cabo = document.createElementNS('http://www.w3.org/2000/svg', 'text')
         _des_texto_cabo.setAttribute('id', 't_cabo_' + String(_id_cabo))
         _des_texto_cabo.setAttribute('text-anchor', 'middle')
         _des_texto_cabo.setAttribute('dominant-baseline', 'central')
         _des_texto_cabo.setAttribute('font-weight', 'bold')
         _des_texto_cabo.setAttribute('font-size', '7.75')
         _des_texto_cabo.setAttribute('font-family', 'Arial')
         _des_texto_cabo.setAttribute('x', String(_pos_x))
         _des_texto_cabo.setAttribute('y', String(_pos_y))
         _des_texto_cabo.textContent = 'P' + String(_id_cabo)
         //cria o desenho do circulo do cabo com erro
         _des_erro_cabo = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
         _des_erro_cabo.setAttribute('id', 'f_cabo_' + String(_id_cabo))
         _des_erro_cabo.setAttribute('cx', String(_pos_x))
         _des_erro_cabo.setAttribute('cy', String(_pos_y))
         _des_erro_cabo.setAttribute('r', '11')
         _des_erro_cabo.setAttribute('fill', 'red')
         _des_erro_cabo.setAttribute('fill-opacity', '0.6')
         _des_erro_cabo.setAttribute('visibility', 'hidden')
         //cria o desenho do circulo do cabo com ponto quente
         _des_pontoquente_cabo = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
         _des_pontoquente_cabo.setAttribute('id', 'pq_cabo_' + String(_id_cabo))
         _des_pontoquente_cabo.setAttribute('cx', String(_pos_x))
         _des_pontoquente_cabo.setAttribute('cy', String(_pos_y))
         _des_pontoquente_cabo.setAttribute('r', '13')
         _des_pontoquente_cabo.setAttribute('fill', 'red')
         _des_pontoquente_cabo.setAttribute('visibility', 'hidden')
         //cria a animacao do ponto quente
         _animacao_pontoquente = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
         _animacao_pontoquente.setAttribute('attributeName', 'r')
         _animacao_pontoquente.setAttribute('begin', '0s')
         _animacao_pontoquente.setAttribute('dur', '1s')
         _animacao_pontoquente.setAttribute('from', '13')
         _animacao_pontoquente.setAttribute('to', '8')
         _animacao_pontoquente.setAttribute('repeatCount', 'indefinite')
         //faz o append dos desenhos e animacao
         _des_pontoquente_cabo.appendChild(_animacao_pontoquente)
         _grupo.appendChild(_des_pontoquente_cabo)
         _grupo.appendChild(_des_circulo_cabo)
         _grupo.appendChild(_des_texto_cabo)
         _grupo.appendChild(_des_erro_cabo)
         //retorna a referencia do grupo criado
         return _grupo
      },
      desenhaRecCelula(_id, _x, _y, _width, _height) {
         let _desenho, _des_rec
         //pega a referencia do desenho svg
         _desenho = document.getElementById('des_topo_armazem')
         //cria o desenho do retangulo de fundo
         _des_rec = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
         _des_rec.setAttribute('id', 'rec_celula' + String(_id))
         _des_rec.setAttribute('x', String(_x))
         _des_rec.setAttribute('y', String(_y))
         _des_rec.setAttribute('width', String(_width))
         _des_rec.setAttribute('height', String(_height))
         _des_rec.setAttribute('fill', '#B3B3B3')
         _des_rec.setAttribute('stroke-width', '2')
         _des_rec.setAttribute('stroke-miterlimit', '23')
         _des_rec.setAttribute('rx', '5')
         _des_rec.setAttribute('ry', '5')
         //faz o append dos desenhos
         _desenho.appendChild(_des_rec)
      },
      desenhaTopo(_dados) {
         let _num_arcos, _arco, _num_aeradores, _aerador, _num_celulas, _celula, _desenho
         _num_arcos = Object.keys(_dados).length - 2
         _num_aeradores = Object.keys(_dados['aeradores']).length
         _num_celulas = Object.keys(_dados['celulas']).length - 2
         //pega a referencia do desenho svg
         _desenho = document.getElementById('des_topo_armazem')
         //deleta o desenho svg se existir
         if (_desenho != null) {
            _desenho.remove()
         }
         //cria desenho svg
         _desenho = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
         _desenho.setAttribute('id', 'des_topo_armazem')
         _desenho.setAttribute('xml', 'preserve')
         _desenho.setAttribute('version', '1.0')
         _desenho.setAttribute('style', 'shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd')
         _desenho.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
         if (this.isWideScreen && this.equipamento.id_equipamento == 76) {
            _desenho.setAttribute('width', '80%')
            _desenho.setAttribute('height', '500px')
         }
         // _desenho.setAttribute('width', '100%')
         // _desenho.setAttribute('width', String(_dados['celulas']['tamanho_svg'][0]) + 'mm')
         // _desenho.setAttribute('height', String(_dados['celulas']['tamanho_svg'][1]) + 'mm')
         // _desenho.setAttribute('height', '80%')
         _desenho.setAttribute('viewBox', '0 0 ' + String(_dados['celulas']['tamanho_svg'][0]) + ' ' + String(_dados['celulas']['tamanho_svg'][1]))
         //faz o append do desenho no body
         const container = document.getElementById('desenho-svg')
         container.appendChild(_desenho)
         // document.body.appendChild(_desenho)
         //cria desenho do fundo do armazem
         this.desenhaRecCelula(0, _dados['celulas']['fundo'][0], _dados['celulas']['fundo'][1], _dados['celulas']['fundo'][2], _dados['celulas']['fundo'][3])
         //cria desenhos das celulas
         for (_celula = 1; _celula <= _num_celulas; _celula++) {
            this.desenhaRecCelula(_celula, _dados['celulas'][String(_celula)][0], _dados['celulas'][String(_celula)][1], _dados['celulas'][String(_celula)][2], _dados['celulas'][String(_celula)][3])
         }
         //cria desenhos dos arcos
         for (_arco = 1; _arco <= _num_arcos; _arco++) {
            this.desenhaArco(_arco, _dados[String(_arco)])
         }
         //cria desenhos dos aeradores
         for (_aerador = 1; _aerador <= _num_aeradores; _aerador++) {
            this.desenhaAerador(_aerador, _dados['aeradores'][String(_aerador)][0], _dados['aeradores'][String(_aerador)][1], _dados['aeradores'][String(_aerador)][2])
            this.setaAerador(_aerador, 0)
         }
      },
      desenhaAerador(_id_aerador, _pos_x, _pos_y, _texto_acima) {
         let _desenho, _grupo_aerador, _grupo_blade_parado, _grupo_blade_girando, _des_rec_nome, _des_text_nome, _des_circulo, _des_blade_parada, _des_blade_girando, _animacao_blade
         //pega a referencia do desenho svg
         _desenho = document.getElementById('des_topo_armazem')
         //cria o grupo do desenho do aerador
         _grupo_aerador = document.createElementNS('http://www.w3.org/2000/svg', 'g')
         _grupo_aerador.setAttribute('id', 'aerador_' + String(_id_aerador))
         //cria o grupo do desenho da blade parada
         _grupo_blade_parado = document.createElementNS('http://www.w3.org/2000/svg', 'g')
         _grupo_blade_parado.setAttribute('id', 'blade_aerador_' + String(_id_aerador) + '_parado')
         //cria o grupo do desenho do blade girando
         _grupo_blade_girando = document.createElementNS('http://www.w3.org/2000/svg', 'g')
         _grupo_blade_girando.setAttribute('id', 'blade_aerador_' + String(_id_aerador) + '_girando')
         //cria o desenho do retangulo com o nome
         _des_rec_nome = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
         _des_rec_nome.setAttribute('width', '25')
         _des_rec_nome.setAttribute('height', '10')
         _des_rec_nome.setAttribute('rx', '6.4')
         _des_rec_nome.setAttribute('ry', '5')
         _des_rec_nome.setAttribute('fill', '#3A78FD')
         //posiciona texto acima ou abaixo
         if (_texto_acima == 1) {
            _des_rec_nome.setAttribute('x', String(70 + 3.5))
            _des_rec_nome.setAttribute('y', String(2))
         } else {
            _des_rec_nome.setAttribute('x', String(70 + 3.5))
            _des_rec_nome.setAttribute('y', String(36))
         }
         //cria o desenho do texto do nome
         _des_text_nome = document.createElementNS('http://www.w3.org/2000/svg', 'text')
         _des_text_nome.setAttribute('text-anchor', 'middle')
         _des_text_nome.setAttribute('dominant-baseline', 'central')
         _des_text_nome.setAttribute('font-weight', 'bold')
         _des_text_nome.setAttribute('font-size', '6.5')
         _des_text_nome.setAttribute('font-family', 'Arial')
         _des_text_nome.setAttribute('fill', 'white')
         _des_text_nome.textContent = 'AE-' + String(_id_aerador)
         //posiciona texto acima ou abaixo
         if (_texto_acima == 1) {
            _des_text_nome.setAttribute('x', String(70 + 12.5 + 3.5))
            _des_text_nome.setAttribute('y', String(0 + 7))
         } else {
            _des_text_nome.setAttribute('x', String(70 + 12.5 + 3.5))
            _des_text_nome.setAttribute('y', String(0 + 5 + 36))
         }
         //cria o desenho do circulo
         _des_circulo = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
         _des_circulo.setAttribute('id', 'fundo_aerador_' + String(_id_aerador))
         _des_circulo.setAttribute('cx', String(70 + 12.5 + 3.5))
         _des_circulo.setAttribute('cy', String(0 + 24))
         _des_circulo.setAttribute('r', '10.5')
         _des_circulo.setAttribute('fill', 'red')
         //cria o desenho da blade parada
         _des_blade_parada = document.createElementNS('http://www.w3.org/2000/svg', 'path')
         _des_blade_parada.setAttribute(
            'd',
            'M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 -0.0599,-0.1627 -0.0927,-0.3386 -0.0927,-0.5221 0,-0.1159 0.0131,-0.2287 0.0378,-0.3371 -2.7913,-0.5199 -5.9807,-0.6695 -6.4392,-2.7909 -0.0128,-1.1872 0.2692,-1.9342 1.3353,-3.2209 1.8235,3.4167 3.7637,4.2185 5.4165,5.3813 0.1852,-0.2222 0.433,-0.3903 0.7163,-0.4775 -0.9455,-2.6773 -2.4105,-5.5141 -0.8027,-6.9719 1.0218,-0.6046 1.8097,-0.734 3.4571,-0.454 -2.0471,3.2874 -1.7715,5.3685 -1.9521,7.3812 0.2952,0.0506 0.5612,0.1868 0.7714,0.3822 1.8461,-2.1575 3.5703,-4.845 5.6368,-4.1814 1.0345,0.5826 1.5405,1.2002 2.1218,2.7669 -3.8705,-0.1291 -5.535,1.15 -7.3682,2 0.0599,0.1627 0.0927,0.3386 0.0927,0.5221z'
         )
         _des_blade_parada.setAttribute('fill', 'white')
         //cria o desenho da blade girando
         _des_blade_girando = document.createElementNS('http://www.w3.org/2000/svg', 'path')
         _des_blade_girando.setAttribute(
            'd',
            'M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 -0.0599,-0.1627 -0.0927,-0.3386 -0.0927,-0.5221 0,-0.1159 0.0131,-0.2287 0.0378,-0.3371 -2.7913,-0.5199 -5.9807,-0.6695 -6.4392,-2.7909 -0.0128,-1.1872 0.2692,-1.9342 1.3353,-3.2209 1.8235,3.4167 3.7637,4.2185 5.4165,5.3813 0.1852,-0.2222 0.433,-0.3903 0.7163,-0.4775 -0.9455,-2.6773 -2.4105,-5.5141 -0.8027,-6.9719 1.0218,-0.6046 1.8097,-0.734 3.4571,-0.454 -2.0471,3.2874 -1.7715,5.3685 -1.9521,7.3812 0.2952,0.0506 0.5612,0.1868 0.7714,0.3822 1.8461,-2.1575 3.5703,-4.845 5.6368,-4.1814 1.0345,0.5826 1.5405,1.2002 2.1218,2.7669 -3.8705,-0.1291 -5.535,1.15 -7.3682,2 0.0599,0.1627 0.0927,0.3386 0.0927,0.5221z'
         )
         _des_blade_girando.setAttribute('fill', 'white')
         //cria a animacao
         _animacao_blade = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform')
         _animacao_blade.setAttribute('attributeName', 'transform')
         _animacao_blade.setAttribute('type', 'rotate')
         _animacao_blade.setAttribute('dur', '2s')
         _animacao_blade.setAttribute('values', '0 86.35 24.05; 360 86.35 24.05;')
         _animacao_blade.setAttribute('repeatCount', 'indefinite')
         //faz o append dos desenhos
         _desenho.appendChild(_grupo_aerador)
         _grupo_blade_parado.appendChild(_des_blade_parada)
         _grupo_blade_girando.appendChild(_des_blade_girando)
         _grupo_blade_girando.appendChild(_animacao_blade)
         _grupo_aerador.appendChild(_des_circulo)
         _grupo_aerador.appendChild(_des_rec_nome)
         _grupo_aerador.appendChild(_des_text_nome)
         _grupo_aerador.appendChild(_grupo_blade_parado)
         _grupo_aerador.appendChild(_grupo_blade_girando)
         _desenho.appendChild(_grupo_aerador)
         //posiciona o desenho do aerador
         document.getElementById('aerador_' + String(_id_aerador)).setAttribute('transform', 'translate(' + String(_pos_x - 70) + ' ' + String(_pos_y) + ')')
      },
      numeroCabos() {
         let _num_arcos, _arco, _num_cabos
         _num_arcos = Object.keys(this.layout_topo).length - 2
         _num_cabos = 0
         for (_arco = 1; _arco <= _num_arcos; _arco++) {
            _num_cabos = _num_cabos + Object.keys(this.layout_topo[String(_arco)].sensores).length
         }
         return _num_cabos
      },
      qualArco(_cabo) {
         let _num_arcos, _arco, _cabos
         _num_arcos = Object.keys(this.layout_topo).length
         for (_arco = 1; _arco <= _num_arcos; _arco++) {
            _cabos = Object.keys(this.layout_topo[String(_arco)].sensores)
            if (_cabos.includes(String(_cabo)) == true) {
               return Number(_arco)
            }
         }
         return null
      }
   },

   mounted() {
      const idArmazemLocalStorage = localStorage.getItem('arm')
      if (idArmazemLocalStorage && idArmazemLocalStorage != 'undefined') {
         this.idArmazem = idArmazemLocalStorage
      } else {
         this.idArmazem = this.$route.params.idArmazem
         localStorage.setItem('arm', this.idArmazem)
      }
      window.addEventListener('mouseup', this.handleMouseUp)
      this.buscarLeiturasDia()
      this.buscarEquipamento()
      this.buscarLocal()
      this.$emit('receberCelula', this.celulaSelecionada)
   },

   created() {
      window.addEventListener('resize', this.handleResize)
   },

   destroyed() {
      window.removeEventListener('resize', this.handleResize)
      window.removeEventListener('mouseup', this.handleMouseUp)
   },

   watch: {
      celulaSelecionada(newValue, oldValue) {
         if (newValue != oldValue) {
            this.buscarLeiturasDia()
            this.$emit('receberCelula', this.celulaSelecionada)
         }
      },
      arcoSelecionado() {
         this.atualizar()
         this.$refs.arcoRef.selecionaArco(this.arcoSelecionado)
      },
      leiturasDia(newValue) {
         if ('dt_dado' in newValue.ultimaLeitura) {
            this.acionarBusca(this.leiturasDia.ultimaLeitura.tp_leitura, this.leiturasDia.ultimaLeitura.dt_dado, true)
         }
      },
      dados(newValue) {
         if (newValue) {
            this.layout_topo = this.dados.configuracao.layout_topo
            this.desenhaTopo(this.layout_topo)
            this.atualizar()
            this.$emit('dadosArco', this.dados.arcos)
            this.$refs.arcoRef.recebeDadosArco(this.dados.arcos)
            this.$refs.arcoRef.recebeConfigArco(this.dados.configuracao.arcos)
            this.$emit('dadosEstacao', this.dados.estacao)
            this.aerador = this.dados?.AER?.split(',') || []
            if (this.aerador?.length) {
               for (let i = 0; i < this.aerador.length; i++) {
                  const valor = this.verificarBitNaPosicao(this.dados?.FMA, i) ? 2 : this.verificarBitNaPosicao(this.dados.EMA, i) ? 1 : 0
                  this.setaAerador(i + 1, valor)
               }
            }
         }
      }
   }
}
</script>

<style scoped>
.info-item::after {
   content: '';
   position: absolute;
   top: 0;
   right: 0;
   width: 1px;
   height: 100%;
   background-color: #ccc;
}

.info-item:last-child::after {
   display: none;
}

.btn-hover-dark:hover {
   background-color: #dbdbdb;
}

.fonte {
   color: #898989;
}

.overlay {
   z-index: 0;
}

.mouse {
   cursor: pointer;
}

.valor {
   font-size: 17px;
   font-weight: 400;
}

.valor2 {
   font-size: 18px;
   font-weight: 400;
}

.texto {
   font-size: 18px;
   font-weight: 300;
   color: black;
}

.temperatura {
   font-size: 30px;
   color: black;
}

::v-deep(.altura-menu .dropdown-menu) {
   max-height: 400px;
   overflow-y: auto;
}

@media (max-width: 500px) {
   h1 {
      font-size: 16px;
   }
}
</style>
<style>
.mouse {
   cursor: pointer;
}
</style>