<template>
   <div class="white_shd full margin_bottom_30" ref="chartContainer">
      <div class="full graph_head">
         <div class="heading1 margin_0">
            <b-row>
               <b-col cols="9">
                  <h2 class="">Dados recebidos</h2>
                  <small>Data: {{ this.data }}</small>
               </b-col>
               <b-col cols="3" class="text-right">
                  <b-button variant="light" v-if="!fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen" title="Tela cheia"></b-icon></b-button>
                  <b-button variant="light" v-if="fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen-exit" title="Tela normal"></b-icon></b-button>
               </b-col>
            </b-row>
         </div>
      </div>
      <div class="map_section padding_infor_info">
         <b-tabs content-class="mt-3" fill v-model="tabAtiva">
            <b-tab title="Horímetro" v-if="tipoGrafico == 'horimetro'" lazy>
               <limpeza-horimetro></limpeza-horimetro>
            </b-tab>
            <b-tab title="Manutenção" v-if="tipoGrafico == 'manutencao'" lazy>
               <limpeza-manutencao @recebeData="dataDados"></limpeza-manutencao>
            </b-tab>
            <b-tab title="Vibração Diária" v-if="tipoGrafico == 'analise'" lazy>
               <limpeza-vibracao-diaria></limpeza-vibracao-diaria>
            </b-tab>
            <b-tab title="Vibração Média" v-if="tipoGrafico == 'analise'" lazy>
               <limpeza-vibracao-media></limpeza-vibracao-media>
            </b-tab>
            <b-tab title="Pressão Diária" v-if="tipoGrafico == 'analise'" lazy>
               <limpeza-pressao-diaria></limpeza-pressao-diaria>
            </b-tab>
            <b-tab title="Pressão Média" v-if="tipoGrafico == 'analise'" lazy>
               <limpeza-pressao-media></limpeza-pressao-media>
            </b-tab>
            <b-tab title="Comparar" v-if="tipoGrafico == 'analise'" lazy>
               <limpeza-compara></limpeza-compara>
            </b-tab>
         </b-tabs>
      </div>
      <div :class="['btn-group-fab', { active }]">
         <div>
            <b-button class="btn btn-main" variant="primary" @click.stop="toggleMenu()"> <i class="fa fa-bars"></i> </b-button>
            <b-button class="btn btn-sub" variant="primary" @click="toggleMenu(), alterarGrafico('analise')" :style="{ opacity: active ? 1 : 0 }"> Análise </b-button>
            <b-button class="btn btn-sub" variant="primary" @click="toggleMenu(), alterarGrafico('manutencao')" :style="{ opacity: active ? 1 : 0 }"> Manutenção </b-button>
            <b-button class="btn btn-sub" variant="primary" @click="toggleMenu(), alterarGrafico('horimetro')" :style="{ opacity: active ? 1 : 0 }"> Horímetro </b-button>
         </div>
      </div>
   </div>
</template>

<script>
import LimpezaHorimetro from '../components/LimpezaHorimetro.vue'
import LimpezaManutencao from '../components/LimpezaManutencao.vue'
import LimpezaVibracaoDiaria from './LimpezaVibracaoDiaria.vue'
import LimpezaVibracaoMedia from './LimpezaVibracaoMedia.vue'
import LimpezaPressaoDiaria from './LimpezaPressaoDiaria.vue'
import LimpezaPressaoMedia from './LimpezaPressaoMedia.vue'
import LimpezaCompara from './LimpezaCompara.vue'

export default {
   components: {
      LimpezaHorimetro,
      LimpezaManutencao,
      LimpezaVibracaoDiaria,
      LimpezaVibracaoMedia,
      LimpezaPressaoDiaria,
      LimpezaPressaoMedia,
      LimpezaCompara
   },
   name: 'LimpezaAbas',
   comments: {
      LimpezaHorimetro,
      LimpezaManutencao,
      LimpezaVibracaoDiaria
   },
   data() {
      return {
         tabAtiva: 0,
         active: false,
         tipoGrafico: 'horimetro',
         data: '-',
         fullscreen: false
      }
   },

   methods: {
      alterarGrafico(grafico) {
         this.tabAtiva = 0
         this.tipoGrafico = grafico
      },
      toggleMenu() {
         this.active = !this.active
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
      dataDados(data) {
         this.data = data
      },
   }
}
</script>

<style scoped>
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
.btn-group-fab.active .btn-sub:nth-child(4) {
   bottom: 160px;
}
</style>