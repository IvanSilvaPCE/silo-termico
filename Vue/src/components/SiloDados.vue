<template>
   <div class="white_shd full margin_bottom_30">
      <div class="full graph_head">
         <div class="heading1 margin_0">
            <b-overlay :show="buscandoEquipamento" rounded="sm" class="overlay">
               <b-row class="align-items-center justify-content-center justify-content-md-start text-center text-md-left">
                  <b-col sm="12" lg="3">
                     <h2>{{ equipamento?.ds_equipamento }}</h2>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" v-b-tooltip.hover title="Status">
                     <b-icon icon="circle-fill" scale="1.5" class="mr-2" :variant="corVariant(this.equipamento.st_operacao)"></b-icon>
                     <span :class="corTexto(this.equipamento.st_operacao)">{{ formatarStatus(this.equipamento.st_operacao) || '-' }}</span>
                  </b-col>
                  <b-col cols="4" md="2" lg="1">
                     <span id="popoverNivelAtual" class="mouse"><img width="22" v-if="formatarProduto(this.dadoSilo?.CUL).svg" :src="formatarProduto(this.dadoSilo?.CUL).svg" /> {{ formatarProduto(this.dadoSilo?.CUL).nome }}</span>
                  </b-col>
                  <b-col cols="4" md="2" lg="1">
                     <b-badge style="max-width: 30px" id="popoverConservacao" class="mt-2 p-1 d-flex justify-content-center align-items-center text-wrap mouse" :style="{ 'background-color': buscarCorNivel(this.dadoSilo?.UMS, this.dadoSilo?.TMS, this.dadoSilo?.FSV) }" pill>
                        <img width="18" class="text-danger" :src="buscarImagemConservacao(calcularConservacao(this.dadoSilo?.UMS, this.dadoSilo?.TMS))" />
                     </b-badge>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" class="mouse" v-if="!mostrarAeracao" @click="showPopoverPlenum = !showPopoverPlenum" id="popoverPlenum">
                     <b-iconstack><b-icon stacked icon="droplet-fill" shift-h="9" shift-v="" scale="1.2"></b-icon><b-icon stacked icon="thermometer-high" scale="1.8"></b-icon></b-iconstack>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" id="popover" class="m-0 p-0 mouse">
                     <img :src="require('@/assets/images/clima/' + iconeClima(clima?.weather?.[0].id, clima?.weather?.[0].icon))" width="55" style="margin: -25px -25px -25px auto" />
                  </b-col>
               </b-row>
               <b-row class="text-center text-md-left">
                  <b-col>
                     <small class="mb-0">Última atualização: {{ formatarDataHora(dadoSilo.DAT) }}</small>
                  </b-col>
               </b-row>
            </b-overlay>
         </div>
      </div>

      <div class="map_section padding_infor_info">
         <b-overlay :show="buscandoDados || buscandoDadosLeitura" rounded="sm" class="overlay" style="min-height: 400px">
            <b-row>
               <b-col>
                  <h1 class="mb-2 text-center text-md-left">Leituras da termometria</h1>
               </b-col>
            </b-row>
            <b-row>
               <b-col sm="12" md="6" lg="3" class="mb-2">
                  <b-form-group label="Consultar leituras na data">
                     <b-form-datepicker v-model="data" @input="buscarLeiturasDia()" :date-info-fn="marcaDatasOperacao" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
                  </b-form-group>
               </b-col>
               <b-col sm="12" md="6" lg="3">
                  <b-overlay :show="buscandoLeituras" rounded="sm">
                     <b-form-group label="Selecionar leitura">
                        <b-dropdown id="dropdown-left" :text="visualizacaoLeitura" variant="outline-primary" class="btn-block altura-menu" menu-class="w-100" block :disabled="buscandoDados">
                           <b-dropdown-item @click="acionarBusca(leiturasDia.leituraFria?.tp_leitura, leiturasDia.leituraFria?.dt_dado, false)" :disabled="!leiturasDia.leituraFria?.dt_dado">Leitura fria - {{ formatarData(leiturasDia.leituraFria?.dt_dado) || 'não realizada' }}</b-dropdown-item>
                           <b-dropdown-item @click="acionarBusca(leiturasDia.leituraQuente?.tp_leitura, leiturasDia.leituraQuente?.dt_dado, false)" :disabled="!leiturasDia.leituraQuente?.dt_dado">Leitura quente - {{ formatarData(leiturasDia.leituraQuente?.dt_dado) || 'não realizada' }}</b-dropdown-item>
                           <b-dropdown-item @click="acionarBusca(leiturasDia.ultimaLeitura?.tp_leitura, leiturasDia.ultimaLeitura?.dt_dado, true)" :disabled="!leiturasDia.ultimaLeitura?.dt_dado">Última leitura do dia - {{ formatarData(leiturasDia.ultimaLeitura?.dt_dado) || 'sem leituras' }}</b-dropdown-item>
                           <b-dropdown-divider v-if="leiturasDia.leituraManual?.length || leiturasDia.leituraPeriodica?.length"></b-dropdown-divider>
                           <b-dropdown-item v-for="leitura in leiturasDia.leituraManual" :key="leitura.dt_dado" @click="acionarBusca(leitura?.tp_leitura, leitura?.dt_dado, false)">Leitura manual - {{ formatarData(leitura?.dt_dado) }}</b-dropdown-item>
                           <b-dropdown-item v-for="leitura in leiturasDia.leituraPeriodica" :key="leitura.dt_dado" @click="acionarBusca(leitura?.tp_leitura, leitura?.dt_dado, false)">Leitura periódica - {{ formatarData(leitura?.dt_dado) }}</b-dropdown-item>
                        </b-dropdown>
                     </b-form-group>
                  </b-overlay>
               </b-col>
               <b-col sm="12" md="12" lg="6">
                  <div class="card text-center">
                     <span class="h6 w-60 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm">Dados da leitura</span>
                     <div class="card-body pt-0 pb-2">
                        <div class="d-flex justify-content-between flex-wrap">
                           <div class="text-center flex-fill position-relative info-item px-1" v-b-tooltip.hover title="Temperatura média">
                              <b-icon icon="thermometer-half" scale="1.3"></b-icon>
                              <span class="ml-1">{{ this.dadoLeitura?.TMS / 10 || '-' }} °C</span>
                           </div>
                           <div class="text-center flex-fill position-relative info-item px-1" v-b-tooltip.hover title="Temperatura mínima">
                              <b-iconstack><b-icon icon="thermometer-half" scale="1.4" shift-h="-4"></b-icon><b-icon icon="arrow-down" scale="1.4" shift-h="9"></b-icon></b-iconstack>
                              <span class="ml-1">{{ this.dadoLeitura?.TMI / 10 || '-' }} °C</span>
                           </div>
                           <div class="text-center flex-fill position-relative info-item px-1" v-b-tooltip.hover title="Temperatura máxima">
                              <b-iconstack><b-icon icon="thermometer-half" scale="1.4" shift-h="-4"></b-icon><b-icon icon="arrow-up" scale="1.4" shift-h="9"></b-icon></b-iconstack>
                              <span class="ml-1">{{ this.dadoLeitura?.TMA / 10 || '-' }} °C</span>
                           </div>
                           <div class="text-center flex-fill position-relative info-item px-1" id="popoverUmidade" v-b-tooltip.hover title="Umidade média">
                              <b-icon icon="droplet" scale="1.3"></b-icon>
                              <span class="ml-1" :class="{ 'text-danger': dadoSilo?.TUMI == 1 }">{{ this.dadoLeitura?.UMS / 10 || '-' }} %</span>
                              <b-icon v-if="this.dadoSilo?.TUMI == 1" icon="exclamation-lg" scale="1" variant="danger" animation="fade" class="ml-1"></b-icon>
                           </div>
                           <div class="text-center flex-fill position-relative info-item px-1 mouse" id="popoverNivel">
                              <b-icon icon="server" scale="1.3"></b-icon>
                              <span class="ml-1" v-if="this.dadoLeitura?.NIV">{{ this.dadoLeitura?.NIV / 10 || '-' }} %</span>
                              <span class="ml-1" v-else>{{ this.dadoSilo?.NIV || '-' }} %</span>
                           </div>
                           <div class="text-center flex-fill position-relative mouse">
                              <b-icon icon="cloud" scale="1.3" id="popoverLeitura"></b-icon>
                           </div>
                        </div>
                     </div>
                  </div>
               </b-col>
            </b-row>
            <b-row>
               <b-col sm="12" lg="7">
                  <div id="desenho-svg" v-show="this.dadoLeitura.pendulos" class="text-center mt-4"></div>
               </b-col>
               <b-col sm="12" lg="5">
                  <silo-pendulos v-show="this.dadoLeitura.pendulos" ref="pendulosRef" @receberPendulo="enviarPendulo"></silo-pendulos>
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
                           <img v-if="this.dadoSilo?.MOD == 1" :src="require('@/assets/images/clima/' + iconeClima(clima?.weather?.[0].id, clima?.weather?.[0].icon))" height="50" style="margin: -25px -25px -25px auto" />
                        </b-col>
                        <b-col class="p-0 ml-3">
                           <p class="texto">{{ Math.round(this.dadoSilo?.TEM) || '-' }}°</p>
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
                              <p class="texto">{{ Math.round(this.dadoSilo?.UMI) || '-' }}</p>
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
                        <p class="texto">{{ Math.round(this.dadoLeitura?.TEM) || '-' }}°</p>
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
                           <p class="texto">{{ Math.round(this.dadoLeitura?.UMI) || '-' }}</p>
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
               <span class="texto">{{ this.dadoSilo?.TPL / 10 || '-' }} °C</span>
            </b-col>
            <b-col class="text-nowrap">
               <b-icon icon="droplet" scale="1.5" class="mr-1" variant="primary"></b-icon>
               <span class="texto">{{ this.dadoSilo?.UPL || '-' }} %</span>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverNivel" target="popoverNivel" triggers="hover" placement="bottomleft" style="min-width: 400px !important">
         <template #title>Capacidade utilizada</template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="this.dadoLeitura?.VOL || this.dadoLeitura?.NIV" class="mb-0">Armazenado: {{ this.converterSacas(this.dadoSilo?.CUL, this.dadoLeitura?.VOL) || 0 }} sacas ({{ this.dadoLeitura?.NIV / 10 || '-' }} %)</p>
               <p v-else class="mb-0">Armazenado: {{ this.converterSacas(this.dadoSilo?.CUL, this.dadoSilo?.VOL) || 0 }} sacas ({{ this.dadoSilo?.NIV || '-' }} %)</p>
               <p v-if="this.dadoLeitura?.NIU == 0 || !this.dadoLeitura?.NIU" class="mb-0">Estimado pela termometria</p>
               <p v-else-if="this.dadoLeitura?.NIU == 1" class="mb-0">Estimado pelo sensor de nível</p>
               <p v-else-if="this.dadoLeitura?.NIU == 2" class="mb-0">Nível informado manualmente</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverConservacao" target="popoverConservacao" triggers="hover" placement="bottomleft" style="min-width: 300px">
         <template #title>Estado da conservação</template>
         <b-row>
            <b-col class="text-nowrap">
               <p class="mb-0">{{ this.dadoSilo.UMS == 0 ? 'Umidade não informada' : this.dadoSilo.TMS == 0 || !this.dadoSilo.TMS ? 'Conservação não calculada' : buscarConservacao(calcularConservacao(this.dadoSilo?.UMS, this.dadoSilo?.TMS)) }}</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverNivelAtual" target="popoverNivelAtual" triggers="hover" placement="bottomleft" style="min-width: 400px !important">
         <template #title>Capacidade atual</template>
         <b-row>
            <b-col class="text-nowrap">
               <p class="mb-0">Armazenado: {{ this.converterSacas(this.dadoSilo?.CUL, this.dadoSilo?.VOL) || 0 }} sacas ({{ this.dadoSilo?.NIV || '-' }} %)</p>
               <p class="mb-0">Estimado com dados atuais</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="popoverUmidade" v-if="dadoSilo?.TUMI == 1" triggers="hover" placement="bottomleft">
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
import SiloPendulos from '../components/SiloPendulos.vue'
import sojaSVG from '@/assets/images/inicio/soja.svg'
import milhoSVG from '@/assets/images/inicio/milho.svg'
import trigoSVG from '@/assets/images/inicio/trigo.svg'
import cevadaSVG from '@/assets/images/inicio/cevada.svg'
import feijaoSVG from '@/assets/images/inicio/cevada.svg'
import arrozSVG from '@/assets/images/inicio/arroz.svg'
import sorgoSVG from '@/assets/images/inicio/sorgo.svg'

