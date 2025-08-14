<template>
   <div class="white_shd full margin_bottom_30" ref="chartContainer">
      <div class="map_section padding_infor_info">
         <b-button class="pull-right" variant="light" v-if="!fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen" title="Tela cheia"></b-icon></b-button>
         <b-button class="pull-right" variant="light" v-if="fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen-exit" title="Tela normal"></b-icon></b-button>
         <b-tabs class="nav-customizado" v-model="tabAtiva">
            <b-tab @click="alterarTipoGrafico('temperatura')">
               <template #title>
                  <div><b-icon icon="thermometer-half"></b-icon><span>Temperatura</span></div>
               </template>
               <h1>Análise das temperaturas</h1>
               <hr class="m-1" />
               <silo-graficos ref="graficosRef" :tipoGrafico="tipoGrafico" :pendulo="pendulo"></silo-graficos>
            </b-tab>
            <b-tab @click="alterarTipoGrafico('aeracao')" v-if="!showAeracao" lazy>
               <template #title>
                  <div><b-icon icon="flower3" scale="1.5"></b-icon><span>Aeração</span></div>
               </template>
               <h1>Evolução da temperatura dos grãos vs aeração</h1>
               <hr class="m-1" />
               <silo-graficos ref="graficosRef" :tipoGrafico="tipoGrafico"></silo-graficos>
            </b-tab>
            <b-tab @click="alterarTipoGrafico('conservacao')">
               <template #title>
                  <div><b-icon icon="shield"></b-icon><span>Conservação</span></div>
               </template>
               <h1>Diagrama de conservação dos grãos</h1>
               <hr class="m-1" />
               <silo-graficos ref="graficosRef" :tipoGrafico="tipoGrafico"></silo-graficos>
            </b-tab>
            <b-tab @click="alterarTipoGrafico('inventario')">
               <template #title>
                  <div><b-icon icon="calendar3"></b-icon><span>Inventário</span></div>
               </template>
               <h1>Evolução da capacidade utilizada</h1>
               <hr class="m-1" />
               <silo-graficos ref="graficosRef" :tipoGrafico="tipoGrafico"></silo-graficos>
            </b-tab>
            <b-tab v-if="!showAeracao" lazy>
               <template #title><b-icon icon="wind"></b-icon><span>Ambiente</span></template>
               <h1>Diagrama de aeração de grãos</h1>
               <hr class="m-1" />
               <silo-aeracao ref="aeracaoRef"></silo-aeracao>
            </b-tab>
            <b-tab v-if="!showAeracao" lazy>
               <template #title>
                  <b-iconstack><b-icon stacked icon="droplet-fill" shift-h="5" shift-v="" scale="0.7"></b-icon><b-icon stacked icon="thermometer-high" scale="1.1"></b-icon></b-iconstack><span>Plenum</span>
               </template>
               <h1>Análise de temperatura e umidade do plenum</h1>
               <hr class="m-1" />
               <silo-plenum ref="plenumRef"></silo-plenum>
            </b-tab>
            <b-tab v-if="!showAeracao" lazy>
               <template #title><b-icon icon="gear"></b-icon><span>Parâmetros</span></template>
               <h1>Configurações dos programas de aeração</h1>
               <hr class="m-1" />
               <silo-parametros ref="parametrosRef"></silo-parametros>
            </b-tab>
            <b-tab lazy>
               <template #title> <b-icon icon="clock"></b-icon><span>Eventos</span></template>
               <silo-eventos></silo-eventos>
            </b-tab>
            <b-tab lazy v-if="!showAeracao && !isMobile">
               <template #title> <b-icon icon="file-earmark-bar-graph"></b-icon><span>Relatório</span></template>
               <silo-relatorio></silo-relatorio>
            </b-tab>
         </b-tabs>
      </div>
   </div>
</template>

<script>
import SiloGraficos from '../components/SiloGraficos.vue'
import SiloAeracao from '../components/SiloAeracao.vue'
import SiloParametros from '../components/SiloParametros.vue'
import SiloPlenum from '../components/SiloPlenum.vue'
import SiloEventos from '../components/SiloEventos.vue'
import SiloRelatorio from '../components/SiloRelatorio.vue'

export default {
   name: 'SiloAbas',
   props: {
      showAeracao: Boolean
   },
   components: {
      SiloGraficos,
      SiloAeracao,
      SiloParametros,
      SiloPlenum,
      SiloEventos,
      SiloRelatorio
   },
   data() {
      return {
         tabPendulos: false,
         tabAtiva: 0,
         tipoGrafico: '',
         data: '-',
         fullscreen: false,
         pendulo: null,
         isMobile: false
      }
   },

   methods: {
      alterarTipoGrafico(tipoGrafico) {
         this.tipoGrafico = tipoGrafico
      },
      dataDados(data) {
         this.data = data
      },
      enviarPendulo(pendulo) {
         this.pendulo = pendulo
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
      this.alterarTipoGrafico('temperatura')
   }
}
</script>

<style scoped>
@media (max-width: 500px) {
   h1 {
      font-size: 16px;
   }
}
</style>
<style>
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