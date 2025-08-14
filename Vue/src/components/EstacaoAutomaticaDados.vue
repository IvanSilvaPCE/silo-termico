<template>
   <div class="white_shd full margin_bottom_30">
      <div class="full graph_head">
         <div class="heading1 margin_0">
            <h2 v-if="!temEstacao && !buscandoEstacao">Dados do clima obtidos de satélite</h2>
            <h2 v-else>Últimos dados recebidos</h2>
            <small v-if="!temEstacao">Data: {{ formatarDataUnix(clima?.current?.dt) }}</small>
            <small v-else>Data: {{ formatarData(dadosEstacao?.DAT) }}</small>
         </div>
      </div>
      <div class="map_section padding_infor_info">
         <b-overlay :show="isBusy || buscandoLocal || buscandoEstacao || buscandoResumo" rounded="sm">
            <b-row v-if="Object.keys(clima).length > 0 || dadosEstacao" :class="{ 'ml-5': isWideScreen }">
               <b-col sm="12" lg="4" class="shadow borda">
                  <b-row class="justify-content-center">
                     <b-row class="align-items-center text-center">
                        <b-col sm="6" lg="6">
                           <img v-if="!temEstacao" :src="require('@/assets/images/clima/' + iconeClima(clima?.current?.weather[0]?.icon))" width="220" style="margin-top: -20px; margin-bottom: -20px" />
                           <img v-else :src="require('@/assets/images/clima/' + iconeClimaEstacao(clima?.current?.weather[0]?.id, clima?.current?.weather[0]?.icon))" width="220" style="margin-top: -20px; margin-bottom: -20px" />
                        </b-col>
                        <b-col sm="6" lg="6" class="text-center text-md-start">
                           <p v-if="!temEstacao" class="temperatura">{{ Math.round(clima?.current?.temp) }}°</p>
                           <p v-else class="temperatura">{{ typeof dadosEstacao?.TEM === 'number' ? Math.round(dadosEstacao.TEM) : '-' }}°</p>
                        </b-col>
                     </b-row>
                  </b-row>
                  <b-row class="ml-0 ml-md-5 justify-content-center justify-content-md-start">
                     <h4 v-if="!temEstacao" class="">{{ descricaoClima(clima?.current?.weather[0]?.id) }}</h4>
                     <h4 v-else class="">{{ descricaoClimaEstacao(clima?.current?.weather[0]?.id) }}</h4>
                  </b-row>
               </b-col>
               <b-col sm="12" lg="8" class="">
                  <b-row class="p-2 mb-2 mt-1">
                     <b-col sm="6" lg="4" class="shadow borda pb-3 pt-3" :class="{ 'mr-2 ml-2': isWideScreen }">
                        <b-row>
                           <b-col cols="12" class="text-center">
                              <p class="texto">Temperaturas</p>
                           </b-col>
                        </b-row>
                        <b-row class="justify-content-center align-items-center">
                           <b-col cols="3">
                              <img src="@/assets/images/clima/maxima.png" width="45" v-b-tooltip.hover title="Máxima prevista" />
                           </b-col>
                           <b-col cols="2">
                              <p class="valor">{{ Math.round(clima.daily?.[0]?.temp?.max) }}°</p>
                           </b-col>
                           <b-col cols="3">
                              <img src="@/assets/images/clima/minima.png" width="45" v-b-tooltip.hover title="Mínima prevista" />
                           </b-col>
                           <b-col cols="2">
                              <p class="valor">{{ Math.round(clima.daily?.[0]?.temp?.min) }}°</p>
                           </b-col>
                        </b-row>
                     </b-col>
                     <b-col sm="6" lg="3" class="shadow borda pb-3 pt-3" :class="{ 'mr-2': isWideScreen }" v-if="!estacaoAux">
                        <b-row>
                           <b-col cols="12" class="text-center">
                              <p v-if="!temEstacao" class="texto">Chuva mm</p>
                              <p v-else class="texto">Chuva diária mm</p>
                           </b-col>
                        </b-row>
                        <b-row class="justify-content-center align-items-center">
                           <b-col cols="1">
                              <img src="@/assets/images/clima/pluviometro.png" height="45" v-b-tooltip.hover :title="!temEstacao ? 'Pluviômetro última hora' : ''" />
                           </b-col>
                           <b-col cols="5">
                              <p v-if="!temEstacao" class="valor">{{ clima?.current?.rain?.['1h'] ?? 0 }}</p>
                              <p v-else class="valor">{{ dadosEstacao?.PLU1D }}</p>
                           </b-col>
                        </b-row>
                     </b-col>
                     <b-col sm="6" lg="4" class="shadow borda pb-3 pt-3" :class="{ 'mt-2': !isWideScreen }" v-if="!estacaoAux">
                        <b-row>
                           <b-col cols="12" class="text-center">
                              <p class="texto">Vento km/h</p>
                           </b-col>
                        </b-row>
                        <b-row class="justify-content-center align-items-center">
                           <b-col cols="3">
                              <img src="@/assets/images/clima/vento.png" width="45" v-b-tooltip.hover title="Velocidade" />
                           </b-col>
                           <b-col cols="3">
                              <p v-if="!temEstacao" class="valor" v-b-tooltip.hover :title="'Rajada: ' + clima?.current?.wind_gust">{{ clima?.current?.wind_speed }}</p>
                              <p v-else class="valor" v-b-tooltip.hover :title="'Rajada: ' + (dadosEstacao && dadosEstacao.RAJ ? dadosEstacao.RAJ : 0)">{{ dadosEstacao?.VEL }}</p>
                           </b-col>
                           <b-col cols="3">
                              <img src="@/assets/images/clima/direcao-vento.png" width="45" v-b-tooltip.hover title="Direção" />
                           </b-col>
                           <b-col cols="2">
                              <p v-if="!temEstacao" class="valor" v-b-tooltip.hover :title="tooltipVento(formatarVento(clima?.current.wind_deg))">{{ formatarVento(clima?.current.wind_deg) }}</p>
                              <p v-else class="valor" v-b-tooltip.hover :title="tooltipVentoEstacao(dadosEstacao?.DIR)">{{ formatarVentoEstacao(dadosEstacao?.DIR) }}</p>
                           </b-col>
                        </b-row>
                     </b-col>
                     <!-- </b-row>
                  <b-row class="p-2"> -->
                     <b-col sm="6" lg="4" class="shadow borda pb-3 pt-3 p-2" :class="{ 'mr-2 ml-2 mt-3': isWideScreen, 'mt-2': !isWideScreen }" v-if="!estacaoAux">
                        <b-row>
                           <b-col cols="12" class="text-center">
                              <p class="texto">Pressão atmosférica hPa</p>
                           </b-col>
                        </b-row>
                        <b-row class="justify-content-center align-items-center">
                           <b-col cols="4">
                              <img src="@/assets/images/clima/pressao.png" width="45" v-b-tooltip.hover title="Pressão Atmosférica" />
                           </b-col>
                           <b-col cols="3">
                              <p v-if="!temEstacao" class="valor">{{ clima?.current?.pressure }}</p>
                              <p v-else class="valor">{{ dadosEstacao?.PRE }}</p>
                           </b-col>
                        </b-row>
                     </b-col>
                     <b-col sm="6" lg="3" class="shadow borda pb-3 pt-3" :class="{ 'mr-2 mt-3': isWideScreen, 'mt-2': !isWideScreen }" v-if="!estacaoAux">
                        <b-row>
                           <b-col cols="12" class="text-center">
                              <p class="texto">Ponto de orvalho</p>
                           </b-col>
                        </b-row>
                        <b-row class="justify-content-center align-items-center">
                           <b-col cols="3" class="mr-1">
                              <img src="@/assets/images/clima/orvalho.png" width="45" v-b-tooltip.hover title="Ponto de Orvalho" />
                           </b-col>
                           <b-col cols="5">
                              <p v-if="!temEstacao" class="valor">{{ Math.round(clima?.current?.dew_point) ?? '-' }}°</p>
                              <p v-else class="valor">{{ Math.round(dadosEstacao?.ORV) ?? '-' }}°</p>
                           </b-col>
                        </b-row>
                     </b-col>
                     <b-col sm="6" lg="4" class="shadow borda pb-3 pt-3" :class="{ 'mt-3': isWideScreen && !estacaoAux, 'mt-2': !isWideScreen }">
                        <b-row>
                           <b-col cols="12" class="text-center">
                              <p class="texto">Umidade</p>
                           </b-col>
                        </b-row>
                        <b-row class="justify-content-center align-items-center">
                           <b-col cols="3">
                              <img src="@/assets/images/clima/umidade.png" width="45" />
                           </b-col>
                           <b-col cols="3">
                              <p v-if="!temEstacao" class="valor">{{ clima?.current?.humidity }}%</p>
                              <p v-else class="valor">{{ dadosEstacao?.UMI }}%</p>
                           </b-col>
                           <!-- <b-col cols="2">
                              <img src="@/assets/images/clima/umidade.png" width="45" v-b-tooltip.hover title="Mínima" />
                           </b-col>
                           <b-col cols="3">
                              <p class="valor">-%</p>
                           </b-col> -->
                        </b-row>
                     </b-col>
                  </b-row>
               </b-col>
            </b-row>
            <b-row v-if="Object.keys(clima).length > 0" class="p-2 mt-3">
               <b-col lg="12" class="shadow borda card-container">
                  <b-row>
                     <b-col>
                        <div class="full graph_head">
                           <div class="heading1" style="margin-top: 0px">
                              <h2>Previsão próximas horas</h2>
                           </div>
                        </div>
                     </b-col>
                  </b-row>
                  <div class="d-flex overflow-auto" ref="scrollContainer" v-on:wheel.prevent="handleWheelScroll">
                     <b-col v-for="(h, index) in clima?.hourly" :key="index" style="padding: 0px">
                        <b-card align="center" style="border: none">
                           <b-card-text>
                              <p>{{ formatarDataHora(h?.dt) }}</p>
                              <img v-if="clima" :src="require('@/assets/images/clima/' + iconeClima(h?.weather[0]?.icon))" width="50" v-b-tooltip.hover :title="descricaoClima(h?.weather[0]?.id)" />
                              <p>{{ Math.round(h?.temp) }}°</p>
                              <b-row>
                                 <b-col cols="12" class="">
                                    <b-row>
                                       <b-col cols="1" class="pr-1">
                                          <img src="@/assets/images/clima/gota.png" width="15" />
                                       </b-col>
                                       <b-col cols="2" class="text-nowrap">
                                          <p>{{ Math.round(h?.pop * 100) }}%</p>
                                       </b-col>
                                    </b-row>
                                 </b-col>
                              </b-row>
                           </b-card-text>
                        </b-card>
                     </b-col>
                  </div>
               </b-col>
            </b-row>
            <b-row class="text-center" v-else>
               <b-col cols="12">
                  <p>Não foi possível buscar os dados meteorológicos</p>
               </b-col>
            </b-row>
         </b-overlay>
      </div>
   </div>