export default {
   name: 'SiloDados',
   components: {
      SiloPendulos
   },
   data() {
      return {
         active: false,
         isWideScreen: window.innerWidth > 999,
         showPopover: false,
         dadoSilo: [],
         buscandoDados: false,
         equipamento: [],
         buscandoEquipamento: false,
         latitude: null,
         longitude: null,
         buscandoLocal: false,
         clima: {},
         buscandoClima: false,
         possuiAeracao: 0,
         temUmidade: 0,
         temCO2: 0,
         conservacao: 1,
         showPopoverPlenum: false,
         data: this.$moment().format('YYYY-MM-DD'),
         buscandoLeituras: false,
         visualizacaoLeitura: 'Selecionar Leitura',
         leiturasDia: {},
         dadoLeitura: {},
         buscandoDadosLeitura: false,
         showPopoverLeitura: false,
         showPopoverNivel: false,
         showPopoverConservacao: false,
         showPopoverNivelAtual: false
      }
   },

   computed: {
      ...mapState('unidade', ['unidade']),
      massaGraosTransform() {
         return this.possuiNivelRadar ? 'translate(0, +30)' : 'translate(0, 0)'
      },
      menuTransform() {
         return 'translate(0, 0)'
      },
      aeracao() {
         return this.dadoSilo?.AER == 0 ? 0 : 1
      },
      mostrarAeracao() {
         if (this.dadoSilo?.AER != 0 && this.equipamento?.id_produto != 9) {
            return false
         } else {
            return true
         }
      }
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade']),
      async buscarDados() {
         if (!this.idSilo) {
            return
         }
         this.buscandoDados = true
         const dados = await client.get(`/silo/buscardado/${this.idSilo}`).catch((err) => {
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
            this.dadoSilo = dados.data
            this.enviarModelo()
         }
      },
      async buscarEquipamento() {
         if (!this.idSilo) {
            return
         }
         this.buscandoEquipamento = true
         const dados = await client.get(`/equipamento/${this.idSilo}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar silo. ${err}`, {
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
      async buscarLeiturasDia() {
         this.tipoLeitura = null
         this.dataLeitura = null
         this.dadoPendulos = []
         this.buscandoLeituras = true
         this.dadoLeitura = {}
         this.visualizacaoLeitura = 'Selecionar leitura'
         const dados = await client.get(`/silo/buscarleituradia/${this.idSilo}?data=${this.data}`).catch((err) => {
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
         if ('dt_dado' in this.leiturasDia.leituraFria) {
            this.acionarBusca(this.leiturasDia.leituraFria?.tp_leitura, this.leiturasDia.leituraFria?.dt_dado, false)
         }
      },
      acionarBusca(tipo, data, ultimaLeitura) {
         this.mostrarTabela = true
         this.dadoPendulos = []
         const objLeitura = {
            1: 'Leitura fria',
            2: 'Leitura quente',
            3: 'Leitura manual',
            4: 'Leitura periódica'
         }
         this.visualizacaoLeitura = `${ultimaLeitura ? 'Última leitura do dia' : objLeitura[tipo]}  -  ${this.formatarData(data)}`
         this.tipoLeitura = tipo
         this.dataLeitura = data
         this.buscarLeitura()
      },
      async buscarLeitura() {
         if (!this.idSilo) {
            return
         }
         this.buscandoDadosLeitura = true
         this.dadoLeitura = {}
         this.$refs.pendulosRef.acionarBusca(this.tipoLeitura, this.dataLeitura)
         const dados = await client.get(`/silo/buscarleitura/${this.idSilo}?tipo=${this.tipoLeitura}&data=${this.dataLeitura}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar leitura. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoDadosLeitura = false
         })
         this.buscandoDadosLeitura = false
         if (dados && dados.data) {
            this.dadoLeitura = dados.data
         }
      },
      enviarPendulo(pendulo) {
         this.$emit('receberPendulo', pendulo)
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

         if (this.dadoSilo && this.dadoSilo?.CHO == 1) {
            return 'chuvoso.svg'
         } else if (this.dadoSilo && this.dadoSilo?.CHO == 0 && id && (id.charAt(0) == '2' || id.charAt(0) == '3' || id.charAt(0) == '5')) {
            return 'nublado.svg'
         } else {
            return icones[icon] || 'nublado.svg'
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
      marcaDatasOperacao(data) {
         const possuiData = this.datasOperacao.includes(data)
         return possuiData ? 'table-primary' : ''
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
      verificarBitNaPosicao(binario, posicao) {
         if (!binario) return
         const posicaoInvertida = binario.length - 1 - posicao
         return binario.charAt(posicaoInvertida) === '1'
      },
      desenhaCorteSilo(_layout_corte_silo) {
         let _desenho, _num_aeradores, _aerador
         //pega a referencia do desenho svg
         _desenho = document.getElementById('des_corte_silo')
         //deleta o desenho svg se existir
         if (_desenho != null) {
            _desenho.remove()
         }
         //verifica se possui aeradores
         // if ('aeradores' in _layout_corte_silo) {
         //    _num_aeradores = _layout_corte_silo['aeradores']['na']
         // } else {
         //    _num_aeradores = 0
         // }

         // if (this.aerador?.length) {
         _num_aeradores = this.aerador?.length
         // }
         //cria desenho svg
         _desenho = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
         _desenho.setAttribute('id', 'des_corte_silo')
         _desenho.setAttribute('xml', 'preserve')
         _desenho.setAttribute('version', '1.0')
         _desenho.setAttribute('style', 'shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd')
         _desenho.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
         // _desenho.setAttribute('width', String(_layout_corte_silo['tamanho_svg'][0]) + 'mm')
         // _desenho.setAttribute('height', String(_layout_corte_silo['tamanho_svg'][1]) + 'mm')
         _desenho.setAttribute('height', '50vh')
         _desenho.setAttribute('width', '100%')
         _desenho.setAttribute('viewBox', '0 0 ' + String(_layout_corte_silo['tamanho_svg'][0]) + ' ' + String(_layout_corte_silo['tamanho_svg'][1]))
         //faz o append do desenho no body
         // document.body.appendChild(_desenho)
         const container = document.getElementById('desenho-svg')
         container.appendChild(_desenho)
         //document.getElementById("div_top").appendChild(_desenho);
         //seleciona o layout do arco
         this.desenhaFundoSilo(_layout_corte_silo)
         //desenha sensores
         this.desenhaSensoresSilo(_layout_corte_silo)
         //desenha os aeradores
         if (_num_aeradores > 0) {
            for (_aerador = 1; _aerador <= _num_aeradores; _aerador++) {
               this.desenhaAerador(_layout_corte_silo, _aerador, _layout_corte_silo['aeradores'][String(_aerador)][2])
               this.setaAerador(_aerador, 0)
            }
         }
      },
      atualizarSilo(_dados_corte_silo, _layout_corte_silo) {
         let _id_cabos, _num_cabos, _num_sensores, _cabo, _sensor
         let _temp_sensor, _media_sensor, _nivel_sensor, _pq_sensor
         let _des_tex_nome_cabo, _des_rec_temperatura, _des_tex_temperatura, _des_rec_ponto_quente, _des_rec_erro, _falha_sensor
         //determina os ids e o numero de cabos
         _id_cabos = Object.keys(_dados_corte_silo)
         _num_cabos = Object.keys(_id_cabos).length
         //para cada cabo
         for (_cabo = 1; _cabo < _num_cabos + 1; _cabo++) {
            //determina o numero de sensores para cada cabo
            _num_sensores = Object.keys(_dados_corte_silo[_id_cabos[_cabo - 1]]).length
            //atualiza o nome do cabo
            _des_tex_nome_cabo = document.getElementById('TC' + String(_cabo))
            _des_tex_nome_cabo.textContent = String(_id_cabos[_cabo - 1])
            //para cada sensor
            for (_sensor = 1; _sensor <= _num_sensores; _sensor++) {
               //referencia dos desenhos
               _des_rec_temperatura = document.getElementById('C' + String(_cabo) + 'S' + String(_sensor))
               _des_tex_temperatura = document.getElementById('TC' + String(_cabo) + 'S' + String(_sensor))
               _des_rec_ponto_quente = document.getElementById('PQC' + String(_cabo) + 'S' + String(_sensor))
               _des_rec_erro = document.getElementById('FC' + String(_cabo) + 'S' + String(_sensor))
               //coleta as informacoes do sensor nos dados
               _temp_sensor = _dados_corte_silo[_id_cabos[_cabo - 1]][_sensor][0]
               _temp_sensor = _temp_sensor.toFixed(1)
               _media_sensor = _dados_corte_silo[_id_cabos[_cabo - 1]][_sensor][1]
               _pq_sensor = _dados_corte_silo[_id_cabos[_cabo - 1]][_sensor][2]
               _falha_sensor = _dados_corte_silo[_id_cabos[_cabo - 1]][_sensor][3]
               _nivel_sensor = _dados_corte_silo[_id_cabos[_cabo - 1]][_sensor][4]
               //escreve temperatura
               _des_tex_temperatura.textContent = String(_temp_sensor)
               //calcula a escala de cores conforme a temperatura
               //temperatura < 12 graus
               if (_temp_sensor < 12) {
                  _des_rec_temperatura.setAttribute('fill', '#0384fc')
                  _des_tex_temperatura.setAttribute('fill', 'white')
               }
               //temperatura >= 12 e < 15
               else if (_temp_sensor < 15) {
                  _des_rec_temperatura.setAttribute('fill', '#03e8fc')
                  _des_tex_temperatura.setAttribute('fill', 'black')
               }
               //temperatura >= 15 e < 17
               else if (_temp_sensor < 17) {
                  _des_rec_temperatura.setAttribute('fill', '#03fcbe')
                  _des_tex_temperatura.setAttribute('fill', 'black')
               }
               //temperatura >= 17 e < 21
               else if (_temp_sensor < 21) {
                  _des_rec_temperatura.setAttribute('fill', '#07fc03')
                  _des_tex_temperatura.setAttribute('fill', 'black')
               }
               //temperatura >= 21 e < 25
               else if (_temp_sensor < 25) {
                  _des_rec_temperatura.setAttribute('fill', '#c3ff00')
                  _des_tex_temperatura.setAttribute('fill', 'black')
               }
               //temperatura >= 25 e < 27
               else if (_temp_sensor < 27) {
                  _des_rec_temperatura.setAttribute('fill', '#fcf803')
                  _des_tex_temperatura.setAttribute('fill', 'black')
               }
               //temperatura >= 27 e < 30
               else if (_temp_sensor < 30) {
                  _des_rec_temperatura.setAttribute('fill', '#ffb300')
                  _des_tex_temperatura.setAttribute('fill', 'black')
               }
               //temperatura >= 30 e < 35
               else if (_temp_sensor < 35) {
                  _des_rec_temperatura.setAttribute('fill', '#ff2200')
                  _des_tex_temperatura.setAttribute('fill', 'white')
               }
               //se a escala usada for padrao ate o lilas
               if (_layout_corte_silo['desenho_sensores'].escala_cores_sensores == 1) {
                  //temperatura >= 35 e < 50
                  if (_temp_sensor >= 35 && _temp_sensor < 50) {
                     _des_rec_temperatura.setAttribute('fill', '#ff0090')
                     _des_tex_temperatura.setAttribute('fill', 'white')
                  }
                  //temperatura > 50
                  else if (_temp_sensor >= 50) {
                     _des_rec_temperatura.setAttribute('fill', '#f700ff')
                     _des_tex_temperatura.setAttribute('fill', 'white')
                  }
               } else {
                  if (_temp_sensor >= 35) {
                     _des_rec_temperatura.setAttribute('fill', '#ff2200')
                     _des_tex_temperatura.setAttribute('fill', 'white')
                  }
               }
               //se o sensor participa do calculo da media
               if (_media_sensor == true) {
                  _des_rec_temperatura.setAttribute('stroke', 'black')
                  _des_rec_temperatura.setAttribute('stroke-width', '0.6')
               }
               //se nao participa do calculo da media
               else {
                  _des_rec_temperatura.setAttribute('stroke', 'black')
                  _des_rec_temperatura.setAttribute('stroke-width', '0.25')
               }
               //se o sensor e um ponto quente
               if (_pq_sensor == true) {
                  _des_rec_ponto_quente.setAttribute('visibility', 'visible')
               } else {
                  _des_rec_ponto_quente.setAttribute('visibility', 'hidden')
               }
               //se o sensor possui falha
               if (_falha_sensor == true) {
                  _des_rec_erro.setAttribute('visibility', 'visible')
                  _des_tex_temperatura.setAttribute('font-size', String(_layout_corte_silo['desenho_sensores'].escala_sensores * 0.4 - 1.5))
                  _des_tex_temperatura.textContent = 'ERRO'
               } else {
                  _des_rec_erro.setAttribute('visibility', 'hidden')
               }
               //se o sensor esta fora do nivel
               if (_nivel_sensor == false) {
                  _des_rec_temperatura.setAttribute('fill', '#e6e6e6')
                  _des_rec_temperatura.setAttribute('stroke', 'black')
                  _des_tex_temperatura.setAttribute('fill', 'black')
               }
            }
         }
      },
      desenhaFundoSilo(_dados_corte_silo) {
         let _lb, _hb, _hs, _eb
         let _p1, _p2, _p3, _p4, _p5, _points
         let _desenho, _des_elipse_base_1, _des_elipse_base_2, _des_poligono_fundo, _des_path_telhado, _grupo_1
         //pega a referencia do desenho svg
         _desenho = document.getElementById('des_corte_silo')
         //recebe os parametros do desenho
         _lb = _dados_corte_silo['desenho_corte_silo']['lb']
         _hs = _dados_corte_silo['desenho_corte_silo']['hs']
         _hb = _dados_corte_silo['desenho_corte_silo']['hb']
         _eb = _dados_corte_silo['desenho_corte_silo']['eb']
         //cria o grupo para o desenho de fundo
         _grupo_1 = document.createElementNS('http://www.w3.org/2000/svg', 'g')
         _grupo_1.setAttribute('id', 'g_des_fundo')
         //cria o desenho da elipse do fundo (base)
         _des_elipse_base_1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
         _des_elipse_base_1.setAttribute('id', 'des_elipse_base_1')
         _des_elipse_base_1.setAttribute('fill', '#999999')
         _des_elipse_base_1.setAttribute('cx', String(_lb / 2))
         _des_elipse_base_1.setAttribute('cy', String(_hs))
         _des_elipse_base_1.setAttribute('rx', String(_lb / 2))
         _des_elipse_base_1.setAttribute('ry', String(_hb))
         //cria o desenho da elipse do fundo (sombra da base)
         _des_elipse_base_2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
         _des_elipse_base_2.setAttribute('id', 'des_elipse_base_2')
         _des_elipse_base_2.setAttribute('fill', '#CCCCCC')
         _des_elipse_base_2.setAttribute('cx', String(_lb / 2))
         _des_elipse_base_2.setAttribute('cy', String(_hs - _eb))
         _des_elipse_base_2.setAttribute('rx', String(_lb / 2))
         _des_elipse_base_2.setAttribute('ry', String(_hb))
         //calcula os pontos do poligono
         _p1 = [0, _hs]
         _p2 = [_lb, _hs]
         _p3 = [_lb, _hb * 1.75]
         _p4 = [_lb / 2, 0]
         _p5 = [0, _hb * 1.75]
         //forma a string com o path
         _points = String(_p1[0]) + ',' + String(_p1[1]) + ' ' + String(_p2[0]) + ',' + String(_p2[1]) + ' ' + String(_p3[0]) + ',' + String(_p3[1]) + ' ' + String(_p4[0]) + ',' + String(_p4[1]) + ' ' + String(_p5[0]) + ',' + String(_p5[1])
         //cria o desenho da poligono do fundo
         _des_poligono_fundo = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
         _des_poligono_fundo.setAttribute('id', 'des_poligono_fundo')
         _des_poligono_fundo.setAttribute('fill', '#E7E7E7')
         _des_poligono_fundo.setAttribute('points', _points)
         //cria o desenho do telhado
         _des_path_telhado = document.createElementNS('http://www.w3.org/2000/svg', 'path')
         _des_path_telhado.setAttribute('id', 'des_path_telhado')
         _des_path_telhado.setAttribute('fill', '#999999')
         _des_path_telhado.setAttribute('d', 'M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z')
         _des_path_telhado.setAttribute('transform', 'scale(' + String(_lb / 152) + ',' + String(_hb / 15) + ')')
         //faz o append dos desenhos no grupo
         _grupo_1.appendChild(_des_poligono_fundo)
         _grupo_1.appendChild(_des_path_telhado)
         _grupo_1.appendChild(_des_elipse_base_1)
         _grupo_1.appendChild(_des_elipse_base_2)
         //verifica se possui aeradores e desloca desenho
         if (_dados_corte_silo['aeradores'].na > 0) {
            let _dist_silo = Number(_dados_corte_silo['aeradores'].ds) + 34
            _grupo_1.setAttribute('transform', 'translate(' + String(_dist_silo) + ' 0)')
         }
         //faz o append do grupo no desenho
         _desenho.appendChild(_grupo_1)
      },
      desenhaAerador(_dados_corte_silo, _id_aerador, _texto_acima) {
         let _desenho, _grupo_aerador, _grupo_blade_parado, _des_rec_nome, _des_text_nome, _des_circulo, _des_blade_parada, _des_blade_girando, _animacao_blade, _grupo_blade_girando
         let _pos_y, _pos_x
         //pega a referencia do desenho svg
         _desenho = document.getElementById('des_corte_silo')
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
         _pos_y = Number(_dados_corte_silo['desenho_corte_silo'].hs) + Number(_dados_corte_silo['aeradores'].dy) - 30
         _pos_x = Number(_dados_corte_silo['desenho_corte_silo'].lb) + Number(_dados_corte_silo['aeradores'].ds * 2) - 31
         if (_id_aerador == 1) {
            document.getElementById('aerador_' + String(_id_aerador)).setAttribute('transform', 'translate(' + String(-73) + ' ' + String(_pos_y) + ')')
         } else if (_id_aerador == 2) {
            document.getElementById('aerador_' + String(_id_aerador)).setAttribute('transform', 'translate(' + String(_pos_x) + ' ' + String(_pos_y) + ')')
         } else if (_id_aerador == 3) {
            document.getElementById('aerador_' + String(_id_aerador)).setAttribute('transform', 'translate(' + String(-73) + ' ' + String(_pos_y - 35 - Number(_dados_corte_silo['aeradores'].da)) + ')')
         } else if (_id_aerador == 4) {
            document.getElementById('aerador_' + String(_id_aerador)).setAttribute('transform', 'translate(' + String(_pos_x) + ' ' + String(_pos_y - 35 - Number(_dados_corte_silo['aeradores'].da)) + ')')
         } else if (_id_aerador == 5) {
            document.getElementById('aerador_' + String(_id_aerador)).setAttribute('transform', 'translate(' + String(-73) + ' ' + String(_pos_y - 70 - Number(_dados_corte_silo['aeradores'].da) * 2) + ')')
         } else if (_id_aerador == 6) {
            document.getElementById('aerador_' + String(_id_aerador)).setAttribute('transform', 'translate(' + String(_pos_x) + ' ' + String(_pos_y - 70 - Number(_dados_corte_silo['aeradores'].da) * 2) + ')')
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
      desenhaSensoresSilo(_dados_corte_silo) {
         let _desenho, _des_rec_nome_cabo, _des_tex_nome_cabo, _des_tex_nome_sensor, _des_rec_temperatura, _des_tex_temperatura, _des_rec_erro, _des_rec_ponto_quente, _anim_pq
         let _id_cabos, _num_cabos, _num_sensores, _cabo, _sensor
         let _escala_sensores, _dist_y_sensores, _pos_x_cabo, _pos_y_cabo, _dist_y_nome_cabo, _nome_cabo_acima, _nome_sensores_direita, _pos_x_cabos_uniforme
         // let _escala_cores_sensores
         //determina os ids e numero dos cabos
         _id_cabos = Object.keys(_dados_corte_silo['cabos'])
         _num_cabos = _id_cabos.length
         //recebe os parametros do desenho
         _escala_sensores = Number(_dados_corte_silo['desenho_sensores']['escala_sensores'])
         _nome_sensores_direita = Number(_dados_corte_silo['desenho_sensores']['nome_sensores_direita'])
         // _escala_cores_sensores = Number(_dados_corte_silo['desenho_sensores']['escala_cores_sensores'])
         _dist_y_nome_cabo = _dados_corte_silo['desenho_sensores']['dist_y_nome_cabo']
         _nome_cabo_acima = Number(_dados_corte_silo['desenho_sensores']['nome_cabo_acima'])
         _dist_y_sensores = Number(_dados_corte_silo['desenho_sensores']['dist_y_sensores'])
         _pos_y_cabo = _dados_corte_silo['desenho_sensores']['pos_y_cabo']
         _pos_x_cabo = _dados_corte_silo['desenho_sensores']['pos_x_cabo']
         _pos_x_cabos_uniforme = Number(_dados_corte_silo['desenho_sensores']['pos_x_cabos_uniforme'])
         //pega a referencia do desenho svg
         _desenho = document.getElementById('des_corte_silo')
         //para cada cabo
         for (_cabo = 1; _cabo < _num_cabos + 1; _cabo++) {
            //determina o numero de sensores para cada cabo
            _num_sensores = _dados_corte_silo['cabos'][String(_cabo)]
            //cria o desenho do retangulo que contem o nome do cabo
            _des_rec_nome_cabo = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            _des_rec_nome_cabo.setAttribute('id', 'C' + _cabo)
            _des_rec_nome_cabo.setAttribute('width', String(_escala_sensores))
            _des_rec_nome_cabo.setAttribute('height', String(_escala_sensores / 2))
            _des_rec_nome_cabo.setAttribute('rx', '2')
            _des_rec_nome_cabo.setAttribute('ry', '2')
            _des_rec_nome_cabo.setAttribute('fill', '#3A78FD')
            //cria o desenho do texto com o nome do cabo
            _des_tex_nome_cabo = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            _des_tex_nome_cabo.setAttribute('id', 'TC' + _cabo)
            _des_tex_nome_cabo.setAttribute('text-anchor', 'middle')
            _des_tex_nome_cabo.setAttribute('dominant-baseline', 'central')
            _des_tex_nome_cabo.setAttribute('font-weight', 'bold')
            _des_tex_nome_cabo.setAttribute('font-size', String(_escala_sensores * 0.4 - 0.5))
            _des_tex_nome_cabo.setAttribute('font-family', 'Arial')
            _des_tex_nome_cabo.textContent = String(_id_cabos[_cabo - 1])
            _des_tex_nome_cabo.setAttribute('fill', 'white')
            //posiciona em x
            if (_pos_x_cabos_uniforme == 0) {
               _des_rec_nome_cabo.setAttribute('x', _pos_x_cabo[_cabo - 1])
               _des_tex_nome_cabo.setAttribute('x', _pos_x_cabo[_cabo - 1] + _escala_sensores / 2)
            } else {
               _des_rec_nome_cabo.setAttribute('x', _pos_x_cabo[0] + _pos_x_cabo[1] * (_cabo - 1))
               _des_tex_nome_cabo.setAttribute('x', _pos_x_cabo[0] + _pos_x_cabo[1] * (_cabo - 1) + _escala_sensores / 2)
            }
            //posiciona em y abaixo ou acima
            if (_nome_cabo_acima == 1) {
               _des_rec_nome_cabo.setAttribute('y', _pos_y_cabo[_cabo - 1] - (_num_sensores + 1) * _dist_y_sensores - _dist_y_nome_cabo[_cabo - 1])
               _des_tex_nome_cabo.setAttribute('y', _pos_y_cabo[_cabo - 1] - (_num_sensores + 1) * _dist_y_sensores + _escala_sensores / 4 - _dist_y_nome_cabo[_cabo - 1])
            } else {
               _des_rec_nome_cabo.setAttribute('y', _pos_y_cabo[_cabo - 1] + _dist_y_nome_cabo[_cabo - 1])
               _des_tex_nome_cabo.setAttribute('y', _pos_y_cabo[_cabo - 1] + _dist_y_nome_cabo[_cabo - 1] + _escala_sensores / 4)
            }
            //para cada sensor
            for (_sensor = 1; _sensor <= _num_sensores; _sensor++) {
               //cria o desenho do texto com o nome do sensor
               _des_tex_nome_sensor = document.createElementNS('http://www.w3.org/2000/svg', 'text')
               _des_tex_nome_sensor.setAttribute('id', 'TIND' + _cabo + 'S' + _sensor)
               _des_tex_nome_sensor.setAttribute('dominant-baseline', 'central')
               _des_tex_nome_sensor.setAttribute('font-weight', 'bold')
               _des_tex_nome_sensor.setAttribute('font-size', String(_escala_sensores * 0.4 - 1.5))
               _des_tex_nome_sensor.setAttribute('font-family', 'Arial')
               _des_tex_nome_sensor.setAttribute('y', _pos_y_cabo[_cabo - 1] + _escala_sensores / 2 / 2 - _dist_y_sensores * _sensor)
               _des_tex_nome_sensor.textContent = 'S' + _sensor
               _des_tex_nome_sensor.setAttribute('fill', 'black')
               //posiciona o nome do sensor na direita ou na esquerda do cabo
               if (_nome_sensores_direita == 0) {
                  _des_tex_nome_sensor.setAttribute('text-anchor', 'end')
                  //posiciona em x
                  if (_pos_x_cabos_uniforme == 0) {
                     _des_tex_nome_sensor.setAttribute('x', _pos_x_cabo[_cabo - 1] - 2)
                  } else {
                     _des_tex_nome_sensor.setAttribute('x', _pos_x_cabo[0] + _pos_x_cabo[1] * (_cabo - 1) - 2)
                  }
               } else {
                  _des_tex_nome_sensor.setAttribute('text-anchor', 'start')
                  //posiciona em x
                  if (_pos_x_cabos_uniforme == 0) {
                     _des_tex_nome_sensor.setAttribute('x', _pos_x_cabo[_cabo - 1] + _escala_sensores + 2)
                  } else {
                     _des_tex_nome_sensor.setAttribute('x', _pos_x_cabo[0] + _pos_x_cabo[1] * (_cabo - 1) + _escala_sensores + 2)
                  }
               }
               //cria o desenho do retangulo que indica a temperatura com a escala de cores
               _des_rec_temperatura = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
               _des_rec_temperatura.setAttribute('id', 'C' + _cabo + 'S' + _sensor)
               _des_rec_temperatura.setAttribute('width', String(_escala_sensores))
               _des_rec_temperatura.setAttribute('height', String(_escala_sensores / 2))
               _des_rec_temperatura.setAttribute('rx', '2')
               _des_rec_temperatura.setAttribute('ry', '2')
               _des_rec_temperatura.setAttribute('y', _pos_y_cabo[_cabo - 1] - _dist_y_sensores * _sensor)
               //cria o desenho do texto com a temperatura
               _des_tex_temperatura = document.createElementNS('http://www.w3.org/2000/svg', 'text')
               _des_tex_temperatura.setAttribute('id', 'TC' + _cabo + 'S' + _sensor)
               _des_tex_temperatura.setAttribute('text-anchor', 'middle')
               _des_tex_temperatura.setAttribute('dominant-baseline', 'central')
               _des_tex_temperatura.setAttribute('font-weight', 'bold')
               _des_tex_temperatura.setAttribute('font-size', String(_escala_sensores * 0.4 - 0.5))
               _des_tex_temperatura.setAttribute('font-family', 'Arial')
               _des_tex_temperatura.setAttribute('y', _pos_y_cabo[_cabo - 1] + _escala_sensores / 2 / 2 - _dist_y_sensores * _sensor)
               _des_tex_temperatura.textContent = '0'
               //cria o desenho retangulo de sensor com erro
               _des_rec_erro = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
               _des_rec_erro.setAttribute('id', 'FC' + _cabo + 'S' + _sensor)
               _des_rec_erro.setAttribute('width', String(_escala_sensores + 1))
               _des_rec_erro.setAttribute('height', String(_escala_sensores / 2 + 1))
               _des_rec_erro.setAttribute('rx', '2')
               _des_rec_erro.setAttribute('ry', '2')
               _des_rec_erro.setAttribute('y', _pos_y_cabo[_cabo - 1] - 0.5 - _dist_y_sensores * _sensor)
               _des_rec_erro.setAttribute('fill-opacity', 0.6)
               _des_rec_erro.setAttribute('fill', 'red')
               //_grupo_ponto_quente = document.createElementNS("http://www.w3.org/2000/svg", "g");
               //_grupo_ponto_quente.setAttribute("id", ("PQC" + _cabo + "S" + _sensor));
               //cria o desenho do retangulo de ponto quente
               _des_rec_ponto_quente = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
               _des_rec_ponto_quente.setAttribute('id', 'PQC' + _cabo + 'S' + _sensor)
               _des_rec_ponto_quente.setAttribute('y', _pos_y_cabo[_cabo - 1] - 0.5 - _dist_y_sensores * _sensor)
               _des_rec_ponto_quente.setAttribute('width', String(_escala_sensores + 1))
               _des_rec_ponto_quente.setAttribute('height', String(_escala_sensores / 2 + 1))
               _des_rec_ponto_quente.setAttribute('rx', '2')
               _des_rec_ponto_quente.setAttribute('ry', '2')
               _des_rec_ponto_quente.setAttribute('fill', 'red')
               //cria animacao
               _anim_pq = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform')
               _anim_pq.setAttribute('attributeName', 'transform')
               _anim_pq.setAttribute('type', 'scale')
               _anim_pq.setAttribute('additive', 'sum')
               _anim_pq.setAttribute('from', '1.15')
               _anim_pq.setAttribute('to', '0.8')
               _anim_pq.setAttribute('dur', '1s')
               _anim_pq.setAttribute('repeatCount', 'indefinite')
               //posiciona em x
               if (_pos_x_cabos_uniforme == 0) {
                  _des_rec_temperatura.setAttribute('x', _pos_x_cabo[_cabo - 1])
                  _des_tex_temperatura.setAttribute('x', _pos_x_cabo[_cabo - 1] + _escala_sensores / 2)
                  _des_rec_erro.setAttribute('x', _pos_x_cabo[_cabo - 1] - 0.5)
                  _des_rec_ponto_quente.setAttribute('x', _pos_x_cabo[_cabo - 1] - 0.5)
                  _des_rec_ponto_quente.setAttribute('transform-origin', String(_pos_x_cabo[_cabo - 1] + _escala_sensores + (_escala_sensores + 2) / 2 - 1) + ' ' + String(_pos_y_cabo[_cabo - 1] - 1 - _dist_y_sensores * _sensor + _escala_sensores / 2 / 2 + 2))
               } else {
                  _des_rec_temperatura.setAttribute('x', _pos_x_cabo[0] + _pos_x_cabo[1] * (_cabo - 1))
                  _des_tex_temperatura.setAttribute('x', _pos_x_cabo[0] + _pos_x_cabo[1] * (_cabo - 1) + _escala_sensores / 2)
                  _des_rec_erro.setAttribute('x', _pos_x_cabo[0] + _pos_x_cabo[1] * (_cabo - 1) - 0.5)
                  _des_rec_ponto_quente.setAttribute('x', _pos_x_cabo[0] + _pos_x_cabo[1] * (_cabo - 1) - 0.5)
                  _des_rec_ponto_quente.setAttribute('transform-origin', String(_pos_x_cabo[0] + _pos_x_cabo[1] * (_cabo - 1) + (_escala_sensores + 2) / 2 - 1) + ' ' + String(_pos_y_cabo[_cabo - 1] - 1 - _dist_y_sensores * _sensor + _escala_sensores / 2 / 2 + 2))
               }
               //verifica se possui aeradores e desloca desenho
               if ('aeradores' in _dados_corte_silo) {
                  _des_rec_nome_cabo.setAttribute('transform', 'translate(34 0)')
                  _des_tex_nome_cabo.setAttribute('transform', 'translate(34 0)')
                  _des_tex_nome_sensor.setAttribute('transform', 'translate(34 0)')
                  _des_rec_ponto_quente.setAttribute('transform', 'translate(34 0)')
                  _des_rec_temperatura.setAttribute('transform', 'translate(34 0)')
                  _des_tex_temperatura.setAttribute('transform', 'translate(34 0)')
                  _des_rec_erro.setAttribute('transform', 'translate(34 0)')
               }
               //faz o append dos elementos no desenho svg
               _desenho.appendChild(_des_rec_nome_cabo)
               _desenho.appendChild(_des_tex_nome_cabo)
               _desenho.appendChild(_des_tex_nome_sensor)
               //_grupo_ponto_quente.appendChild(_des_rec_ponto_quente);
               _des_rec_ponto_quente.appendChild(_anim_pq)
               _desenho.appendChild(_des_rec_ponto_quente)
               _desenho.appendChild(_des_rec_temperatura)
               _desenho.appendChild(_des_tex_temperatura)
               _desenho.appendChild(_des_rec_erro)
            }
         }
      },
      // Método para emitir evento de alteração de tipo de gráfico
      emitirEvento(tipoGrafico) {
         this.$emit('alterar-tipo-grafico', tipoGrafico)
         if (!this.isWideScreen) {
            window.scrollTo({ top: 640, behavior: 'smooth' })
         }
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
      toggleMenu() {
         this.active = !this.active
      },
      handleResize() {
         this.isWideScreen = window.innerWidth > 999
      },
      enviarModelo() {
         // this.$emit('modeloSilo', this.dadoSilo.SMOD)
         this.$refs.pendulosRef.receberModelo(this.dadoSilo.SMOD)
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
      this.buscarDados()
      this.buscarEquipamento()
      this.buscarLocal()
      this.buscarLeiturasDia()
      this.emitirEvento('temperatura')
      window.scrollTo(0, 0)
   },

   watch: {
      dadoSilo(newValue) {
         if (newValue) {
            // this.aeracao definido no computed
            this.possuiAeracao = this.aeracao
            this.aerador = this.dadoSilo?.AER != '0' ? this.dadoSilo?.AER?.split(',') : []
            this.conservacao = this.calcularConservacao(this.dadoSilo?.UMS, this.dadoSilo?.TMS)
         }
      },
      dadoLeitura(newValue) {
         if (newValue && this.dadoLeitura.pendulos) {
            this.desenhaCorteSilo(this.dadoLeitura.configuracao)
            this.atualizarSilo(this.dadoLeitura.pendulos, this.dadoLeitura.configuracao)
            if (this.aerador?.length && this.possuiAeracao) {
               for (let i = 0; i < this.aerador.length; i++) {
                  const valor = this.verificarBitNaPosicao(this.dadoSilo?.FMA, i) ? 2 : this.verificarBitNaPosicao(this.dadoSilo.EMA, i) ? 1 : 0
                  this.setaAerador(i + 1, valor)
               }
            }
         }
      },
      mostrarAeracao() {
         this.$emit('mostrarAeracao', this.mostrarAeracao)
      }
   }
}
</script>
  
<style scoped>
.status {
   font-size: 18px;
   font-weight: 300;
}

.overlay {
   z-index: 0;
}

.temperatura {
   font-size: 30px;
   color: black;
}

.margem {
   margin: -21px;
}

.texto {
   font-size: 18px;
   font-weight: 300;
   color: black;
}

.umidade {
   font-size: 20px;
   font-weight: 300;
   color: black;
}

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