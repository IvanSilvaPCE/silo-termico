<template>
   <div class="white_shd full margin_bottom_30" ref="chartContainer">
      <div class="map_section padding_infor_info">
         <b-button class="pull-right" variant="light" size="sm" v-if="!fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen" title="Tela cheia"></b-icon></b-button>
         <b-button class="pull-right" variant="light" size="sm" v-if="fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen-exit" title="Tela normal"></b-icon></b-button>
         <b-tabs class="nav-customizado" v-model="tabAtiva" v-on:activate-tab="tabActivated">
            <b-tab active>
               <template #title>
                  <div @click="alterarGrafico('temperatura')"><b-icon icon="thermometer-half"></b-icon><span>Temperatura</span></div>
               </template>
               <h1>Análise das temperaturas</h1>
               <hr class="m-1" />
               <armazem-graficos ref="graficosRef" :tipoGrafico="tipoGrafico" :celula="celula" :dadosArco="dadosFormatado"></armazem-graficos>
            </b-tab>
            <b-tab>
               <template #title>
                  <div @click="alterarGrafico('aeracao')"><b-icon icon="flower3" scale="1.5"></b-icon><span>Aeração</span></div>
               </template>
               <h1>Evolução da temperatura dos grãos vs aeração</h1>
               <hr class="m-1" />
               <armazem-graficos ref="graficosRef" :tipoGrafico="tipoGrafico" :celula="celula" :dadosArco="dadosFormatado"></armazem-graficos>
            </b-tab>
            <b-tab>
               <template #title>
                  <div @click="alterarGrafico('conservacao')"><b-icon icon="shield"></b-icon><span>Conservação</span></div>
               </template>
               <h1>Diagrama de conservação dos grãos</h1>
               <hr class="m-1" />
               <armazem-graficos ref="graficosRef" :tipoGrafico="tipoGrafico" :celula="celula" :dadosArco="dadosFormatado"></armazem-graficos>
            </b-tab>
            <b-tab>
               <template #title>
                  <div @click="alterarGrafico('inventario')"><b-icon icon="calendar3"></b-icon><span>Inventário</span></div>
               </template>
               <h1>Evolução da capacidade utilizada</h1>
               <hr class="m-1" />
               <armazem-graficos ref="graficosRef" :tipoGrafico="tipoGrafico" :celula="celula" :dadosArco="dadosFormatado"></armazem-graficos>
            </b-tab>
            <b-tab>
               <template #title><b-icon icon="wind"></b-icon><span>Ambiente</span></template>
               <h1>Diagrama de aeração de grãos</h1>
               <hr class="m-1" />
               <armazem-aeracao ref="janelaRef"></armazem-aeracao>
            </b-tab>
            <b-tab>
               <template #title>
                  <b-iconstack><b-icon stacked icon="droplet-fill" shift-h="5" shift-v="" scale="0.7"></b-icon><b-icon stacked icon="thermometer-high" scale="1.1"></b-icon></b-iconstack><span>Plenum</span>
               </template>
               <h1>Análise de temperatura e umidade do plenum</h1>
               <hr class="m-1" />
               <armazem-plenum ref="plenumRef"></armazem-plenum>
            </b-tab>
            <b-tab>
               <template #title><b-icon icon="gear"></b-icon><span>Parâmetros</span></template>
               <h1>Configurações dos programas de aeração</h1>
               <hr class="m-1" />
               <armazem-parametros ref="parametrosRef"></armazem-parametros>
            </b-tab>
            <b-tab lazy>
               <template #title> <b-icon icon="clock"></b-icon><span>Eventos</span></template>
               <armazem-eventos></armazem-eventos>
            </b-tab>
            <b-tab lazy v-if="!isMobile">
               <template #title> <b-icon icon="file-earmark-bar-graph"></b-icon><span>Relatório</span></template>
               <armazem-relatorio></armazem-relatorio>
            </b-tab>
         </b-tabs>
      </div>
   </div>
</template>

<script>
import ArmazemGraficos from '../components/ArmazemGraficos.vue'
import ArmazemAeracao from '../components/ArmazemAeracao.vue'
import ArmazemParametros from '../components/ArmazemParametros.vue'
import ArmazemPlenum from '../components/ArmazemPlenum.vue'
import ArmazemEventos from '../components/ArmazemEventos.vue'
import ArmazemRelatorio from '../components/ArmazemRelatorio.vue'
import client from '@/api'
import axios from 'axios'
import { mapState, mapActions } from 'vuex'

