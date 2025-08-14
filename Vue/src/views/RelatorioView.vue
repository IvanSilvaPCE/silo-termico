<template>
   <div>
      <b-row>
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30 mouse" @click="modalMediaUsuarios()" v-b-tooltip.hover title="Tempo médio de sessão dos usuários">
               <b-overlay :show="buscandoMediaAcessos" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <p class="head_couter"><span style="font-size: 30px">&approx;</span> Acessos</p>
                     <p class="total_no">{{ mediaAcessos?.tempo_medio || '-' }} min</p>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30" v-b-tooltip.hover title="Tempo médio total de acesso dos usuários">
               <b-overlay :show="buscandoMediaAcessos" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <p class="head_couter"><span style="font-size: 30px">&approx;</span> Acessos total</p>
                     <p class="total_no">{{ mediaAcessos?.tempo_total || '-' }} h</p>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30" v-b-tooltip.hover title="Percentual de usuários que acessaram">
               <b-overlay :show="buscandoPercentualUsuarios" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <p class="head_couter">% Usuários</p>
                     <p class="total_no">{{ percentualUsuarios || '-' }}%</p>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30 mouse" @click="modalMediaEquipamentos()" v-b-tooltip.hover title="Tempo médio de disponibilidade dos equipamentos">
               <b-overlay :show="buscandoMediaEquipamentos" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <p class="head_couter"><span style="font-size: 30px">&approx;</span> Equipamentos</p>
                     <p class="total_no">{{ mediaEquipamentos.tempo_medio || '-' }}</p>
                  </div>
               </b-overlay>
            </div>
         </b-col>
         <b-col lg="2">
            <div class="full counter_section margin_bottom_30 margin_top_30" v-b-tooltip.hover title="Percentual de equipamentos que estiveram disponível">
               <b-overlay :show="buscandoPercentualEquipamentos" rounded="sm" class="w-100">
                  <div class="counter_no">
                     <p class="head_couter">% Equipamentos</p>
                     <p class="total_no">{{ percentualEquipamentos }} %</p>
                  </div>
               </b-overlay>
            </div>
         </b-col>
      </b-row>
      <div :class="['btn-group-fab', { active }]">
         <div>
            <b-button class="btn btn-main" variant="primary" @click.stop="toggleMenu()"> <i class="fa fa-bars"></i> </b-button>
            <b-button class="btn btn-sub" variant="primary" id="popover" @click="showPopover = !showPopover" :style="{ opacity: active ? 1 : 0 }"> Período </b-button>
         </div>
      </div>
      <b-popover :show="showPopover" target="popover" triggers="focus">
         <b-row>
            <b-col class="m-1">
               <b-overlay :show="buscandoDatas" rounded="sm" class="w-100">
                  <b-form-select v-model="data" @input="acionarBusca()" :options="datas" size="sm"></b-form-select>
               </b-overlay>
            </b-col>
         </b-row>
      </b-popover>
      <modal-usuario-relatorio :data="this.data"></modal-usuario-relatorio>
      <modal-equipamento-relatorio :data="this.data"></modal-equipamento-relatorio>
   </div>
</template>

<script>
import client from '@/api'
import ModalUsuarioRelatorio from '../components/ModalUsuarioRelatorio.vue'
import ModalEquipamentoRelatorio from '../components/ModalEquipamentoRelatorio.vue'

export default {
   name: 'RelatorioView',
   components: {
      ModalUsuarioRelatorio,
      ModalEquipamentoRelatorio
   },
   data() {
      return {
         active: false,
         showPopover: false,
         data: this.$moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
         buscandoDatas: false,
         buscandoMediaAcessos: false,
         buscandoPercentualUsuarios: false,
         buscandoMediaEquipamentos: false,
         buscandoPercentualEquipamentos: false,
         datas: [],
         mediaAcessos: {},
         mediaEquipamentos: {},
         percentualUsuarios: null,
         percentualEquipamentos: null
      }
   },

   methods: {
      toggleMenu() {
         this.active = !this.active
      },
      async buscarDatas() {
         this.buscandoDatas = true
         const dados = await client.get('/relatorio/datas').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar datas. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoDatas = false
         })
         this.buscandoDatas = false
         this.datas = dados.data
      },
      async buscarMediaAcessos() {
         this.buscandoMediaAcessos = true
         const dados = await client.get(`/relatorio/mediaacessos?data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tempo médio de acessos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoMediaAcessos = false
         })
         this.buscandoMediaAcessos = false
         this.mediaAcessos = dados.data
      },
      async buscarPercentualUsuarios() {
         this.buscandoPercentualUsuarios = true
         const dados = await client.get(`/relatorio/percentualusuario?data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar percentual de usuários. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoPercentualUsuarios = false
         })
         this.buscandoPercentualUsuarios = false
         this.percentualUsuarios = dados.data
      },
      async buscarMediaEquipamentos() {
         this.buscandoMediaEquipamentos = true
         const dados = await client.get(`/relatorio/mediaequipamentos?data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar tempo médio dos equipamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoMediaEquipamentos = false
         })
         this.buscandoMediaEquipamentos = false
         this.mediaEquipamentos = dados.data
      },
      async buscarPercentualEquipamentos() {
         this.buscandoPercentualEquipamentos = true
         const dados = await client.get(`/relatorio/percentualequipamentos?data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar percentual de usuários. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoPercentualEquipamentos = false
         })
         this.buscandoPercentualEquipamentos = false
         this.percentualEquipamentos = dados.data
      },
      modalMediaUsuarios() {
         this.$bvModal.show('modal-media-usuarios')
      },
      modalMediaEquipamentos() {
         this.$bvModal.show('modal-media-equipamentos')
      },
      acionarBusca() {
         this.buscarMediaAcessos()
         this.buscarPercentualUsuarios()
         this.buscarMediaEquipamentos()
         this.buscarPercentualEquipamentos()
         this.showPopover = false
         this.active = false
      }
   },

   mounted() {
      this.buscarDatas()
      this.buscarMediaAcessos()
      this.buscarPercentualUsuarios()
      this.buscarMediaEquipamentos()
      this.buscarPercentualEquipamentos()
   }
}
</script>

<style scoped>
.mouse {
   cursor: pointer;
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
</style>