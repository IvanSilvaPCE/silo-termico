<template>
   <div class="col-md-12">
      <div @click="detalheClima()" class="white_shd full margin_bottom_30 mouse" :style="{ opacity: equipamento.st_operacao == 'OF' ? '0.5' : '' }">
         <div class="full graph_head">
            <div class="heading1 margin_0">
               <b-row>
                  <b-col sm="12" class="text-center text-md-left">
                     <h2 v-if="!temEstacao && !buscandoEstacao">Dados do clima obtidos de satélite</h2>
                     <h2 v-else>Últimos dados recebidos da estação</h2>
                  </b-col>
               </b-row>
               <b-row>
                  <b-col sm="12" md="7" class="text-center text-md-left">
                     <small v-if="!temEstacao">Data enviado: {{ formatarDataUnix(clima?.current?.dt) || '-' }}</small>
                     <small v-else>Última atualização: {{ formatarData(dadosEstacao?.DAT) || '-' }}</small>
                  </b-col>
                  <b-col sm="12" md="5" class="text-center text-md-right">
                     <small>clique para ver mais informações</small>
                  </b-col>
               </b-row>
            </div>
         </div>
         <div class="map_section padding_infor_info">
            <div class="map m_style1">
               <b-overlay :show="isBusy || buscandoLocal || buscandoEstacao || buscandoResumo" rounded="sm" class="overlay">
                  <b-row class="justify-content-center d-flex align-items-center mx-auto flex-wrap text-center" style="" v-if="clima || dadosEstacao">
                     <b-col cols="6" sm="2" md="2" class=" ">
                        <div>
                           <img v-if="!temEstacao" :src="require('@/assets/images/clima/' + iconeClima(clima?.current?.weather[0]?.icon))" width="70" v-b-tooltip.hover :title="descricaoClima(clima?.current?.weather[0]?.id)" />
                           <img v-else :src="require('@/assets/images/clima/' + iconeClimaEstacao(clima?.current?.weather[0]?.id, clima?.current?.weather[0]?.icon))" width="70" v-b-tooltip.hover :title="descricaoClimaEstacao(clima?.current?.weather[0]?.id)" />
                        </div>
                        <div style="margin-top: -15px">
                           <p v-if="!temEstacao" class="temperatura">{{ Math.round(clima?.current?.temp) }}°</p>
                           <p v-else class="temperatura">{{ !desatualizado ? (typeof dadosEstacao?.TEM === 'number' ? Math.round(dadosEstacao.TEM) : '-') : '-' }}°</p>
                        </div>
                     </b-col>

                     <b-col cols="6" sm="2" md="2" class="">
                        <img src="@/assets/images/clima/umidade.png" width="30" v-b-tooltip.hover title="Umidade" />
                        <h1 v-if="!temEstacao">{{ clima?.current?.humidity }} %</h1>
                        <h1 v-else>{{ !desatualizado ? dadosEstacao?.UMI : '-' }} %</h1>
                     </b-col>
                     <b-col cols="6" sm="2" md="2" class="" v-if="!estacaoAux">
                        <img src="@/assets/images/clima/pressao.png" width="30" v-b-tooltip.hover title="Pressão atmosférica" />
                        <h1 v-if="!temEstacao">{{ clima?.current?.pressure }} hPa</h1>
                        <h1 v-else>{{ !desatualizado ? dadosEstacao?.PRE : '-' }} hPa</h1>
                     </b-col>
                     <b-col cols="6" sm="3" md="2" class="mt-2" v-if="!estacaoAux">
                        <img src="@/assets/images/clima/pluviometro.png" height="30" v-b-tooltip.hover :title="!temEstacao ? 'Pluviômetro última hora' : 'Pluviômetro dia'" />
                        <h1 v-if="!temEstacao">{{ clima?.current?.rain?.['1h'] ?? 0 }} mm</h1>
                        <h1 v-else>{{ !desatualizado ? dadosEstacao?.PLU1D : '-' }} mm</h1>
                     </b-col>
                     <b-col cols="6" sm="2" md="2" class="mt-2" v-if="!estacaoAux">
                        <img src="@/assets/images/clima/vento.png" height="30" v-b-tooltip.hover title="Vento" />
                        <h1 v-if="!temEstacao">{{ clima?.current?.wind_speed }} km/h</h1>
                        <h1 v-else>{{ !desatualizado ? dadosEstacao?.VEL : '-' }} km/h</h1>
                     </b-col>
                  </b-row>
                  <b-row class="text-center" v-else>
                     <b-col cols="12" class="align-items-center">
                        <p>Não foi possível buscar os dados meteorológicos</p>
                     </b-col>
                  </b-row>
               </b-overlay>
            </div>
         </div>
      </div>
   </div>
</template>


<script>
import axios from 'axios'
import client from '@/api'
import { mapState, mapActions } from 'vuex'

export default {
   name: 'ResumoEstacao',
   data() {
      return {
         icone: 'chuvoso.svg',
         clima: null,
         isBusy: false,
         latitude: null,
         longitude: null,
         buscandoLocal: false,
         buscandoEstacao: false,
         estacao: null,
         buscandoResumo: false,
         dadosEstacao: null,
         estacaoAux: null,
         equipamento: {},
         desatualizado: false
      }
   },

   computed: {
      ...mapState('unidade', ['unidade']),
      temEstacao() {
         return this.estacao && !this.buscandoEstacao
      }
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade']),
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
      formatarDataUnix(value) {
         if (!value) return
         return this.$moment.unix(value).format('DD/MM/YYYY HH:mm:ss')
      },
      formatarData(value) {
         if (!value) return null
         const data = this.$moment(value, 'YYYY/MM/DD HH:mm:ss')
         const agora = this.$moment()
         const diasPassados = agora.diff(data, 'days')

         if (diasPassados >= 1) {
            this.desatualizado = true
            return `${diasPassados} dia${diasPassados > 1 ? 's' : ''}`
         } else {
            return data.format('DD/MM/YYYY HH:mm:ss')
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
                  exclude: 'hourly,daily,minutely,alerts'
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
      },
      async buscarLocal() {
         if (!this.unidade || this.unidade == '') {
            return
         }
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
         if (dados.data && dados.data.local_estrutura) {
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
            this.buscarEquipamento()
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
      detalheClima() {
         this.$router.push({ name: 'estacao' })
      },
      async buscarEquipamento() {
         if (!this.estacao || this.estacao == undefined) {
            return
         }
         const dados = await client.get(`/equipamento/${this.estacao}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar estação meteorológica. ${err}`, {
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
      }
   },

   mounted() {
      this.retrieveUnidade()
      this.buscarLocal()
      this.buscarEstacao()
   },

   watch: {
      unidade(newValue) {
         if (newValue) {
            this.buscarLocal()
         }
      },
      latitude(newValue) {
         if (newValue && !this.dadosEstacao && !this.buscandoResumo) {
            this.buscarClima()
         }
      }
   }
}
</script>

<style scoped>
.temperatura {
   font-size: 20px;
   font-weight: 400;
   color: black;
}

h1 {
   font-size: 18px;
}

h4 {
   font-size: 18px;
}

@media (max-width: 576px) {
   h1 {
      font-size: 15px;
   }

   h4 {
      font-size: 15px;
   }
}

@media (max-width: 700px) {
   h1 {
      font-size: 15px;
   }

   h4 {
      font-size: 15px;
   }
}

.overlay {
   z-index: 0;
   min-height: 100px;
}

.mouse {
   cursor: pointer;
}
</style>