export default {
   name: 'ArmazemAbas',
   components: {
      ArmazemGraficos,
      ArmazemAeracao,
      ArmazemParametros,
      ArmazemPlenum,
      ArmazemEventos,
      ArmazemRelatorio
   },
   data() {
      return {
         tabAtiva: 0,
         abaAnterior: 0,
         active: false,
         showPopover: false,
         tipoGrafico: 'temperatura',
         dadosEstacao: {},
         clima: {},
         buscandoClima: false,
         dadosArco: {},
         fullscreen: false,
         isWideScreen: window.innerWidth > 999,
         celula: 1,
         dadosFormatado: {},
         selectedTab: null,
         isMobile: false
      }
   },

   computed: {
      ...mapState('unidade', ['unidade'])
   },

   methods: {
      tabActivated(newTabIndex, oldTabIndex, event) {
         if (newTabIndex == oldTabIndex) {
            event.preventDefault()
         }
      },

      ...mapActions('unidade', ['retrieveUnidade']),
      toggleMenu() {
         this.active = !this.active
      },
      alterarGrafico(grafico) {
         this.tipoGrafico = grafico
      },
      tituloAba(tipoGrafico) {
         const titulo = {
            temperatura: 'Temperatura',
            conservacao: 'Conservação',
            inventario: 'Inventário',
            aeracao: 'Aeração'
         }
         return titulo[tipoGrafico] || 'Gráfico'
      },
      handleResize() {
         this.isWideScreen = window.innerWidth > 999
      },
      recebeDadosEstacao(dadosEstacao) {
         this.dadosEstacao = dadosEstacao
      },
      recebeCelula(celula) {
         this.celula = celula
         this.$refs.janelaRef.recebeCelula(celula)
         this.$refs.parametrosRef.recebeCelula(celula)
         this.$refs.plenumRef.recebeCelula(celula)
      },
      recebeDadosArco(dadosArco) {
         this.dadosFormatado = {}
         Object.keys(dadosArco).forEach((key1) => {
            Object.keys(dadosArco[key1]).forEach((key2) => {
               this.dadosFormatado[key2] = dadosArco[key1][key2]
            })
         })
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
      }
   },

   mounted() {
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      this.alterarGrafico('temperatura')
      this.buscarLocal()
      window.scrollTo({ top: 0, behavior: 'smooth' })
   }
}
</script>

<style scoped>
.umidade {
   font-size: 20px;
   font-weight: 300;
   color: black;
}

.temperatura {
   font-size: 30px;
   color: black;
}

@media (max-width: 500px) {
   h1 {
      font-size: 16px;
   }
}
</style>
<style>
/* tabs */
.nav-customizado a:hover,
.nav-customizado a:focus {
   outline: none;
   text-decoration: none;
}
.nav-customizado .nav-tabs {
   padding-left: 15px;
   border-bottom: 4px solid #1988ff;
}
.nav-customizado .nav-tabs .nav-item .nav-link {
   color: #fff;
   padding: 10px 20px;
   margin-right: 15px;
   background: #1988ff;
   border: none;
   border-radius: 0;
   opacity: 0.5;
   position: relative;
   transition: all 0.3s ease 0s;
}
.nav-customizado .nav-tabs .nav-item .nav-link:hover {
   background: #1988ff;
   opacity: 0.8;
}
.nav-customizado .nav-tabs .nav-item .nav-link.active {
   opacity: 1;
}
.nav-customizado .nav-tabs .nav-item .nav-link:before,
.nav-customizado .nav-tabs .nav-item .nav-link:after {
   content: '';
   border-top: 42px solid transparent;
   position: absolute;
   top: -1px;
}
.nav-customizado .nav-tabs .nav-item .nav-link:before {
   border-right: 15px solid #1988ff;
   left: -14px;
}
.nav-customizado .nav-tabs .nav-item .nav-link:after {
   border-left: 15px solid #1988ff;
   right: -14px;
}
.nav-customizado .nav-tabs .nav-item .nav-link i,
.nav-customizado .nav-tabs .nav-item .nav-link.active i {
   display: inline-block;
   padding-right: 5px;
   font-size: 14px;
   text-shadow: none;
}
.nav-customizado .nav-tabs .nav-item .nav-link span {
   display: inline-block;
   font-size: 14px;
   letter-spacing: -9px;
   opacity: 0;
   transition: all 0.3s ease 0s;
}
.nav-customizado .nav-tabs .nav-item .nav-link:hover span,
.nav-customizado .nav-tabs .nav-item .nav-link.active span {
   letter-spacing: 1px;
   opacity: 1;
   transition: all 0.3s ease 0s;
   margin-left: 4px;
}
@media only screen and (max-width: 500px) {
   .nav-customizado .nav-tabs .nav-item .nav-link {
      padding: 5px 10px;
   }
   .nav-customizado .nav-tabs .nav-item .nav-link:before,
   .nav-customizado .nav-tabs .nav-item .nav-link:after {
      border-top: 32px solid transparent;
   }
   .nav-customizado .nav-tabs .nav-item .nav-link:before {
      border-right: 15px solid #1988ff;
      left: -14px;
   }
   .nav-customizado .nav-tabs .nav-item .nav-link:after {
      border-left: 15px solid #1988ff;
      right: -14px;
   }
   .nav-customizado .nav-tabs .nav-item .nav-link span {
      display: inline-block;
      font-size: 13px;
      letter-spacing: -9px;
      opacity: 0;
      transition: all 0.3s ease 0s;
   }
   .nav-customizado .nav-tabs .nav-item .nav-link:hover span,
   .nav-customizado .nav-tabs .nav-item .nav-link.active span {
      letter-spacing: -9px;
      opacity: 0;
      transition: all 0.3s ease 0s;
      margin-left: 0px;
   }
}
</style>