</template>

<script>
import axios from 'axios'
import client from '@/api'
import { mapState, mapActions } from 'vuex'

export default {
   name: 'EstacaoAutomaticaDados',
   props: {
      tempoAtualizacao: Number
   },
   data() {
      return {
         clima: {},
         isBusy: false,
         latitude: null,
         longitude: null,
         isWideScreen: window.innerWidth > 999,
         buscandoLocal: false,
         buscandoEstacao: false,
         estacao: null,
         buscandoResumo: false,
         dadosEstacao: null,
         intervalId: null,
         estacaoAux: false
      }
   },
   computed: {
      ...mapState('unidade', ['unidade']),
      temEstacao() {
         return this.estacao && !this.buscandoEstacao
      }
   },
   created() {
      window.addEventListener('resize', this.handleResize)
      this.buscarLocal()
   },
   destroyed() {
      window.removeEventListener('resize', this.handleResize)
   },
   methods: {
      ...mapActions('unidade', ['retrieveUnidade', 'saveUnidade']),
      handleResize() {
         this.isWideScreen = window.innerWidth > 999
      },
      handleWheelScroll(event) {
         const scrollContainer = this.$refs.scrollContainer
         scrollContainer.scrollLeft += event.deltaY
         event.stopPropagation()
      },
      formatarVento(value) {
         if (value > 337.5 && value <= 22.5) return 'N'
         if (value > 22.5 && value <= 67.5) return 'NE'
         if (value > 67.5 && value <= 112.5) return 'L'
         if (value > 112.5 && value <= 157.5) return 'SE'
         if (value > 157.5 && value <= 202.5) return 'S'
         if (value > 202.5 && value <= 247.5) return 'SO'
         if (value > 247.5 && value <= 292.5) return 'O'
         if (value > 292.5 && value <= 337.5) return 'NO'
         return value
      },
      tooltipVento(value) {
         const ventoDir = {
            N: 'Norte',
            NE: 'Nordeste',
            L: 'Leste',
            SE: 'Sudeste',
            S: 'Sul',
            SO: 'Sudoeste',
            O: 'Oeste',
            NO: 'Noroeste'
         }
         return ventoDir[value]
      },
      formatarVentoEstacao(value) {
         const ventoDir = {
            1: 'N',
            2: 'NE',
            3: 'L',
            4: 'SE',
            5: 'S',
            6: 'SO',
            7: 'O',
            8: 'NO'
         }
         return ventoDir[value]
      },
      tooltipVentoEstacao(value) {
         const ventoDir = {
            1: 'Norte',
            2: 'Nordeste',
            3: 'Leste',
            4: 'Sudeste',
            5: 'Sul',
            6: 'Sudoeste',
            7: 'Oeste',
            8: 'Noroeste'
         }
         return ventoDir[value]
      },
      formatarDataUnix(value) {
         if (!value) return
         return this.$moment.unix(value).format('DD/MM/YYYY HH:mm:ss')
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm').format('DD/MM/YYYY HH:mm')
      },
      formatarDataHora(value) {
         if (!value) return
         return this.$moment.unix(value).format('HH:mm')
      },
      descricaoClima(id) {
         if (!id) return
         id = id.toString()
         const clima = {
            2: 'Tempestade',
            3: 'Chuva',
            5: 'Chuva',
            6: 'Neve',
            7: 'Encoberto',
            8: 'Nuvens'
         }
         if (id === '800') {
            return 'Limpo'
         }
         let descricao = clima[id.charAt(0)]
         return descricao
      },
      iconeClima(icon) {
         if (!icon) return
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
         return icones[icon]
      },
      iconeClimaEstacao(id, icon) {
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
         if (this.dadosEstacao && this.dadosEstacao?.CHO == 1) {
            return 'chuvoso.svg'
         } else if (this.dadosEstacao && this.dadosEstacao?.CHO == 0 && id && (id.charAt(0) == '3' || id.charAt(0) == '5')) {
            return 'nublado.svg'
         } else {
            return icones[icon] || 'nublado.svg'
         }
      },
      descricaoClimaEstacao(id) {
         id = id.toString()
         let descricao = ''
         const clima = {
            2: 'Tempestade',
            3: 'Chuva',
            5: 'Chuva',
            6: 'Neve',
            7: 'Encoberto',
            8: 'Nuvens'
         }
         descricao = clima[id.charAt(0)]
         if (id == '800') {
            descricao = 'Limpo'
         }
         if (this.dadosEstacao && this.dadosEstacao?.CHO == 1) {
            return 'Chuva'
         } else if (this.dadosEstacao && this.dadosEstacao?.CHO == 0 && id && (id.charAt(0) == '3' || id.charAt(0) == '5')) {
            return 'Nuvens'
         } else {
            return descricao
         }
      },
      async buscarClima() {
         this.isBusy = true
         try {
            const dados = await axios.get('https://api.openweathermap.org/data/3.0/onecall', {
               params: {
                  lat: this.latitude,
                  lon: this.longitude,
                  appid: process.env.VUE_APP_OPENWEATHERMAP_API_KEY,
                  units: 'metric',
                  lang: 'pt_br',
                  exclude: 'minutely'
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
         this.isBusy = false
         this.enviarPrevisao()
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
      async buscarEstacao() {
         if (!this.unidade || this.unidade == '') {
            return
         }
         this.buscandoEstacao = true
         const dados = await client.get(`/resumo/buscarestacao/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar estação meteorológica. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoEstacao = false
         })
         this.buscandoEstacao = false
         if (dados.data && dados.data.estrutura_equipamentos.length) {
            this.estacao = dados.data.estrutura_equipamentos[0].id_equipamento
            this.estacaoAux = dados.data.estrutura_equipamentos[0]?.auxiliar
            this.buscarResumoEstacao()
            this.enviarEstacao()
         }
      },
      async buscarResumoEstacao() {
         if (!this.estacao || this.estacao == undefined) {
            return
         }
         this.buscandoResumo = true
         const dados = await client.get(`/resumo/estacao/${this.estacao}?auxiliar=${this.estacaoAux}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados da estação meteorológica. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoResumo = false
         })
         this.buscandoResumo = false
         if (dados.data) {
            this.dadosEstacao = dados.data
         }
      },
      enviarPrevisao() {
         this.$emit('informacaoPrevisao', this.clima)
      },
      enviarEstacao() {
         this.$emit('informacaoEstacao', this.estacaoAux)
      },
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarClima()
            this.buscarEstacao()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      },
      verificaIdEstacao() {
         if (this.$route.params.idUnidade) {
            this.saveUnidade(this.$route.params.idUnidade)
         }
      }
   },

   mounted() {
      window.scrollTo(0, 0)
      this.verificaIdEstacao()
      this.buscarEstacao()
   },

   watch: {
      tempoAtualizacao(newValue) {
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
.temperatura {
   font-size: 80px;
   color: black;
}

.borda {
   border-radius: 25px;
}

.texto {
   font-size: 17px;
   font-weight: 400;
   color: black;
}

.valor {
   font-size: 20px;
   font-weight: 500;
   color: black;
}

::-webkit-scrollbar {
   height: 8px;
   background: none;
}

::-webkit-scrollbar-thumb:horizontal {
   background: #a7a7a7;
   border-radius: 10px;
}
</style>