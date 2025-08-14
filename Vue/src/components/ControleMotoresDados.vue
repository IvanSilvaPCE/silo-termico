<template>
   <div class="white_shd full margin_bottom_30" ref="svgContainer">
      <div class="full graph_head">
         <div class="heading1 margin_0">
            <b-overlay :show="buscandoDados" rounded="sm" class="overlay">
               <b-row class="align-items-center">
                  <b-col cols="8">
                     <h2>{{ equipamento.ds_equipamento }}</h2>
                     <small class="mb-0">Data: {{ formatarDataHora(this.dadosControle?.DAT) || '-' }}</small>
                  </b-col>
                  <b-col cols="4" class="text-right">
                     <b-button variant="light" v-if="!fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen" title="Tela cheia"></b-icon></b-button>
                     <b-button variant="light" v-if="fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen-exit" title="Tela normal"></b-icon></b-button>
                  </b-col>
               </b-row>
            </b-overlay>
         </div>
      </div>
      <div class="map_section padding_infor_info">
         <b-overlay :show="buscandoDados" rounded="sm" class="overlay">
            <template #overlay>
               <b-icon></b-icon>
            </template>
            <b-row class="justify-content-center d-flex overflow-auto">
               <b-col>
                  <b-list-group class="mb-2" horizontal>
                     <b-list-group-item class="d-flex justify-content-between align-items-center cursor">
                        <b-badge variant="primary" class="valor mr-1">Modo</b-badge>
                        <small class="valor">{{ formatarOperacao(dadosControle?.MOP) }}</small>
                     </b-list-group-item>
                     <b-list-group-item class="d-flex justify-content-between align-items-center cursor">
                        <b-badge :variant="corVariant(equipamento.st_operacao)" class="valor mr-1">Status</b-badge>
                        <small class="valor" :class="corTexto(equipamento.st_operacao)">{{ formatarStatus(equipamento.st_operacao) }}</small>
                     </b-list-group-item>
                  </b-list-group>
               </b-col>
            </b-row>
         </b-overlay>
         <svg-innovate :dadosControle="dadosControle" :buscandoDados="buscandoDados"></svg-innovate>
      </div>
   </div>
</template>

<script>
import client from '@/api'
import SvgInnovate from '../components/SvgInnovate.vue'

export default {
   name: 'ControleMotoresDados',
   props: {
      tempoAtualizacao: Number
   },
   components: {
      SvgInnovate
   },
   data() {
      return {
         buscandoDados: false,
         dadosControle: {},
         buscandoEquipamento: false,
         equipamento: {},
         fullscreen: false,
         intervalId: null
      }
   },

   methods: {
      async buscarDados() {
         if (!this.idControle) {
            return
         }
         this.buscandoDados = true
         const dados = await client.get(`/controle/buscardado/${this.idControle}`).catch((err) => {
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
            this.dadosControle = dados.data
         }
      },
      async buscarEquipamento() {
         if (!this.idControle) {
            return
         }
         this.buscandoEquipamento = true
         const dados = await client.get(`/equipamento/${this.idControle}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamento. ${err}`, {
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
      formatarDataHora(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')
      },
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarDados()
            this.buscarEquipamento()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
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
      formatarOperacao(value) {
         const operacao = {
            0: 'Manual',
            1: 'Automático'
         }
         return operacao[value]
      },
      toggleFullScreen() {
         const elem = this.$refs.svgContainer
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
      const idControleLocalStorage = localStorage.getItem('con')
      if (idControleLocalStorage && idControleLocalStorage != 'undefined') {
         this.idControle = idControleLocalStorage
      } else {
         this.idControle = this.$route.params.idControle
         localStorage.setItem('con', this.idControle)
      }
      this.buscarDados()
      this.buscarEquipamento()
      window.scrollTo(0, 0)
   },

   watch: {
      tempoAtualizacao(newValue) {
         if (newValue) {
            this.startInterval(newValue)
         } else {
            this.stopInterval()
         }
      }
   }
}
</script>

<style scoped>
.valor {
   font-size: 16px;
   font-weight: 400;
}

.overlay {
   z-index: 0;
}
</style>